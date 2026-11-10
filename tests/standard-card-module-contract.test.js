const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/cards/ui-standard-card.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/cards\/ui-standard-card\.js/);
assert.match(ui, /LampaYaniStandardCard\.create/);
assert.match(ui, /var openStandardLampaCard = standardCard\.openStandardLampaCard/);
assert.match(ui, /var installFullRating = standardCard\.installFullRating/);
assert.match(ui, /var findYummyMatches = standardCard\.findYummyMatches/);
assert.doesNotMatch(ui, /function openStandardLampaCard\(/);
assert.doesNotMatch(ui, /function findStandardLampaCard\(/);
assert.doesNotMatch(ui, /function installFullRating\(/);
assert.doesNotMatch(ui, /function findYummyMatches\(/);
assert.match(ui, /function openYummyDetail\(/);
assert.match(source, /function openStandardLampaCard\(card\)/);
assert.match(source, /function findStandardLampaCard\(card\)/);
assert.match(source, /function installFullRating\(\)/);
assert.match(source, /yani-full-rating-label/, 'native Lampa rating must use YA text, not a logo');
assert.doesNotMatch(source, /yani-full-rating-logo/, 'native Lampa rating must not render the YummyAnime mark as a tiny logo');
assert.doesNotMatch(source, /function hideJapanOriginLabels\(/, 'native Lampa cards must keep TMDB country labels');
assert.match(source, /standardNativeCacheLimit = 60/);

const context = {
    window: {
        Lampa: {
            Storage: {
                get: function () { return '{}'; },
                set: function () {}
            },
            Loading: {start: function () {}, stop: function () {}},
            Activity: {push: function () {}},
            Api: {sources: {}},
            TMDB: null,
            Listener: {follow: function () {}},
            Noty: {show: function () {}}
        },
        LampaYaniUiUtils: {
            standardSearchTitles: function () { return []; },
            normalizeMatchTitle: function (v) { return String(v || '').toLowerCase(); },
            scoreTitleMatch: function () { return 0; },
            isSafeTmdbSeasonMatch: function () { return true; },
            titleValues: function () { return []; }
        },
        LampaYaniApi: {
            detail: function () { return Promise.resolve({}); },
            search: function () { return Promise.resolve([]); },
            normalize: function () { return []; },
            malTitles: null
        }
    },
    document: {querySelector: function () { return null; }},
    $: function () {
        return {
            length: 0,
            first: function () { return this; },
            on: function () { return this; },
            prepend: function () { return this; }
        };
    },
    setTimeout: function () { return 1; },
    clearTimeout: function () {},
    console: console,
    Promise: Promise,
    Object: Object,
    Array: Array,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Math: Math,
    Date: Date,
    JSON: JSON
};
context.window.LampaYani = {};
vm.runInNewContext(source, context);

const api = context.window.LampaYaniStandardCard.create({
    t: function (key) { return key; },
    getYummyId: function (card) { return card && card.yani_id; },
    hasYummyCardData: function (value) { return !!(value && value.yani_id); },
    openYummyDetail: function () {},
    toCard: function (item) { return item; },
    formatRating: function (value) { return String(value); }
});

assert.strictEqual(api.isValidNativeId('123'), true);
assert.strictEqual(api.isValidNativeId('undefined'), false);
assert.strictEqual(api.isValidNativeId(null), false);
assert.strictEqual(api.isNativeAnimeCard({genre_ids: [16]}), true);
assert.strictEqual(api.isNativeAnimeCard({genre_ids: [18]}), false);

// --- Matching a native Lampa card to YummyAnime -------------------------
// The real normalizer: it drops scripts it does not know, so a Japanese alias
// comes back empty - and must not count as a partial match.
const utilsContext = {window: {}};
vm.runInNewContext(fs.readFileSync('src/ui/ui-utils.js', 'utf8'), utilsContext);
context.window.LampaYaniUiUtils.normalizeMatchTitle = utilsContext.window.LampaYaniUiUtils.normalizeMatchTitle;
context.window.LampaYaniUiUtils.titleValues = function (item) {
    return [item.title, item.name, item.original_title, item.original_name].filter(Boolean);
};
const tv = {alias: 'tv', name: 'Сериал'};
const film = {alias: 'movie', name: 'Полнометражный фильм'};
const ids = (list) => list.map((card) => card.yani_id).join(',');

// Original names count: the localized titles differ, the romaji one does not.
assert.strictEqual(ids(api.scoreNativeMatches(
    {name: 'Магическая битва', original_name: 'Jujutsu Kaisen', first_air_date: '2020-10-03'},
    [{yani_id: 1, title: 'Магичка', yani_titles: ['Магичка', 'Jujutsu Kaisen'], release_date: '2020', yani_type: tv}]
)), '1', 'an original title must match');

// A Japanese alias alone is not a partial match.
assert.strictEqual(api.scoreNativeMatches(
    {name: 'Гачиакута', first_air_date: '2025-07-06'},
    [{yani_id: 2, title: 'Другой тайтл', yani_titles: ['Другой тайтл', 'ガチアクタ'], release_date: '2025', yani_type: tv}]
).length, 0, 'an empty normalized alias must not match everything');

// Remakes: the same exact title years apart does not link.
assert.strictEqual(ids(api.scoreNativeMatches(
    {name: 'Hunter x Hunter', first_air_date: '2011-10-02'},
    [
        {yani_id: 3, title: 'Hunter x Hunter', yani_titles: ['Hunter x Hunter'], release_date: '1999', yani_type: tv},
        {yani_id: 4, title: 'Hunter x Hunter', yani_titles: ['Hunter x Hunter'], release_date: '2011', yani_type: tv}
    ]
)), '4', 'only the remake from the same year may link');

// A film never links to a series of the same name.
assert.strictEqual(ids(api.scoreNativeMatches(
    {name: 'Тетрадь смерти', first_air_date: '2006-10-04'},
    [
        {yani_id: 5, title: 'Тетрадь смерти', yani_titles: ['Тетрадь смерти'], release_date: '2006', yani_type: film},
        {yani_id: 6, title: 'Тетрадь Смерти', yani_titles: ['Тетрадь Смерти'], release_date: '2006', yani_type: tv}
    ]
)), '6', 'the kind must not contradict');

// A partial title needs the same year: a sequel from another year does not link.
assert.strictEqual(api.scoreNativeMatches(
    {name: 'Наруто', first_air_date: '2002-10-03'},
    [{yani_id: 7, title: 'Наруто: Ураганные хроники', yani_titles: ['Наруто: Ураганные хроники'], release_date: '2007', yani_type: tv}]
).length, 0, 'a partial title from another year must not link');

// TMDB writes "Кайдзю № 8", YummyAnime "Кайдзю номер восемь": the same title.
// The sequel and the film found by the same search must not be taken for it.
assert.strictEqual(ids(api.scoreNativeMatches(
    {name: 'Кайдзю № 8', original_name: '怪獣８号', first_air_date: '2024-04-13'},
    [
        {yani_id: 10596, title: 'Кайдзю номер восемь', yani_titles: ['Кайдзю номер восемь', 'Kaiju No. 8', '怪獣8号'], release_date: '2024', yani_type: tv},
        {yani_id: 13247, title: 'Кайдзю номер восемь 2', yani_titles: ['Кайдзю номер восемь 2'], release_date: '2025', yani_type: tv},
        {yani_id: 13831, title: 'Кайдзю номер восемь: Миссия «Разведка»', yani_titles: ['Кайдзю номер восемь: Миссия «Разведка»'], release_date: '2025', yani_type: film}
    ]
)), '10596', 'a number written as a sign, a word or digits must still match');

// Equal candidates are all returned so the viewer can choose.
assert.strictEqual(ids(api.scoreNativeMatches(
    {name: 'Тест', first_air_date: '2020-01-01'},
    [
        {yani_id: 8, title: 'Тест', yani_titles: ['Тест'], release_date: '2020', yani_type: tv},
        {yani_id: 9, title: 'Тест', yani_titles: ['Тест'], release_date: '2020', yani_type: tv}
    ]
)), '8,9', 'a tie must be offered as a choice');
// Search results carry only the main title; a card found through another
// name must be re-scored with all names from the title details.
assert.match(source, /var matches = scoreNativeMatches\(movie, cards\);\s*if \(matches\.length \|\| !cards\.length\) return matches;\s*return withAllTitles\(movie, cards\)/);
assert.match(source, /NATIVE_ALIAS_LOOKUPS = 4/, 'alias lookups must be bounded');
assert.match(source, /if \(matches\.length > 1\) \{[\s\S]{0,240}addYummyFullButton\(render, movie, anime, matches\);/);
assert.match(source, /if \(matches && matches\.length > 1\) chooseYummyMatch\(matches\);/);

// End to end: the search returns only the Russian title, the details hold
// the English one the Lampa card uses.
context.LampaYaniUiUtils = context.window.LampaYaniUiUtils;
context.LampaYaniApi = context.window.LampaYaniApi;
context.window.LampaYaniApi.search = function () {
    return Promise.resolve([{yani_id: 771, title: 'Магическая битва', yani_titles: ['Магическая битва'], release_date: '2020', yani_type: tv}]);
};
context.window.LampaYaniApi.normalize = function (payload) { return payload; };
context.window.LampaYaniApi.detail = function () {
    return Promise.resolve({response: {title: 'Магическая битва', other_titles: ['Jujutsu Kaisen', '呪術廻戦']}});
};
context.window.LampaYaniUiUtils.titleValues = function (item) {
    return [item.title, item.name, item.original_title, item.original_name].concat(item.other_titles || []).filter(Boolean);
};
api.findYummyMatches({name: 'Jujutsu Kaisen', first_air_date: '2020-10-03', id: 95479}).then(function (matches) {
    assert.strictEqual(ids(matches), '771', 'a title found through another name must link');
    console.log('standard card module contract checks passed');
}).catch(function (error) { console.error(error); process.exit(1); });
