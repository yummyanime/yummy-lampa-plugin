function pluginYummyAnime() {
    'use strict';

    if (window.plugin_yummy_anime_ready) return;
    window.plugin_yummy_anime_ready = true;

    var scripts = [
        'src/config.js',
        'src/i18n.js',
        'src/auth.js',
        'src/api.js',
        'src/catalog.js',
        'src/stream-resolver.js',
        'src/ui-utils.js',
        'src/ui-menu.js',
        'src/lampac-resolver.js',
        'src/ui-media.js',
        'src/ui-navigation.js',
        'src/ui-schedule.js',
        'src/ui-notifications.js',
        'src/ui-auth.js',
        'src/ui-status.js',
        'src/ui-player.js',
        'src/ui-account-lists.js',
        'src/ui-home-sections.js',
        'src/ui.js'
    ];
    var current = document.currentScript;
    var base = current && current.src ? current.src.substring(0, current.src.lastIndexOf('/') + 1) :
        'https://raw.githubusercontent.com/yummyanime/yummy-lampa-plugin/main/';

    function load(i) {
        if (i >= scripts.length) {
            if (window.Lampa && Lampa.Manifest && window.LampaYaniConfig) {
                Lampa.Manifest.plugins = {
                    type: 'other',
                    version: LampaYaniConfig.version,
                    name: 'YummyAnime',
                    author: 'YummyAnime',
                    description: 'YummyAnime catalog, ratings, lists and account integration',
                    component: 'yani_home'
                };
            }
            try {
                window.LampaYani.register();
            } catch (error) {
                console.error('[YummyAnime] Plugin initialization failed', error);
            }
            return;
        }

        var tag = document.createElement('script');
        tag.src = base + scripts[i];
        tag.onload = function () { load(i + 1); };
        tag.onerror = function () { console.error('[Lampa Yani] Failed to load ' + scripts[i]); };
        document.head.appendChild(tag);
    }

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = base + 'style.css';
    document.head.appendChild(style);

    load(0);
}

if (!window.plugin_yummy_anime_ready) pluginYummyAnime();
