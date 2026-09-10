const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const launchStart = ui.indexOf('function launchVideo');
const launchEnd = ui.indexOf('function launchResolvedVideo', launchStart);
const launchPolicy = ui.slice(launchStart, launchEnd);

assert.match(ui, /function isSibnetPlaybackSource\(url, group\)/);
// Sibnet's MP4 is guarded by a Referer check that Lampa's built-in <video>
// cannot satisfy, and no engine of Lampa's on any platform turned out to send
// headers instead - so the embedded page is the one route that shows the video,
// on every platform. Routing Android to the internal player instead produced a
// screen that could never play.
assert.match(launchPolicy, /if \(isSibnetPlaybackSource\(sibnetPageUrl, group\)\) \{\s*return openEmbeddedEpisode\(card, group, selected, sibnetPageUrl\);/,
    'Sibnet must open its embedded page on every platform');
assert.match(ui, /function needsRequestHeaders\(item\)/, 'a stream that needs headers must be recognised');
const resolverSource = fs.readFileSync('src/stream-resolver.js', 'utf8');
assert.match(resolverSource, /source: 'sibnet',[\s\S]{0,700}headersRequired: true/,
    'Sibnet must declare that its file is refused without the referrer');
assert.ok(
    launchPolicy.indexOf('isSibnetPlaybackSource(sibnetPageUrl, group)') < launchPolicy.indexOf('LampaYaniStreamResolver.resolve(url, selected)'),
    'Sibnet iframe routing must happen before direct stream extraction');

console.log('Sibnet playback policy tests passed');

// Sibnet plays through the embedded web player, so a crash while that component
// is built shows up as a title with no sources at all: Lampa answers a throwing
// component with its empty-list screen. The player must therefore survive any
// dependency the caller forgot, and the caller must pass the translator.
const vm = require('vm');
const playerSource = fs.readFileSync('src/ui-player.js', 'utf8');
const uiSource = fs.readFileSync('src/ui.js', 'utf8');
assert.match(uiSource, /LampaYaniPlayer\.create\(object, \{\s*t: t,/, 'the embedded player must receive the translator');

function stubElement() {
    const node = {attr: () => node, text: () => node, on: () => node, off: () => node,
        append: () => node, remove: () => node, length: 1, 0: {}};
    return node;
}
const ctx = {window: {}, $: stubElement, console, setTimeout,
    Lampa: {Controller: {add() {}, toggle() {}, collectionSet() {}, collectionFocus() {}}}};
vm.runInNewContext(playerSource, ctx);
const component = ctx.window.LampaYaniPlayer.create({iframe_url: 'https://video.sibnet.ru/shell.php?videoid=1'}, {});
component.activity = {loader() {}, toggle() {}};
assert.doesNotThrow(() => { component.create(); component.start(); },
    'a missing dependency must not blank the screen');
assert.strictEqual(typeof component.render, 'function');

// Lampa's header kept drawing over the embedded video, and the back button
// landed on top of the title. The player owns the whole screen while it is
// open, and must give it back on every exit path - a body class left behind
// would hide the header for the rest of the session.
const css = fs.readFileSync('style.css', 'utf8');
assert.match(css, /body\.yani-player-open \.head/, 'the header must be hidden while the player is open');
assert.match(playerSource, /addClass\('yani-player-open'\)/, 'the player must claim the screen');
assert.strictEqual(
    (playerSource.match(/claimScreen\(false\)/g) || []).length,
    2,
    'the screen must be released both on close and on destroy'
);
assert.match(playerSource, /function claimScreen\(on\)[\s\S]{0,320}catch \(error\) \{\}/,
    'claiming the screen must not be able to take the player down');

// The choice of player stays with the viewer, but a stream whose file is guarded
// by a referrer check cannot be fetched by a <video> element - it signs every
// request with the Lampa page - and the failure looks like a broken plugin
// rather than a source that needs a different player. So it is said out loud.
assert.match(ui, /function warnAboutRequestHeaders\(item\)/, 'the trade-off must be stated, not met as a failure');
assert.match(ui, /if \(started\) \{\s*warnAboutRequestHeaders\(current\);/,
    'the warning belongs to the moment internal playback actually starts');
const i18nSource = fs.readFileSync('src/i18n.js', 'utf8');
['ru', 'en', 'uk'].forEach(function (locale) {
    assert.ok(
        i18nSource.indexOf('messages.' + locale + '.internal_player_headers_warning') > 0,
        'the warning must be translated for ' + locale
    );
});
