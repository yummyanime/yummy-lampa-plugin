const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/playback/ui-playback-watcher.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const playbackLaunch = fs.readFileSync('src/playback/ui-playback-launch.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /'src\/playback\/ui-playback-menu\.js', 'src\/playback\/ui-playback-watcher\.js'[\s\S]*'src\/ui\.js'/,
    'the watcher must load after the playback menu and before the main UI');
assert.match(ui, /var playbackWatcherApi = LampaYaniPlaybackWatcher\.create\(\{/);
assert.match(ui, /var startPlaybackWatcher = playbackWatcherApi\.startPlaybackWatcher;/);
assert.match(ui, /var stopPlaybackWatcher = playbackWatcherApi\.stopPlaybackWatcher;/);
assert.match(ui, /var flushPlaybackProgress = playbackWatcherApi\.flushPlaybackProgress;/);
['watchPlayback', 'startPlaybackWatcher', 'recoverInternalPlayback', 'prefetchNextEpisode',
    'advanceToNextEpisode', 'closeInternalPlayer', 'showSkipPrompt', 'storeObservedPlayback'].forEach((name) => {
    assert.doesNotMatch(ui, new RegExp('function ' + name + '\\('), name + ' belongs to ui-playback-watcher.js');
    assert.match(source, new RegExp('function ' + name + '\\('), name + ' must live in ui-playback-watcher.js');
});

// The playback context is owned by the watcher; the main UI only sets and
// reads it through the module, never through a variable of its own.
assert.doesNotMatch(ui, /^    var playbackContext\b/m);
assert.match(playbackLaunch, /playbackWatcherApi\.setContext\(\{card: card, group: group, videos: videos, selected: selected\}\);/);

const context = {window: {}};
vm.runInNewContext(source, context);
const api = context.window.LampaYaniPlaybackWatcher.create({});
['setContext', 'context', 'autoNextEnabled', 'startPlaybackWatcher', 'stopPlaybackWatcher',
    'flushPlaybackProgress', 'destroySkipPrompt'].forEach((name) => {
    assert.strictEqual(typeof api[name], 'function', name + ' must be exported');
});
assert.strictEqual(api.context(), null, 'no episode is playing before a launch');
const episode = {card: {yani_id: 1}};
api.setContext(episode);
assert.strictEqual(api.context(), episode);

console.log('playback watcher module contract checks passed');
