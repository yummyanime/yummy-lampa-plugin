const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/playback/ui-playback-launch.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /'src\/playback\/ui-playback-launch\.js'[\s\S]*'src\/ui\.js'/, 'the launch module must load before the main UI');
assert.match(ui, /var playbackLaunch = LampaYaniPlaybackLaunch\.create\(\{/);
['launchVideo', 'launchResolvedVideo', 'openEmbeddedEpisode', 'launchAllohaPlayer', 'playInternalDirectVideo',
    'internalPlayerPlaylistItem', 'openWebOsPlayer', 'openExternalPlayer', 'playInternalPlayer'].forEach((name) => {
    assert.doesNotMatch(ui, new RegExp('function ' + name + '\\('), name + ' belongs to ui-playback-launch.js');
    assert.match(source, new RegExp('function ' + name + '\\('), name + ' must live in ui-playback-launch.js');
});

// The launch code drives the playback watcher, so it is created after it and
// receives the watcher's functions as they are, not wrappers around names that
// would still be undefined.
const watcherAt = ui.indexOf('var destroySkipPrompt = playbackWatcherApi.destroySkipPrompt;');
const launchAt = ui.indexOf('var playbackLaunch = LampaYaniPlaybackLaunch.create({');
assert.ok(watcherAt > 0 && launchAt > watcherAt, 'the launch module must be created after the playback watcher');
assert.match(ui, /playbackWatcherApi: playbackWatcherApi,/);
assert.match(ui, /startPlaybackWatcher: startPlaybackWatcher,/);

// Platform checks and source settings are shared with the settings and menus;
// they stay in ui.js.
['isAndroidPlatform', 'isWebOsPlatform', 'playbackTargetPreference', 'isPlaybackSourceEnabled'].forEach((name) => {
    assert.match(ui, new RegExp('function ' + name + '\\('), name + ' stays in ui.js');
});

const context = {window: {}};
vm.runInNewContext(source, context);
const api = context.window.LampaYaniPlaybackLaunch.create({});
['launchVideo', 'launchResolvedVideo', 'allohaIframeEnabled', 'acknowledgeAllohaWebNotice', 'videoResolverUrl',
    'registerAndroidDirectVideoTube', 'openExternalPlayer', 'playInternalPlayer'].forEach((name) => {
    assert.strictEqual(typeof api[name], 'function', name + ' must be exported');
});

console.log('playback launch module contract checks passed');
