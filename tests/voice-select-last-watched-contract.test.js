const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const menuSource = fs.readFileSync('src/playback/ui-playback-menu.js', 'utf8');
const utilsSource = fs.readFileSync('src/ui/ui-utils.js', 'utf8');
const uiSource = fs.readFileSync('src/ui.js', 'utf8');

assert.match(menuSource, /function lastWatchedVoice\(voices, card\)/);
assert.match(menuSource, /function markLastWatchedVoice\(voices, card\)/);
assert.match(menuSource, /selectedVoice >= 0 \? selectedVoice : 0/);
assert.match(menuSource, /last\.selected = true/);
assert.match(menuSource, /getPreferredVoice/);
assert.match(uiSource, /yani_last_voice/);

function createMenu(overrides) {
    const shown = [];
    const context = {
        Lampa: {
            Select: {show: function () {}},
            Controller: {toggle: function () {}, collectionSet: function () {}, collectionFocus: function () {}},
            Noty: {show: function () {}},
            Loading: {start: function () {}, stop: function () {}}
        },
        LampaYaniApi: {},
        LampaYaniAuth: {token: function () { return ''; }},
        document: {querySelector: function () { return null; }, documentElement: {contains: function () { return false; }}},
        $: function () { return {length: 0, closest: function () { return {length: 0}; }}; },
        setTimeout: function (fn) { fn(); },
        console: console,
        URL: URL,
        Object: Object,
        Array: Array,
        String: String,
        Number: Number,
        Boolean: Boolean,
        Math: Math,
        Date: Date,
        Promise: Promise,
        isFinite: isFinite,
        parseFloat: parseFloat,
        JSON: JSON
    };
    context.window = context;
    vm.runInNewContext(utilsSource + '\n' + menuSource, context);
    const deps = Object.assign({
        t: function (key) { return key; },
        showYummySelect: function (params) { shown.push(params); return true; },
        getPlayback: function () { return null; },
        loadVideos: function () { return Promise.resolve({response: []}); },
        playerMatchesPreference: function (group, preference) {
            return String(group && group.player || '').toLowerCase().indexOf(String(preference || '').toLowerCase()) >= 0;
        }
    }, overrides || {});
    return {api: context.window.LampaYaniPlaybackMenu.create(deps), shown: shown};
}

(async function () {
    const videos = [
        {number: '1', video_id: 'a1', iframe_url: 'https://media.example/a1', data: {dubbing: 'Studio Band', player: 'Kodik'}},
        {number: '10', video_id: 'a10', iframe_url: 'https://media.example/a10', data: {dubbing: 'Studio Band', player: 'Kodik'}},
        {number: '1', video_id: 'b1', iframe_url: 'https://media.example/b1', data: {dubbing: 'AniLibria', player: 'Kodik'}},
        {number: '10', video_id: 'b10', iframe_url: 'https://media.example/b10', data: {dubbing: 'AniLibria', player: 'Kodik'}}
    ];

    const withHistory = createMenu({
        getPlayback: function () {
            return {number: '10', video_id: 'b10', voice: 'AniLibria', player: 'kodik'};
        },
        loadVideos: function () { return Promise.resolve({response: videos}); }
    });
    withHistory.api.openVideos({yani_id: 42, title: 'Test'});
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(withHistory.shown.length, 1, 'the voice picker must open when several dubbings exist');
    const items = withHistory.shown[0].items;
    const selected = items.filter(function (item) { return item.selected; });
    assert.strictEqual(selected.length, 1);
    assert.ok(selected[0].group.title.indexOf('AniLibria') >= 0, 'the last-watched dubbing must be selected');
    assert.ok(String(selected[0].title).indexOf('▶ ') === 0);
    assert.strictEqual(withHistory.shown[0].selected, items.indexOf(selected[0]));

    const byName = createMenu({
        getPlayback: function () {
            return {number: '10', voice: 'Studio Band', player: 'kodik'};
        },
        loadVideos: function () { return Promise.resolve({response: videos}); }
    });
    byName.api.openVideos({yani_id: 42, title: 'Test'});
    await Promise.resolve();
    await Promise.resolve();
    const named = byName.shown[0].items.filter(function (item) { return item.selected; })[0];
    assert.ok(named.group.title.indexOf('Studio Band') >= 0, 'a saved voice name must select that dubbing when video_id is missing');

    const fresh = createMenu({
        getPlayback: function () { return null; },
        loadVideos: function () { return Promise.resolve({response: videos}); }
    });
    fresh.api.openVideos({yani_id: 42, title: 'Test'});
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(fresh.shown[0].items.filter(function (item) { return item.selected; }).length, 0,
        'without playback history the picker must not preselect a dubbing');

    console.log('voice select last watched contract tests passed');
})().catch(function (error) {
    console.error(error);
    process.exit(1);
});
