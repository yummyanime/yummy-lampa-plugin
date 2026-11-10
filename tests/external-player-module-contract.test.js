const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/playback/ui-external-player.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /'src\/playback\/ui-external-player\.js'[\s\S]*'src\/ui\.js'/,
    'the external player module must load before the main UI');
assert.match(ui, /var externalPlayer = LampaYaniExternalPlayer\.create\(\{/);
['openExternalVideo', 'openExternalUri', 'openAndroidAppUri', 'openYummyTv', 'prepareExternalRestore',
    'cancelExternalRestore', 'restoreExternalFocus', 'installExternalRestoreHooks', 'tryExternalOpen'].forEach((name) => {
    assert.doesNotMatch(ui, new RegExp('function ' + name + '\\('), name + ' belongs to ui-external-player.js');
    assert.match(source, new RegExp('function ' + name + '\\('), name + ' must live in ui-external-player.js');
});
assert.doesNotMatch(ui, /var externalRestoreState\b/, 'the restore state belongs to the module');

// The trailers controller receives openExternalVideo as a value while ui.js is
// still initialising, so the module has to be created before that wiring.
const createdAt = ui.indexOf('var externalPlayer = LampaYaniExternalPlayer.create(');
const openAt = ui.indexOf('var openExternalVideo = externalPlayer.openExternalVideo;');
const trailersAt = ui.indexOf('openExternalVideo: openExternalVideo,');
assert.ok(createdAt > 0 && openAt > createdAt, 'the module must be created before its functions are taken');
assert.ok(trailersAt > openAt, 'openExternalVideo must be assigned before it is handed to the trailers controller');

const context = {window: {}};
vm.runInNewContext(source, context);
const api = context.window.LampaYaniExternalPlayer.create({});
['openExternalVideo', 'openExternalUri', 'openAndroidAppUri', 'yummyTvEnabled', 'yummyTvAnimeId', 'openYummyTv',
    'prepareExternalRestore', 'cancelExternalRestore', 'currentControllerName', 'showExternalPlaybackOptions'].forEach((name) => {
    assert.strictEqual(typeof api[name], 'function', name + ' must be exported');
});

console.log('external player module contract checks passed');
