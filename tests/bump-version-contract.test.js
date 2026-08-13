const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const bump = require('../scripts/bump-version');

assert.strictEqual(bump.nextVersion('0.41.39', 'patch'), '0.41.40');
assert.strictEqual(bump.nextVersion('0.41.39', 'minor'), '0.42.0');
assert.strictEqual(bump.nextVersion('0.41.39', 'major'), '1.0.0');
assert.strictEqual(bump.nextVersion('0.41.39', '0.50.0'), '0.50.0');
assert.strictEqual(bump.readConfigVersion("version: '0.41.39'"), '0.41.39');

const args = bump.parseArgs(['node', 'scripts/bump-version.js', 'patch', '-m', 'First', 'and', 'more']);
assert.strictEqual(args.bump, 'patch');
assert.deepStrictEqual(args.notes, ['First', 'and more']);

const source = fs.readFileSync('scripts/bump-version.js', 'utf8');
['src/config.js', 'README.md', 'CHANGELOG.md', 'docs/README.ru.md', 'docs/README.en.md', 'dist/index.js', 'build.js'].forEach((file) => {
    assert.ok(source.includes(file) || source.includes(file.replace(/\\/g, '/')), 'bump-version must mention ' + file);
});

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yani-version-'));
fs.mkdirSync(path.join(root, 'src'));
fs.mkdirSync(path.join(root, 'docs'));
fs.writeFileSync(path.join(root, 'src/config.js'), "window.LampaYaniConfig = { version: '0.41.39' };\n");
fs.writeFileSync(path.join(root, 'README.md'), [
    'Current version: `0.41.39`',
    '',
    '`https://yummyanime.github.io/yummy-lampa-plugin/stable/index.js`',
    '`https://yummyanime.github.io/yummy-lampa-plugin/dist/index.js`'
].join('\n'));
fs.writeFileSync(path.join(root, 'docs/README.ru.md'), '`https://yummyanime.github.io/yummy-lampa-plugin/dist/index.js`\n');
fs.writeFileSync(path.join(root, 'docs/README.en.md'), '`https://yummyanime.github.io/yummy-lampa-plugin/dist/index.js`\n');
fs.writeFileSync(path.join(root, 'CHANGELOG.md'), '# Changelog\r\n\r\n## 0.41.39 — 2026-08-13\r\n\r\n- Previous.\r\n');

let built = false;
const result = bump.applyVersion({
    root: root,
    bump: 'patch',
    date: '2026-08-13',
    notes: ['Automate version updates across config, README, changelog, and dist.'],
    build: function () { built = true; }
});

assert.strictEqual(result.from, '0.41.39');
assert.strictEqual(result.version, '0.41.40');
assert.strictEqual(built, true);
assert.match(fs.readFileSync(path.join(root, 'src/config.js'), 'utf8'), /version: '0\.41\.40'/);
assert.match(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /Current version: `0\.41\.40`/);
assert.match(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /dist\/index\.js/);
assert.match(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /stable\/index\.js/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /stable\/index\.js\?v=/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), /dist\/index\.js\?v=/);
assert.match(fs.readFileSync(path.join(root, 'docs/README.ru.md'), 'utf8'), /dist\/index\.js/);
assert.match(fs.readFileSync(path.join(root, 'docs/README.en.md'), 'utf8'), /dist\/index\.js/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'docs/README.ru.md'), 'utf8'), /dist\/index\.js\?v=/);
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
assert.match(changelog, /## 0\.41\.40 — 2026-08-13/);
assert.match(changelog, /Automate version updates/);
assert.match(changelog, /## 0\.41\.39 — 2026-08-13/);

fs.rmSync(root, {recursive: true, force: true});
console.log('bump version contract tests passed');
