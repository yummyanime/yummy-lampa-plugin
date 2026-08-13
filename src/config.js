(function (window) {
    'use strict';

    var defaultApplicationToken = 'p6_gpujl6d3pho8n';
    var applicationTokenStorageKey = 'yani_public_application_token';

    function normalizeApplicationToken(value) {
        return String(value || '').trim();
    }

    function validApplicationToken(value) {
        return !value || /^[A-Za-z0-9_-]{8,128}$/.test(value);
    }

    function storedApplicationToken() {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.get) return '';
        var value = normalizeApplicationToken(Lampa.Storage.get(applicationTokenStorageKey, ''));
        return validApplicationToken(value) ? value : '';
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Config = window.LampaYaniConfig = {
        version: '0.42.0',
        apiBase: 'https://api.yani.tv',
        statusUrl: 'https://yummyanime.github.io/yummy-lampa-plugin/status/status.json',
        applicationHeader: defaultApplicationToken, // Backward-compatible default public token.
        defaultApplicationToken: defaultApplicationToken,
        applicationToken: function () { return storedApplicationToken() || defaultApplicationToken; },
        customApplicationToken: storedApplicationToken,
        setApplicationToken: function (value) {
            value = normalizeApplicationToken(value);
            if (!validApplicationToken(value)) return false;
            if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.set) return false;
            Lampa.Storage.set(applicationTokenStorageKey, value);
            return true;
        },
        cacheTtl: 300000,
        cacheEntries: 100,
        videosCacheTtl: 120000,
        videosCacheEntries: 20,
        requestTimeout: 15000,
        requestRetries: 2
    };
}(window));
