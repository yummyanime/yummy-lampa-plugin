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
                return '<script>window.cur={"response":{"items":[{"files":{"mp4_1080":"https:\\/\\/vkvd346.okcdn.ru\\/?token=1\\u0026extra=2","hls_ondemand":"https:\\/\\/vkvd346.okcdn.ru\\/video\\/master.m3u8?token=1"}}]}};</script>';
            }
        };
    }
    if (String(url).indexOf('vk.com/video_ext.php?oid=-228989270&id=456239777') >= 0) {
        return {
            ok: true,
            text: async function () {
                return '<script>window.cur={"response":{"items":[{"files":{"mp4_1080":"https:\\/\\/vkvd346.okcdn.ru\\/?token=android","hls_ondemand":"https:\\/\\/vkvd346.okcdn.ru\\/video\\/master.m3u8?token=1"}}]}};</script>';
            }
        };
    }
    if (String(url).indexOf('vkvd346.okcdn.ru/video/master.m3u8?token=1') >= 0) {
        return {
            ok: true,
            text: async function () {
                return '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n360/track.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1280x720\n720/track.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080\n1080/track.m3u8';
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
    assert.strictEqual(vk.quality, '1080p');
    assert.strictEqual(vk.qualities['1080p'], 'https://vkvd346.okcdn.ru/?token=1&extra=2');
    assert.strictEqual(vk.qualities['360p'], 'https://vkvd346.okcdn.ru/video/360/track.m3u8');
    assert.strictEqual(vk.qualities['720p'], 'https://vkvd346.okcdn.ru/video/720/track.m3u8');
    assert.strictEqual(vk.qualities.auto, 'https://vkvd346.okcdn.ru/video/master.m3u8?token=1');
    assert.strictEqual(vk.url, 'https://vkvd346.okcdn.ru/?token=1&extra=2');
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
    global.AndroidJS = {};
    return LampaYaniStreamResolver.resolve('https://ru.yummyani.me/iframeVK.html?id=-228989270_456239777').then(function (androidVk) {
        delete global.AndroidJS;
        assert.strictEqual(androidVk.quality, '1080p');
        assert.strictEqual(androidVk.url, 'https://vkvd346.okcdn.ru/video/1080/track.m3u8');
        return LampaYaniStreamResolver.resolve('https://ru.yummyani.me/iframeVK.html?id=-228989270_456239022');
    }).then(function () {
        throw new Error('Unavailable VK video unexpectedly resolved');
    }, function (error) {
        delete global.AndroidJS;
        assert.strictEqual(error.message, 'VK video unavailable');
        console.log('stream-resolver tests passed');
    });
}).catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});

// CVH signs its CDN links for the agent that requested them, and the CDN then
// refuses playback from any other agent. The internal Android player is a
// <video> in the WebView and cannot send custom headers, so it always requests
// with the WebView's own agent: asking CVH with a hardcoded desktop agent
// produced links that player could never fetch.
const cvhSource = fs.readFileSync('src/stream-resolver.js', 'utf8');
assert.match(cvhSource, /function deviceUserAgent\(\)/, 'the playing agent must be resolved in one place');
assert.match(cvhSource, /window\.navigator && window\.navigator\.userAgent/, 'the device agent is the one that plays');
const cvhStart = cvhSource.indexOf('function resolveCvh');
const cvhEnd = cvhSource.indexOf('function resolveAksor', cvhStart);
assert.ok(cvhStart >= 0 && cvhEnd > cvhStart, 'the CVH resolver must exist');
const cvhBody = cvhSource.slice(cvhStart, cvhEnd);
assert.ok(!/'User-Agent': CHROME_UA/.test(cvhBody), 'CVH must not sign its links for a hardcoded desktop agent');
assert.ok(cvhBody.includes("'User-Agent': playbackUserAgent"), 'the request and the playback headers must use one agent');
assert.strictEqual(
    (cvhBody.match(/playbackUserAgent/g) || []).length,
    3,
    'the agent is declared once and used for both the request and the playback headers'
);

// VK signs its CDN links exactly like CVH does - the same okcdn hosts, the same
// srcAg parameter - so it failed in the internal Android player for the same
// reason and takes the same fix.
const vkStart = cvhSource.indexOf('function resolveVk');
const vkEnd = cvhSource.indexOf('function resolve(url)', vkStart);
assert.ok(vkStart >= 0 && vkEnd > vkStart, 'the VK resolver must exist');
const vkBody = cvhSource.slice(vkStart, vkEnd);
assert.ok(!/'User-Agent': CHROME_UA/.test(vkBody), 'VK must not ask for links signed for a hardcoded desktop agent');
assert.ok(vkBody.includes("'User-Agent': playbackUserAgent"), 'the VK page request must use the playing agent');

// Sibnet checks the referrer on the first hop only and then redirects to a
// signed file that needs no headers. The internal player cannot send that
// referrer, so the redirect is resolved during resolution instead.
assert.match(cvhSource, /function followRedirects\(url, headers\)/, 'the redirect resolver must exist');
const sibStart = cvhSource.indexOf('function resolveSibnet');
const sibEnd = cvhSource.indexOf('function absoluteUrl', sibStart);
const sibBody = cvhSource.slice(sibStart, sibEnd);
assert.ok(sibStart >= 0 && sibEnd > sibStart, 'the Sibnet resolver must exist');
assert.ok(sibBody.includes('followRedirects(streamUrl, playbackHeaders)'), 'Sibnet must hand the player the redirected URL');
assert.ok(sibBody.includes('finalUrl || streamUrl'), 'an unresolved redirect must fall back to the original URL');
