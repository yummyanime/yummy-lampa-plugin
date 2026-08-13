const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const FILES = {
    config: 'src/config.js',
    readme: 'README.md',
    changelog: 'CHANGELOG.md',
    docsEn: 'docs/README.en.md'
};

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function today(date) {
    if (date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must be YYYY-MM-DD');
        return date;
    }
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return now.getFullYear() + '-' + month + '-' + day;
}

function parseVersion(value) {
    const match = String(value || '').trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) throw new Error('Invalid version: ' + value);
    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        text: match[1] + '.' + match[2] + '.' + match[3]
    };
}

function nextVersion(current, bump) {
    const parsed = parseVersion(current);
    if (!bump || bump === 'patch') return parsed.major + '.' + parsed.minor + '.' + (parsed.patch + 1);
    if (bump === 'minor') return parsed.major + '.' + (parsed.minor + 1) + '.0';
    if (bump === 'major') return (parsed.major + 1) + '.0.0';
    return parseVersion(bump).text;
}

function readConfigVersion(source) {
    const match = String(source || '').match(/version:\s*'(\d+\.\d+\.\d+)'/);
    if (!match) throw new Error('Could not find version in src/config.js');
    return match[1];
}

function replaceAll(source, pattern, replacement, label) {
    const next = source.replace(pattern, replacement);
    if (next === source) throw new Error('Failed to update ' + label);
    return next;
}

function updateConfig(source, version) {
    return replaceAll(source, /version:\s*'\d+\.\d+\.\d+'/, "version: '" + version + "'", FILES.config);
}

function updateReadme(source, from, to) {
    return replaceAll(
        source,
        new RegExp('Current version: `' + escapeRegExp(from) + '`'),
        'Current version: `' + to + '`',
        FILES.readme + ' current version'
    );
}

const NOTE_PREFIX = /^(Fix|Add|Remove|Refactor)\s+\S/;

function formatNotes(notes) {
    const items = (Array.isArray(notes) ? notes : [notes]).map(function (note) {
        return String(note || '').replace(/^\s*-\s*/, '').replace(/\.+\s*$/, '').trim();
    }).filter(Boolean);
    if (!items.length) throw new Error('Provide at least one changelog note');
    return items.map(function (note) {
        const parts = note.split(/\s*\|\s*/).filter(Boolean);
        if (!parts.length || parts.some(function (part) { return !NOTE_PREFIX.test(part); })) {
            throw new Error('Changelog notes must start with Fix / Add / Remove / Refactor, e.g. "Fix button styles | Remove unused styles"');
        }
        return '- ' + parts.join(' | ');
    }).join('\n');
}

function newline(source) {
    return source.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
}

function updateChangelog(source, version, date, notes) {
    const nl = newline(source);
    const bullets = formatNotes(notes);
    const heading = '## ' + version + ' — ' + date;
    const headingPattern = new RegExp('## ' + escapeRegExp(version) + ' — [^\\r\\n]+');
    let next;
    if (headingPattern.test(source)) {
        next = source.replace(headingPattern, heading);
        if (next.indexOf(heading + nl + nl + bullets.split('\n').join(nl)) < 0) {
            next = next.replace(heading + nl, heading + nl + nl + bullets.split('\n').join(nl) + nl);
        }
    } else if (/^# Changelog\r?\n/.test(source)) {
        next = source.replace(/^# Changelog\r?\n/, '# Changelog' + nl + nl + heading + nl + nl + bullets.split('\n').join(nl) + nl);
    } else {
        throw new Error('Unexpected CHANGELOG.md format');
    }
    if (next.indexOf(heading) < 0) throw new Error('Failed to update CHANGELOG.md');
    return next;
}

function applyVersion(options) {
    options = options || {};
    const root = options.root || path.join(__dirname, '..');
    const read = options.read || function (file) {
        return fs.readFileSync(path.join(root, file), 'utf8');
    };
    const write = options.write || function (file, contents) {
        fs.writeFileSync(path.join(root, file), contents);
    };
    const current = readConfigVersion(read(FILES.config));
    const version = parseVersion(options.version || nextVersion(current, options.bump || 'patch')).text;
    const date = today(options.date);
    const files = {};
    files[FILES.config] = updateConfig(read(FILES.config), version);
    files[FILES.readme] = updateReadme(read(FILES.readme), current, version);
    files[FILES.changelog] = updateChangelog(read(FILES.changelog), version, date, options.notes);
    if (!options.dryRun) {
        Object.keys(files).forEach(function (file) { write(file, files[file]); });
        if (options.build !== false) {
            const build = options.build || function () {
                execFileSync(process.execPath, [path.join(root, 'build.js')], {stdio: 'inherit', cwd: root});
            };
            build();
        }
    }
    return {from: current, version: version, date: date, files: files};
}

function parseArgs(argv) {
    const args = argv.slice(2);
    const notes = [];
    const leftover = [];
    let bump = 'patch';
    let date = '';
    let dryRun = false;
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === '--dry-run') dryRun = true;
        else if (arg === '--date') date = args[++index];
        else if (arg === '--note' || arg === '-m' || arg === '--message') notes.push(args[++index]);
        else if (arg === 'patch' || arg === 'minor' || arg === 'major' || /^\d+\.\d+\.\d+$/.test(arg)) bump = arg;
        else leftover.push(arg);
    }
    if (leftover.length) notes.push(leftover.join(' '));
    return {bump: bump, date: date, dryRun: dryRun, notes: notes};
}

function usage() {
    return [
        'Usage: node scripts/bump-version.js [patch|minor|major|<version>] [--date YYYY-MM-DD] [--dry-run] [-m note] [note...]',
        '',
        'Notes must start with Fix, Add, Remove, or Refactor. Use | for related changes.',
        'Updates src/config.js, README version, CHANGELOG, and dist/index.js together.'
    ].join('\n');
}

if (require.main === module) {
    try {
        const args = parseArgs(process.argv);
        const result = applyVersion(args);
        console.log('Version ' + result.from + ' → ' + result.version);
        Object.keys(result.files).forEach(function (file) { console.log('Updated ' + file); });
        if (args.dryRun) console.log('Dry run: dist/index.js was not rebuilt');
    } catch (error) {
        console.error(error.message || error);
        console.error(usage());
        process.exit(1);
    }
}

module.exports = {
    FILES: FILES,
    parseVersion: parseVersion,
    nextVersion: nextVersion,
    readConfigVersion: readConfigVersion,
    updateConfig: updateConfig,
    updateReadme: updateReadme,
    updateChangelog: updateChangelog,
    applyVersion: applyVersion,
    parseArgs: parseArgs,
    formatNotes: formatNotes,
    today: today
};
