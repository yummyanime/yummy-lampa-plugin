'use strict';

const {wrapperHtml, initScript} = require('./wrapper');

const WRAPPER_PATH = '/__yani_wrapper';
const OPEN_TIMEOUT_MS = 45000;
const REFRESH_LEAD_MS = 20000;
const QUALITY_GRACE_MS = 3000;

// What a captured master is assumed to be good for when the player never sends
// a `config_update` frame stating otherwise. Without this the session would
// have no expiry at all, so nothing would refresh it until the CDN started
// rejecting segments - and by then the viewer is already staring at a stall.
const ASSUMED_TTL_MS = 150000;
const UNAVAILABLE_PATTERN = /озвучка\s*недоступна/i;
const MASTER_PATTERN = /master\.m3u8/i;
const DESKTOP_PLATFORMS = [
    'Windows NT 10.0; Win64; x64',
    'Macintosh; Intel Mac OS X 10_15_7',
    'X11; Linux x86_64'
];
const FORWARDED_HEADERS = [
    'authorizations',
    'accepts-controls',
    'origin',
    'referer',
    'user-agent',
    'accept',
    'accept-language',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site'
];

function desktopUserAgent() {
    const platform = DESKTOP_PLATFORMS[Math.floor(Math.random() * DESKTOP_PLATFORMS.length)];
    const version = 130 + Math.floor(Math.random() * 6);
    return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`;
}

function normalizeUrl(value) {
    value = String(value || '').trim();
    if (!value) return '';
    if (value.startsWith('//')) return `https:${value}`;
    return value;
}

function hostOf(value) {
    try { return new URL(value).host; } catch (error) { return ''; }
}

class SourceUnavailableError extends Error {}

/**
 * One live Alloha playback session backed by a headless browser page.
 *
 * Everything the CDN authorizes against is produced by the player itself and
 * keeps moving: `accepts-controls` rotates every couple of minutes and the
 * master URL follows whichever CDN node the player is talking to. It is all
 * captured from the driver rather than from injected page code, so it is in
 * place from the player's very first request:
 *
 *   * the master request is intercepted and aborted - its URL and headers are
 *     exactly what the proxy needs, and the token in its path is single-use, so
 *     letting the request through would spend it;
 *   * `/bnsi/` responses carry the quality ladder;
 *   * `config_update` WebSocket frames carry each new token and its lifetime.
 */
class AllohaSession {
    constructor(browser, iframeUrl, options) {
        options = options || {};
        this.browser = browser;
        this.iframeUrl = normalizeUrl(iframeUrl);
        this.log = options.log || (() => {});
        this.context = null;
        this.page = null;
        this.headers = {};
        this.masterUrl = '';
        this.qualities = {};
        this.expiresAt = 0;
        this.generation = 0;
        this.lastUsedAt = Date.now();
        this.closed = false;
        this.refreshing = null;
        this.userAgent = desktopUserAgent();
        this.unavailable = false;
        this.waiters = [];
    }

    state() {
        return {
            headers: Object.assign({}, this.headers),
            masterUrl: this.masterUrl,
            generation: this.generation
        };
    }

    touch() {
        this.lastUsedAt = Date.now();
    }

    expiringSoon() {
        return this.expiresAt > 0 && Date.now() > this.expiresAt - REFRESH_LEAD_MS;
    }

    async open() {
        this.context = await this.browser.newContext({
            userAgent: this.userAgent,
            viewport: {width: 1280, height: 720},
            locale: 'ru-RU'
        });
        await this.context.addInitScript(initScript());
        this.page = await this.context.newPage();

        this.wrapperUrl = new URL(WRAPPER_PATH, this.iframeUrl).toString();
        const html = wrapperHtml(this.iframeUrl);

        await this.page.route('**/*', (route) => {
            const request = route.request();
            const url = request.url();
            if (url === this.wrapperUrl) {
                return route.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: html});
            }
            if (MASTER_PATTERN.test(url) && !/alloha\./i.test(hostOf(url))) {
                this._captureMaster(url, request.headers());
                return route.abort();
            }
            return route.continue();
        });

        this.page.on('response', (response) => {
            if (response.url().indexOf('/bnsi/') < 0) return;
            response.text()
                .then((text) => this._readQualities(text))
                .catch(() => {});
        });

        this.page.on('websocket', (socket) => {
            socket.on('framereceived', (frame) => this._readSocketFrame(frame && frame.payload));
        });

        // The wrapper document exists purely because the player wipes itself out
        // when it is not framed. It is served from Alloha's own origin so the
        // player sees a referrer it accepts.
        await this.page.goto(this.wrapperUrl, {waitUntil: 'domcontentloaded', timeout: OPEN_TIMEOUT_MS});
        this._watchForUnavailable();
        await this._waitUntilReady(OPEN_TIMEOUT_MS);
        // The bnsi response is read asynchronously and usually lands within a
        // few hundred milliseconds of the master; without this wait the first
        // caller would be told the session has no quality ladder at all.
        await this._waitForQualities(QUALITY_GRACE_MS);
        return this;
    }

    async _waitForQualities(timeoutMs) {
        const deadline = Date.now() + timeoutMs;
        while (!this.closed && !Object.keys(this.qualities).length && Date.now() < deadline) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    /**
     * Reloads the wrapper so the player mints a fresh token. The live state is
     * deliberately left in place while that happens: the current token is still
     * valid for REFRESH_LEAD_MS and has to keep serving segments until the
     * reload has produced a replacement.
     */
    refresh() {
        if (this.closed) return Promise.resolve();
        if (this.refreshing) return this.refreshing;
        this.refreshing = (async () => {
            try {
                this.log('refreshing session');
                await this.page.reload({waitUntil: 'domcontentloaded', timeout: OPEN_TIMEOUT_MS});
                await this._waitUntilReady(OPEN_TIMEOUT_MS);
            } catch (error) {
                this.log(`refresh failed: ${error.message}`);
            } finally {
                this.refreshing = null;
            }
        })();
        return this.refreshing;
    }

    async close() {
        if (this.closed) return;
        this.closed = true;
        if (this._unavailableTimer) clearInterval(this._unavailableTimer);
        this._settle(new Error('Session closed'));
        try { if (this.page) await this.page.close(); } catch (error) {}
        try { if (this.context) await this.context.close(); } catch (error) {}
    }

    _captureMaster(url, headers) {
        const previousHost = hostOf(this.masterUrl);
        const nextHost = hostOf(url);
        FORWARDED_HEADERS.forEach((name) => {
            const value = headers[name];
            if (value) this.headers[name] = value;
        });
        if (!this.headers['user-agent']) this.headers['user-agent'] = this.userAgent;
        this.masterUrl = url;
        this.generation += 1;
        // A `config_update` frame, when one arrives, replaces this with the
        // lifetime the service actually stated.
        if (!this.expiresAt || this.expiresAt < Date.now()) this.expiresAt = Date.now() + ASSUMED_TTL_MS;
        if (previousHost && nextHost && previousHost !== nextHost) {
            this.log(`master host changed ${previousHost} -> ${nextHost}`);
        }
        this._settle(null);
    }

    _readSocketFrame(payload) {
        let message;
        try { message = JSON.parse(payload); } catch (error) { return; }
        if (!message || message.type !== 'config_update' || !message.edge_hash) return;
        this.headers['accepts-controls'] = message.edge_hash;
        this.expiresAt = Date.now() + Number(message.ttl || 120) * 1000;
        this.generation += 1;
        this.log(`token refreshed, ttl=${message.ttl || 120}s`);
    }

    _readQualities(bnsi) {
        let payload;
        try { payload = JSON.parse(bnsi); } catch (error) { return; }
        const sources = payload && payload.hlsSource;
        if (!Array.isArray(sources)) return;
        const selected = sources.find((source) => source && source.default === true) || sources[0];
        if (!selected || !selected.quality) return;
        const found = {};
        Object.keys(selected.quality).forEach((label) => {
            const url = String(selected.quality[label] || '').split(' or ')[0].trim();
            const normalized = normalizeUrl(url);
            const name = /p$/i.test(label) ? label : `${label}p`;
            if (normalized && !found[name]) found[name] = normalized;
        });
        this.qualities = found;
        this.log(`qualities: ${Object.keys(found).join(', ') || 'none'}`);
    }

    // The player reports a missing dubbing as page text rather than as a failed
    // request, so it can only be noticed by reading the frame.
    _watchForUnavailable() {
        this._unavailableTimer = setInterval(() => {
            if (this.closed || this.masterUrl) return;
            Promise.all(this.page.frames().map((frame) => frame.innerText('body').catch(() => '')))
                .then((texts) => {
                    if (this.closed || this.masterUrl) return;
                    if (!texts.some((text) => UNAVAILABLE_PATTERN.test(text))) return;
                    this.unavailable = true;
                    this._settle(new SourceUnavailableError('Alloha reports this dubbing as unavailable'));
                })
                .catch(() => {});
        }, 2000);
        this._unavailableTimer.unref();
    }

    _waitUntilReady(timeoutMs) {
        if (this.masterUrl) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this._remove(waiter);
                reject(new Error('Timed out waiting for an Alloha session'));
            }, timeoutMs);
            const waiter = {
                resolve: () => { clearTimeout(timer); resolve(); },
                reject: (error) => { clearTimeout(timer); reject(error); }
            };
            this.waiters.push(waiter);
        });
    }

    _remove(waiter) {
        this.waiters = this.waiters.filter((item) => item !== waiter);
    }

    _settle(error) {
        const waiters = this.waiters;
        this.waiters = [];
        waiters.forEach((waiter) => (error ? waiter.reject(error) : waiter.resolve()));
    }
}

module.exports = {AllohaSession, SourceUnavailableError, desktopUserAgent};
