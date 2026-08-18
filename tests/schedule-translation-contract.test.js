const assert = require('assert');
const fs = require('fs');

const schedule = fs.readFileSync('src/ui-schedule.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(schedule, /info\.append\(translations\)/);
assert.doesNotMatch(schedule, /createAvailability/);
assert.match(schedule, /videosCache = \{\}/);
assert.match(schedule, /function translationGroupsFromVideos\(videos, episode\)/);
assert.match(schedule, /playbackSourceId\(Object\.assign\(\{\}, video \|\| \{\}, data \|\| \{\}\)\)/);
assert.match(schedule, /if \(!isPlaybackSourceEnabled\(sourceId\)\) return/);
assert.match(schedule, /if \(episode && number && Number\(number\) !== Number\(episode\)\) return/);
assert.match(schedule, /if \(episode && !number\) return/);
assert.match(schedule, /LampaYaniApi\.videos\(animeId/);
assert.match(schedule, /function paintTranslations\(host, groups\)/);
assert.match(schedule, /yani-schedule__translation-list/);
assert.match(schedule, /t\('voice_teams'\)/);
assert.match(schedule, /t\('subtitle_teams'\)/);
assert.match(schedule, /t\('available_translations'\)/);
assert.doesNotMatch(schedule, /feedTranslations/);
assert.match(css, /\.yani-schedule__translations/);
assert.match(css, /\.yani-schedule__translation-row--voices/);
assert.match(css, /\.yani-schedule__translation-list span/);

console.log('schedule translation contract checks passed');
