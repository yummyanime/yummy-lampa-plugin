const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

const screens = [
    {file: 'src/screens/ui-catalog.js', global: 'LampaYaniCatalogScreen', handle: 'catalogScreen', component: 'Catalog'},
    {file: 'src/screens/ui-genres.js', global: 'LampaYaniGenresScreen', handle: 'genresScreen', component: 'Genres'},
    {file: 'src/screens/ui-account.js', global: 'LampaYaniAccountScreen', handle: 'accountScreen', component: 'Account'}
];

screens.forEach((screen) => {
    const source = fs.readFileSync(screen.file, 'utf8');
    const escaped = screen.file.replace(/[/.]/g, '\\$&');
    assert.match(build, new RegExp("'" + escaped + "'[\\s\\S]*'src\\/ui\\.js'"), screen.file + ' must load before the main UI');
    assert.match(ui, new RegExp('var ' + screen.handle + ' = ' + screen.global + '\\.create\\(\\{'));
    assert.match(ui, new RegExp('var ' + screen.component + ' = ' + screen.handle + '\\.Component;'));
    assert.doesNotMatch(ui, new RegExp('function ' + screen.component + '\\('), screen.component + ' belongs to ' + screen.file);
    assert.match(source, new RegExp('function ' + screen.component + '\\(object\\)'));

    const context = {window: {}};
    vm.runInNewContext(source, context);
    const api = context.window[screen.global].create({});
    assert.strictEqual(typeof api.Component, 'function', screen.component + ' must be exported as a component');
});

// The genre cache is written both by the list loader and by the screen when a
// cached response is refreshed, so both have to live in the same module.
const genres = fs.readFileSync('src/screens/ui-genres.js', 'utf8');
assert.doesNotMatch(ui, /var genreList\b/, 'the genre cache belongs to ui-genres.js');
assert.doesNotMatch(ui, /function loadGenreList\(/);
assert.match(genres, /var genreList = null;/);
assert.match(genres, /function loadGenreList\(\)/);
assert.match(genres, /genreList = genres;\s*genreListAt = Date\.now\(\);\s*genreCards = genreTilesRow\(genres\)\.results;/,
    'the screen must refresh the same cache the loader fills');

// The account actions are assigned in ui.js after the account screen is
// created, so the screen has to reach them through functions, not values.
assert.match(ui, /localizedAuthText: function \(key\) \{ return localizedAuthText\(key\); \}/);
assert.match(ui, /openAccountLogin: function \(\) \{ return openAccountLogin\(\); \}/);
assert.match(ui, /logoutFromAccount: function \(\) \{ return logoutFromAccount\(\); \}/);

console.log('screen modules contract checks passed');
