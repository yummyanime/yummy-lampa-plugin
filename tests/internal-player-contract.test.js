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
assert.ok(source.includes('LampaYaniUiUtils.internalPlayerItem'), 'internal playback must preserve normalized stream metadata');
assert.match(source, /function internalPlayerExtensionHint/);
assert.match(source, /function internalPlayerExtensionHint[\s\S]{0,260}isVkPlaybackSource/,
    'Android VK playback should receive an HLS or MP4 extension hint');
assert.match(source, /function internalPlayerExtensionHint[\s\S]{0,360}isCvhPlaybackSource/,
    'Android CVH playback should receive an MP4 extension hint');
assert.match(source, /extensionHint: extensionHint/);
assert.match(source, /extension: extensionHint/);
assert.match(source, /extensionHint === 'm3u8' \? 'application\/vnd\.apple\.mpegurl'/);
assert.doesNotMatch(source, /function internalPlayerQuality/,
    'the internal player must not cap the source quality');
assert.doesNotMatch(source, /function internalPlayerSourceUrl/,
    'the internal player must not replace the selected stream with a lower-quality URL');
assert.match(source, /function registerAndroidDirectVideoTube\(\)/);
assert.match(source, /Lampa\.PlayerVideo\.registerTube\(tube\)/,
    'CVH and VK playback must use Lampa\'s supported custom video-tube API');
assert.match(source, /okcdn\\\.ru[\s\S]{0,140}yani\\\.\(\?:mp4\|m3u8\)/,
    'the adapter must only claim resolver-confirmed OK CDN MP4 or HLS URLs');
assert.match(source, /registerAndroidDirectVideoTube\(\);/,
    'the Android direct-video adapter must be registered during plugin startup');
const tubeStart = source.indexOf('function registerAndroidDirectVideoTube');
const tubeEnd = source.indexOf('\n    function internalPlayerPlaylistItem', tubeStart);
const tubeSource = source.slice(tubeStart, tubeEnd);
assert.doesNotMatch(tubeSource, /crossorigin\s*=/i,
    'the direct video element must not enable CORS mode because the CDN omits ACAO');
assert.doesNotMatch(menu, /internalPlayerAvailable|canInternal/,
    'CVH must not be hidden from the internal-player picker');
assert.ok(internalPlayback.includes('isExternalPlayableUrl(item.url, item.source)'), 'resolved streams without a filename extension must remain in the internal playlist');
assert.ok(source.includes('isExternalPlayableUrl(current && current.url, current && current.source)'), 'the internal player must accept a resolver-confirmed CVH stream');
assert.match(source, /isCvhPlaybackSource\(url, group\)[\s\S]{0,260}cvh_stream_unavailable/,
    'a failed CVH resolution must show a source-specific error instead of opening an iframe');
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

// The built-in engine is always the one used for internal playback: letting a
// stream with headers fall through to the globally configured player was what
// broke CVH and VK, whose headers are optional. What a stream that genuinely
// needs its headers gets is a warning, decided by a flag the resolver sets.
assert.match(source, /Lampa\.Player\.runas\('lampa'\);\s*Lampa\.Player\.play\(directCurrent\);/,
    'internal playback must always use the built-in engine');
assert.match(source, /function needsRequestHeaders\(item\)[\s\S]{0,400}yani_stream_headers_required/,
    'the requirement must come from the resolver flag, not from the mere presence of headers');
assert.match(source, /listener\.follow\('error', state\.playerErrorHandler\)/,
    'the internal player must observe fatal stream errors');
assert.match(source, /function recoverInternalPlayback\(/,
    'an interrupted signed stream must have a recovery path');
assert.match(source, /LampaYaniStreamResolver\.resolve\(origin, \{force: true\}\)/,
    'recovery must bypass a stale signed-stream cache');
assert.match(source, /INTERNAL_PLAYBACK_RECOVERY_LIMIT = 3/,
    'signed streams should receive the same bounded three-attempt recovery budget as YummyTV');
assert.match(source, /state\.recoveryAttempts >= INTERNAL_PLAYBACK_RECOVERY_LIMIT/,
    'fatal-error recovery must stop after the shared attempt budget is exhausted');
assert.match(source, /state\.recoveryAttempts < INTERNAL_PLAYBACK_RECOVERY_LIMIT/,
    'the CVH stall watchdog must use the same bounded recovery budget');
// Lampa's internal player resumes only from `timeline.time` and ignores the
// playlist item's `time`, so a refreshed stream restarted the episode from zero
// on every recovery. The relaunched watcher must seek back itself.
assert.match(source, /context\.selected\.yani_resume_seek = Math\.floor\(position\);/,
    'recovery must remember where the interrupted stream stopped');
assert.match(source, /resumeSeek: Number\(context\.selected && context\.selected\.yani_resume_seek \|\| 0\)/,
    'the relaunched watcher must pick the resume position up');
assert.match(source, /if \(state\.resumeSeek > 0 && duration > 0\) \{[\s\S]{0,700}video\.currentTime = resumeTo;/,
    'the relaunched watcher must seek the recovered stream back');
const seekAt = source.indexOf('if (state.resumeSeek > 0 && duration > 0)');
const storeAt = source.indexOf('storeObservedPlayback(generation, context, state, {current: position, duration: duration}, finalState);');
assert.ok(seekAt > 0 && storeAt > seekAt, 'the seek must happen before the restart is recorded as progress');
// The per-outage budget refills after healthy playback, so a stream that keeps
// failing needs an overall cap or it is refreshed forever.
assert.match(source, /INTERNAL_PLAYBACK_RECOVERY_TOTAL_LIMIT = 8/, 'recoveries per episode must be capped');
assert.match(source, /yani_internal_recovery_total \|\| 0\) >= INTERNAL_PLAYBACK_RECOVERY_TOTAL_LIMIT\) return;/,
    'the overall cap must stop further recoveries');
assert.match(source, /if \(!options\.recovery\) \{[\s\S]{0,200}yani_internal_recovery_total = 0;[\s\S]{0,80}yani_resume_seek = 0;/,
    'a deliberate launch must start with a clean recovery state');
assert.match(source, /INTERNAL_PLAYBACK_RECOVERY_READY_SECONDS = 3/,
    'successful advancing playback should be confirmed before the retry budget is reset');
assert.match(source, /context\.selected\.yani_internal_recovery = 0/,
    'a recovered stream must receive a fresh budget for a later unrelated interruption');
assert.match(source, /CVH_STARTUP_STALL_MS = 18000/,
    'CVH playback must detect a stream that never starts');
assert.match(source, /CVH_PLAYBACK_STALL_MS = 15000/,
    'CVH playback must detect a stream that stops advancing');
assert.match(source, /isCvhPlaybackSource\(videoResolverUrl\(context\.selected\), context\.group\)/,
    'the stall watchdog must be limited to CVH');
assert.match(source, /startupStalled \|\| playbackStalled[\s\S]{0,240}recoverInternalPlayback/,
    'a detected CVH stall must use the bounded recovery path');
assert.match(source, /watched\.end_time = Math\.floor\(position\)/,
    'recovery must resume from the last observed position');
assert.ok(!/function needsRequestHeaders\(item\)[\s\S]{0,400}Object\.keys\(headers\)/.test(source),
    'the presence of headers alone must not count as a requirement');
