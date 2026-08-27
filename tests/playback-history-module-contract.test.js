const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-playback-history.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/ui-playback-history\.js/);
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
assert.match(ui, /onAuthorized: function \(\) \{[\s\S]{0,180}ensureRemoteHistory\(true\)/);
assert.match(source, /function ensureRemoteHistory\(force\)/, 'the shared account history must have a single pull entry point');
assert.match(ui, /ensureRemoteHistory\(\);/, 'the account history must be pulled when the plugin starts');

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
vm.runInNewContext(fs.readFileSync('src/episode.js', 'utf8'), context);
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

vm.runInNewContext(fs.readFileSync('src/ui-home-sections.js', 'utf8'), context);
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

console.log('playback history module contract checks passed');
