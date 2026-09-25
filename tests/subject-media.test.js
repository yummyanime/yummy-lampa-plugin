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
        if (url.indexOf('wbsearchentities') >= 0) return Promise.resolve({ok: true, json: function () { return Promise.resolve({search: [{id: 'Q1', label: 'Madhouse'}]}); }});
        if (url.indexOf('wbgetentities') >= 0) return Promise.resolve({ok: true, json: function () { return Promise.resolve({entities: {Q1: {claims: {P154: [{mainsnak: {datavalue: {value: 'Madhouse logo.svg'}}}]}}}}); }});
        if (url.indexOf('graphql.anilist.co') >= 0) return Promise.resolve({ok: true, json: function () { return Promise.resolve({data: {Media: {staff: {edges: [{role: 'Director', node: {name: {full: 'Test Director'}, image: {large: 'director.jpg'}}}]}}}}); }});
        return Promise.resolve({ok: true, json: function () { return Promise.resolve({data: []}); }});
    }
};
context.window.fetch = context.fetch;
vm.runInNewContext(fs.readFileSync('src/ui-media.js', 'utf8'), context);

Promise.all([
    context.window.LampaYaniMedia.findSubjectImage('studio', {id: 1, title: 'Madhouse'}, {}),
    context.window.LampaYaniMedia.findSubjectImage('director', {id: 2, title: 'Test Director'}, {remote_ids: {myanimelist_id: 123}})
]).then(function (images) {
    assert.ok(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/Madhouse%20logo\.svg/.test(images[0]));
    assert.strictEqual(images[1], 'director.jpg');
    assert.ok(calls.some(function (url) { return url.indexOf('wbsearchentities') >= 0; }));
    assert.ok(calls.some(function (url) { return url.indexOf('graphql.anilist.co') >= 0; }));
    console.log('Subject media checks passed');
}).catch(function (error) {
    console.error(error);
    process.exit(1);
});
