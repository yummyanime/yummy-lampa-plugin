const assert = require('assert');
const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
const packageLock = JSON.parse(fs.readFileSync('server/package-lock.json', 'utf8'));
const dockerfile = fs.readFileSync('server/deploy/Dockerfile', 'utf8');
const playwrightVersion = packageJson.dependencies.playwright;
const imageMatch = dockerfile.match(/mcr\.microsoft\.com\/playwright:v([0-9.]+)-noble/);

assert.ok(imageMatch, 'resolver Docker image must use the official Playwright Noble image');
assert.strictEqual(imageMatch[1], playwrightVersion, 'Node and Docker Playwright versions must stay aligned');
assert.strictEqual(packageLock.packages[''].dependencies.playwright, playwrightVersion, 'package lock must use the declared Playwright version');
assert.strictEqual(packageLock.packages['node_modules/playwright'].version, playwrightVersion, 'installed Playwright version must stay locked');
assert.strictEqual(packageLock.packages[''].engines.node, packageJson.engines.node, 'package lock must use the declared Node requirement');
assert.strictEqual(packageJson.engines.node, '>=20', 'resolver Node requirement must match Playwright');

const parts = playwrightVersion.split('.').map(Number);
assert.ok(
    parts[0] > 1 || (parts[0] === 1 && parts[1] >= 55),
    'Playwright must include the browser-download certificate verification fix'
);

console.log('resolver runtime contract tests passed');
