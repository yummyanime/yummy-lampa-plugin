(function (window) {
    'use strict';

    // Opening and ending timestamps from AniSkip, keyed by MyAnimeList id.
    // YummyAnime already exposes that id on a title (`yani_remote_ids`), which
    // is the only thing AniSkip needs, so no extra matching is involved.

    var API_BASE = 'https://api.aniskip.com/v2';
    var CACHE_TTL = 24 * 60 * 60 * 1000;
    var CACHE_LIMIT = 200;
    var cache = {};
    var cacheKeys = [];

    function responseText(value) {
        if (typeof value === 'string') return value;
        if (value === undefined || value === null) return '';
        try { return JSON.stringify(value); } catch (ignore) { return String(value); }
    }

    function timeout() {
        return Number((window.LampaYaniConfig && LampaYaniConfig.requestTimeout) || 15000);
    }

    function nativeRequestText(url) {
        return new Promise(function (resolve, reject) {
            if (!window.Lampa || !Lampa.Reguest) return reject(new Error('Lampa native request is unavailable'));
            var network = new Lampa.Reguest();
            if (network.timeout) network.timeout(timeout());
            network.native(url, function (value) {
                resolve(responseText(value));
            }, function (error, exception) {
                var message = (error && (error.responseText || error.message || error.status)) || exception || 'AniSkip request failed';
                reject(new Error(String(message)));
            }, false, {dataType: 'text', timeout: timeout()});
        });
    }

    function browserRequestText(url) {
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = setTimeout(function () { if (controller) controller.abort(); }, timeout());
        var options = {method: 'GET', credentials: 'omit'};
        if (controller) options.signal = controller.signal;
        return fetch(url, options).then(function (response) {
            clearTimeout(timer);
            return response.text().then(function (text) {
                // AniSkip answers 404 with a valid body when it simply has no
                // timestamps for an episode, so the body is parsed either way.
                return text;
            });
        }).catch(function (error) {
            clearTimeout(timer);
            throw error;
        });
    }

    function requestText(url) {
        var isAndroid = !!(window.AndroidJS || window.Android) ||
            !!(window.Lampa && Lampa.Platform && Lampa.Platform.is && Lampa.Platform.is('android'));
        if (isAndroid && window.Lampa && Lampa.Reguest) {
            return nativeRequestText(url).catch(function () { return browserRequestText(url); });
        }
        return browserRequestText(url);
    }

    function remember(key, value) {
        delete cache[key];
        cache[key] = {time: Date.now(), value: value};
        cacheKeys = cacheKeys.filter(function (item) { return item !== key; });
        cacheKeys.push(key);
        while (cacheKeys.length > CACHE_LIMIT) delete cache[cacheKeys.shift()];
        return value;
    }

    function cached(key) {
        var item = cache[key];
        if (!item || Date.now() - item.time > CACHE_TTL) return null;
        return item.value;
    }

    function parse(text) {
        var payload;
        try { payload = JSON.parse(text); } catch (error) { return {}; }
        var results = payload && payload.results;
        if (!Array.isArray(results)) return {};
        var intervals = {};
        results.forEach(function (result) {
            var interval = result && result.interval;
            var type = String(result && result.skipType || '').toLowerCase();
            if (!interval || (type !== 'op' && type !== 'ed')) return;
            var start = Number(interval.startTime);
            var end = Number(interval.endTime);
            if (!isFinite(start) || !isFinite(end) || end <= start) return;
            intervals[type] = {start: start, end: end};
        });
        return intervals;
    }

    /**
     * Resolves `{op: {start, end}, ed: {start, end}}` for one episode. Missing
     * data resolves to an empty object rather than rejecting: skip timestamps
     * are a convenience and must never interrupt playback.
     */
    function times(malId, episode, episodeLength) {
        malId = Number(malId) || 0;
        episode = Number(episode) || 0;
        if (!malId || !episode) return Promise.resolve({});
        var length = Math.max(0, Math.round(Number(episodeLength) || 0));
        var key = malId + ':' + episode + ':' + length;
        var hit = cached(key);
        if (hit) return Promise.resolve(hit);
        var url = API_BASE + '/skip-times/' + malId + '/' + episode +
            '?types[]=op&types[]=ed&episodeLength=' + length;
        return requestText(url).then(function (text) {
            return remember(key, parse(text));
        }).catch(function (error) {
            console.warn('[YummyAnime] AniSkip lookup failed', error);
            return {};
        });
    }

    // Durations closer than this belong to the same cut of an episode, so the
    // opening sits at the same second in both files.
    var SAME_CUT_SECONDS = 2;

    /**
     * Skip marks YummyAnime stores on the video itself:
     * `skips: {opening: {time, length}, ending: {time, length}}`. They are
     * measured on that very file, so they win over AniSkip, which is matched
     * to the episode only by its length.
     */
    function fromVideo(video, episodeLength) {
        var skips = video && video.skips;
        var intervals = {};
        if (!skips || typeof skips !== 'object') return intervals;
        var limit = Number(episodeLength) || Number(video.duration) || 0;
        [['op', skips.opening], ['ed', skips.ending]].forEach(function (pair) {
            var mark = pair[1];
            if (!mark || typeof mark !== 'object') return;
            var start = Number(mark.time);
            var length = Number(mark.length);
            if (!isFinite(start) || !isFinite(length) || start < 0 || length <= 0) return;
            var end = start + length;
            if (limit > 0 && end > limit + SAME_CUT_SECONDS) return;
            intervals[pair[0]] = {start: start, end: limit > 0 ? Math.min(end, limit) : end};
        });
        return intervals;
    }

    function sameEpisode(left, right) {
        var episode = window.LampaYaniEpisode;
        if (episode && episode.same) return episode.same(episode.valueOf(left), episode.valueOf(right));
        return String(left && left.number || '') !== '' && String(left.number) === String(right && right.number);
    }

    /**
     * Marks of another dubbing of the same episode. Dubbings are often laid
     * over the same video; when the durations match to the second the
     * opening is at the same place, otherwise the marks are not borrowed.
     */
    function borrowed(video, videos, episodeLength) {
        var duration = Number(video && video.duration) || Number(episodeLength) || 0;
        var intervals = {};
        if (!(duration > 0)) return intervals;
        (videos || []).forEach(function (other) {
            if (!other || other === video || !sameEpisode(video, other)) return;
            if (video.video_id && other.video_id === video.video_id) return;
            var otherDuration = Number(other.duration) || 0;
            if (!(otherDuration > 0) || Math.abs(otherDuration - duration) > SAME_CUT_SECONDS) return;
            var marks = fromVideo(other, duration);
            if (marks.op && !intervals.op) intervals.op = marks.op;
            if (marks.ed && !intervals.ed) intervals.ed = marks.ed;
        });
        return intervals;
    }

    // Fills the types missing from `base` with those found in `extra`.
    function merge(base, extra) {
        var result = {};
        ['op', 'ed'].forEach(function (type) {
            if (base && base[type]) result[type] = base[type];
            else if (extra && extra[type]) result[type] = extra[type];
        });
        return result;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.AniSkip = window.LampaYaniAniSkip = {
        times: times,
        parse: parse,
        fromVideo: fromVideo,
        borrowed: borrowed,
        merge: merge
    };
}(window));
