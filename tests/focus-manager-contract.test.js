const assert = require('assert');
const fs = require('fs');

const navigation = fs.readFileSync('src/ui-navigation.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const catalog = fs.readFileSync('src/ui-catalog-controls.js', 'utf8');
const accountControls = fs.readFileSync('src/ui-account-list-controls.js', 'utf8');
const accountLists = fs.readFileSync('src/ui-account-lists.js', 'utf8');
const schedule = fs.readFileSync('src/ui-schedule.js', 'utf8');

assert.match(navigation, /var MAX_SCOPES = 32/);
assert.match(navigation, /function createScope\(options\)/);
assert.match(navigation, /function elementKey\(element, root\)/);
assert.match(navigation, /data-yani-focus-key/);
assert.match(navigation, /function remember\(value\)[\s\S]{0,700}state\.scrollTop/);
assert.match(navigation, /function restore\(preferred, updateScroll\)[\s\S]{0,1200}collectionFocus/);
assert.match(navigation, /function captureSnapshot\(\)/);
assert.match(navigation, /function restoreSnapshot\(snapshot\)/);
assert.match(navigation, /function attachComponent\(component, options\)/);
assert.match(navigation, /while \(scopeOrder\.length > MAX_SCOPES\)/);

assert.match(ui, /LampaYaniNavigation\.captureSnapshot\(\)/);
assert.match(ui, /LampaYaniNavigation\.restoreSnapshot\(snapshot\)/);
assert.match(detail, /var detailFocus = LampaYaniNavigation\.createScope/);
assert.match(detail, /detailFocus\.restore\(null, true\)/);
assert.match(detail, /titleFocus && titleFocus\.length \? titleFocus/);
assert.match(catalog, /var focusScope = LampaYaniNavigation\.createScope/);
assert.match(catalog, /focusScope\.bind\(root\)/);
assert.match(accountControls, /var focusScope = LampaYaniNavigation\.createScope/);
assert.match(accountControls, /focusScope\.restore\(lastCard \|\| firstCard\(\), false\)/);
assert.match(accountLists, /LampaYaniNavigation\.attachComponent\(component/);
assert.match(schedule, /var focusScope = LampaYaniNavigation\.createScope/);
assert.match(schedule, /focusScope\.restore\(last, false\)/);

console.log('Shared focus manager contract checks passed');
