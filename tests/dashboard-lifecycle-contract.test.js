const assert = require('assert');
const fs = require('fs');

const api = fs.readFileSync('src/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');

assert.match(api, /var externalSignal = options && options\.signal/);
assert.match(api, /externalSignal\.addEventListener\('abort', abortRequest/);
assert.match(api, /externalSignal\.removeEventListener\('abort', abortRequest/);
assert.match(api, /method === 'GET' && options\.dedupe !== false && !options\.signal/);
assert.match(api, /schedule: function \(control\)/);
assert.match(api, /watchHistory: function \(limit, offset, control\)/);

assert.match(ui, /var homeAbortController = typeof AbortController !== 'undefined'/);
assert.match(ui, /var homeTimers = \[\]/);
assert.match(ui, /scheduleHomeTask\(function \(\) \{[\s\S]*?watchHistory\(300, 0, control\)/);
assert.match(ui, /}, 140 \* homeDelayScale\)/);
assert.match(ui, /}, 420 \* homeDelayScale\)/);
assert.match(ui, /}, 760 \* homeDelayScale\)/);
assert.match(ui, /homeTimers\.forEach\(function \(timer\) \{ clearTimeout\(timer\); \}\)/);
assert.match(ui, /if \(homeAbortController\) homeAbortController\.abort\(\)/);
assert.match(ui, /setChapterState\('episode_flow'/);
assert.match(ui, /setChapterState\('library'/);
assert.match(ui, /setChapterState\('discover'/);
assert.match(ui, /setChapterState\('service'/);

assert.match(css, /\.yani-home__chapter-state--loading/);
assert.match(css, /\.yani-home__chapter-state--partial/);
assert.match(css, /\.yani-home__chapter-state--offline/);
assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.yani-home__chapter-state b \{ display: none; \}/);
assert.match(i18n, /messages\.ru\.dashboard_state_loading/);
assert.match(i18n, /messages\.en\.dashboard_state_loading/);
assert.match(i18n, /messages\.uk\.dashboard_state_loading/);

console.log('dashboard lifecycle contract checks passed');
