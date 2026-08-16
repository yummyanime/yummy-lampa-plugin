const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const requested = [];
let nextBody = '{}';

const context = {
    window: {LampaYaniConfig: {requestTimeout: 5000}},
    console,
    setTimeout,
    clearTimeout,
    Promise,
    fetch: (url) => {
        requested.push(url);
        return Promise.resolve({ok: true, status: 200, text: () => Promise.resolve(nextBody)});
    }
};
context.LampaYaniConfig = context.window.LampaYaniConfig;
vm.runInNewContext(fs.readFileSync('src/aniskip.js', 'utf8'), context);

const aniskip = context.window.LampaYaniAniSkip;

const payload = JSON.stringify({
    found: true,
    results: [
        {interval: {startTime: 61.5, endTime: 151.5}, skipType: 'op'},
        {interval: {startTime: 1320, endTime: 1410}, skipType: 'ed'},
        {interval: {startTime: 10, endTime: 20}, skipType: 'mixed-op'},
        {interval: {startTime: 90, endTime: 30}, skipType: 'op'}
    ]
});

const parsed = aniskip.parse(payload);
assert.strictEqual(parsed.op.start, 61.5);
assert.strictEqual(parsed.op.end, 151.5);
assert.strictEqual(parsed.ed.start, 1320);
assert.ok(!parsed['mixed-op'], 'only op and ed are used');

// A malformed interval must not survive: seeking to it would jump backwards
// and trap playback in a loop.
const reversed = aniskip.parse(JSON.stringify({results: [{interval: {startTime: 90, endTime: 30}, skipType: 'ed'}]}));
assert.deepEqual(Object.keys(reversed), []);
assert.deepEqual(Object.keys(aniskip.parse('not json')), []);

nextBody = payload;
aniskip.times(20, 3, 1440).then((intervals) => {
    assert.strictEqual(requested[0], 'https://api.aniskip.com/v2/skip-times/20/3?types[]=op&types[]=ed&episodeLength=1440');
    assert.strictEqual(intervals.op.end, 151.5);

    // The second lookup for the same episode must be served from the cache.
    return aniskip.times(20, 3, 1440).then(() => {
        assert.strictEqual(requested.length, 1, 'repeat lookups must not hit the network');
    });
}).then(() => {
    // A title without a MyAnimeList id resolves empty instead of rejecting:
    // skip timestamps must never interrupt playback.
    return aniskip.times(0, 3).then((intervals) => assert.deepEqual(Object.keys(intervals), []));
}).then(() => {
    nextBody = '{"found":false,"results":null}';
    return aniskip.times(21, 9).then((intervals) => assert.deepEqual(Object.keys(intervals), []));
}).then(() => {
    nextBody = payload;
    return aniskip.times(20, 3, 1680).then(() => {
        assert.strictEqual(requested.length, 3, 'a different episode length must not reuse the previous cache entry');
        assert.ok(requested[2].indexOf('episodeLength=1680') >= 0, 'AniSkip must receive the measured episode length');
    });
}).then(() => {
    console.log('aniskip tests passed');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
