const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const launchStart = ui.indexOf('function launchVideo');
const launchEnd = ui.indexOf('function launchResolvedVideo', launchStart);
const launchPolicy = ui.slice(launchStart, launchEnd);

assert.match(ui, /function isSibnetPlaybackSource\(url, group\)/);
assert.match(launchPolicy, /var sibnetPageUrl = selected\.iframe_url \|\| url;[\s\S]{0,100}if \(isSibnetPlaybackSource\(sibnetPageUrl, group\)\) \{\s*return openEmbeddedEpisode\(card, group, selected, sibnetPageUrl\);/,
    'Sibnet must use its official iframe so the MP4 request carries the required Referer');
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
