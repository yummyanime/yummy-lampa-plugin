const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const calls = [];
const context = {
    window: {navigator: {}},
    console,
    Promise,
    setTimeout,
    clearTimeout,
    AbortController,
    fetch: function (url) {
        calls.push(url);
        if (url.indexOf('/producers?') >= 0) return Promise.resolve({ok: true, json: function () { return Promise.resolve({data: [{name: 'Madhouse', images: {jpg: {image_url: 'studio.jpg'}}}]}); }});
        return Promise.resolve({ok: true, json: function () { return Promise.resolve({data: [{positions: ['Director'], person: {name: 'Test Director', images: {jpg: {image_url: 'director.jpg'}}}}]}); }});
    }
};
context.window.fetch = context.fetch;
vm.runInNewContext(fs.readFileSync('src/ui-media.js', 'utf8'), context);

Promise.all([
    context.window.LampaYaniMedia.findSubjectImage('studio', {id: 1, title: 'Madhouse'}, {}),
    context.window.LampaYaniMedia.findSubjectImage('director', {id: 2, title: 'Test Director'}, {remote_ids: {myanimelist_id: 123}})
]).then(function (images) {
    assert.deepStrictEqual(Array.from(images), ['studio.jpg', 'director.jpg']);
    assert.ok(calls.some(function (url) { return url.indexOf('/producers?') >= 0; }));
    assert.ok(calls.some(function (url) { return url.indexOf('/anime/123/staff') >= 0; }));
    console.log('Subject media checks passed');
}).catch(function (error) {
    console.error(error);
    process.exit(1);
});
