const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const root = __dirname;
function normalizeNewlines(source) {
    return String(source || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
const modules = ['src/config.js', 'src/i18n.js', 'src/genre-descriptions.js', 'src/auth.js', 'src/api.js', 'src/catalog.js', 'src/stream-resolver.js', 'src/aniskip.js', 'src/ui-utils.js', 'src/ui-menu.js', 'src/yani-resolver.js', 'src/lampac-resolver.js', 'src/ui-media.js', 'src/ui-navigation.js', 'src/ui-section-state.js', 'src/ui-search.js', 'src/ui-catalog-filters.js', 'src/ui-catalog-controls.js', 'src/ui-video-data.js', 'src/ui-card-model.js', 'src/ui-card-renderers.js', 'src/ui-card-bind.js', 'src/ui-card-rails.js', 'src/ui-playback-history.js', 'src/ui-playback-menu.js', 'src/ui-standard-card.js', 'src/ui-trailers.js', 'src/ui-schedule.js', 'src/ui-notifications.js', 'src/ui-auth.js', 'src/ui-status.js', 'src/ui-player.js', 'src/ui-account-list-controls.js', 'src/ui-account-lists.js', 'src/ui-home-sections.js', 'src/ui-home-insights.js', 'src/ui-collections.js', 'src/ui-releases.js', 'src/ui-recommendations.js', 'src/ui-updates.js', 'src/ui-translations.js', 'src/ui-detail.js', 'src/ui.js'];
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
