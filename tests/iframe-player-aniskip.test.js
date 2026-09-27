const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui.js'), 'utf8');
const embedded = source.match(/function openEmbeddedEpisode\([\s\S]*?\n    }\n\n    \/\*\*/);

assert.ok(embedded, 'embedded player launcher must exist');
assert.match(embedded[0], /stopPlaybackWatcher\(\);[\s\S]*destroySkipPrompt\(\);[\s\S]*Lampa\.Activity\.push/,
    'embedded playback must remove internal-player AniSkip controls before opening an iframe');

console.log('iframe player AniSkip contract passed');
