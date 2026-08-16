const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('src/ui.js', 'utf8');
const start = source.indexOf('function playInternalDirectVideo');
const end = source.indexOf('function playbackTargetPreference', start);
const internalPlayback = source.slice(start, end);

assert.ok(start >= 0 && end > start, 'internal playback implementation must exist');
assert.ok(internalPlayback.includes("Lampa.Player.runas('lampa')"), 'internal playback must force the Lampa engine');
assert.ok(
    internalPlayback.indexOf("Lampa.Player.runas('lampa')") < internalPlayback.indexOf('Lampa.Player.play(directCurrent)'),
    'the Lampa engine must be selected before playback starts'
);
assert.ok(internalPlayback.includes('LampaYaniUiUtils.internalPlayerItem'), 'internal playback must preserve normalized stream metadata');
assert.ok(!source.includes("playInternalPlayer(current, playlist) || openExternalPlayer(current, playlist, card)"), 'internal mode must not silently fall back to an external player');
assert.match(source, /lampa: t\('watch_internal_lampa'\)/);
assert.match(source, /get\('yani_player_preference', 'last'\) === 'lampa'\) return 'internal'/);
assert.match(source, /preference\)\.toLowerCase\(\) === 'lampa'\) return groupPlaybackPriority\(group\) > 0/);

console.log('internal-player contract tests passed');
