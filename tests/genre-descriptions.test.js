const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/core/genre-descriptions.js', 'utf8');
const context = {window: {}};
vm.runInNewContext(source, context);

const descriptions = context.window.LampaYaniGenreDescriptions;
assert.ok(descriptions);
assert.match(descriptions.resolve({title: 'Исэкай', href: 'isekai'}, 'ru'), /другом мире/);
assert.match(descriptions.resolve({title: 'Isekai', href: 'isekai'}, 'en'), /another world/);
assert.match(descriptions.resolve({title: 'Редкий жанр', href: 'rare-genre'}, 'ru'), /Редкий жанр/);
assert.match(descriptions.resolve({title: 'Рідкісний жанр', href: 'rare-genre'}, 'uk'), /Рідкісний жанр/);
assert.strictEqual(descriptions.resolve({}, 'ru'), '');

console.log('genre descriptions checks passed');
