(function (window) {
    'use strict';

    // Local playback history storage plus Continue Watching card progress UI.
    // Player watchers and remote flush remain in ui.js; this module owns the
    // shared history map and the visible progress decorations.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var bindYummyCardRender = deps.bindYummyCardRender || function () {};
        var cardRenderTarget = deps.cardRenderTarget || function () { return {card: null, element: null}; };
        var cardRenderElement = deps.cardRenderElement || function (element, card) {
            var render = element && element.jquery ? element : element ? $(element) : $();
            if (!render.length && card && card.render) render = $(card.render(true));
            return render;
        };
        var openVideos = deps.openVideos || function () {};
        var openYummyDetail = deps.openYummyDetail || null;
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
        var historyChangeTimer = 0;
        var pendingHistoryCard = null;
        var autoListPending = {};
        var autoListRetryAt = {};

        function publishPlaybackHistoryChange(card) {
            if (card) pendingHistoryCard = card;
            if (historyChangeTimer || typeof setTimeout !== 'function') return;
            historyChangeTimer = setTimeout(function () {
                historyChangeTimer = 0;
                var changedCard = pendingHistoryCard;
                pendingHistoryCard = null;
                if (window.$ && typeof document !== 'undefined') {
                    $(document).trigger('yani:watch-progress', [changedCard || null]);
                }
            }, 0);
        }

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
            duration = positiveNumber(duration);
            position = positiveNumber(position);
            if (!(duration > 0)) return false;
            if (duration <= 60 * 60) {
                return position / duration > 0.81 || duration >= 10 * 60 && duration - position <= 3 * 60;
            }
            return position / duration >= 0.95;
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
            saved.half_watched_episodes = Object.assign({}, previous && previous.half_watched_episodes || {});
            saved.finished_episodes = Object.assign({}, previous && previous.finished_episodes || {});
            saved.auto_list_id = previous && previous.auto_list_id;
            var ids = Object.keys(history).sort(function (a, b) {
                return Number(history[b].updated_at || 0) - Number(history[a].updated_at || 0);
            });
            ids.slice(100).forEach(function (id) { delete history[id]; });
            persistHistory(history);
            publishPlaybackHistoryChange(card);
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
            if (result.imported) {
                persistHistory(result.history);
                // A remote pull can add titles that this device has never
                // opened. Notify an already visible dashboard after storage is
                // updated so its Continue Watching row does not stay stale.
                publishPlaybackHistoryChange(null);
            }
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
            var Home = window.LampaYaniHomeSections;
            var maximum = Math.max(1, Number(limit || 100));
            if (Home && Home.fetchHistoryRange) {
                return Home.fetchHistoryRange(window.LampaYaniApi.watchHistory, maximum, 30).then(importRemoteEntries);
            }
            return window.LampaYaniApi.watchHistory(Math.min(30, maximum), 0).then(function (payload) {
                var remote = Home && Home.normalizeRemoteHistory ? Home.normalizeRemoteHistory(payload) : [];
                return importRemoteEntries(remote);
            });
        }

        function autoProgressSyncEnabled() {
            if (!window.LampaYaniAuth || !window.LampaYaniAuth.token() || !window.Lampa || !window.Lampa.Storage || !window.Lampa.Storage.get) return false;
            var value = window.Lampa.Storage.get('yani_auto_sync_progress', true);
            return value !== false && value !== 'false';
        }

        function autoManageListsEnabled() {
            if (!window.LampaYaniAuth || !window.LampaYaniAuth.token() || !window.Lampa || !window.Lampa.Storage || !window.Lampa.Storage.get) return false;
            var value = window.Lampa.Storage.get('yani_auto_manage_lists', false);
            return value === true || value === 'true';
        }

        function maybeAutoManageList(card, saved, video, position, duration) {
            if (!autoManageListsEnabled() || !card || !card.yani_id || !saved || !window.LampaYaniApi || !window.LampaYaniApi.addToList) return;
            var episode = window.LampaYaniEpisode.key(window.LampaYaniEpisode.valueOf(video));
            var ratio = Number(duration) > 0 ? Number(position) / Number(duration) : 0;
            if (episode && ratio >= 0.5) saved.half_watched_episodes[episode] = true;
            if (episode && episodeFinished(position, duration, video && video.watched)) saved.finished_episodes[episode] = true;

            var halfCount = Object.keys(saved.half_watched_episodes || {}).length;
            var aired = episodeCeiling(card) || positiveNumber(saved.episodes_aired);
            var allFinished = aired > 0;
            for (var number = 1; number <= aired && allFinished; number++) {
                allFinished = Boolean(saved.finished_episodes[window.LampaYaniEpisode.key(number)]);
            }
            var currentList = card.yani_list_id;
            var target = allFinished ? {id: 2, key: 'completed'} : halfCount >= 2 ? {id: 0, key: 'watching'} : null;
            if (!target || Number(currentList) === 3 || Number(currentList) === target.id || Number(saved.auto_list_id) === target.id) return;
            var key = String(card.yani_id) + ':' + target.id;
            if (autoListPending[key] || Date.now() < Number(autoListRetryAt[key] || 0)) return;
            autoListPending[key] = true;
            window.LampaYaniApi.addToList(card.yani_id, target.key).then(function () {
                delete autoListPending[key];
                saved.auto_list_id = target.id;
                card.yani_list_id = target.id;
                persistHistory(playbackHistory());
                publishPlaybackHistoryChange(card);
            }).catch(function (error) {
                delete autoListPending[key];
                autoListRetryAt[key] = Date.now() + 30 * 60 * 1000;
                console.warn('[YummyAnime] Automatic list update failed', error);
            });
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

        function clearEpisodeProgress(card, videos) {
            videos = Array.isArray(videos) ? videos.filter(Boolean) : [];
            var episode = videos.length ? window.LampaYaniEpisode.valueOf(videos[0]) : '';
            if (!card || !card.yani_id || !episode) return Promise.reject(new Error('Episode progress target is missing'));
            var clearedKeys = {};
            var clearedNumbers = [];
            videos.forEach(function (video) {
                var value = window.LampaYaniEpisode.valueOf(video);
                var key = window.LampaYaniEpisode.key(value);
                var number = positiveNumber(value);
                if (key) clearedKeys[key] = true;
                if (number) clearedNumbers.push(number);
                if (!video.watched || typeof video.watched !== 'object') video.watched = {};
                video.watched.end_time = 0;
                video.watched.time = 0;
                video.watched.completed = false;
                video.watched.finished = false;
            });

            var history = playbackHistory();
            var saved = history[String(card.yani_id)];
            if (saved) {
                if (clearedKeys[window.LampaYaniEpisode.key(saved.number)]) {
                    saved.time = 0;
                    saved.resume_next = false;
                }
                Object.keys(clearedKeys).forEach(function (key) {
                    if (saved.half_watched_episodes) delete saved.half_watched_episodes[key];
                    if (saved.finished_episodes) delete saved.finished_episodes[key];
                });
                var highestCleared = clearedNumbers.length ? Math.max.apply(Math, clearedNumbers) : 0;
                var lowestCleared = clearedNumbers.length ? Math.min.apply(Math, clearedNumbers) : 0;
                if (highestCleared && positiveNumber(saved.max_episode) <= highestCleared) {
                    saved.max_episode = Math.max(0, lowestCleared - 1);
                }
                if (highestCleared && positiveNumber(card.yani_watched_episodes) <= highestCleared) {
                    card.yani_watched_episodes = Math.max(0, lowestCleared - 1);
                }
                saved.updated_at = Date.now();
                persistHistory(history);
                card.yani_resume = Object.assign({}, saved, {last_watched_episode: 0});
                refreshVisiblePlaybackProgress(card);
            } else {
                publishPlaybackHistoryChange(card);
            }

            var ids = videos.map(function (video) { return Number(video.video_id || video.id || 0); })
                .filter(function (id, index, items) { return id > 0 && items.indexOf(id) === index; });
            if (!ids.length || !window.LampaYaniAuth || !window.LampaYaniAuth.token() ||
                !window.LampaYaniApi || !window.LampaYaniApi.removeVideoWatches) {
                return Promise.resolve({local: true, removed: ids.length});
            }
            return window.LampaYaniApi.removeVideoWatches(ids);
        }

        function markEpisodesWatched(card, videos) {
            videos = Array.isArray(videos) ? videos.filter(Boolean) : [];
            if (!card || !card.yani_id || !videos.length) return Promise.reject(new Error('Episode progress target is missing'));
            var byEpisode = {};
            videos.forEach(function (video) {
                var value = window.LampaYaniEpisode.valueOf(video);
                var key = window.LampaYaniEpisode.key(value);
                if (!key) return;
                var duration = positiveNumber(video.duration) || 24 * 60;
                if (!video.watched || typeof video.watched !== 'object') video.watched = {};
                video.watched.end_time = duration;
                video.watched.time = duration;
                video.watched.completed = true;
                video.watched.finished = true;
                var current = byEpisode[key];
                if (!current || !current.video_id && (video.video_id || video.id)) byEpisode[key] = video;
            });
            var episodeKeys = Object.keys(byEpisode);
            if (!episodeKeys.length) return Promise.reject(new Error('Episode progress target is missing'));
            var representative = episodeKeys.map(function (key) { return byEpisode[key]; }).sort(function (left, right) {
                return positiveNumber(window.LampaYaniEpisode.valueOf(left)) - positiveNumber(window.LampaYaniEpisode.valueOf(right));
            }).pop();
            var reached = positiveNumber(window.LampaYaniEpisode.valueOf(representative));
            var duration = positiveNumber(representative.duration) || 24 * 60;
            var history = playbackHistory();
            var previous = history[String(card.yani_id)] || {};
            var saved = history[String(card.yani_id)] = Object.assign({}, previous, {
                number: window.LampaYaniEpisode.valueOf(representative),
                max_episode: Math.max(reached, positiveNumber(previous.max_episode)),
                episodes_aired: Math.max(episodeCeiling(card), reached, positiveNumber(previous.episodes_aired)),
                video_id: representative.video_id || representative.id || previous.video_id || '',
                time: duration,
                duration: duration,
                title: card.title || previous.title || '',
                poster: card.poster || card.img || previous.poster || '',
                updated_at: Date.now(),
                resume_next: true
            });
            saved.half_watched_episodes = Object.assign({}, previous.half_watched_episodes || {});
            saved.finished_episodes = Object.assign({}, previous.finished_episodes || {});
            episodeKeys.forEach(function (key) {
                saved.half_watched_episodes[key] = true;
                saved.finished_episodes[key] = true;
            });
            saved.card = Object.assign({}, previous.card || {}, {
                title: card.title || '',
                original_title: card.original_title || '',
                poster: card.poster || card.img || '',
                release_date: card.release_date || '',
                overview: card.overview || '',
                anime_id: card.yani_id,
                remote_ids: card.yani_remote_ids || {}
            });
            persistHistory(history);
            card.yani_watched_episodes = Math.max(positiveNumber(card.yani_watched_episodes), reached);
            card.yani_resume = Object.assign({}, saved, {last_watched_episode: reached});
            refreshVisiblePlaybackProgress(card);

            var watches = episodeKeys.map(function (key) {
                var video = byEpisode[key];
                var id = Number(video.video_id || video.id || 0);
                return id > 0 ? {
                    video_id: id,
                    time: positiveNumber(video.duration) || 24 * 60,
                    date: Math.floor(Date.now() / 1000)
                } : null;
            }).filter(Boolean);
            if (!watches.length || !window.LampaYaniAuth || !window.LampaYaniAuth.token() ||
                !window.LampaYaniApi || !window.LampaYaniApi.syncVideoWatches) {
                return Promise.resolve({local: true, marked: episodeKeys.length});
            }
            return window.LampaYaniApi.syncVideoWatches(watches);
        }

        function renderHistoryProgress(rendered, playback) {
            var view = $('.card__view', rendered).first();
            if (!view.length) return;
            view.find('.yani-card-history, .yani-card-history-progress').remove();
            var duration = Math.max(0, Number(playback.duration || 0));
            var position = Math.max(0, Number(playback.time || 0));
            var percent = duration > 0 ? Math.min(100, Math.round(position / duration * 100)) : 0;
            var episode = playback.last_watched_episode || playback.number;
            var label = episode ? t('episode') + ' ' + episode : t('continue_watching');
            if (percent) label += ' · ' + percent + '%';
            var awaiting = Number(playback.awaiting_episode || 0);
            if (awaiting) {
                // Caught up with an ongoing title: everything released is
                // watched, so the bar is full and the label names what is next.
                var nextDate = Number(playback.next_date || 0);
                var language = window.LampaYaniI18n && LampaYaniI18n.locale ? LampaYaniI18n.locale() : 'ru-RU';
                label = nextDate > Date.now()
                    ? t('episode') + ' ' + awaiting + ' · ' + new Date(nextDate).toLocaleDateString(language, {day: 'numeric', month: 'short'})
                    : t('awaiting_episode').replace('{episode}', awaiting);
                percent = 100;
            }
            view.append($('<span class="yani-card-history"></span>').text(label));
            if (duration > 0 || awaiting) {
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
            publishPlaybackHistoryChange(card);
        }

        function updatePlaybackProgress(context, position, duration, remote) {
            if (!context || !context.selected || !context.card) return;
            var video = context.selected;
            video.watched = video.watched || {};
            video.watched.end_time = Math.max(0, Math.floor(Number(position) || 0));
            if (duration > 0) video.duration = Math.floor(duration);
            var saved = rememberPlayback(context.card, context.group, video);
            if (saved) {
                maybeAutoManageList(context.card, saved, video, position, duration);
                context.card.yani_resume = {
                    number: saved.number,
                    max_episode: saved.max_episode,
                    episodes_aired: saved.episodes_aired,
                    resume_next: Boolean(saved.resume_next),
                    last_watched_episode: Number(saved.time || 0) > 0 ? Number(saved.number || 0) : 0,
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
            remotePull = pullRemoteProgress(300).then(function (result) {
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

        // This device's history in the form the account accepts: the episode
        // by its video id, how far it was watched and when.
        function localHistoryWatches() {
            var history = playbackHistory();
            return Object.keys(history).map(function (id) {
                var item = history[id] || {};
                if (!item.video_id) return null;
                return {
                    video_id: Number(item.video_id),
                    time: Number(item.time || 0),
                    date: Math.floor(Number(item.updated_at || Date.now()) / 1000)
                };
            }).filter(function (item) { return item && item.video_id; });
        }

        // Progress recorded while the server rejected the session never reached
        // the account: it answered 401 and nothing retries that. Signing in
        // again therefore exchanges the history both ways, quietly - the
        // account's is pulled in, then this device's is sent up.
        function syncHistoryAfterSignIn() {
            if (!autoProgressSyncEnabled() || !window.LampaYaniAuth || !window.LampaYaniAuth.token()) {
                return Promise.resolve({imported: 0, sent: 0, skipped: true});
            }
            return ensureRemoteHistory(true).then(function (pulled) {
                var imported = pulled && pulled.imported || 0;
                var videos = localHistoryWatches();
                if (!videos.length) return {imported: imported, sent: 0};
                return window.LampaYaniApi.syncVideoWatches(videos).then(function () {
                    console.log('[YummyAnime] Sent ' + videos.length + ' history entries to the account after sign-in');
                    return {imported: imported, sent: videos.length};
                });
            }).catch(function (error) {
                console.warn('[YummyAnime] Could not send the history to the account after sign-in', error);
                return {imported: 0, sent: 0, failed: true};
            });
        }

        function syncPlaybackHistoryManually() {
            if (!window.LampaYaniAuth || !window.LampaYaniAuth.token()) {
                if (window.Lampa && window.Lampa.Noty) window.Lampa.Noty.show(t('login_required'));
                return;
            }
            if (window.Lampa && window.Lampa.Loading && window.Lampa.Loading.start) window.Lampa.Loading.start();
            pullRemoteProgress(300).catch(function (error) {
                console.warn('[YummyAnime] Remote history pull failed', error);
                return {imported: 0};
            }).then(function (pulled) {
                var videos = localHistoryWatches();
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
            var target = cardRenderTarget(first, second, third);
            var card = target.card;
            var element = target.element;
            if (card && card.yani_id) {
                // A tile opens the title page, where the episode, its progress
                // and the watch button are; playback starts from there rather
                // than straight from the queue.
                var openHistoryEntry = function () {
                    if (openYummyDetail) openYummyDetail(card, false);
                    else openVideos(card, true);
                };
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
            autoManageListsEnabled: autoManageListsEnabled,
            syncServerProgress: syncServerProgress,
            clearEpisodeProgress: clearEpisodeProgress,
            markEpisodesWatched: markEpisodesWatched,
            renderHistoryProgress: renderHistoryProgress,
            refreshVisiblePlaybackProgress: refreshVisiblePlaybackProgress,
            updatePlaybackProgress: updatePlaybackProgress,
            syncPlaybackHistoryManually: syncPlaybackHistoryManually,
            syncHistoryAfterSignIn: syncHistoryAfterSignIn,
            bindHistoryCardRender: bindHistoryCardRender
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.PlaybackHistory = window.LampaYaniPlaybackHistory = {
        create: create
    };
}(window));
