// Kept for installations that point at the repository root, which the
// documentation used to suggest. The plugin is built into a single file, so
// this only loads the production build that sits next to it. The build guards
// itself against a second start; this file uses a flag of its own so it never
// stops the build from starting.
(function () {
    'use strict';

    if (window.plugin_yummy_anime_ready || window.plugin_yummy_anime_loader) return;
    window.plugin_yummy_anime_loader = true;

    var current = document.currentScript;
    var base = current && current.src
        ? current.src.substring(0, current.src.lastIndexOf('/') + 1)
        : 'https://yummyanime.github.io/yummy-lampa-plugin/';

    var tag = document.createElement('script');
    tag.src = base + 'stable/index.js';
    tag.onerror = function () {
        window.plugin_yummy_anime_loader = false;
        console.error('[YummyAnime] Failed to load ' + tag.src);
    };
    document.head.appendChild(tag);
}());
