const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('src/ui.js', 'utf8');
const menu = fs.readFileSync('src/ui-playback-menu.js', 'utf8');
const embeddedPlayer = fs.readFileSync('src/ui-player.js', 'utf8');
const launchStart = source.indexOf('function launchVideo');
const launchEnd = source.indexOf('function launchResolvedVideo', launchStart);
const launchPolicy = source.slice(launchStart, launchEnd);
const allohaStart = source.indexOf('function allohaResolvers');
const allohaEnd = source.indexOf('function setLoading', allohaStart);
const allohaPolicy = source.slice(allohaStart, allohaEnd);

assert.ok(launchStart >= 0 && launchEnd > launchStart, 'video launch policy must exist');
assert.ok(launchPolicy.includes("selected.yani_stream_source || ''"), 'Alloha must identify a resolved Lampac stream');
assert.ok(launchPolicy.includes('selected.yani_alloha_iframe_url'), 'the original Alloha page must survive a temporary resolved stream');
assert.ok(launchPolicy.includes('allohaSource && (!resolvedAlloha || !options.autoAdvance)'), 'manual Alloha launches must keep the mode choice while prefetched auto-next stays direct');
assert.ok(allohaStart >= 0 && allohaEnd > allohaStart, 'Alloha resolver policy must exist');
assert.ok(allohaPolicy.includes('LampaYaniResolver.enabled()'), 'the self-hosted resolver must be opt-in');
assert.ok(allohaPolicy.includes('LampaYaniLampacResolver.enabled()'), 'Alloha direct playback must require a configured service');
assert.ok(allohaPolicy.includes('if (!chain.length) return blockAllohaPlayback'), 'Alloha without any configured resolver must hit the strict policy');
assert.ok(allohaPolicy.includes("t('alloha_direct_required')"), 'blocked Alloha must display a warning');
assert.ok(allohaPolicy.includes("t('alloha_playback_title')"), 'configured direct and web modes must have an explicit TV-friendly choice');
assert.ok(allohaPolicy.includes("action: 'direct'") && allohaPolicy.includes("action: 'web'"), 'Alloha mode choice must distinguish Lampa playback from the source web player');
assert.ok(allohaPolicy.includes('options.autoAdvance || !webAvailable'), 'auto-next must use direct playback without interrupting the viewer with a mode dialog');
assert.ok(allohaPolicy.includes('openAllohaWebPlayer'), 'the web fallback must go through the explained Alloha web-player path');

// The embedded Alloha page is the only playback path left when no direct
// stream can be resolved, but it must never be reachable by default: it has no
// Lampa timeline and cannot be handed to a media player.
assert.ok(allohaPolicy.includes('allohaIframeEnabled() && openAllohaWebPlayer'), 'the Alloha web player must stay behind the opt-in setting and explanation path');
assert.ok(
    source.includes("Lampa.Storage.get('yani_alloha_iframe', false)"),
    'the Alloha embed setting must default to disabled'
);
assert.ok(
    source.includes("param: {name: 'yani_alloha_iframe', type: 'trigger', default: false}"),
    'the Alloha embed setting must be exposed as a disabled-by-default trigger'
);
assert.ok(!source.includes('function showYummyIframe'), 'generic iframe playback must stay disabled');
assert.ok(source.includes('return_snapshot: playbackReturnSnapshot()'), 'embedded Alloha playback must retain the title-page focus snapshot');
assert.ok(source.includes('restorePlaybackInteraction(object && object.return_snapshot'), 'closing the embedded player must restore the saved title-page focus');
assert.ok(embeddedPlayer.includes("iframe.attr('src', 'about:blank')"), 'the remote player page must stop before Lampa regains focus');
assert.ok(embeddedPlayer.includes('if (closing) return'), 'duplicate Back and click events must not close the activity twice');

const voiceStart = source.indexOf('function allohaDirectResolverEnabled');
const voiceEnd = source.indexOf('function voiceOptionSubtitle', voiceStart);
const voicePolicy = source.slice(voiceStart, voiceEnd);
assert.ok(voicePolicy.includes('function videoPlaybackPriority'), 'playback choices must have a capability priority');
assert.ok(voicePolicy.includes('LampaYaniStreamResolver.canResolve(url)'), 'Kodik and other resolvable sources must receive playable priority');
assert.ok(voicePolicy.includes('allohaDirectResolverEnabled() ? 3 : 0'), 'unresolved Alloha must sort below playable sources');
assert.ok(menu.includes('if (!allohaIframeEnabled())'), 'capability-first sorting must apply when the Alloha embed is disabled');
assert.ok(menu.includes('groupPlaybackPriority(a.group)'), 'voice choices must be sorted by playable source capability');

const episodeStart = menu.indexOf('function chooseEpisode');
const episodeEnd = menu.indexOf('function showDirectPlaybackOptions', episodeStart);
const episodePolicy = menu.slice(episodeStart, episodeEnd);
assert.ok(episodePolicy.includes('videoPlaybackPriority(a, group)'), 'episode choices must prioritize playable sources');
assert.ok(episodePolicy.indexOf('playableB - playableA') < episodePolicy.indexOf('numberA - numberB'), 'episode capability must sort before episode number');

console.log('Alloha playback policy tests passed');
