const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

['catalog', 'genres', 'search'].forEach((key) => {
    assert.match(homeScreen, new RegExp(`key: '${key}'[^\\n]+group: 'explore'`));
});
['schedule', 'new_translations'].forEach((key) => {
    assert.match(homeScreen, new RegExp(`key: '${key}'[^\\n]+group: 'episode_flow'`));
});
['continue_watching', 'user_lists', 'personal_feed'].forEach((key) => {
    assert.match(homeScreen, new RegExp(`key: '${key}'[^\\n]+group: 'library'`));
});
['account', 'notifications'].forEach((key) => {
    assert.match(homeScreen, new RegExp(`key: '${key}'[^\\n]+group: 'service'`));
});
assert.doesNotMatch(homeScreen, /\{key: 'status', title:/);
assert.match(homeScreen, /yani-home__service-hub[^']*selector/);

assert.match(homeScreen, /yani-home__intro-title/);
assert.match(homeScreen, /homeExploreDecoration\(item\.key\)/);
assert.match(homeScreen, /yani-home__explore-art--catalog/);
assert.match(homeScreen, /yani-home__explore-art--genres/);
assert.match(homeScreen, /yani-home__explore-art--search/);
assert.match(homeScreen, /yani-home__panel--active/);
assert.match(homeScreen, /yani-home__panel-chapter[^\n]+02/);
assert.match(homeScreen, /yani-home__panel-chapter[^\n]+04/);
assert.match(homeScreen, /group === 'explore' \? '01' : group === 'library' \? '03' : group === 'service' \? '05'/);
assert.match(homeScreen, /hover:enter click\.yaniHome/);
assert.match(homeScreen, /last && document\.documentElement\.contains\(last\)/);
assert.match(css, /\.yani-home__panel--explore\s*\{[\s\S]{0,100}grid-column: span 12/);
assert.match(css, /\.yani-home__episode-flow\s*\{[\s\S]{0,180}grid-column: span 8/);
assert.match(css, /\.yani-home__panel--library\s*\{[\s\S]{0,100}grid-column: span 4/);
assert.match(css, /\.yani-home__profile-card\s*\{[\s\S]{0,160}grid-template-columns/);
assert.match(css, /\.yani-home__item--catalog\.focus \.yani-home__explore-art--catalog/);
assert.match(css, /\.yani-home__item--genres\.focus \.yani-home__explore-art--genres/);
assert.match(css, /\.yani-home__item--search\.focus \.yani-home__explore-art--search/);
assert.match(css, /\.yani-home__item > \.yani-home__explore-art\s*\{[^}]*position: absolute/);
assert.match(css, /\.yani-home__explore-art--catalog i:nth-child\(1\)[^}]*176,132,239/);
assert.match(css, /\.yani-home__explore-art--catalog i:nth-child\(4\)[^}]*100,224,178/);
assert.match(css, /\.yani-home__panel-chapter \{/);
assert.match(css, /\.yani-home__panel--active \.yani-home__panel-chapter/);
assert.match(css, /\.yani-home__panel--episode-flow \.yani-home__item\.focus[^}]*98,184,255/);
assert.match(css, /\.yani-home__panel--library \.yani-home__item\.focus[^}]*85,215,149/);
assert.match(css, /\.yani-home__panel--discover \.yani-home__item\.focus[^}]*191,114,233/);
assert.match(css, /\.yani-home__panel--service \.yani-home__item\.focus[^}]*236,176,85/);
assert.match(css, /\.yani-home__panel--service \.yani-home__item\.focus \.yani-home__arrow/);
['schedule', 'new_translations', 'continue_watching', 'user_lists', 'personal_feed', 'new_releases', 'top_rated', 'collections'].forEach((key) => {
    assert.match(css, new RegExp(`yani-home__tile-art--${key}`));
});

console.log('dashboard layout contract checks passed');
