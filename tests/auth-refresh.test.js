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

    // A token the server has dropped: list requests keep answering as if
    // nobody were signed in, so the 401/403 from the account endpoints is the
    // only signal. It must end the session instead of keeping a dead token.
    const notices = [];
    context.Lampa.Noty = {show: (text) => notices.push(text)};
    context.window.LampaYaniI18n = {t: (key) => key};
    context.LampaYaniI18n = context.window.LampaYaniI18n;

    now += 3 * 60 * 60 * 1000 + 1;
    refreshResponse = {ok: false, status: 401, json: () => Promise.resolve({})};
    await auth.refreshIfNeeded();
    assert.strictEqual(auth.token(), '', 'a rejected session must be signed out');
    assert.deepStrictEqual(notices, ['session_expired'], 'the viewer must be told to sign in again');
    assert.strictEqual(auth.sessionExpired(), true, 'the ended session must stay visible until the next sign-in');
    assert.strictEqual(auth.get().login, 'codeman', 'the login is kept to prefill the sign-in form');

    let manualError = null;
    auth.save({token: 'stale-token', login: 'codeman', refreshed_at: now});
    assert.strictEqual(auth.sessionExpired(), false, 'signing in again clears the expired mark');
    refreshResponse = {ok: false, status: 403, json: () => Promise.resolve({})};
    await auth.refresh().catch((error) => { manualError = error; });
    assert.ok(manualError && manualError.sessionExpired, 'a manual refresh must report the expired session');
    assert.strictEqual(auth.token(), '');

    // The startup check: a dead token is found without waiting two days.
    auth.save({token: 'dead-token', login: 'codeman', refreshed_at: now});
    refreshResponse = {ok: false, status: 401, json: () => Promise.resolve({})};
    assert.strictEqual(await auth.verify(), false);
    assert.strictEqual(auth.token(), '', 'verification must sign out a rejected session');

    auth.save({token: 'good-token', login: 'codeman', refreshed_at: now});
    refreshResponse = {ok: false, status: 500, json: () => Promise.resolve({})};
    assert.strictEqual(await auth.verify(), true);
    assert.strictEqual(auth.token(), 'good-token', 'a server error says nothing about the token');

    auth.save({token: 'offline-token', login: 'codeman', refreshed_at: now});
    const workingFetch = context.fetch;
    let offlineCalls = 0;
    context.fetch = () => { offlineCalls += 1; return Promise.reject(new Error('offline')); };
    assert.strictEqual(await auth.verify(), true);
    assert.strictEqual(offlineCalls, 1, 'a new token must be checked, not answered from the previous check');
    assert.strictEqual(auth.token(), 'offline-token', 'being offline must never sign the viewer out');
    context.fetch = workingFetch;

    auth.clear();
    assert.strictEqual(auth.sessionExpired(), false, 'a deliberate sign-out is not an expired session');

    console.log('auth refresh tests passed');
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
