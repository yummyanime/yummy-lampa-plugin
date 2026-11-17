const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// Progress watched through other Lampa sources lives in Lampa.Timeline under
// hash([season, '', episode, original title]). The importer must find it,
// put it on the matching YummyAnime title and send it to the account.

const storage = {};
const viewed = {};
const hash = (value) => 'h:' + String(value);
const sent = [];

const Lampa = {
    Storage: {
        get: (key, fallback) => Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : fallback,
        set: (key, value) => { storage[key] = JSON.parse(JSON.stringify(value)); },
        field: (key) => Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : undefined
    },
    Utils: {hash},
    Timeline: {
        view: (key) => {
            const road = viewed[key];
            return Object.assign({hash: key, percent: 0, time: 0, duration: 0, updated: 0}, road || {});
        }
    },
    Favorite: {get: () => []},
    Noty: {show() {}}
};

const context = {
    console,
    setTimeout,
    Promise,
    $: () => ({trigger() {}, length: 0}),
    HTMLElement: function () {}
};
context.window = context;
context.Lampa = Lampa;
context.LampaYaniAuth = {token: () => 'token'};
context.LampaYaniApi = {syncVideoWatches: (watches) => { sent.push(watches); return Promise.resolve(true); }};
context.LampaYaniUiUtils = {videoData: (video) => ({dubbing: video.dubbing, player: video.player})};

vm.createContext(context);
vm.runInContext(fs.readFileSync('src/core/episode.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('src/playback/ui-playback-history.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('src/playback/lampa-timeline-import.js', 'utf8'), context);

const history = context.LampaYaniPlaybackHistory.create({
    t: (key) => key,
    playerKey: () => 'kodik',
    videoSourceUrl: () => '',
    addCardPlaybackProgress() {}
});

const anime = {yani_id: 501, title: 'Тестовое аниме', poster: 'p.jpg', yani_episodes: {aired: 12}};
const videos = [];
for (let n = 1; n <= 12; n++) {
    videos.push({number: n, video_id: 1000 + n, dubbing: 'Other', player: 'Kodik', duration: 1440});
    videos.push({number: n, video_id: 2000 + n, dubbing: 'AniLibria', player: 'Kodik', duration: 1440});
}
const movie = {id: 77, source: 'tmdb', name: 'Test', original_name: 'Tesuto', genre_ids: [16], number_of_episodes: 12};

// Episodes 1-3 finished, episode 4 stopped at 10 minutes, all through another source.
const now = Date.now();
viewed[hash([1, '', 1, 'Tesuto'].join(''))] = {percent: 100, time: 1430, duration: 1440, updated: now - 4000};
viewed[hash([1, '', 2, 'Tesuto'].join(''))] = {percent: 98, time: 1420, duration: 1440, updated: now - 3000};
// An old record without seconds or a timestamp.
viewed[hash([1, '', 3, 'Tesuto'].join(''))] = {percent: 95};
viewed[hash([1, '', 4, 'Tesuto'].join(''))] = {percent: 41, time: 600, duration: 1440, updated: now - 1000};
// A second season must not be read into the first-season title.
viewed[hash([2, '', 5, 'Tesuto'].join(''))] = {percent: 50, time: 700, duration: 1440, updated: now};

let searches = 0;
const importer = context.LampaYaniLampaTimelineImport.create({
    findYummyMatches: () => { searches += 1; return Promise.resolve([anime]); },
    isNativeAnimeCard: (card) => Boolean(card && card.genre_ids && card.genre_ids.indexOf(16) >= 0),
    loadVideos: () => Promise.resolve(videos),
    importExternalProgress: history.importExternalProgress,
    getPlayback: history.getPlayback,
    autoProgressSyncEnabled: history.autoProgressSyncEnabled
});

const progress = importer.lampaProgress(movie);
assert.strictEqual(Object.keys(progress).join(','), '1,2,3,4', 'only first-season episodes with a position are read');

(async () => {
    const result = await importer.importCard(movie);
    assert.strictEqual(result.imported, 4);
    assert.strictEqual(result.sent, true);

    const saved = history.getPlayback(501);
    assert.strictEqual(saved.number, '4', 'the most recently watched episode becomes the resume point');
    assert.strictEqual(saved.time, 600);
    assert.strictEqual(saved.duration, 1440);
    assert.strictEqual(saved.max_episode, 3, 'finished episodes move the queue');
    assert.strictEqual(saved.updated_at, now - 1000, 'the outside timestamp is kept');
    assert.ok(saved.finished_episodes['1'] && saved.finished_episodes['2'] && saved.finished_episodes['3']);
    assert.ok(!saved.finished_episodes['4']);
    assert.strictEqual(saved.card.anime_id, 501);

    assert.strictEqual(sent.length, 1);
    const ids = sent[0].map((watch) => watch.video_id).sort((a, b) => a - b).join(',');
    assert.strictEqual(ids, '1001,1002,1003,1004', 'one video per episode is sent');
    assert.strictEqual(sent[0].find((watch) => watch.video_id === 1003).time, 1368, 'a percentage-only record becomes seconds');

    // Nothing changed in Lampa: no search, no request, no second send.
    const again = await importer.importCard(movie);
    assert.strictEqual(again.unchanged, true);
    assert.strictEqual(searches, 1);
    assert.strictEqual(sent.length, 1);

    // The extension's own newer view is not overridden by older outside progress.
    history.rememberPlayback(anime, {player: 'Kodik'}, {number: 7, video_id: 2007, duration: 1440, dubbing: 'AniLibria', watched: {end_time: 300}});
    viewed[hash([1, '', 5, 'Tesuto'].join(''))] = {percent: 20, time: 290, duration: 1440, updated: now - 500};
    const later = await importer.importCard(movie);
    assert.strictEqual(later.imported, 1, 'only the new episode is imported');
    assert.strictEqual(history.getPlayback(501).number, '7', 'the newer local resume point stays');
    assert.strictEqual(sent.length, 2);
    assert.strictEqual(sent[1].length, 1);
    assert.strictEqual(sent[1][0].video_id, 2005, 'the dubbing already used on this device is preferred');

    // Turned off: nothing is read.
    storage.yani_lampa_timeline_import = false;
    viewed[hash([1, '', 6, 'Tesuto'].join(''))] = {percent: 90, time: 1300, duration: 1440, updated: now};
    const off = await importer.importCard(movie);
    assert.strictEqual(off.imported, 0);
    assert.strictEqual(sent.length, 2);
    delete storage.yani_lampa_timeline_import;

    // Ambiguous matches are skipped.
    const ambiguous = context.LampaYaniLampaTimelineImport.create({
        findYummyMatches: () => Promise.resolve([anime, {yani_id: 502}]),
        isNativeAnimeCard: () => true,
        loadVideos: () => Promise.resolve(videos),
        importExternalProgress: () => { throw new Error('must not import'); }
    });
    const skipped = await ambiguous.importCard({id: 78, original_name: 'Other', genre_ids: [16]});
    assert.strictEqual(skipped.imported, 0);

    // A film maps onto a single-episode title.
    viewed[hash('Eiga')] = {percent: 60, time: 3000, duration: 5400, updated: now};
    const film = {id: 90, original_title: 'Eiga', genre_ids: [16]};
    const filmAnime = {yani_id: 600, title: 'Фильм'};
    const filmImporter = context.LampaYaniLampaTimelineImport.create({
        findYummyMatches: () => Promise.resolve([filmAnime]),
        isNativeAnimeCard: () => true,
        loadVideos: () => Promise.resolve([{number: 1, video_id: 6001, duration: 5400}]),
        importExternalProgress: history.importExternalProgress,
        getPlayback: history.getPlayback,
        autoProgressSyncEnabled: () => false
    });
    const filmResult = await filmImporter.importCard(film);
    assert.strictEqual(filmResult.imported, 1);
    assert.strictEqual(history.getPlayback(600).time, 3000);

    const ui = fs.readFileSync('src/ui.js', 'utf8');
    assert.match(ui, /LampaYaniLampaTimelineImport\.create/);
    assert.match(ui, /lampaTimelineImport\.start\(\);/);
    assert.match(fs.readFileSync('build.js', 'utf8'), /src\/playback\/lampa-timeline-import\.js/);
    assert.match(fs.readFileSync('src/ui/ui-settings.js', 'utf8'), /yani_lampa_timeline_import/);

    console.log('lampa timeline import checks passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
