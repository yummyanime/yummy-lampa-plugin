const assert = require('assert');
const fs = require('fs');

const build = fs.readFileSync('build.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(build, /'src\/ui-detail\.js'[\s\S]*'src\/ui\.js'/, 'detail module must load before the main UI');
assert.match(ui, /LampaYaniDetail\.create\(/, 'main UI must delegate Detail to LampaYaniDetail.create');
assert.doesNotMatch(ui, /function renderDetail\(cardData\)/, 'renderDetail must live in ui-detail.js');
assert.doesNotMatch(ui, /function createDetailEpisodeSummary\(cardData\)/, 'createDetailEpisodeSummary must live in ui-detail.js');
assert.doesNotMatch(ui, /function createDetailTranslations\(\)/, 'createDetailTranslations must live in ui-detail.js');
assert.match(detail, /function createDetailEpisodeSummary\(cardData\)/);
assert.match(detail, /function createDetailTranslations\(\)/);
assert.match(detail, /function createDetailListPanel\(cardData\)/);
assert.match(detail, /function createDetailRatingAction\(cardData\)/);
assert.match(detail, /window\.LampaYaniDetail\s*=\s*\{create: create\}/);
assert.match(detail, /deps\.importVideosProgress\(data, videos\)/);
assert.match(ui, /importVideosProgress: importVideosProgress/);
assert.match(detail, /yani-detail__title selector/);
assert.match(detail, /toggle: function \(\) \{ detailFocus\.restore\(null, true\); \}/);
assert.match(detail, /titleFocus && titleFocus\.length \? titleFocus : html\.find\('\.yani-detail__title\.selector'\)/);
assert.match(detail, /yani-detail__poster selector/);
assert.match(detail, /function togglePosterViewer\(poster, cardData\)/);
assert.match(detail, /cardData\.yani_poster_full/, 'fullscreen poster must use the largest artwork, not the card-sized file');
assert.match(detail, /hover:enter\.yaniPoster click\.yaniPoster/);
assert.match(detail, /hover:enter click\.yaniLampaCard/);
assert.match(detail, /aria-expanded/);
assert.match(detail, /function closePosterViewer\(\)/);
assert.match(detail, /back: function \(\) \{ if \(!closePosterViewer\(\)\) goBack\(\); \}/);
assert.match(detail, /comp\.destroy[\s\S]{0,150}closePosterViewer\(\)/);
assert.match(css, /\.yani-detail__poster\.focus/);
assert.match(css, /\.yani-poster-viewer\s*\{/);
assert.match(css, /\.yani-poster-viewer__image/);

console.log('detail module contract checks passed');
