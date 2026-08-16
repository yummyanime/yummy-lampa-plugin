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
assert.match(ui, /function loadGenreRows\(page\)/);
assert.match(ui, /pageSize: 8,/);
assert.match(ui, /loadPage: createGenreRowLoader\(\)/);
assert.match(ui, /header: function \(component, api\)/);
assert.match(ui, /function renderGenreTiles\(genres\)/);
assert.match(ui, /yani-genre-tiles/);
assert.match(ui, /function loadGenreList\(\)/);
assert.match(ui, /GENRE_HUB_CONCURRENCY = 8/);
assert.match(ui, /genreHubRows && Date\.now\(\) - genreHubRowsAt < GENRE_HUB_TTL/);
assert.match(ui, /LampaYaniCardRails\.mapLimit\(genres, GENRE_HUB_CONCURRENCY/);
assert.doesNotMatch(ui, /genres\.slice\(offset, offset \+ pageSize\)/);
assert.match(ui, /openGenreCatalog\(genre\)/);
assert.match(source, /function withMore\(row, deps\)/);
assert.match(source, /\(row\.results \|\| \[\]\)\.slice\(0, 10\)/);
assert.match(source, /yani_more: true/);
assert.match(source, /yani-card-rails/);
assert.match(source, /function mapLimit/);
assert.match(source, /function loadAllRows/);
assert.match(source, /function prependHeader/);
assert.match(source, /typeof deps\.header === 'function'/);
assert.match(source, /fetch every batch up front and call build\(\) once/);
assert.match(css, /\.yani-genre-tiles__grid/);
assert.match(css, /\.yani-genre-tile\.focus/);
assert.doesNotMatch(source, /function loadIfBoundary/);
assert.doesNotMatch(source, /startBoundaryWatcher/);
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
        this.html = {append: function () {}, contains: function () { return false; }};
        this.scroll = {minus: function () {}, render: function () { return {nodeType: 1}; }};
        this.build = function (rows) { builds.push(rows); };
        this.render = function () { return {addClass: function () {}}; };
    }
};
const loadedPages = [];
const component = rails.create({}, {
    t: function (key) { return key; },
    pageSize: 4,
    loadPage: function (page, size) {
        loadedPages.push([page, size]);
        if (page > 2) return [];
        return [0, 1, 2, 3].map(function (index) {
            return {title: 'Page ' + page + ' row ' + index, results: [{title: 'Card'}]};
        });
    }
});

(async function () {
    component.create();
    for (var i = 0; i < 12; i++) await Promise.resolve();
    assert.deepStrictEqual(loadedPages, [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]]);
    assert.equal(builds.length, 1, 'hub rails must render in a single build call');
    assert.equal(builds[0].length, 12, 'all fetched batches must appear before the screen opens');
    assert.equal(builds[0][11].title, 'Page 2 row 3');
    console.log('card rails contract checks passed');
}()).catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
