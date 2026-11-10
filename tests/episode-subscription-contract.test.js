const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/screens/ui-detail.js', 'utf8');

// The subscription state comes from the server, which marks every video the
// signed-in viewer is subscribed to. A flag kept on this device missed every
// subscription made on the site or another device.
assert.doesNotMatch(source, /yani_subscribed_video_/, 'subscription state must not be kept on the device');
assert.match(source, /loadVideos\(\{forceRefresh: true\}\)/, 'the choice must be made on a fresh video list');
assert.match(source, /syncSubscriptionButton\(subscribeButton, subscriptionGroups\(videos\), t\)/,
    'the button must show the server state as soon as the videos arrive');

// A plain list request can be served from the saved snapshot, whose old watch
// fields must never be imported; the label goes through the staged path that
// only draws the snapshot.
assert.match(source, /loadDetailVideos\(function \(\) \{\}\)\.then\(function \(videos\) \{\s*syncSubscriptionButton/);

const context = {window: {}, Lampa: {}, $: function () {}, console: console};
vm.runInNewContext(source, context);
const groups = context.window.LampaYaniDetail.subscriptionGroups;

const video = (id, number, player, playerId, dubbing, extra) => Object.assign({
    video_id: id, number: String(number), views: 10, data: {player: player, player_id: playerId, dubbing: dubbing}
}, extra || {});

const list = groups([
    video(1, 1, 'Плеер Kodik', 4, 'AniLibria'),
    video(2, 2, 'Плеер Kodik', 4, 'AniLibria', {views: 50}),
    video(3, 1, 'Плеер Kodik', 4, 'Studio Band', {subscribed: true}),
    video(4, 2, 'Плеер Kodik', 4, 'Studio Band'),
    video(5, 2, 'Плеер CVH', 3, 'AniLibria'),
    video(6, 3, 'Плеер CVH', 3, ''),
    {video_id: 0, number: '9', data: {player: 'Плеер VK', dubbing: 'X'}}
]);

// One entry per dubbing on one player; records without a dubbing or id are skipped.
assert.strictEqual(list.length, 3);
const kodikLibria = list.find((group) => group.player === 'Плеер Kodik' && group.dubbing === 'AniLibria');
const kodikBand = list.find((group) => group.dubbing === 'Studio Band');
const cvhLibria = list.find((group) => group.player === 'Плеер CVH');
assert.strictEqual(kodikLibria.episodes, 2);
assert.strictEqual(kodikLibria.subscribed, false);
assert.strictEqual(kodikLibria.videoId, '2', 'subscribing goes through the latest episode');
assert.strictEqual(kodikBand.subscribed, true, 'a subscription made elsewhere must be recognised');
assert.strictEqual(kodikBand.videoId, '3', 'unsubscribing goes through the record the server marks');
assert.strictEqual(cvhLibria.videoId, '5');
assert.strictEqual(list[0], kodikLibria, 'the most watched dubbing comes first');

console.log('episode subscription contract checks passed');

// --- Managing several dubbings in one visit --------------------------------
const calls = [];
const shown = [];
const notices = [];
let pending = Promise.resolve();
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
context.LampaYaniAuth = {token: () => 'token'};
context.LampaYaniApi = {
    subscribeVideo: (id) => { calls.push('+' + id); return Promise.resolve(); },
    unsubscribeVideo: (id) => { calls.push('-' + id); return Promise.resolve(); }
};
context.Lampa = {Noty: {show: (text) => notices.push(text)}, Loading: {start() {}, stop() {}}};
const button = {label: '', text(value) { this.label = value; return this; }};
const toggle = context.window.LampaYaniDetail.toggleEpisodeSubscription;

(async () => {
    toggle({yani_id: 1}, button, {
        t: (key) => key,
        loadVideos: () => Promise.resolve([
            video(1, 1, 'Плеер Kodik', 4, 'AniLibria'),
            video(2, 1, 'Плеер Kodik', 4, 'Studio Band', {subscribed: true}),
            video(3, 1, 'Плеер CVH', 3, 'AniLibria')
        ]),
        showSelect: (params) => shown.push(params)
    });
    await flush();
    let menu = shown[shown.length - 1];
    assert.strictEqual(menu.items.slice(0, 2).map((item) => item.action).join(','), 'subscribe-all,unsubscribe-all',
        'both bulk actions are offered while some dubbings are on and some off');
    assert.strictEqual(button.label, 'episode_notifications · 1', 'the button counts the dubbings that are on');

    // Subscribe to everything still off, one request at a time.
    menu.onSelect(menu.items[0]);
    await flush(); await flush(); await flush();
    assert.strictEqual(calls.slice().sort().join(','), '+1,+3', 'only the dubbings not yet subscribed are requested');
    menu = shown[shown.length - 1];
    assert.strictEqual(shown.length, 2, 'the list opens again after a change');
    assert.strictEqual(menu.items[0].action, 'unsubscribe-all');
    assert.strictEqual(menu.items.slice(1).map((item) => item.title).sort().join(','),
        '✓ AniLibria,✓ AniLibria,✓ Studio Band',
        'every dubbing is marked and only the opposite bulk action remains');
    assert.strictEqual(menu.items.filter((item) => item.selected).length, 0,
        'the subscribe-all row is gone, so no stale row keeps the focus');

    // Switch one dubbing off: the list reopens focused on that row.
    calls.length = 0;
    const row = menu.items.find((item) => item.group && item.group.dubbing === 'Studio Band');
    menu.onSelect(row);
    await flush(); await flush();
    assert.deepStrictEqual(calls, ['-2'], 'unsubscribing goes through the record the server marked');
    menu = shown[shown.length - 1];
    const focused = menu.items.filter((item) => item.selected);
    assert.strictEqual(focused.length, 1);
    assert.strictEqual(focused[0].title, 'Studio Band', 'the focus returns to the row that was switched');

    // Unsubscribe from everything.
    calls.length = 0;
    menu.onSelect(menu.items.find((item) => item.action === 'unsubscribe-all'));
    await flush(); await flush(); await flush();
    assert.strictEqual(calls.slice().sort().join(','), '-1,-3', 'only the dubbings still subscribed are requested');
    assert.strictEqual(button.label, 'episode_notifications', 'with nothing on the button shows no count');

    console.log('episode subscription list checks passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
