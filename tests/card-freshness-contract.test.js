const assert = require('assert');
const fs = require('fs');

const cards = fs.readFileSync('src/cards/ui-card-renderers.js', 'utf8');
const model = fs.readFileSync('src/cards/ui-card-model.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');

assert.match(cards, /function cardUpdateTimestamp\(value\)/);
assert.match(cards, /function cardFreshness\(value\)/);
assert.match(cards, /card\.yani_update_date \|\| card\.yani_updated_at/);
assert.match(model, /yani_update_date: item\.yani_update_date \|\| item\.updated_at/);
assert.match(css, /\.yani-card-update__freshness/);
assert.match(css, /\.yani-card-update--fresh/);
assert.match(i18n, /messages\.ru\.fresh_today = 'Сегодня'/);
assert.match(i18n, /messages\.en\.fresh_yesterday = 'Yesterday'/);
assert.match(i18n, /messages\.uk\.fresh_today = 'Сьогодні'/);

console.log('card freshness contract checks passed');
