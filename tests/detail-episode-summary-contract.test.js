const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');

assert.match(detail, /values\.watchedLabel \|\| values\.watched/);
assert.match(detail, /kind: 'watched'/);
assert.match(detail, /yani-detail__episode-stat--' \+ item\.kind/);
assert.match(css, /\.yani-detail__episode-stat--watched/);
assert.match(detail, /LampaYaniUiUtils\.detailEpisodeStats\(cardData, lastVideos, getPlayback\(cardData\.yani_id\)\)/);
assert.match(detail, /refreshDetailWatchState = function \(\)/);
assert.match(detail, /yani:watch-progress\.yaniDetail/);
assert.match(detail, /yani-detail__episode-summary selector/);
assert.match(detail, /block\.one\('hover:focus\.yaniEpisodeSummary', enrich\)/);
assert.doesNotMatch(detail.slice(detail.indexOf('function createDetailEpisodeSummary'), detail.indexOf('function detailEpisodeIcon')), /hover:enter|click\./,
    'the summary is focusable for navigation but must not perform an action');
assert.match(detail, /stats\.total > 0 && stats\.total <= 100/);
const model = fs.readFileSync('src/ui-card-model.js', 'utf8');
const api = fs.readFileSync('src/api.js', 'utf8');
assert.match(model, /yani_episodes: item\.episodes \|\| null/);
assert.match(css, /\.yani-detail__episode-summary\.focus/);
assert.match(api, /videos: function \(id, options\)[\s\S]{0,420}auth: true,\s*cache: false/,
    'authorized video metadata is required for watched-episode counts');

['ru', 'en', 'uk'].forEach((language) => {
    ['episode_information', 'seasons_short', 'episodes_aired', 'episodes_watched'].forEach((key) => {
        assert.match(i18n, new RegExp(`messages\\.${language}\\.${key}\\s*=`));
    });
});

console.log('detail episode summary contract tests passed');
