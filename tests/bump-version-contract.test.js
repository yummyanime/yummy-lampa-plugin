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

const args = bump.parseArgs(['node', 'scripts/bump-version.js', 'patch', '-m', 'Add version bump script', 'and', 'more']);
assert.strictEqual(args.bump, 'patch');
assert.deepStrictEqual(args.notes, ['Add version bump script', 'and more']);

assert.match(bump.formatNotes('Fix button styles | Remove unused styles'), /### Fixed[\s\S]*Button styles/);
assert.match(bump.formatNotes('Fix button styles | Remove unused styles'), /### Removed[\s\S]*Unused styles/);
assert.match(bump.formatNotes(['Add official label.', 'Refactor button']), /### Added[\s\S]*Official label/);
assert.match(bump.formatNotes(['Add official label.', 'Refactor button']), /### Changed[\s\S]*Button/);
assert.throws(function () { bump.formatNotes('Normalize dist bundle newlines'); });

const source = fs.readFileSync('scripts/bump-version.js', 'utf8');
['src/config.js', 'README.md', 'CHANGELOG.md', 'docs/README.en.md', 'dist/index.js', 'build.js'].forEach((file) => {
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
fs.writeFileSync(path.join(root, 'docs/README.en.md'), '`https://yummyanime.github.io/yummy-lampa-plugin/dist/index.js`\n');
fs.writeFileSync(path.join(root, 'CHANGELOG.md'), '# Changelog\r\n\r\n## 0.41.39 — 2026-08-13\r\n\r\n- Previous.\r\n');

let built = false;
const result = bump.applyVersion({
    root: root,
    bump: 'patch',
    date: '2026-08-13',
    notes: ['Add version bump script'],
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
assert.match(fs.readFileSync(path.join(root, 'docs/README.en.md'), 'utf8'), /dist\/index\.js/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'docs/README.en.md'), 'utf8'), /dist\/index\.js\?v=/);
const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
assert.match(changelog, /## \[0\.41\.40\] - 2026-08-13/);
assert.match(changelog, /### Added/);
assert.match(changelog, /Version bump script/);
assert.match(changelog, /## \[0\.41\.39\] - 2026-08-13/);

fs.rmSync(root, {recursive: true, force: true});

const keepRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yani-version-keep-'));
fs.mkdirSync(path.join(keepRoot, 'src'));
fs.mkdirSync(path.join(keepRoot, 'docs'));
fs.writeFileSync(path.join(keepRoot, 'src/config.js'), "window.LampaYaniConfig = { version: '0.47.0' };\n");
fs.writeFileSync(path.join(keepRoot, 'README.md'), 'Current version: `0.47.0`\n');
fs.writeFileSync(path.join(keepRoot, 'docs/README.en.md'), '');
fs.writeFileSync(path.join(keepRoot, 'CHANGELOG.md'), [
    '# Changelog',
    '',
    '## [Unreleased]',
    '',
    '### Fixed',
    '',
    '- Overlay overlap',
    '',
    '## [0.47.0] - 2026-09-21',
    '',
    '### Changed',
    '',
    '- Changelog format'
].join('\n') + '\n');
const fromUnreleased = bump.applyVersion({
    root: keepRoot,
    bump: 'patch',
    date: '2026-09-21',
    notes: [],
    build: function () {}
});
assert.strictEqual(fromUnreleased.version, '0.47.1');
const keepLog = fs.readFileSync(path.join(keepRoot, 'CHANGELOG.md'), 'utf8');
assert.match(keepLog, /## \[0\.47\.1\] - 2026-09-21/);
assert.match(keepLog, /Overlay overlap/);
assert.doesNotMatch(keepLog.slice(keepLog.indexOf('## [Unreleased]'), keepLog.indexOf('## [0.47.1]')), /Overlay overlap/);
assert.throws(function () {
    bump.updateChangelog('# Changelog\n\n## [Unreleased]\n', '0.47.1', '2026-09-21', []);
});
fs.rmSync(keepRoot, {recursive: true, force: true});

console.log('bump version contract tests passed');
