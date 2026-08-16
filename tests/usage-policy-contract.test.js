const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');

assert.match(ui, /Lampa\.Component\.add\('yani_policy', UsagePolicy\)/);
assert.match(ui, /param: \{name: 'yani_usage_policy', type: 'button'\}/);
assert.match(ui, /function closeUsagePolicy\(/);
assert.match(ui, /yani-policy-layer/);
assert.match(ui, /function showUsagePolicy\(\)[\s\S]*Lampa\.Controller\.toggle\('yani_policy'\)/);
assert.doesNotMatch(ui, /function showUsagePolicy\(\)[\s\S]{0,500}Activity\.push/);
assert.doesNotMatch(ui, /scheduleUsagePolicy/);
assert.doesNotMatch(ui, /yani_usage_policy_revision/);
assert.match(fs.readFileSync('style.css', 'utf8'), /\.yani-policy-layer/);
assert.match(i18n, /messages\.ru\.usage_policy_legal/);
assert.match(i18n, /messages\.en\.usage_policy_legal/);
assert.match(i18n, /messages\.uk\.usage_policy_legal/);
assert.match(i18n, /Устанавливая и включая расширение/);

console.log('usage policy contract tests passed');
