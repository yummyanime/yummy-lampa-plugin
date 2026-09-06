const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const launchStart = ui.indexOf('function launchVideo');
const launchEnd = ui.indexOf('function launchResolvedVideo', launchStart);
const launchPolicy = ui.slice(launchStart, launchEnd);

assert.match(ui, /function isSibnetPlaybackSource\(url, group\)/);
assert.match(launchPolicy, /var sibnetPageUrl = selected\.iframe_url \|\| url;[\s\S]{0,100}if \(isSibnetPlaybackSource\(sibnetPageUrl, group\)\) \{\s*return openEmbeddedEpisode\(card, group, selected, sibnetPageUrl\);/,
    'Sibnet must use its official iframe so the MP4 request carries the required Referer');
assert.ok(
    launchPolicy.indexOf('isSibnetPlaybackSource(sibnetPageUrl, group)') < launchPolicy.indexOf('LampaYaniStreamResolver.resolve(url, selected)'),
    'Sibnet iframe routing must happen before direct stream extraction');

console.log('Sibnet playback policy tests passed');
