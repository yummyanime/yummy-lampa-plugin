const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// YummyAnime stores opening and ending marks on each video. They are used
// first, then the marks of another dubbing of the same cut, then AniSkip.

const context = {console, setTimeout, clearTimeout, Promise};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/core/episode.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('src/playback/aniskip.js', 'utf8'), context);
const skip = context.LampaYaniAniSkip;
const plain = (value) => JSON.parse(JSON.stringify(value));

const marked = {number: '3', video_id: 1, duration: 1420, skips: {opening: {time: 83, length: 89}, ending: {time: 1349, length: 71}}};
assert.deepStrictEqual(plain(skip.fromVideo(marked, 1420)), {op: {start: 83, end: 172}, ed: {start: 1349, end: 1420}});

// An opening at the very start is valid; an empty or impossible mark is not.
assert.deepStrictEqual(plain(skip.fromVideo({skips: {opening: {time: 0, length: 89}}}, 1400)), {op: {start: 0, end: 89}});
assert.deepStrictEqual(plain(skip.fromVideo({skips: {opening: {time: 0, length: 0}, ending: null}}, 1400)), {});
assert.deepStrictEqual(plain(skip.fromVideo({skips: {ending: {time: 1500, length: 90}}}, 1400)), {}, 'a mark past the end of the file belongs to another cut');
assert.deepStrictEqual(plain(skip.fromVideo({}, 1400)), {});

// Borrowed only from the same episode with the same runtime.
const unmarked = {number: '3', video_id: 2, duration: 1421};
const pool = [
    unmarked,
    {number: '4', video_id: 3, duration: 1421, skips: {opening: {time: 10, length: 80}}},
    {number: '3', video_id: 4, duration: 1500, skips: {opening: {time: 20, length: 80}}},
    marked
];
assert.deepStrictEqual(plain(skip.borrowed(unmarked, pool, 1421)), {op: {start: 83, end: 172}, ed: {start: 1349, end: 1420}});
assert.deepStrictEqual(plain(skip.borrowed({number: '3', video_id: 5, duration: 1480}, pool, 1480)), {}, 'a different cut lends nothing');

// Own marks win; AniSkip only fills the gaps.
assert.deepStrictEqual(
    plain(skip.merge({op: {start: 1, end: 2}}, {op: {start: 5, end: 6}, ed: {start: 7, end: 8}})),
    {op: {start: 1, end: 2}, ed: {start: 7, end: 8}}
);

const watcher = fs.readFileSync('src/playback/ui-playback-watcher.js', 'utf8');
assert.match(watcher, /function resolveSkipIntervals\(context, mode, length\)/);
assert.match(watcher, /var own = skip\.fromVideo \? skip\.fromVideo\(selected, length\) : \{\};/);
assert.match(watcher, /if \(complete\(intervals\)\) return intervals;[\s\S]{0,400}skip\.times\(malId, episode, length\)/,
    'AniSkip is asked only when YummyAnime marks are incomplete');
assert.match(fs.readFileSync('src/ui.js', 'utf8'), /loadTitleVideos: function \(card\) \{ return card && card\.yani_id \? videoData\.list\(card\.yani_id\)/);

console.log('YummyAnime skip mark checks passed');
