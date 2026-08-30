const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');

assert.match(ui, /var PLAYBACK_SOURCE_IDS = \['kodik', 'vk', 'alloha', 'cvh', 'sibnet', 'aksor'\]/);
assert.match(ui, /function isPlaybackSourceEnabled\(sourceId\)/);
assert.match(ui, /function playbackSourceId\(group\)/);
assert.match(ui, /yani_display_sources_title/);
assert.match(ui, /vk: 'VK'/);
assert.match(ui, /isVkPlaybackSource\(url, group\)[\s\S]{0,200}vk_stream_unavailable/);
assert.match(ui, /if \(sourceId === 'cvh'\) return isAndroidPlatform\(\)/);
assert.match(ui, /isCvhPlaybackSource\(url, group\)[\s\S]{0,260}cvh_stream_unavailable/);
assert.match(i18n, /messages\.ru\.vk_stream_unavailable/);
assert.match(i18n, /messages\.en\.vk_stream_unavailable/);
assert.match(i18n, /messages\.uk\.vk_stream_unavailable/);
assert.match(i18n, /messages\.ru\.cvh_stream_unavailable/);
assert.match(i18n, /messages\.en\.cvh_stream_unavailable/);
assert.match(i18n, /messages\.uk\.cvh_stream_unavailable/);
assert.doesNotMatch(ui, /name: 'yani_api_check'/);
assert.doesNotMatch(ui, /name: 'yani_api_settings_title'/);
assert.doesNotMatch(ui, /values: \{last: t\('player_last'\), ask: t\('player_ask'\), lampa: t\('watch_internal_lampa'\)/);

['ru', 'en', 'uk'].forEach((language) => {
    ['display_sources', 'display_sources_description', 'source_visibility_description', 'no_enabled_sources'].forEach((key) => {
        assert.match(i18n, new RegExp('messages\\.' + language + '\\.' + key + '\\s*='));
    });
});

console.log('source visibility contract checks passed');
