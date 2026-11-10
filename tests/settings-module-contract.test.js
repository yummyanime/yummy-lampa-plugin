const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui/ui-settings.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /'src\/ui\/ui-settings\.js'[\s\S]*'src\/ui\.js'/, 'the settings module must load before the main UI');
assert.match(ui, /var settingsSection = LampaYaniSettings\.create\(\{/);
['addSettings', 'syncSettingsAuthStatus', 'settingsAuthDescription', 'openSettingsLogin', 'openAccountLogin',
    'logoutFromAccount', 'localizedAuthText', 'editLampacServer', 'editResolverServer'].forEach((name) => {
    assert.doesNotMatch(ui, new RegExp('function ' + name + '\\('), name + ' belongs to ui-settings.js');
    assert.match(source, new RegExp('function ' + name + '\\('), name + ' must live in ui-settings.js');
});
assert.doesNotMatch(ui, /var authSettingsParamDefinition\b/, 'the account settings entry belongs to the module');

// The source lists are shared with playback; the module must receive the
// same arrays rather than keep copies that could drift apart.
assert.match(ui, /playbackSourceIds: PLAYBACK_SOURCE_IDS,/);
assert.match(ui, /experimentalPlaybackSourceIds: EXPERIMENTAL_PLAYBACK_SOURCE_IDS,/);
assert.doesNotMatch(source, /\['kodik', 'vk', 'alloha'/, 'the module must not hold its own copy of the source list');

const context = {window: {}};
vm.runInNewContext(source, context);
const api = context.window.LampaYaniSettings.create({});
['addSettings', 'localizedAuthText', 'syncSettingsAuthStatus', 'openSettingsLogin', 'openAccountLogin',
    'logoutFromAccount'].forEach((name) => {
    assert.strictEqual(typeof api[name], 'function', name + ' must be exported');
});

console.log('settings module contract checks passed');
