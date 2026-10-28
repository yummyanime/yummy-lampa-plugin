const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const values = {};
let responseMode = 'offline';
const context = {
    window: {
        LampaYaniConfig: {
            apiBase: 'https://api.example.test',
            requestTimeout: 100,
            requestRetries: 0,
            applicationToken: function () { return 'app'; }
        },
        Lampa: {Storage: {
            get: function (key, fallback) { return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback; },
            set: function (key, value) { values[key] = value; },
            remove: function (key) { delete values[key]; }
        }},
        LampaYaniAuth: {
            token: function () { return 'user'; },
            refreshIfNeeded: function () { return Promise.resolve(); }
        },
        LampaYaniI18n: {getLanguage: function () { return 'en';}
        }
    },
    fetch: function () {
        if (responseMode === 'offline') return Promise.reject(new TypeError('offline'));
        if (responseMode !== 'online') {
            const status = Number(responseMode);
            return Promise.resolve({ok: false, status: status, json: function () { return Promise.resolve({}); }});
        }
        return Promise.resolve({ok: true, status: 200, json: function () { return Promise.resolve({ok: true}); }});
    },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    console: console,
    URLSearchParams: URLSearchParams,
    AbortController: AbortController,
    Promise: Promise,
    JSON: JSON,
    Date: Date,
    Math: Math,
    Number: Number,
    String: String,
    Object: Object,
    Array: Array,
    TypeError: TypeError
};
context.Lampa = context.window.Lampa;
context.LampaYaniAuth = context.window.LampaYaniAuth;
context.LampaYaniConfig = context.window.LampaYaniConfig;
context.LampaYaniI18n = context.window.LampaYaniI18n;
vm.runInNewContext(fs.readFileSync('src/api.js', 'utf8'), context);

(async function () {
    const api = context.window.LampaYaniApi;
    const first = await api.addToList(42, 0);
    assert.strictEqual(first.queued, true);
    await api.removeFromList(42);
    assert.strictEqual(api.pendingMutations(), 1, 'last list mutation must replace the older pending state');
    await api.syncVideoProgress(1001, 30, 120);
    await api.syncVideoProgress(1001, 60, 120);
    assert.strictEqual(api.pendingMutations(), 2, 'progress updates for one video must be coalesced');
    await api.removeVideoWatches([1001, 1002, 1001]);
    assert.strictEqual(api.pendingMutations(), 3, 'episode reset must be queued while offline');
    const queuedReset = JSON.parse(values.yani_pending_mutations_v1).filter(function (item) {
        return String(item.key || '').indexOf('progress-remove:') === 0;
    })[0];
    assert.deepStrictEqual(JSON.parse(queuedReset.body), {video_ids: [1001, 1002]});
    responseMode = '429';
    const throttled = await api.flushMutations();
    assert.strictEqual(throttled.retryable, true, 'HTTP 429 must stay queued for a later flush');
    assert.strictEqual(api.pendingMutations(), 3, 'a temporary response must not drop queued mutations');
    const queuedAfterThrottle = JSON.parse(values.yani_pending_mutations_v1);
    assert.strictEqual(queuedAfterThrottle[0].attemptCount, 1, 'temporary server failures must have a bounded attempt count');

    responseMode = 'online';
    const flushed = await api.flushMutations();
    assert.strictEqual(flushed.pending, 0);
    assert.strictEqual(api.pendingMutations(), 0);

    responseMode = 'offline';
    await api.rate(42, 7);
    responseMode = '500';
    for (let attempt = 0; attempt < 8; attempt += 1) await api.flushMutations();
    assert.strictEqual(api.pendingMutations(), 0, 'a persistent server failure must stop retrying after the bounded limit');

    responseMode = 'offline';
    await api.rate(42, 8);
    assert.strictEqual(api.pendingMutations(), 1);
    responseMode = '400';
    const rejected = await api.flushMutations();
    assert.strictEqual(rejected.pending, 0, 'a permanent 4xx rejection must be removed');
    assert.strictEqual(api.pendingMutations(), 0);
    assert.match(fs.readFileSync('src/api.js', 'utf8'), /item\.id === entry\.id/,
        'a completed older request must not delete a newer mutation with the same key');
    console.log('API mutation queue tests passed');
})().catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
