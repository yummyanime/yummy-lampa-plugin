(function (window) {
    'use strict';

    // Watches the internal Lampa player while an episode plays: progress
    // recording, intro/outro skipping, stream recovery, prefetching and
    // automatic advance to the next episode.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var playbackReturnState = deps.playbackReturnState || {};
        var videoSourceUrl = deps.videoSourceUrl;
        var beginPlaybackNavigation = deps.beginPlaybackNavigation;
        var restorePlaybackInteraction = deps.restorePlaybackInteraction;
        var autoProgressSyncEnabled = deps.autoProgressSyncEnabled;
        var updatePlaybackProgress = deps.updatePlaybackProgress;
        var launchVideo = deps.launchVideo;
        var launchResolvedVideo = deps.launchResolvedVideo;
        var videoResolverUrl = deps.videoResolverUrl;
        var isDirectVideoUrl = deps.isDirectVideoUrl;
        var isExternalPlayableUrl = deps.isExternalPlayableUrl;
        var isCvhPlaybackSource = deps.isCvhPlaybackSource;

        // Set right before playback is dispatched so the watcher knows which title
        // and episode started, whichever of the three entry points ran.
        var playbackContext = null;
        var playbackWatcher = null;
        var playbackWatcherGeneration = 0;
        var PLAYER_STARTUP_GRACE_MS = 120000;
        var INTERNAL_PLAYBACK_RECOVERY_LIMIT = 3;
        var INTERNAL_PLAYBACK_RECOVERY_READY_SECONDS = 3;
        // The per-outage budget above is refilled after healthy playback, so a
        // stream that keeps dying would otherwise be refreshed forever. This caps
        // the refreshes for one launched episode.
        var INTERNAL_PLAYBACK_RECOVERY_TOTAL_LIMIT = 8;
        var CVH_STARTUP_STALL_MS = 18000;
        var CVH_PLAYBACK_STALL_MS = 15000;
        var NEXT_PREFETCH_LEAD = 90;
        var PLAYER_CLOSE_POLL_MS = 80;
        var PLAYER_CLOSE_SETTLE_MS = 120;
        var PLAYER_CLOSE_TIMEOUT_MS = 3500;

        function skipPreference() {
            var value = Lampa.Storage && Lampa.Storage.get ? Lampa.Storage.get('yani_aniskip', 'off') : 'off';
            return value === 'op' || value === 'ed' || value === 'op_ed' || value === 'suggest' ? value : 'off';
        }

        function skipTypesForMode(mode) {
            return {
                op: mode === 'op' || mode === 'op_ed' || mode === 'suggest',
                ed: mode === 'ed' || mode === 'op_ed' || mode === 'suggest'
            };
        }

        function autoNextEnabled() {
            if (!Lampa.Storage || !Lampa.Storage.get) return false;
            var value = Lampa.Storage.get('yani_auto_next', false);
            return value === true || value === 'true';
        }

        // Current Lampa builds may wrap the media element (native TV engines do not
        // necessarily leave a usable <video> in the DOM). Prefer the public player
        // accessor and keep the DOM lookup only for older builds.
        function playerVideoElement(preferred) {
            if (window.Lampa && Lampa.PlayerVideo && typeof Lampa.PlayerVideo.video === 'function') {
                try {
                    var active = Lampa.PlayerVideo.video();
                    if (active && isFinite(active.duration) && active.duration > 0 && !active.ended) return active;
                } catch (ignorePlayerVideo) {}
            }
            if (preferred && isFinite(preferred.duration) && preferred.duration > 0 && !preferred.ended) return preferred;
            var selectors = ['.player-video video', '.player video', 'video'];
            for (var i = 0; i < selectors.length; i++) {
                var elements = document.querySelectorAll(selectors[i]);
                for (var j = elements.length - 1; j >= 0; j--) {
                    var element = elements[j];
                    // A finished video from the previous player may remain in the
                    // DOM briefly. Never attach a new episode watcher to it.
                    if (!element.ended && isFinite(element.duration) && element.duration > 0) return element;
                }
            }
            return null;
        }

        function stopPlaybackWatcher() {
            if (!playbackWatcher) return;
            var state = playbackWatcher;
            clearInterval(state.timer);
            var listener = window.Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener;
            if (listener && typeof listener.remove === 'function') {
                if (state.playerTimeHandler) listener.remove('timeupdate', state.playerTimeHandler);
                if (state.playerPauseHandler) listener.remove('pause', state.playerPauseHandler);
                if (state.playerEndedHandler) listener.remove('ended', state.playerEndedHandler);
                if (state.playerDestroyHandler) listener.remove('destroy', state.playerDestroyHandler);
                if (state.playerErrorHandler) listener.remove('error', state.playerErrorHandler);
            }
            if (state.video && state.endedHandler && state.video.removeEventListener) {
                state.video.removeEventListener('ended', state.endedHandler);
            }
            playbackWatcher = null;
            destroySkipPrompt();
        }

        function startPlaybackWatcher(context) {
            stopPlaybackWatcher();
            var generation = ++playbackWatcherGeneration;
            if (!context) return;
            var skipMode = skipPreference();
            var autoNext = autoNextEnabled();
            var progressSync = autoProgressSyncEnabled();

            var state = {
                context: context,
                timer: 0,
                segments: [],
                skipped: {},
                skipMode: skipMode,
                skipPrompt: skipMode === 'suggest',
                skipReady: false,
                skipLoading: false,
                skipLength: 0,
                autoNext: autoNext,
                progressSync: progressSync,
                lastLocalSync: 0,
                lastLocalPosition: Number(context.selected && context.selected.watched && context.selected.watched.end_time || 0),
                lastObservedPosition: Number(context.selected && context.selected.watched && context.selected.watched.end_time || 0),
                lastObservedDuration: Number(context.selected && context.selected.duration || 0),
                lastServerSync: Date.now(),
                lastServerPosition: Number(context.selected && context.selected.watched && context.selected.watched.end_time || 0),
                prefetched: false,
                advanced: false,
                video: null,
                endedHandler: null,
                playerTimeHandler: null,
                playerPauseHandler: null,
                playerEndedHandler: null,
                playerDestroyHandler: null,
                playerErrorHandler: null,
                returnRestoreScheduled: false,
                recoveryAttempts: Number(context.selected && context.selected.yani_internal_recovery || 0),
                recoveryBaselinePosition: Number(context.selected && context.selected.watched && context.selected.watched.end_time || 0),
                resumeSeek: Number(context.selected && context.selected.yani_resume_seek || 0),
                resumeKind: String(context.selected && context.selected.yani_resume_kind || ''),
                recovering: false,
                startedAt: Date.now(),
                lastProgressAt: Date.now(),
                lastSeenAt: Date.now()
            };
            playbackWatcher = state;
            bindPlayerProgressEvents(generation, context, state);
            state.timer = setInterval(function () { watchPlayback(generation, context, state); }, 1000);
            var initialLength = Number(context.selected && context.selected.duration || 0);
            if (skipMode !== 'off' && initialLength >= 60) loadSkipSegments(generation, context, state, skipMode, initialLength);
        }

        function flushPlaybackProgress(remote, expectedContext) {
            var state = playbackWatcher;
            // Replacing a finished video can invoke its old Lampa callback after
            // the next episode has already created a watcher. That stale callback
            // must not flush or stop the new episode.
            if (expectedContext &&
                expectedContext !== playbackContext &&
                (!state || state.context !== expectedContext)) {
                return;
            }
            var context = expectedContext || state && state.context || playbackContext;
            if (!context || !context.selected) {
                stopPlaybackWatcher();
                return;
            }
            var element = playerVideoElement(state && state.context === context ? state.video : null);
            var position = element ? Number(element.currentTime || 0) : Number(state && state.lastObservedPosition || context.selected.watched && context.selected.watched.end_time || 0);
            var duration = element ? Number(element.duration || 0) : Number(state && state.lastObservedDuration || context.selected.duration || 0);
            if (position > 0) updatePlaybackProgress(context, position, duration, Boolean(remote));
            stopPlaybackWatcher();
        }

        function loadSkipSegments(generation, context, state, mode, episodeLength) {
            if (!window.LampaYaniAniSkip) return;
            var ids = (context.card && context.card.yani_remote_ids) || {};
            var malId = Number(ids.myanimelist_id || ids.mal_id || 0);
            var selected = context.selected || {};
            var episode = Number(selected.number || selected.index || 0);
            if (!malId || !episode) return;
            var length = Math.max(0, Math.round(Number(episodeLength) || 0));
            state.skipLoading = true;
            state.skipReady = false;
            state.skipLength = length;
            state.skipRequest = (state.skipRequest || 0) + 1;
            var request = state.skipRequest;
            LampaYaniAniSkip.times(malId, episode, length).then(function (intervals) {
                if (generation !== playbackWatcherGeneration || request !== state.skipRequest) return;
                var types = skipTypesForMode(mode);
                var segments = [];
                if (types.op && intervals.op) segments.push({type: 'op', interval: intervals.op, label: t('aniskip_opening_skipped')});
                if (types.ed && intervals.ed) segments.push({type: 'ed', interval: intervals.ed, label: t('aniskip_ending_skipped')});
                state.segments = segments;
                state.skipLoading = false;
                state.skipReady = true;
            });
        }

        var skipPromptState = {root: null, panel: null, segment: null, video: null, focused: false};

        function skipPromptLabel(segment) {
            if (segment && segment.type === 'ed') return t('aniskip_skip_ending');
            if (segment && segment.type === 'op') return t('aniskip_skip_opening');
            return t('aniskip_skip');
        }

        function skipPromptHost() {
            return document.querySelector('.player') || document.querySelector('.player-video') || document.body;
        }

        function skipPromptIsActive() {
            return Boolean(skipPromptState.root &&
                skipPromptState.segment &&
                skipPromptState.root.classList.contains('yani-skip-prompt--visible'));
        }

        function returnSkipFocusToPlayer() {
            skipPromptState.focused = false;
            if (skipPromptState.root) $(skipPromptState.root).removeClass('focus');
            if (Lampa.Controller && Lampa.Controller.enabled && Lampa.Controller.enabled().name === 'yani_player_skip') {
                Lampa.Controller.toggle('player');
            }
            setTimeout(ensurePlayerSkipUpHook, 0);
        }

        function ensurePlayerSkipUpHook() {
            if (!Lampa.Controller || !Lampa.Controller.enabled) return;
            var enabled = Lampa.Controller.enabled();
            if (!enabled || enabled.name !== 'player' || !enabled.controller || enabled.controller._yani_skip_up) return;
            var originalUp = enabled.controller.up;
            enabled.controller._yani_skip_up = true;
            enabled.controller.up = function () {
                if (skipPromptIsActive()) {
                    focusSkipPrompt();
                    return;
                }
                if (originalUp) return originalUp.apply(this, arguments);
            };
        }

        function focusSkipPrompt() {
            if (!skipPromptIsActive() || !Lampa.Controller || !Lampa.Controller.add) return;
            var button = skipPromptState.root;
            Lampa.Controller.add('yani_player_skip', {
                toggle: function () {
                    if (!skipPromptIsActive()) return;
                    var host = $(button);
                    if (Lampa.Controller.collectionSet) Lampa.Controller.collectionSet(host);
                    if (window.Navigator && Navigator.add) Navigator.add(button);
                    if (Lampa.Controller.collectionFocus) Lampa.Controller.collectionFocus(button, host);
                    $(button).addClass('focus');
                    skipPromptState.focused = true;
                },
                up: returnSkipFocusToPlayer,
                down: returnSkipFocusToPlayer,
                left: returnSkipFocusToPlayer,
                right: returnSkipFocusToPlayer,
                gone: function () {
                    skipPromptState.focused = false;
                    if (skipPromptState.root) $(skipPromptState.root).removeClass('focus');
                },
                back: function () {
                    if (Lampa.Player && Lampa.Player.close) Lampa.Player.close();
                    else returnSkipFocusToPlayer();
                }
            });
            var enabled = Lampa.Controller.enabled ? Lampa.Controller.enabled() : null;
            var name = enabled && enabled.name;
            if (name === 'player' || name === 'yani_player_skip' || name === 'player_skip') {
                Lampa.Controller.toggle('yani_player_skip');
            }
        }

        function bindSkipAction(element) {
            if (!element || element._yani_skip_bound) return element;
            element._yani_skip_bound = true;
            element.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                confirmSkipPrompt();
            });
            if (window.$) $(element).on('hover:enter', function () { confirmSkipPrompt(); });
            return element;
        }

        function ensureSkipPrompt() {
            if (skipPromptState.root && document.body.contains(skipPromptState.root)) return skipPromptState.root;
            var button = document.createElement('div');
            button.className = 'yani-skip-prompt selector';
            button.setAttribute('role', 'button');
            skipPromptState.root = bindSkipAction(button);
            return skipPromptState.root;
        }

        function syncSkipPanelButton(segment) {
            var right = document.querySelector('.player-panel__right') ||
                document.querySelector('.player-panel .player-panel__buttons') ||
                document.querySelector('.player-panel');
            if (!right) return;
            var button = skipPromptState.panel;
            if (!button || !document.body.contains(button)) {
                button = document.createElement('div');
                button.className = 'player-panel__button selector yani-skip-panel';
                button.setAttribute('role', 'button');
                skipPromptState.panel = bindSkipAction(button);
            }
            if (skipPromptState.panel.parentNode !== right) right.appendChild(skipPromptState.panel);
            skipPromptState.panel.textContent = skipPromptLabel(segment);
            skipPromptState.panel.style.display = '';
            var enabled = Lampa.Controller && Lampa.Controller.enabled ? Lampa.Controller.enabled() : null;
            if (enabled && enabled.name === 'player_panel' && Lampa.Controller.collectionAppend) {
                Lampa.Controller.collectionAppend(skipPromptState.panel);
            }
        }

        function hideSkipPanelButton() {
            if (skipPromptState.panel) skipPromptState.panel.style.display = 'none';
        }

        function showSkipPrompt(segment, video) {
            var button = ensureSkipPrompt();
            var host = skipPromptHost();
            if (button.parentNode !== host) host.appendChild(button);
            button.textContent = skipPromptLabel(segment);
            button.classList.add('yani-skip-prompt--visible');
            skipPromptState.segment = segment;
            skipPromptState.video = video;
            syncSkipPanelButton(segment);
            ensurePlayerSkipUpHook();
            // Match Lampa's native player-skip: take remote focus while the
            // prompt is active so Enter can confirm without a mouse.
            if (!skipPromptState.focused) focusSkipPrompt();
        }

        function hideSkipPrompt() {
            if (skipPromptState.root) skipPromptState.root.classList.remove('yani-skip-prompt--visible');
            skipPromptState.segment = null;
            skipPromptState.video = null;
            hideSkipPanelButton();
            if (skipPromptState.focused) returnSkipFocusToPlayer();
        }

        function destroySkipPrompt() {
            hideSkipPrompt();
            if (skipPromptState.root && skipPromptState.root.parentNode) skipPromptState.root.parentNode.removeChild(skipPromptState.root);
            skipPromptState.root = null;
            if (skipPromptState.panel && skipPromptState.panel.parentNode) skipPromptState.panel.parentNode.removeChild(skipPromptState.panel);
            skipPromptState.panel = null;
            skipPromptState.focused = false;
        }

        function applySkip(video, segment, state) {
            if (!video || !segment || !state || state.skipped[segment.type]) return;
            state.skipped[segment.type] = true;
            try {
                video.currentTime = segment.interval.end;
            } catch (error) {
                console.warn('[YummyAnime] Could not skip a segment', error);
                state.skipped[segment.type] = false;
                return;
            }
            Lampa.Noty.show(segment.label);
            hideSkipPrompt();
        }

        function confirmSkipPrompt() {
            var state = playbackWatcher;
            var segment = skipPromptState.segment;
            var video = skipPromptState.video || playerVideoElement(state && state.video);
            if (!state || !segment || !video) return;
            applySkip(video, segment, state);
        }

        // Every episode of the dubbing is in Lampa's playlist, so when its own
        // "Next episode" setting is on Lampa opens the next one as a video
        // ends. The plugin must not open it a second time.
        function lampaAdvancesItself() {
            try {
                return Boolean(Lampa.Storage && Lampa.Storage.field && Lampa.Storage.field('playlist_next') &&
                    Lampa.PlayerPlaylist && typeof Lampa.PlayerPlaylist.canNext === 'function' && Lampa.PlayerPlaylist.canNext());
            } catch (error) {
                return false;
            }
        }

        // Lampa is about to replace the playing episode with another one from
        // its playlist. Closing this one must keep the player on screen.
        function beginEpisodeSwitch() {
            if (playbackWatcher) playbackWatcher.switching = true;
        }

        function advancePlaybackWatcher(generation, context, state) {
            if (generation !== playbackWatcherGeneration || playbackWatcher !== state || !state.autoNext || state.advanced) return;
            if (lampaAdvancesItself()) return;
            var closingVideo = state.video;
            state.advanced = true;
            stopPlaybackWatcher();
            advanceToNextEpisode(context, closingVideo);
        }

        function bindPlaybackVideo(generation, context, state, video) {
            if (state.video === video) return;
            if (state.video && state.endedHandler && state.video.removeEventListener) {
                state.video.removeEventListener('ended', state.endedHandler);
            }
            state.video = video;
            state.endedHandler = function () {
                advancePlaybackWatcher(generation, context, state);
            };
            if (video && video.addEventListener) video.addEventListener('ended', state.endedHandler);
        }

        function storeObservedPlayback(generation, context, state, event, finalState) {
            if (generation !== playbackWatcherGeneration || playbackWatcher !== state) return;
            event = event || {};
            var video = playerVideoElement(state.video);
            var eventPosition = Number(event.current);
            var eventDuration = Number(event.duration);
            var position = isFinite(eventPosition) && eventPosition >= 0
                ? eventPosition
                : Number(video && video.currentTime || state.lastObservedPosition || 0);
            var duration = isFinite(eventDuration) && eventDuration > 0
                ? eventDuration
                : Number(video && video.duration || state.lastObservedDuration || context.selected && context.selected.duration || 0);
            if (video) bindPlaybackVideo(generation, context, state, video);
            if (!(position >= 0)) position = 0;
            if (!(duration >= 0)) duration = 0;
            state.lastSeenAt = Date.now();
            if (Math.abs(position - Number(state.lastObservedPosition || 0)) > 0.25) {
                state.lastProgressAt = state.lastSeenAt;
            }
            state.lastObservedPosition = position;
            state.lastObservedDuration = duration;
            if (!(position > 0)) return;

            var now = Date.now();
            if (now - state.lastLocalSync >= 10000 || finalState && Math.abs(position - state.lastLocalPosition) >= 1) {
                state.lastLocalSync = now;
                state.lastLocalPosition = position;
                updatePlaybackProgress(context, position, duration, false);
            }
            if (state.progressSync && (now - state.lastServerSync >= 60000 || finalState && Math.abs(position - state.lastServerPosition) >= 1)) {
                state.lastServerSync = now;
                state.lastServerPosition = position;
                updatePlaybackProgress(context, position, duration, true);
            }
        }

        function bindPlayerProgressEvents(generation, context, state) {
            var listener = window.Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener;
            if (!listener || typeof listener.follow !== 'function') return;
            state.playerTimeHandler = function (event) {
                storeObservedPlayback(generation, context, state, event, false);
            };
            state.playerPauseHandler = function (event) {
                storeObservedPlayback(generation, context, state, event, true);
            };
            state.playerEndedHandler = function (event) {
                storeObservedPlayback(generation, context, state, event, true);
                advancePlaybackWatcher(generation, context, state);
            };
            state.playerDestroyHandler = function (event) {
                // Lampa may remove the underlying media node before Player.callback.
                // Capture the final position while its player object still exists,
                // then restore the title controller immediately instead of waiting
                // for the later callback. Auto-next and stream recovery deliberately
                // close the player themselves and must keep ownership of navigation.
                storeObservedPlayback(generation, context, state, event, true);
                if (!state.advanced && !state.recovering && !state.switching && !state.returnRestoreScheduled) {
                    state.returnRestoreScheduled = true;
                    restorePlaybackInteraction(null, {timeout: 2400, interval: 120});
                }
            };
            state.playerErrorHandler = function (event) {
                recoverInternalPlayback(generation, context, state, event);
            };
            listener.follow('timeupdate', state.playerTimeHandler);
            listener.follow('pause', state.playerPauseHandler);
            listener.follow('ended', state.playerEndedHandler);
            listener.follow('destroy', state.playerDestroyHandler);
            listener.follow('error', state.playerErrorHandler);
        }

        function recoverInternalPlayback(generation, context, state, event) {
            if (!event || !event.fatal || generation !== playbackWatcherGeneration || playbackWatcher !== state) return;
            if (state.recovering || state.recoveryAttempts >= INTERNAL_PLAYBACK_RECOVERY_LIMIT || !context || !context.selected) return;
            if (Number(context.selected.yani_internal_recovery_total || 0) >= INTERNAL_PLAYBACK_RECOVERY_TOTAL_LIMIT) return;
            var origin = videoResolverUrl(context.selected);
            if (!origin || isDirectVideoUrl(origin) || !window.LampaYaniStreamResolver ||
                !LampaYaniStreamResolver.canResolve(origin)) return;

            state.recovering = true;
            state.recoveryAttempts += 1;
            context.selected.yani_internal_recovery = state.recoveryAttempts;
            context.selected.yani_internal_recovery_total = Number(context.selected.yani_internal_recovery_total || 0) + 1;
            storeObservedPlayback(generation, context, state, event, true);
            var position = Math.max(0, Number(state.lastObservedPosition || 0));
            var duration = Math.max(0, Number(state.lastObservedDuration || context.selected.duration || 0));
            context.selected.watched = context.selected.watched || {};
            context.selected.watched.end_time = Math.floor(position);
            // Lampa's internal player resumes only from `timeline.time`; the
            // `time` field of the playlist item is ignored, so a relaunched stream
            // started again from zero. The watcher of the relaunched player seeks
            // to this position itself once the new stream reports its duration.
            context.selected.yani_resume_seek = Math.floor(position);
            context.selected.yani_resume_kind = 'recovery';
            if (duration > 0) context.selected.duration = Math.floor(duration);
            if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(t('internal_player_recovering'));

            LampaYaniStreamResolver.resolve(origin, {force: true}).then(function (result) {
                if (generation !== playbackWatcherGeneration || playbackWatcher !== state || !result || !result.url) return;
                context.selected.yani_stream_url = result.url;
                context.selected.yani_stream_quality = result.quality || '';
                context.selected.yani_stream_qualities = result.qualities || null;
                context.selected.yani_stream_source = result.source || '';
                context.selected.yani_stream_headers = result.headers || null;
                context.selected.yani_stream_headers_required = Boolean(result.headersRequired);
                beginPlaybackNavigation();
                var recoverySession = playbackReturnState.session;
                var closingVideo = state.video;
                stopPlaybackWatcher();
                closeInternalPlayer(closingVideo).then(function () {
                    if (playbackReturnState.session !== recoverySession || playbackContext !== context) return;
                    launchResolvedVideo(context.card, context.group, context.videos, context.selected, result.url, {
                        autoAdvance: true,
                        recovery: true
                    });
                });
            }).catch(function (error) {
                state.recovering = false;
                console.warn('[YummyAnime] Could not refresh an interrupted stream', error);
            });
        }

        function watchPlayback(generation, context, state) {
            // A queued tick from the previous episode must never stop the watcher
            // that belongs to the newly launched player.
            if (generation !== playbackWatcherGeneration || playbackWatcher !== state) return;
            var video = playerVideoElement(state.video);
            if (!video) {
                // The player may still be starting up, so give it a grace period
                // before the watcher gives up on this episode.
                if (Date.now() - state.lastSeenAt > PLAYER_STARTUP_GRACE_MS) stopPlaybackWatcher();
                return;
            }
            bindPlaybackVideo(generation, context, state, video);
            var position = Number(video.currentTime) || 0;
            var duration = Number(video.duration) || 0;
            if (state.resumeSeek > 0 && duration > 0) {
                // Return a recovered stream to where the interrupted one stopped,
                // before the near-zero start is recorded as the viewer's progress.
                var resumeTo = Math.min(state.resumeSeek, Math.max(0, duration - 15));
                // A saved position near the end belongs to an episode that was
                // finished; opening it again means watching it again. A recovered
                // stream always returns to where it broke.
                var nearEnd = state.resumeKind !== 'recovery' && state.resumeSeek >= duration * 0.9;
                state.resumeSeek = 0;
                context.selected.yani_resume_seek = 0;
                if (!nearEnd && resumeTo > 10 && position < resumeTo - 5) {
                    try {
                        video.currentTime = resumeTo;
                        position = resumeTo;
                    } catch (error) {
                        console.warn('[YummyAnime] Could not resume a recovered stream', error);
                    }
                }
            }
            var finalState = video.paused || video.ended || duration > 0 && position >= duration - 2;
            storeObservedPlayback(generation, context, state, {current: position, duration: duration}, finalState);
            if (state.recoveryAttempts > 0 && !video.paused && !video.ended &&
                position >= state.recoveryBaselinePosition + INTERNAL_PLAYBACK_RECOVERY_READY_SECONDS) {
                // A few seconds of advancing playback mean the refreshed stream is
                // healthy. Future, unrelated interruptions get a fresh bounded
                // retry budget instead of inheriting attempts from an old outage.
                state.recoveryAttempts = 0;
                state.recoveryBaselinePosition = position;
                context.selected.yani_internal_recovery = 0;
            }

            var cvhSource = isCvhPlaybackSource(videoResolverUrl(context.selected), context.group);
            if (cvhSource && !video.paused && !video.ended && !state.recovering &&
                state.recoveryAttempts < INTERNAL_PLAYBACK_RECOVERY_LIMIT) {
                var now = Date.now();
                var startupStalled = position <= 0.25 && now - state.startedAt >= CVH_STARTUP_STALL_MS;
                var playbackStalled = position > 0.25 && now - state.lastProgressAt >= CVH_PLAYBACK_STALL_MS;
                if (startupStalled || playbackStalled) {
                    recoverInternalPlayback(generation, context, state, {
                        fatal: true,
                        current: position,
                        duration: duration,
                        reason: startupStalled ? 'cvh-startup-stall' : 'cvh-playback-stall'
                    });
                    return;
                }
            }

            if (state.skipMode !== 'off' && duration >= 60) {
                var rounded = Math.round(duration);
                if (!state.skipLoading && (!state.skipReady || Math.abs((state.skipLength || 0) - rounded) > 15)) {
                    state.segments = [];
                    hideSkipPrompt();
                    loadSkipSegments(generation, context, state, state.skipMode, rounded);
                }
            }

            var activePrompt = null;
            state.segments.forEach(function (segment) {
                if (state.skipped[segment.type]) return;
                var inside = position >= segment.interval.start && position < segment.interval.end - 1;
                if (state.skipPrompt) {
                    if (inside) activePrompt = segment;
                    return;
                }
                if (!inside) return;
                applySkip(video, segment, state);
            });
            if (state.skipPrompt) {
                if (activePrompt) showSkipPrompt(activePrompt, video);
                else hideSkipPrompt();
            }

            if (!state.autoNext || duration < 60 || position <= 0) return;
            var remaining = duration - position;
            if (!state.prefetched && remaining <= NEXT_PREFETCH_LEAD) {
                state.prefetched = true;
                prefetchNextEpisode(context);
            }
            if (!state.advanced && video.ended) {
                advancePlaybackWatcher(generation, context, state);
            }
        }

        function videoIdentity(video) {
            if (!video) return '';
            return String(video.video_id || video.id || '') + ':' + window.LampaYaniEpisode.key(window.LampaYaniEpisode.valueOf(video)) + ':' + String(videoSourceUrl(video) || '');
        }

        function nextEpisodeVideo(context) {
            var videos = (context && context.videos) || [];
            var selected = context && context.selected;
            if (!selected || !videos.length) return null;
            var index = videos.indexOf(selected);
            if (index < 0) {
                var selectedId = videoIdentity(selected);
                for (var i = 0; i < videos.length; i++) {
                    if (videoIdentity(videos[i]) === selectedId) {
                        index = i;
                        break;
                    }
                }
            }
            if (index < 0 || index + 1 >= videos.length) return null;
            return videos[index + 1];
        }

        // Resolving a stream costs a round trip through the source's player page,
        // which is long enough to be noticeable between episodes. Doing it while
        // the current episode still plays hides that entirely, and the resolver
        // caches the result for the launch that follows.
        function prefetchNextEpisode(context) {
            var next = nextEpisodeVideo(context);
            if (!next || next.yani_stream_url) return;
            var url = videoSourceUrl(next);
            if (!url || isExternalPlayableUrl(url, next)) return;
            if (!window.LampaYaniStreamResolver || !LampaYaniStreamResolver.canResolve(url)) return;
            next.yani_stream_origin = url;
            LampaYaniStreamResolver.resolve(url, next).then(function (result) {
                if (!result || !result.url) return;
                next.yani_stream_url = result.url;
                next.yani_stream_quality = result.quality || '';
                next.yani_stream_qualities = result.qualities || null;
                next.yani_stream_source = result.source || '';
                next.yani_stream_headers = result.headers || null;
                next.yani_stream_headers_required = Boolean(result.headersRequired);
            }).catch(function (error) {
                // The episode is launched normally later; a failed prefetch only
                // costs the time it would have saved.
                console.warn('[YummyAnime] Next episode prefetch failed', error);
            });
        }

        // Handing the running player to Lampa's own teardown before starting the
        // next episode. Playing on top of it instead leaves the previous <video>
        // and its MediaSource alive, because Lampa only releases the player it
        // considers current — so every automatic advance stranded one more hardware
        // decoder, and after eight to ten of them the renderer died. Measured: each
        // advance added one live video and one live MediaSource, none of which were
        // ever closed, while a manual launch released both every time.
        function releasePlaybackVideo(video) {
            if (!video) return;
            try { video.pause(); } catch (ignorePause) {}
            try {
                video.removeAttribute('src');
                Array.prototype.forEach.call(video.querySelectorAll('source'), function (source) {
                    source.removeAttribute('src');
                });
                if (video.load) video.load();
            } catch (error) {
                console.warn('[YummyAnime] Could not release the previous video element', error);
            }
        }

        function waitForInternalPlayerTeardown(video) {
            var started = Date.now();
            return new Promise(function (resolve) {
                function finish() {
                    setTimeout(resolve, PLAYER_CLOSE_SETTLE_MS);
                }
                function check() {
                    if (!video || !document.documentElement.contains(video)) {
                        finish();
                        return;
                    }
                    if (Date.now() - started >= PLAYER_CLOSE_TIMEOUT_MS) {
                        // A few Lampa builds leave the closed video in the DOM on
                        // slower devices. Explicitly clearing its source releases
                        // the MediaSource and hardware decoder before the next one.
                        releasePlaybackVideo(video);
                        finish();
                        return;
                    }
                    setTimeout(check, PLAYER_CLOSE_POLL_MS);
                }
                setTimeout(check, PLAYER_CLOSE_POLL_MS);
            });
        }

        function closeInternalPlayer(video) {
            var closingVideo = video || playerVideoElement();
            try {
                if (Lampa.Player && Lampa.Player.close) Lampa.Player.close();
            } catch (error) {
                console.warn('[YummyAnime] Could not close the player before advancing', error);
            }
            return waitForInternalPlayerTeardown(closingVideo);
        }

        function titleAiredCount(card) {
            var episodes = card && card.yani_episodes || {};
            return Math.max(0, Number(episodes.aired || episodes.released || episodes.count || episodes.total || 0));
        }

        function autoNextEndMessage(context) {
            var selected = context && context.selected;
            var number = window.LampaYaniEpisode && window.LampaYaniEpisode.number
                ? window.LampaYaniEpisode.number(window.LampaYaniEpisode.valueOf(selected))
                : Number(selected && (selected.number || selected.index) || 0);
            var aired = titleAiredCount(context && context.card);
            if (aired > 0 && isFinite(number) && number >= aired) return t('auto_next_last_title');
            return t('auto_next_last_voice');
        }

        function finishAutoNextPlayback(context, closingVideo) {
            Lampa.Noty.show(autoNextEndMessage(context));
            flushPlaybackProgress(true, context);
            closeInternalPlayer(closingVideo).then(function () {
                restorePlaybackInteraction();
            });
        }

        function advanceToNextEpisode(context, closingVideo) {
            var next = nextEpisodeVideo(context);
            if (!next) {
                finishAutoNextPlayback(context, closingVideo);
                return;
            }
            Lampa.Noty.show(t('auto_next_starting') + ' ' + (next.number || next.index || ''));
            // Bumping the return session first: closing the player schedules a
            // focus restore back to the detail page, which must not fire while the
            // next episode is opening.
            beginPlaybackNavigation();
            var handoffSession = playbackReturnState.session;
            closeInternalPlayer(closingVideo).then(function () {
                if (playbackReturnState.session !== handoffSession || playbackContext !== context) return;
                launchVideo(context.card, context.group, context.videos, next, {autoAdvance: true});
            });
        }

        return {
            setContext: function (context) { playbackContext = context; },
            context: function () { return playbackContext; },
            autoNextEnabled: autoNextEnabled,
            startPlaybackWatcher: startPlaybackWatcher,
            stopPlaybackWatcher: stopPlaybackWatcher,
            flushPlaybackProgress: flushPlaybackProgress,
            destroySkipPrompt: destroySkipPrompt,
            beginEpisodeSwitch: beginEpisodeSwitch
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.PlaybackWatcher = window.LampaYaniPlaybackWatcher = {create: create};
}(window));
