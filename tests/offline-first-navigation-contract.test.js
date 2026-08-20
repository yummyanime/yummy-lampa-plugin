const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const apiSource = fs.readFileSync('src/api.js', 'utf8');
const navigation = fs.readFileSync('src/ui-navigation.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const collections = fs.readFileSync('src/ui-collections.js', 'utf8');
const schedule = fs.readFileSync('src/ui-schedule.js', 'utf8');

assert.match(apiSource, /function readCache\(key\)/);
assert.match(apiSource, /options\.cacheFirst && !options\.forceRefresh/);
assert.match(apiSource, /genres: function \(control\)[\s\S]{0,350}cacheFirst: true/);
assert.match(apiSource, /schedule: function \(control\)[\s\S]{0,350}cacheFirst: true/);
assert.match(apiSource, /collectionCatalog: function[\s\S]{0,450}cacheFirst: true/);
assert.match(apiSource, /collectionDetail: function[\s\S]{0,500}cacheFirst: true/);
assert.match(schedule, /schedule\(\{forceRefresh: forceRefresh === true\}\)/);
assert.match(navigation, /SCOPED_ROOT = '\[data-yani-navigation-scope\]'/);
assert.match(navigation, /root\(\)\.attr\('data-yani-navigation-scope', id\)/);
assert.match(navigation, /var cardKeys = \['yani_id', 'yani_collection_id', 'yani_genre_id', 'id'\]/);
assert.match(navigation, /document\.querySelector\(SCOPED_ROOT \+ ' \.selector\.focus'\)/);
assert.match(ui, /id: 'genres:'[\s\S]{0,2400}focusScope\.bind/);
assert.match(collections, /id: 'collections:'[\s\S]{0,2600}focusScope\.bind/);
assert.match(collections, /id: 'collection:'[\s\S]{0,2600}focusScope\.bind/);

const storage = {};
let fetchCalls = 0;
const window = {
    LampaYaniConfig: {
        apiBase: 'https://api.example.invalid',
        applicationToken: function () { return 'public'; },
        cacheTtl: 300000,
        cacheEntries: 20,
        requestTimeout: 1000,
        requestRetries: 0
    },
    LampaYaniI18n: {getLanguage: function () { return 'ru'; }},
    LampaYaniAuth: {token: function () { return ''; }},
    Lampa: {
        Storage: {
            get: function (key, fallback) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : fallback; },
            set: function (key, value) { storage[key] = value; },
            remove: function (key) { delete storage[key]; }
        }
    }
};
const context = {
    window: window,
    Lampa: window.Lampa,
    LampaYaniConfig: window.LampaYaniConfig,
    LampaYaniAuth: window.LampaYaniAuth,
    LampaYaniI18n: window.LampaYaniI18n,
    URLSearchParams: URLSearchParams,
    AbortController: AbortController,
    Promise: Promise,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    console: console,
    fetch: function () {
        fetchCalls++;
        return Promise.resolve({ok: true, status: 200, json: function () { return Promise.resolve({response: ['network']}); }});
    }
};

vm.runInNewContext(apiSource, context);
const api = window.LampaYaniApi;

function cache(path, data, age) {
    storage['lampa_yummyanime_cache_ru_' + path] = JSON.stringify({time: Date.now() - (age || 0), data: data});
}

(async function () {
    cache('/anime/genres', {response: [{id: 1, title: 'Cached genre'}]});
    const genres = await api.genres();
    assert.strictEqual(genres.response[0].title, 'Cached genre');
    assert.strictEqual(fetchCalls, 0, 'fresh genres must be returned without a network request');

    cache('/anime/schedule', {response: [{anime_id: 7}]});
    const schedulePayload = await api.schedule({});
    assert.strictEqual(schedulePayload.response[0].anime_id, 7);
    assert.strictEqual(fetchCalls, 0, 'fresh schedule must be returned without a network request');

    await api.schedule({forceRefresh: true});
    assert.strictEqual(fetchCalls, 1, 'manual refresh must bypass cache-first');

    console.log('offline-first and navigation contract checks passed');
})().catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
