const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const root = __dirname;
function normalizeNewlines(source) {
    return String(source || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
const modules = ['src/core/config.js', 'src/core/i18n.js', 'src/core/genre-descriptions.js', 'src/core/auth.js', 'src/core/api.js', 'src/core/catalog.js', 'src/playback/stream-resolver.js', 'src/playback/aniskip.js', 'src/ui/ui-utils.js', 'src/ui/ui-menu.js', 'src/playback/yani-resolver.js', 'src/playback/lampac-resolver.js', 'src/cards/ui-media.js', 'src/ui/ui-navigation.js', 'src/ui/ui-section-state.js', 'src/screens/ui-search.js', 'src/screens/ui-catalog-filters.js', 'src/screens/ui-catalog-controls.js', 'src/playback/ui-video-data.js', 'src/cards/ui-card-model.js', 'src/cards/ui-card-renderers.js', 'src/cards/ui-card-bind.js', 'src/cards/ui-card-rails.js', 'src/playback/ui-playback-history.js', 'src/playback/ui-playback-menu.js', 'src/playback/ui-playback-watcher.js', 'src/cards/ui-standard-card.js', 'src/playback/ui-trailers.js', 'src/screens/ui-schedule.js', 'src/screens/ui-notifications.js', 'src/screens/ui-auth.js', 'src/screens/ui-status.js', 'src/playback/ui-player.js', 'src/screens/ui-account-list-controls.js', 'src/screens/ui-account-lists.js', 'src/home/ui-home-sections.js', 'src/home/ui-home-insights.js', 'src/screens/ui-collections.js', 'src/screens/ui-releases.js', 'src/screens/ui-recommendations.js', 'src/screens/ui-updates.js', 'src/screens/ui-translations.js', 'src/screens/ui-detail.js', 'src/ui.js'];
modules.splice(modules.indexOf('src/playback/stream-resolver.js'), 0, 'src/core/episode.js');
modules.forEach((file) => execFileSync(process.execPath, ['--check', path.join(root, file)], {stdio: 'inherit'}));
const body = modules.map((file) => normalizeNewlines(fs.readFileSync(path.join(root, file), 'utf8'))).join('\n');
const css = normalizeNewlines(fs.readFileSync(path.join(root, 'style.css'), 'utf8'));

const output = `function pluginYummyAnime() {
    if (window.plugin_yummy_anime_ready) return;
    window.plugin_yummy_anime_ready = true;

    var style = document.createElement('style');
    style.textContent = ${JSON.stringify(css)};
    document.head.appendChild(style);

${body}
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
}

if (!window.plugin_yummy_anime_ready) pluginYummyAnime();
`;

fs.mkdirSync(path.join(root, 'dist'), {recursive: true});
fs.writeFileSync(path.join(root, 'dist', 'index.js'), normalizeNewlines(output));
console.log('Built dist/index.js');
