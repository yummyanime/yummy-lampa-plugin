const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const authSource = fs.readFileSync('src/core/auth.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const storage = {};
const events = [];

function TestCustomEvent(type, options) {
    this.type = type;
    this.detail = options && options.detail;
}

const context = {
    window: {},
    document: {dispatchEvent: (event) => events.push(event)},
    CustomEvent: TestCustomEvent,
    Promise,
    JSON,
    String,
    Number,
    Date,
    setTimeout,
    clearTimeout,
    fetch: () => Promise.reject(new Error('network is not used by this contract')),
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
vm.runInNewContext(authSource, context);
const auth = context.window.LampaYaniAuth;

auth.save({token: 'token-a', login: 'viewer'});
assert.deepStrictEqual(events.map((event) => event.detail.authorized), [true], 'sign-in must emit immediately');
auth.save({token: 'token-b', login: 'viewer', display_name: 'Viewer'});
assert.strictEqual(events.length, 1, 'token refreshes must not rebuild dashboard');
auth.clear();
assert.deepStrictEqual(events.map((event) => event.detail.authorized), [true, false], 'sign-out must emit immediately');
auth.clear();
assert.strictEqual(events.length, 2, 'repeated clears must not emit duplicate state changes');

assert.match(homeScreen, /document\.addEventListener\('yani:auth-changed', onHomeAuthorizationChanged\)/,
    'Home must listen for authorization changes while it is retained in the activity stack');
assert.match(homeScreen, /homeAuthorizationChanged \|\| homeAuthorized !== Boolean\(LampaYaniAuth\.token\(\)\)[\s\S]{0,320}Lampa\.Activity\.replace\(\{[\s\S]{0,180}component: 'yani_home'/,
    'Home must rebuild before rendering stale account data');
assert.match(homeScreen, /document\.removeEventListener\('yani:auth-changed', onHomeAuthorizationChanged\)/,
    'Home must remove its authorization listener on destroy');
assert.match(homeScreen, /onHomeAuthorizationChanged\(\)[\s\S]{0,100}resetUserListsSnapshot\(\)/,
    'account-specific list snapshots must be invalidated with the session');
assert.match(ui, /resetUserListsSnapshot: function \(\) \{ userListsSnapshot = null; \}/,
    'the reset must clear the cache that ui.js keeps');

console.log('authorization dashboard state contract tests passed');