const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(ui, /yani-home__section-rail/);
assert.match(ui, /button\.data\('yani-home-group', item\.group \|\| 'explore'\)/);
assert.match(ui, /function setSectionRail\(group\)/);
assert.match(ui, /setSectionRail\(String\(button\.data\('yani-home-group'\)/);
assert.match(ui, /yani-home__section-rail-node--active/);
assert.match(ui, /yani-home__section-rail-node--passed/);
assert.match(ui, /key: 'explore', chapter: '01'/);
assert.match(ui, /key: 'service', chapter: '05'/);
assert.match(ui, /node\.find\('small'\)\.text\(definition\.chapter\)/);
assert.match(ui, /var homeCollection = function \(\) \{ return scroll\.render\(\); \};/);
assert.match(ui, /homeCollection = function \(\) \{[\s\S]{0,220}return scroll\.render\(\);/);
assert.match(ui, /railCollection = function \(\) \{[\s\S]{0,120}scroll\.render\(\)\.add\(sectionRail\)/);
assert.match(ui, /focusSectionRail = function \(/);
assert.match(ui, /if \(Navigator\.canmove\('right'\)\) Navigator\.move\('right'\);[\s\S]{0,80}else focusSectionRail\(\)/);
assert.match(ui, /if \(isRailFocus\(last\)\)/);
assert.doesNotMatch(ui, /function homeCollection\(\)/);
assert.match(ui, /node\.addClass\('selector'\)/);
assert.match(ui, /node\.on\('hover:enter click\.yaniHomeRail'/);
assert.match(ui, /Lampa\.Controller\.collectionSet\(collection\)/);
assert.match(css, /\.yani-home__section-rail\s*\{[^}]+pointer-events: auto/);
assert.match(css, /\.yani-home__section-rail-node\.focus i/);
assert.match(css, /\.yani-home__section-rail-node--active b/);
assert.match(css, /\.yani-home__section-rail-node--active i small/);
assert.match(css, /\.yani-home__section-rail-node--service\.yani-home__section-rail-node--active i/);
assert.match(css, /\.yani-home--reduced-motion \.yani-home__section-rail \{[^}]+backdrop-filter: none/);
assert.match(css, /@media \(min-width: 701px\) and \(max-width: 1100px\)[\s\S]+\.yani-home__section-rail \{ display: none; \}/);

console.log('dashboard section rail contract checks passed');
