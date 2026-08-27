const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-recommendations.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(build, /src\/ui-recommendations\.js/);
assert.match(ui, /LampaYaniRecommendations\.component/);
assert.match(ui, /watchHistory: LampaYaniApi\.watchHistory/);
assert.match(ui, /loadLists: loadUserListsSnapshot/);
assert.match(ui, /loadList: LampaYaniApi\.userList/);
assert.match(ui, /schedule: LampaYaniApi\.schedule/);
assert.match(ui, /feed: LampaYaniApi\.feed/);
assert.match(ui, /notifications: LampaYaniApi\.notifications/);
assert.match(ui, /detail: LampaYaniApi\.detail/);
assert.match(ui, /addCardRecommendationBadge/);
assert.match(css, /\.yani-card-recommendation/);
assert.match(source, /function personalSources/);
assert.match(source, /function eventCards/);
assert.match(source, /function relatedCards/);
assert.match(source, /slice\(0, 4\)/);
assert.doesNotMatch(source, /deps\.recommendations/);
assert.doesNotMatch(source, /sort: 'top'/);

const context = {window: {}};
vm.runInNewContext(source, context);
const recommendations = context.window.LampaYaniRecommendations;
const recent = recommendations.recentSources({
    5: {updated_at: 100, card: {title: 'Local old'}},
    8: {anime_id: 8, updated_at: 300, title: 'Local newest'}
}, {response: [
    {anime_id: 5, date: 400, title: 'Remote newer duplicate'},
    {anime_id: 9, date: 200, title: 'Remote title'}
]}, 4);

assert.deepEqual(Array.from(recent, (item) => String(item.id)), ['5', '8', '9']);
assert.equal(recent[0].title, 'Remote newer duplicate');

const personal = recommendations.personalSources({}, [], [
    {anime_id: 10, title: 'Watching', date: 300, user: {list: {list: {id: 0}}}},
    {anime_id: 11, title: 'Completed', date: 200, user: {list: {list: {id: 2}}}},
    {anime_id: 12, title: 'Dropped', date: 500, user: {list: {list: {id: 3}}}}
], {response: [{anime: {anime_id: 13, title: 'Subscribed'}}]}, 20);
assert.deepEqual(Array.from(personal, (item) => String(item.id)), ['10', '11', '13']);

const events = recommendations.eventCards(personal, {response: [
    {anime_id: 10, title: 'Watching', episodes: {aired: 5, prev_date: 300}},
    {anime_id: 11, title: 'Completed', episodes: {aired: 12, prev_date: 250}}
]}, {response: {new_videos: [
    {anime_id: 10, title: 'Watching', date: 400, number: 5, dub_title: 'Studio A'}
]}}, {response: [
    {object_id: 11, date: 500, kind: 'episode', type: 'anime_episode', title: 'Episode 12 is available with a new dub'}
]}, {
    normalize: (payload) => payload.response || [],
    normalizeNotifications: (payload) => payload.response || [],
    toCard: (item) => ({yani_id: item.anime_id, title: item.title}),
    t: (key) => key
});
assert.deepEqual(Array.from(events, (card) => String(card.yani_id)), ['11', '10']);
assert.match(events[0].yani_update_label, /^personal_new_translation/);
assert.equal(events[1].yani_update_label, 'episode 5 · Studio A');

const related = recommendations.relatedCards([
    {response: {viewing_order: [
        {anime_id: 20, title: 'Related A'},
        {anime_id: 10, title: 'Tracked duplicate'}
    ]}}
], [{id: 10, title: 'Watching'}], (item) => ({yani_id: item.anime_id, title: item.title}), (key) => key, {'10': true});
assert.deepEqual(Array.from(related, (card) => card.yani_id), [20]);
assert.equal(related[0].yani_recommendation_label, 'personal_related_to Watching');

console.log('personal feed contract checks passed');
