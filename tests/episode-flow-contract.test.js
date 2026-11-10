const assert = require('assert');
const fs = require('fs');

const api = fs.readFileSync('src/core/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const model = fs.readFileSync('src/cards/ui-card-model.js', 'utf8');
const translations = fs.readFileSync('src/screens/ui-translations.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(api, /feed: function \(control\)/);
assert.match(api, /request\('\/feed'/);
assert.match(homeScreen, /component: 'yani_schedule'/);
assert.match(homeScreen, /component: 'yani_new_translations'/);
assert.match(homeScreen, /key: 'search'/);
assert.match(homeScreen, /group: 'episode_flow'/);
assert.match(homeScreen, /yani-home__episode-timeline/);
assert.match(homeScreen, /renderEpisodeTimeline\(dashboard\.episode_flow\)/);
assert.match(homeScreen, /node\.addClass\('selector'\)\.attr\(\{role: 'button'/);
assert.match(homeScreen, /node\.on\('hover:enter click\.yaniHomeFlow', target\.action\)/);
assert.match(homeScreen, /bindEpisodeStage\(node, definition\.key === 'available' \? 'new_translations' : 'schedule'/);
assert.ok(homeScreen.indexOf("key: 'search'") < homeScreen.indexOf("key: 'schedule'"), 'Search must remain before the episode flow');
assert.match(ui, /LampaYaniTranslations\.component/);
assert.match(translations, /value\.new_videos/);
assert.match(translations, /video\.dub_title/);
assert.match(translations, /yani_update_label/);
assert.match(model, /window\.LampaYaniUiUtils\.posterSources/);
assert.match(fs.readFileSync('src/ui/ui-utils.js', 'utf8'), /value\.huge \|\| value\.mega \|\| value\.fullsize/);
assert.match(css, /\.yani-home__episode-flow/);
assert.match(css, /\.yani-home__episode-flow-items/);
assert.match(css, /\.yani-home__episode-stage-marker/);
assert.match(css, /\.yani-home__episode-stage\.selector\.focus/);
assert.match(css, /@keyframes yani-home-flow-pulse/);
assert.match(css, /\.yani-card-update[^}]*text-overflow: ellipsis/);

console.log('episode flow contract checks passed');
