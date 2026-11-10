const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(homeScreen, /var renderIntroContext = function \(\) \{\};/);
assert.match(homeScreen, /class="yani-home" data-yani-section="explore"/);
assert.match(homeScreen, /yani-home__intro-brand"><span>YummyAnime<\/span><i aria-hidden="true"><\/i><em><\/em>/);
assert.match(homeScreen, /renderIntroContext = function \(button\)/);
assert.match(homeScreen, /button\.data\('yani-home-title', item\.title\)/);
assert.match(homeScreen, /yani-home-insight-title/);
assert.match(homeScreen, /yani-home-insight-meta/);
assert.match(homeScreen, /yani-home-poster/);
assert.match(homeScreen, /renderIntroContext\(\$\(target\)\)/);
assert.match(homeScreen, /refreshIntroContext\(button\)/);
assert.match(homeScreen, /html\.attr\('data-yani-section', activeGroup\)/);
assert.match(homeScreen, /intro\.attr\('data-yani-section', activeGroup\)/);
assert.match(homeScreen, /intro\.find\('\.yani-home__intro-brand em'\)\.text\(activeTitle\)/);
assert.match(homeScreen, /yani-home__ambient--episode_flow/);
assert.match(homeScreen, /reducedMotion && !lowMemoryDevice && !lowCpuDevice/);
assert.match(css, /\.yani-home__intro-context-art--visible/);
assert.match(css, /data-yani-context="schedule"/);
assert.match(css, /data-yani-context="continue_watching"/);
assert.match(css, /data-yani-context="new_releases"/);
assert.match(css, /data-yani-section="library"/);
assert.match(css, /data-yani-section="discover"/);
assert.match(css, /\.yani-home__intro-brand i \{/);
assert.match(css, /\.yani-home__intro\[data-yani-section="service"\] \.yani-home__intro-brand/);
assert.match(css, /\.yani-home\[data-yani-section="library"\] \.yani-home__panel--active/);
assert.match(css, /\.yani-home--reduced-motion \.yani-home__intro-brand i/);
assert.match(css, /\.yani-home--reduced-motion \.yani-home__intro-context-art \{ display: none; \}/);

console.log('dashboard context header contract checks passed');
