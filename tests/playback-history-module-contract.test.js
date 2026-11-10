const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/playback/ui-playback-history.js', 'utf8');
assert.match(source, /function publishPlaybackHistoryChange\(card\)/);
assert.match(source, /persistHistory\(history\);[\s\S]{0,120}publishPlaybackHistoryChange\(card\)/);
assert.match(source, /if \(result\.imported\)[\s\S]{0,500}publishPlaybackHistoryChange\(null\)/);
assert.match(source, /\$\(document\)\.trigger\('yani:watch-progress', \[changedCard \|\| null\]\)/);
const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const watcher = fs.readFileSync('src/playback/ui-playback-watcher.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/playback\/ui-playback-history\.js/);
assert.match(ui, /LampaYaniPlaybackHistory\.create/);
assert.match(ui, /var getPlayback = playbackHistoryApi\.getPlayback/);
assert.match(ui, /var bindHistoryCardRender = playbackHistoryApi\.bindHistoryCardRender/);
assert.match(ui, /var updatePlaybackProgress = playbackHistoryApi\.updatePlaybackProgress/);
assert.doesNotMatch(ui, /function playbackHistory\(/);
assert.doesNotMatch(ui, /function bindHistoryCardRender\(/);
assert.doesNotMatch(ui, /function rememberPlayback\(/);
assert.doesNotMatch(ui, /function refreshVisiblePlaybackProgress\(/);
assert.match(source, /hover:enter\.yaniHistory click\.yaniHistory/);
assert.match(source, /yani-card-history-progress/);
assert.match(source, /function refreshVisiblePlaybackProgress/);
assert.match(source, /syncCardEpisodesMeta/);
assert.match(source, /yani:watch-progress/);
assert.match(source, /yani_playback_history/);
assert.match(source, /syncVideoWatches\(videos\)/);
assert.match(source, /function importRemoteEntries/);
assert.match(source, /function pullRemoteProgress/);
assert.match(source, /fetchHistoryRange\(window\.LampaYaniApi\.watchHistory, maximum, 30\)/);
// Signing in must refresh from the account immediately: the point of signing
// in is to see what the other devices already watched.
assert.match(ui, /onAuthorized: function \(\) \{\s*syncHistoryAfterSignIn\(\);/);
assert.match(source, /function syncHistoryAfterSignIn\(\) \{[\s\S]{0,400}ensureRemoteHistory\(true\)\.then[\s\S]{0,300}syncVideoWatches\(videos\)/,
    'after sign-in the account history is pulled first, then the local one is sent up');
assert.match(source, /function ensureRemoteHistory\(force\)/, 'the shared account history must have a single pull entry point');
assert.match(ui, /ensureRemoteHistory\(\);/, 'the account history must be pulled when the plugin starts');
assert.match(watcher, /Lampa\.PlayerVideo\.video\(\)/, 'progress must use Lampa player accessor when native playback has no DOM video');
assert.match(watcher, /listener\.follow\('timeupdate', state\.playerTimeHandler\)/, 'progress must follow Lampa player events');
assert.match(watcher, /listener\.follow\('destroy', state\.playerDestroyHandler\)/, 'the final position must be captured before Lampa destroys its media node');
assert.match(watcher, /listener\.remove\('timeupdate', state\.playerTimeHandler\)/, 'player listeners must be removed with the watcher');
assert.match(homeScreen, /yani:watch-progress\.yaniHome/, 'the dashboard must refresh when playback history changes');

const storage = {};
const context = {
    window: {
        Lampa: {
            Storage: {
                get: function (key, fallback) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : fallback; },
                set: function (key, value) { storage[key] = value; }
            },
            Noty: {show: function () {}}
        },
        LampaYaniAuth: {token: function () { return ''; }},
        LampaYaniUiUtils: {videoData: function () { return {dubbing: 'Dub'}; }},
        LampaYaniApi: {}
    },
    $: function () {
        return {
            length: 0,
            first: function () { return this; },
            find: function () { return this; },
            append: function () { return this; },
            text: function () { return this; },
            css: function () { return this; },
            end: function () { return this; },
            remove: function () { return this; },
            each: function () { return this; },
            not: function () { return this; },
            attr: function () { return this; },
            addClass: function () { return this; },
            add: function () { return this; },
            off: function () { return this; },
            on: function () { return this; }
        };
    },
    console: console,
    HTMLElement: function () {}
};
context.window.LampaYani = {};
vm.runInNewContext(fs.readFileSync('src/core/episode.js', 'utf8'), context);
vm.runInNewContext(source, context);

const api = context.window.LampaYaniPlaybackHistory.create({
    t: function (key) { return key; },
    playerKey: function () { return 'kodik'; },
    videoSourceUrl: function () { return 'https://example/stream.m3u8'; },
    addCardPlaybackProgress: function () {}
});

assert.equal(Object.keys(api.playbackHistory()).length, 0);
assert.strictEqual(api.getPlayback(1), null);

const saved = api.rememberPlayback(
    {yani_id: 42, title: 'Title', poster: 'p.jpg', yani_remote_ids: {mal_id: 1}},
    {player: 'Kodik'},
    {number: 3, video_id: 99, duration: 1200, watched: {end_time: 100}}
);
assert.strictEqual(saved.number, '3');
assert.strictEqual(saved.video_id, 99);
assert.strictEqual(saved.time, 100);
assert.strictEqual(api.getPlayback(42).player, 'kodik');
assert.ok(!api.autoProgressSyncEnabled());
const resetVideos = [
    {number: 3, video_id: 99, duration: 1200, watched: {end_time: 100}},
    {number: 3, video_id: 100, duration: 1200, watched: {end_time: 80}}
];
api.clearEpisodeProgress({yani_id: 42, yani_resume: saved}, resetVideos);
assert.strictEqual(api.getPlayback(42).time, 0);
assert.strictEqual(api.getPlayback(42).max_episode, 2);
assert.strictEqual(resetVideos[0].watched.end_time, 0);
assert.strictEqual(resetVideos[1].watched.end_time, 0);

vm.runInNewContext(fs.readFileSync('src/home/ui-home-sections.js', 'utf8'), context);
const imported = api.importRemoteEntries([{
    anime_id: 77,
    video_id: 7701,
    number: '5',
    time: 240,
    duration: 1400,
    title: 'Remote title',
    poster: 'r.jpg',
    updated_at: Date.now()
}]);
assert.strictEqual(imported.imported, 1);
assert.strictEqual(api.getPlayback(77).time, 240);
assert.strictEqual(api.getPlayback(77).number, '5');

// Signing in again sends up what this device recorded while the server was
// rejecting the session: those progress updates were answered 401 and lost.
(async () => {
    const sent = [];
    let pulls = 0;
    context.window.LampaYaniAuth = {token: function () { return 'token'; }};
    context.LampaYaniAuth = context.window.LampaYaniAuth;
    context.window.LampaYaniApi = {
        watchHistory: function () { pulls += 1; return Promise.resolve({response: []}); },
        syncVideoWatches: function (videos) { sent.push(videos); return Promise.resolve(true); }
    };
    context.LampaYaniApi = context.window.LampaYaniApi;

    const result = await api.syncHistoryAfterSignIn();
    assert.strictEqual(pulls, 1, 'the account history is pulled');
    assert.strictEqual(sent.length, 1, 'the local history is sent once');
    const ids = sent[0].map((item) => item.video_id).sort((a, b) => a - b).join(',');
    assert.strictEqual(ids, '99,7701', 'every local episode with a video id is sent');
    assert.strictEqual(sent[0].find((item) => item.video_id === 7701).time, 240);
    assert.strictEqual(result.sent, 2);

    storage.yani_auto_sync_progress = false;
    const skipped = await api.syncHistoryAfterSignIn();
    assert.strictEqual(skipped.skipped, true, 'with sync turned off nothing is sent');
    assert.strictEqual(sent.length, 1);

    console.log('playback history module contract checks passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
