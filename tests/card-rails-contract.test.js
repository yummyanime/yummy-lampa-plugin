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
assert.match(source, /component\.nextPageReuest/);
assert.match(source, /component\.use\(\{onNext: requestNext\}\)/);
assert.match(source, /component\.scroll\.onEnd/);
assert.match(css, /\.yani-card-rails \.items-cards[\s\S]{0,500}display:\s*flex/);
assert.match(css, /\.yani-card-rails \.items-cards \.card[\s\S]{0,350}flex:\s*0 0 12\.75em/);
assert.match(css, /\.yani-user-lists-view \.items-cards \.card[\s\S]{0,350}width:\s*12\.75em/);
assert.doesNotMatch(css, /\.yani-card-rails \.items-cards[\s\S]{0,500}width:\s*revert/);

const context = {window: {}};
vm.runInNewContext(source, context);
const rails = context.window.LampaYaniCardRails;
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
        this.scroll = {};
        this.build = function (rows) { builds.push(rows); };
        this.render = function () { return {addClass: function () {}}; };
    }
};
const loadedPages = [];
const component = rails.create({}, {
    t: function (key) { return key; },
    pageSize: 2,
    loadPage: function (page, size) {
        loadedPages.push([page, size]);
        if (page > 1) return [];
        return [{title: 'Page ' + page, results: [{title: 'Card ' + page}]}];
    }
});

(async function () {
    component.create();
    await Promise.resolve();
    await Promise.resolve();
    assert.deepStrictEqual(loadedPages, [[0, 2]]);
    assert.equal(builds.length, 1);
    await new Promise(function (resolve, reject) {
        component.nextPageReuest({}, resolve, reject);
    });
    assert.deepStrictEqual(loadedPages, [[0, 2], [1, 2]]);
    assert.equal(builds[0][0].title, 'Page 0');
    console.log('card rails contract checks passed');
}()).catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
