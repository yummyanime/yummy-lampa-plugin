const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const bump = require('./bump-version');
const changelog = require('./changelog');

const PAGES_BASE = 'https://yummyanime.github.io/yummy-lampa-plugin';
const STABLE_PATH = 'stable/index.js';
const STABLE_META = 'stable.json';
const TEST_PATH = 'dist/index.js';
const STABLE_URL = PAGES_BASE + '/' + STABLE_PATH;
const TEST_URL = PAGES_BASE + '/' + TEST_PATH;

function normalizeVersion(value) {
    return bump.parseVersion(String(value || '').replace(/^v/i, '')).text;
}

function tagName(version) {
    return 'v' + normalizeVersion(version);
}

function changelogSection(source, version) {
    return changelog.changelogSection(source, version);
}

function bundleVersion(source) {
    return bump.readConfigVersion(source);
}

function stableManifest(version, options) {
    options = options || {};
    return {
        channel: 'production',
        version: normalizeVersion(version),
        tag: tagName(version),
        url: STABLE_URL,
        testUrl: TEST_URL,
        releasedAt: options.releasedAt || new Date().toISOString()
    };
}

function defaultGit(root) {
    function git(args, extra) {
        extra = extra || {};
        return execFileSync('git', args, Object.assign({
            cwd: root,
            encoding: extra.encoding || 'utf8',
            stdio: extra.stdio || ['ignore', 'pipe', 'pipe']
        }, extra.stdio ? {stdio: extra.stdio} : {}));
    }
    return {
        tagExists: function (tag) {
            try {
                git(['rev-parse', '-q', '--verify', 'refs/tags/' + tag]);
                return true;
            } catch (error) {
                return false;
            }
        },
        createTag: function (tag, message) {
            git(['tag', '-a', tag, '-m', message], {stdio: 'inherit', encoding: 'buffer'});
        },
        isClean: function () {
            return git(['status', '--porcelain'], {encoding: 'utf8'}).trim() === '';
        },
        head: function () {
            return git(['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
        },
        tagTarget: function (tag) {
            return git(['rev-list', '-n', '1', tag], {encoding: 'utf8'}).trim();
        },
        show: function (spec) {
            return git(['show', spec], {encoding: 'utf8'});
        },
        pushTag: function (tag) {
            git(['push', 'origin', tag], {stdio: 'inherit', encoding: 'buffer'});
        }
    };
}

function writeStable(options) {
    options = options || {};
    const root = options.root || path.join(__dirname, '..');
    const version = normalizeVersion(options.version);
    const bundle = options.bundle;
    if (!bundle || bundleVersion(bundle) !== version) {
        throw new Error('Stable bundle version must be ' + version);
    }
    const manifest = stableManifest(version, {releasedAt: options.releasedAt});
    const stableDir = path.join(root, 'stable');
    fs.mkdirSync(stableDir, {recursive: true});
    const productionBundle = bundle.replace(
        /(build:\s*\{hash:\s*'[^']+',\s*date:\s*'[^']+',\s*type:\s*)'test'/,
        "$1'production'"
    );
    fs.writeFileSync(path.join(root, STABLE_PATH), productionBundle);
    fs.writeFileSync(path.join(root, STABLE_META), JSON.stringify(manifest, null, 4) + '\n');
    return manifest;
}

function readCurrentBundle(root) {
    const bundle = fs.readFileSync(path.join(root, TEST_PATH), 'utf8');
    const version = bundleVersion(bundle);
    const configVersion = bump.readConfigVersion(fs.readFileSync(path.join(root, 'src/core/config.js'), 'utf8'));
    if (version !== configVersion) {
        throw new Error('dist/index.js version ' + version + ' does not match src/core/config.js ' + configVersion + '. Run node build.js');
    }
    return {bundle: bundle, version: version};
}

function readTaggedBundle(version, git) {
    const tag = tagName(version);
    try {
        return git.show(tag + ':' + TEST_PATH);
    } catch (error) {
        throw new Error('Cannot read ' + TEST_PATH + ' from git tag ' + tag + '. Create the tag with node scripts/release.js --tag first.');
    }
}

function verifyPreparedRelease(options) {
    options = options || {};
    const root = options.root || path.join(__dirname, '..');
    const current = readCurrentBundle(root);
    const stableBundle = fs.readFileSync(path.join(root, STABLE_PATH), 'utf8');
    const stableVersion = bundleVersion(stableBundle);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, STABLE_META), 'utf8'));
    const expectedTag = tagName(current.version);
    if (stableVersion !== current.version) {
        throw new Error('stable/index.js version ' + stableVersion + ' does not match dist/index.js ' + current.version);
    }
    if (normalizeVersion(manifest.version) !== current.version) {
        throw new Error('stable.json version ' + manifest.version + ' does not match dist/index.js ' + current.version);
    }
    if (manifest.tag !== expectedTag) {
        throw new Error('stable.json tag ' + manifest.tag + ' does not match expected tag ' + expectedTag);
    }
    return {version: current.version, tag: expectedTag, manifest: manifest};
}

function finalizeTag(options) {
    options = options || {};
    const root = options.root || path.join(__dirname, '..');
    const git = options.git || defaultGit(root);
    if (!git.isClean || !git.isClean()) {
        throw new Error('Commit the prepared release files before creating its tag');
    }
    const prepared = verifyPreparedRelease({root: root});
    const head = git.head();
    let tagged = false;
    if (git.tagExists(prepared.tag)) {
        const target = git.tagTarget(prepared.tag);
        if (target !== head) {
            throw new Error('Git tag ' + prepared.tag + ' already points to another commit');
        }
    } else {
        const notes = changelogSection(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8'), prepared.version);
        git.createTag(prepared.tag, notes);
        tagged = true;
    }
    if (options.push && git.pushTag) git.pushTag(prepared.tag);
    return {version: prepared.version, tag: prepared.tag, tagged: tagged, pushed: Boolean(options.push)};
}

function cutUnreleased(options) {
    options = options || {};
    const root = options.root || path.join(__dirname, '..');
    const source = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    if (!changelog.unreleasedHasItems(source)) return null;
    return bump.applyVersion({
        root: root,
        bump: options.bump || 'patch',
        build: options.build
    });
}

function promote(options) {
    options = options || {};
    const root = options.root || path.join(__dirname, '..');
    const git = options.git || defaultGit(root);
    const rollback = Boolean(options.promote);
    let bumped = null;
    if (!rollback && options.bumpUnreleased !== false) {
        bumped = cutUnreleased({root: root, bump: options.bump, build: options.build});
    }
    const version = normalizeVersion(options.promote || options.version || readCurrentBundle(root).version);
    const bundle = rollback ? readTaggedBundle(version, git) : readCurrentBundle(root).bundle;
    const manifest = writeStable({
        root: root,
        version: version,
        bundle: bundle,
        releasedAt: options.releasedAt
    });
    return {
        version: version,
        tag: manifest.tag,
        tagged: false,
        rollback: rollback,
        bumped: bumped,
        from: bumped ? bumped.from : version,
        manifest: manifest,
        stableUrl: STABLE_URL,
        testUrl: TEST_URL
    };
}

function parseArgs(argv) {
    const args = argv.slice(2);
    const result = {promote: '', tag: false, push: false};
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === '--tag') result.tag = true;
        else if (arg === '--no-tag') result.tag = false;
        else if (arg === '--push') result.push = true;
        else if (arg === '--promote') result.promote = args[++index];
        else if (arg === '--help' || arg === '-h') result.help = true;
        else throw new Error('Unknown argument: ' + arg);
    }
    if (result.push && !result.tag) throw new Error('--push requires --tag');
    if (result.promote && result.tag) throw new Error('--promote and --tag are separate operations');
    return result;
}

function usage() {
    return [
        'Usage:',
        '  node scripts/release.js',
        '  node scripts/release.js --tag [--push]',
        '  node scripts/release.js --promote <version>',
        '',
        'Production URL:  ' + STABLE_URL,
        'Test URL:        ' + TEST_URL,
        '',
        'The first command prepares and builds a release. Commit those files, then',
        '--tag verifies the committed release and creates its tag. --promote rolls',
        'production back without bumping.'
    ].join('\n');
}

if (require.main === module) {
    try {
        const args = parseArgs(process.argv);
        if (args.help) {
            console.log(usage());
            process.exit(0);
        }
        if (args.tag) {
            const tagged = finalizeTag(args);
            console.log((tagged.tagged ? 'Created ' : 'Verified ') + 'git tag ' + tagged.tag);
            if (tagged.pushed) console.log('Pushed git tag ' + tagged.tag);
            process.exit(0);
        }
        const result = promote(args);
        if (result.bumped) console.log('Version ' + result.bumped.from + ' → ' + result.bumped.version);
        console.log((result.rollback ? 'Rolled production back to ' : 'Promoted production to ') + result.version);
        console.log('Production: ' + result.stableUrl);
        console.log('Test:       ' + result.testUrl);
        if (!result.rollback) {
            console.log('Next:');
            console.log('  git add CHANGELOG.md README.md docs/README.en.md src/core/config.js dist/index.js stable/index.js stable.json');
            console.log('  git commit -m "Release ' + result.tag + '"');
            console.log('  node scripts/release.js --tag');
            console.log('  git push origin main --follow-tags');
        }
    } catch (error) {
        console.error(error.message || error);
        console.error(usage());
        process.exit(1);
    }
}

module.exports = {
    PAGES_BASE: PAGES_BASE,
    STABLE_PATH: STABLE_PATH,
    STABLE_META: STABLE_META,
    TEST_PATH: TEST_PATH,
    STABLE_URL: STABLE_URL,
    TEST_URL: TEST_URL,
    normalizeVersion: normalizeVersion,
    tagName: tagName,
    changelogSection: changelogSection,
    stableManifest: stableManifest,
    writeStable: writeStable,
    verifyPreparedRelease: verifyPreparedRelease,
    finalizeTag: finalizeTag,
    promote: promote,
    cutUnreleased: cutUnreleased,
    parseArgs: parseArgs
};
