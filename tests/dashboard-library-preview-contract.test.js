const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/ui-home-insights.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const context = {window: {}};
vm.runInNewContext(source, context);
const insights = context.window.LampaYaniHomeInsights;

const preview = insights.libraryPreview([
    {title: 'Old', updated_at: 1, duration: 100, time: 20},
    {anime_id: 42, video_id: 4207, title: 'Newest', updated_at: 4, duration: 100, time: 200, poster: '//cdn.example/new.jpg', number: 7, player: 'Kodik'},
    {title: 'Third', updated_at: 2},
    {title: 'Second', updated_at: 3}
], 3);

assert.deepEqual(preview.map((item) => item.title), ['Newest', 'Second', 'Third']);
assert.equal(preview[0].poster, 'https://cdn.example/new.jpg');
assert.equal(preview[0].episode, 7);
assert.equal(preview[0].progress, 99);
assert.equal(preview[0].anime_id, 42);
assert.equal(preview[0].video_id, 4207);
assert.equal(preview[0].time, 200);
assert.equal(preview[0].duration, 100);
assert.equal(preview[0].player, 'Kodik');
assert.equal(insights.libraryPreview([], 3).length, 0);

assert.match(ui, /data-yani-home-key/);
assert.match(ui, /yani_home_last_focus/);
assert.match(ui, /renderLibraryStrip\(LampaYaniHomeInsights\.libraryPreview\(continuing, 3\)\)/);
assert.match(ui, /yani-home__library-mini selector/);
assert.match(ui, /yani-home__library-pulse/);
assert.match(ui, /personal\.continue_count \+ ' \/ ' \+ personal\.tracked_total/);
assert.match(ui, /mini\.on\('hover:enter click\.yaniHomeResume'/);
assert.match(ui, /openVideos\(card, true\)/);
assert.match(ui, /focusHomeElement\(target, isRailFocus\(target\) \? railCollection\(\) : homeCollection\(\)/);
assert.match(ui, /if \(target\) renderIntroContext\(\$\(target\)\);/);
assert.match(ui, /focusHomeElement = function \(element, collection\)[\s\S]{0,500}scroll\.update\(\$\(element\), true\)/);
assert.match(css, /\.yani-home__library-preview--visible \{ display: grid; \}/);
assert.match(css, /\.yani-home__library-mini-progress i/);
assert.match(css, /\.yani-home__library-mini\.focus/);
assert.match(css, /\.yani-home__library-pulse--active/);
assert.match(css, /@keyframes yani-home-library-pulse/);

console.log('dashboard library preview contract checks passed');
