(function (window) {
    'use strict';

    /*
     * AniLiberty (AniLibria) episodes as one more dubbing of a YummyAnime
     * title. YummyAnime itself only lists Kodik, CVH, Alloha, VK and a few
     * other players; AniLiberty publishes its own HLS streams with CORS, so
     * they play directly in Lampa.
     *
     * The release is found by the AniLibria alias YummyAnime stores in
     * remote_ids. Without one, a title search is accepted only when the
     * release carries the same MyAnimeList or Shikimori id: a similar name
     * alone could put another season's episodes under this title.
     */

    var PLAYER = 'AniLiberty';
    var DUBBING = 'AniLibria';
    var CACHE_TTL = 10 * 60 * 1000;
    var cache = {};

    function positive(value) {
        var number = Number(value);
        return isFinite(number) && number > 0 ? number : 0;
    }

    function remoteIds(card) {
        return card && (card.yani_remote_ids || card.remote_ids) || {};
    }

    function sameIds(card, release) {
        var ids = remoteIds(card);
        var mal = positive(ids.myanimelist_id || ids.mal_id);
        var shikimori = positive(ids.shikimori_id);
        var releaseMal = positive(release && release.mal && release.mal.id);
        var releaseShikimori = positive(release && release.shikimori && release.shikimori.id);
        return Boolean(mal && releaseMal === mal || shikimori && releaseShikimori === shikimori);
    }

    function searchTitles(card) {
        var titles = [];
        [card && card.original_title, card && card.title].concat(card && card.yani_titles || []).forEach(function (title) {
            var value = String(title || '').trim();
            if (value && titles.indexOf(value) < 0) titles.push(value);
        });
        return titles.slice(0, 2);
    }

    function findRelease(card, api) {
        var alias = String(remoteIds(card).anilibria_alias || '').trim();
        if (alias) {
            return api.anilibertyRelease(alias).then(function (release) {
                return release && Array.isArray(release.episodes) ? release : null;
            });
        }
        var titles = searchTitles(card);
        var ids = remoteIds(card);
        if (!titles.length || !positive(ids.myanimelist_id || ids.mal_id) && !positive(ids.shikimori_id)) {
            return Promise.resolve(null);
        }
        return titles.reduce(function (chain, title) {
            return chain.then(function (found) {
                if (found) return found;
                return api.anilibertySearch(title).then(function (results) {
                    var match = (results || []).filter(function (release) { return sameIds(card, release); })[0];
                    return match ? api.anilibertyRelease(match.alias || match.id) : null;
                }).catch(function () { return null; });
            });
        }, Promise.resolve(null)).then(function (release) {
            return release && Array.isArray(release.episodes) ? release : null;
        });
    }

    // Every published quality, best first; the first one starts playback and
    // the whole map feeds Lampa's quality switch.
    function streams(episode) {
        var result = {};
        [['1080p', episode.hls_1080], ['720p', episode.hls_720], ['480p', episode.hls_480]].forEach(function (pair) {
            if (pair[1] && /^https?:\/\//i.test(String(pair[1]))) result[pair[0]] = String(pair[1]);
        });
        return result;
    }

    function mark(range) {
        var start = Number(range && range.start);
        var stop = Number(range && range.stop);
        if (!isFinite(start) || !isFinite(stop) || start < 0 || stop <= start) return null;
        return {time: start, length: stop - start};
    }

    /**
     * Release episodes as YummyAnime-shaped video records. They carry no
     * YummyAnime video id, so their progress stays on this device.
     */
    function toVideos(release) {
        var videos = [];
        (release && release.episodes || []).forEach(function (episode) {
            var number = positive(episode && episode.ordinal);
            if (!number) return;
            var qualities = streams(episode);
            var labels = Object.keys(qualities);
            if (!labels.length) return;
            var skips = {};
            var opening = mark(episode.opening);
            var ending = mark(episode.ending);
            if (opening) skips.opening = opening;
            if (ending) skips.ending = ending;
            videos.push({
                video_id: '',
                number: String(number),
                index: number,
                duration: positive(episode.duration),
                iframe_url: qualities[labels[0]],
                yani_source_qualities: qualities,
                skips: skips,
                data: {player: PLAYER, dubbing: DUBBING},
                aniliberty: {release_id: release.id, episode_id: episode.id || ''}
            });
        });
        return videos;
    }

    function create(deps) {
        deps = deps || {};
        var api = deps.api || window.LampaYaniApi;
        var enabled = deps.enabled || function () { return true; };
        var now = deps.now || function () { return Date.now(); };

        // Episodes for one title, cached for a while either way so pressing
        // Watch again does not repeat the lookup. Failures resolve empty:
        // this source is an extra and must never block the others.
        function videos(card) {
            if (!enabled() || !card || !card.yani_id || !api || !api.anilibertyRelease) return Promise.resolve([]);
            var key = String(card.yani_id);
            var entry = cache[key];
            if (entry && now() - entry.at < CACHE_TTL) return entry.request;
            var request = findRelease(card, api).then(toVideos).catch(function (error) {
                console.warn('[YummyAnime] AniLiberty lookup failed', error);
                return [];
            });
            cache[key] = {at: now(), request: request};
            return request;
        }

        // Adds AniLiberty episodes to a YummyAnime videos payload without
        // touching the cached payload object.
        function withVideos(card, payload) {
            return videos(card).then(function (extra) {
                if (!extra.length) return payload;
                var list = payload && payload.response ? payload.response : payload;
                var merged = (Array.isArray(list) ? list : []).concat(extra.map(function (video) {
                    return Object.assign({}, video, {skips: Object.assign({}, video.skips)});
                }));
                return payload && payload.response ? Object.assign({}, payload, {response: merged}) : merged;
            });
        }

        return {
            videos: videos,
            withVideos: withVideos
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.AniLiberty = window.LampaYaniAniLiberty = {
        create: create,
        toVideos: toVideos,
        sameIds: sameIds,
        PLAYER: PLAYER
    };
}(window));
