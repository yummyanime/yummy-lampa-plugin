const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const authPage = fs.readFileSync('src/ui-auth.js', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');

assert.match(ui, /authSettingsParamDefinition = \{[\s\S]{0,220}name: 'yani_account_state', type: 'button'[\s\S]{0,220}description: settingsAuthDescription\(\)[\s\S]{0,220}syncSettingsAuthStatus\(item\)[\s\S]{0,120}onChange: openSettingsLogin/,
    'settings must expose one stable account-management entry');
assert.match(ui, /function settingsAuthDescription\(\)[\s\S]{0,260}LampaYaniAuth\.token\(\)[\s\S]{0,220}settings_auth_status/,
    'the account-management entry must describe the current authorization state');
assert.match(ui, /function syncSettingsAuthStatus\(renderedItem\)[\s\S]{0,520}authSettingsParamDefinition\.field\.description[\s\S]{0,520}settings-param__descr/,
    'authorization changes must update both future settings renders and the visible row');
assert.ok(ui.includes('onAuthChanged: syncSettingsAuthStatus'),
    'the authorization page must notify settings after the token changes');
assert.match(ui, /name: 'yani_auto_sync_progress', type: 'trigger', default: true/,
    'progress synchronization remains configurable while signed out');
assert.doesNotMatch(ui, /name: 'yani_account_(?:login|logout|refresh)'/,
    'settings must not retain authorization-dependent rows after the token changes');
assert.ok(ui.includes('function localizedAuthText(key)'), 'authorization text must use the localized website helper');
assert.ok(ui.includes("hint: function () { return localizedAuthText('auth_hint'); }"), 'the authorization page must receive the shared registration hint');
assert.ok(authPage.includes("deps.hint ? deps.hint() : deps.t('auth_hint')"), 'the authorization page must render the registration and credential hint');
assert.match(authPage, /authorized = Boolean\(LampaYaniAuth\.token\(\)\)/,
    'the account page must derive authorization from the current token on every render');
assert.match(authPage, /function logout\(\)[\s\S]{0,260}LampaYaniAuth\.logout\(\)[\s\S]{0,260}render\(\)/,
    'sign-out must redraw the account page immediately');
assert.ok((authPage.match(/deps\.onAuthChanged/g) || []).length >= 3,
    'sign-in and both sign-out outcomes must refresh the settings status');
assert.ok(i18n.includes("messages.ru.settings_auth_status = 'Статус'"), 'Russian settings status label is required');
assert.ok(i18n.includes("messages.en.settings_auth_status = 'Status'"), 'English settings status label is required');
assert.ok(i18n.includes("messages.uk.settings_auth_status = 'Статус'"), 'Ukrainian settings status label is required');

console.log('auth settings contract tests passed');
