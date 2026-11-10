const assert = require('assert');
const fs = require('fs');

const cards = fs.readFileSync('src/cards/ui-card-renderers.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/screens/ui-detail.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(cards, /function mediaTypeLabels\(value\)/);
assert.match(cards, /values\.push\(\{kind: 'type', text: type\.short\}\)/);
assert.match(cards, /yani-card-meta__/);
assert.match(detail, /yani-detail__type/);
assert.match(detail, /mediaTypeLabels\(data\.yani_type\)/);
assert.match(css, /\.yani-card-meta/);
assert.match(css, /\.yani-detail__type/);

console.log('media type contract tests passed');
