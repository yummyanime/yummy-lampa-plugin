const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/home/ui-home-insights.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const context = {window: {}, Date};
vm.runInNewContext(source, context);
const insights = context.window.LampaYaniHomeInsights;

const now = new Date(2026, 7, 11, 10, 0, 0).getTime();
const upcoming = insights.releaseCountdown(now + (26 * 60 + 15) * 60000, now);
assert.equal(upcoming.state, 'upcoming');
assert.equal(upcoming.days, 1);
assert.equal(upcoming.hours, 2);
assert.equal(upcoming.minutes, 15);
assert.equal(insights.releaseCountdown(now - 1, now).state, 'aired');
assert.equal(insights.releaseCountdown(0, now).state, 'unknown');
assert.equal(insights.releaseCountdown(now + 1, now).minutes, 1);

assert.match(homeScreen, /var updateEpisodeCountdown = function \(\) \{\};/);
assert.match(homeScreen, /updateEpisodeCountdown = function \(release\)/);
assert.match(homeScreen, /releaseCountdown\(release && release\.timestamp, Date\.now\(\)\)/);
assert.match(homeScreen, /currentEpisodeFlow\) updateEpisodeCountdown\(currentEpisodeFlow\.japan\)/);
assert.match(homeScreen, /t\('next_broadcast'\)/);
assert.match(homeScreen, /t\('broadcast_started'\)/);
assert.match(css, /\.yani-home__episode-flow-live--upcoming/);
assert.match(css, /\.yani-home__episode-flow-live--aired/);

console.log('dashboard countdown contract checks passed');
