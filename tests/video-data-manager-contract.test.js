const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-video-data.js', 'utf8');
const api = fs.readFileSync('src/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const menu = fs.readFileSync('src/ui-playback-menu.js', 'utf8');
const renderers = fs.readFileSync('src/ui-card-renderers.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const config = fs.readFileSync('src/config.js', 'utf8');

assert.match(build, /src\/ui-video-data\.js/);
assert.match(config, /videosCacheTtl: 120000/);
assert.match(config, /videosCacheEntries: 20/);
assert.match(config, /videosStaleCacheTtl:/);
assert.match(config, /videosPersistentEntries: 6/);
assert.match(config, /videosPersistentMaxBytes: 350000/);
assert.doesNotMatch(api, /videosMemory/);
assert.match(ui, /LampaYaniVideoData\.create/);
assert.match(ui, /loadVideos: function \(id, options\) \{ return videoData\.payload\(id, options\); \}/);
assert.match(ui, /videoData\.stagedList\(id, options, options\.onCached\)/);
assert.match(ui, /: videoData\.list\(id, options\)/);
assert.match(detail, /function loadDetailVideos\(\)/);
assert.match(detail, /var onCached = arguments\[0\]/);
assert.match(detail, /onCached: typeof onCached === 'function'/);
assert.match(detail, /videosAbort\.abort\(\)/);
assert.match(menu, /loadVideosForPlayback\(card\.yani_id\)/);
assert.match(renderers, /loadVideos\(card\.yani_id\)/);

function abortError() {
    const error = new Error('Aborted');
    error.name = 'AbortError';
    return error;
}

function fakeStorage() {
    const values = {};
    return {
        values: values,
        get: function (key, fallback) { return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback; },
        set: function (key, value) { values[key] = value; },
        remove: function (key) { delete values[key]; }
    };
}

function createManager(options) {
    const context = {
        window: {LampaYaniConfig: {
            videosCacheTtl: 120000,
            videosCacheEntries: 20,
            videosStaleCacheTtl: 86400000,
            videosPersistentEntries: 6,
            videosPersistentMaxBytes: 350000
        }},
        AbortController: AbortController,
        Promise: Promise,
        Error: Error
    };
    vm.runInNewContext(source, context);
    return context.window.LampaYaniVideoData.create(options);
}

function deferredFetch() {
    const calls = [];
    const fetch = function (id, options) {
        const item = {id: id, options: options};
        item.promise = new Promise(function (resolve, reject) {
            item.resolve = resolve;
            item.reject = reject;
            if (options && options.signal) {
                if (options.signal.aborted) {
                    reject(abortError());
                    return;
                }
                options.signal.addEventListener('abort', function () { reject(abortError()); });
            }
        });
        calls.push(item);
        return item.promise;
    };
    return {fetch: fetch, calls: calls};
}

(async function () {
    const clock = {now: 1000};
    const pending = deferredFetch();
    const manager = createManager({
        fetch: pending.fetch,
        ttl: 1000,
        maxEntries: 2,
        now: function () { return clock.now; }
    });

    const first = manager.list(42);
    const second = manager.payload(42);
    assert.strictEqual(pending.calls.length, 1, 'one in-flight /videos request must be shared');
    pending.calls[0].resolve({response: [{number: 10}, {number: 13}]});
    assert.deepStrictEqual(JSON.parse(JSON.stringify(await first)), [{number: 10}, {number: 13}]);
    assert.deepStrictEqual(JSON.parse(JSON.stringify((await second).response)), [{number: 10}, {number: 13}]);

    clock.now = 1500;
    await manager.list(42);
    assert.strictEqual(pending.calls.length, 1, 'TTL cache must reuse the completed payload');

    clock.now = 2500;
    const refreshed = manager.list(42);
    assert.strictEqual(pending.calls.length, 2, 'expired TTL must refetch');
    pending.calls[1].resolve({response: [{number: 1}]});
    assert.deepStrictEqual(JSON.parse(JSON.stringify(await refreshed)), [{number: 1}]);

    pending.calls[1].resolve = pending.calls[1].resolve;
    const third = manager.payload(7);
    const fourth = manager.payload(8);
    pending.calls[2].resolve({response: [{id: 7}]});
    pending.calls[3].resolve({response: [{id: 8}]});
    await third;
    await fourth;
    clock.now = 2600;
    const evicted = manager.payload(42);
    assert.ok(pending.calls.length >= 5, 'cache size limit must drop the oldest title');
    pending.calls[pending.calls.length - 1].resolve({response: [{number: 42}]});
    await evicted;

    const aborting = deferredFetch();
    const abortManager = createManager({fetch: aborting.fetch, ttl: 5000, maxEntries: 8, now: function () { return 1; }});
    const controller = new AbortController();
    const kept = abortManager.list(9);
    const cancelled = abortManager.list(9, {signal: controller.signal});
    assert.strictEqual(aborting.calls.length, 1);
    controller.abort();
    await assert.rejects(cancelled, function (error) { return error.name === 'AbortError'; });
    aborting.calls[0].resolve({response: [{number: 9}]});
    assert.deepStrictEqual(JSON.parse(JSON.stringify(await kept)), [{number: 9}], 'aborting one waiter must not cancel remaining consumers');

    const last = deferredFetch();
    const lastManager = createManager({fetch: last.fetch, ttl: 5000, maxEntries: 8, now: function () { return 1; }});
    const lastController = new AbortController();
    const only = lastManager.list(11, {signal: lastController.signal});
    lastController.abort();
    await assert.rejects(only, function (error) { return error.name === 'AbortError'; });
    await Promise.resolve();
    assert.strictEqual(last.calls[0].options.signal.aborted, true, 'closing the last waiter must abort the network request');

    const persistent = fakeStorage();
    const firstNetwork = deferredFetch();
    const firstManager = createManager({
        fetch: firstNetwork.fetch,
        storage: persistent,
        ttl: 1000,
        staleTtl: 10000,
        now: function () { return clock.now; }
    });
    clock.now = 5000;
    const storedRequest = firstManager.list(77);
    firstNetwork.calls[0].resolve({response: [{number: 1, dubbing: 'A'}]});
    await storedRequest;

    clock.now = 7000;
    const refreshNetwork = deferredFetch();
    const secondManager = createManager({
        fetch: refreshNetwork.fetch,
        storage: persistent,
        ttl: 1000,
        staleTtl: 10000,
        now: function () { return clock.now; }
    });
    let cachedStage = null;
    const staged = secondManager.stagedList(77, {}, function (videos, state) {
        cachedStage = {videos: videos, state: state};
    });
    assert.deepStrictEqual(JSON.parse(JSON.stringify(cachedStage.videos)), [{number: 1, dubbing: 'A'}]);
    assert.strictEqual(cachedStage.videos._yaniStaleDisplay, true, 'cached stage must be display-only');
    assert.strictEqual(cachedStage.state.stale, true, 'expired display data must be marked as stale');
    assert.strictEqual(refreshNetwork.calls.length, 1, 'stale display data must refresh in the background');
    refreshNetwork.calls[0].resolve({response: [{number: 2, dubbing: 'B'}]});
    assert.deepStrictEqual(JSON.parse(JSON.stringify(await staged)), [{number: 2, dubbing: 'B'}]);

    clock.now = 9000;
    const failedNetwork = deferredFetch();
    const offlineManager = createManager({
        fetch: failedNetwork.fetch,
        storage: persistent,
        ttl: 1000,
        staleTtl: 10000,
        now: function () { return clock.now; }
    });
    const offline = offlineManager.stagedList(77, {}, function () {});
    failedNetwork.calls[0].reject(new Error('offline'));
    const offlineVideos = await offline;
    assert.deepStrictEqual(JSON.parse(JSON.stringify(offlineVideos)), [{number: 2, dubbing: 'B'}], 'a refresh failure must keep the saved display snapshot');
    assert.strictEqual(offlineVideos._yaniStaleDisplay, true, 'offline fallback must stay display-only');

    console.log('video data manager contract tests passed');
})().catch(function (error) {
    console.error(error);
    process.exit(1);
});
