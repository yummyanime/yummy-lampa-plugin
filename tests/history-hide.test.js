const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// A title removed from the watch history stays out of it until it has a
// record newer than the removal, that is, until it is watched again.

const storage = {};
const context = {console, Promise};
context.window = context;
context.Lampa = {
    Storage: {
        get: (key, fallback) => Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : fallback,
        set: (key, value) => { storage[key] = JSON.parse(JSON.stringify(value)); }
    }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/core/episode.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('src/home/ui-home-sections.js', 'utf8'), context);
const sections = context.LampaYaniHomeSections;

const entries = [
    {anime_id: 1, video_id: 11, number: '2', time: 300, duration: 1440, updated_at: 1000},
    {anime_id: 2, video_id: 21, number: '5', time: 600, duration: 1440, updated_at: 2000}
];
const ids = (list) => Array.from(list).map((entry) => String(entry.anime_id)).join(',');

assert.strictEqual(ids(sections.continueWatchingEntries(entries, {})), '2,1');
assert.ok(sections.hideHistoryTitle(1, 1500));
assert.strictEqual(ids(sections.continueWatchingEntries(entries, {})), '2', 'the removed title is gone');
assert.strictEqual(ids(sections.continueWatchingEntries(entries, {}, {}, {}, {includeFinished: true})), '2', 'from the full history too');

const watchedAgain = entries.concat([{anime_id: 1, video_id: 12, number: '3', time: 100, duration: 1440, updated_at: 3000}]);
assert.strictEqual(ids(sections.continueWatchingEntries(watchedAgain, {})), '1,2', 'watching it again brings it back');

const history = fs.readFileSync('src/playback/ui-playback-history.js', 'utf8');
assert.match(history, /instance\.onMenu = function \(\) \{ confirmHistoryRemoval\(card, rendered\); \};/,
    'a long press on a history tile opens removal instead of the favorites menu');
assert.match(history, /items: \[\s*\{title: t\('history_remove_cancel'\)\},\s*\{title: t\('history_remove'\)/,
    'Cancel comes first so a repeating held button removes nothing');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');
['ru', 'en', 'uk'].forEach((language) => {
    ['history_remove_title', 'history_remove', 'history_remove_hint', 'history_remove_cancel'].forEach((key) => {
        assert.match(i18n, new RegExp(`messages\\.${language}\\.${key} = `));
    });
});

console.log('watch history removal checks passed');
