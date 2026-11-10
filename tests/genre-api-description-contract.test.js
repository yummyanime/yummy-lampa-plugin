const assert = require('assert');
const fs = require('fs');

const api = fs.readFileSync('src/core/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const catalogScreen = fs.readFileSync('src/screens/ui-catalog.js', 'utf8');

assert.match(api, /genre: function \(id, control\)/);
assert.match(api, /request\('\/anime\/genres\/' \+ encodeURIComponent\(id\)/);
assert.match(api, /cacheTtl: 24 \* 60 \* 60 \* 1000/);
assert.match(api, /staleFallback: true/);
assert.match(api, /new URLSearchParams\(params \|\| \{limit: 20\}\)/);
assert.match(catalogScreen, /function loadGenreDescription\(context\)/);
assert.match(catalogScreen, /LampaYaniApi\.genre\(genreId\)/);
assert.match(catalogScreen, /yani-genre-catalog-header__description/);
assert.match(ui, /document\.createElement\('textarea'\)/);

console.log('genre API description contract checks passed');
