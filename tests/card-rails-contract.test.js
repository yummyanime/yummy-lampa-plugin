const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-card-rails.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(build, /src\/ui-card-rails\.js/);
assert.match(ui, /Lampa\.Component\.add\('yani_genres', Genres\)/);
assert.match(ui, /function loadGenreRows\(\)/);
assert.match(ui, /LampaYaniCardRails\.mapLimit/);
assert.match(ui, /openGenreCatalog\(genre\)/);
assert.match(source, /function withMore\(row, deps\)/);
assert.match(source, /\(row\.results \|\| \[\]\)\.slice\(0, 10\)/);
assert.match(source, /yani_more: true/);
assert.match(source, /yani-card-rails/);
assert.match(source, /function mapLimit/);
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

console.log('card rails contract checks passed');
