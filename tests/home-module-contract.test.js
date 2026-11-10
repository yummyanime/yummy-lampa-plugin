const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('src/home/ui-home.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const build = fs.readFileSync('build.js', 'utf8');

assert.match(build, /'src\/home\/ui-home-insights\.js', 'src\/home\/ui-home\.js'[\s\S]*'src\/ui\.js'/,
    'the home screen must load after its sections and insights and before the main UI');
assert.match(ui, /var homeScreen = LampaYaniHomeScreen\.create\(\{/);
assert.match(ui, /var Home = homeScreen\.Component;/);
assert.match(ui, /Lampa\.Component\.add\('yani_home', Home\)/);
['Home', 'homeIcon', 'homeExploreDecoration', 'homeFlowIcon'].forEach((name) => {
    assert.doesNotMatch(ui, new RegExp('function ' + name + '\\('), name + ' belongs to ui-home.js');
    assert.match(source, new RegExp('function ' + name + '\\('), name + ' must live in ui-home.js');
});

// The account list cache stays in ui.js, where it is filled and read; the
// home screen clears it on sign-in changes through the function it is given.
assert.match(ui, /var userListsSnapshot = null;/);
assert.doesNotMatch(source, /userListsSnapshot = null/, 'the home module must not assign a variable of ui.js');
assert.match(source, /function onHomeAuthorizationChanged\(\) \{\s*homeAuthorizationChanged = true;\s*resetUserListsSnapshot\(\);/);

const context = {window: {}};
vm.runInNewContext(source, context);
const api = context.window.LampaYaniHomeScreen.create({});
assert.strictEqual(typeof api.Component, 'function', 'Home must be exported as a component');

console.log('home module contract checks passed');
