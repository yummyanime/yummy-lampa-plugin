'use strict';

const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const {timingSafeEqual} = require('node:crypto');

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const HOP_BY_HOP = new Set(['connection', 'keep-alive', 'proxy-authenticate',
    'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade']);

function safeTokenMatch(value, token) {
    if (value.length !== token.length || Buffer.byteLength(value) !== Buffer.byteLength(token)) return false;
    return timingSafeEqual(Buffer.from(value), Buffer.from(token));
}

function filteredHeaders(headers, host) {
    const result = {};
    Object.keys(headers || {}).forEach((name) => {
        if (!HOP_BY_HOP.has(name.toLowerCase())) result[name] = headers[name];
    });
    if (host) result.host = host;
    return result;
}

function createHandler({token, upstream, timeoutMs = 60000}) {
    if (!/^[a-f0-9]{64}$/.test(token || '')) throw new Error('Access token must contain 64 lowercase hexadecimal characters');
    const target = new URL(upstream);
    if (target.protocol !== 'http:' || target.username || target.password || target.search || target.hash) {
        throw new Error('Gateway upstream must be a plain HTTP URL without credentials, query or fragment');
    }

    return function handle(request, response) {
        const rawUrl = String(request.url || '');
        const match = rawUrl.match(/^\/([^/]+)(\/.*)$/);
        if (!match || !safeTokenMatch(match[1], token) || match[2].includes('\\')) {
            response.writeHead(404, {'Cache-Control': 'no-store'});
            return response.end();
        }
        if (!ALLOWED_METHODS.has(request.method)) {
            response.writeHead(405, {'Allow': 'GET, HEAD, OPTIONS', 'Cache-Control': 'no-store'});
            return response.end();
        }

        const headers = filteredHeaders(request.headers, target.host);
        const proxy = http.request({
            hostname: target.hostname,
            port: target.port || 80,
            path: match[2],
            method: request.method,
            headers
        }, (incoming) => {
            const responseHeaders = filteredHeaders(incoming.headers);
            responseHeaders['x-content-type-options'] = 'nosniff';
            responseHeaders['referrer-policy'] = 'no-referrer';
            response.writeHead(incoming.statusCode || 502, responseHeaders);
            incoming.on('aborted', () => response.destroy());
            incoming.on('error', () => response.destroy());
            incoming.pipe(response);
        });

        proxy.setTimeout(timeoutMs, () => proxy.destroy(new Error('Upstream timeout')));
        proxy.on('error', () => {
            if (response.headersSent) return response.destroy();
            response.writeHead(502, {'Cache-Control': 'no-store'});
            response.end();
        });
        request.on('aborted', () => proxy.destroy());
        response.on('close', () => { if (!response.writableEnded) proxy.destroy(); });
        request.pipe(proxy);
    };
}

function reloadCertificate(server, {certPath, keyPath, read = fs.readFileSync}) {
    const cert = read(certPath);
    const key = read(keyPath);
    server.setSecureContext({cert, key});
}

if (require.main === module) {
    const certPath = process.env.TLS_CERT || '/cert/fullchain.pem';
    const keyPath = process.env.TLS_KEY || '/cert/privkey.pem';
    const port = Number(process.env.ALLOHA_GATEWAY_PORT || 18443);
    const handler = createHandler({
        token: process.env.ALLOHA_ACCESS_TOKEN,
        upstream: process.env.ALLOHA_UPSTREAM || 'http://resolver:8790'
    });
    const server = https.createServer({
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
        minVersion: 'TLSv1.2'
    }, handler);
    server.headersTimeout = 15000;
    server.requestTimeout = 60000;
    server.keepAliveTimeout = 5000;
    server.maxHeadersCount = 64;
    server.listen(port, '0.0.0.0', () => console.log(`Alloha HTTPS gateway listening on ${port}`));

    setInterval(() => {
        try { reloadCertificate(server, {certPath, keyPath}); }
        catch (error) { console.error('Could not reload the TLS certificate; the current certificate remains active'); }
    }, 60 * 60 * 1000).unref();

    process.on('SIGTERM', () => {
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(0), 10000).unref();
    });
}

module.exports = {createHandler, reloadCertificate};

