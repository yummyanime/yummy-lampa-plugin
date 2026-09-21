const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const log = require('../scripts/changelog');

assert.deepEqual(log.CATEGORIES, ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']);
assert.strictEqual(log.classifyNote('Fix button styles').category, 'Fixed');
assert.strictEqual(log.classifyNote('Add README shots').category, 'Added');
assert.strictEqual(log.classifyNote('Refactor overlay').category, 'Changed');
assert.strictEqual(log.classifyNote('Remove unused CSS').category, 'Removed');
assert.strictEqual(log.classifyNote('Keep the last poster').category, 'Changed');

const converted = log.convertLegacy([
    '# Changelog',
    '',
    '## 0.46.43 — 2026-09-21',
    '',
    '- Fix playback progress | Add a pointer-revealed exit control',
    '',
    '## 0.46.42 — 2026-09-11',
    '',
    '- Remove the back button'
].join('\n'));

assert.match(converted, /## \[Unreleased\]/);
assert.match(converted, /## \[0\.46\.43\] - 2026-09-21/);
assert.match(converted, /### Fixed/);
assert.match(converted, /- Playback progress/);
assert.match(converted, /### Added/);
assert.match(converted, /- A pointer-revealed exit control/);
assert.match(converted, /## \[0\.46\.42\] - 2026-09-11/);
assert.match(converted, /### Removed/);
assert.match(log.HEADER, /keepachangelog\.com/);
assert.match(log.HEADER, /The commit hook folds every `###` section under `\[Unreleased\]`/);

const folded = log.foldUnreleased([
    '# Changelog',
    '',
    '## [Unreleased]',
    '',
    '### Security',
    '',
    '- Token handling',
    '',
    '### Weird',
    '',
    '- Custom heading',
    '',
    '### Fixed',
    '',
    '- Overlay overlap',
    '',
    '## [0.1.0] - 2026-08-06',
    '',
    '### Added',
    '',
    '- Initial extension'
].join('\n'));

const unreleased = folded.slice(folded.indexOf('## [Unreleased]'), folded.indexOf('## [0.1.0]'));
assert.ok(unreleased.indexOf('### Fixed') < unreleased.indexOf('### Security'));
assert.ok(unreleased.indexOf('### Security') < unreleased.indexOf('### Weird'));

assert.ok(log.unreleasedHasItems(folded));
assert.ok(!log.unreleasedHasItems(converted));

const released = log.insertRelease(converted, '0.46.44', '2026-09-21', ['Fixed overlay overlap']);
assert.match(released, /## \[Unreleased\]\s*\r?\n\s*\r?\n## \[0\.46\.44\] - 2026-09-21/);
assert.match(released, /### Fixed[\s\S]*Overlay overlap/);
assert.match(log.changelogSection(released, '0.46.44'), /Overlay overlap/);

assert.ok(fs.existsSync('.githooks/pre-commit'), 'the commit hook must live in .githooks');
assert.match(fs.readFileSync('.githooks/pre-commit', 'utf8'), /scripts\/changelog\.js" --fold/);

console.log('changelog contract tests passed');
