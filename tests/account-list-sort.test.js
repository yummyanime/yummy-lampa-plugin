const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/screens/ui-account-list-controls.js', 'utf8');
const context = {window: {}};
vm.runInNewContext(source, context);
const controls = context.window.LampaYaniAccountListControls;

const items = [
    {anime_id: 1, title: 'Beta', year: 2020, rating: {average: 7}, date: 100, episodes: {count: 12}, user: {list: {progress: 3}}},
    {anime_id: 2, title: 'Alpha', year: 2024, rating: {average: 8.5}, date: 300, episodes: {count: 10}, user: {list: {progress: 2}}},
    {anime_id: 3, title: 'Gamma', year: 2022, rating: {average: 6}, date: 200, episodes: {count: 4}, user: {list: {progress: 3}}}
];

assert.deepStrictEqual(Array.from(controls.sortItems(items, 'recent'), (item) => item.anime_id), [2, 3, 1]);
assert.deepStrictEqual(Array.from(controls.sortItems(items, 'progress'), (item) => item.anime_id), [3, 1, 2]);
assert.deepStrictEqual(Array.from(controls.sortItems(items, 'rating'), (item) => item.anime_id), [2, 1, 3]);
assert.deepStrictEqual(Array.from(controls.sortItems(items, 'year'), (item) => item.anime_id), [2, 3, 1]);
assert.deepStrictEqual(Array.from(controls.sortItems(items, 'title'), (item) => item.anime_id), [2, 1, 3]);
assert.deepStrictEqual(items.map((item) => item.anime_id), [1, 2, 3], 'sorting must not mutate the cached API list');

assert.match(source, /function isFirstCardRow\(current\)/);
assert.match(source, /var current = focusedCard\(\) \|\| lastCard/);
assert.match(source, /if \(current && isFirstCardRow\(current\)\) return focusPanel\(\)/);
assert.match(source, /function focusActiveOption\(\)[\s\S]{0,250}buttons\.filter\('\[data-sort="' \+ active \+ '"\]'\)\[0\]/);
assert.match(source, /function setExpanded\(value, focus\)/);
assert.match(source, /if \(panelFocused\) return focusCards\(\)/);
assert.match(source, /yani-account-list-sort-rail/);
assert.match(source, /yani-account-list-sort-option selector/);
assert.match(source, /yani-account-list-sort-trigger selector/);
assert.match(source, /aria-expanded/);
assert.match(source, /if \(panelFocused\) \{[\s\S]{0,120}Navigator\.canmove\('left'\)/);
assert.match(source, /if \(panelFocused\) \{[\s\S]{0,120}Navigator\.canmove\('right'\)/);
assert.match(source, /controller\.back = function \(\)[\s\S]{0,120}expanded[\s\S]{0,80}setExpanded\(false, 'trigger'\)/);
assert.match(source, /function listIcon\(key\)/);
assert.match(source, /yani-account-list-sort-panel--/);
assert.match(source, /yani-account-list-sort-option__icon/);
assert.doesNotMatch(source, /yani-catalog-toolbar/);

console.log('Account list sorting tests passed');
