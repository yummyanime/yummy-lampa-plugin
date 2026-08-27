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
// A title leaves Continue Watching only when its last released episode has been
// watched. Which user list it sits in says nothing about whether there are
// unwatched episodes left, so the queue must not consult the lists at all.
assert.ok(!/fetchExcluded/.test(ui), 'the queue must not filter by user lists');
assert.ok(!/loadContinueWatchingExclusions/.test(ui), 'the user-list filter must be gone');
assert.match(ui, /function applyPlaybackSnapshot\(remoteEntries\)/);
assert.match(ui, /setPreview\(homeButtons\.continue_watching, '', ''\)/, 'empty continue queue must clear the dashboard title');
assert.match(ui, /LampaYaniApi\.watchHistory\(300, 0, control\)\.then\(LampaYaniHomeSections\.normalizeRemoteHistory\)/);
assert.match(ui, /readHomePlaybackSnapshot\(playbackUserKey\)/);
assert.match(ui, /cacheHomePlaybackSnapshot\(playbackUserKey, result\[0\]\)/);
assert.match(ui, /importRemoteEntries\(remoteEntries\)/);
assert.match(ui, /importRemote: importRemoteEntries/);
assert.match(historySource, /function pullRemoteProgress/);
assert.match(historySource, /function importVideosProgress/);
assert.match(sectionsSource, /function importRemoteIntoLocal/);
assert.match(ui, /homePlaybackCacheLifetime = 300000/);
assert.ok(!/yani_continue_excluded_/.test(ui), 'the user-list exclusion cache must be gone with the filter');
assert.ok(!/\[2, 3\]\.forEach\(function \(listId\)/.test(ui), 'membership of the completed or dropped list must not decide the queue');
assert.match(model, /window\.LampaYaniUiUtils\.posterSources/, 'poster URLs must go through the shared picker');
assert.match(fs.readFileSync('src/ui-utils.js', 'utf8'), /value\.huge/, 'large remote history posters must be supported');
assert.match(ui, /LampaYaniPlaybackHistory\.create/);
assert.match(ui, /historyCardRender: bindHistoryCardRender/);
assert.match(sectionsSource, /var limit = continueMode \? 300 : 30/);
assert.match(sectionsSource, /historyCard\(entry, deps, continueMode, loadDetail\)/);
assert.match(sectionsSource, /LampaYaniCardRails\.mapLimit\(entries, 3, mapper\)/);
assert.match(historySource, /playback\.last_watched_episode \|\| playback\.number/);
assert.match(ui, /yani_home_playback_snapshot_v2/);

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
// Current YummyAnime history rows may omit video_id and carry the episode
// number only in ep_title. They must still join local history and remain
// resumable.
const currentApi = history.normalizeRemoteHistory({response: [{
    anime_id: 56,
    date: 1720000200,
    end_time: 120,
    duration: 1400,
    title: 'Current shape',
    ep_title: '12',
    poster: {huge: 'https://img.example/current.jpg'}
}]});
assert.strictEqual(currentApi[0].video_id, '');
assert.strictEqual(currentApi[0].number, '12');
assert.strictEqual(currentApi[0].episode_title, '');
const currentMerged = history.mergeHistory({
    57: {number: '3', time: 60, duration: 1400, updated_at: 1720000300000, title: 'Local only'}
}, currentApi);
assert.deepStrictEqual(
    Array.from(history.continueWatchingEntries(currentMerged, {}, {}))
        .map((entry) => Number(entry.anime_id))
        .sort((left, right) => left - right),
    [56, 57],
    'Continue Watching must combine current API rows with local-only history'
);

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
// The queue holds titles, not episodes. Finishing episode 5 of 12 means the
// viewer is ready for episode 6, so the title stays and moves forward; it only
// leaves once its last released episode has been watched.
assert.strictEqual(continuing.length, 3, 'continue watching keeps one entry per title');
assert.strictEqual(continuing[0].anime_id, 88, 'a selected but not started episode remains a continue target');
// Ordered by recency, so the advanced title sits between the two others.
assert.strictEqual(continuing[1].anime_id, 77, 'a finished episode advances its title instead of dropping it');
assert.strictEqual(continuing[1].number, '2', 'the advanced title points at the next episode');
assert.strictEqual(continuing[1].resume_next, true, 'the advanced entry is marked as a fresh episode');
assert.strictEqual(continuing[2].video_id, 4208, 'the latest unfinished episode wins for a title');

// With the episode count known, the last one ends the title for good.
assert.strictEqual(
    history.continueWatchingEntries([
        {anime_id: 77, video_id: 7701, number: '12', time: 1390, duration: 1440, updated_at: 30}
    ], {}, {'77': 12}).length,
    0,
    'a title whose last released episode is watched leaves the queue'
);
assert.strictEqual(
    history.continueWatchingEntries([
        {anime_id: 55, video_id: 5501, number: '1', time: 1390, duration: 1440, updated_at: 30}
    ], {}, {'55': 1}).length,
    0,
    'a single-episode title does not offer a second episode'
);
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

// Continue Watching must stand on its own from the account: a title watched on
// another device has no local record here, so if the remote entries did not
// reach the queue the section would be empty on a fresh install.
const remoteOnly = history.normalizeRemoteHistory(
    JSON.parse(fs.readFileSync('tests/fixtures/yani-api/history-progress.json', 'utf8')).watch_history
);
assert.strictEqual(remoteOnly.length, 2, 'both account records must survive normalization');
const remoteQueue = history.continueWatchingEntries(history.mergeHistory({}, remoteOnly), {}, {});
assert.strictEqual(remoteQueue.length, 2, 'unfinished account records must appear without any local history');
assert.strictEqual(
    remoteQueue.map((entry) => entry.anime_id).sort().join(','),
    '10001,10002',
    'both titles from the account belong in the queue'
);

// The only thing that ends a title is having watched its last released episode.
const finishedRemote = history.continueWatchingEntries(
    history.mergeHistory({}, [{anime_id: 10003, video_id: 1, number: '3', time: 1400, duration: 1440, updated_at: 5}]),
    {},
    {'10003': 3}
);
assert.strictEqual(finishedRemote.length, 0, 'a fully watched account title stays out of the queue');

console.log('Watch history contract checks passed');
