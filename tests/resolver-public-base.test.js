const assert = require('node:assert/strict');
const {playbackBase} = require('../server');

const previous = process.env.YANI_RESOLVER_PUBLIC_BASE;
try {
    delete process.env.YANI_RESOLVER_PUBLIC_BASE;
    assert.equal(playbackBase({headers: {host: '127.0.0.1:8790'}}), 'http://127.0.0.1:8790');

    process.env.YANI_RESOLVER_PUBLIC_BASE = 'https://resolver.example:18443/access-key/';
    assert.equal(playbackBase({headers: {host: 'internal:8790'}}),
        'https://resolver.example:18443/access-key');

    for (const value of [
        'http://resolver.example/key',
        'https://user:password@resolver.example/key',
        'https://resolver.example/key?secret=x',
        'https://resolver.example/key#fragment'
    ]) {
        process.env.YANI_RESOLVER_PUBLIC_BASE = value;
        assert.throws(() => playbackBase({headers: {host: 'internal'}}), /public address/i);
    }
} finally {
    if (previous === undefined) delete process.env.YANI_RESOLVER_PUBLIC_BASE;
    else process.env.YANI_RESOLVER_PUBLIC_BASE = previous;
}

console.log('resolver public base tests passed');

