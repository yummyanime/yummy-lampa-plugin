(function (window) {
    'use strict';

    var defaultApplicationToken = 'p6_gpujl6d3pho8n';

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Config = window.LampaYaniConfig = {
        version: '0.45.5',
        apiBase: 'https://api.yani.tv',
        statusUrl: 'https://yummyanime.github.io/yummy-lampa-plugin/status/status.json',
        applicationHeader: defaultApplicationToken, // Backward-compatible default public token.
        defaultApplicationToken: defaultApplicationToken,
        applicationToken: function () { return defaultApplicationToken; },
        cacheTtl: 300000,
        cacheEntries: 220,
        videosCacheTtl: 120000,
        videosCacheEntries: 20,
        requestTimeout: 15000,
        requestRetries: 2
    };
}(window));
