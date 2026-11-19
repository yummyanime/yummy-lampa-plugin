const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// A native Lampa card with a Kinopoisk, Shikimori or MyAnimeList id is looked
// up through the catalog id filters before any title search.

const requests = [];
const titles = {
    7865: {anime_id: 7865, title: 'Блейм! Город, что умирает с древности', year: 2017, type: {alias: 'movie'}, remote_ids: {kp_id: 1042658, myanimelist_id: 32086, shikimori_id: 32086}},
    7670: {anime_id: 7670, title: 'Блейм!', year: 2003, type: {alias: 'ona'}, remote_ids: {kp_id: 438266, myanimelist_id: 1055, shikimori_id: 1055}},
    10661: {anime_id: 10661, title: 'Фрирен', year: 2023, type: {alias: 'tv'}, remote_ids: {kp_id: 5401195, myanimelist_id: 52991}},
    15084: {anime_id: 15084, title: 'Фрирен 2', year: 2026, type: {alias: 'tv'}, remote_ids: {kp_id: 5401195, myanimelist_id: 59978}}
};
const all = Object.keys(titles).map((id) => titles[id]);

const context = {console, Promise, setTimeout, clearTimeout, URLSearchParams};
context.window = context;
context.Lampa = {Storage: {get: (key, fallback) => fallback, set() {}}, Listener: {follow() {}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/ui/ui-utils.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('src/cards/ui-standard-card.js', 'utf8'), context);
context.LampaYaniApi = {
    catalog: (params) => {
        requests.push('catalog:' + JSON.stringify(params));
        const hits = all.filter((anime) => params.kp_ids && anime.remote_ids.kp_id === params.kp_ids ||
            params.shikimori_ids && anime.remote_ids.shikimori_id === params.shikimori_ids ||
            params.mal_ids && anime.remote_ids.myanimelist_id === params.mal_ids);
        return Promise.resolve({response: hits});
    },
    search: (query) => {
        requests.push('search:' + query);
        return Promise.resolve({response: all.filter((anime) => anime.title.toLowerCase().indexOf(String(query).toLowerCase().slice(0, 5)) >= 0)});
    },
    normalize: (payload) => payload.response || [],
    detail: (id) => Promise.resolve({response: titles[id]})
};
const toCard = (anime) => ({
    yani_id: anime.anime_id,
    title: anime.title,
    yani_titles: [anime.title],
    release_date: String(anime.year),
    yani_type: anime.type,
    yani_remote_ids: anime.remote_ids
});
const standard = context.LampaYaniStandardCard.create({toCard, t: (key) => key});
const ids = (list) => Array.from(list).map((card) => card.yani_id).join(',');

(async () => {
    // One hit by Kinopoisk id: no title search at all.
    let matches = await standard.findYummyMatches({id: 1, title: 'Блэйм!', original_title: 'BLAME!', release_date: '2017-05-20', kinopoisk_id: 1042658});
    assert.strictEqual(ids(matches), '7865');
    assert.strictEqual(requests.join(' '), 'catalog:{"limit":5,"kp_ids":1042658}');

    requests.length = 0;
    matches = await standard.findYummyMatches({id: 2, name: 'Блейм!', original_name: 'BLAME!', first_air_date: '2003-11-21', shikimori_id: 1055});
    assert.strictEqual(ids(matches), '7670');
    assert.strictEqual(requests.join(' '), 'catalog:{"limit":5,"shikimori_ids":1055}');

    // Two seasons share one Kinopoisk id: the title and year decide.
    requests.length = 0;
    matches = await standard.findYummyMatches({id: 3, name: 'Фрирен', first_air_date: '2023-09-29', kinopoisk_id: 5401195});
    assert.ok(requests[0].indexOf('kp_ids') > 0 && requests.some((request) => request.indexOf('search:') === 0),
        'an id shared by several titles falls back to the title search');
    assert.strictEqual(ids(matches), '10661');

    // No id: the title search as before.
    requests.length = 0;
    await standard.findYummyMatches({id: 4, name: 'Фрирен', first_air_date: '2023-09-29'});
    assert.ok(requests.every((request) => request.indexOf('search:') === 0));

    console.log('native id lookup checks passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
