const assert = require('assert');
const fs = require('fs');

const cards = fs.readFileSync('src/cards/ui-card-renderers.js', 'utf8');
const model = fs.readFileSync('src/cards/ui-card-model.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(cards, /function addCardMetadata\(element, card\)/);
assert.match(cards, /function cardStatusLabel\(status\)/);
assert.match(cards, /function cardEpisodesLabel\(episodes, watched\)/);
assert.match(model, /yani_status: item\.anime_status \|\| item\.status \|\| null/);
assert.match(model, /yani_year: item\.year \|\| item\.release_year \|\| null/);
assert.match(css, /\.yani-card-meta__native-age/);
assert.match(css, /\.yani-card-meta__episodes/);
assert.doesNotMatch(css, /\.yani-card-media__type/);

console.log('card metadata contract checks passed');
