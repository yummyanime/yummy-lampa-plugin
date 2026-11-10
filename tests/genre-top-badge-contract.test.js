const assert = require('assert');
const fs = require('fs');

const cards = fs.readFileSync('src/cards/ui-card-renderers.js', 'utf8');
const model = fs.readFileSync('src/cards/ui-card-model.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const catalogScreen = fs.readFileSync('src/screens/ui-catalog.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');

assert.match(catalogScreen, /function annotateGenreTop\(items, offset\)/);
assert.match(catalogScreen, /hasSortDirection \?[^:]+:[\s\r\n]*baseParams\.sort === 'top'/);
assert.match(catalogScreen, /item\.yani_genre_top = \{position: position, genre: title\}/);
assert.match(model, /yani_genre_top: item\.yani_genre_top && typeof item\.yani_genre_top === 'object'/);
assert.match(cards, /function genreTopPosition\(card\)/);
assert.match(cards, /position >= 1 && position <= 100/);
assert.match(cards, /yani-card-media__genre-top/);
assert.match(cards, /genre_top_position/);
assert.match(css, /\.yani-card-media__genre-top/);
assert.match(css, /\.yani-card-media__genre-top svg/);
assert.match(i18n, /Топ-100 жанра «\{genre\}»: место \{position\}/);
assert.match(i18n, /“\{genre\}” top 100: position \{position\}/);

console.log('genre top badge contract checks passed');
