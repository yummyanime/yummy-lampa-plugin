const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('src/ui.js', 'utf8');
const menu = fs.readFileSync('src/ui-playback-menu.js', 'utf8');
const start = source.indexOf('function playInternalDirectVideo');
const end = source.indexOf('function isAndroidPlatform', start);
const internalPlayback = source.slice(start, end > start ? end : start + 4000);

assert.ok(start >= 0, 'internal playback implementation must exist');
assert.ok(internalPlayback.includes("Lampa.Player.runas('lampa')"), 'internal playback must force the Lampa engine');
assert.ok(
    internalPlayback.indexOf("Lampa.Player.runas('lampa')") < internalPlayback.indexOf('Lampa.Player.play(directCurrent)'),
    'the Lampa engine must be selected before playback starts'
);
assert.ok(internalPlayback.includes('LampaYaniUiUtils.internalPlayerItem'), 'internal playback must preserve normalized stream metadata');
assert.ok(!source.includes("playInternalPlayer(current, playlist) || openExternalPlayer(current, playlist, card)"), 'internal mode must not silently fall back to an external player');
assert.doesNotMatch(source, /yani_player_preference', 'last'\) === 'lampa'\) return 'internal'/);
assert.match(source, /function migrateLegacyPlayerPreference/);
assert.match(source, /yani_source_/);
assert.match(source, /display_sources/);
assert.match(source, /yani_playback_target_locked/);
assert.match(source, /player_preference_non_android/);
assert.match(source, /if \(!isAndroidPlatform\(\)\) return 'internal'/);
assert.match(source, /isAndroidPlatform\(\)\) \{\s*Lampa\.SettingsApi\.addParam\(\{[\s\S]{0,400}yani_playback_target/);
assert.match(menu, /isPlaybackSourceEnabled\(playbackSourceId\(voice\.group\)\)/);
assert.match(menu, /t\('source'\)/);
assert.match(menu, /t\('no_enabled_sources'\)/);

console.log('internal-player contract tests passed');

