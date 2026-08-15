const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const api = fs.readFileSync('src/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const collections = fs.readFileSync('src/ui-collections.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(api, /collectionCatalog: function/);
assert.match(api, /request\('\/collection\?limit='/);
assert.match(api, /collectionDetail: function/);
assert.match(api, /request\('\/collection\/'/);
assert.match(api, /'\?limit='.*'&offset='/);
assert.match(ui, /key: 'collections'/);
assert.ok(ui.indexOf("key: 'search'") < ui.indexOf("key: 'collections'"), 'Search must remain ahead of Collections');
assert.match(ui, /Lampa\.Component\.add\('yani_collections'/);
assert.match(ui, /Lampa\.Component\.add\('yani_collection'/);
assert.match(ui, /Lampa\.Component\.add\('yani_genres'/);
assert.match(ui, /LampaYaniCollections\.hub/);
assert.match(collections, /response\.collections/);
assert.match(collections, /function hub\(object, deps\)/);
assert.match(collections, /LampaYaniCardRails\.create/);
assert.match(collections, /pageSize:\s*pageSize/);
assert.match(collections, /loadPage:\s*loadPage/);
assert.match(collections, /list\.slice\(offset, offset \+ size\)/);
assert.match(collections, /ensureCollections\(offset \+ size\)/);
assert.doesNotMatch(collections, /loadRows:/);
assert.match(collections, /slice\(0, 10\)/);
assert.match(collections, /yani-collections-hub/);
assert.match(collections, /yani-collection-view/);
assert.match(collections, /comp\.nextPageReuest/);
assert.match(collections, /yani_collection_previews/);
assert.match(collections, /deps\.open\(card\.yani_collection\)/);
assert.match(collections, /\.map\(deps\.toCard\)/);
assert.match(collections, /deps\.detail\(object\.collectionId, limit, offset\)/);
assert.match(build, /src\/ui-collections\.js/);
assert.match(build, /src\/ui-card-rails\.js/);
assert.match(css, /\.yani-collection-card__previews/);
assert.match(css, /\.yani-collection-card__meta/);

const context = {window: {}};
vm.runInNewContext(collections, context);
const moduleApi = context.window.LampaYaniCollections;
assert.equal(typeof moduleApi.hub, 'function');
const normalized = moduleApi.normalize({response: {collections: [{id: 7, title: 'Summer'}]}});
assert.equal(normalized.length, 1);
assert.equal(normalized[0].id, 7);
const card = moduleApi.card({
    id: 7,
    title: 'Summer',
    views: 42,
    likes: {likes: 5},
    poster_previews: [{medium: 'one.jpg'}, {big: 'two.jpg'}],
    animes: [{anime_id: 1}]
});
assert.equal(card.yani_collection_id, 7);
assert.deepEqual(Array.from(card.yani_collection_previews), ['one.jpg', 'two.jpg']);
assert.equal(card.yani_collection_views, 42);
assert.equal(card.yani_collection_likes, 5);
assert.equal(card.yani_collection_count, 1);

console.log('collections contract checks passed');
