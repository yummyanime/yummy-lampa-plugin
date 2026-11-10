const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const accountScreen = fs.readFileSync('src/screens/ui-account.js', 'utf8');
const settingsSource = fs.readFileSync('src/ui/ui-settings.js', 'utf8');
const watcher = fs.readFileSync('src/playback/ui-playback-watcher.js', 'utf8');
const history = fs.readFileSync('src/playback/ui-playback-history.js', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');

assert.match(settingsSource, /name: 'yani_auto_sync_progress', type: 'trigger', default: true/);
assert.match(settingsSource, /name: 'yani_auto_manage_lists', type: 'trigger', default: false/);
assert.match(history, /function maybeAutoManageList\(card, saved, video, position, duration\)/);
assert.match(history, /halfCount >= 2/);
assert.match(history, /allFinished \? \{id: 2, key: 'completed'\}/);
assert.match(history, /Number\(currentList\) === 3/);
assert.match(ui, /autoProgressSyncEnabled/);
assert.match(history, /function autoProgressSyncEnabled\(\)/);
assert.match(history, /function pullRemoteProgress/);
assert.match(history, /pullRemoteProgress\(300\)/);
assert.match(homeScreen, /importRemoteEntries\(remoteEntries\)/);
assert.match(history, /if \(!window\.LampaYaniAuth \|\| !window\.LampaYaniAuth\.token\(\)/, 'automatic server sync must require authorization');
assert.match(watcher, /lastLocalSync >= 10000/, 'local progress writes must be throttled');
assert.match(watcher, /lastServerSync >= 60000/, 'server progress writes must be throttled');
assert.match(accountScreen, /if \(!autoProgressSyncEnabled\(\)\) \{/,
    'manual account synchronization must be shown when automatic sync is disabled');
assert.match(history, /if \(!autoProgressSyncEnabled\(\) \|\| !window\.LampaYaniApi \|\| !video\) return;/,
    'automatic API updates must respect the setting');
// Progress is addressed by video id. An episode without one cannot reach the
// account, and saying so beats failing silently — that reads as broken sync.
assert.match(history, /if \(!video\.video_id\) \{/, 'a missing video id must be handled explicitly');
assert.match(history, /progress stays on this device only/, 'an unsyncable episode must be reported');
assert.match(watcher, /function flushPlaybackProgress\(remote, expectedContext\)/);
assert.match(ui, /Lampa\.Player\.callback\(function \(\) \{[\s\S]{0,120}flushPlaybackProgress\(true, callbackContext\)/,
    'closing the internal player must flush progress');
assert.match(history, /context\.card\.yani_resume = \{/);
assert.match(history, /max_episode: saved\.max_episode/);
assert.match(history, /function refreshVisiblePlaybackProgress\(card\)/);
assert.match(history, /rendered\.addClass\('yani-history-card'\)\.attr\('data-yani-history-id'/);
assert.match(ui, /LampaYaniPlaybackHistory\.create/);
assert.match(i18n, /messages\.ru\.auto_sync_progress/);
assert.match(i18n, /messages\.en\.auto_sync_progress/);
assert.match(i18n, /messages\.uk\.auto_sync_progress/);
assert.match(i18n, /messages\.ru\.auto_manage_lists/);
assert.match(i18n, /messages\.en\.auto_manage_lists/);
assert.match(i18n, /messages\.uk\.auto_manage_lists/);


// Every way of starting an episode must reach the account, not just the
// internal player: a watch is a watch whichever player showed it.
assert.match(ui, /function launchResolvedVideo[\s\S]{0,1100}syncServerProgress\(selected\)/,
    'the internal and external launch path must report the watch');
assert.match(ui, /function openEmbeddedEpisode[\s\S]{0,600}syncServerProgress\(selected\)/,
    'the embedded site player must report the watch too');
console.log('progress sync contract tests passed');
