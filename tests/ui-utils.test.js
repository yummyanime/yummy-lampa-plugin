const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {window: {}, URL};
vm.runInNewContext(fs.readFileSync('src/ui-utils.js', 'utf8'), context);
const utils = context.window.LampaYaniUiUtils;

assert.deepStrictEqual(Array.from(utils.titleValues({title: 'Покемон', aliases: ['Pokemon', {name: 'ポケモン'}]})), ['Покемон', 'Pokemon', 'ポケモン']);
assert.deepStrictEqual(Array.from(utils.titleValues({title: 'Наруто', other_titles: ['NARUTO', 'ナルト']})), ['Наруто', 'NARUTO', 'ナルト']);
assert.strictEqual(utils.normalizeMatchTitle('Ёжик: 2026'), 'ежик 2026');
assert.deepStrictEqual(Array.from(utils.standardSearchTitles({title: 'Anime (2026)', yani_titles: ['Anime']})), ['Anime (2026)', 'Anime']);
assert.strictEqual(utils.yummyTvDetailsUrl(10551), 'yummytv://details/10551');
assert.strictEqual(utils.yummyTvDetailsUrl('23365'), 'yummytv://details/23365');
assert.strictEqual(utils.yummyTvDetailsUrl(''), '');
assert.strictEqual(utils.yummyTvDetailsUrl(-1), '');
const internalItem = utils.internalPlayerItem({
    title: 'Episode 1',
    url: '//media.example/episode.m3u8',
    time: 12,
    quality: {'720p': 'https://media.example/720.m3u8'},
    headers: {Referer: 'https://example.test/'},
    poster: 'poster.jpg'
});
assert.strictEqual(internalItem.url, 'https://media.example/episode.m3u8');
assert.strictEqual(internalItem.isonline, true);
assert.strictEqual(internalItem.time, 12);
assert.strictEqual(internalItem.quality['720p'], 'https://media.example/720.m3u8');
assert.strictEqual(internalItem.headers.Referer, 'https://example.test/');
assert.strictEqual(internalItem.poster, 'poster.jpg');
assert.strictEqual(utils.internalPlayerItem({url: ''}), null);
assert.strictEqual(utils.detailRouteId({yani_id: 10551}), '10551');
assert.strictEqual(utils.detailRouteId({component: 'yani_detail', card: {anime_id: 23365}}), '23365');
assert.strictEqual(utils.detailRouteId({component: 'yani_detail', url: 'yani/detail/4912'}), '4912');
assert.strictEqual(utils.detailRouteId({component: 'yani_detail', url: '/yani/detail/title%2042?restore=1'}), 'title 42');
assert.strictEqual(utils.detailRouteId({component: 'yani_detail', id: 77}), '77');
assert.strictEqual(utils.detailRouteId({component: 'full', id: 77}), '');

const episodeStats = utils.detailEpisodeStats({
    yani_episodes: {count: 12, aired: 8},
    yani_seasons_count: 2
}, [
    {number: '1', duration: 1440, watched: {end_time: 300}},
    {number: '1', duration: 1500, watched: null},
    {number: '2', duration: 1380, watched: null}
], {number: '2', time: 90, duration: 1380});
assert.strictEqual(episodeStats.seasons, 2);
assert.strictEqual(episodeStats.total, 12);
assert.strictEqual(episodeStats.aired, 8);
assert.strictEqual(episodeStats.watched, 2, 'dubbings must not duplicate watched episodes');
assert.deepStrictEqual(JSON.parse(JSON.stringify(episodeStats.watchedNumbers)), [1, 2]);
assert.strictEqual(episodeStats.watchedLabel, '1–2');
assert.strictEqual(episodeStats.minutes, 24, 'duration must average representative unique-episode durations');
assert.strictEqual(utils.detailEpisodeStats({season: 3, episodes: {count: 1}}, [], null).seasons, 0,
    'season catalog code must not be presented as a season count');

const sparseWatched = utils.detailEpisodeStats({}, [
    {number: '10', duration: 1440, watched: {end_time: 1400}},
    {number: '13', duration: 1380, watched: {end_time: 1300}}
], null);
assert.strictEqual(sparseWatched.watched, 2);
assert.deepStrictEqual(JSON.parse(JSON.stringify(sparseWatched.watchedNumbers)), [10, 13]);
assert.strictEqual(sparseWatched.watchedLabel, '10, 13', 'sparse watched episodes must show numbers, not a sequential count');

const hundredWatched = [];
for (let episode = 1; episode <= 100; episode++) {
    hundredWatched.push({number: String(episode), duration: 1440, watched: {end_time: 1400}});
}
const hundredStats = utils.detailEpisodeStats({}, hundredWatched, null);
assert.strictEqual(hundredStats.watched, 100);
assert.strictEqual(hundredStats.watchedLabel, '1–100', 'a long consecutive run must stay a single range');
assert.strictEqual(hundredStats.watchedTitle, '1–100');

const scatteredWatched = [];
for (let episode = 1; episode <= 199; episode += 2) {
    scatteredWatched.push({number: String(episode), duration: 1440, watched: {end_time: 1400}});
}
const scatteredStats = utils.detailEpisodeStats({}, scatteredWatched, null);
assert.strictEqual(scatteredStats.watched, 100);
assert.ok(scatteredStats.watchedLabel.length <= 32, 'sparse hundred-episode lists must stay compact');
assert.ok(scatteredStats.watchedLabel.indexOf('…') >= 0);
assert.ok(scatteredStats.watchedLabel.indexOf('100') >= 0, 'truncated labels must keep the watched count');
assert.ok(scatteredStats.watchedTitle.length > scatteredStats.watchedLabel.length);
assert.strictEqual(utils.formatWatchedEpisodeNumbers([10, 13, 14, 15]), '10, 13–15');
assert.strictEqual(utils.compactWatchedEpisodeLabel([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 16).indexOf('…') >= 0, true);
assert.deepStrictEqual(JSON.parse(JSON.stringify(utils.mediaTypeInfo({name: 'Сериал', shortname: 'TV', value: 1}))),
    {key: 'series', full: 'Сериал', short: 'TV'});
assert.deepStrictEqual(JSON.parse(JSON.stringify(utils.mediaTypeInfo('short film'))),
    {key: 'short', full: '', short: ''});
assert.deepStrictEqual(JSON.parse(JSON.stringify(utils.mediaTypeInfo({name: 'OVA', shortname: 'OVA'}))),
    {key: 'ova', full: 'OVA', short: 'OVA'});
assert.deepStrictEqual(JSON.parse(JSON.stringify(utils.mediaTypeInfo(3))),
    {key: '', full: '', short: ''}, 'numeric type ids without API labels must stay hidden');

assert.strictEqual(utils.posterUrl({medium: 'https://img.example/medium.jpg', huge: 'https://img.example/huge.jpg'}), 'https://img.example/huge.jpg');
assert.strictEqual(utils.posterUrl('//cdn.example/poster.jpg'), 'https://cdn.example/poster.jpg');
assert.strictEqual(utils.posterUrl(''), '');

console.log('ui-utils tests passed');
