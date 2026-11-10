const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const moduleSource = fs.readFileSync('src/screens/ui-search.js', 'utf8');
const start = ui.indexOf('function openSearch()');
const end = ui.indexOf('function openAccount()', start);
const search = ui.slice(start, end);
const controllerStart = ui.indexOf('function getSearchController()');
const controllerEnd = ui.indexOf('function registerSearchSource()', controllerStart);
const controller = ui.slice(controllerStart, controllerEnd);
const inputStart = ui.indexOf('function showYummyInput(');
const inputEnd = ui.indexOf('function commentsMenu(', inputStart);
const input = ui.slice(inputStart, inputEnd);

assert.ok(start >= 0 && end > start, 'openSearch must remain available');
assert.match(search, /getSearchController\(\)\.open\(\)/);
assert.match(controller, /showInput: showYummyInput/);
assert.match(controller, /openResults: function \(query\)/);
assert.match(controller, /Lampa\.Activity\.push\(/);
assert.match(moduleSource, /if \(!query\) return/);
assert.match(moduleSource, /options\.openResults\(query\)/);
assert.match(input, /restoreTransientInteraction\(navigation\)/);

console.log('Search return controller contract checks passed');
