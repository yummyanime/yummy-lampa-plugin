const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-standard-card.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/ui-standard-card\.js/);
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

console.log('standard card module contract checks passed');
