const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-home-insights.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(build, /src\/ui-home-insights\.js/);
assert.match(ui, /LampaYaniHomeInsights\.dashboard\(\{/);
assert.match(ui, /schedule: function \(\) \{ return LampaYaniApi\.schedule\(requestControl\); \}/);
assert.match(ui, /refreshEpisodeDashboard = function \(\) \{ return refreshDashboardInsights\(true\); \}/);
assert.match(ui, /yani-home__count/);
assert.match(ui, /yani-home__item-insight/);
assert.match(ui, /LampaYaniHomeInsights\.personalInsight/);
assert.match(ui, /LampaYaniApi\.userListStats\(account\.user_id, homeRequestControl\(\)\)/);
assert.match(ui, /yani_home_list_counts/);
assert.match(ui, /!homeListCountsFresh\(account\.user_id\)/);
assert.match(ui, /if \(destroyed\) return/);
assert.match(ui, /count > 99 \? '99\+' : String\(count\)/);
assert.match(css, /\.yani-home__count--visible/);
assert.match(css, /\.yani-home__item\.focus \.yani-home__count/);
assert.match(css, /\.yani-home__item-insight-title/);
assert.match(css, /\.yani-home__episode-timeline/);
assert.match(css, /\.yani-home__episode-stage--waiting/);

const context = {window: {}};
vm.runInNewContext(source, context);
const insights = context.window.LampaYaniHomeInsights;
const result = insights.counts({response: {
    new: [{anime_id: 1}, {anime_id: 2}, {anime_id: 2}],
    new_videos: [{anime_id: 1}, {anime_id: 1}, {anime_id: 3}, {}],
    collections: [{id: 7}, {id: 8}, {id: 7}]
}});

assert.equal(result.new_releases, 2);
assert.equal(result.new_translations, 2);
assert.equal(result.collections, 2);

const now = new Date(2026, 7, 11, 10, 0, 0).getTime();
const schedule = insights.scheduleInsight({response: [
    {anime_id: 10, title: 'Morning anime', episodes: {aired: 2, count: 12, next_date: (now + 3600000) / 1000}},
    {anime_id: 11, title: 'Evening anime', episodes: {aired: 7, count: 24, next_date: (now + 7200000) / 1000}}
]}, now);
assert.equal(schedule.today, 2);
assert.equal(schedule.preview.title, 'Morning anime');
assert.equal(schedule.preview.episode, 3);

const translations = insights.translationInsight({response: {new_videos: [
    {anime_id: 4, date: 100, anime: {title: 'Older'}},
    {anime_id: 5, date: 300, anime: {title: 'Newest'}, ep_title: 'Episode 4', dub_title: 'Dub'},
    {anime_id: 5, date: 200, anime: {title: 'Newest'}}
]}});
assert.equal(translations.count, 2);
assert.equal(translations.preview.title, 'Newest');
assert.equal(translations.preview.episode, 'Episode 4');

const discovery = insights.discoveryInsights({response: {
    new: [{anime_id: 42, title: 'Newest release', year: 2026, type: 'TV', updated_at: 200}],
    collections: [{id: 7, title: 'Weekend picks', anime_count: 12}]
}});
assert.equal(discovery.new_release.anime_id, 42);
assert.equal(discovery.new_release.year, '2026');
assert.equal(discovery.collection.id, 7);
assert.equal(discovery.collection.count, 12);

const flow = insights.episodeFlow({response: [
    {anime_id: 10, title: 'Awaiting dub', episodes: {aired: 2, count: 12, prev_date: (now - 3600000) / 1000, next_date: (now + 86400000) / 1000}},
    {anime_id: 11, title: 'Next broadcast', episodes: {aired: 4, count: 12, next_date: (now + 1800000) / 1000}}
]}, {response: {new_videos: [
    {anime_id: 10, date: (now - 7200000) / 1000, anime: {title: 'Awaiting dub'}, ep_title: 'Episode 1', dub_title: 'Old dub'},
    {anime_id: 7, date: (now - 1000) / 1000, anime: {title: 'Available now'}, ep_title: 'Episode 5', dub_title: 'Fresh dub'}
]}}, now);
assert.equal(flow.japan.title, 'Next broadcast');
assert.equal(flow.waiting.title, 'Awaiting dub');
assert.equal(flow.waiting.episode, 2);
assert.equal(flow.waiting.status, 'waiting');
assert.equal(flow.available.title, 'Available now');
assert.equal(flow.available.episode, 5);

const personal = insights.personalInsight([
    {title: 'Older', number: '2', updated_at: 100},
    {title: 'Newest', number: '5', updated_at: 300}
], {display_name: 'codeman'}, {response: [
    {list: {id: 0}, count: 4},
    {list: {id: 1}, anime_count: 6},
    {list: {id: 2}, total: 20},
    {list: {id: 4}, count: 3},
    {list: {id: 5}, items_count: 2}
]});
assert.equal(personal.continue_count, 2);
assert.equal(personal.continue_preview.title, 'Newest');
assert.equal(personal.account_name, 'codeman');
assert.equal(personal.list_total, 32);
assert.equal(personal.tracked_total, 12);
assert.equal(personal.lists.favorites, 3);

console.log('home insights contract checks passed');
