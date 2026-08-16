const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'ui-search.js'), 'utf8');
const context = {window: {}, URL, setTimeout, clearTimeout, console};
vm.runInNewContext(source, context);

const searchModule = context.window.LampaYaniSearch;
const utils = {
    normalizeMatchTitle(value) {
        return String(value || '').toLowerCase().replace(/[^a-zа-я0-9]+/gi, ' ').trim();
    },
    titleValues(card) {
        return [card.title, card.original_title].filter(Boolean);
    }
};

assert.strictEqual(searchModule.safeQuery({query: 'One%20Piece'}), 'One Piece');
assert.strictEqual(searchModule.safeQuery({query: '100% anime'}), '100% anime');

const ranked = searchModule.rankCards([
    {title: 'Naruto Shippuden'},
    {title: 'Наруто', yani_titles: ['NARUTO']},
    {title: 'Boruto: Naruto Next Generations'}
], 'naruto', utils);
assert.strictEqual(ranked[0].title, 'Наруто');
assert.strictEqual(ranked[1].title, 'Naruto Shippuden');
assert.match(source, /params:\s*\{\s*save:\s*true/);
assert.match(source, /source\.params\.start_typing/);

(async function () {
    const calls = [];
    const callbacks = [];
    const controller = searchModule.create({
        delay: 5,
        api: {
            search(query) {
                calls.push(query);
                return Promise.resolve({response: [{title: query}]});
            },
            normalize(payload) { return payload.response; }
        },
        utils,
        toCard(item) { return item; }
    });

    controller.search({query: 'old'}, value => callbacks.push(['old', value]));
    controller.search({query: 'new'}, value => callbacks.push(['new', value]));
    await new Promise(resolve => setTimeout(resolve, 25));

    assert.deepStrictEqual(calls, ['new']);
    assert.strictEqual(callbacks.length, 2);
    assert.strictEqual(callbacks[0][0], 'old');
    assert.strictEqual(Array.isArray(callbacks[0][1]), true);
    assert.strictEqual(callbacks[0][1].length, 0);
    assert.strictEqual(callbacks[1][0], 'new');
    assert.strictEqual(callbacks[1][1][0].results[0].title, 'new');
    console.log('Search module tests passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
