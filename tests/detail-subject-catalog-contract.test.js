const assert = require('assert');
const fs = require('fs');

const api = fs.readFileSync('src/api.js', 'utf8');
const model = fs.readFileSync('src/ui-card-model.js', 'utf8');
const detail = fs.readFileSync('src/ui-detail.js', 'utf8');
const ui = fs.readFileSync('src/ui.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(model, /yani_creators: Array\.isArray\(item\.creators\)/);
assert.match(model, /yani_studios: Array\.isArray\(item\.studios\)/);
assert.match(api, /studio: function \(url, control\)/);
assert.match(api, /director: function \(id, control\)/);
assert.match(detail, /function createDetailCredits\(cardData\)/);
assert.match(detail, /createDetailCreditRow\('studio', t\('studios'\)/);
assert.match(detail, /createDetailCreditRow\('director', t\('creators'\)/);
assert.match(detail, /openSubjectCatalog\(kind, subject\)/);
assert.match(ui, /params\[kind === 'studio' \? 'studio_ids' : 'director_ids'\] = id/);
assert.match(ui, /subject_context: context/);
assert.match(ui, /function loadSubjectInformation\(context\)/);
assert.match(css, /\.yani-detail__credit\.focus/);

console.log('detail subject catalog contract checks passed');
