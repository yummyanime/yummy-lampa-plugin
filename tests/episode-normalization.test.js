const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {window: {}};
vm.runInNewContext(fs.readFileSync('src/episode.js', 'utf8'), context);
const episode = context.window.LampaYaniEpisode;

assert.strictEqual(episode.normalize('01'), '1');
assert.strictEqual(episode.normalize('000'), '0');
assert.strictEqual(episode.normalize(2), '2');
assert.strictEqual(episode.normalize(' OVA 01 '), 'OVA 01');
assert.strictEqual(episode.normalize('1.5'), '1.5');
assert.strictEqual(episode.key('01'), episode.key('1'));
assert.strictEqual(episode.same('01', 1), true);
assert.strictEqual(episode.same('OVA 01', 'OVA 1'), false);
assert.strictEqual(episode.same('', ''), false);
assert.strictEqual(episode.valueOf({number: '02', index: 9}), '2');
assert.strictEqual(episode.valueOf({episode: '003'}), '3');
assert.strictEqual(episode.valueOf({index: '04'}), '4');

console.log('episode normalization tests passed');
