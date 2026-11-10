function pluginYummyAnime() {
    'use strict';

    if (window.plugin_yummy_anime_ready) return;
    window.plugin_yummy_anime_ready = true;

    var scripts = [
        'src/core/config.js',
        'src/core/i18n.js',
        'src/core/auth.js',
        'src/core/api.js',
        'src/core/catalog.js',
        'src/playback/stream-resolver.js',
        'src/ui/ui-utils.js',
        'src/ui/ui-menu.js',
        'src/playback/lampac-resolver.js',
        'src/cards/ui-media.js',
        'src/ui/ui-navigation.js',
        'src/screens/ui-schedule.js',
        'src/screens/ui-notifications.js',
        'src/screens/ui-auth.js',
        'src/screens/ui-status.js',
        'src/playback/ui-player.js',
        'src/screens/ui-account-lists.js',
        'src/home/ui-home-sections.js',
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
