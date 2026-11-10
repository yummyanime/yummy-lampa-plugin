const assert = require('assert');
const fs = require('fs');

const ui = fs.readFileSync('src/ui.js', 'utf8');
const watcher = fs.readFileSync('src/ui-playback-watcher.js', 'utf8');
const i18n = fs.readFileSync('src/i18n.js', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

assert.match(watcher, /value === 'op' \|\| value === 'ed' \|\| value === 'op_ed' \|\| value === 'suggest'/);
assert.match(
    ui,
    /values: \{off: t\('aniskip_off'\), op: t\('aniskip_openings'\), ed: t\('aniskip_endings'\), op_ed: t\('aniskip_openings_endings'\), suggest: t\('aniskip_suggest'\)\}/
);
assert.match(watcher, /op: mode === 'op' \|\| mode === 'op_ed' \|\| mode === 'suggest'/);
assert.match(watcher, /ed: mode === 'ed' \|\| mode === 'op_ed' \|\| mode === 'suggest'/);
assert.match(watcher, /skipPrompt: skipMode === 'suggest'/);
assert.match(watcher, /function showSkipPrompt/);
assert.match(watcher, /function confirmSkipPrompt/);
assert.match(watcher, /yani_player_skip/);
assert.match(watcher, /function focusSkipPrompt/);
assert.match(watcher, /ensurePlayerSkipUpHook/);
assert.match(watcher, /if \(!skipPromptState\.focused\) focusSkipPrompt\(\)/);
assert.match(watcher, /Math\.abs\(\(state\.skipLength \|\| 0\) - rounded\) > 15/);
assert.match(css, /\.yani-skip-prompt--visible/);

['ru', 'en', 'uk'].forEach((language) => {
    ['aniskip_endings', 'aniskip_suggest', 'aniskip_skip', 'aniskip_skip_opening', 'aniskip_skip_ending'].forEach((key) => {
        assert.match(i18n, new RegExp('messages\\.' + language + '\\.' + key + '\\s*='));
    });
});

console.log('aniskip ui contract checks passed');
