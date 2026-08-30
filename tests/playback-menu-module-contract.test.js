const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-playback-menu.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/ui-playback-menu\.js/);
assert.match(ui, /LampaYaniPlaybackMenu\.create/);
assert.match(ui, /var openVideos = playbackMenu\.openVideos/);
assert.match(ui, /var showPlaybackSelect = playbackMenu\.showPlaybackSelect/);
assert.match(ui, /var beginPlaybackNavigation = playbackMenu\.beginPlaybackNavigation/);
assert.doesNotMatch(ui, /function openVideos\(/);
assert.doesNotMatch(ui, /function showPlaybackSelect\(/);
assert.doesNotMatch(ui, /function beginPlaybackNavigation\(/);
assert.doesNotMatch(ui, /function showYummyActions\(/);
assert.doesNotMatch(ui, /function chooseEpisode\(/);
assert.match(source, /function showPlaybackSelect\(params\)/);
assert.match(source, /function openVideos\(card, resume\)/);
assert.match(source, /function chooseEpisode\(card, group\)/);
assert.match(source, /androidExternalPlayerAvailable/);
assert.doesNotMatch(source, /internalPlayerAvailable|canInternal/,
    'the playback picker must keep the internal option available for CVH');
assert.match(source, /Tizen \/ WebOS/);
assert.match(ui, /androidExternalPlayerAvailable: function \(\) \{ return isAndroidPlatform\(\); \}/);
assert.match(ui, /registerCvhInternalVideoTube\(\);/);
assert.match(ui, /function isAndroidPlatform\(\)/);
assert.match(ui, /if \(!isAndroidPlatform\(\)\) return 'internal'/);
assert.match(ui, /yani_playback_target_locked/);
assert.match(ui, /external: t\('playback_target_external'\)/);
assert.match(fs.readFileSync('src/ui-utils.js', 'utf8'), /function isAndroidPlatform\(\)/);

const context = {
    window: {
        Lampa: {
            Select: {show: function () {}},
            Controller: {
                toggle: function () {},
                collectionSet: function () {},
                collectionFocus: function () {}
            },
            Noty: {show: function () {}},
            Loading: {start: function () {}, stop: function () {}}
        },
        LampaYaniUiUtils: {
            videoData: function () { return {}; },
            normalizeVideoUrl: function (url) { return url || ''; },
            videoHost: function () { return ''; },
            yummyTvDetailsUrl: function () { return ''; }
        },
        LampaYaniApi: {},
        LampaYaniAuth: {token: function () { return ''; }}
    },
    document: {
        querySelector: function () { return null; },
        documentElement: {contains: function () { return false; }}
    },
    $: function () {
        return {length: 0, closest: function () { return {length: 0}; }};
    },
    setTimeout: function (fn) { fn(); },
    console: console,
    Object: Object,
    Array: Array,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Math: Math,
    Date: Date,
    Promise: Promise,
    isFinite: isFinite,
    parseFloat: parseFloat
};
context.window.LampaYani = {};
context.Lampa = context.window.Lampa;
context.LampaYaniUiUtils = context.window.LampaYaniUiUtils;
vm.runInNewContext(source, context);

let shown;
const api = context.window.LampaYaniPlaybackMenu.create({
    t: function (key) { return key; },
    showYummySelect: function (params) { shown = params; return true; },
    currentControllerName: function () { return 'content'; }
});

assert.strictEqual(api.playerKey({player: 'Kodik'}), 'kodik');
assert.strictEqual(api.videoSourceUrl({iframe_url: 'https://example/a.m3u8'}), 'https://example/a.m3u8');
var episodes = [];
for (var episode = 1; episode <= 12; episode++) {
    episodes.push({
        number: String(episode),
        video_id: 'episode-' + episode,
        iframe_url: 'https://cdn.example/' + episode,
        quality: episode % 3 === 0 ? '1080p' : episode % 2 === 0 ? '720p' : '360p',
        data: {dubbing: 'Studio', player: 'CVH', player_id: 'cvh'}
    });
}
var grouped = api.groupVideos(episodes);
assert.strictEqual(Object.keys(grouped).length, 1, 'quality changes must not split one dubbing/source into multiple groups');
assert.strictEqual(grouped[Object.keys(grouped)[0]].videos.length, 12, 'all episodes must stay in the selected dubbing/source group');
assert.strictEqual(api.playbackReturnState.active, false);
api.beginPlaybackNavigation();
assert.strictEqual(api.playbackReturnState.active, true);
assert.ok(api.playbackReturnState.session > 0);
api.clearPlaybackReturn();
assert.strictEqual(api.playbackReturnState.active, false);

api.beginPlaybackNavigation();
var firstSession = api.playbackReturnState.session;
var selected = false;
api.showPlaybackSelect({
    title: 'choose',
    items: [{title: 'one'}],
    onSelect: function () { selected = true; }
});
shown.onSelect({title: 'one'});
shown.onBack();
assert.strictEqual(selected, true);
assert.strictEqual(api.playbackReturnState.active, true);
assert.strictEqual(api.playbackReturnState.session, firstSession);

console.log('playback menu module contract checks passed');
