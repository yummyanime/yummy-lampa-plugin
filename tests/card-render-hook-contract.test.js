const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// Lampa 3.4 calls `cardRender(object, data, card)`: the activity object first
// (with a `title` of its own), then the card data, then the Card instance. No
// DOM element is passed; only the Card can render one. Every hook has to find
// the element through the Card, or nothing the plugin draws ever appears.

const bindSource = fs.readFileSync('src/cards/ui-card-bind.js', 'utf8');
const context = {window: {}, console: console, HTMLElement: function HTMLElement() {}};
vm.runInNewContext(bindSource, context);
const bind = context.window.LampaYaniCardBind.create({
    hasYummyCardData: (value) => Boolean(value && value.yani_id)
});

const element = {nodeType: 1};
const activity = {title: 'Продолжить просмотр', url: 'yani/history', component: 'yani_history'};
const data = {yani_id: 42, title: 'Тайтл'};
const cardInstance = {render: (js) => (js ? element : {jquery: true, 0: element}), data: data};

const lampa34 = bind.cardRenderTarget(activity, data, cardInstance);
assert.strictEqual(lampa34.card, data, 'the card data must be found, not the activity object');
assert.strictEqual(lampa34.element, element, 'the element must come from the Card instance');

const legacy = bind.cardRenderTarget(data, element);
assert.strictEqual(legacy.card, data);
assert.strictEqual(legacy.element, element, 'an element passed directly is still used');

const foreign = {title: 'not a YummyAnime card'};
const none = bind.cardRenderTarget(activity, foreign, {render: () => element, data: foreign});
assert.strictEqual(none.card, null, 'a foreign card is not decorated');

// The other hooks parse their own card types the same way.
['src/cards/ui-card-rails.js', 'src/screens/ui-account-lists.js', 'src/screens/ui-collections.js'].forEach((file) => {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /if \(!element && card && card\.render\) element = card\.render\(true\);/,
        file + ' must not look for the element on the card data');
    assert.match(source, /if \(element \|\| !value \|\| value === card \|\| typeof value\.render !== 'function'\) return;/,
        file + ' must render the element through the Card instance');
});

const history = fs.readFileSync('src/playback/ui-playback-history.js', 'utf8');
assert.match(history, /var target = cardRenderTarget\(first, second, third\);/,
    'Continue Watching must resolve its cards through the shared parser');
assert.doesNotMatch(history, /value\.render \|\| value\.yani_id \|\| value\.title/,
    'an object with a title, such as the activity, must not be taken for the card');

console.log('card render hook contract checks passed');
