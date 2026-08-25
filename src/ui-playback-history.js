(function (window) {
    'use strict';

    // Local playback history storage plus Continue Watching card progress UI.
    // Player watchers and remote flush remain in ui.js; this module owns the
    // shared history map and the visible progress decorations.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var bindYummyCardRender = deps.bindYummyCardRender || function () {};
        var cardRenderElement = deps.cardRenderElement || function (element, card) {
            var render = element && element.jquery ? element : element ? $(element) : $();
            if (!render.length && card && card.render) render = $(card.render(true));
            return render;
        };
        var openVideos = deps.openVideos || function () {};
        var addCardPlaybackProgress = deps.addCardPlaybackProgress || function () {};
        var syncCardEpisodesMeta = deps.syncCardEpisodesMeta || function () {};
        var syncCardOverlayLayout = deps.syncCardOverlayLayout || function () {};
        var playerKey = deps.playerKey || function (group) {
            return String(group && (group.player || group.title) || '').toLowerCase();
        };
        var videoSourceUrl = deps.videoSourceUrl || function () { return ''; };
        var historyCache = null;
        var historyCacheAt = 0;
        var HISTORY_CACHE_MS = 500;

        function playbackHistory() {
            if (!window.Lampa || !window.Lampa.Storage) return {};
            var now = Date.now();
            if (historyCache && now - historyCacheAt < HISTORY_CACHE_MS) return historyCache;
            try {
                var value = window.Lampa.Storage.get('yani_playback_history', '{}');
                if (value && typeof value === 'object') historyCache = value;
                else historyCache = JSON.parse(value || '{}');
            } catch (error) {
                historyCache = {};
            }
            historyCacheAt = now;
            return historyCache;
        }

        function invalidatePlaybackHistoryCache() {
            historyCache = null;
            historyCacheAt = 0;
        }

        function getPlayback(animeId) {
            return playbackHistory()[String(animeId)] || null;
        }

        function positiveNumber(value) {
            var number = Number(value);
            return isFinite(number) && number > 0 ? number : 0;
        }

        function episodeFinished(position, duration, flags) {
            var utils = window.LampaYaniUiUtils;
            if (utils && utils.isEpisodeFinished) return utils.isEpisodeFinished(position, duration, flags);
            return positiveNumber(duration) > 0 && positiveNumber(position) / positiveNumber(duration) >= 0.95;
        }

        // How many episodes the title has released. Continue Watching needs a
        // ceiling before it may offer the episode after the one just finished,
        // so it never points at an episode that does not exist yet.
        function episodeCeiling(card) {
            var episodes = card && (card.yani_episodes || card.episodes) || {};
            return positiveNumber(episodes.aired || episodes.released) ||
                positiveNumber(episodes.count || episodes.total) ||
                positiveNumber(card && (card.episodes_aired || card.episodes_count));
        }

        function rememberPlayback(card, group, video) {
            if (!window.Lampa || !window.Lampa.Storage || !card || !card.yani_id) return null;
            var history = playbackHistory();
            var previous = history[String(card.yani_id)] || null;
            var videoData = window.LampaYaniUiUtils && window.LampaYaniUiUtils.videoData
                ? window.LampaYaniUiUtils.videoData(video)
                : {};
            var number = window.LampaYaniEpisode.valueOf(video);
            var saved = history[String(card.yani_id)] = {
                number: number,
                // The furthest episode ever reached for this title, which is not
                // the same as the last one opened: rewatching episode 2 must not
                // move the queue back from episode 9.
                max_episode: Math.max(positiveNumber(number), positiveNumber(previous && previous.max_episode)),
                episodes_aired: episodeCeiling(card) || positiveNumber(previous && previous.episodes_aired),
                video_id: video.video_id || '',
                time: Number(video.watched && video.watched.end_time || 0),
                duration: Math.max(0, Number(video.duration || 0)),
                player: playerKey(group),
                voice: String(videoData.dubbing || ''),
                episode_url: videoSourceUrl(video),
                title: card.title || '',
                poster: card.poster || card.img || '',
                card: {
                    title: card.title || '',
                    original_title: card.original_title || '',
                    poster: card.poster || card.img || '',
                    release_date: card.release_date || '',
                    overview: card.overview || '',
                    anime_id: card.yani_id,
                    remote_ids: card.yani_remote_ids || {}
                },
                updated_at: Date.now()
            };
            var ids = Object.keys(history).sort(function (a, b) {
                return Number(history[b].updated_at || 0) - Number(history[a].updated_at || 0);
            });
            ids.slice(100).forEach(function (id) { delete history[id]; });
            persistHistory(history);
            return saved;
        }

        function persistHistory(history) {
            if (!window.Lampa || !window.Lampa.Storage) return;
            var ids = Object.keys(history).sort(function (a, b) {
                return Number(history[b].updated_at || 0) - Number(history[a].updated_at || 0);
            });
            ids.slice(100).forEach(function (id) { delete history[id]; });
            window.Lampa.Storage.set('yani_playback_history', JSON.stringify(history));
            invalidatePlaybackHistoryCache();
        }

        function importRemoteEntries(remoteEntries) {
            var Home = window.LampaYaniHomeSections;
            if (!Home || !Home.importRemoteIntoLocal) return {imported: 0, history: playbackHistory()};
            var result = Home.importRemoteIntoLocal(playbackHistory(), remoteEntries);
            if (result.imported) persistHistory(result.history);
            return result;
        }

        function importVideosProgress(card, videos) {
            if (!card || !card.yani_id) return {imported: 0};
            var entries = [];
            (videos || []).forEach(function (video) {
                var watched = video && video.watched;
                if (!watched || typeof watched !== 'object') return;
                var time = Number(watched.end_time || watched.time || 0);
                if (!(time > 0) && !watched.completed && !watched.finished) return;
                var videoData = window.LampaYaniUiUtils && window.LampaYaniUiUtils.videoData
                    ? window.LampaYaniUiUtils.videoData(video)
                    : {};
                entries.push({
                    anime_id: card.yani_id,
                    video_id: video.video_id || video.id || '',
                    number: window.LampaYaniEpisode.valueOf(video),
                    title: card.title || '',
                    poster: card.poster || card.img || '',
                    player: String(videoData.player || ''),
                    voice: String(videoData.dubbing || ''),
                    time: time,
                    duration: Math.max(0, Number(video.duration || 0)),
                    updated_at: Number(watched.updated_at || watched.date || 0)
                });
            });
            var result = importRemoteEntries(entries);
            recordEpisodeReach(card, videos, entries);
            return result;
        }

        // The episode list is the most complete view of a title there is: it
        // states every episode the account has watched and how many exist. Both
        // are kept on the local entry so Continue Watching can offer the next
        // episode without loading the title again.
        function recordEpisodeReach(card, videos, watchedEntries) {
            if (!card || !card.yani_id) return;
            var history = playbackHistory();
            var saved = history[String(card.yani_id)];
            if (!saved) return;
            var reached = positiveNumber(saved.max_episode);
            (watchedEntries || []).forEach(function (entry) {
                // Only finished episodes count: a title opened and abandoned
                // after a minute must not push the queue past that episode.
                if (!episodeFinished(entry && entry.time, entry && entry.duration, entry)) return;
                reached = Math.max(reached, positiveNumber(entry && entry.number));
            });
            var aired = episodeCeiling(card);
            (videos || []).forEach(function (video) {
                aired = Math.max(aired, positiveNumber(window.LampaYaniEpisode.valueOf(video)));
            });
            if (reached === positiveNumber(saved.max_episode) && aired === positiveNumber(saved.episodes_aired)) return;
            saved.max_episode = reached;
            saved.episodes_aired = aired;
            persistHistory(history);
        }

        function pullRemoteProgress(limit) {
            if (!window.LampaYaniAuth || !LampaYaniAuth.token() || !window.LampaYaniApi || !LampaYaniApi.watchHistory) {
                return Promise.resolve({imported: 0});
            }
            return window.LampaYaniApi.watchHistory(limit || 100, 0).then(function (payload) {
                var Home = window.LampaYaniHomeSections;
                var remote = Home && Home.normalizeRemoteHistory ? Home.normalizeRemoteHistory(payload) : [];
                return importRemoteEntries(remote);
            });
        }

        function autoProgressSyncEnabled() {
            if (!window.LampaYaniAuth || !window.LampaYaniAuth.token() || !window.Lampa || !window.Lampa.Storage || !window.Lampa.Storage.get) return false;
            var value = window.Lampa.Storage.get('yani_auto_sync_progress', true);
            return value !== false && value !== 'false';
        }

        var unsyncableWarned = {};

        function syncServerProgress(video) {
            if (!autoProgressSyncEnabled() || !window.LampaYaniApi || !video) return;
            if (!video.video_id) {
                // Progress is addressed by video id, so an episode without one
                // can never reach the account. It used to fail silently, which
                // reads as "sync is broken" rather than "this source has no id".
                var key = String(video.title || '') + ':' + String(video.number || video.index || '');
                if (!unsyncableWarned[key]) {
                    unsyncableWarned[key] = true;
                    console.warn('[YummyAnime] Episode has no video id, progress stays on this device only', key);
                }
                return;
            }
            window.LampaYaniApi.syncVideoProgress(video.video_id, video.watched && video.watched.end_time, video.duration).catch(function (error) {
                console.warn('[YummyAnime] Progress sync failed', error);
            });
        }

        function renderHistoryProgress(rendered, playback) {
            var view = $('.card__view', rendered).first();
            if (!view.length) return;
            view.find('.yani-card-history, .yani-card-history-progress').remove();
            var duration = Math.max(0, Number(playback.duration || 0));
            var position = Math.max(0, Number(playback.time || 0));
            var percent = duration > 0 ? Math.min(100, Math.round(position / duration * 100)) : 0;
            var label = playback.number ? t('episode') + ' ' + playback.number : t('continue_watching');
            if (percent) label += ' · ' + percent + '%';
            view.append($('<span class="yani-card-history"></span>').text(label));
            if (duration > 0) {
                view.append($('<span class="yani-card-history-progress"><span></span></span>').find('span').css('width', percent + '%').end());
            }
            syncCardOverlayLayout(rendered);
        }

        function refreshVisiblePlaybackProgress(card) {
            if (!card || !card.yani_id) return;
            $('.yani-history-card').each(function () {
                var rendered = $(this);
                if (String(rendered.attr('data-yani-history-id') || '') !== String(card.yani_id)) return;
                renderHistoryProgress(rendered, card.yani_resume || getPlayback(card.yani_id) || {});
            });
            $('[data-yani-card-id="' + String(card.yani_id).replace(/"/g, '') + '"]').not('.yani-history-card').each(function () {
                addCardPlaybackProgress($(this), card);
                syncCardEpisodesMeta($(this), card);
                syncCardOverlayLayout($(this), card);
            });
            if (window.$ && $(document) && $(document).trigger) $(document).trigger('yani:watch-progress', [card]);
        }

        function updatePlaybackProgress(context, position, duration, remote) {
            if (!context || !context.selected || !context.card) return;
            var video = context.selected;
            video.watched = video.watched || {};
            video.watched.end_time = Math.max(0, Math.floor(Number(position) || 0));
            if (duration > 0) video.duration = Math.floor(duration);
            var saved = rememberPlayback(context.card, context.group, video);
            if (saved) {
                context.card.yani_resume = {
                    number: saved.number,
                    max_episode: saved.max_episode,
                    episodes_aired: saved.episodes_aired,
                    resume_next: Boolean(saved.resume_next),
                    video_id: saved.video_id,
                    time: saved.time,
                    duration: saved.duration,
                    player: saved.player,
                    voice: saved.voice,
                    updated_at: saved.updated_at
                };
                refreshVisiblePlaybackProgress(context.card);
            }
            if (remote) syncServerProgress(video);
        }

        // The account's watch history is the shared truth between devices; the
        // local copy is only a cache of it. Pulling it once per session — not
        // just when the Continue Watching screen happens to be opened — is what
        // makes an episode finished on the phone show up on the TV, and keeps
        // card progress correct everywhere it is drawn.
        var remotePullAt = 0;
        var remotePull = null;
        var REMOTE_PULL_TTL = 5 * 60 * 1000;

        function ensureRemoteHistory(force) {
            if (!autoProgressSyncEnabled()) return Promise.resolve({imported: 0, skipped: true});
            if (!force && remotePull && Date.now() - remotePullAt < REMOTE_PULL_TTL) return remotePull;
            remotePullAt = Date.now();
            remotePull = pullRemoteProgress(100).then(function (result) {
                if (result && result.imported) {
                    console.log('[YummyAnime] Imported ' + result.imported + ' history entries from the account');
                }
                return result;
            }).catch(function (error) {
                // A missing pull must never block playback or the dashboard, so
                // the stale local copy simply stays in use until the next try.
                console.warn('[YummyAnime] Could not pull the account history', error);
                remotePullAt = 0;
                return {imported: 0, failed: true};
            });
            return remotePull;
        }

        function syncPlaybackHistoryManually() {
            if (!window.LampaYaniAuth || !window.LampaYaniAuth.token()) {
                if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show(t('login_required'));
                return;
            }
            if (window.Lampa && window.Lampa.Loading && window.Lampa.Loading.start) window.Lampa.Loading.start();
            pullRemoteProgress(100).catch(function (error) {
                console.warn('[YummyAnime] Remote history pull failed', error);
                return {imported: 0};
            }).then(function (pulled) {
                var history = playbackHistory();
                var videos = Object.keys(history).map(function (id) {
                    var item = history[id] || {};
                    if (!item.video_id) return null;
                    return {
                        video_id: Number(item.video_id),
                        time: Number(item.time || 0),
                        date: Math.floor(Number(item.updated_at || Date.now()) / 1000)
                    };
                }).filter(function (item) { return item && item.video_id; });
                if (!videos.length) {
                    if (window.Lampa && window.Lampa.Loading && window.Lampa.Loading.stop) window.Lampa.Loading.stop();
                    if (window.Lampa && window.Lampa.Noty) {
                        window.Lampa.Noty.show(pulled && pulled.imported ? t('sync_history_ok') : t('history_empty'));
                    }
                    return;
                }
                return window.LampaYaniApi.syncVideoWatches(videos).then(function () {
                    if (window.Lampa && window.Lampa.Loading && window.Lampa.Loading.stop) window.Lampa.Loading.stop();
                    if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show(t('sync_history_ok'));
                });
            }).catch(function (error) {
                if (window.Lampa && window.Lampa.Loading && window.Lampa.Loading.stop) window.Lampa.Loading.stop();
                console.error('[YummyAnime] History sync failed', error);
                if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show(t('sync_history_error'));
            });
        }

        function bindHistoryCardRender(first, second, third) {
            bindYummyCardRender(first, second, third);
            var card;
            var element;
            [first, second, third].forEach(function (value) {
                if (!value) return;
                if (!element && (value.jquery || value.nodeType || (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement))) element = value;
                if (!card && (value.render || value.yani_id || value.title)) card = value;
                else if (!card) {
                    var candidate = value.card || value.object || value.data;
                    if (candidate && (candidate.render || candidate.yani_id || candidate.title)) card = candidate;
                }
            });
            if (card && card.yani_id) {
                // Continue Watching is a playback queue, not an information catalog.
                var openHistoryEntry = function () { openVideos(card, true); };
                var rendered = cardRenderElement(element, card);
                rendered.addClass('yani-history-card').attr('data-yani-history-id', String(card.yani_id));
                rendered.closest('.category-full, .items-cards').addClass('yani-card-grid');
                rendered.add(rendered.find('*')).off('hover:enter.yaniOpen click.yaniOpen hover:enter.yaniHistory click.yaniHistory');
                rendered.on('hover:enter.yaniHistory click.yaniHistory', function (event) {
                    if (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                    openHistoryEntry();
                    return false;
                });
                card.onEnter = openHistoryEntry;
                renderHistoryProgress(rendered, card.yani_resume || {});
            }
        }

        return {
            playbackHistory: playbackHistory,
            getPlayback: getPlayback,
            rememberPlayback: rememberPlayback,
            importRemoteEntries: importRemoteEntries,
            importVideosProgress: importVideosProgress,
            pullRemoteProgress: pullRemoteProgress,
            ensureRemoteHistory: ensureRemoteHistory,
            autoProgressSyncEnabled: autoProgressSyncEnabled,
            syncServerProgress: syncServerProgress,
            renderHistoryProgress: renderHistoryProgress,
            refreshVisiblePlaybackProgress: refreshVisiblePlaybackProgress,
            updatePlaybackProgress: updatePlaybackProgress,
            syncPlaybackHistoryManually: syncPlaybackHistoryManually,
            bindHistoryCardRender: bindHistoryCardRender
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.PlaybackHistory = window.LampaYaniPlaybackHistory = {
        create: create
    };
}(window));
