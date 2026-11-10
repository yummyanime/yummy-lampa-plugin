const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const settingsSource = fs.readFileSync('src/ui/ui-settings.js', 'utf8');
const externalPlayer = fs.readFileSync('src/playback/ui-external-player.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

const settingsOrder = [
    "name: 'yani_settings_entry_guard'",
    "settingsSectionParam('yani_account_title'",
    "name: 'yani_account_state'",
    "settingsSectionParam('yani_interface_title'",
    "settingsSectionParam('yani_playback_title'",
    "settingsSectionParam('yani_display_sources_title'",
    "settingsSectionParam('yani_playback_services_title'",
    "settingsSectionParam('yani_lampa_card_title'",
    "settingsSectionParam('yani_home_sections_title'",
    "settingsSectionParam('yani_about_title'",
    "name: 'yani_about'",
    "name: 'yani_usage_policy'",
    "name: 'yani_repo_notice'"
].map((marker) => settingsSource.indexOf(marker));

assert.ok(settingsOrder.every((position) => position >= 0), 'every settings section must be registered');
assert.deepStrictEqual(settingsOrder, settingsOrder.slice().sort((left, right) => left - right),
    'settings sections must follow the intended TV-friendly order');
assert.match(ui, /EXPERIMENTAL_PLAYBACK_SOURCE_IDS = \['alloha', 'cvh'\]/,
    'Alloha and CVH must be treated as experimental sources');
assert.match(ui, /if \(sourceId === 'cvh'\) return isAndroidPlatform\(\) \|\| isWebOsPlatform\(\)/,
    'CVH must default to enabled on the verified Android and WebOS runtimes');
assert.match(ui, /return EXPERIMENTAL_PLAYBACK_SOURCE_IDS\.indexOf\(sourceId\) < 0/,
    'other experimental sources must retain their safe disabled default');
assert.match(settingsSource, /name: storageKey, type: 'trigger', default: playbackSourceDefaultEnabled\(sourceId\)/,
    'source switches must use their safe defaults');
assert.match(settingsSource, /experimental && triggerSettingEnabled\(value, storageKey, false\)[\s\S]{0,180}source_external_support_warning/,
    'enabling an experimental source must show a compatibility warning');
assert.match(settingsSource, /if \(isAndroidTvPlatform\(\)\) \{[\s\S]{0,260}name: 'yani_yummytv_enabled', type: 'trigger', default: false/,
    'the disabled-by-default YummyTV setting must only be registered on Android TV');
assert.match(externalPlayer, /function yummyTvEnabled\(\) \{[\s\S]{0,100}if \(!isAndroidTvPlatform\(\)\) return false/,
    'stored YummyTV state must stay inactive outside Android TV');
assert.match(settingsSource, /function settingsSectionParam\(name, label, tone, first, description\)/,
    'settings section headers must share one non-interactive decorator');
assert.match(settingsSource, /name: 'yani_settings_entry_guard', type: 'button'[\s\S]{0,240}onChange: function \(\) \{ return false; \}/,
    'the first focus target must absorb repeated OK presses without opening another screen');
assert.match(css, /\.settings-param\.yani-settings-entry-guard\.focus/,
    'the inert entry guard must still have a clear TV focus state');
['account', 'interface', 'playback', 'sources', 'integrations', 'lampa', 'home', 'about'].forEach((tone) => {
    assert.match(css, new RegExp(`yani-settings-section--${tone}`), `${tone} settings group must have a visual tone`);
});
assert.match(css, /\.settings-param\.yani-settings-section\s*\{[\s\S]{0,180}margin-top:/,
    'settings groups must have a visible vertical separator');

console.log('settings structure contract tests passed');
