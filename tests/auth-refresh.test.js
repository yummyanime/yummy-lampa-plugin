const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/core/auth.js', 'utf8');
const apiSource = fs.readFileSync('src/core/api.js', 'utf8');
const storage = {};
let now = 1_800_000_000_000;
let fetchCalls = 0;
let refreshResponse = {ok: true, json: () => Promise.resolve({response: {token: 'new-token'}})};

const context = {
    window: {},
    console: {warn: () => {}, error: console.error, log: console.log},
    Promise,
    JSON,
    String,
    Number,
    setTimeout,
    clearTimeout,
    Date: {now: () => now},
    fetch: () => {
        fetchCalls += 1;
        return Promise.resolve(refreshResponse);
    },
    Lampa: {
        Storage: {
            get: (key, fallback) => Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : fallback,
            set: (key, value) => { storage[key] = value; }
        }
    },
    LampaYaniConfig: {
        apiBase: 'https://api.yani.test',
        applicationToken: () => 'public-token',
        requestTimeout: 1000
    }
};
context.window.Lampa = context.Lampa;
context.window.LampaYaniConfig = context.LampaYaniConfig;
vm.runInNewContext(source, context);
const auth = context.window.LampaYaniAuth;
context.LampaYaniAuth = auth;

assert.match(apiSource, /options\.auth && !options\.authRefreshChecked/);
assert.match(apiSource, /LampaYaniAuth\.refreshIfNeeded\(\)\.then/);

(async () => {
    auth.save({token: 'old-token', login: 'codeman', refreshed_at: now});
    await auth.refreshIfNeeded();
    assert.strictEqual(fetchCalls, 0, 'fresh tokens must not be refreshed');

    now += 2 * 24 * 60 * 60 * 1000 + 1;
    const first = auth.refreshIfNeeded();
    const second = auth.refreshIfNeeded();
    await Promise.all([first, second]);
    assert.strictEqual(fetchCalls, 1, 'parallel refreshes must share one request');
    assert.strictEqual(auth.token(), 'new-token');
    assert.strictEqual(auth.get().login, 'codeman');
    assert.strictEqual(auth.needsRefresh(), false);

    now += 2 * 24 * 60 * 60 * 1000 + 1;
    refreshResponse = {ok: false, status: 503, json: () => Promise.resolve({})};
    await auth.refreshIfNeeded();
    assert.strictEqual(auth.token(), 'new-token', 'transient failures must preserve the current token');
    assert.strictEqual(fetchCalls, 2);
    await auth.refreshIfNeeded();
    assert.strictEqual(fetchCalls, 2, 'refresh failure cooldown must prevent request storms');
    now += 3 * 60 * 60 * 1000 + 1;
    await auth.refreshIfNeeded();
    assert.strictEqual(fetchCalls, 3, 'automatic refresh may retry after the three-hour cooldown');

    console.log('auth refresh tests passed');
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
