const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {
    window: {},
    Lampa: {
        Storage: {
            get: (key, fallback) => key === 'yani_public_application_token' ? 'custom_public-key_123' : fallback,
            set: () => { throw new Error('application token must not be stored'); }
        }
    }
};
context.window.Lampa = context.Lampa;
vm.runInNewContext(fs.readFileSync('src/config.js', 'utf8'), context);

const config = context.window.LampaYaniConfig;
assert.strictEqual(config.applicationToken(), config.defaultApplicationToken);
assert.strictEqual(config.applicationHeader, config.defaultApplicationToken);
assert.strictEqual(typeof config.customApplicationToken, 'undefined');
assert.strictEqual(typeof config.setApplicationToken, 'undefined');

const ui = fs.readFileSync('src/ui.js', 'utf8');
assert.doesNotMatch(ui, /yani_public_application_token/);
assert.doesNotMatch(ui, /editPublicApplicationToken/);
assert.doesNotMatch(ui, /public_application_token/);

const api = fs.readFileSync('src/api.js', 'utf8');
const auth = fs.readFileSync('src/auth.js', 'utf8');
assert.match(api, /config\.applicationToken \? config\.applicationToken\(\)/);
assert.match(auth, /function applicationToken\(\)/);
assert.doesNotMatch(auth, /'X-Application': LampaYaniConfig\.applicationHeader/);

console.log('application token tests passed');
