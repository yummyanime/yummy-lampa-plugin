const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const detail = fs.readFileSync('src/screens/ui-detail.js', 'utf8');

assert.match(detail, /row\.on\('hover:enter click\.yaniComment'[\s\S]{0,500}transientNavigationSnapshot\(\)[\s\S]{0,300}commentReplies\(comment, 0, \[\], null, navigation\)/);
assert.doesNotMatch(ui, /commentReplies\(comment, 0, \[\], function \(\) \{\}\)/);
assert.match(ui, /function commentsMenu\(id, skip, existing, navigation\)[\s\S]{0,900}commentsMenu\(id, skip \+ page\.length, comments, navigation\)/);
assert.match(ui, /function commentReplies\(comment, skip, existing, onBack, navigation\)[\s\S]{0,900}commentReplies\(comment, skip \+ page\.length, comments, onBack, navigation\)/);
assert.match(ui, /function renderCommentList\(title, comments, onMore, onBack, navigation\)[\s\S]{0,1400}setTimeout\(function \(\)[\s\S]{0,300}renderCommentList\(title, comments, onMore, onBack, navigation\)[\s\S]{0,500}showYummySelect\(params, navigation\)/);

console.log('comment navigation contract checks passed');
