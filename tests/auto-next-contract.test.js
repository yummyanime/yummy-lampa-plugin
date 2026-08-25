const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('src/ui.js', 'utf8');
const menu = fs.readFileSync('src/ui-playback-menu.js', 'utf8');

const watchStart = source.indexOf('function advancePlaybackWatcher');
const watchEnd = source.indexOf('function nextEpisodeVideo', watchStart);
const watchPolicy = source.slice(watchStart, watchEnd);
assert.ok(watchStart >= 0 && watchEnd > watchStart, 'the playback watcher must exist');

// Auto-advance is destructive if it misfires: it would abandon an episode the
// viewer is still watching. It may only run while playback is actually moving
// towards the end of a real episode.
assert.ok(watchPolicy.includes('duration < 60 || position <= 0) return'), 'a stalled or unmeasured video must not advance');
assert.ok(watchPolicy.includes('!state.advanced'), 'an episode must advance at most once');
assert.ok(/stopPlaybackWatcher\(\);\s+advanceToNextEpisode/.test(watchPolicy.replace(/\r\n/g, '\n')), 'the watcher must stop before handing over to the next episode');
assert.ok(watchPolicy.includes('video.ended'), 'the next episode must wait until the current one actually ends');
assert.match(watchPolicy, /addEventListener\('ended', state\.endedHandler\)/, 'auto-next must follow the exact ended event');
assert.match(watchPolicy, /removeEventListener\('ended', state\.endedHandler\)/, 'replaced player listeners must be detached');
assert.match(watchPolicy, /playbackWatcher !== state/, 'stale watcher ticks must not control a newer player');
assert.doesNotMatch(watchPolicy, /remaining <= NEXT_ADVANCE_LEAD/, 'auto-advance must never overlap the ending player');
assert.match(source, /playerVideoElement\(state\.video\)/, 'each watcher must remain attached to its own video element');
assert.match(source, /if \(!element\.ended[\s\S]{0,100}return element/, 'a new watcher must ignore finished videos left in the DOM');
assert.match(source, /flushPlaybackProgress\(true, callbackContext\)/, 'Lampa callbacks must be scoped to the episode that registered them');
assert.match(source, /expectedContext !== playbackContext/, 'a stale player callback must not stop the next episode watcher');
assert.match(source, /autoNextEnabled\(\) && current \? \[current\] : playlist/, 'Lampa playlist autoplay must not skip an extra episode while plugin auto-next is on');

const prefetchStart = source.indexOf('function prefetchNextEpisode');
const prefetchEnd = source.indexOf('function advanceToNextEpisode', prefetchStart);
const prefetchPolicy = source.slice(prefetchStart, prefetchEnd);
assert.ok(prefetchStart >= 0 && prefetchEnd > prefetchStart, 'the prefetch must exist');
assert.ok(prefetchPolicy.includes('if (!next || next.yani_stream_url) return'), 'an already-resolved episode must not be resolved again');
assert.ok(prefetchPolicy.includes('LampaYaniStreamResolver.canResolve(url)'), 'only resolvable sources may be prefetched');

// The dialog asking where to play belongs to a deliberate launch. An automatic
// episode change must continue in the player that is already running.
assert.ok(
    menu.includes("var target = options && options.autoAdvance ? 'internal' : playbackTargetPreference();"),
    'auto-advance must bypass the playback target dialog'
);
assert.ok(
    source.includes("Lampa.Storage.get('yani_auto_next', false)"),
    'auto-advance must default to disabled'
);

// Starting the next episode on top of a running player leaves the previous
// <video> and its MediaSource alive, because Lampa only releases the player it
// considers current. Measured on a TV: one stranded decoder per advance, and
// the renderer dies after eight to ten of them.
const advanceStart = source.indexOf('function advanceToNextEpisode');
const advanceEnd = source.indexOf('function externalPlayablePlaylist', advanceStart);
const advancePolicy = source.slice(advanceStart, advanceEnd);
assert.ok(advanceStart >= 0 && advanceEnd > advanceStart, 'the advance step must exist');
assert.match(source, /function finishAutoNextPlayback\(context\)/);
assert.match(source, /if \(!next\) \{\s*finishAutoNextPlayback\(context\);\s*return;/);
assert.match(source, /t\('auto_next_last_voice'\)/);
assert.match(source, /t\('auto_next_last_title'\)/);
assert.ok(source.slice(source.indexOf('function finishAutoNextPlayback'), source.indexOf('function advanceToNextEpisode')).includes('closeInternalPlayer();'), 'the last episode must close the player');
assert.ok(source.slice(source.indexOf('function finishAutoNextPlayback'), source.indexOf('function advanceToNextEpisode')).includes('restorePlaybackInteraction();'), 'the last episode must return to the title card');
assert.ok(advancePolicy.includes('closeInternalPlayer();'), 'the running player must be closed before the next episode opens');
assert.ok(
    advancePolicy.indexOf('closeInternalPlayer();') < advancePolicy.indexOf('launchVideo('),
    'the close must happen before the launch, not after it'
);
assert.ok(
    advancePolicy.indexOf('beginPlaybackNavigation();') < advancePolicy.indexOf('closeInternalPlayer();'),
    'the return session must be bumped first so closing does not steal focus back to the detail page'
);
assert.ok(source.includes('Lampa.Player.close'), 'closing must go through the player API');

console.log('auto-next contract tests passed');
