const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/home/ui-home-insights.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const context = {window: {}};
vm.runInNewContext(source, context);
const insights = context.window.LampaYaniHomeInsights;

const discovery = insights.discoveryInsights({response: {
    new: [
        {title: 'Older', date: 100, poster: {medium: '//cdn.example/old.jpg'}},
        {title: 'Newest', date: 300, year: 2026, anime_status: {title: 'Ongoing'}, type: {name: 'TV'}, poster: {big: '//cdn.example/new.jpg'}}
    ],
    collections: [{title: 'Summer stories', poster_previews: ['//cdn.example/collection.jpg'], animes: [{id: 1}, {id: 2}]}]
}});

assert.equal(discovery.new_release.title, 'Newest');
assert.equal(discovery.new_release.poster, 'https://cdn.example/new.jpg');
assert.equal(discovery.new_release.meta, '2026 · Ongoing · TV');
assert.equal(discovery.collection.title, 'Summer stories');
assert.equal(discovery.collection.poster, 'https://cdn.example/collection.jpg');
assert.equal(discovery.collection.count, 2);

const merged = insights.mergeDashboardSnapshot({discovery}, {service: {api: false, feed: false, schedule: false}});
assert.equal(merged.discovery.new_release.title, 'Newest');
assert.equal(merged.discovery.collection.title, 'Summer stories');

assert.match(homeScreen, /setPreview\(homeButtons\.new_releases, newRelease\.title, newRelease\.meta\)/);
assert.match(homeScreen, /setArtwork\(homeButtons\.new_releases, newRelease\.poster\)/);
assert.match(homeScreen, /setPreview\(homeButtons\.collections, featuredCollection\.title/);
assert.match(homeScreen, /setArtwork\(homeButtons\.collections, featuredCollection\.poster\)/);

console.log('dashboard feed preview contract checks passed');
