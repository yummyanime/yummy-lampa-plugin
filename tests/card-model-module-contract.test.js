const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-card-model.js', 'utf8');
const utils = fs.readFileSync('src/ui-utils.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/ui-card-model\.js/);
assert.match(ui, /LampaYaniCardModel\.create/);
assert.match(ui, /var toCard = cardModel\.toCard/);
assert.match(ui, /var createDetailRatings = cardModel\.createDetailRatings/);
assert.doesNotMatch(ui, /function toCard\(item\)/);
assert.doesNotMatch(ui, /function watchedEpisodeCount\(item, animeId\)/);
assert.doesNotMatch(ui, /function extractRatings\(rating\)/);
assert.doesNotMatch(ui, /function mediaMeta\(item\)/);
assert.doesNotMatch(ui, /function createDetailRatings\(ratings, votes\)/);

const context = {
    window: {},
    $: function () {
        return {
            length: 0,
            append: function () { return this; },
            attr: function () { return this; },
            text: function () { return this; },
            addClass: function () { return this; }
        };
    }
};
vm.runInNewContext(utils + '\n' + source, context);

const model = context.window.LampaYaniCardModel.create({
    t: function (key) {
        return ({untitled: 'Untitled', kinopoisk: 'Kinopoisk', ratings_count: 'votes'})[key] || key;
    },
    getPlayback: function (id) {
        if (String(id) === '77') return {number: 5, duration: 100, time: 10};
        return null;
    },
    formatRating: function (value) { return Number(value).toFixed(1); },
    createRatingLogo: function () { return context.$(); }
});

const ratings = model.extractRatings({
    average: 8.4,
    kp_rating: 7.1,
    shikimori_rating: 0,
    myanimelist_rating: 8.9
});
assert.strictEqual(ratings.length, 3);
assert.strictEqual(ratings[0].key, 'yummy');
assert.strictEqual(ratings[1].key, 'kp');
assert.strictEqual(ratings[2].key, 'mal');

const media = model.mediaMeta({
    videos: [
        {quality: '1080p', data: {dubbing: 'Anilibria'}},
        {quality: '4K', data: {voice: 'Anilibria'}}
    ]
});
assert.strictEqual(media.voices, 1);
assert.strictEqual(media.quality, '4K');

assert.strictEqual(model.watchedEpisodeCount({
    episodes: {aired: 12},
    user: {list: {progress: 0.5}}
}, 1), 6);
assert.strictEqual(model.watchedEpisodeCount({}, 77), 4);

const card = model.toCard({
    anime_id: 42,
    title: 'Test Anime',
    year: 2024,
    rating: {average: 8.2, counters: 100, kp_rating: 7},
    poster: '//cdn.example/poster.jpg',
    user: {list: {list: {id: 3}, is_fav: true, watched_episodes: 2}}
});
assert.strictEqual(card.yani_id, 42);
assert.strictEqual(card.title, 'Test Anime');
assert.strictEqual(card.poster, 'https://cdn.example/poster.jpg');
assert.strictEqual(card.yani_list_id, 3);
assert.strictEqual(card.yani_is_favorite, true);
assert.strictEqual(card.yani_watched_episodes, 2);
assert.strictEqual(card.yani_ratings[0].key, 'yummy');

const sized = model.toCard({
    anime_id: 43,
    title: 'Sized',
    poster: {
        medium: 'https://img.example/medium.jpg',
        huge: 'https://img.example/huge.jpg'
    }
});
assert.strictEqual(sized.poster, 'https://img.example/huge.jpg');
assert.strictEqual(sized.img, 'https://img.example/huge.jpg');
assert.strictEqual(sized.yani_poster_full, 'https://img.example/huge.jpg');

const cardSized = model.toCard({
    anime_id: 44,
    title: 'Card sized',
    poster: {
        medium: 'https://img.example/medium.jpg',
        big: 'https://img.example/big.jpg',
        huge: 'https://img.example/huge.jpg'
    }
});
assert.strictEqual(cardSized.poster, 'https://img.example/big.jpg');
assert.strictEqual(cardSized.yani_poster_full, 'https://img.example/huge.jpg');

console.log('card model module contract checks passed');
