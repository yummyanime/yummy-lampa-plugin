const assert = require('assert');
const fs = require('fs');

const api = fs.readFileSync('src/core/api.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/screens/ui-detail.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const i18n = fs.readFileSync('src/core/i18n.js', 'utf8');

assert.match(api, /rate: function \(id, value\)[\s\S]{0,350}method: 'PUT'[\s\S]{0,180}JSON\.stringify\(\{rate: value\}\)/);
assert.match(api, /removeRate: function \(id\)[\s\S]{0,180}method: 'DELETE'/);
assert.match(detail, /function createDetailRatingAction\(cardData\)/);
assert.match(detail, /for \(var value = 10; value >= 1; value--\)/);
assert.match(detail, /LampaYaniApi\.removeRate\(cardData\.yani_id\)/);
assert.match(detail, /LampaYaniApi\.rate\(cardData\.yani_id, selected\.value\)/);
assert.match(detail, /cardData\.yani_user_rating = selected\.remove \? null : Number\(selected\.value\)/);
assert.match(css, /\.yani-detail__rating-action\.focus/);
['ru', 'en', 'uk'].forEach((language) => {
    ['set_rating', 'remove_rating', 'rating_removed'].forEach((key) => {
        assert.match(i18n, new RegExp(`messages\\.${language}\\.${key}\\s*=`));
    });
});

console.log('detail rating contract checks passed');
