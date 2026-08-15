const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-card-renderers.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(source, /function cardOverlayPriorityPlan\(state\)/);
assert.match(source, /yani-card-view--hide-ratings/);
assert.match(source, /yani-card-view--hide-genre-top/);
assert.match(source, /yani-card-view--hide-voices/);
assert.match(source, /yani-card-view--hide-availability/);
assert.match(source, /yani-card-view--hide-update/);
assert.match(source, /yani-card-view--has-top-end/);
assert.match(css, /\.yani-card-view--has-top-end \.yani-card-media/);
assert.match(css, /\.yani-card-view--hide-ratings \.yani-card-ratings/);
assert.match(css, /\.yani-card-view--hide-update \.yani-card-update/);
assert.match(css, /\.yani-card-list[^}]*z-index: 6/);
assert.match(css, /\.yani-card-list__icon/);
assert.match(source, /function listBadgeKey\(card\)/);
assert.match(source, /yani-card-list__icon/);
assert.match(css, /\.yani-card-playback[^}]*z-index: 6/);
assert.match(css, /\.yani-card-update[^}]*z-index: 5/);

const context = {
    window: {},
    $: function () {
        return {
            length: 0,
            first: function () { return this; },
            find: function () { return this; },
            append: function () { return this; },
            addClass: function () { return this; },
            toggleClass: function () { return this; },
            text: function () { return this; },
            attr: function () { return this; },
            css: function () { return this; },
            empty: function () { return this; },
            remove: function () { return this; },
            off: function () { return this; },
            one: function () { return this; },
            end: function () { return this; }
        };
    }
};
vm.runInNewContext(source, context);
const api = context.window.LampaYaniCardRenderers.create({
    t: function (key) { return key; },
    locale: function () { return 'ru-RU'; },
    getPlayback: function () { return null; },
    mediaMeta: function () { return {}; }
});

const roomy = api.cardOverlayPriorityPlan({
    width: 240,
    height: 340,
    emWidth: 15,
    emHeight: 21,
    list: true,
    playback: true,
    progress: true,
    ratings: true,
    update: true,
    updateFreshness: true,
    availability: true,
    voices: true,
    genreTop: true,
    recommendation: true
});
assert.strictEqual(roomy.recommendation, true, 'recommendation yields to media/update');
assert.strictEqual(roomy.ratings, false);
assert.strictEqual(roomy.update, false);

const crowded = api.cardOverlayPriorityPlan({
    width: 120,
    height: 180,
    emWidth: 7.5,
    emHeight: 11,
    list: true,
    playback: true,
    progress: true,
    ratings: true,
    update: true,
    updateFreshness: true,
    availability: true,
    voices: true,
    genreTop: true
});
assert.strictEqual(crowded.ratings, true, 'ratings hide before list/progress');
assert.strictEqual(crowded.genreTop, true, 'genre top hides before fresh episode');
assert.strictEqual(crowded.voices, true, 'voice count hides before quality block when needed');
assert.strictEqual(crowded.update, false, 'fresh episode outranks quality/top/ratings');

const largeFontSameShape = api.cardOverlayPriorityPlan({
    width: 276,
    height: 414,
    emWidth: 11.5,
    emHeight: 17.25,
    list: true,
    playback: true,
    progress: true,
    ratings: true,
    update: true,
    updateFreshness: true,
    availability: true,
    voices: true,
    genreTop: true
});
assert.strictEqual(largeFontSameShape.ratings, true, 'font-scaled posters use emWidth, not raw CSS pixels');

const extreme = api.cardOverlayPriorityPlan({
    width: 96,
    height: 150,
    emWidth: 6,
    emHeight: 9.4,
    list: true,
    playback: true,
    progress: true,
    ratings: true,
    update: true,
    updateFreshness: true,
    availability: true,
    voices: true,
    genreTop: true
});
assert.strictEqual(extreme.availability, true);
assert.strictEqual(extreme.updateFreshness, true);
assert.strictEqual(extreme.update, true, 'only extreme posters drop the fresh-episode badge');

console.log('card overlay priority contract checks passed');
