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
