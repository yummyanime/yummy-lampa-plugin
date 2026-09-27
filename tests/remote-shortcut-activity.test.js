const assert = require('assert');
const fs = require('fs');
const path = require('path');

function source(name) {
    return fs.readFileSync(path.join(__dirname, '..', 'src', name), 'utf8');
}

[
    ['ui-catalog-controls.js', 'comp'],
    ['ui-account-lists.js', 'component'],
    ['ui-schedule.js', 'comp'],
    ['ui-detail.js', 'detailComponent']
].forEach(function (entry) {
    const body = source(entry[0]);
    const owner = entry[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(body, new RegExp("Lampa\\.Activity\\.own\\(" + owner + "\\)"),
        entry[0] + ' must accept remote shortcuts only for its active Lampa activity');
});

console.log('remote shortcut activity ownership contract passed');
