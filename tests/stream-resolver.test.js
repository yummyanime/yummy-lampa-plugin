const assert = require('assert');
const fs = require('fs');

global.window = global;
global.LampaYaniConfig = {requestTimeout: 1000};
global.LampaYaniEpisode = {
    normalize: function (value) { return String(value == null ? '' : value).trim(); },
    same: function (left, right) { return Number(left) === Number(right); }
};
global.fetch = async function (url) {
    if (String(url).indexOf('plapi.cdnvideohub.com/api/v1/player/sv/playlist') >= 0) {
        return {
            ok: true,
            text: async function () {
                return JSON.stringify({items: [
                    {episode: 2, voiceStudio: 'AniLibria', vkId: 'cvh-video-2'}
                ]});
            }
        };
    }
    if (String(url).indexOf('plapi.cdnvideohub.com/api/v1/player/sv/video/cvh-video-2') >= 0) {
        return {
            ok: true,
            text: async function () {
                return JSON.stringify({
                    failoverHost: 'vd.example.test',
                    sources: {
                        mpegMediumUrl: 'https://vd.example.test/?type=2&token=480',
                        mpegHighUrl: 'https://vd.example.test/?type=3&token=720',
                        mpegFullHdUrl: 'https://vd.example.test/?type=5&token=1080'
                    }
                });
            }
        };
    }
    if (String(url).indexOf('player.aksor.tv/api/video/test-hash') >= 0) {
        return {
            ok: true,
            text: async function () {
                return JSON.stringify({
                    qualities: {
                        q720: 'https://cdn.example/video/720.mpd',
                        q1080: 'https://cdn.example/video/1080.mpd'
                    }
                });
            }
        };
    }
    if (String(url).indexOf('video.sibnet.ru/shell.php?videoid=1502426') >= 0) {
        return {
            ok: true,
            text: async function () {
                return '<script>player.src([{src: "/v/test-token/1502426.mp4", type: "video/mp4"}]);</script>';
            }
        };
    }
    if (String(url).indexOf('rutube.ru/api/play/options/70e53a86c25f5dab63d1b1151bb8c619') >= 0) {
        return {
            ok: true,
            text: async function () {
                return JSON.stringify({video_balancer: {m3u8: 'https://bl.rutube.ru/route/master.m3u8?token=1'}});
            }
        };
    }
    if (String(url).indexOf('bl.rutube.ru/route/master.m3u8') >= 0) {
        return {
            ok: true,
            text: async function () {
                return '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=900000,RESOLUTION=640x360\n360/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1920x1080\nhttps://cdn.rutube.test/1080/index.m3u8';
            }
        };
    }
    if (String(url).indexOf('vk.com/video_ext.php?oid=-228989270&id=456239999') >= 0) {
        return {
            ok: true,
            text: async function () {
                return '<script>var playerParams = {"url360":"https:\\/\\/cdn.vk.test\\/video-360.mp4?token=1\\u0026extra=2","url720":"https:\\/\\/cdn.vk.test\\/video-720.mp4?token=1"};</script>';
            }
        };
    }
    if (String(url).indexOf('vk.com/video_ext.php?oid=-228989270&id=456239022') >= 0) {
        return {
            ok: true,
            text: async function () { return '<script>window.embedErrorCallback?.(8);</script>'; }
        };
    }
    if (String(url).indexOf('ru.yummyani.me/iframeVK.html?token=opaque') >= 0) {
        return {
            ok: true,
            text: async function () {
                return '<iframe src="https:\/\/vk.com\/video_ext.php?oid=-228989270&amp;id=456239888"></iframe>';
            }
        };
    }
    if (String(url).indexOf('vk.com/video_ext.php?oid=-228989270&id=456239888') >= 0) {
        return {
            ok: true,
            text: async function () {
                return '<script>url1080 = "https:\/\/vkvd.test\/stream\/1080.mp4?token=opaque";</script>';
            }
        };
    }
    throw new Error('Unexpected request: ' + url);
};

eval(fs.readFileSync(require.resolve('../src/stream-resolver.js'), 'utf8'));

assert.strictEqual(LampaYaniStreamResolver.canResolve('https://player.aksor.tv/video/test-hash'), true);
assert.strictEqual(LampaYaniStreamResolver.canResolve('https://video.sibnet.ru/shell.php?videoid=1502426'), true);
assert.strictEqual(LampaYaniStreamResolver.canResolve('https://rutube.ru/play/embed/70e53a86c25f5dab63d1b1151bb8c619'), true);
assert.strictEqual(LampaYaniStreamResolver.canResolve('https://ru.yummyani.me/iframeVK.html?id=-228989270_456239999'), true);
assert.strictEqual(LampaYaniStreamResolver.canResolve('https://ru.yummyani.me/iframeVK.html?token=opaque'), true);
assert.strictEqual(LampaYaniStreamResolver.canResolve('https://ru.yummyani.me/iframeCVH.html?dubbing_code=AniLibria&anime_id=31240&episode=2'), true);
assert.strictEqual(LampaYaniStreamResolver.isDirectVideoUrl('https://cdn.example/video/master.mpd?token=1'), true);

Promise.all([
    LampaYaniStreamResolver.resolve('https://player.aksor.tv/video/test-hash'),
    LampaYaniStreamResolver.resolve('https://video.sibnet.ru/shell.php?videoid=1502426'),
    LampaYaniStreamResolver.resolve('https://rutube.ru/play/embed/70e53a86c25f5dab63d1b1151bb8c619'),
    LampaYaniStreamResolver.resolve('https://ru.yummyani.me/iframeVK.html?id=-228989270_456239999'),
    LampaYaniStreamResolver.resolve('https://ru.yummyani.me/iframeVK.html?token=opaque'),
    LampaYaniStreamResolver.resolve('https://ru.yummyani.me/iframeCVH.html?dubbing_code=AniLibria&anime_id=31240&episode=2')
]).then(function (results) {
    var result = results[0];
    assert.strictEqual(result.source, 'aksor');
    assert.strictEqual(result.quality, '1080p');
    assert.strictEqual(result.url, 'https://cdn.example/video/1080.mpd');
    var sibnet = results[1];
    assert.strictEqual(sibnet.source, 'sibnet');
    assert.strictEqual(sibnet.url, 'https://video.sibnet.ru/v/test-token/1502426.mp4');
    assert.strictEqual(sibnet.headers.Referer, 'https://video.sibnet.ru/shell.php?videoid=1502426');
    assert.strictEqual(sibnet.headers.Origin, 'https://video.sibnet.ru');
    var rutube = results[2];
    assert.strictEqual(rutube.source, 'rutube');
    assert.strictEqual(rutube.quality, '1080p');
    assert.strictEqual(rutube.qualities['360p'], 'https://bl.rutube.ru/route/360/index.m3u8');
    assert.strictEqual(rutube.url, 'https://cdn.rutube.test/1080/index.m3u8');
    assert.strictEqual(rutube.headers.Origin, 'https://rutube.ru');
    var vk = results[3];
    assert.strictEqual(vk.source, 'vk');
    assert.strictEqual(vk.quality, '720p');
    assert.strictEqual(vk.qualities['360p'], 'https://cdn.vk.test/video-360.mp4?token=1&extra=2');
    assert.strictEqual(vk.url, 'https://cdn.vk.test/video-720.mp4?token=1');
    assert.strictEqual(vk.headers.Origin, 'https://vk.com');
    var wrappedVk = results[4];
    assert.strictEqual(wrappedVk.source, 'vk');
    assert.strictEqual(wrappedVk.quality, '1080p');
    assert.strictEqual(wrappedVk.url, 'https://vkvd.test/stream/1080.mp4?token=opaque');
    var cvh = results[5];
    assert.strictEqual(cvh.source, 'cvh');
    assert.strictEqual(cvh.direct, true);
    assert.strictEqual(cvh.quality, '1080p');
    assert.strictEqual(cvh.url, 'https://vd.example.test/?type=5&token=1080');
    assert.strictEqual(cvh.qualities['720p'], 'https://vd.example.test/?type=3&token=720');
    assert.match(cvh.headers['User-Agent'], /Chrome\/149/);
    return LampaYaniStreamResolver.resolve('https://ru.yummyani.me/iframeVK.html?id=-228989270_456239022').then(function () {
        throw new Error('Unavailable VK video unexpectedly resolved');
    }, function (error) {
        assert.strictEqual(error.message, 'VK video unavailable');
        console.log('stream-resolver tests passed');
    });
}).catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
