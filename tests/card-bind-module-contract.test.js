const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-card-bind.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /src\/ui-card-bind\.js/);
assert.match(ui, /LampaYaniCardBind\.create/);
assert.match(ui, /var bindYummyCardRender = cardBind\.bindYummyCardRender/);
assert.match(ui, /var bindRecommendedCardRender = cardBind\.bindRecommendedCardRender/);
assert.match(ui, /var getYummyId = cardBind\.getYummyId/);
assert.doesNotMatch(ui, /function bindYummyCardRender\(/);
assert.doesNotMatch(ui, /function getYummyId\(/);
assert.doesNotMatch(ui, /function openCardOnce\(/);
assert.match(ui, /var bindHistoryCardRender = playbackHistoryApi\.bindHistoryCardRender/);
assert.doesNotMatch(ui, /function bindHistoryCardRender\(/);
assert.match(source, /options\.openYummyDetail/);
assert.match(source, /openStandardLampaCard\(card\)/);
assert.match(source, /showYummyActions\(card, rendered/);
assert.match(source, /yani-card-grid/);
assert.match(source, /yani-card-rails/);

const calls = {decorate: 0, poster: 0, detail: 0, standard: 0, menu: 0};
const fakeRendered = {
    attr: function () { return this; },
    add: function () { return this; },
    find: function () { return this; },
    off: function () { return this; },
    on: function (events, handler) {
        this.handler = handler;
        return this;
    },
    closest: function () { return {length: 1, addClass: function () { return this; }}; }
};

const context = {
    window: {},
    HTMLElement: function () {},
    $: function () { return fakeRendered; },
    setTimeout: function (fn) { fn(); }
};
vm.runInNewContext(source, context);

const bind = context.window.LampaYaniCardBind.create({
    decorate: function () { calls.decorate += 1; },
    cardRenderElement: function () { return fakeRendered; },
    attachPosterFallback: function () { calls.poster += 1; },
    openYummyDetail: function () { calls.detail += 1; },
    openStandardLampaCard: function () { calls.standard += 1; },
    showYummyActions: function () { calls.menu += 1; }
});

assert.strictEqual(bind.getYummyId({yani_id: 12}), 12);
assert.strictEqual(bind.getYummyId({anime: {anime_id: 9}}), 9);
assert.strictEqual(bind.getYummyId({title: 'No id'}), null);
assert.ok(bind.hasYummyCardData({yani_id: 1}));
assert.ok(!bind.hasYummyCardData({title: 'Native'}));

const card = {yani_id: 42, title: 'Test'};
bind.bindYummyCardRender({nodeType: 1}, card);
assert.equal(calls.decorate, 1);
assert.equal(calls.poster, 1);
assert.equal(typeof card.onEnter, 'function');
card.onEnter();
assert.equal(calls.standard, 1);

const recommended = {yani_id: 7};
bind.bindRecommendedCardRender({nodeType: 1}, recommended);
recommended.onEnter();
assert.equal(calls.detail, 1);

card.onMenu();
assert.equal(calls.menu, 1);

console.log('card bind module contract checks passed');
