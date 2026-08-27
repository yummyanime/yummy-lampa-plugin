const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');

const settingsOrder = [
    "name: 'yani_account_title'",
    "name: 'yani_account_state'",
    "name: 'yani_interface_title'",
    "name: 'yani_playback_title'",
    "name: 'yani_display_sources_title'",
    "name: 'yani_playback_services_title'",
    "name: 'yani_lampa_card_title'",
    "name: 'yani_home_sections_title'",
    "name: 'yani_about_title'",
    "name: 'yani_about'",
    "name: 'yani_usage_policy'",
    "name: 'yani_repo_notice'"
].map((marker) => ui.indexOf(marker));

assert.ok(settingsOrder.every((position) => position >= 0), 'every settings section must be registered');
assert.deepStrictEqual(settingsOrder, settingsOrder.slice().sort((left, right) => left - right),
    'settings sections must follow the intended TV-friendly order');
assert.match(ui, /EXPERIMENTAL_PLAYBACK_SOURCE_IDS = \['alloha', 'cvh'\]/,
    'Alloha and CVH must be treated as experimental sources');
assert.match(ui, /function playbackSourceDefaultEnabled\(sourceId\)[\s\S]{0,180}EXPERIMENTAL_PLAYBACK_SOURCE_IDS\.indexOf\(sourceId\) < 0/,
    'experimental sources must be disabled by default');
assert.match(ui, /name: storageKey, type: 'trigger', default: playbackSourceDefaultEnabled\(sourceId\)/,
    'source switches must use their safe defaults');
assert.match(ui, /experimental && triggerSettingEnabled\(value, storageKey, false\)[\s\S]{0,180}source_external_support_warning/,
    'enabling an experimental source must show a compatibility warning');
assert.match(ui, /if \(isAndroidTvPlatform\(\)\) \{[\s\S]{0,260}name: 'yani_yummytv_enabled', type: 'trigger', default: false/,
    'the disabled-by-default YummyTV setting must only be registered on Android TV');
assert.match(ui, /function yummyTvEnabled\(\) \{[\s\S]{0,100}if \(!isAndroidTvPlatform\(\)\) return false/,
    'stored YummyTV state must stay inactive outside Android TV');

console.log('settings structure contract tests passed');
