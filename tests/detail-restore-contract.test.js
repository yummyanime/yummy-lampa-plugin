const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const card = fs.readFileSync('src/ui-standard-card.js', 'utf8');

assert.match(detail, /var routeId = LampaYaniUiUtils\.detailRouteId\(object\)/);
assert.match(detail, /LampaYaniApi\.detail\(detailId\)/);
assert.match(detail, /Lampa\.Activity\.replace\(\{url: 'yani', title: 'YummyAnime', component: 'yani_home'\}\)/);
assert.match(source, /component: 'yani_detail',[\s\S]{0,120}id: id,[\s\S]{0,80}yani_id: id/);
assert.match(card, /component: 'yani_detail',[\s\S]{0,160}id: yaniId,[\s\S]{0,80}yani_id: yaniId/);
assert.match(detail, /click\.yaniOrder'[\s\S]{0,120}openYummyDetail\(related, false\)/);
assert.doesNotMatch(detail, /click\.yaniOrder'[\s\S]{0,120}openYummyDetail\(related, true\)/);
assert.match(detail, /yani-detail__recommendation selector[\s\S]{0,900}hover:focus'[\s\S]{0,220}keepHorizontalFocusVisible\(list, row\)/);
assert.match(detail, /function keepHorizontalFocusVisible\(container, element\)[\s\S]{0,900}viewport\.getBoundingClientRect\(\)/);
assert.match(detail, /target\.getBoundingClientRect\(\)/);
assert.match(detail, /viewport\.scrollLeft = Math\.max\(0, viewport\.scrollLeft - \(leftEdge - targetRect\.left\)\)/);
assert.match(detail, /viewport\.scrollLeft \+= targetRect\.right - rightEdge/);
assert.match(detail, /function appendDetailNavigation\(container\)/);
assert.match(detail, /enabled\.controller\.yaniDetailOwner !== detailComponent/);
assert.match(detail, /Lampa\.Controller\.collectionAppend\(targets\)/);
assert.match(detail, /loadDetailRecommendations\(data, info, bindDetailScrollTargets, appendDetailNavigation, deps\)/);
assert.match(detail, /if \(appendNavigation\) appendNavigation\(row\)/);
assert.match(detail, /appendDetailNavigation\(empty\)/);
assert.match(detail, /appendDetailNavigation\(errorRow\)/);
assert.match(detail, /yaniDetailOwner: detailComponent/);
assert.match(detail, /comp\.destroy = function \(\) \{\s*destroyed = true/);
assert.match(detail, /if \(videosAbort\) videosAbort\.abort\(\)/);

console.log('detail restore contract tests passed');
