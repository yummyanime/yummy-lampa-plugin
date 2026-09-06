const assert = require('assert');
const fs = require('fs');

const auth = fs.readFileSync('src/ui-auth.js', 'utf8');
const status = fs.readFileSync('src/ui-status.js', 'utf8');
const notifications = fs.readFileSync('src/ui-notifications.js', 'utf8');
const player = fs.readFileSync('src/ui-player.js', 'utf8');
const schedule = fs.readFileSync('src/ui-schedule.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');

assert.match(auth, /data-yani-focus-key/);
assert.match(auth, /function refreshFocus\(\)[\s\S]{0,800}collectionFocus/);
assert.match(auth, /toggle: refreshFocus/);

assert.match(status, /data-yani-focus-key/);
assert.match(status, /last && document\.documentElement\.contains\(last\)/);
assert.match(status, /period-["'] \+ key/);

assert.match(notifications, /function focusable\(element\)[\s\S]{0,220}LampaYaniNavigation\.bindFocus/);
assert.match(notifications, /function refreshFocus\(preferred\)[\s\S]{0,700}collectionFocus/);
assert.match(notifications, /collectionSet\(scroll\.render\(\), false, true\)/);

// The embedded page owns the keys. A control of the plugin's own would be the
// only focusable element in Lampa's collection and would take every OK press,
// so the page's own play button could never be reached with a remote. The
// iframe takes the focus instead, and Back is the one key this screen answers.
assert.ok(!/yani-player__back|yani-player__anchor/.test(player), 'no control of our own may hold the focus');
assert.match(player, /function focusPlayer\(\)/, 'the embedded page must receive the focus');
assert.match(player, /back: close/, 'Back must stay the way out');
// A cross-origin frame accepts no synthetic events, so its play button can only
// be pressed by real input - which means the browsing context itself has to be
// handed over, not merely the element focused.
assert.match(player, /contentWindow\.focus\(\)/, 'the keys must be handed to the embedded page');
assert.match(player, /enter: focusPlayer/, 'OK must go to the embedded page rather than to us');
// Nothing of ours goes into the collection any more: whatever sits there takes
// the OK press that belongs to the embedded page.
assert.ok(!/collectionSet|collectionFocus/.test(player), 'the screen must not hold a focus collection of its own');
assert.match(schedule, /function refreshFocus\(element\)/);
assert.match(schedule, /function moveDay\(delta\)/);
assert.match(schedule, /select\(next, 'chip'\)/);
assert.match(schedule, /select\(index, 'releases'\)/);
assert.match(schedule, /select\(selectedDay - 1, 'releases'\)/);
assert.match(schedule, /select\(selectedDay \+ 1, 'releases'\)/);
assert.match(schedule, /if \(current\.hasClass\('yani-schedule__day-chip'\)\)[\s\S]{0,200}moveDay\(-1\)/);
assert.match(schedule, /if \(current\.hasClass\('yani-schedule__day-chip'\)\)[\s\S]{0,200}moveDay\(1\)/);
assert.match(schedule, /focusSelectedChip\(\)/);
assert.match(schedule, /data-yani-focus-key/);
assert.match(schedule, /function shortcutBadge\(color\)[\s\S]{0,500}yani-schedule__shortcut-badge/);
assert.match(schedule, /function updateShortcutBadges\(\)[\s\S]{0,900}shortcutBadge\('green'\)[\s\S]{0,500}shortcutBadge\('yellow'\)[\s\S]{0,500}shortcutBadge\('blue'\)/);
assert.match(schedule, /group\.relativeOffset === 0\) chip\.append\(shortcutBadge\('red'\)\)/);
assert.match(schedule, /function handleRemoteShortcut\(event\)[\s\S]{0,900}focusFirstRelease\(\)/);
assert.match(schedule, /document\.addEventListener\('keydown', remoteShortcutHandler, true\)/);
assert.ok(!/\.yani-player__back/.test(css), 'no control may be drawn over the embedded page');
['ru', 'en', 'uk'].forEach((language) => {
    assert.match(i18n, new RegExp(`messages\\.${language}\\.back_to_lampa\\s*=`));
});

console.log('TV navigation contract checks passed');
