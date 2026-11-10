const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(homeScreen, /activateHomeFocus = function \(target, options\)/);
assert.match(homeScreen, /requestAnimationFrame\(function \(\)/);
assert.match(homeScreen, /storageKey !== lastStoredFocusKey/);
assert.match(homeScreen, /activeGroup === lastHomeSection/);
assert.match(homeScreen, /poster === lastIntroPoster/);
assert.match(homeScreen, /rect\.top >= box\.top \+ 8 && rect\.bottom <= box\.bottom - 8/);
assert.match(homeScreen, /button\.on\('hover:focus', function \(event\) \{\s*activateHomeFocus/);
assert.doesNotMatch(homeScreen, /button\.on\('hover:focus'[\s\S]{0,220}Lampa\.Storage\.set\(homeFocusStorageKey/);
assert.match(homeScreen, /function queueHomeRender\(key, callback\)/);
assert.match(homeScreen, /function noteHomeNavigation\(\)/);
assert.match(homeScreen, /homeNavigationUntil = Date\.now\(\) \+ homeRenderIdleDelay/);
assert.match(homeScreen, /queueHomeRender\('remote-playback'/);
assert.match(homeScreen, /queueHomeRender\('personal-lists'/);
assert.match(homeScreen, /queueHomeRender\('dashboard'/);
assert.match(homeScreen, /down: function \(\) \{\s*noteHomeNavigation\(\)/);

assert.doesNotMatch(css, /\.yani-home__item\.focus \{[\s\S]{0,280}transform:/);
assert.doesNotMatch(css, /\.yani-home__ambient \{\s*position: absolute;[\s\S]{0,200}transform:/);
assert.match(css, /\.yani-home__ambient \{\s*position: absolute;[\s\S]{0,200}transition: opacity \.18s ease;/);
assert.doesNotMatch(css, /\.yani-home__intro-context-art \{[^}]*filter:/);
assert.doesNotMatch(css, /\.yani-home__panel--service \.yani-home__item \{[^}]*backdrop-filter:/);
assert.match(css, /\.yani-home__item \{[\s\S]{0,800}transition: border-color \.12s ease/);
assert.match(css, /\.yani-home--motion \.yani-home__item\.focus::before/);

console.log('dashboard focus perf contract checks passed');
