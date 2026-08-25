const assert = require('assert');
const fs = require('fs');

const cards = fs.readFileSync('src/ui-card-renderers.js', 'utf8');
const model = fs.readFileSync('src/ui-card-model.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(cards, /function cardStatusKey\(status\)/);
assert.match(cards, /status--' \+ cardStatusKey/);
assert.match(cards, /cardEpisodesLabel\(card && card\.yani_episodes, localWatchedCount\(card\)\)/);
assert.match(model, /function watchedEpisodeCount\(item, animeId\)/);
assert.match(model, /explicit \* total/);
assert.match(model, /isEpisodeProgressCounted/);
assert.match(css, /\.yani-card-meta__status--ongoing/);
assert.match(css, /\.yani-card-meta__status--released/);
assert.match(css, /\.yani-card-meta__status--announced/);

console.log('card state and progress contract checks passed');
