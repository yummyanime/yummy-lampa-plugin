const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const playbackLaunch = fs.readFileSync('src/playback/ui-playback-launch.js', 'utf8');
const settingsSource = fs.readFileSync('src/ui/ui-settings.js', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');

assert.match(settingsSource, /name: 'yani_add_to_lampa_history', type: 'trigger', default: true/,
    'Lampa history integration must be enabled by default');
assert.match(playbackLaunch, /function lampaHistoryEnabled\(\)/);
assert.match(playbackLaunch, /findStandardLampaCard\(card\)/,
    'history must use a native Lampa card instead of treating a YummyAnime id as TMDB');
assert.match(playbackLaunch, /Lampa\.Favorite\.add\('history', nativeCard\)/);
assert.match(playbackLaunch, /function launchResolvedVideo[\s\S]{0,1100}addToLampaHistory\(card\)/,
    'internal and external playback must update Lampa history');
assert.match(playbackLaunch, /function openEmbeddedEpisode[\s\S]{0,500}addToLampaHistory\(card\)/,
    'embedded playback must update Lampa history');
['ru', 'en', 'uk'].forEach(function (language) {
    assert.match(i18n, new RegExp('messages\\.' + language + '\\.add_to_lampa_history\\s*='));
    assert.match(i18n, new RegExp('messages\\.' + language + '\\.add_to_lampa_history_description\\s*='));
});

console.log('Lampa history setting contract checks passed');
