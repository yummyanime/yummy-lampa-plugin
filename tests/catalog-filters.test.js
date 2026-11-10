const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'screens', 'ui-catalog-filters.js'), 'utf8');
const context = {window: {}, Date};
vm.runInNewContext(source, context);

const filters = context.window.LampaYaniCatalogFilters;
const t = key => key;
const definitions = filters.definitions(t, 2026);
assert.strictEqual(definitions.length, 3);
assert.deepStrictEqual(Array.from(definitions, field => field.key), ['type', 'status', 'year']);

let params = {limit: 30, sort: 'top', offset: 90};
params = filters.apply(params, definitions[0], 'tv');
assert.strictEqual(params.types, 'tv');
assert.strictEqual(params.offset, 0);
params = filters.apply(params, definitions[1], 'ongoing');
assert.strictEqual(params.status, 'ongoing');
params = filters.apply(params, definitions[2], {from_year: 2024, to_year: 2026});
assert.strictEqual(params.from_year, 2024);
assert.strictEqual(params.to_year, 2026);
assert.strictEqual(filters.activeCount(params), 3);
assert.strictEqual(filters.selected(definitions[2], params).key, 'last3');
assert.strictEqual(filters.signature(params), 'tv-ongoing-2024-2026');

params = filters.apply(params, definitions[0], '');
params = filters.apply(params, definitions[1], '');
params = filters.apply(params, definitions[2], null);
assert.strictEqual(filters.activeCount(params), 0);
assert.strictEqual(Object.prototype.hasOwnProperty.call(params, 'types'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(params, 'status'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(params, 'from_year'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(params, 'to_year'), false);

const cleared = filters.clear({limit: 30, types: 'movie', status: 'released', from_year: 2020, to_year: 2026, offset: 90});
assert.strictEqual(filters.activeCount(cleared), 0);
assert.strictEqual(cleared.limit, 30);
assert.strictEqual(cleared.offset, 0);

console.log('Catalog filters tests passed');
