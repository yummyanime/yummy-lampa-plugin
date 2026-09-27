const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui-player.js'), 'utf8');

assert.match(source, /screensaverPreviousState\s*=\s*typeof screensaver\.enabled === 'boolean'/,
    'iframe player must preserve the previous Lampa screensaver state');
assert.match(source, /screensaver\.disable\(\)/,
    'iframe player must disable the Lampa screensaver while playback is open');
assert.match(source, /screensaverPreviousState === true[\s\S]*screensaver\.enable\(\)/,
    'iframe player must restore an enabled Lampa screensaver after playback');
assert.match(source, /wakeLock\.request\('screen'\)/,
    'iframe player must request a platform screen wake lock when supported');
assert.match(source, /releasePlaybackAwake\(\);[\s\S]*claimScreen\(false\);[\s\S]*deps\.goBack/,
    'Back must release playback wake state before restoring the title card');
assert.match(source, /destroy:\s*function[\s\S]*releasePlaybackAwake\(\)/,
    'destroy must release playback wake state even when Back was not used');

console.log('iframe player awake contract passed');
