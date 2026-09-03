const assert = require('assert');
const fs = require('fs');

const config = fs.readFileSync('src/config.js', 'utf8');
const root = fs.readFileSync('README.md', 'utf8');
const en = fs.readFileSync('docs/README.en.md', 'utf8');
const ru = fs.readFileSync('docs/README.ru.md', 'utf8');
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
const dist = fs.readFileSync('dist/index.js', 'utf8');
const pages = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
const releaseWorkflow = fs.readFileSync('.github/workflows/release.yml', 'utf8');
const version = (config.match(/version:\s*'([^']+)'/) || [])[1];
const escaped = version.replace(/\./g, '\\.');

assert.ok(version, 'config version must be present');
assert.match(root, new RegExp('Current version: `' + escaped + '`'));
assert.match(changelog, new RegExp('^## ' + escaped + ' — ', 'm'));
const latestNotes = changelog.match(new RegExp('^## ' + escaped + ' — [^\\r\\n]+\\r?\\n\\r?\\n((?:- .+\\r?\\n)+)', 'm'));
assert.ok(latestNotes, 'current version must have changelog notes');
latestNotes[1].trim().split(/\r?\n/).forEach((line) => {
    line.split(/\s*\|\s*/).forEach((part) => {
        assert.match(part.replace(/^- /, ''), /^(Fix|Add|Remove|Refactor) /);
    });
});
assert.match(dist, new RegExp("version: '" + escaped + "'"));
assert.match(fs.readFileSync('build.js', 'utf8'), /function normalizeNewlines/);
assert.doesNotMatch(dist, /\\r\\n/, 'dist bundle must not embed CRLF so Linux CI matches Windows builds');
[root, en].forEach((document) => {
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
assert.match(en, /Russian, English and Ukrainian extension interface/);
assert.match(en, /Available translations panel/);
assert.match(en, /src\/ui-detail\.js/);
assert.match(root, /The official YummyAnime plugin for Lampa/);
assert.doesNotMatch(root, /unofficial/i);
assert.match(ru, /Официальный плагин YummyAnime для Lampa/);
assert.doesNotMatch(ru, /[Нн]еофициальн/);
assert.match(en, /The official YummyAnime plugin for Lampa/);
assert.match(root, /yummyani\.me/);
assert.match(ru, /yummyani\.me/);
assert.match(root, /<sub>\[Русская версия\]\(docs\/README\.ru\.md\)<\/sub>/);
assert.ok(fs.existsSync('docs/README.ru.md'), 'optional Russian documentation must be available separately');
assert.match(fs.readFileSync('src/ui.js', 'utf8'), /t\('official_plugin'\)/);
assert.match(root, /Playback and sources such as Alloha/);
assert.match(root, /web page rather than a playable video link/);
assert.match(en, /it is not an Alloha resolver/);
assert.match(ru, /Воспроизведение и источники типа Alloha/);
assert.match(ru, /iframe.*не видеофайл/s);

console.log('documentation sync contract checks passed');
