const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const trailers = fs.readFileSync('src/ui-trailers.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const menu = fs.readFileSync('src/ui-playback-menu.js', 'utf8');
const sources = ui + '\n' + trailers + '\n' + detail + '\n' + menu;

assert.match(ui, /function transientNavigationSnapshot\(\)[\s\S]{0,500}LampaYaniNavigation\.captureSnapshot\(\)[\s\S]{0,200}currentControllerName\(\) \|\| 'content'/);
assert.match(ui, /function restoreTransientInteraction\(snapshot\)[\s\S]{0,500}LampaYaniNavigation\.restoreSnapshot\(snapshot\)/);
assert.match(ui, /function showYummySelect\(params, snapshot\)[\s\S]{0,700}params\.onBack = function \(\)[\s\S]{0,300}restoreTransientInteraction\(snapshot\)/);
assert.match(ui, /function openGenres\(\)[\s\S]{0,250}component: 'yani_genres'/);
assert.match(ui, /function showYummyInput\(params, callback\)[\s\S]{0,1500}restoreTransientInteraction\(navigation\)/);

const directSelectCalls = ui.match(/Lampa\.Select\.show\(/g) || [];
assert.strictEqual(directSelectCalls.length, 1, 'temporary lists must go through showYummySelect');

[
    'showYummyActions',
    'openUserReviews',
    'loadDetailCollections',
    'legacyOpenTrailers',
    'renderCommentList'
].forEach((name) => {
    const start = sources.indexOf('function ' + name);
    assert.ok(start >= 0, name + ' must exist');
    assert.ok(sources.slice(start, start + 7000).includes('showYummySelect('), name + ' must use restorable Select');
});

console.log('transient navigation contract checks passed');
