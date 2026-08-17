const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');

assert.match(ui, /var PLAYBACK_SOURCE_IDS = \['kodik', 'alloha', 'cvh', 'sibnet', 'aksor'\]/);
assert.match(ui, /function isPlaybackSourceEnabled\(sourceId\)/);
assert.match(ui, /function playbackSourceId\(group\)/);
assert.match(ui, /yani_display_sources_title/);
assert.doesNotMatch(ui, /values: \{last: t\('player_last'\), ask: t\('player_ask'\), lampa: t\('watch_internal_lampa'\)/);

['ru', 'en', 'uk'].forEach((language) => {
    ['display_sources', 'display_sources_description', 'source_visibility_description', 'no_enabled_sources'].forEach((key) => {
        assert.match(i18n, new RegExp('messages\\.' + language + '\\.' + key + '\\s*='));
    });
});

console.log('source visibility contract checks passed');
