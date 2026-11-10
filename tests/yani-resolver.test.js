const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const storage = {yani_resolver_url: 'http://192.168.1.10:8790/'};
const requested = [];
let nextResponse = {ok: true, status: 200, body: '{}'};

const context = {
    window: {
        Lampa: {
            Storage: {
                get: (key, fallback) => Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : fallback,
                set: (key, value) => { storage[key] = value; }
            }
        },
        LampaYaniConfig: {requestTimeout: 5000}
    },
    console,
    setTimeout,
    clearTimeout,
    Promise,
    fetch: (url) => {
        requested.push(url);
        return Promise.resolve({
            ok: nextResponse.ok,
            status: nextResponse.status,
            text: () => Promise.resolve(nextResponse.body)
        });
    }
};
context.Lampa = context.window.Lampa;
context.LampaYaniConfig = context.window.LampaYaniConfig;
vm.runInNewContext(fs.readFileSync('src/playback/yani-resolver.js', 'utf8'), context);

const resolver = context.window.LampaYaniResolver;

assert.strictEqual(resolver.normalizeBaseUrl('http://yani.local:8790/'), 'http://yani.local:8790');
assert.strictEqual(resolver.normalizeBaseUrl('yani.local:8790'), '', 'a bare host must be rejected');
assert.strictEqual(resolver.baseUrl(), 'http://192.168.1.10:8790', 'the trailing slash must be normalized away');
assert.strictEqual(resolver.enabled(), true);

const iframeUrl = 'https://alloha.yani.tv/?token_movie=abc&translation=128&season=1&episode=2&token=def';

nextResponse = {
    ok: true,
    status: 200,
    body: JSON.stringify({url: 'http://192.168.1.10:8790/hls/xyz/master.m3u8', quality: 'auto', session: 'xyz', source: 'yani-resolver'})
};

resolver.resolve(iframeUrl).then((result) => {
    assert.strictEqual(
        requested[0],
        'http://192.168.1.10:8790/resolve?url=' + encodeURIComponent(iframeUrl),
        'the iframe URL must be passed through untouched'
    );
    assert.strictEqual(result.url, 'http://192.168.1.10:8790/hls/xyz/master.m3u8');
    assert.strictEqual(result.source, 'yani-resolver');
    assert.strictEqual(result.direct, true, 'a resolved stream must be playable by the media players');

    // A resolver that reports the dubbing as missing must not be retried as a
    // transport error: the caller falls through to the next source instead.
    nextResponse = {ok: true, status: 200, body: JSON.stringify({error: 'dubbing unavailable', unavailable: true})};
    return resolver.resolve(iframeUrl).then(
        () => { throw new Error('an error payload must reject'); },
        (error) => {
            assert.strictEqual(error.message, 'dubbing unavailable');
            assert.strictEqual(error.unavailable, true);
        }
    );
}).then(() => {
    nextResponse = {ok: true, status: 200, body: 'not json'};
    return resolver.resolve(iframeUrl).then(
        () => { throw new Error('invalid JSON must reject'); },
        (error) => assert.strictEqual(error.message, 'Invalid resolver response')
    );
}).then(() => {
    assert.strictEqual(resolver.setBaseUrl(''), '');
    assert.strictEqual(resolver.enabled(), false);
    return resolver.resolve(iframeUrl).then(
        () => { throw new Error('an unconfigured resolver must reject'); },
        (error) => assert.strictEqual(error.message, 'Resolver server is not configured')
    );
}).then(() => {
    console.log('yani-resolver tests passed');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
