const assert = require('assert');
const fs = require('fs');

const cards = fs.readFileSync('src/cards/ui-card-renderers.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(cards, /function cardMediaMotionAllowed\(\)/);
assert.match(cards, /yani-card-media__availability/);
assert.match(cards, /yani-card-media__availability-part yani-card-media__quality/);
assert.match(cards, /yani-card-media__availability-part yani-card-media__voices/);
assert.match(cards, /prefers-reduced-motion: reduce/);
assert.match(cards, /deviceMemory/);
assert.match(css, /\.yani-card-media__availability \{/);
assert.match(css, /@keyframes yani-card-availability-in/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.doesNotMatch(css, /\.yani-card-media__quality \{ background: #f1c40f/);

console.log('card availability design contract checks passed');
