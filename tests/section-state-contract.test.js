const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-section-state.js', 'utf8');
const api = fs.readFileSync('src/api.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');
const schedule = fs.readFileSync('src/ui-schedule.js', 'utf8');
const notifications = fs.readFileSync('src/ui-notifications.js', 'utf8');
const releases = fs.readFileSync('src/ui-releases.js', 'utf8');
const translations = fs.readFileSync('src/ui-translations.js', 'utf8');

assert.match(build, /src\/ui-section-state\.js/);
assert.match(api, /function markFromCache\(payload\)/);
assert.match(api, /fromCache: fromCache/);
assert.match(source, /function forActivity\(activity, deps\)/);
assert.match(source, /yani-section-state--loading/);
assert.match(source, /yani-section-state--offline/);
assert.match(source, /yani-section-state--cached/);
assert.match(source, /yani-section-state--empty/);
assert.match(source, /section_retry/);
assert.match(css, /\.yani-section-state__skeleton--cards/);
assert.match(css, /\.yani-section-state__retry/);
assert.match(i18n, /messages\.ru\.section_state_cached/);
assert.match(i18n, /messages\.en\.section_retry/);
assert.match(i18n, /messages\.uk\.section_state_offline/);
assert.match(schedule, /LampaYaniSectionState\.create/);
assert.match(schedule, /onRetry: function \(\) \{ load\(true\); \}/);
assert.match(notifications, /offlineState/);
assert.match(releases, /LampaYaniSectionState\.forActivity/);
assert.match(translations, /states\.empty\(/);

const calls = [];
const context = {
    window: {},
    $: function (value) {
        const nodes = [];
        const api = {
            0: null,
            length: 0,
            append: function () {
                Array.prototype.forEach.call(arguments, (item) => nodes.push(item));
                return api;
            },
            empty: function () { nodes.length = 0; return api; },
            attr: function () { return api; },
            removeAttr: function () { return api; },
            addClass: function (name) { calls.push('add:' + name); return api; },
            removeClass: function () { return api; },
            text: function () { return api; },
            html: function () { return api; },
            on: function (event, handler) {
                if (String(event).indexOf('yaniSectionRetry') >= 0) calls.push('retry-bound');
                return api;
            },
            find: function () { return api; },
            first: function () { return api; }
        };
        if (typeof value === 'string' && value.charAt(0) === '<') calls.push('html:' + value.slice(0, 48));
        return api;
    }
};

vm.runInNewContext(source, context);
const states = context.window.LampaYaniSectionState.create({
    t: function (key) { return key; }
});

states.show('loading', {skeleton: 'cards'});
assert.ok(calls.some((item) => item.indexOf('yani-section-state--loading') >= 0));

calls.length = 0;
let retried = false;
states.show('offline', {onRetry: function () { retried = true; }});
assert.ok(calls.some((item) => item.indexOf('yani-section-state--offline') >= 0));
assert.ok(calls.indexOf('retry-bound') >= 0);

states.show('cached', {compact: true, onRetry: function () {}});
assert.ok(calls.some((item) => item.indexOf('yani-section-state--banner') >= 0));

states.show('empty', {});
assert.ok(calls.some((item) => item.indexOf('yani-section-state--empty') >= 0));

assert.strictEqual(context.window.LampaYaniSectionState.fromCache({__yaniFromCache: true}), true);
assert.strictEqual(context.window.LampaYaniSectionState.fromCache({}), false);

console.log('section state contract checks passed');
