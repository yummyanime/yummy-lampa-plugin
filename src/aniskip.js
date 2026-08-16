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

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.AniSkip = window.LampaYaniAniSkip = {
        times: times,
        parse: parse
    };
}(window));
