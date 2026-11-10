const assert = require('assert');
const fs = require('fs');

const externalPlayer = fs.readFileSync('src/playback/ui-external-player.js', 'utf8');
const menu = fs.readFileSync('src/playback/ui-playback-menu.js', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');

assert.match(externalPlayer, /function webViewReadyForFocus\(\)/);
assert.match(externalPlayer, /if \(document\.hidden\) return false/);
assert.match(externalPlayer, /typeof document\.hasFocus === 'function' && !document\.hasFocus\(\)/);
assert.match(externalPlayer, /function waitForWebViewFocus\(\)[\s\S]{0,180}setTimeout\(function \(\)/);

assert.match(menu, /var EPISODE_RANGE_SIZE = 24/);
assert.match(menu, /var EPISODE_RANGE_THRESHOLD = 48/);
assert.match(menu, /function showEpisodeRanges\(card, group, videos, allVideos, resetItems, flags\)/);
assert.match(menu, /function showEpisodeRange\(card, group, visibleVideos, playlist, allVideos, resetItems, flags, options\)/);
assert.match(menu, /videos\.slice\(startAt, startAt \+ EPISODE_RANGE_SIZE\)/);
assert.match(menu, /restoreOnBack: false/);
assert.match(menu, /LampaYaniEpisode\.same\(window\.LampaYaniEpisode\.valueOf\(video\), saved\.number\)/);

assert.match(i18n, /episode_range: 'Серии \{from\}–\{to\}'/);
assert.match(i18n, /episode_range: 'Episodes \{from\}–\{to\}'/);
assert.match(i18n, /episode_range: 'Серії \{from\}–\{to\}'/);

console.log('Episode range and WebView focus contract tests passed');
