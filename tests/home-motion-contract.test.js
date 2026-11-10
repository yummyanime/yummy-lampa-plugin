const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(homeScreen, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
assert.match(homeScreen, /navigatorInfo\.deviceMemory/);
assert.match(homeScreen, /navigatorInfo\.hardwareConcurrency/);
assert.match(homeScreen, /yani-home--reduced-motion/);
assert.match(homeScreen, /yani-home--motion/);
assert.match(css, /@keyframes yani-home-reveal/);
assert.match(css, /@keyframes yani-home-wave-draw/);
assert.match(css, /@keyframes yani-home-pulse/);
assert.match(homeScreen, /yani-home__waves/);
assert.match(homeScreen, /yani-home__wave--far/);
assert.match(homeScreen, /yani-home__wave--middle/);
assert.match(homeScreen, /yani-home__wave--near/);
assert.match(homeScreen, /yani-home__ambient--service/);
assert.match(css, /\.yani-home__ambient \{/);
assert.match(css, /\.yani-home--reduced-motion \.yani-home__ambient \{ transition: none; transform: none; \}/);
assert.ok(homeScreen.indexOf("key: 'user_lists'") < homeScreen.indexOf("key: 'top_rated'"), 'My Lists must be dashboard item 6');
assert.ok(homeScreen.indexOf("key: 'account'") < homeScreen.indexOf("key: 'notifications'"), 'Account must lead the combined profile card');
assert.doesNotMatch(homeScreen, /\{key: 'status', title:/);
assert.match(homeScreen, /key: 'notifications'.*authorized: true/);
assert.match(css, /\.yani-home--motion \.yani-home__item\.focus::before/);
assert.match(css, /\.yani-home__item--personal_feed \.yani-home__icon/);
assert.match(css, /\.yani-home__tile-art--personal_feed/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);

console.log('home motion contract checks passed');
