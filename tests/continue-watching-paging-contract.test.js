const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// Continue Watching used to read a fixed 300 history records once. A record is
// one episode, so the queue stopped at about fifty titles for anyone who
// watches several episodes in a row. It now reads the history in batches and
// asks for the next one when focus nears the last row.

function load() {
    const context = {
        window: {},
        console: {log() {}, info() {}, warn() {}, error() {}},
        setTimeout,
        Promise
    };
    context.Lampa = context.window.Lampa = {
        Noty: {show() {}},
        InteractionCategory: function (object) {
            this.object = object;
            this.activity = {loader() {}};
            this.built = null;
            this.build = function (data) { this.built = data; };
        }
    };
    vm.runInNewContext(fs.readFileSync('src/core/episode.js', 'utf8'), context);
    vm.runInNewContext(fs.readFileSync('src/home/ui-home-sections.js', 'utf8'), context);
    return context.window.LampaYaniHomeSections;
}

// One unfinished episode per record; `titleOf` decides which title a record
// at a given position belongs to. Newer records come first, as on the server.
function server(total, titleOf) {
    const calls = [];
    const now = 1760000000;
    function fetchPage(size, offset) {
        calls.push(offset);
        const items = [];
        for (let index = offset; index < Math.min(total, offset + size); index += 1) {
            items.push({anime_id: titleOf(index), episode: 1, end_time: 60, duration: 1400, date: now - index});
        }
        return Promise.resolve({response: items});
    }
    return {fetchPage, calls};
}

function section(sections, remote) {
    const deps = {
        authorized: () => true,
        history: () => ({}),
        importRemote() {},
        fetchRemote: remote.fetchPage,
        t: (key) => key,
        toCard: (source) => ({yani_id: source.anime_id, title: source.title}),
        historyCardRender() {}
    };
    return sections.history({mode: 'continue'}, deps);
}

function ids(cards) {
    return cards.map((card) => card.yani_id).join(',');
}

function nextPage(comp, page) {
    return new Promise((resolve, reject) => comp.nextPageRequest({page}, resolve, reject));
}

function waitBuilt(comp) {
    return new Promise((resolve) => {
        (function check() { if (comp.built) resolve(comp.built); else setTimeout(check, 1); })();
    });
}

(async function () {
    const sections = load();
    const source = fs.readFileSync('src/home/ui-home-sections.js', 'utf8');

    // Batches: pages stop at the first failure so its records are asked for
    // again, and a short page ends the history.
    let failOnce = true;
    const flaky = (size, offset) => {
        if (offset === 60 && failOnce) { failOnce = false; return Promise.reject(new Error('offline')); }
        const items = offset < 100 ? Array.from({length: Math.min(size, 100 - offset)}, (u, i) => ({anime_id: offset + i + 1, episode: 1})) : [];
        return Promise.resolve({response: items});
    };
    const first = await sections.fetchHistoryBatch(flaky, 0, 90, 30);
    assert.strictEqual(first.raw, 60, 'records after a failed page must not be skipped');
    assert.strictEqual(first.exhausted, false);
    const second = await sections.fetchHistoryBatch(flaky, 60, 90, 30);
    assert.strictEqual(second.raw, 40, 'the failed page is read again by the next batch');
    assert.strictEqual(second.exhausted, true, 'a short page ends the history');

    // Ten records per title: the first batch of 300 holds 30 titles, and the
    // account has 1000 records, 100 titles in all.
    const remote = server(1000, (index) => Math.floor(index / 10) + 1);
    const comp = section(sections, remote);
    comp.create();
    const built = await waitBuilt(comp);
    assert.strictEqual(built.results.length, 30, 'the first screen holds the first batch');
    assert.strictEqual(built.total_pages, 2, 'more history means another page');

    const page2 = await nextPage(comp, 2);
    assert.strictEqual(page2.results.length, 30, 'the next batch adds the next titles');
    assert.ok(!page2.results.some((card) => card.yani_id <= 30), 'titles already on screen are not repeated: ' + ids(page2.results));
    assert.strictEqual(page2.total_pages, 3);

    await nextPage(comp, 3);
    const page4 = await nextPage(comp, 4);
    assert.strictEqual(page4.results.length, 10, 'the last records bring the last titles');
    assert.strictEqual(page4.total_pages, 4, 'the end of the history ends the paging');

    // A batch made only of titles already on screen is followed by the next
    // one, so a scroll does not end on nothing while history remains.
    const repeats = server(1200, (index) => (index < 300 ? (index % 5) + 1 : index < 900 ? (index % 5) + 1 : 100 + Math.floor(index / 10)));
    const repeated = section(sections, repeats);
    repeated.create();
    const shown = await waitBuilt(repeated);
    assert.strictEqual(shown.results.length, 5);
    const after = await nextPage(repeated, 2);
    assert.ok(after.results.length > 0, 'batches without new titles must be skipped over');
    assert.ok(after.results.every((card) => card.yani_id >= 100), 'only new titles are appended: ' + ids(after.results));

    assert.match(source, /var continueBatchesPerPage = 3;/, 'one scroll reads a bounded number of batches');
    console.log('Continue watching paging contract checks passed');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
