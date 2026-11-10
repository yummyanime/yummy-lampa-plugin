const assert = require('assert');
const fs = require('fs');

const uiSource = fs.readFileSync('src/ui.js', 'utf8');
const controls = fs.readFileSync('src/screens/ui-catalog-controls.js', 'utf8');
const ui = uiSource + '\n' + controls;
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');

assert.match(ui, /Lampa\.Component\.add\('yani_top', Top\)/);
assert.match(uiSource, /function Top\(object\)[\s\S]{0,300}topMode = true[\s\S]{0,250}sort: 'top'[\s\S]{0,150}sort_forward: true[\s\S]{0,150}from_year: 1900[\s\S]{0,150}return Catalog\(object\)/);
assert.match(ui, /var topDefinitions = \[[\s\S]{0,500}key: 'all', types: ''[\s\S]{0,150}key: 'tv', types: 'tv'[\s\S]{0,150}key: 'movie', types: 'movie'[\s\S]{0,150}key: 'ona', types: 'ona'/);
assert.match(ui, /var controlDefinitions = topMode \? topDefinitions : sortDefinitions/);
assert.match(ui, /if \(topMode\) \{[\s\S]{0,250}params\.sort = 'top'[\s\S]{0,150}params\.sort_forward = true[\s\S]{0,150}params\.from_year = 1900[\s\S]{0,250}params\.types = definition\.types/);
assert.match(ui, /component: 'yani_top'[\s\S]{0,100}topMode: true/);
assert.match(homeScreen, /key: 'top_rated'[\s\S]{0,500}component: 'yani_top'[\s\S]{0,150}sort_forward: true[\s\S]{0,100}from_year: 1900/);
assert.match(ui, /controlDefinitions\.forEach/);
assert.match(ui, /topMode \? topTypeIcon\(definition\.key\) : catalogSortIcon\(definition\.key\)/);

const topIconFunction = ui.match(/function topTypeIcon\(key\) \{([\s\S]*?)\n    \}/);
assert.ok(topIconFunction, 'top category icon map must exist');
const iconPaths = Array.from(topIconFunction[1].matchAll(/<path d="([^"]+)"/g), (match) => match[1]);
assert.strictEqual(iconPaths.length, 4, 'every top category must define an SVG path');
assert.strictEqual(new Set(iconPaths).size, iconPaths.length, 'top categories must not reuse the same SVG path');

['ru', 'en', 'uk'].forEach((language) => {
    ['top_all', 'top_tv', 'top_movies', 'top_ona'].forEach((key) => {
        assert.match(i18n, new RegExp(`messages\\.${language}\\.${key}\\s*=`));
    });
});

console.log('top categories contract checks passed');
