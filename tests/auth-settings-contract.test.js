const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const authPage = fs.readFileSync('src/ui-auth.js', 'utf8');

assert.match(ui, /name: 'yani_account_state', type: 'button'[\s\S]{0,180}name: t\('auth_title'\)[\s\S]{0,120}onChange: openSettingsLogin/,
    'settings must expose one stable account-management entry');
assert.match(ui, /name: 'yani_auto_sync_progress', type: 'trigger', default: true/,
    'progress synchronization remains configurable while signed out');
assert.doesNotMatch(ui, /name: 'yani_account_(?:login|logout|refresh)'/,
    'settings must not retain authorization-dependent rows after the token changes');
assert.match(authPage, /authorized = Boolean\(LampaYaniAuth\.token\(\)\)/,
    'the account page must derive authorization from the current token on every render');
assert.match(authPage, /function logout\(\)[\s\S]{0,260}LampaYaniAuth\.logout\(\)[\s\S]{0,260}render\(\)/,
    'sign-out must redraw the account page immediately');

console.log('auth settings contract tests passed');