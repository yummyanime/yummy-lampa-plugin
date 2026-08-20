const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const api = fs.readFileSync('src/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const model = fs.readFileSync('src/ui-card-model.js', 'utf8');
const historySource = fs.readFileSync('src/ui-playback-history.js', 'utf8');
const menuSource = fs.readFileSync('src/ui-playback-menu.js', 'utf8');
const sectionsSource = fs.readFileSync('src/ui-home-sections.js', 'utf8');
const context = {window: {}};

vm.runInNewContext(fs.readFileSync('src/episode.js', 'utf8'), context);
vm.runInNewContext(sectionsSource, context);
const history = context.window.LampaYaniHomeSections;

assert.match(api, /watchHistory: function \(limit, offset, control\)/);
assert.match(api, /\/video\/watch-history\?limit=/);
assert.match(api, /auth: true,[\s\S]{0,40}cache: false/);
assert.match(ui, /fetchRemote: LampaYaniApi\.watchHistory/);
assert.match(menuSource, /var playback = card\.yani_resume \|\| getPlayback\(card\.yani_id\)/);
assert.match(menuSource, /String\(video\.video_id \|\| video\.id \|\| ''\) === String\(playback\.video_id\)/);
assert.match(historySource, /hover:enter\.yaniHistory click\.yaniHistory/);
assert.match(historySource, /function renderHistoryProgress|renderHistoryProgress\(rendered, playback\)/);
assert.match(ui, /function openContinueWatching\(\)/);
assert.match(ui, /mode: 'continue'/);
assert.match(historySource, /duration: Math\.max\(0, Number\(video\.duration \|\| 0\)\)/);
assert.match(ui, /fetchExcluded: loadContinueWatchingExclusions/);
assert.match(ui, /function applyPlaybackSnapshot\(remoteEntries, excludedAnimeIds\)/);
assert.match(ui, /setPreview\(homeButtons\.continue_watching, '', ''\)/, 'empty continue queue must clear the dashboard title');
assert.match(ui, /LampaYaniApi\.watchHistory\(30, 0, control\)\.then\(LampaYaniHomeSections\.normalizeRemoteHistory\)/);
assert.match(ui, /readHomePlaybackSnapshot\(playbackUserKey\)/);
assert.match(ui, /cacheHomePlaybackSnapshot\(playbackUserKey, result\[0\], result\[1\]\)/);
assert.match(ui, /importRemoteEntries\(remoteEntries\)/);
assert.match(ui, /importRemote: importRemoteEntries/);
assert.match(historySource, /function pullRemoteProgress/);
assert.match(historySource, /function importVideosProgress/);
assert.match(sectionsSource, /function importRemoteIntoLocal/);
assert.match(ui, /homePlaybackCacheLifetime = 300000/);
assert.match(ui, /if \(cached\.fresh\) return cached\.ids/, 'fresh exclusions should avoid reloading the complete user library');
assert.match(ui, /\[2, 3\]\.forEach\(function \(listId\)/, 'completed and dropped lists must be excluded');
assert.match(model, /window\.LampaYaniUiUtils\.posterSources/, 'poster URLs must go through the shared picker');
assert.match(fs.readFileSync('src/ui-utils.js', 'utf8'), /value\.huge/, 'large remote history posters must be supported');
assert.match(ui, /LampaYaniPlaybackHistory\.create/);
assert.match(ui, /historyCardRender: bindHistoryCardRender/);

const remote = history.normalizeRemoteHistory({response: [{
    anime_id: 42,
    video_id: 4207,
    date: 1720000000,
    end_time: 333,
    duration: 1440,
    title: 'Example',
    episode: 7,
    ep_title: 'Seventh',
    dub_title: 'Dub',
    player_title: 'Kodika',
    poster: {huge: 'https://img.example/poster.jpg'}
}]});

assert.strictEqual(remote.length, 1);
assert.strictEqual(remote[0].anime_id, 42);
assert.strictEqual(remote[0].video_id, 4207);
assert.strictEqual(remote[0].number, '7');
assert.strictEqual(remote[0].time, 333);
assert.strictEqual(remote[0].updated_at, 1720000000000);
assert.strictEqual(remote[0].poster, 'https://img.example/poster.jpg');

const nested = history.normalizeRemoteHistory({response: [{
    anime: {id: 55, title: 'Nested'},
    video: {id: 5501},
    watched: {end_time: 210, duration: 1400, date: 1720000100},
    episode: 4
}]});
assert.strictEqual(nested[0].anime_id, 55);
assert.strictEqual(nested[0].video_id, 5501);
assert.strictEqual(nested[0].time, 210);
assert.strictEqual(nested[0].number, '4');

const imported = history.importRemoteIntoLocal({
    42: {video_id: 4207, number: '7', time: 120, updated_at: 1710000000000, title: 'Stored'}
}, remote);
assert.strictEqual(imported.imported, 1);
assert.strictEqual(imported.history[42].time, 333, 'newer remote progress must be written into local storage');
assert.strictEqual(imported.history[42].title, 'Example');
const kept = history.importRemoteIntoLocal(imported.history, [{
    anime_id: 42, video_id: 4207, number: '7', time: 10, updated_at: 1700000000000
}]);
assert.strictEqual(kept.imported, 0, 'older remote progress must not overwrite newer local progress');

const merged = history.mergeHistory({
    42: {
        video_id: 4207,
        number: '7',
        time: 120,
        updated_at: 1710000000000,
        card: {anime_id: 42, title: 'Stored title'}
    },
    99: {video_id: 9901, number: '1', time: 15, updated_at: 1700000000000}
}, remote);

assert.strictEqual(merged.length, 2, 'matching local and remote video records must be deduplicated');
assert.strictEqual(merged[0].video_id, 4207);
assert.strictEqual(merged[0].time, 333, 'newer remote progress must win');
assert.strictEqual(merged[0].card.title, 'Stored title', 'local card metadata must survive a server merge');

const continuing = history.continueWatchingEntries([
    {anime_id: 42, video_id: 4207, number: '7', time: 333, duration: 1440, updated_at: 10},
    {anime_id: 42, video_id: 4208, number: '8', time: 45, duration: 1440, updated_at: 20},
    {anime_id: 77, video_id: 7701, number: '1', time: 1390, duration: 1440, updated_at: 30},
    {anime_id: 88, video_id: 8801, number: '2', time: 0, duration: 0, updated_at: 40}
]);
assert.strictEqual(continuing.length, 2, 'continue watching keeps one unfinished entry per title');
assert.strictEqual(continuing[0].anime_id, 88, 'a selected but not started episode remains a continue target');
assert.strictEqual(continuing[1].video_id, 4208, 'the latest unfinished episode wins for a title');
assert.strictEqual(history.isContinueEntry({anime_id: 77, video_id: 7701, time: 1390, duration: 1440}), false, 'nearly completed episodes are hidden');
assert.strictEqual(history.isContinueEntry({anime_id: 77, video_id: 7701, time: 1080, duration: 1440}), true, '75 percent remains resumable');
assert.strictEqual(history.isContinueEntry({anime_id: 77, video_id: 7701, time: 0, duration: 1440}), true, 'a just-started episode remains resumable');
assert.strictEqual(history.isContinueEntry({anime_id: 77, video_id: 7701, time: 1079, duration: 1440}), true, 'progress below 95 percent remains resumable');
assert.deepStrictEqual(
    Array.from(history.continueWatchingEntries([
        {anime_id: 42, video_id: 4208, number: '8', time: 45, duration: 1440, updated_at: 20},
        {anime_id: 88, video_id: 8801, number: '2', time: 45, duration: 1440, updated_at: 40}
    ], {'42': true})).map((entry) => entry.anime_id),
    [88],
    'completed or dropped titles must be removed after merging local and remote progress'
);
assert.strictEqual(
    history.continueWatchingEntries([
        {anime_id: 77, video_id: 7701, number: '1', time: 1390, duration: 1440, updated_at: 30}
    ], {'77': true})[0].anime_id,
    77,
    'the last watched title stays in continue watching when filters would empty the list'
);

console.log('Watch history contract checks passed');
