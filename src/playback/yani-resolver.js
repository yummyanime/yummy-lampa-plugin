(function (window) {
    'use strict';

    // Client for the self-hosted resolver shipped in `server/`. It exists
    // because Alloha's manifest can only be fetched with rotating signed
    // headers, which a browser cannot attach cross-origin, so the work has to
    // happen in a process the user runs themselves. The service answers with a
    // plain HLS URL that both the internal and the external player can open.

    var STORAGE_KEY = 'yani_resolver_url';

    function normalizeBaseUrl(value) {
        value = String(value || '').trim().replace(/\/+$/, '');
        if (!value) return '';
        if (!/^https?:\/\//i.test(value)) return '';
        return value;
    }

    function baseUrl() {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.get) return '';
        return normalizeBaseUrl(Lampa.Storage.get(STORAGE_KEY, ''));
    }

    function setBaseUrl(value) {
        var normalized = normalizeBaseUrl(value);
        if (window.Lampa && Lampa.Storage && Lampa.Storage.set) Lampa.Storage.set(STORAGE_KEY, normalized);
        return normalized;
    }

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
                var message = (error && (error.responseText || error.message || error.status)) || exception || 'Resolver request failed';
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
                if (!response.ok) {
                    var error = new Error('HTTP ' + response.status);
                    error.status = response.status;
                    error.body = text;
                    throw error;
                }
                return text;
            });
        }).catch(function (error) {
            clearTimeout(timer);
            throw error;
        });
    }

    function requestText(url) {
        // The resolver usually lives on the local network over plain HTTP while
        // Lampa itself may be served over HTTPS, so prefer the native Android
        // bridge when it exists and keep the browser request as the fallback.
        var isAndroid = !!(window.AndroidJS || window.Android) ||
            !!(window.Lampa && Lampa.Platform && Lampa.Platform.is && Lampa.Platform.is('android'));
        if (isAndroid && window.Lampa && Lampa.Reguest) {
            return nativeRequestText(url).catch(function (error) {
                console.warn('[YummyAnime] Native resolver request failed, trying browser request', error);
                return browserRequestText(url);
            });
        }
        return browserRequestText(url);
    }

    function requestJson(url) {
        return requestText(url).then(function (text) {
            var payload;
            try { payload = JSON.parse(text); } catch (error) { throw new Error('Invalid resolver response'); }
            if (payload && payload.error) {
                var failure = new Error(String(payload.error));
                failure.unavailable = Boolean(payload.unavailable);
                throw failure;
            }
            return payload;
        });
    }

    function resolve(iframeUrl) {
        var base = baseUrl();
        if (!base) return Promise.reject(new Error('Resolver server is not configured'));
        if (!iframeUrl) return Promise.reject(new Error('Empty stream URL'));
        return requestJson(base + '/resolve?url=' + encodeURIComponent(iframeUrl)).then(function (payload) {
            if (!payload || !payload.url) throw new Error('Resolver returned no stream');
            return {
                url: payload.url,
                quality: payload.quality || 'auto',
                qualities: payload.qualities || null,
                headers: payload.headers || null,
                session: payload.session || '',
                source: payload.source || 'yani-resolver',
                direct: true
            };
        });
    }

    function release(session) {
        var base = baseUrl();
        if (!base || !session) return Promise.resolve(false);
        return requestJson(base + '/release?session=' + encodeURIComponent(session))
            .then(function (payload) { return Boolean(payload && payload.released); })
            .catch(function () { return false; });
    }

    function health() {
        var base = baseUrl();
        if (!base) return Promise.reject(new Error('Resolver server is not configured'));
        return requestJson(base + '/health');
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Resolver = window.LampaYaniResolver = {
        baseUrl: baseUrl,
        setBaseUrl: setBaseUrl,
        normalizeBaseUrl: normalizeBaseUrl,
        enabled: function () { return Boolean(baseUrl()); },
        resolve: resolve,
        release: release,
        health: health
    };
}(window));
