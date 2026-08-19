const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('src/ui.js', 'utf8');
const menu = fs.readFileSync('src/ui-playback-menu.js', 'utf8');

const watchStart = source.indexOf('function watchPlayback');
const watchEnd = source.indexOf('function nextEpisodeVideo', watchStart);
const watchPolicy = source.slice(watchStart, watchEnd);
assert.ok(watchStart >= 0 && watchEnd > watchStart, 'the playback watcher must exist');

// Auto-advance is destructive if it misfires: it would abandon an episode the
// viewer is still watching. It may only run while playback is actually moving
// towards the end of a real episode.
assert.ok(watchPolicy.includes('duration < 60 || position <= 0) return'), 'a stalled or unmeasured video must not advance');
assert.ok(watchPolicy.includes('!video.paused'), 'a paused video must not advance');
assert.ok(watchPolicy.includes('!state.advanced'), 'an episode must advance at most once');
assert.ok(/stopPlaybackWatcher\(\);\s+advanceToNextEpisode/.test(watchPolicy.replace(/\r\n/g, '\n')), 'the watcher must stop before handing over to the next episode');
assert.ok(watchPolicy.includes('video.ended'), 'the next episode must wait until the current one actually ends');
assert.match(source, /NEXT_ADVANCE_LEAD = 1/, 'auto-advance must not start several seconds before the end');
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

console.log('auto-next contract tests passed');
