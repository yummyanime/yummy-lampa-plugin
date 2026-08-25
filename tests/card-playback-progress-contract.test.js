const assert = require('assert');
const fs = require('fs');

const cards = fs.readFileSync('src/ui-card-renderers.js', 'utf8');
const bind = fs.readFileSync('src/ui-card-bind.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const history = fs.readFileSync('src/ui-playback-history.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(cards, /function cardPlaybackState\(card\)/);
assert.match(cards, /function addCardPlaybackProgress\(element, card\)/);
assert.match(cards, /function syncCardEpisodesMeta\(element, card\)/);
assert.match(ui, /addCardPlaybackProgress/);
assert.match(bind, /data-yani-card-id/);
assert.match(history, /not\('\.yani-history-card'\)/);
assert.match(history, /syncCardEpisodesMeta\(\$\(this\), card\)/);
assert.match(history, /yani:watch-progress/);
assert.match(css, /\.yani-card-playback \{/);
assert.match(css, /\.yani-card-playback-progress span/);

console.log('card playback progress contract checks passed');
