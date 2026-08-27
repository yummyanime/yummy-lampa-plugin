const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');

assert.match(ui, /addAccountNotice\(t\('not_logged_in'\), t\('login_hint'\), \{title: t\('login_name'\), handler: openAccountLogin\}\)/,
    'the signed-out Account page must offer a direct sign-in action');
assert.match(ui, /yani-account__login-button selector/,
    'the Account sign-in action must participate in TV remote focus navigation');
assert.match(ui, /function openAccountLogin\(\)[\s\S]{0,260}component: 'yani_auth'[\s\S]{0,100}refresh_account_on_authorized: true/,
    'dashboard authorization must mark the Account page for refresh');
assert.match(ui, /object && object\.refresh_account_on_authorized[\s\S]{0,260}Lampa\.Activity\.replace\(\{url: 'yani\/account'/,
    'successful dashboard authorization must replace the stale Account activity');
assert.match(ui, /renderAccountStatistics\(genreStats, ratingStats, typeStats\);[\s\S]{0,520}yani-account__logout-button selector/,
    'the sign-out action must be rendered after all Account statistics and support TV focus');
assert.match(ui, /yaniAccountLogout', logoutFromAccount/,
    'the Account sign-out button must invoke the shared logout flow');
assert.match(ui, /function logoutFromAccount\(\)[\s\S]{0,520}LampaYaniAuth\.logout\(\)[\s\S]{0,520}Lampa\.Activity\.replace\(\{url: 'yani\/account'/,
    'sign-out must clear the session and immediately redraw Account');

console.log('account authorization entry contract tests passed');