const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// The internal player gets every episode of the dubbing in Lampa's playlist so
// its own next/previous buttons and "Next episode" setting work. This drives the
// launch module with a stand-in for Lampa's player the way Lampa drives it.

const utilsContext = {window: {}};
vm.runInNewContext(fs.readFileSync('src/ui/ui-utils.js', 'utf8'), utilsContext);

const calls = {play: [], playlist: null, callbacks: 0, close: 0, notices: [], context: null, started: [], switches: 0,
    remembered: [], synced: []};
const resolver = {
    canResolve: (url) => /kodik/.test(url),
    resolve: (url, video) => (video.failResolve ? Promise.reject(new Error('blocked'))
        : Promise.resolve({url: 'https://cdn/' + video.video_id + '.m3u8', source: 'kodik'}))
};
const Lampa = {
    Player: {
        runas() {},
        play(item) { calls.play.push(item); },
        playlist(items) { calls.playlist = items; },
        callback() { calls.callbacks += 1; },
        close() { calls.close += 1; }
    },
    Noty: {show: (text) => calls.notices.push(text)}
};
const context = {
    window: {Lampa, LampaYaniUiUtils: utilsContext.window.LampaYaniUiUtils, LampaYaniStreamResolver: resolver},
    Lampa,
    LampaYaniUiUtils: utilsContext.window.LampaYaniUiUtils,
    LampaYaniStreamResolver: resolver,
    console: {log() {}, warn() {}, error() {}},
    Promise, Object, Array, String, Number, Math, JSON, Date, RegExp, Error, setTimeout, clearTimeout
};
vm.runInNewContext(fs.readFileSync('src/playback/ui-playback-launch.js', 'utf8'), context);

const direct = (url) => /\.m3u8|\.mp4/.test(String(url || ''));
const videos = [1, 2, 3].map((number) => ({
    video_id: 100 + number,
    number: String(number),
    iframe_url: 'https://kodik/' + number,
    watched: {end_time: number === 2 ? 300 : 0}
}));
videos[0].yani_stream_url = 'https://cdn/101.m3u8';
const card = {yani_id: 9, title: 'Тайтл'};
const group = {player: 'Kodik'};
let current = {card, group, videos, selected: videos[0]};

const launch = context.window.LampaYaniPlaybackLaunch.create({
    t: (key) => key,
    playbackReturnState: {session: 1},
    videoSourceUrl: (video) => video.yani_stream_url || video.iframe_url,
    isExternalPlayableUrl: (url) => direct(url),
    videoStreamHeaders: () => null,
    videoStreamQualities: () => null,
    isAndroidPlatform: () => false,
    isVkPlaybackSource: () => false,
    isCvhPlaybackSource: () => false,
    playbackWatcherApi: {
        context: () => current,
        setContext: (value) => { current = value; calls.context = value; },
        beginEpisodeSwitch: () => { calls.switches += 1; }
    },
    startPlaybackWatcher: (value) => calls.started.push(value),
    flushPlaybackProgress() {},
    restorePlaybackInteraction() {},
    rememberPlayback: (c, g, video) => calls.remembered.push(video.video_id),
    syncServerProgress: (video) => calls.synced.push(video.video_id)
});

const playlist = videos.map((video) => ({
    title: 'Тайтл · Серия ' + video.number,
    url: video.yani_stream_url || video.iframe_url,
    time: 0,
    source: video
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

(async () => {
    assert.strictEqual(launch.playInternalPlayer(playlist[0], playlist), true, 'the first episode starts');
    assert.strictEqual(calls.playlist.length, 3, 'every episode of the dubbing is in Lampa\'s playlist');
    assert.strictEqual(typeof calls.playlist[0].url, 'string', 'the playing episode keeps its address');
    assert.strictEqual(typeof calls.playlist[1].url, 'function', 'another episode is resolved only when opened');
    assert.strictEqual(calls.playlist[1].episode, '2');
    assert.strictEqual(calls.started.length, 1);

    // Lampa switches to episode 2: it calls the function, then plays the entry
    // and runs its callback.
    let continued = 0;
    const second = calls.playlist[1];
    second.url(() => { continued += 1; });
    await flush(); await flush();
    assert.strictEqual(calls.switches, 1, 'the watcher is told the episode is being switched');
    assert.strictEqual(continued, 1, 'Lampa is allowed to continue once the stream is known');
    assert.strictEqual(second.url, 'https://cdn/102.m3u8', 'the entry now carries the resolved stream');
    second.callback();
    assert.strictEqual(calls.context.selected, videos[1], 'the plugin follows the episode Lampa opened');
    assert.strictEqual(videos[1].yani_resume_seek, 300, 'the episode resumes where the viewer stopped');
    assert.strictEqual(calls.started.length, 2, 'the watcher is restarted for the new episode');
    assert.deepStrictEqual(calls.remembered.slice(), [102]);
    assert.deepStrictEqual(calls.synced.slice(), [102]);
    assert.strictEqual(calls.callbacks, 2, 'leaving the player is bound to the new episode');
    assert.strictEqual(typeof calls.playlist[0].url, 'function',
        'the previous episode gets its function back, so switching to it is noticed too');

    // An episode whose stream cannot be resolved closes the player with a notice
    // instead of leaving Lampa waiting.
    videos[2].failResolve = true;
    calls.playlist[2].url(() => { continued += 1; });
    await flush(); await flush();
    assert.strictEqual(continued, 1, 'Lampa is not told to continue');
    assert.deepStrictEqual(calls.notices.slice(), ['player_episode_unavailable']);
    assert.strictEqual(calls.close, 1, 'the player is closed, which also clears Lampa\'s waiting state');

    console.log('native playlist tests passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
