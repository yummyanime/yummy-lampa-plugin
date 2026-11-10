const assert = require('assert');
const fs = require('fs');

const css = fs.readFileSync('style.css', 'utf8');
const renderers = fs.readFileSync('src/cards/ui-card-renderers.js', 'utf8');

// Layout chrome must track Lampa interface scale (root font-size → em), not
// hard-coded device pixels outside media-query breakpoints.
const declarations = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('}')
    .map((chunk) => chunk.trim())
    .filter(Boolean);

const absoluteSizeHits = [];
declarations.forEach((chunk) => {
    const selector = chunk.split('{')[0].trim();
    const body = chunk.includes('{') ? chunk.slice(chunk.indexOf('{') + 1) : '';
    if (/^@media\b/i.test(selector)) return;
    const matches = body.match(/(?:^|;)\s*(?:width|height|min-width|max-width|min-height|max-height|top|right|bottom|left|padding|margin|gap|font-size|border(?:-width)?)\s*:[^;]*\b\d+(?:\.\d+)?px\b/gi) || [];
    matches.forEach((match) => {
        if (/\b(?:0|1)px\b/.test(match)) return; // hairlines
        if (/border-radius[^;]*999px/.test(match)) return;
        absoluteSizeHits.push(selector.split(',')[0].trim() + ' → ' + match.trim());
    });
});

assert.deepStrictEqual(
    absoluteSizeHits,
    [],
    'non-breakpoint layout sizes must use em so Lampa font scale / 720p / 4K stay consistent:\n' + absoluteSizeHits.join('\n')
);

assert.match(css, /@media \(orientation: portrait\), \(max-aspect-ratio: 3\/4\)/);
assert.match(css, /@media \(max-height: 820px\)/);
assert.match(css, /@media \(min-width: 2500px\)/);
assert.match(css, /\.yani-home__grid \{[\s\S]*?max-width: 94em/);
assert.match(renderers, /emWidth:\s*width \/ fontSize/);
assert.match(renderers, /emWidth < 11\.5/);
assert.match(renderers, /emWidth < 6\.6/);
assert.doesNotMatch(renderers, /width < 185/);

console.log('ui scaling contract checks passed');
