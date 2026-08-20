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
assert.match(ui, /LampaYaniCollections\.catalog/);
assert.match(collections, /response\.collections/);
assert.match(collections, /function hub\(object, deps\)/);
assert.match(collections, /LampaYaniCardRails\.create/);
assert.match(collections, /pageSize:\s*pageSize/);
assert.match(collections, /loadPage:\s*loadPage/);
assert.match(collections, /list\.slice\(offset, offset \+ size\)/);
assert.match(collections, /ensureCollections\(offset \+ size\)/);
assert.match(collections, /function ensureAllCollections\(\)/);
assert.match(collections, /function collectionTilesRow\(list\)/);
assert.match(collections, /yani_collection_tile: true/);
assert.match(collections, /yani_collection_tiles: true/);
assert.match(collections, /\[collectionTilesRow\(list\)\]\.concat\(rows\)/);
assert.doesNotMatch(collections, /loadRows:/);
assert.match(collections, /slice\(0, 10\)/);
assert.match(collections, /yani-collections-hub/);
assert.match(collections, /yani-collection-view/);
assert.match(collections, /comp\.nextPageReuest/);
assert.match(collections, /var control = \{timeout: 8000, retry: false, cacheFirst: true, forceRefresh: forceRefresh === true\}/);
assert.doesNotMatch(collections, /Promise\.all\(\[/);
assert.match(collections, /function settleInitial\(items, error\)/);
assert.match(collections, /first useful source paints the screen/);
assert.match(collections, /deps\.feed\(control\)\.then/);
assert.match(collections, /deps\.load\(limit, 0, control\)\.then/);
assert.match(collections, /deps\.detail\(object\.collectionId, limit, 0\)/);
assert.match(collections, /deps\.error\(deps\.t\('collection_load_error'\)\)/);
assert.match(collections, /yani_collection_previews/);
assert.match(collections, /yani_collection_tile: true/);
assert.match(collections, /yani-tile-catalog yani-collections-tile-catalog/);
assert.match(collections, /deps\.open\(card\.yani_collection\)/);
assert.match(collections, /\.map\(deps\.toCard\)/);
assert.match(collections, /deps\.detail\(object\.collectionId, limit, offset\)/);
assert.match(collections, /function bindVisibleCollectionTiles\(self, cards\)/);
assert.match(collections, /bindVisibleCollectionTiles\(self, catalogCards\)/);
assert.match(collections, /var originalCatalogDestroy = comp\.destroy/);
assert.match(collections, /var originalDetailDestroy = comp\.destroy/);
assert.doesNotMatch(collections, /card\.params = \{/);
assert.match(collections, /cardApi\.onEnter = function \(\) \{ deps\.open\(card\.yani_collection\); \}/);
assert.doesNotMatch(collections, /hover:enter\.yaniCollection/);
assert.doesNotMatch(collections, /click\.yaniCollection/);
assert.doesNotMatch(collections, /setTimeout\(function \(\) \{ bindVisibleCollectionTiles/);
assert.match(build, /src\/ui-collections\.js/);
assert.match(build, /src\/ui-card-rails\.js/);
assert.match(css, /\.yani-collection-card__previews/);
assert.match(css, /\.yani-collection-card__meta/);
assert.match(css, /\.yani-collection-tile-card \.card__view/);
assert.match(css, /\.yani-collection-tile-card\.focus \.card__view/);
assert.match(css, /\.yani-collection-tiles-line \.card .card__view/);
assert.match(css, /\.yani-collections-tile-catalog \.card__view::after/);
assert.match(css, /\.yani-collections-tile-catalog \.card > \.card__title/);
assert.match(css, /-webkit-line-clamp: 2/);
assert.match(collections, /onFocus: function \(target, card\)/);

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
