(function (window) {
    'use strict';

    var defaultApplicationToken = 'p6_gpujl6d3pho8n';

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Config = window.LampaYaniConfig = {
        version: '0.46.38',
        apiBase: 'https://api.yani.tv',
        statusUrl: 'https://yummyanime.github.io/yummy-lampa-plugin/status/status.json',
        // Referrer bridge for the Alloha player, served from the same Pages site
        // as the plugin itself. See embed/alloha.html for why it is needed.
        allohaEmbedUrl: 'https://yummyanime.github.io/yummy-lampa-plugin/embed/alloha.html',
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
