const assert = require('node:assert/strict');
const http = require('node:http');
const {createHandler, reloadCertificate} = require('../server/deploy/gateway');

const token = 'a'.repeat(64);
const listen = (server) => new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
});

(async () => {
    let calls = 0;
    const backend = http.createServer((request, response) => {
        calls += 1;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({url: request.url, range: request.headers.range}));
    });
    const backendPort = await listen(backend);
    const gateway = http.createServer(createHandler({
        token,
        upstream: `http://127.0.0.1:${backendPort}`,
        timeoutMs: 1000
    }));
    const gatewayPort = await listen(gateway);
    const base = `http://127.0.0.1:${gatewayPort}`;

    try {
        for (const path of ['/health', `/${token}`, `/${token}bad/health`, `/${token}/../health`]) {
            assert.equal((await fetch(base + path)).status, 404, path);
        }
        assert.equal(calls, 0, 'unauthorized requests must not reach the resolver');

        const response = await fetch(`${base}/${token}/hls/id/p?u=x&s=y`, {
            headers: {Range: 'bytes=10-19'}
        });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {url: '/hls/id/p?u=x&s=y', range: 'bytes=10-19'});
        assert.equal((await fetch(`${base}/${token}/resolve`, {method: 'POST'})).status, 405);

        assert.throws(() => createHandler({token: 'short', upstream: 'http://127.0.0.1:1'}), /token/i);
        let updates = 0;
        const tlsServer = {setSecureContext(options) {
            assert.equal(options.cert.toString(), 'certificate');
            assert.equal(options.key.toString(), 'key');
            updates += 1;
        }};
        const read = (name) => Buffer.from(name === 'cert' ? 'certificate' : 'key');
        reloadCertificate(tlsServer, {certPath: 'cert', keyPath: 'key', read});
        assert.equal(updates, 1);
    } finally {
        await new Promise((resolve) => gateway.close(resolve));
        await new Promise((resolve) => backend.close(resolve));
    }

    console.log('resolver gateway tests passed');
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

