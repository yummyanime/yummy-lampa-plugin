const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(homeScreen, /yani-home__section-rail/);
assert.match(homeScreen, /button\.data\('yani-home-group', item\.group \|\| 'explore'\)/);
assert.match(homeScreen, /function setSectionRail\(group\)/);
assert.match(homeScreen, /setSectionRail\(String\(button\.data\('yani-home-group'\)/);
assert.match(homeScreen, /yani-home__section-rail-node--active/);
assert.match(homeScreen, /yani-home__section-rail-node--passed/);
assert.match(homeScreen, /key: 'explore', chapter: '01'/);
assert.match(homeScreen, /key: 'service', chapter: '05'/);
assert.match(homeScreen, /node\.find\('small'\)\.text\(definition\.chapter\)/);
assert.match(homeScreen, /var homeCollection = function \(\) \{ return scroll\.render\(\); \};/);
assert.match(homeScreen, /homeCollection = function \(\) \{[\s\S]{0,220}return scroll\.render\(\);/);
assert.match(homeScreen, /railCollection = function \(\) \{[\s\S]{0,120}scroll\.render\(\)\.add\(sectionRail\)/);
assert.match(homeScreen, /focusSectionRail = function \(/);
assert.match(homeScreen, /if \(Navigator\.canmove\('right'\)\) Navigator\.move\('right'\);[\s\S]{0,80}else focusSectionRail\(\)/);
assert.match(homeScreen, /if \(isRailFocus\(last\)\)/);
assert.doesNotMatch(homeScreen, /function homeCollection\(\)/);
assert.match(homeScreen, /node\.addClass\('selector'\)/);
assert.match(homeScreen, /node\.on\('hover:enter click\.yaniHomeRail'/);
assert.match(ui, /Lampa\.Controller\.collectionSet\(collection\)/);
assert.match(css, /\.yani-home__section-rail\s*\{[^}]+pointer-events: auto/);
assert.match(css, /\.yani-home__section-rail-node\.focus i/);
assert.match(css, /\.yani-home__section-rail-node--active b/);
assert.match(css, /\.yani-home__section-rail-node--active i small/);
assert.match(css, /\.yani-home__section-rail-node--service\.yani-home__section-rail-node--active i/);
assert.match(css, /\.yani-home--reduced-motion \.yani-home__section-rail \{[^}]+backdrop-filter: none/);
assert.match(css, /@media \(min-width: 701px\) and \(max-width: 1100px\)[\s\S]+\.yani-home__section-rail \{ display: none; \}/);

console.log('dashboard section rail contract checks passed');
