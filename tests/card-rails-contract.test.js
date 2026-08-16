const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-card-rails.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(build, /src\/ui-card-rails\.js/);
assert.match(ui, /Lampa\.Component\.add\('yani_genres', Genres\)/);
assert.match(ui, /function createGenreRowLoader\(\)/);
assert.match(ui, /function loadGenreRows\(page, pageSize\)/);
assert.match(ui, /pageSize: 4,[\s\S]{0,100}loadPage: createGenreRowLoader\(\)/);
assert.match(ui, /genres\.slice\(offset, offset \+ pageSize\)/);
assert.match(ui, /LampaYaniCardRails\.mapLimit/);
assert.match(ui, /openGenreCatalog\(genre\)/);
assert.match(source, /function withMore\(row, deps\)/);
assert.match(source, /\(row\.results \|\| \[\]\)\.slice\(0, 10\)/);
assert.match(source, /yani_more: true/);
assert.match(source, /yani-card-rails/);
assert.match(source, /function mapLimit/);
assert.match(source, /function requestNext\(resolve, reject\)/);
assert.match(source, /function bindScrollEnd/);
assert.match(source, /function bindRowTriggers/);
assert.match(source, /function loadIfBoundary/);
assert.match(source, /function startBoundaryWatcher/);
assert.match(source, /setInterval\(function \(\) \{[\s\S]{0,180}loadIfBoundary\(Number\(component\.active \|\| 0\)\)/);
assert.match(source, /function mountInteraction/);
assert.match(source, /if \(loadingPage\) return/);
assert.match(source, /component\.nextPageReuest/);
assert.match(source, /onInstance: function \(item\)/);
assert.match(source, /component\.scroll\.onEnd = function/);
assert.match(css, /\.yani-card-rails \.items-cards[\s\S]{0,500}display:\s*flex/);
assert.match(css, /\.yani-card-rails \.items-cards \.card[\s\S]{0,350}flex:\s*0 0 12\.75em/);
assert.match(css, /\.yani-user-lists-view \.items-cards \.card[\s\S]{0,350}width:\s*12\.75em/);
assert.doesNotMatch(css, /\.yani-card-rails \.items-cards[\s\S]{0,500}width:\s*revert/);

let boundaryTick = null;
const context = {
    window: {},
    isFinite: isFinite,
    Number: Number,
    Math: Math,
    Date: Date,
    setInterval: function (callback) {
        boundaryTick = callback;
        return 1;
    },
    clearInterval: function () {}
};
vm.runInNewContext(source, context);
const rails = context.window.LampaYaniCardRails;
assert.strictEqual(rails.rowNeedsMore(3, 4, 4), true, 'the 4th row must request the next batch');
assert.strictEqual(rails.rowNeedsMore(7, 8, 4), true, 'the 8th row must request the next batch');
assert.strictEqual(rails.rowNeedsMore(11, 12, 4), true, 'every later multiple of four must keep loading');
assert.strictEqual(rails.rowNeedsMore(3, 8, 4), false, 'a 4th row must not reload when the next four are already present');
assert.strictEqual(rails.rowNeedsMore(5, 8, 4), false, 'a mid-batch row must not start another request');
const line = rails.withMore({
    title: 'Isekai',
    total: 42,
    results: [{title: 'One'}, {title: 'Two'}],
    onMore: function () {}
}, {t: function (key) { return key === 'more' ? 'More' : key; }});
assert.equal(line.results.length, 3);
assert.equal(line.results[2].yani_more, true);
assert.equal(line.nomore, true);
assert.match(line.title, /Isekai · 42/);

const builds = [];
context.Lampa = {
    InteractionMain: function () {
        this.activity = {loader: function () {}};
        this.html = {append: function () {}, contains: function () { return false; }};
        this.scroll = {minus: function () {}, render: function () { return {nodeType: 1}; }};
        this.emit = function (name, data) {
            if (name === 'build' && data) {
                builds.push(data);
                this.items = this.items.concat(data.map(function () { return {}; }));
            }
        };
        this.active = 0;
        this.items = [];
        this.build = function (rows) {
            builds.push(rows);
            this.items = this.items.concat((rows || []).map(function () { return {}; }));
        };
        this.render = function () { return {addClass: function () {}}; };
    }
};
const loadedPages = [];
const component = rails.create({}, {
    t: function (key) { return key; },
    pageSize: 4,
    loadPage: function (page, size) {
        loadedPages.push([page, size]);
        if (page > 3) return [];
        return [0, 1, 2, 3].map(function (index) {
            return {title: 'Page ' + page + ' row ' + index, results: [{title: 'Card'}]};
        });
    }
});

(async function () {
    component.create();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    assert.deepStrictEqual(loadedPages.slice(0, 1), [[0, 4]]);
    assert.ok(loadedPages.some(function (item) { return item[0] === 1; }), 'the next rail batch must be prefetched after the first four rows');
    assert.ok(builds.length >= 1);
    assert.equal(typeof component.scroll.onEnd, 'function');
    assert.equal(typeof boundaryTick, 'function');
    assert.equal(builds[0][0].title, 'Page 0 row 0');
    component.active = 7;
    boundaryTick();
    await Promise.resolve();
    await Promise.resolve();
    assert.ok(loadedPages.some(function (item) { return item[0] === 2; }), 'the 8th row must request the following batch');
    component.active = 11;
    boundaryTick();
    await Promise.resolve();
    await Promise.resolve();
    assert.ok(loadedPages.some(function (item) { return item[0] === 3; }), 'the 12th row must keep requesting while data remains');
    console.log('card rails contract checks passed');
}()).catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
