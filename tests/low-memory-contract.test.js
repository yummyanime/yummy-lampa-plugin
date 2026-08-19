const assert = require('assert');
const fs = require('fs');

const media = fs.readFileSync('src/ui-media.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const card = fs.readFileSync('src/ui-standard-card.js', 'utf8');
const api = fs.readFileSync('src/api.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.doesNotMatch(media, /new Image\s*\(/, 'catalog cards must not decode a duplicate hidden poster');
assert.match(media, /var maxActive = 2;/, 'fallback poster requests must be concurrency-limited');
assert.match(media, /return values\.slice\(0, 2\);/, 'fallback poster aliases must be bounded');
assert.match(media, /loading', lowMemory \? 'lazy' : 'eager'/, 'low-memory devices keep lazy posters; TVs decode them eagerly');
assert.match(media, /apply\(card && \(card\.poster \|\| card\.img\)/, 'catalog cards must force the plugin poster over Lampa\'s copy');
assert.match(api, /var pendingRequests = \{\};/, 'identical in-flight API requests must be deduplicated');
assert.match(card, /queries\.slice\(0, 2\)/, 'native Lampa matching must use a bounded title set');
assert.doesNotMatch(card, /return !source && !Array\.isArray\(ids\);/, 'missing metadata must not classify every title as anime');
assert.doesNotMatch(build, /src\/ui-detail-sections\.js/, 'unused duplicate detail sections must stay out of the bundle');
assert.doesNotMatch(fs.readFileSync('index.js', 'utf8'), /src\/ui-detail-sections\.js/, 'legacy loader must not fetch unused duplicate detail sections');
assert.doesNotMatch(ui, /function Legacy[A-Z]/, 'dead legacy screen implementations must stay out of the main UI bundle');
['formatStatusDate', 'formatScheduleDay', 'formatScheduleTime', 'formatScheduleDateTime', 'formatEpisode'].forEach((name) => {
    assert.doesNotMatch(ui, new RegExp(`function ${name}\\(`), `${name} belongs to the extracted screen module`);
});
assert.doesNotMatch(css, /\.view--yummyanime__icon svg\s*\{\s*display:\s*none/, 'YummyAnime button logo must remain visible');
assert.match(css, /min-width: 3\.72em/, 'YummyAnime Lampa button must be 20% wider than the previous square');
assert.match(css, /\.full-start__rate \.yani-full-rating-label/, 'native Lampa rating must render YA as brand-colored text');

console.log('low-memory contract tests passed');
