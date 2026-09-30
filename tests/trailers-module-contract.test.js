const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const trailers = fs.readFileSync('src/ui-trailers.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /'src\/ui-trailers\.js'[\s\S]*'src\/ui\.js'/, 'trailers module must load before the main UI');
assert.match(ui, /LampaYaniTrailers\.create\(/, 'main UI must create the trailers controller');
assert.match(ui, /openEmbedded: openEmbeddedTrailer/);
assert.match(ui, /function openEmbeddedTrailer\(url, title\)[\s\S]{0,400}component: 'yani_player'/);
assert.doesNotMatch(ui, /function TrailerList\(/, 'TrailerList implementation must stay outside the main UI monolith');
assert.match(trailers, /window\.LampaYaniTrailers\s*=\s*\{/, 'trailers module must expose a namespaced API');
assert.match(trailers, /function legacyOpenTrailers\([\s\S]*showYummySelect\(/, 'legacy selector must preserve restorable navigation');
assert.match(trailers, /openExternalVideo\(url, title, \{youtubeIntent: true\}\)/, 'YouTube trailers open in the YouTube app');
assert.match(trailers, /yaniRestore:\s*false/, 'choosing a trailer must leave the player in control');
assert.doesNotMatch(trailers, /player\.play\(\{/, 'a YouTube page must not be handed to Lampa\'s file player');
assert.match(trailers, /playEmbedded\(embed, title\)/, 'iframe trailers must open the embedded player');
assert.match(trailers, /trailer\.iframe_url/, 'Yani trailers use iframe_url');
assert.match(trailers, /trailer\.number/, 'trailer titles should prefer the API number/label');
assert.match(trailers, /t\('no_trailers'\)/);
assert.match(trailers, /function loadTrailerItems\(card\)/, 'trailers must use a shared primary and fallback loader');
assert.match(trailers, /Media\(idMal:\$id,type:ANIME\)\{trailer\{id site thumbnail\}\}/,
    'empty YummyAnime trailer responses must fall back to AniList by MAL id');
assert.match(trailers, /api\.detail\(card\.yani_id\)/,
    'fallback must recover the MAL id from title detail when a compact card does not contain it');
assert.match(trailers, /Lampa\.Controller\.collectionFocus\(/, 'standalone trailer list must remain TV-focusable');

const context = {window: {}};
vm.runInNewContext(trailers, context);
const api = context.window.LampaYaniTrailers;
assert.strictEqual(api.youtubeVideoId('https://youtube.com/embed/f5ZEiJyqDKU?enablejsapi=1'), 'f5ZEiJyqDKU');
assert.strictEqual(api.youtubeVideoId('https://www.youtube.com/embed/MGRm4IzK1SQ'), 'MGRm4IzK1SQ');
assert.strictEqual(api.youtubeVideoId('https://www.youtube.com/watch?v=MGRm4IzK1SQ'), 'MGRm4IzK1SQ');
assert.strictEqual(api.youtubeWatchUrl('https://youtu.be/MGRm4IzK1SQ'), 'https://www.youtube.com/watch?v=MGRm4IzK1SQ');
assert.match(api.youtubeEmbedUrl('MGRm4IzK1SQ'), /youtube\.com\/embed\/MGRm4IzK1SQ/);
assert.deepStrictEqual(api.normalizeTrailerItems({
    response: [{iframe_url: 'https://www.youtube.com/embed/abcABCabc12', number: 'Preview'}]
}).map(function (item) { return item.iframe_url; }), ['https://www.youtube.com/embed/abcABCabc12']);

const calls = {player: 0, embedded: [], external: 0, lastExternal: null};
var externalResult = false;
const fakeLampa = {
    Player: {
        runas: function () {},
        play: function () { calls.player += 1; }
    },
    Noty: {show: function () {}},
    Select: {show: function () {}},
    Loading: {start: function () {}, stop: function () {}},
    Controller: {add: function () {}, toggle: function () {}, collectionSet: function () {}, collectionFocus: function () {}},
    Activity: {push: function () {}},
    Scroll: function () {
        return {minus: function () {}, append: function () {}, render: function () { return {find: function () { return []; }}; }, update: function () {}, destroy: function () {}};
    }
};
const runtime = {
    URL: URL,
    window: {Lampa: fakeLampa, LampaYaniApi: {}, LampaYaniUiUtils: {
        normalizeVideoUrl: function (url) { return url || ''; },
        videoHost: function () { return 'youtube.com'; }
    }},
    Lampa: fakeLampa,
    $: function () {
        return {append: function () { return this; }, text: function () { return this; }, html: function () { return this; }, on: function () { return this; }, addClass: function () { return this; }, removeClass: function () { return this; }, remove: function () { return this; }};
    },
    console: console
};
vm.runInNewContext(trailers, runtime);
const controller = runtime.window.LampaYaniTrailers.create({
    t: function (key) { return key; },
    goBack: function () {},
    showSelect: function () {},
    openExternalVideo: function (url, title, options) {
        calls.external += 1;
        calls.lastExternal = {url: url, title: title, youtubeIntent: options && options.youtubeIntent};
        return externalResult;
    },
    openEmbedded: function (url, title) { calls.embedded.push({url: url, title: title}); return true; },
    api: {trailers: function () { return Promise.resolve({response: []}); }},
    utils: runtime.window.LampaYaniUiUtils
});
controller.openTrailer('https://youtube.com/embed/f5ZEiJyqDKU?enablejsapi=1', 'PV1');
assert.strictEqual(calls.player, 0, 'YouTube trailers must not be sent to Lampa.Player');
assert.strictEqual(calls.external, 1, 'YouTube trailers try the YouTube app first');
assert.strictEqual(calls.lastExternal.youtubeIntent, true);
assert.strictEqual(calls.embedded.length, 1, 'embedded player opens when the YouTube app is unavailable');
assert.match(calls.embedded[0].url, /youtube\.com\/embed\/f5ZEiJyqDKU/);

externalResult = true;
calls.embedded = [];
calls.external = 0;
controller.openTrailer('https://www.youtube.com/embed/MGRm4IzK1SQ', 'Preview');
assert.strictEqual(calls.external, 1);
assert.strictEqual(calls.embedded.length, 0, 'the embedded player stays closed when YouTube opens');
externalResult = false;

calls.player = 0;
fakeLampa.Player = null;
controller.openTrailer('https://iframe.example/player/1', 'Preview');
assert.deepStrictEqual(calls.embedded, [{url: 'https://iframe.example/player/1', title: 'Preview'}]);

console.log('trailers module contract checks passed');
