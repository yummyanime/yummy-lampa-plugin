const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/home/ui-home-insights.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const homeScreen = fs.readFileSync('src/home/ui-home.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const context = {window: {}, Promise, Date};
vm.runInNewContext(source, context);
const insights = context.window.LampaYaniHomeInsights;

assert.equal(insights.notificationCount({response: {unread_count: 7}}), 7);
assert.equal(insights.notificationCount({response: {notifications: {count: 3}}}), 3);
assert.equal(insights.notificationCount({response: {comments: 2, mentions: 1}}), 3);
assert.equal(insights.notificationCount({response: {count: 0, notifications: {unread_count: 2}}}), 2);
assert.equal(insights.notificationCount({response: {unread: {count: 4}}}), 4);
assert.equal(insights.notificationCount({response: [{viewed: false}, {viewed: true}, {read: false}]}), 2);
assert.equal(insights.unreadFromNotifications({response: [{viewed: false}, {viewed: true}, {read: false}]}), 2);
assert.equal(insights.resolveNotificationCount({response: {count: 0}}, {response: [{viewed: false}, {viewed: true}]}), 1);
assert.equal(insights.resolveNotificationCount({response: {unread_count: 5}}, {response: [{viewed: false}]}), 5);
assert.match(homeScreen, /LampaYaniApi\.notificationCounts\(homeRequestControl\(\)\)/);
assert.match(homeScreen, /LampaYaniApi\.notifications\(30, 0\)/);
assert.match(homeScreen, /resolveNotificationCount/);
assert.match(homeScreen, /notificationCache\.count === 0/);
assert.match(ui, /onUnreadCount:/);
assert.match(ui, /yani_home_notification_count/);
assert.match(homeScreen, /yani-home__service-hub/);
assert.match(homeScreen, /setServiceHub\(serviceState, serviceTitle/);
assert.match(homeScreen, /homeButtons\.status = serviceHub/);
assert.match(homeScreen, /component: 'yani_status'/);
assert.match(homeScreen, /definition\.key === 'service' \|\| items\.some/);
assert.match(homeScreen, /if \(!panelRoots\.service\) panel\('service'\)/);
assert.match(css, /\.yani-home__service-state--up/);
assert.match(css, /\.yani-home__service-state--degraded/);
assert.match(css, /\.yani-home__service-state--down/);
assert.match(css, /\.yani-home__service-constellation/);
assert.match(css, /\.yani-home__service-hub\.focus/);
assert.match(css, /\.yani-home__profile-card/);
assert.match(css, /@keyframes yani-home-service-orbit/);

(async () => {
    const partial = await insights.dashboard({
        feed: () => Promise.resolve({response: {new: [], new_videos: [], collections: []}}),
        schedule: () => Promise.reject(new Error('offline')),
        now: Date.now()
    });
    assert.equal(partial.service.api, true);
    assert.equal(partial.service.degraded, true);
    assert.equal(partial.service.feed, true);
    assert.equal(partial.service.schedule, false);
    assert.equal(partial.schedule, null);
    assert.equal(partial.translations.count, 0);

    const down = await insights.dashboard({
        feed: () => Promise.reject(new Error('offline')),
        schedule: () => Promise.reject(new Error('offline')),
        now: Date.now()
    });
    assert.equal(down.service.api, false);
    assert.equal(down.service.degraded, false);
    assert.equal(down.counts, null);
    assert.equal(down.schedule, null);
    assert.equal(down.translations, null);
    console.log('dashboard service contract checks passed');
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
