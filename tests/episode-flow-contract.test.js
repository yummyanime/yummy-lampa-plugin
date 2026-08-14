const assert = require('assert');
const fs = require('fs');

const api = fs.readFileSync('src/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const model = fs.readFileSync('src/ui-card-model.js', 'utf8');
const translations = fs.readFileSync('src/ui-translations.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(api, /feed: function \(control\)/);
assert.match(api, /request\('\/feed'/);
assert.match(ui, /component: 'yani_schedule'/);
assert.match(ui, /component: 'yani_new_translations'/);
assert.match(ui, /key: 'search'/);
assert.match(ui, /group: 'episode_flow'/);
assert.match(ui, /yani-home__episode-timeline/);
assert.match(ui, /renderEpisodeTimeline\(dashboard\.episode_flow\)/);
assert.match(ui, /node\.addClass\('selector'\)\.attr\(\{role: 'button'/);
assert.match(ui, /node\.on\('hover:enter click\.yaniHomeFlow', target\.action\)/);
assert.match(ui, /bindEpisodeStage\(node, definition\.key === 'available' \? 'new_translations' : 'schedule'/);
assert.ok(ui.indexOf("key: 'search'") < ui.indexOf("key: 'schedule'"), 'Search must remain before the episode flow');
assert.match(ui, /LampaYaniTranslations\.component/);
assert.match(translations, /value\.new_videos/);
assert.match(translations, /video\.dub_title/);
assert.match(translations, /yani_update_label/);
assert.match(model, /window\.LampaYaniUiUtils\.posterUrl\(item\.poster\)/);
assert.match(fs.readFileSync('src/ui-utils.js', 'utf8'), /value\.huge \|\| value\.mega \|\| value\.big/);
assert.match(css, /\.yani-home__episode-flow/);
assert.match(css, /\.yani-home__episode-flow-items/);
assert.match(css, /\.yani-home__episode-stage-marker/);
assert.match(css, /\.yani-home__episode-stage\.selector\.focus/);
assert.match(css, /@keyframes yani-home-flow-pulse/);
assert.match(css, /\.yani-card-update[^}]*text-overflow: ellipsis/);

console.log('episode flow contract checks passed');
