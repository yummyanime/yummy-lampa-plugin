const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const renderersSource = fs.readFileSync('src/ui-card-renderers.js', 'utf8');
const model = fs.readFileSync('src/ui-card-model.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const history = fs.readFileSync('src/ui-playback-history.js', 'utf8');

assert.match(renderersSource, /function visibleCardRatings\(ratings\)/);
assert.match(renderersSource, /function syncCardOverlayLayout\(element, card\)/);
assert.match(renderersSource, /yani-card-view--has-footer/);
assert.match(renderersSource, /yani-card-view--has-progress/);
assert.match(renderersSource, /if \(view\.find\('\.yani-card-ratings'\)\.length\) return/);
assert.match(renderersSource, /root\.classList\.toggle\('yani-card-view--has-footer'/);
assert.match(renderersSource, /positive\.slice\(0, 3\)/);
assert.match(history, /HISTORY_CACHE_MS = 500/);
assert.match(history, /invalidatePlaybackHistoryCache\(\)/);
assert.match(model, /filter\(function \(item\) \{ return Number\(item\.value\) > 0; \}\)/);
assert.match(model, /function createDetailRatings\(ratings, votes\)/);
assert.doesNotMatch(model, /yani-ratings__source/);
assert.match(ui, /syncCardOverlayLayout: cardRenderers\.syncCardOverlayLayout/);
assert.match(history, /syncCardOverlayLayout\(rendered\)/);

assert.match(css, /\.yani-card-ratings \{[\s\S]{0,250}display: flex/);
assert.match(css, /\.yani-card-view--has-footer \.yani-card-ratings/);
assert.match(css, /\.yani-card-view--has-progress \.yani-card-ratings/);
assert.match(css, /\.card\.focus \.yani-card-rating/);
assert.match(css, /\.yani-ratings \{[\s\S]{0,120}display: flex/);
assert.match(css, /\.yani-rating-logo \{[\s\S]{0,180}width: 1\.55em/);
assert.doesNotMatch(css, /\.yani-card-ratings \{[\s\S]{0,120}grid-template-columns: repeat\(3/);

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
vm.runInNewContext(renderersSource, context);
const api = context.window.LampaYaniCardRenderers.create({
    t: function (key) { return key; },
    locale: function () { return 'ru-RU'; },
    getPlayback: function () { return null; },
    mediaMeta: function () { return {}; }
});

const visible = api.visibleCardRatings([
    {key: 'mal', value: 8.1},
    {key: 'yummy', value: 7.4},
    {key: 'kp', value: 0},
    {key: 'shikimori', value: 9.2},
    {key: 'anidub', value: 8.8},
    {key: 'worldart', value: 7.9}
]);
assert.strictEqual(visible.length, 3);
assert.strictEqual(visible[0].key, 'yummy');
assert.strictEqual(visible[1].key, 'shikimori');
assert.strictEqual(visible[2].key, 'anidub');
assert.deepStrictEqual(api.visibleCardRatings([{key: 'kp', value: 0}]), []);


// A score should read at a glance from across the room, so the YummyAnime
// rating is banded by colour. Only that one: colouring every source would turn
// the row into a traffic light.
const utilsSource = fs.readFileSync('src/ui-utils.js', 'utf8');
assert.match(utilsSource, /function ratingTier\(value\)/, 'the band rule must live in one place');
assert.match(css, /\.yani-ratings__value--low[\s\S]{0,80}#F66/, 'below 5 is red');
assert.match(css, /\.yani-ratings__value--mid[\s\S]{0,80}#F2B800/, '5 to 7 is amber');
assert.match(css, /\.yani-ratings__value--high[\s\S]{0,80}#3CCE7B/, '7 and up is green');

const ratingCtx = {window: {}, console};
vm.runInNewContext(fs.readFileSync('src/episode.js', 'utf8'), ratingCtx);
vm.runInNewContext(utilsSource, ratingCtx);
const tier = ratingCtx.window.LampaYaniUiUtils.ratingTier;
assert.strictEqual(tier(0), '', 'an absent score gets no colour');
assert.strictEqual(tier(4.9), 'low');
assert.strictEqual(tier(5), 'mid', 'the band boundary belongs to the higher band');
assert.strictEqual(tier(6.9), 'mid');
assert.strictEqual(tier(7), 'high');
assert.strictEqual(tier(10), 'high');
console.log('unified ratings panel contract checks passed');
