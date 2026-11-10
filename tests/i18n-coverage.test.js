const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {window: {}};
vm.runInNewContext(fs.readFileSync('src/core/i18n.js', 'utf8'), context);
const i18n = context.window.LampaYaniI18n;

// The module reads the active language from Lampa.Storage; without Lampa it
// falls back to Russian, which is the reference locale.
const source = ['src/ui.js', 'src/screens/ui-detail.js', 'src/screens/ui-schedule.js', 'src/cards/ui-media.js', 'src/screens/ui-status.js', 'src/screens/ui-notifications.js', 'src/screens/ui-collections.js', 'src/screens/ui-releases.js', 'src/screens/ui-recommendations.js', 'src/screens/ui-updates.js', 'src/screens/ui-translations.js', 'src/ui/ui-section-state.js']
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');

const used = new Set();
const pattern = /\bt\(\s*'([a-z0-9_]+)'\s*\)/gi;
let match;
while ((match = pattern.exec(source))) used.add(match[1]);
assert.ok(used.size > 50, `expected the UI to use many keys, found ${used.size}`);

// A key that resolves to itself means the lookup fell through every locale: the
// UI would render a bare identifier like "resolver_server" to the user.
const missing = Array.from(used).filter((key) => i18n.t(key) === key);
assert.deepEqual(missing, [], `keys used by the UI but not translated: ${missing.join(', ')}`);

// Every locale must cover what Russian covers, otherwise a non-Russian user
// silently gets Russian text for the missing entries.
const localeContext = {window: {}};
vm.runInNewContext(
    fs.readFileSync('src/core/i18n.js', 'utf8').replace('}(window));', 'window.__messages = messages;\n}(window));'),
    localeContext
);
const all = localeContext.window.__messages;
assert.ok(all && all.ru, 'the locale tables must be readable');

['en', 'uk'].forEach((locale) => {
    const gaps = Object.keys(all.ru).filter((key) => !Object.prototype.hasOwnProperty.call(all[locale] || {}, key));
    assert.deepEqual(gaps, [], `${locale} is missing: ${gaps.slice(0, 10).join(', ')}${gaps.length > 10 ? ' …' : ''}`);
});

console.log('i18n coverage tests passed');
