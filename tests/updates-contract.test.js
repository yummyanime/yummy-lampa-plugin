const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/screens/ui-updates.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/screens\/ui-updates\.js/);
assert.match(ui, /LampaYaniUpdates\.component/);
assert.match(ui, /loadLists: loadUserListsSnapshot/);
assert.match(source, /\[0, 1, 5\]\.indexOf\(listId\(item\)\)/);
assert.match(source, /latestVideoEvents/);
assert.match(source, /event\.dub_title/);
assert.match(source, /event\.player_title/);
assert.match(source, /slice\(0, 40\)/);

const context = {window: {}};
vm.runInNewContext(source, context);
const updates = context.window.LampaYaniUpdates;
const lists = [
    {anime_id: 1, title: 'Watching', user: {list: {list: {id: 0}}}},
    {anime_id: 2, title: 'Completed', user: {list: {list: {id: 2}}}},
    {anime_id: 3, title: 'Postponed', user: {list: {list: {id: 5}}}}
];
const subscriptions = {response: [{anime: {anime_id: 4, title: 'Subscribed'}}]};
const relevant = updates.relevantTitles(lists, subscriptions);
assert.deepEqual(Object.keys(relevant).sort(), ['1', '3', '4']);

const feed = {response: {new_videos: [
    {anime_id: 1, date: 100, ep_title: 'Episode 2', dub_title: 'Dub A'},
    {anime_id: 1, date: 90, ep_title: 'Episode 1'},
    {anime_id: 4, date: 120, ep_title: 'Episode 5', player_title: 'Kodik'}
]}};
assert.equal(updates.latestVideoEvents(feed)['1'].ep_title, 'Episode 2');

const cards = updates.cards(lists, subscriptions, {response: [
    {anime_id: 1, episodes: {aired: 2, prev_date: 80}},
    {anime_id: 3, episodes: {aired: 7, next_date: 130}}
]}, feed, {
    normalize: (payload) => payload.response || [],
    toCard: (item) => ({yani_id: item.anime_id, title: item.title}),
    t: (key) => key
});
assert.deepEqual(Array.from(cards, (card) => card.yani_id), [3, 4, 1]);
assert.equal(cards[1].yani_update_label, 'Episode 5 · Kodik');
assert.equal(cards[2].yani_update_label, 'Episode 2 · Dub A');

console.log('updates contract checks passed');
