const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {window: {}, URL};
vm.runInNewContext(fs.readFileSync('src/episode.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('src/ui-utils.js', 'utf8'), context);
const utils = context.window.LampaYaniUiUtils;

assert.deepStrictEqual(Array.from(utils.titleValues({title: 'Покемон', aliases: ['Pokemon', {name: 'ポケモン'}]})), ['Покемон', 'Pokemon', 'ポケモン']);
assert.deepStrictEqual(Array.from(utils.titleValues({title: 'Наруто', other_titles: ['NARUTO', 'ナルト']})), ['Наруто', 'NARUTO', 'ナルト']);
assert.deepStrictEqual(Array.from(utils.titleValues({title: 'Наруто', other_titles: {en: 'NARUTO', ja: 'ナルト'}})), ['Наруто', 'NARUTO', 'ナルト']);
assert.strictEqual(utils.normalizeMatchTitle('Ёжик: 2026'), 'ежик 2026');
assert.strictEqual(utils.isAndroidPlatform(), false);
const androidContext = {window: {Lampa: {Platform: {is: function (name) { return name === 'android'; }, get: function () { return 'android'; }}}}};
vm.runInNewContext(fs.readFileSync('src/ui-utils.js', 'utf8'), androidContext);
assert.strictEqual(androidContext.window.LampaYaniUiUtils.isAndroidPlatform(), true);
assert.deepStrictEqual(Array.from(utils.standardSearchTitles({title: 'Anime (2026)', yani_titles: ['Anime']})), ['Anime', 'Anime (2026)']);
assert.deepStrictEqual(Array.from(utils.standardSearchTitles({
    title: 'Белого мага, изгнанного из команды героев',
    yani_titles: ['The Banished Former Hero Lives as He Pleases', '追放された白魔導士']
}))[0], 'The Banished Former Hero Lives as He Pleases');
assert.ok(utils.scoreTitleMatch(
    ['The Banished Former Hero Lives as He Pleases', 'Белого мага, изгнанного из команды героев'],
    '2025',
    {name: 'The Banished Former Hero Lives as He Pleases', first_air_date: '2025-01-10'}
) >= 100);
assert.ok(utils.scoreTitleMatch(
    ['белого мага изгнанного из команды героев подобрал авантюрист ранга s'],
    '2025',
    {name: 'Белого мага, изгнанного из команды героев', first_air_date: '2024-10-01'}
) >= 70);
assert.strictEqual(utils.stripSeasonSuffix('Grand Blue 2'), 'Grand Blue');
assert.strictEqual(utils.stripSeasonSuffix('Grand Blue Season 2'), 'Grand Blue');
assert.strictEqual(utils.stripSeasonSuffix('Mob Psycho 100'), 'Mob Psycho 100');
assert.ok(utils.standardSearchTitles({title: 'Grand Blue 2', yani_titles: ['Grand Blue 2']}).indexOf('Grand Blue') >= 0);
assert.ok(utils.scoreTitleMatch(
    ['Grand Blue 2', 'Grand Blue'],
    '2025',
    {name: 'Grand Blue Dreaming', first_air_date: '2018-07-14'}
) >= 70, 'YummyAnime season titles must still match the parent TMDB series');
assert.strictEqual(utils.parseSeasonHint('Grand Blue 2'), 2);
assert.strictEqual(utils.parseSeasonHint('Grand Blue Season 2'), 2);
assert.strictEqual(utils.parseSeasonHint('Mob Psycho 100'), 0);
assert.strictEqual(utils.isSafeTmdbSeasonMatch(
    {title: 'Grand Blue 2', release_date: '2025', yani_titles: ['Grand Blue 2']},
    {name: 'Grand Blue Dreaming', first_air_date: '2018-07-14'}
), false, 'must not open the 2018 TMDB series as if it were season 2');
assert.strictEqual(utils.isSafeTmdbSeasonMatch(
    {title: 'Grand Blue', release_date: '2018', yani_titles: ['Grand Blue']},
    {name: 'Grand Blue Dreaming', first_air_date: '2018-07-14'}
), true);
assert.strictEqual(utils.isSafeTmdbSeasonMatch(
    {title: 'Grand Blue 2', release_date: '2025', yani_titles: ['Grand Blue Season 2']},
    {name: 'Grand Blue Season 2', first_air_date: '2025-07-07'}
), true);
assert.ok(utils.scoreTitleMatch(
    ['Grand Blue 2'],
    '2025',
    {name: 'Blue Period', first_air_date: '2021-10-02'}
) < 70, 'a shared short word must not match an unrelated TMDB title');
assert.ok(utils.scoreTitleMatch(
    ['Класс убийц', 'Assassination Classroom'],
    '2015',
    {title: 'Клуб убийц', release_date: '2015-01-01', original_language: 'ru'}
) < 70, 'near-miss Russian titles with the same year must not open live-action');
assert.ok(utils.scoreTitleMatch(
    ['Класс убийц', 'Assassination Classroom'],
    '2015',
    {name: 'Assassination Classroom', first_air_date: '2015-01-09', original_language: 'ja', genre_ids: [16, 35]}
) >= 100, 'Assassination Classroom must still match its TMDB anime series');
assert.strictEqual(utils.isAnimeTmdbCard({
    title: 'Клуб убийц',
    original_language: 'ru',
    genre_ids: [53, 80]
}), false);
assert.strictEqual(utils.isAnimeTmdbCard({
    name: 'Assassination Classroom',
    original_language: 'ja',
    genre_ids: [16, 35]
}), true);
assert.ok(utils.titleTokenJaccard('класс убийц', 'клуб убийц') < 0.6);
assert.ok(utils.titleEditSimilarity('класс убийц', 'клуб убийц') < 0.88);
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
    {number: '1', duration: 1440, watched: {end_time: 1400}},
    {number: '1', duration: 1500, watched: null},
    {number: '2', duration: 1380, watched: null}
], {number: '2', time: 1350, duration: 1380});
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
    {number: '13', duration: 1380, watched: {end_time: 1330}}
], null);
assert.strictEqual(sparseWatched.watched, 2);
assert.deepStrictEqual(JSON.parse(JSON.stringify(sparseWatched.watchedNumbers)), [10, 13]);
assert.strictEqual(sparseWatched.watchedLabel, '10, 13', 'sparse watched episodes must show numbers, not a sequential count');

// Card and title counters treat more than 30 seconds as a watched episode.
// Finishing the episode (95%) is a separate rule for Continue Watching.
const barelyStarted = utils.detailEpisodeStats({}, [
    {number: '4', duration: 1440, watched: {end_time: 20}},
    {number: '5', duration: 1440, watched: {end_time: 1370}}
], null);
assert.strictEqual(barelyStarted.watched, 1, '20 seconds is not a watch');
assert.deepStrictEqual(JSON.parse(JSON.stringify(barelyStarted.watchedNumbers)), [5]);
assert.strictEqual(utils.detailEpisodeStats({}, [
    {number: '4', duration: 1440, watched: {end_time: 31}}
], null).watched, 1, 'more than 30 seconds counts as watched');
assert.strictEqual(utils.isEpisodeProgressCounted(31, 1440), true);
assert.strictEqual(utils.isEpisodeProgressCounted(30, 1440), false);
assert.strictEqual(utils.isEpisodeFinished(1370, 1440), true);
assert.strictEqual(utils.isEpisodeFinished(300, 1440), false);
assert.strictEqual(utils.isEpisodeFinished(300, 0), false, 'an unknown duration cannot prove a watch');
assert.strictEqual(utils.isEpisodeFinished(0, 1440, {completed: true}), true, 'an explicit completion flag wins');

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
assert.strictEqual(utils.posterUrl({
    medium: 'https://img.example/medium.jpg',
    big: 'https://img.example/big.jpg',
    huge: 'https://img.example/huge.jpg'
}, 'card'), 'https://img.example/big.jpg');
assert.strictEqual(utils.posterSources({
    medium: 'https://img.example/medium.jpg',
    big: 'https://img.example/big.jpg',
    huge: 'https://img.example/huge.jpg'
}).full, 'https://img.example/huge.jpg');
assert.strictEqual(utils.posterUrl('//cdn.example/poster.jpg'), 'https://cdn.example/poster.jpg');
assert.strictEqual(utils.posterUrl(''), '');
assert.strictEqual(utils.yummyRatingValue({yani_ratings: [{key: 'yummy', value: 8.6}]}), 8.6);
assert.strictEqual(utils.yummyRatingValue({yani_rating: 7.1}), 7.1);
assert.strictEqual(utils.yummyRatingValue({yani_ratings: [{key: 'kp', value: 8}]}), 0);

console.log('ui-utils tests passed');
