const assert = require('assert');
const fs = require('fs');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(homeScreen, /data-yani-home-key/);
assert.match(homeScreen, /yani_home_last_focus/);
assert.match(homeScreen, /refreshContinueWatching\(\);/);
assert.match(homeScreen, /yani-home__library-pulse/);
assert.match(homeScreen, /personal\.continue_count \+ ' \/ ' \+ personal\.tracked_total/);
assert.match(homeScreen, /focusHomeElement\(target, isRailFocus\(target\) \? railCollection\(\) : homeCollection\(\)/);
assert.match(homeScreen, /if \(target\) renderIntroContext\(\$\(target\)\);/);
assert.match(homeScreen, /focusHomeElement = function \(element, collection\)[\s\S]{0,500}scroll\.update\(\$\(element\), true\)/);
assert.doesNotMatch(homeScreen, /renderLibraryStrip|libraryStrip|yani-home__library-mini/);
assert.doesNotMatch(css, /yani-home__library-preview|yani-home__library-mini/);
assert.match(css, /\.yani-home__library-pulse--active/);
assert.match(css, /@keyframes yani-home-library-pulse/);

console.log('dashboard library summary contract checks passed');
