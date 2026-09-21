const fs = require('fs');
const path = require('path');

const CATEGORIES = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
const PREFIX_MAP = [
    ['security', 'Security'],
    ['deprecated', 'Deprecated'],
    ['deprecate', 'Deprecated'],
    ['added', 'Added'],
    ['add', 'Added'],
    ['fixed', 'Fixed'],
    ['fix', 'Fixed'],
    ['removed', 'Removed'],
    ['remove', 'Removed'],
    ['changed', 'Changed'],
    ['refactor', 'Changed']
];

const HEADER = [
    '# Changelog',
    '',
    'All notable changes to this project are documented in this file.',
    '',
    'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),',
    'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).',
    '',
    'Entries use [Keep a Changelog](https://keepachangelog.com/) categories: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**. The commit hook folds every `###` section under `[Unreleased]` (unknown headings are kept after the standard six).',
    ''
].join('\n');

function newline(source) {
    return String(source || '').indexOf('\r\n') >= 0 ? '\r\n' : '\n';
}

function capitalize(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function emptyGroups() {
    const groups = {};
    CATEGORIES.forEach(function (name) { groups[name] = []; });
    groups._extra = [];
    return groups;
}

function classifyNote(note) {
    let text = String(note || '').replace(/^\s*-\s*/, '').replace(/\.+\s*$/, '').trim();
    if (!text) return null;
    const lower = text.toLowerCase();
    for (let index = 0; index < PREFIX_MAP.length; index++) {
        const prefix = PREFIX_MAP[index][0];
        if (lower === prefix || lower.indexOf(prefix + ' ') === 0) {
            return {
                category: PREFIX_MAP[index][1],
                text: capitalize(text.slice(prefix.length).trim())
            };
        }
    }
    return {category: 'Changed', text: capitalize(text)};
}

function parseNotes(notes) {
    const groups = emptyGroups();
    const items = Array.isArray(notes) ? notes : [notes];
    items.forEach(function (note) {
        String(note || '').split(/\s*\|\s*/).forEach(function (part) {
            const classified = classifyNote(part);
            if (!classified) return;
            if (!groups[classified.category]) groups[classified.category] = [];
            groups[classified.category].push(classified.text);
        });
    });
    return groups;
}

function formatGroups(groups, nl) {
    nl = nl || '\n';
    const blocks = [];
    CATEGORIES.forEach(function (name) {
        const items = groups[name] || [];
        if (!items.length) return;
        blocks.push('### ' + name + nl + nl + items.map(function (item) {
            return '- ' + item;
        }).join(nl));
    });
    (groups._extra || []).forEach(function (extra) {
        if (!extra.items || !extra.items.length) return;
        blocks.push('### ' + extra.name + nl + nl + extra.items.map(function (item) {
            return '- ' + item;
        }).join(nl));
    });
    return blocks.join(nl + nl);
}

function parseSections(source) {
    const text = String(source || '').replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/);
    const sections = [];
    let current = null;

    function start(section) {
        if (current) sections.push(current);
        current = section;
    }

    lines.forEach(function (line) {
        const version = line.match(/^## \[([^\]]+)\]\s+-\s+(\d{4}-\d{2}-\d{2})\s*$/);
        const unreleased = line.match(/^## \[Unreleased\]\s*$/i);
        const heading = line.match(/^###\s+(.+?)\s*$/);
        if (unreleased) {
            start({kind: 'unreleased', heading: line, groups: emptyGroups(), current: 'Changed', prelude: []});
            return;
        }
        if (version) {
            start({
                kind: 'version',
                version: version[1],
                date: version[2],
                heading: line,
                groups: emptyGroups(),
                current: 'Changed'
            });
            return;
        }
        if (heading && current && (current.kind === 'unreleased' || current.kind === 'version')) {
            const name = heading[1].trim();
            current.current = CATEGORIES.indexOf(name) >= 0 ? name : name;
            if (CATEGORIES.indexOf(name) < 0) {
                let extra = current.groups._extra.filter(function (item) { return item.name === name; })[0];
                if (!extra) {
                    extra = {name: name, items: []};
                    current.groups._extra.push(extra);
                }
            } else if (!current.groups[name]) {
                current.groups[name] = [];
            }
            return;
        }
        if (/^\s*-\s+/.test(line) && current && (current.kind === 'unreleased' || current.kind === 'version')) {
            const item = line.replace(/^\s*-\s+/, '').trim();
            if (!item) return;
            if (CATEGORIES.indexOf(current.current) >= 0) current.groups[current.current].push(item);
            else {
                let extra = current.groups._extra.filter(function (entry) { return entry.name === current.current; })[0];
                if (!extra) {
                    extra = {name: current.current, items: []};
                    current.groups._extra.push(extra);
                }
                extra.items.push(item);
            }
            return;
        }
        if (current && current.kind === 'unreleased' && line.trim() && !/^\s*-\s+/.test(line) && !/^### /.test(line)) {
            current.prelude.push(line);
        }
    });
    if (current) sections.push(current);
    return sections;
}

function foldUnreleased(source) {
    const nl = newline(source);
    const converted = /## \[Unreleased\]/i.test(source) ? source : convertLegacy(source);
    const sections = parseSections(converted);
    const unreleased = sections.filter(function (section) { return section.kind === 'unreleased'; })[0] || {
        kind: 'unreleased',
        groups: emptyGroups()
    };
    const versions = sections.filter(function (section) { return section.kind === 'version'; });
    const body = formatGroups(unreleased.groups, nl);
    const parts = [HEADER.replace(/\n/g, nl), '## [Unreleased]'];
    if (body) parts.push('', body);
    versions.forEach(function (section) {
        parts.push('', '## [' + section.version + '] - ' + section.date);
        const formatted = formatGroups(section.groups, nl);
        if (formatted) parts.push('', formatted);
    });
    return parts.join(nl).replace(/[ \t]+\r?$/gm, '') + nl;
}

function convertLegacy(source) {
    const nl = newline(source);
    const text = String(source || '').replace(/^\uFEFF/, '');
    const parts = text.split(/^## /m);
    const versions = [];
    parts.slice(1).forEach(function (chunk) {
        const lines = chunk.replace(/\r\n/g, '\n').split('\n');
        const title = (lines.shift() || '').trim();
        const match = title.match(/^(\d+\.\d+\.\d+)\s+[—-]\s+(\d{4}-\d{2}-\d{2})/) ||
            title.match(/^\[(\d+\.\d+\.\d+)\]\s+[—-]\s+(\d{4}-\d{2}-\d{2})/);
        if (!match) return;
        const groups = emptyGroups();
        lines.forEach(function (line) {
            if (!/^\s*-\s+/.test(line)) return;
            String(line.replace(/^\s*-\s+/, '')).split(/\s*\|\s*/).forEach(function (part) {
                const classified = classifyNote(part);
                if (!classified) return;
                groups[classified.category].push(classified.text);
            });
        });
        versions.push({version: match[1], date: match[2], groups: groups});
    });
    const blocks = [HEADER.replace(/\n/g, nl), '## [Unreleased]'];
    versions.forEach(function (section) {
        blocks.push('', '## [' + section.version + '] - ' + section.date);
        const formatted = formatGroups(section.groups, nl);
        if (formatted) blocks.push('', formatted);
    });
    return blocks.join(nl) + nl;
}

function insertRelease(source, version, date, notes) {
    const nl = newline(source);
    const folded = foldUnreleased(source);
    const sections = parseSections(folded);
    const unreleased = sections.filter(function (section) { return section.kind === 'unreleased'; })[0] || {
        groups: emptyGroups()
    };
    const added = parseNotes(notes);
    CATEGORIES.forEach(function (name) {
        unreleased.groups[name] = (unreleased.groups[name] || []).concat(added[name] || []);
    });
    (added._extra || []).forEach(function (extra) {
        unreleased.groups._extra.push(extra);
    });
    const versions = sections.filter(function (section) { return section.kind !== 'unreleased'; });
    const releaseBody = formatGroups(unreleased.groups, nl);
    const parts = [HEADER.replace(/\n/g, nl), '## [Unreleased]', '', '## [' + version + '] - ' + date];
    if (releaseBody) parts.push('', releaseBody);
    versions.forEach(function (section) {
        if (section.version === version) return;
        parts.push('', '## [' + section.version + '] - ' + section.date);
        const formatted = formatGroups(section.groups, nl);
        if (formatted) parts.push('', formatted);
    });
    return parts.join(nl).replace(/[ \t]+\r?$/gm, '') + nl;
}

function changelogSection(source, version) {
    const target = String(version || '').replace(/^v/i, '').replace(/\./g, '\\.');
    const keep = String(source || '').match(new RegExp(
        '## \\[' + target + '\\] - [^\\r\\n]+\\r?\\n([\\s\\S]*?)(?=\\r?\\n## \\[|$)'
    ));
    if (keep) return (keep[0] || '').trim();
    const legacy = String(source || '').match(new RegExp(
        '## ' + target + ' [—-] [^\\r\\n]+\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |$)'
    ));
    if (legacy) return (legacy[0] || '').trim();
    return 'Release ' + String(version || '').replace(/^v/i, '');
}

function groupsHaveItems(groups) {
    if (!groups) return false;
    if (CATEGORIES.some(function (name) { return (groups[name] || []).length; })) return true;
    return (groups._extra || []).some(function (extra) {
        return extra.items && extra.items.length;
    });
}

function unreleasedHasItems(source) {
    const folded = /## \[Unreleased\]/i.test(source) ? foldUnreleased(source) : convertLegacy(source);
    const unreleased = parseSections(folded).filter(function (section) { return section.kind === 'unreleased'; })[0];
    return Boolean(unreleased && groupsHaveItems(unreleased.groups));
}

function foldFile(root) {
    const file = path.join(root || path.join(__dirname, '..'), 'CHANGELOG.md');
    const source = fs.readFileSync(file, 'utf8');
    const next = foldUnreleased(source);
    if (next !== source) fs.writeFileSync(file, next);
    return next !== source;
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const root = path.join(__dirname, '..');
    const file = path.join(root, 'CHANGELOG.md');
    if (args[0] === '--convert') {
        fs.writeFileSync(file, convertLegacy(fs.readFileSync(file, 'utf8')));
        console.log('Converted CHANGELOG.md to Keep a Changelog');
    } else if (args[0] === '--fold') {
        foldFile(root);
        console.log('Folded [Unreleased] sections');
    } else {
        console.log('Usage: node scripts/changelog.js --convert|--fold');
        process.exit(1);
    }
}

module.exports = {
    CATEGORIES: CATEGORIES,
    HEADER: HEADER,
    classifyNote: classifyNote,
    parseNotes: parseNotes,
    formatGroups: formatGroups,
    foldUnreleased: foldUnreleased,
    convertLegacy: convertLegacy,
    insertRelease: insertRelease,
    changelogSection: changelogSection,
    unreleasedHasItems: unreleasedHasItems,
    foldFile: foldFile
};
