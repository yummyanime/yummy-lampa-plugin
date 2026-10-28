const assert = require('assert');
const fs = require('fs');

const api = fs.readFileSync('src/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const menu = fs.readFileSync('src/ui-playback-menu.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const videoData = fs.readFileSync('src/ui-video-data.js', 'utf8');

assert.doesNotMatch(api, /videosMemory/);
assert.match(api, /videos: function \(id, options\)[\s\S]{0,420}auth: true,\s*cache: false/);
assert.match(videoData, /window\.LampaYaniVideoData = \{create: create/);
assert.match(ui, /LampaYaniVideoData\.create/);
assert.match(ui, /videoData\.payload\(id, options\)/);
assert.match(ui, /videoData\.list\(id, options\)/);
assert.match(menu, /deps\.loadVideos \|\| function \(id, options\)/);
assert.match(menu, /function lastWatchedVoice\(voices, card\)/);
assert.match(menu, /markLastWatchedVoice\(voices, card\)/);
assert.match(menu, /function resettableEpisodes\(card, videos\)/);
assert.match(menu, /function resetEpisode\(card, allVideos, item\)/);
assert.match(menu, /t\('reset_episode_progress'\)/);
assert.match(menu, /window\.LampaYaniEpisode\.same/);
assert.doesNotMatch(menu, /LampaYaniApi\.videos\(card\.yani_id\)/);
assert.match(api, /episodeInfoCache\[key\]/);
assert.match(api, /timeout: 4000/);
assert.match(api, /retry: false/);

assert.match(ui, /function episodeTitlesForCard\(card\)/);
assert.match(ui, /return Promise\.resolve\(\);/);
assert.match(menu, /enrichEpisodeTitles\(card\);/);
assert.match(menu, /enrichEpisodeTitles\(card, item\.group\);\s*chooseEpisode\(card, item\.group, videos\)/);
assert.doesNotMatch(menu, /enrichEpisodeTitles\(card, item\.group\)\.then/);
assert.doesNotMatch(menu, /enrichEpisodeTitles\(card, voices\[0\]\.group\)\.then/);
assert.match(detail, /LampaYaniApi\.episodeInfo\(malId\)\.catch/);
assert.match(ui, /videos\.length \? videoPlaybackPriority\(videos\[0\], group\)/);

console.log('playback episode menu contract checks passed');
