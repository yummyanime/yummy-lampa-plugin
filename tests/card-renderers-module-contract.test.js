const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-card-renderers.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/ui-card-renderers\.js/);
assert.match(ui, /LampaYaniCardRenderers\.create/);
assert.match(ui, /cardRenderers\.decorate/);
assert.match(ui, /LampaYaniCardBind\.create/);
assert.match(ui, /var addCardMetadata = cardRenderers\.addCardMetadata/);
assert.match(ui, /var addCardPlaybackProgress = cardRenderers\.addCardPlaybackProgress/);
assert.doesNotMatch(ui, /function addCardMetadata\(element, card\)/);
assert.doesNotMatch(ui, /function cardPlaybackState\(card\)/);
assert.doesNotMatch(ui, /function addCardRatings\(element, card\)/);

const context = {
    window: {},
    LampaYaniUiUtils: {
        mediaTypeInfo: function (value) {
            if (value === 'tv') return {key: 'tv', full: 'TV', short: 'TV'};
            return {key: '', full: '', short: ''};
        }
    },
    $: function () {
        return {
            length: 0,
            first: function () { return this; },
            find: function () { return this; },
            append: function () { return this; },
            addClass: function () { return this; },
            toggleClass: function () { return this; },
            text: function () { return this; },
            attr: function () { return this; },
            css: function () { return this; },
            empty: function () { return this; },
            remove: function () { return this; },
            off: function () { return this; },
            one: function () { return this; },
            end: function () { return this; }
        };
    }
};
context.window.LampaYaniUiUtils = context.LampaYaniUiUtils;
vm.runInNewContext(source, context);

const renderers = context.window.LampaYaniCardRenderers.create({
    t: function (key) {
        return ({
            episodes_short: 'ep.',
            status_ongoing: 'Ongoing',
            fresh_today: 'Today',
            fresh_yesterday: 'Yesterday',
            voices_short: 'dub.'
        })[key] || key;
    },
    locale: function () { return 'en'; },
    getPlayback: function () { return null; },
    mediaMeta: function () { return {}; }
});

assert.strictEqual(renderers.cardStatusKey('онгоинг'), 'ongoing');
assert.strictEqual(renderers.cardStatusKey({alias: 'released'}), 'released');
assert.strictEqual(renderers.cardStatusLabel({alias: 'ongoing'}), 'Ongoing');
assert.strictEqual(renderers.cardEpisodesLabel({aired: 5, total: 12}, 3), '3/5 ep.');
assert.strictEqual(renderers.genreTopPosition({yani_genre_top: {position: 7}}), 7);
assert.strictEqual(renderers.genreTopPosition({yani_genre_top: {position: 101}}), 0);
assert.strictEqual(renderers.formatRating(8.26), '8.3');
assert.strictEqual(renderers.formatRating(0), '—');
assert.strictEqual(renderers.mediaTypeLabels('tv').short, 'TV');
assert.strictEqual(renderers.cardFreshness(Date.now()).label, 'Today');
assert.equal(renderers.cardPlaybackState({yani_watched_episodes: 4, yani_list_progress: 0.42}).episode, 4);
assert.equal(renderers.cardPlaybackState({yani_watched_episodes: 4, yani_list_progress: 0.42}).percent, 42);
assert.equal(renderers.cardPlaybackState({yani_watched_episodes: 4, yani_list_progress: 0.42}).progress, 0.42);
assert.strictEqual(renderers.cardPlaybackState({}), null);
assert.strictEqual(renderers.listBadgeKey({yani_list_id: 0}), 'watching');
assert.strictEqual(renderers.listBadgeKey({yani_list_id: 2}), 'completed');
assert.strictEqual(renderers.listBadgeKey({yani_is_favorite: true}), 'favorites');
assert.match(renderers.listBadgeIcon('watching'), /<svg /);

console.log('card renderers module contract checks passed');
