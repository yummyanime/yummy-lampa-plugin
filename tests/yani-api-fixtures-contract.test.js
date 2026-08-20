const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const fixturesDir = path.join('tests', 'fixtures', 'yani-api');
const manifest = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'manifest.json'), 'utf8'));

function loadFixture(file) {
    return JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf8'));
}

function createWindowContext() {
    const window = {
        LampaYaniConfig: {
            version: 'test',
            apiBase: 'https://api.example.invalid',
            statusUrl: 'https://status.example.invalid/status.json',
            applicationToken: function () { return 'test-token'; },
            cacheTtl: 0,
            cacheEntries: 1,
            requestTimeout: 1000,
            requestRetries: 0
        },
        Lampa: {
            Storage: {
                get: function (_key, fallback) { return fallback; },
                set: function () {}
            }
        }
    };
    const context = {
        window: window,
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        Promise: Promise,
        URL: URL,
        URLSearchParams: URLSearchParams,
        AbortController: AbortController,
        fetch: function () {
            return Promise.reject(new Error('fixture contract tests must not call the network'));
        }
    };
    context.Lampa = window.Lampa;
    context.LampaYaniConfig = window.LampaYaniConfig;
    return context;
}

const context = createWindowContext();
vm.runInNewContext(fs.readFileSync('src/config.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('src/episode.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('src/api.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('src/ui-home-sections.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('src/ui-notifications.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('src/ui-account-lists.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('src/ui-utils.js', 'utf8'), context);

const api = context.window.LampaYaniApi;
const homeSections = context.window.LampaYaniHomeSections;
const notifications = context.window.LampaYaniNotifications;
const accountLists = context.window.LampaYaniAccountLists;
const uiUtils = context.window.LampaYaniUiUtils;

assert.ok(Array.isArray(manifest.fixtures) && manifest.fixtures.length >= 8, 'manifest must list all API domains');
assert.deepStrictEqual(
    manifest.fixtures.map((entry) => entry.id).sort(),
    ['catalog', 'comments', 'detail', 'history-progress', 'lists', 'notifications', 'schedule', 'videos'].sort(),
    'manifest must cover catalog, detail, videos, schedule, lists, comments, notifications, history/progress'
);

manifest.fixtures.forEach((entry) => {
    assert.ok(fs.existsSync(path.join(fixturesDir, entry.file)), 'missing fixture file: ' + entry.file);
    const fixture = loadFixture(entry.file);
    assert.strictEqual(fixture.anonymized, true, entry.id + ' must be marked anonymized');
    const blob = JSON.stringify(fixture);
    assert.doesNotMatch(blob, /yummyani\.me|api\.yani\.tv|cdn\.yani/i, entry.id + ' must not embed live YummyAnime hosts');
    assert.doesNotMatch(blob, /@[a-z0-9.-]+\.[a-z]{2,}/i, entry.id + ' must not embed email addresses');
});

function assertAnimeCore(item, label) {
    assert.ok(item && (item.anime_id || item.animeId || item.id), label + ' needs anime_id');
    assert.ok(item.title || item.name || item.original_title, label + ' needs a title');
    const poster = item.poster;
    assert.ok(
        typeof poster === 'string' && poster ||
        poster && typeof poster === 'object' && (poster.medium || poster.huge || poster.large || poster.url),
        label + ' needs a poster string or size object'
    );
}

function unwrapVideos(payload) {
    const value = payload && payload.response !== undefined ? payload.response : payload;
    return Array.isArray(value) ? value : value && (value.videos || value.items) || [];
}

function videoSourceUrl(video) {
    const data = uiUtils.videoData(video);
    return uiUtils.normalizeVideoUrl(
        video.yani_stream_url || data.yani_stream_url || video.iframe_url || video.url || video.player_url || video.link ||
        data.iframe_url || data.url || data.player_url || data.link || ''
    );
}

// Catalog
const catalog = loadFixture('catalog.json');
const catalogItems = api.normalize(catalog);
assert.strictEqual(catalogItems.length, 2, 'catalog fixture must normalize to anime rows');
catalogItems.forEach((item, index) => assertAnimeCore(item, 'catalog[' + index + ']'));
assert.ok(catalogItems[0].rating && typeof catalogItems[0].rating === 'object', 'catalog rating object shape');
assert.ok(catalogItems[0].user && catalogItems[0].user.list, 'catalog user.list progress shape');
assert.ok(Number(catalogItems[0].episodes.count) > 0, 'catalog episodes.count');

// Detail
const detail = loadFixture('detail.json');
const detailBody = detail.response;
assertAnimeCore(detailBody, 'detail');
assert.ok(detailBody.remote_ids && (detailBody.remote_ids.myanimelist_id || detailBody.remote_ids.shikimori_id), 'detail remote_ids');
assert.ok(Array.isArray(detailBody.genres) && detailBody.genres[0].title, 'detail genres');
assert.ok(detailBody.rating && Number(detailBody.rating.average) > 0, 'detail rating.average');
assert.ok(detailBody.user && detailBody.user.list && detailBody.user.list.list, 'detail nested list membership');
assert.strictEqual(api.normalize({response: [detailBody]}).length, 1, 'detail can round-trip through catalog normalize');

// Videos
const videosFixture = loadFixture('videos.json');
const videos = unwrapVideos(videosFixture).filter((video) => video && videoSourceUrl(video));
assert.ok(videos.length >= 3, 'videos fixture must keep playable rows');
videos.forEach((video, index) => {
    assert.ok(video.video_id || video.id, 'videos[' + index + '] needs video_id');
    assert.ok(video.number != null || video.index != null, 'videos[' + index + '] needs episode number');
    assert.ok(videoSourceUrl(video), 'videos[' + index + '] needs iframe/url/player_url');
    const data = uiUtils.videoData(video);
    assert.ok(data.dubbing || data.translation || data.player, 'videos[' + index + '] data.dubbing/player');
});
assert.ok(videos.some((video) => /sibnet|kodik|alloha/i.test(videoSourceUrl(video))), 'videos should cover multiple player hosts');

// Schedule
const schedule = loadFixture('schedule.json');
const scheduleItems = api.normalize(schedule);
assert.ok(scheduleItems.length >= 2, 'schedule fixture must normalize');
scheduleItems.forEach((item, index) => {
    assertAnimeCore(item, 'schedule[' + index + ']');
    const episodes = item.episodes || {};
    assert.ok(episodes.next_date || episodes.prev_date, 'schedule[' + index + '] needs prev_date/next_date');
});

// Lists
const lists = loadFixture('lists.json');
const listDefs = api.normalize(lists.lists);
assert.ok(listDefs.length >= 5, 'account lists catalog');
listDefs.forEach((item, index) => {
    assert.ok(typeof item.id === 'number', 'lists[' + index + '].id');
    assert.ok(item.title, 'lists[' + index + '].title');
});
const listItems = accountLists.normalize(lists.list_items);
assert.strictEqual(listItems.length, 2, 'list page unwraps nested anime rows');
listItems.forEach((item, index) => {
    assertAnimeCore(item, 'list_items[' + index + ']');
    assert.ok(item.user && item.user.list, 'list_items[' + index + '] user.list progress');
});
const listStats = api.normalize(lists.list_stats);
assert.ok(listStats.length >= 1 && typeof listStats[0].count === 'number', 'list stats counts');

// Comments
const comments = loadFixture('comments.json');
const topComments = api.normalizeComments(comments.comments);
assert.strictEqual(topComments.length, 2, 'top-level comments');
topComments.forEach((item, index) => {
    assert.ok(item.id, 'comments[' + index + '].id');
    assert.ok(item.name || item.author, 'comments[' + index + '] author');
    assert.ok(item.text || item.body, 'comments[' + index + '] text');
    assert.ok(item.time, 'comments[' + index + '].time');
});
const children = api.normalizeComments(comments.children);
assert.strictEqual(children.length, 1, 'comment children envelope');
assert.ok(children[0].text, 'child comment text');

// Notifications
const notes = loadFixture('notifications.json');
const normalizedNotes = notifications.normalize(notes);
assert.strictEqual(normalizedNotes.length, 3, 'notifications feed');
assert.strictEqual(normalizedNotes[0].title, 'New episode & translation');
assert.ok(normalizedNotes[0].text.indexOf('Episode 4') >= 0);
assert.strictEqual(normalizedNotes[0].anime_slug, 'sample-chronicle');
assert.strictEqual(normalizedNotes[0].kind, 'episode');
assert.strictEqual(normalizedNotes[0].unread, true);
assert.strictEqual(normalizedNotes[1].kind, 'comment');
assert.strictEqual(normalizedNotes[1].unread, false);
assert.strictEqual(notifications.isOpenable(normalizedNotes[0]), true);
assert.strictEqual(notifications.isOpenable(normalizedNotes[2]), false);
const counts = notes.counts.response;
assert.ok(typeof counts.unread_count === 'number', 'notification counts.unread_count');

// History & progress
const history = loadFixture('history-progress.json');
const remoteHistory = homeSections.normalizeRemoteHistory(history.watch_history);
assert.strictEqual(remoteHistory.length, 2, 'watch history rows');
assert.strictEqual(remoteHistory[0].anime_id, 10001);
assert.strictEqual(remoteHistory[0].video_id, 50002);
assert.strictEqual(remoteHistory[0].number, '1');
assert.strictEqual(remoteHistory[0].time, 333);
assert.strictEqual(remoteHistory[0].poster, 'https://img.example/history/10001.jpg');
assert.strictEqual(remoteHistory[1].anime_id, 10002);
assert.strictEqual(remoteHistory[1].player, 'Kodik');
assert.deepStrictEqual(history.sync_video_progress_body, {time: 333, duration: 1440, times: []});
assert.ok(Array.isArray(history.sync_video_watches_body.videos), 'sync watches body.videos');
history.sync_video_watches_body.videos.forEach((item, index) => {
    assert.ok(item.video_id, 'sync watches[' + index + '].video_id');
    assert.ok(typeof item.time === 'number', 'sync watches[' + index + '].time');
    assert.ok(item.date, 'sync watches[' + index + '].date');
});

const apiSource = fs.readFileSync('src/api.js', 'utf8');
assert.match(apiSource, /normalize:\s*function\s*\(payload\)/);
assert.match(apiSource, /normalizeComments:\s*function\s*\(payload\)/);
assert.match(apiSource, /syncVideoProgress:\s*function\s*\(videoId,\s*time,\s*duration\)/);
assert.match(apiSource, /times:\s*\[\]/);
assert.match(apiSource, /syncVideoWatches:\s*function\s*\(videos\)/);
assert.match(apiSource, /JSON\.stringify\(\{videos:\s*videos\s*\|\|\s*\[\]\}\)/);

console.log('yani api fixtures contract tests passed');
