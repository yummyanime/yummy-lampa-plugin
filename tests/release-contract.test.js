const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const release = require('../scripts/release');
const source = fs.readFileSync('scripts/release.js', 'utf8');
const pages = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
const workflow = fs.readFileSync('.github/workflows/release.yml', 'utf8');

assert.strictEqual(release.STABLE_URL, 'https://yummyanime.github.io/yummy-lampa-plugin/stable/index.js');
assert.strictEqual(release.TEST_URL, 'https://yummyanime.github.io/yummy-lampa-plugin/dist/index.js');
assert.doesNotMatch(source, /TEST_URL \+ '\?v='/);
assert.strictEqual(release.tagName('0.41.38'), 'v0.41.38');
assert.strictEqual(release.normalizeVersion('v0.41.38'), '0.41.38');
assert.match(release.changelogSection('# Changelog\n\n## 0.41.40 — 2026-08-13\n\n- First.\n\n## 0.41.39 — 2026-08-13\n\n- Old.\n', '0.41.40'), /First/);
assert.doesNotMatch(release.changelogSection('# Changelog\n\n## 0.41.40 — 2026-08-13\n\n- First.\n\n## 0.41.39 — 2026-08-13\n\n- Old.\n', '0.41.40'), /Old/);
assert.match(source, /--promote/);
assert.match(pages, /cp -R stable _pages\/stable/);
assert.match(workflow, /gh release create/);
assert.match(workflow, /tags:[\s\S]*v\*/);

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yani-release-'));
fs.mkdirSync(path.join(root, 'src'));
fs.mkdirSync(path.join(root, 'dist'));
const bundle = "window.LampaYaniConfig = { version: '0.41.40' };\n";
const older = "window.LampaYaniConfig = { version: '0.41.38' };\n";
fs.writeFileSync(path.join(root, 'src/config.js'), bundle);
fs.writeFileSync(path.join(root, 'dist/index.js'), bundle);
fs.writeFileSync(path.join(root, 'CHANGELOG.md'), '# Changelog\n\n## 0.41.40 — 2026-08-13\n\n- Current.\n');

const tags = {};
const git = {
    tagExists: function (tag) { return Boolean(tags[tag]); },
    createTag: function (tag, message) { tags[tag] = message; },
    show: function (spec) {
        if (spec === 'v0.41.38:dist/index.js') return older;
        throw new Error('missing ' + spec);
    },
    pushTag: function () { throw new Error('should not push'); }
};

const promoted = release.promote({
    root: root,
    git: git,
    tag: true,
    releasedAt: '2026-08-13T00:00:00.000Z'
});
assert.strictEqual(promoted.version, '0.41.40');
assert.strictEqual(promoted.tagged, true);
assert.strictEqual(tags['v0.41.40'].indexOf('Current') >= 0, true);
assert.match(fs.readFileSync(path.join(root, 'stable/index.js'), 'utf8'), /0\.41\.40/);
const meta = JSON.parse(fs.readFileSync(path.join(root, 'stable.json'), 'utf8'));
assert.strictEqual(meta.channel, 'production');
assert.strictEqual(meta.version, '0.41.40');
assert.strictEqual(meta.url, release.STABLE_URL);
assert.strictEqual(meta.testUrl, release.TEST_URL);

const rolled = release.promote({
    root: root,
    git: git,
    promote: '0.41.38',
    releasedAt: '2026-08-13T01:00:00.000Z'
});
assert.strictEqual(rolled.rollback, true);
assert.strictEqual(rolled.tagged, false);
assert.match(fs.readFileSync(path.join(root, 'stable/index.js'), 'utf8'), /0\.41\.38/);
assert.strictEqual(JSON.parse(fs.readFileSync(path.join(root, 'stable.json'), 'utf8')).version, '0.41.38');
assert.match(fs.readFileSync(path.join(root, 'dist/index.js'), 'utf8'), /0\.41\.40/, 'rollback must not change the test bundle');

fs.rmSync(root, {recursive: true, force: true});
console.log('release contract tests passed');
