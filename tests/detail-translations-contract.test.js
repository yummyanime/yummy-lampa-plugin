const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/screens/ui-detail.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');
const utilsSource = fs.readFileSync('src/ui/ui-utils.js', 'utf8');

assert.match(detail, /var videosAbort/);
assert.match(detail, /function loadDetailVideos\(\)/);
assert.match(detail, /deps\.loadVideos/);
assert.match(detail, /videosAbort\.abort\(\)/);
assert.match(detail, /function detailTranslationGroups\(videos\)/);
assert.match(detail, /LampaYaniUiUtils\.translationKind\(raw\)/);
assert.match(detail, /LampaYaniUiUtils\.translationLabel\(raw, kind\)/);
assert.doesNotMatch(detail, /function detailTranslationKind\(/);
assert.doesNotMatch(detail, /function detailTranslationLabel\(/);
assert.doesNotMatch(detail.slice(detail.indexOf('function detailTranslationGroups'), detail.indexOf('function createDetailTranslations')), /videoInfo\.player/);
assert.match(detail, /function createDetailTranslations\(\)/);
assert.match(detail, /createDetailTranslations\(\)/);
assert.match(css, /\.yani-detail__translation-row--voices/);
assert.match(css, /\.yani-detail__translation-row--subtitles/);
assert.match(css, /@keyframes yani-translation-chip-in/);
assert.match(i18n, /messages\.ru\.available_translations = 'Доступные переводы'/);
assert.match(i18n, /messages\.uk\.subtitle_teams = 'Субтитри'/);

const context = {window: {}};
vm.runInNewContext(utilsSource, context);
const utils = context.window.LampaYaniUiUtils;

const cases = [
    ['Субтитры', 'subtitles', 'Субтитры'],
    ['Субтитры Crunchyroll', 'subtitles', 'Crunchyroll'],
    ['Субтитры MedusaSub', 'subtitles', 'MedusaSub'],
    ['Субтитры SubVost', 'subtitles', 'SubVost'],
    ['Субтитры TakoSubs', 'subtitles', 'TakoSubs'],
    ['Субтитры FSG YakuSub Studio', 'subtitles', 'FSG YakuSub Studio'],
    ['Subtitles SoftSub', 'subtitles', 'SoftSub'],
    ['Subs AniMovie', 'subtitles', 'AniMovie'],
    ['SoftSub', 'subtitles', 'SoftSub'],
    ['Hard Sub', 'subtitles', 'Hard Sub'],
    ['сабы', 'subtitles', 'сабы'],
    ['Озвучка AniLibria', 'voices', 'AniLibria'],
    ['Озвучка Amazing Dubbing', 'voices', 'Amazing Dubbing'],
    ['Озвучка Kazoku Sub', 'voices', 'Kazoku Sub'],
    ['Озвучка SubVost', 'voices', 'SubVost'],
    ['Дубляж ReAnimedia', 'voices', 'ReAnimedia'],
    ['Арт-Дубляж', 'voices', 'Арт-Дубляж'],
    ['Озвучка', 'voices', 'Озвучка']
];

cases.forEach(function (entry) {
    var kind = utils.translationKind(entry[0]);
    var label = utils.translationLabel(entry[0], kind);
    assert.strictEqual(kind, entry[1], entry[0] + ' kind');
    assert.strictEqual(label, entry[2], entry[0] + ' label');
});

console.log('detail translations contract checks passed');
