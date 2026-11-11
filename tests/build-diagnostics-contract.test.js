const assert = require('assert');
const fs = require('fs');

const config = fs.readFileSync('src/core/config.js', 'utf8');
const settings = fs.readFileSync('src/ui/ui-settings.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const release = fs.readFileSync('scripts/release.js', 'utf8');

assert.match(config, /build: \{hash: 'source', date: '', type: 'source'\}/);
assert.match(settings, /name: 'yani_build_diagnostics'/);
assert.match(settings, /function showBuildDiagnostics\(\)/);
assert.match(settings, /build_source_hash/);
assert.match(build, /createHash\('sha256'\)/);
assert.match(build, /function releaseDate\(source\)/);
assert.doesNotMatch(build, /new Date\(\)\.toISOString\(\)/, 'the committed bundle must rebuild deterministically in CI');
assert.match(build, /type: 'test'/);
assert.match(release, /productionBundle = bundle\.replace/);
assert.match(release, /'production'/);

console.log('build diagnostics contract checks passed');
