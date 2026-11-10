const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const settingsSource = fs.readFileSync('src/ui/ui-settings.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

['new_releases', 'top_rated', 'for_you', 'collections'].forEach((key) => {
    assert.match(homeScreen, new RegExp(`key: '${key}'[^\\n]+group: 'discover'`));
    assert.match(settingsSource, new RegExp(`\\['${key}', '${key}'\\]`), `${key} must keep an independent visibility setting`);
});
assert.match(homeScreen, /item\.group === 'discover'/);
assert.match(homeScreen, /yani-home__discover-title/);
assert.match(homeScreen, /\.text\(t\('discover'\)\)/);
assert.match(homeScreen, /discoverItems\.append\(button\)/);
assert.doesNotMatch(homeScreen, /yani-home__discover-preview|renderDiscoveryPreviews/);
assert.doesNotMatch(css, /yani-home__discover-preview/);
assert.match(css, /\.yani-home__discover\s*\{[\s\S]{0,200}grid-column: span 12/);
assert.match(css, /\.yani-home__discover-items\s*\{[\s\S]{0,220}grid-template-columns: repeat\(4/);
assert.match(css, /@media \(max-width: 700px\)[\s\S]{0,1800}\.yani-home__discover-items \{ grid-template-columns: repeat\(2/);

console.log('dashboard discovery contract checks passed');
