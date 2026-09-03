'use strict';

// Yani resolver: turns a player page that only works inside its own signed
// iframe into a plain HLS URL any media player can open.
//
// A browser page holds the live Alloha session (see alloha-session.js) and this
// process proxies the manifest and segments on its behalf, attaching the
// rotating headers the CDN demands. Those headers are exactly what a browser
// cannot attach itself - a cross-origin manifest request carrying them triggers
// a CORS preflight the CDN never answers - which is why the Lampa plugin needs
// this service instead of doing the work in place.

const crypto = require('crypto');
const http = require('http');
const {Readable} = require('stream');
const {URL} = require('url');
const {AllohaSession, SourceUnavailableError} = require('./alloha-session');

const VERSION = '1.0.0';
const PORT = Number(process.env.YANI_RESOLVER_PORT || 8790);
const HOST = process.env.YANI_RESOLVER_HOST || '0.0.0.0';
const IDLE_TIMEOUT_MS = Number(process.env.YANI_RESOLVER_IDLE_MS || 5 * 60 * 1000);
const HEADLESS = process.env.YANI_RESOLVER_HEADLESS !== 'false';
const VERBOSE = process.env.YANI_RESOLVER_VERBOSE === 'true';

// Experimental: hand out the CDN links as they are, with the one static header
// the CDN asks for, instead of proxying every byte. Measured against a live
// title: the bnsi links answer 403 without `Origin: https://alloha.yani.tv`
// and 200 with it - no rotating token, no live session, nothing to keep warm.
// A player that can send headers therefore needs nothing from this service
// beyond the links themselves, which is most of the proxy's reason to exist.
// The proxy stays in place and stays the default until this is proven on real
// devices: the internal Android player is a <video> in a WebView and cannot
// send that header, so it still needs the proxy.
const DIRECT_LINKS = process.env.YANI_RESOLVER_DIRECT === 'true';
const ALLOHA_ORIGIN = 'https://alloha.yani.tv';

const REFRESH_WAIT_MS = Number(process.env.YANI_RESOLVER_REFRESH_WAIT_MS || 12000);
const HOP_BY_HOP =['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'te', 'trailer', 'host', 'content-length'];

const sessions = new Map();
let browserPromise = null;

function log(message) {
    console.log(`[yani-resolver] ${message}`);
}

function debug(message) {
    if (VERBOSE) log(message);
}

function isAllohaUrl(value) {
    return /(^|\/\/)(?:www\.)?alloha(?:\.[a-z0-9-]+)+(?::\d+)?(?:[/:]|$)/i.test(String(value || ''));
}

function encodeTarget(value) {
    return Buffer.from(String(value), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeTarget(value) {
    return Buffer.from(String(value || '').replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

// Segment URLs name their upstream target in the query string. Without a
// signature this service would forward any URL anyone asked it to, which on a
// process listening beyond loopback is an open proxy. The secret lives and dies
// with the process: links from an older run simply stop resolving.
const PROXY_SECRET = crypto.randomBytes(32);

function signTarget(encoded) {
    return crypto.createHmac('sha256', PROXY_SECRET).update(encoded).digest('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 16);
}

function signedTarget(url) {
    const encoded = encodeTarget(url);
    return `u=${encoded}&s=${signTarget(encoded)}`;
}

function verifiedTarget(encoded, signature) {
    if (!encoded || !signature) return '';
    const expected = signTarget(encoded);
    const given = String(signature);
    if (expected.length !== given.length) return '';
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))) return '';
    return decodeTarget(encoded);
}

async function browser() {
    if (!browserPromise) {
        browserPromise = (async () => {
            let playwright;
            try {
                playwright = require('playwright');
            } catch (error) {
                throw new Error('playwright is not installed. Run "npm install" inside the server directory.');
            }
            log(`launching chromium (headless=${HEADLESS})`);
            return playwright.chromium.launch({
                headless: HEADLESS,
                args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', '--disable-dev-shm-usage']
            });
        })();
    }
    return browserPromise;
}

async function acquireSession(iframeUrl) {
    const existing = sessions.get(iframeUrl);
    if (existing) {
        const session = await existing;
        if (!session.closed) {
            session.touch();
            return session;
        }
        sessions.delete(iframeUrl);
    }
    const pending = (async () => {
        const session = new AllohaSession(await browser(), iframeUrl, {log: debug});
        await session.open();
        return session;
    })();
    sessions.set(iframeUrl, pending);
    try {
        return await pending;
    } catch (error) {
        sessions.delete(iframeUrl);
        throw error;
    }
}

async function releaseSession(iframeUrl) {
    const pending = sessions.get(iframeUrl);
    if (!pending) return false;
    sessions.delete(iframeUrl);
    try {
        const session = await pending;
        await session.close();
    } catch (error) {
        debug(`release failed: ${error.message}`);
    }
    return true;
}

setInterval(() => {
    const now = Date.now();
    sessions.forEach((pending, key) => {
        Promise.resolve(pending).then((session) => {
            if (!session || session.closed) return;
            if (now - session.lastUsedAt > IDLE_TIMEOUT_MS) {
                log(`closing idle session ${key}`);
                releaseSession(key);
            }
        }).catch(() => {});
    });
}, 30000).unref();

function upstreamHeaders(session) {
    const state = session.state();
    const headers = {};
    Object.keys(state.headers).forEach((name) => {
        if (HOP_BY_HOP.indexOf(name) < 0) headers[name] = state.headers[name];
    });
    if (!headers['user-agent']) headers['user-agent'] = session.userAgent;
    return headers;
}

async function fetchUpstream(session, target, range) {
    const attempt = async () => {
        const headers = upstreamHeaders(session);
        if (range) headers.range = range;
        return fetch(target, {headers, redirect: 'follow'});
    };
    let response = await attempt();
    if (response.status === 403 || response.status === 401) {
        // A rejected token means the session moved on without us. One refresh
        // and one retry is the whole recovery budget: anything more just serves
        // the player stale data while it stalls.
        //
        // A full refresh reloads the player page and can take tens of seconds,
        // which is longer than any client will wait, so only the first stretch
        // of it is waited on here. The refresh itself runs to completion in the
        // background and the next request picks up its result.
        debug(`upstream ${response.status}, refreshing session`);
        await Promise.race([
            session.refresh(),
            new Promise((resolve) => setTimeout(resolve, REFRESH_WAIT_MS))
        ]);
        response = await attempt();
    }
    return response;
}

function rewritePlaylist(text, baseUrl, link) {
    return String(text || '').split(/\r?\n/).map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        if (trimmed.charAt(0) === '#') {
            return line.replace(/URI="([^"]+)"/g, (match, uri) => `URI="${link(uri, baseUrl)}"`);
        }
        return link(trimmed, baseUrl);
    }).join('\n');
}

function absolute(value, baseUrl) {
    try { return new URL(value, baseUrl).toString(); } catch (error) { return value; }
}

function sendJson(response, status, payload) {
    const body = JSON.stringify(payload);
    response.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
        'Content-Length': Buffer.byteLength(body)
    });
    response.end(body);
}

function playbackBase(request) {
    const host = request.headers.host || `127.0.0.1:${PORT}`;
    return `http://${host}`;
}

async function handleResolve(request, response, query) {
    const iframeUrl = query.get('url') || '';
    if (!iframeUrl) return sendJson(response, 400, {error: 'url is required'});
    if (!isAllohaUrl(iframeUrl)) return sendJson(response, 400, {error: 'unsupported player URL'});

    try {
        const session = await acquireSession(iframeUrl);
        const id = encodeTarget(iframeUrl);
        const base = playbackBase(request);

        // The live master carries only the rung the offscreen player happened to
        // settle on, which is never the best one - it is playing muted in a
        // headless window. The bnsi ladder holds every rung, so it is what gets
        // offered, with the live master kept as the fallback.
        const labels = Object.keys(session.qualities)
            .sort((first, second) => (parseInt(first, 10) || 0) - (parseInt(second, 10) || 0));
        const qualities = {};
        labels.forEach((label) => {
            qualities[label] = `${base}/hls/${id}/q/${encodeURIComponent(label)}/master.m3u8`;
        });
        const best = labels[labels.length - 1];

        if (DIRECT_LINKS && best) {
            const direct = {};
            labels.forEach((label) => { direct[label] = session.qualities[label]; });
            sendJson(response, 200, {
                url: session.qualities[best],
                quality: best,
                qualities: direct,
                headers: {Origin: ALLOHA_ORIGIN},
                source: 'yani-resolver',
                session: id,
                mode: 'direct',
                expires_in: null
            });
            // Nothing else needs the browser: the links are self-contained.
            releaseSession(iframeUrl);
            return;
        }

        sendJson(response, 200, {
            url: best ? qualities[best] : `${base}/hls/${id}/master.m3u8`,
            quality: best || 'auto',
            qualities: labels.length ? qualities : null,
            headers: null,
            source: 'yani-resolver',
            session: id,
            expires_in: session.expiresAt ? Math.max(0, Math.round((session.expiresAt - Date.now()) / 1000)) : null
        });
    } catch (error) {
        const unavailable = error instanceof SourceUnavailableError;
        log(`resolve failed: ${error.message}`);
        sendJson(response, unavailable ? 404 : 502, {error: error.message, unavailable});
    }
}

/**
 * `/hls/<id>/master.m3u8` follows the live session, `/hls/<id>/q/<label>/…`
 * pins one rung of the bnsi quality ladder, and anything else is a proxied
 * segment or nested playlist named by the `u` query parameter.
 */
function parseStreamPath(path) {
    const parts = String(path || '').split('/').filter(Boolean); // hls/<id>/<rest>
    const id = parts[1] || '';
    const quality = parts[2] === 'q' ? decodeURIComponent(parts[3] || '') : '';
    return {id: id, quality: quality, isMaster: parts[2] === 'master.m3u8' || Boolean(quality)};
}

async function handleStream(request, response, path, query) {
    const route = parseStreamPath(path);
    const id = route.id;
    if (!id) return sendJson(response, 400, {error: 'session is required'});

    let iframeUrl;
    try { iframeUrl = decodeTarget(id); } catch (error) { return sendJson(response, 400, {error: 'invalid session'}); }

    let session;
    try {
        session = await acquireSession(iframeUrl);
    } catch (error) {
        return sendJson(response, 502, {error: error.message});
    }
    session.touch();
    if (session.expiringSoon()) session.refresh();

    let target;
    if (route.isMaster) {
        target = route.quality
            ? (Object.prototype.hasOwnProperty.call(session.qualities, route.quality) ? session.qualities[route.quality] : '')
            : session.state().masterUrl;
    } else {
        target = verifiedTarget(query.get('u'), query.get('s'));
        if (!target) return sendJson(response, 403, {error: 'invalid stream signature'});
    }
    if (!target) return sendJson(response, 404, {error: 'stream is not ready'});

    let upstream;
    try {
        upstream = await fetchUpstream(session, target, request.headers.range);
    } catch (error) {
        log(`upstream request failed: ${error.message}`);
        return sendJson(response, 502, {error: error.message});
    }

    const contentType = upstream.headers.get('content-type') || '';
    const playlist = /mpegurl/i.test(contentType) || /\.m3u8(?:[?#]|$)/i.test(target);

    if (playlist) {
        const text = await upstream.text();
        const base = playbackBase(request);
        const body = rewritePlaylist(text, target, (value, baseUrl) => `${base}/hls/${id}/p?${signedTarget(absolute(value, baseUrl))}`);
        response.writeHead(upstream.status, {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
            'Content-Length': Buffer.byteLength(body)
        });
        return response.end(body);
    }

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
    };
    ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach((name) => {
        const value = upstream.headers.get(name);
        if (value) headers[name] = value;
    });
    response.writeHead(upstream.status, headers);
    if (!upstream.body) return response.end();
    Readable.fromWeb(upstream.body).pipe(response);
}

const server = http.createServer((request, response) => {
    const parsed = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const path = parsed.pathname;

    if (request.method === 'OPTIONS') {
        response.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        });
        return response.end();
    }

    if (path === '/health') return sendJson(response, 200, {ok: true, version: VERSION, sessions: sessions.size});
    if (path === '/resolve') return handleResolve(request, response, parsed.searchParams);
    if (path === '/release') {
        const id = parsed.searchParams.get('session') || '';
        let iframeUrl = '';
        try { iframeUrl = decodeTarget(id); } catch (error) { iframeUrl = ''; }
        return releaseSession(iframeUrl).then((released) => sendJson(response, 200, {released}));
    }
    if (path.indexOf('/hls/') === 0) {
        return handleStream(request, response, path, parsed.searchParams).catch((error) => {
            log(`stream failed: ${error.message}`);
            if (!response.headersSent) sendJson(response, 502, {error: error.message});
            else response.end();
        });
    }
    sendJson(response, 404, {error: 'not found'});
});

function shutdown() {
    log('shutting down');
    const pending = Array.from(sessions.keys()).map(releaseSession);
    Promise.all(pending)
        .then(() => browserPromise)
        .then((instance) => instance && instance.close())
        .catch(() => {})
        .finally(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (require.main === module) {
    server.listen(PORT, HOST, () => {
        log(`listening on http://${HOST}:${PORT} (resolver v${VERSION})`);
        log(`configure Lampa with: http://<this-machine-ip>:${PORT}`);
    });
}

module.exports = {
    server,
    rewritePlaylist,
    parseStreamPath,
    encodeTarget,
    decodeTarget,
    signedTarget,
    verifiedTarget,
    isAllohaUrl
};
