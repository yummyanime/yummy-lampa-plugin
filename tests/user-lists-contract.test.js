const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const lists = fs.readFileSync('src/ui-account-lists.js', 'utf8');
const listControls = fs.readFileSync('src/ui-account-list-controls.js', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');

assert.match(ui, /Lampa\.Component\.add\('yani_user_lists', UserLists\)/);
assert.match(ui, /key: 'user_lists', title: t\('user_lists'\), group: 'library', authorized: true/);
assert.match(ui, /!item\.authorized \|\| LampaYaniAuth\.token\(\)/);
assert.match(ui, /\['user_lists', 'user_lists'\]/);
assert.match(ui, /component: 'yani_user_lists'/);

assert.match(lists, /function userLists\(object, deps\)/);
assert.match(lists, /var pageSize = 30/);
assert.match(lists, /LampaYaniAccountListControls\.create/);
assert.match(lists, /items = controls\.sort/);
assert.match(lists, /controls\.install\(items\.length\)/);
assert.match(lists, /controls\.destroy\(\)/);
assert.match(lists, /showSelect: deps\.showSelect/);
assert.match(listControls, /yani-account-list-sort-option selector/);
assert.match(listControls, /yani_account_list_sort_/);
assert.match(lists, /object\.page = 1/);
assert.match(lists, /items\.slice\(start, start \+ pageSize\)\.map\(function \(item\)/);
assert.match(lists, /LampaYaniAccountListControls\.progress\(item\)/);
assert.match(lists, /object\.lazy && deps\.loadItems/);
assert.match(lists, /deps\.loadItems\(object\.definition\)/);
assert.match(lists, /this\.activity\.loader\(true\)/);
assert.match(lists, /comp\.nextPageReuest = function/);
assert.match(lists, /comp\.nextPageRequest = comp\.nextPageReuest/);
assert.match(lists, /var component = new Lampa\.InteractionMain\(object\)/);
assert.match(lists, /component\.create = function \(\)/);
assert.match(lists, /return component;/);
assert.doesNotMatch(lists.slice(lists.indexOf('function userLists'), lists.indexOf('window.LampaYani =')), /this\.create = function/, 'the modular factory must return the Activity component');
assert.match(lists, /function withMore\(row\)/);
assert.match(lists, /\(row\.results \|\| \[\]\)\.slice\(0, 10\)/);
assert.match(lists, /yani_more: true/);
assert.match(lists, /function listVisual\(key\)/);
assert.match(lists, /function decorateListCard\(first, second, third\)/);
assert.match(lists, /yani-user-list-card--/);
assert.match(lists, /yani-card-rails/);
assert.doesNotMatch(lists, /decorateListCard[\s\S]{0,800}yani-card-grid/);
assert.match(lists, /yani-user-list-card__progress/);
assert.match(lists, /component\.cardRender = decorateListCard/);
assert.match(lists, /function shortcutMeta\(row\)[\s\S]{0,700}watching: 1[\s\S]{0,400}history: 0/);
assert.match(lists, /yani_shortcut_number: shortcut\.number/);
assert.match(lists, /yani-user-list-card__shortcut/);
assert.match(lists, /function handleRemoteShortcut\(event\)[\s\S]{0,1000}var byColor = \{red: 'watching'/);
assert.match(lists, /document\.addEventListener\('keydown', remoteShortcutHandler, true\)/);
assert.match(lists, /document\.removeEventListener\('keydown', remoteShortcutHandler, true\)/);
assert.match(lists, /card_events:/);
assert.match(lists, /card\.yani_history\) deps\.openHistory\(\)/);
assert.match(lists, /deps\.openList\(card\.yani_definition\)/);
assert.match(lists, /deps\.openCard\(card\)/);
assert.match(lists, /deps\.loadRows\(\)/);
assert.match(ui, /function loadUserListShortcutCounts\(\)/);
assert.match(ui, /counts\[definition\.key\] = filterAccountListItems\(definition, result\[0\]\)\.length/);
const userListsComponent = lists.slice(lists.indexOf('function userLists'), lists.indexOf('window.LampaYani ='));
assert.doesNotMatch(userListsComponent, /LampaYaniApi\./, 'list shortcuts must render without an eager API request');

assert.match(ui, /function openUserListShortcut\(definition\)/);
assert.match(ui, /pushAccountList\(definition, \[\], true\)/);
assert.match(ui, /component: 'yani_account_list',[\s\S]{0,160}page: 1/);
assert.match(ui, /function resolveUserListsUserId\(\)/);
assert.match(ui, /function loadUserListsSnapshot\(userId\)/);
assert.match(ui, /function loadUserListShortcutItems\(definition\)/);
assert.match(ui, /return loadUserListsSnapshot\(userId\)\.then\(function \(items\)/);
assert.match(ui, /var cached = readCache\(userId\)/);
assert.match(ui, /loadItems: loadUserListShortcutItems/);
assert.match(ui, /openList: openUserListShortcut/);
assert.match(ui, /openHistory: openWatchHistory/);
assert.match(ui, /function loadUserListRows\(\)/);
assert.match(ui, /results: selected\.slice\(0, 10\)\.map\(function \(item\)/);
assert.match(ui, /card\.yani_list_progress = LampaYaniAccountListControls\.progress\(item\)/);
assert.match(ui, /function localHistoryCards\(remotePayload\)/);
assert.match(ui, /function hydrateHistoryPosters\(cards, listItems\)/);
assert.match(ui, /LampaYaniApi\.watchHistory\(30, 0\)/);
assert.match(ui, /missing\.slice\(offset, offset \+ 2\)/, 'poster recovery must limit request concurrency');
assert.match(ui, /loadRows: loadUserListRows/);
assert.match(ui, /openCard: function \(card\) \{ openYummyDetail\(card, false\); \}/);
assert.match(ui, /function openWatchHistory\(\)[\s\S]{0,300}component: 'yani_history'/);

['ru', 'en', 'uk'].forEach((language) => {
    assert.match(i18n, new RegExp(`messages\\.${language}\\.user_lists\\s*=`));
    assert.match(i18n, new RegExp(`messages\\.${language}\\.favorites\\s*=`));
    assert.match(i18n, new RegExp(`messages\\.${language}\\.open_list\\s*=`));
    assert.match(i18n, new RegExp(`messages\\.${language}\\.watch_history\\s*=`));
    assert.match(i18n, new RegExp(`messages\\.${language}\\.more\\s*=`));
});

const context = {window: {}};
vm.runInNewContext(lists, context);
const helpers = context.window.LampaYaniAccountLists;
assert.strictEqual(helpers.listVisual('watching').from, '#ff6878');
assert.strictEqual(helpers.listVisual('history').to, '#6653b4');
const normalized = helpers.normalize({response: {items: [
    {anime: {anime_id: 42, title: 'Nested title'}, user: {list: {list: {id: 1}}}, date: 123},
    {anime_id: 43, title: 'Direct title', user: {list: {is_fav: true, list: {id: 0}}}}
]}});
assert.strictEqual(normalized.length, 2);
assert.strictEqual(normalized[0].anime_id, 42);
assert.strictEqual(normalized[0].date, 123);
assert.strictEqual(helpers.filterItems({id: 1}, normalized).length, 1);
assert.strictEqual(helpers.filterItems({id: 4}, normalized).length, 1);
assert.deepStrictEqual(Array.from(helpers.normalize({response: []})), []);

console.log('User lists contract checks passed');
