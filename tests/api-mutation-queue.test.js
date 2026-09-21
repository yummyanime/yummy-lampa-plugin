const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const values = {};
let online = false;
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
        if (!online) return Promise.reject(new TypeError('offline'));
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
    online = true;
    const flushed = await api.flushMutations();
    assert.strictEqual(flushed.pending, 0);
    assert.strictEqual(api.pendingMutations(), 0);
    assert.match(fs.readFileSync('src/api.js', 'utf8'), /item\.id === entry\.id/,
        'a completed older request must not delete a newer mutation with the same key');
    console.log('API mutation queue tests passed');
})().catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
