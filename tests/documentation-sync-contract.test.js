const assert = require('assert');
const fs = require('fs');

const config = fs.readFileSync('src/config.js', 'utf8');
const root = fs.readFileSync('README.md', 'utf8');
const ru = fs.readFileSync('docs/README.ru.md', 'utf8');
const en = fs.readFileSync('docs/README.en.md', 'utf8');
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
const dist = fs.readFileSync('dist/index.js', 'utf8');
const pages = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
const releaseWorkflow = fs.readFileSync('.github/workflows/release.yml', 'utf8');
const version = (config.match(/version:\s*'([^']+)'/) || [])[1];
const escaped = version.replace(/\./g, '\\.');

assert.ok(version, 'config version must be present');
assert.match(root, new RegExp('Current version: `' + escaped + '`'));
assert.match(changelog, new RegExp('^## ' + escaped + ' — ', 'm'));
assert.match(dist, new RegExp("version: '" + escaped + "'"));
[root, ru, en].forEach((document) => {
    assert.match(document, /yummy-lampa-plugin\/stable\/index\.js/);
    assert.match(document, /yummy-lampa-plugin\/dist\/index\.js/);
    assert.doesNotMatch(document, /stable\/index\.js\?v=/);
    assert.doesNotMatch(document, /dist\/index\.js\?v=/);
});
const stableMeta = JSON.parse(fs.readFileSync('stable.json', 'utf8'));
const stable = fs.readFileSync('stable/index.js', 'utf8');
assert.strictEqual(stableMeta.channel, 'production');
assert.match(stable, new RegExp("version: '" + String(stableMeta.version).replace(/\./g, '\\.') + "'"));
assert.match(pages, /cp -R stable _pages\/stable/);
assert.match(releaseWorkflow, /tags:[\s\S]*v\*/);
assert.match(ru, /русским, английским и украинским языками/);
assert.match(en, /Russian, English and Ukrainian extension interface/);
assert.match(ru, /Доступные переводы/);
assert.match(en, /Available translations panel/);
assert.match(ru, /src\/ui-detail\.js/);
assert.match(en, /src\/ui-detail\.js/);

console.log('documentation sync contract checks passed');
