const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const api = fs.readFileSync('src/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');

assert.match(api, /genre: function \(id, control\)/);
assert.match(api, /request\('\/anime\/genres\/' \+ encodeURIComponent\(id\)/);
assert.match(api, /cacheTtl: 24 \* 60 \* 60 \* 1000/);
assert.match(api, /staleFallback: true/);
assert.match(api, /function queryString\(params\)/);
assert.match(api, /typeof value === 'object'\) return/);
assert.match(api, /function settleTimeout\(promise, timeoutMs\)/);
assert.match(api, /queryString: queryString/);
assert.match(api, /request\('\/anime\?' \+ queryString\(params/);
assert.match(ui, /function loadGenreDescription\(context\)/);
assert.match(ui, /LampaYaniApi\.genre\(genreId\)/);
assert.match(ui, /yani-genre-catalog-header__description/);
assert.match(ui, /document\.createElement\('textarea'\)/);

const context = {window: {LampaYaniConfig: {version: 'test', apiBase: 'https://example', requestTimeout: 15}}};
vm.runInNewContext(api, context);
assert.equal(context.window.LampaYaniApi.queryString({
    limit: 30,
    genres: 7,
    items: {mapping: 'grid'},
    loading: {icon: 'card'}
}), 'limit=30&genres=7');

console.log('genre API description contract checks passed');
