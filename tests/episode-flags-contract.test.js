const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const api = fs.readFileSync('src/core/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const menu = fs.readFileSync('src/playback/ui-playback-menu.js', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');

// Filler and recap marks come from the same Tenrai pages as the episode
// thumbnails, so both must share one cached loader rather than fetch twice.
assert.match(api, /function malEpisodes\(malId\)/, 'Tenrai episode pages must have one shared loader');
assert.match(api, /episodeThumbnails: function \(malId\) \{\s*return malEpisodes\(malId\)/);
assert.match(api, /episodeFlags: function \(malId\) \{\s*return malEpisodes\(malId\)/);
assert.strictEqual((api.match(/api\.tenrai\.org\/v1', '\/anime\//g) || []).length, 1, 'Tenrai episodes must be requested from one place');

// The marks are a hint: the list waits for them only briefly, and a slow or
// failed request shows the episodes without them.
assert.match(menu, /EPISODE_FLAGS_WAIT_MS = 1500/);
assert.match(menu, /Promise\.race\(\[[\s\S]{0,200}episodeFlags\(card\)\)\.catch/);
assert.match(menu, /if \(flagLabel\) item\.subtitle = flagLabel;/);
assert.match(menu, /enrichEpisodeTitles\(card\);[\s\S]{0,200}episodeFlags\(card\);/, 'marks must be warmed before the episode list opens');
assert.match(ui, /name: 'yani_episode_flags', type: 'trigger', default: true/);
assert.match(ui, /if \(!malId\) return Promise\.resolve\(\{\}\);/, 'a card without a MAL id must not cost an extra request');
['ru', 'en', 'uk'].forEach((lang) => {
    ['episode_flags', 'episode_flags_description', 'episode_filler', 'episode_recap'].forEach((key) => {
        assert.match(i18n, new RegExp('messages\.' + lang + '\.' + key + ' = '), lang + '.' + key);
    });
});

// Behaviour of the mapping itself.
const calls = [];
const context = {
    window: {LampaYaniConfig: {apiBase: 'https://api.test'}},
    console: {log() {}, warn() {}, error() {}},
    setTimeout, clearTimeout, Promise, URL, JSON, Date, Math, Object, Array, String, Number, Boolean, encodeURIComponent
};
context.fetch = (url) => {
    calls.push(String(url));
    const page = Number(/page=(\d+)/.exec(url)[1]);
    const body = page === 1
        ? {pagination: {last_visible_page: 2}, data: [
            {mal_id: 1, filler: false, recap: false, images: {jpg: {image_url: 'https://img/1.jpg'}}},
            {mal_id: 2, filler: true, recap: false, images: {jpg: {image_url: 'https://img/2.jpg'}}}
        ]}
        : {pagination: {last_visible_page: 2}, data: [{mal_id: 3, filler: false, recap: true, images: {jpg: {}}}]};
    return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve(body), text: () => Promise.resolve(JSON.stringify(body))});
};
context.window.fetch = context.fetch;
vm.runInNewContext(api, context);
const yani = context.window.LampaYaniApi;
Promise.all([yani.episodeFlags(77), yani.episodeThumbnails(77)]).then(([flags, images]) => {
    assert.strictEqual(JSON.stringify(flags), JSON.stringify({2: {filler: true, recap: false}, 3: {filler: false, recap: true}}));
    assert.strictEqual(images['1'], 'https://img/1.jpg');
    assert.strictEqual(calls.length, 2, 'two pages fetched once for both thumbnails and flags: ' + calls.length);
    console.log('episode flags contract tests passed');
}).catch((error) => { console.error(error); process.exit(1); });
