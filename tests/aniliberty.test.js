const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// AniLiberty episodes join the dubbing list of a YummyAnime title. The release
// comes from the alias YummyAnime stores, or from a search confirmed by the
// MyAnimeList or Shikimori id - never from a similar name alone.

const context = {console, Promise, Date};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/playback/aniliberty.js', 'utf8'), context);
const AniLiberty = context.LampaYaniAniLiberty;
const plain = (value) => JSON.parse(JSON.stringify(value));

const release = {
    id: 9542,
    alias: 'sousou-no-frieren',
    mal: {id: 52991},
    shikimori: {id: 52991},
    episodes: [
        {id: 'a', ordinal: 1, duration: 1500, opening: {start: null, stop: null}, ending: {start: null, stop: null},
            hls_480: 'https://cache.example/1/480.m3u8', hls_720: 'https://cache.example/1/720.m3u8', hls_1080: 'https://cache.example/1/1080.m3u8'},
        {id: 'b', ordinal: 2, duration: 1561, opening: {start: 1, stop: 89}, ending: {start: 1430, stop: 1520},
            hls_480: 'https://cache.example/2/480.m3u8', hls_720: 'https://cache.example/2/720.m3u8', hls_1080: null},
        {id: 'c', ordinal: 3, duration: 1400, hls_480: null, hls_720: null, hls_1080: null}
    ]
};

const videos = AniLiberty.toVideos(release);
assert.strictEqual(videos.length, 2, 'an episode without streams is left out');
assert.strictEqual(videos[0].number, '1');
assert.strictEqual(videos[0].iframe_url, 'https://cache.example/1/1080.m3u8', 'the best quality starts playback');
assert.deepStrictEqual(Object.keys(videos[0].yani_source_qualities).join(','), '1080p,720p,480p');
assert.deepStrictEqual(plain(videos[0].skips), {}, 'empty marks are not invented');
assert.strictEqual(videos[1].iframe_url, 'https://cache.example/2/720.m3u8');
assert.deepStrictEqual(plain(videos[1].skips), {opening: {time: 1, length: 88}, ending: {time: 1430, length: 90}});
assert.deepStrictEqual(plain(videos[1].data), {player: 'AniLiberty', dubbing: 'AniLibria'});
assert.strictEqual(videos[1].video_id, '', 'no YummyAnime video id: progress stays local');

assert.ok(AniLiberty.sameIds({yani_remote_ids: {myanimelist_id: 52991}}, release));
assert.ok(AniLiberty.sameIds({yani_remote_ids: {shikimori_id: 52991}}, release));
assert.ok(!AniLiberty.sameIds({yani_remote_ids: {myanimelist_id: 59978}}, release), 'a sequel with another id does not match');
assert.ok(!AniLiberty.sameIds({yani_remote_ids: {}}, release));

(async () => {
    const calls = [];
    const api = {
        anilibertyRelease: (key) => { calls.push('release:' + key); return Promise.resolve(release); },
        anilibertySearch: (query) => { calls.push('search:' + query); return Promise.resolve([{id: 1, alias: 'other', mal: {id: 1}}, {id: 9542, alias: 'sousou-no-frieren', mal: {id: 52991}}]); }
    };

    // The alias YummyAnime stores is used directly.
    const byAlias = AniLiberty.create({api});
    const payload = {response: [{video_id: 7, number: '1', data: {player: 'Kodik', dubbing: 'Other'}}]};
    const merged = await byAlias.withVideos({yani_id: 10661, title: 'Фрирен', yani_remote_ids: {anilibria_alias: 'sousou-no-frieren'}}, payload);
    assert.strictEqual(calls.join(','), 'release:sousou-no-frieren');
    assert.strictEqual(merged.response.length, 3);
    assert.strictEqual(payload.response.length, 1, 'the cached YummyAnime payload is not changed');
    await byAlias.withVideos({yani_id: 10661, yani_remote_ids: {anilibria_alias: 'sousou-no-frieren'}}, payload);
    assert.strictEqual(calls.length, 1, 'the release is cached for the title');

    // Without an alias the search result must carry the same id.
    calls.length = 0;
    const bySearch = AniLiberty.create({api});
    const found = await bySearch.videos({yani_id: 1, title: 'Фрирен', original_title: 'Sousou no Frieren', yani_remote_ids: {myanimelist_id: 52991}});
    assert.strictEqual(found.length, 2);
    assert.strictEqual(calls.join(','), 'search:Sousou no Frieren,release:sousou-no-frieren');

    calls.length = 0;
    const noIds = await AniLiberty.create({api}).videos({yani_id: 2, title: 'Фрирен', yani_remote_ids: {}});
    assert.strictEqual(noIds.length, 0, 'no id, no guessing');
    assert.strictEqual(calls.length, 0);

    const wrongIds = await AniLiberty.create({api}).videos({yani_id: 3, title: 'Фрирен 2', yani_remote_ids: {myanimelist_id: 59978}});
    assert.strictEqual(wrongIds.length, 0, 'a search hit with another id is rejected');

    // Turned off or failing: the YummyAnime list is returned as it was.
    const off = AniLiberty.create({api, enabled: () => false});
    assert.strictEqual(await off.withVideos({yani_id: 4, yani_remote_ids: {anilibria_alias: 'x'}}, payload), payload);
    const failing = AniLiberty.create({api: {anilibertyRelease: () => Promise.reject(new Error('down'))}});
    const origWarn = console.warn; console.warn = () => {};
    assert.strictEqual(await failing.withVideos({yani_id: 5, yani_remote_ids: {anilibria_alias: 'x'}}, payload), payload);
    console.warn = origWarn;

    const ui = fs.readFileSync('src/ui.js', 'utf8');
    assert.match(ui, /'aniliberty'\];/);
    assert.match(ui, /enabled: function \(\) \{ return isPlaybackSourceEnabled\('aniliberty'\); \}/);
    assert.match(ui, /withExtraVideos: function \(card, payload\) \{ return aniLiberty\.withVideos\(card, payload\); \}/);
    assert.match(ui, /video\.yani_source_qualities \|\| null;/);
    assert.match(fs.readFileSync('src/playback/ui-playback-menu.js', 'utf8'), /return withExtraVideos\(card, payload\)\.catch\(function \(\) \{ return payload; \}\);/);
    assert.match(fs.readFileSync('build.js', 'utf8'), /src\/playback\/aniliberty\.js/);
    assert.match(fs.readFileSync('src/core/api.js', 'utf8'), /https:\/\/aniliberty\.top\/api\/v1/);

    console.log('AniLiberty source checks passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
