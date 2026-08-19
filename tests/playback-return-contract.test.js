const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const menu = fs.readFileSync('src/ui-playback-menu.js', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');
const sources = ui + '\n' + menu;
assert.match(detail, /beginPlaybackNavigation\(button, scroll\.render\(\)\);[\s\S]{0,100}openTitlePlaybackOptions\(data\)/);
assert.match(menu, /function showPlaybackSelect\(params\)[\s\S]{0,1200}if \(settled\) return;[\s\S]{0,200}restorePlaybackInteraction\(\)/);
assert.match(menu, /function loadVideosForPlayback/);
assert.match(ui, /function openEmbeddedEpisode/);
assert.match(ui, /if \(playbackReturnState\.active\) \{\s*cancelExternalRestore\(\)/);
assert.match(menu, /function chooseEpisode[\s\S]{0,1200}showPlaybackSelect\(\{/);
assert.match(menu, /function openVideos[\s\S]{0,8000}showPlaybackSelect\(\{/);
assert.match(menu, /function showDirectPlaybackOptions[\s\S]{0,2200}showPlaybackSelect\(\{/);
assert.match(menu, /androidExternalPlayerAvailable/);
assert.match(menu, /if \(items\.length === 1\)/);
assert.match(menu, /function openTitlePlaybackOptions[\s\S]{0,900}showPlaybackSelect\(\{/);
const actionsStart = menu.indexOf('function showYummyActions(card, originElement, originCollection)');
const actionsEnd = menu.indexOf('\n        function openVideos', actionsStart);
const actionsSource = menu.slice(actionsStart, actionsEnd);
assert.ok(actionsStart >= 0 && actionsEnd > actionsStart, 'showYummyActions must exist');
assert.match(actionsSource, /beginPlaybackNavigation\(originElement, originCollection\);[\s\S]{0,100}openVideos\(card\)/);

assert.match(ui, /function prepareExternalRestore\(\)[\s\S]{0,500}var origin = playbackReturnSnapshot\(\)/);
assert.match(ui, /function cancelExternalRestore\(\)[\s\S]{0,300}externalRestoreState\.pending = false/);
assert.match(ui, /function openExternalUri[\s\S]{0,1500}cancelExternalRestore\(\);[\s\S]{0,50}return false/);
assert.match(ui, /function openAndroidAppUri[\s\S]{0,1200}cancelExternalRestore\(\);[\s\S]{0,50}return false/);
assert.match(ui, /externalRestoreState\.controller = origin\.controller/);
assert.match(ui, /externalRestoreState\.departed/);
assert.match(ui, /setTimeout\(restoreExternalFocus, 1500\)/);
assert.match(ui, /if \(!externalRestoreState\.departed && elapsed < 1200\)[\s\S]{0,150}setTimeout\(restoreExternalFocus, 1200 - elapsed\)/);
assert.match(ui, /Lampa\.Player\.callback\(function \(\) \{[\s\S]{0,120}flushPlaybackProgress\(true, callbackContext\);[\s\S]{0,80}restorePlaybackInteraction\(\)/);
assert.match(ui, /param: \{name: 'yani_yummytv_enabled', type: 'trigger', default: false\}/);
assert.match(ui, /Storage\.get\('yani_yummytv_enabled', false\)/);
assert.match(sources, /var beginPlaybackNavigation = playbackMenu\.beginPlaybackNavigation|function beginPlaybackNavigation/);

const settingsStart = ui.indexOf("param: {name: 'yani_home_sections_title'");
const noticeIndex = ui.indexOf("param: {name: 'yani_repo_notice', type: 'title'}");
assert.ok(settingsStart >= 0 && noticeIndex > settingsStart, 'repository notice must remain at the bottom of settings');
assert.ok(!ui.slice(noticeIndex, noticeIndex + 250).includes('onChange'), 'repository notice must not be actionable');
['ru', 'en', 'uk'].forEach((language) => {
    assert.match(i18n, new RegExp(`messages\\.${language}\\.repo_notice\\s*=`));
});

console.log('playback return contract checks passed');
