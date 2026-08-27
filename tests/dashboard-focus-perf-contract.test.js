const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(ui, /activateHomeFocus = function \(target, options\)/);
assert.match(ui, /requestAnimationFrame\(function \(\)/);
assert.match(ui, /storageKey !== lastStoredFocusKey/);
assert.match(ui, /activeGroup === lastHomeSection/);
assert.match(ui, /poster === lastIntroPoster/);
assert.match(ui, /rect\.top >= box\.top \+ 8 && rect\.bottom <= box\.bottom - 8/);
assert.match(ui, /button\.on\('hover:focus', function \(event\) \{\s*activateHomeFocus/);
assert.doesNotMatch(ui, /button\.on\('hover:focus'[\s\S]{0,220}Lampa\.Storage\.set\(homeFocusStorageKey/);
assert.match(ui, /function queueHomeRender\(key, callback\)/);
assert.match(ui, /function noteHomeNavigation\(\)/);
assert.match(ui, /homeNavigationUntil = Date\.now\(\) \+ homeRenderIdleDelay/);
assert.match(ui, /queueHomeRender\('remote-playback'/);
assert.match(ui, /queueHomeRender\('personal-lists'/);
assert.match(ui, /queueHomeRender\('dashboard'/);
assert.match(ui, /down: function \(\) \{\s*noteHomeNavigation\(\)/);

assert.doesNotMatch(css, /\.yani-home__item\.focus \{[\s\S]{0,280}transform:/);
assert.doesNotMatch(css, /\.yani-home__ambient \{\s*position: absolute;[\s\S]{0,200}transform:/);
assert.match(css, /\.yani-home__ambient \{\s*position: absolute;[\s\S]{0,200}transition: opacity \.18s ease;/);
assert.doesNotMatch(css, /\.yani-home__intro-context-art \{[^}]*filter:/);
assert.doesNotMatch(css, /\.yani-home__panel--service \.yani-home__item \{[^}]*backdrop-filter:/);
assert.match(css, /\.yani-home__item \{[\s\S]{0,800}transition: border-color \.12s ease/);
assert.match(css, /\.yani-home--motion \.yani-home__item\.focus::before/);

console.log('dashboard focus perf contract checks passed');
