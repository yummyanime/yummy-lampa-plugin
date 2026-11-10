const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/screens/ui-translations.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/screens\/ui-translations\.js/);
assert.match(ui, /LampaYaniTranslations\.component/);
assert.match(source, /Number\(b && b\.date \|\| 0\) - Number\(a && a\.date \|\| 0\)/);
assert.match(source, /grouped\[id\]\.count \+= 1/);
assert.match(source, /card\.yani_translation_count = group\.count/);
assert.match(source, /label\(video, group\.count - 1\)/);

const context = {window: {}};
vm.runInNewContext(source, context);
const translations = context.window.LampaYaniTranslations;
const cards = translations.normalize({response: {new_videos: [
    {anime_id: 10, date: 100, title: 'Old', ep_title: 'Episode 1', dub_title: 'Dub A'},
    {anime_id: 10, date: 300, title: 'Latest', ep_title: 'Episode 2', dub_title: 'Dub B', player_title: 'Kodik'},
    {anime_id: 11, date: 200, title: 'Other', ep_title: 'Episode 4'}
]}}, (item) => ({title: item.title, yani_id: item.anime_id}));

assert.deepEqual(Array.from(cards, (card) => card.yani_id), [10, 11]);
assert.equal(cards[0].title, 'Latest');
assert.equal(cards[0].yani_translation_count, 2);
assert.equal(cards[0].yani_update_label, 'Episode 2 · Dub B · Kodik · +1');
assert.equal(cards[1].yani_translation_count, 1);

console.log('translations contract checks passed');
