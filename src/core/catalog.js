(function (window) {
    'use strict';

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Catalog = window.LampaYaniCatalog = {
        search: function (query, params) {
            return window.LampaYaniApi.search(query, params);
        }
    };
}(window));
