(function (window) {
    'use strict';

    function historyPayloadItems(payload) {
        var value = payload && payload.response !== undefined ? payload.response : payload;
        if (Array.isArray(value)) return value;
        return value && (value.items || value.data || value.history || value.watches) || [];
    }

    function historyTimestamp(value) {
        if (!value) return 0;
        if (typeof value === 'string' && !/^\d+$/.test(value)) return Date.parse(value) || 0;
        var number = Number(value) || 0;
        return number > 0 && number < 100000000000 ? number * 1000 : number;
    }

    function historyPoster(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.fullsize || value.original || value.huge || value.mega || value.big || value.medium || value.small || value.url || '';
    }

    function historyScreenshot(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        var sizes = value.sizes || value.images || {};
        return value.full || value.url || sizes.full || sizes.big || sizes.medium || sizes.small || '';
    }

    function normalizeRemoteHistory(payload) {
        return historyPayloadItems(payload).map(function (item) {
            item = item || {};
            var screenshot = item.screenshot || {};
            var anime = item.anime && typeof item.anime === 'object' ? item.anime : {};
            var watched = item.watched && typeof item.watched === 'object' ? item.watched : {};
            var animeId = item.anime_id || item.animeId || anime.anime_id || anime.id;
            var explicitEpisode = item.episode || screenshot.episode || item.number || watched.episode || '';
            var episode = explicitEpisode || item.ep_title || '';
            if (!animeId) return null;
            return {
                anime_id: animeId,
                video_id: item.video_id || item.videoId || item.video && item.video.id || '',
                number: window.LampaYaniEpisode.normalize(episode),
                episode_title: item.episode_title || screenshot.title || (explicitEpisode ? item.ep_title : '') || '',
                title: item.title || item.anime_title || anime.title || '',
                poster: historyPoster(item.poster) || historyPoster(screenshot.poster) || historyPoster(anime.poster) || historyPoster(screenshot),
                screenshot: historyScreenshot(item.screenshot_url || screenshot),
                player: String(item.player_title || item.player || ''),
                voice: String(item.dub_title || item.dubbing || ''),
                time: Math.max(0, Number(item.end_time || item.time || watched.end_time || watched.time || item.current_time || 0)),
                duration: Math.max(0, Number(item.duration || watched.duration || 0)),
                updated_at: historyTimestamp(item.date || item.updated_at || item.created_at || watched.updated_at || watched.date),
                remote: true
            };
        }).filter(Boolean);
    }

    function normalizeLocalHistory(saved) {
        return Object.keys(saved || {}).map(function (id) {
            var item = saved[id] || {};
            return {
                anime_id: item.anime_id || id,
                video_id: item.video_id || '',
                number: window.LampaYaniEpisode.normalize(item.number || item.episode || ''),
                episode_title: item.episode_title || '',
                title: item.title || item.card && item.card.title || '',
                poster: historyPoster(item.poster || item.card && item.card.poster),
                screenshot: historyScreenshot(item.screenshot || item.screenshot_url),
                player: String(item.player || ''),
                voice: String(item.voice || ''),
                time: Math.max(0, Number(item.time || 0)),
                duration: Math.max(0, Number(item.duration || 0)),
                max_episode: Math.max(0, Number(item.max_episode || 0)),
                episodes_aired: Math.max(0, Number(item.episodes_aired || 0)),
                updated_at: historyTimestamp(item.updated_at),
                card: item.card || null,
                remote: false
            };
        });
    }

    function historyEntryKey(entry) {
        if (entry.video_id) return 'video:' + String(entry.video_id);
        return 'anime:' + String(entry.anime_id) + ':episode:' + window.LampaYaniEpisode.key(entry.number);
    }

    function mergeHistory(localSaved, remoteEntries) {
        var merged = {};
        normalizeLocalHistory(localSaved).concat(remoteEntries || []).forEach(function (entry) {
            var key = historyEntryKey(entry);
            var current = merged[key];
            if (!current) {
                merged[key] = entry;
                return;
            }
            var newer = Number(entry.updated_at || 0) >= Number(current.updated_at || 0) ? entry : current;
            var older = newer === entry ? current : entry;
            merged[key] = Object.assign({}, older, newer, {
                time: Number(newer.time || older.time || 0),
                duration: Number(newer.duration || older.duration || 0),
                // Reach and episode count are facts about the title, not about
                // one record of it, so the better-informed side always wins.
                max_episode: Math.max(Number(newer.max_episode || 0), Number(older.max_episode || 0)),
                episodes_aired: Math.max(Number(newer.episodes_aired || 0), Number(older.episodes_aired || 0)),
                title: newer.title || older.title || '',
                poster: newer.poster || older.poster || '',
                screenshot: newer.screenshot || older.screenshot || '',
                card: newer.card || older.card || null
            });
        });
        return Object.keys(merged).map(function (key) { return merged[key]; }).sort(function (a, b) {
            return Number(b.updated_at || 0) - Number(a.updated_at || 0);
        });
    }

    function hasResumeTarget(entry) {
        return Boolean(entry && (entry.video_id || entry.number) && (entry.anime_id || entry.animeId));
    }

    // One shared definition of "watched" for the whole plugin, see ui-utils.
    function isFinishedEpisode(entry) {
        var utils = window.LampaYaniUiUtils;
        if (utils && utils.isEpisodeFinished) {
            return utils.isEpisodeFinished(entry && entry.time, entry && entry.duration, entry);
        }
        var position = Math.max(0, Number(entry && entry.time || 0));
        var duration = Math.max(0, Number(entry && entry.duration || 0));
        return duration > 0 && position / duration >= 0.95;
    }

    function isContinueEntry(entry) {
        return hasResumeTarget(entry) && !isFinishedEpisode(entry);
    }

    function latestEntriesByAnime(entries, accept) {
        var latest = {};
        (entries || []).forEach(function (entry) {
            if (accept && !accept(entry)) return;
            if (!hasResumeTarget(entry)) return;
            var key = String(entry.anime_id || entry.animeId || '');
            if (!key) return;
            var current = latest[key];
            if (!current || Number(entry.updated_at || 0) > Number(current.updated_at || 0)) latest[key] = entry;
        });
        return Object.keys(latest).map(function (key) { return latest[key]; }).sort(function (a, b) {
            return Number(b.updated_at || 0) - Number(a.updated_at || 0);
        });
    }

    function animeKey(entry) {
        return String(entry && (entry.anime_id || entry.animeId) || '');
    }

    function episodeNumber(entry) {
        var number = Number(window.LampaYaniEpisode.normalize(entry && entry.number) || 0);
        return number > 0 ? number : 0;
    }

    /**
     * The furthest episode actually reached per title, across every local and
     * remote record of it. Rewatching an early episode must not drag the queue
     * backwards, so this is a maximum rather than the latest record.
     */
    function maxWatchedEpisodes(entries) {
        var reach = {};
        (entries || []).forEach(function (entry) {
            var key = animeKey(entry);
            if (!key) return;
            // Only a finished episode moves the reach forward. Counting a few
            // seconds of an episode as watched would advance the queue past an
            // episode the viewer never actually saw.
            if (!isFinishedEpisode(entry)) return;
            var number = episodeNumber(entry);
            if (number > (reach[key] || 0)) reach[key] = number;
        });
        return reach;
    }

    // How many episodes each title has released. Like the reach above, this is
    // a fact about the title rather than about one record, so it is collected
    // across every entry: only some of them carry it.
    function episodeCeilings(entries) {
        var ceilings = {};
        (entries || []).forEach(function (entry) {
            var key = animeKey(entry);
            if (!key) return;
            var value = Number(entry.episodes_aired || entry.episodes_total || 0);
            if (isFinite(value) && value > (ceilings[key] || 0)) ceilings[key] = value;
        });
        return ceilings;
    }

    /**
     * A finished episode used to drop its title out of Continue Watching
     * entirely, even though the viewer had simply reached the end of one
     * episode and the next one was waiting. Point the entry at that next
     * episode instead — but only when the title is known to have one, so the
     * queue never offers an episode that has not aired.
     */
    function nextEpisodeEntry(entry, reach, ceilings) {
        var key = animeKey(entry);
        var watched = Math.max(reach[key] || 0, episodeNumber(entry));
        var ceiling = ceilings[key] || 0;
        if (!watched) return null;
        var next = watched + 1;
        // Only a known last episode ends a title. When the episode count is
        // unknown the title stays in the queue pointing at the next episode:
        // offering one that turns out not to exist merely opens the episode
        // list, while dropping the title loses it with no way to notice.
        if (ceiling && next > ceiling) return null;
        return Object.assign({}, entry, {
            number: String(next),
            video_id: '',
            episode_title: '',
            time: 0,
            duration: 0,
            max_episode: watched,
            resume_next: true
        });
    }

    // Why a title is or is not in the queue is impossible to see from the
    // outside: three different filters can remove it. The counts are kept so
    // the section can report them instead of leaving it to guesswork.
    var lastContinueStats = null;

    function continueStats() {
        return lastContinueStats;
    }

    function continueWatchingEntries(entries, excludedAnimeIds, knownCeilings) {
        excludedAnimeIds = excludedAnimeIds || {};
        var reach = maxWatchedEpisodes(entries);
        var ceilings = episodeCeilings(entries);
        // Counts resolved from the title cards win: history entries only carry
        // one if they were written by a recent version of the plugin.
        Object.keys(knownCeilings || {}).forEach(function (key) {
            var value = Number(knownCeilings[key] || 0);
            if (value > 0) ceilings[key] = value;
        });
        function allowed(entry) {
            return !excludedAnimeIds[animeKey(entry)];
        }
        function annotate(entry) {
            var key = animeKey(entry);
            if (!entry || !key) return entry;
            var currentEpisode = episodeNumber(entry);
            var lastWatched = Math.max(reach[key] || 0, Number(entry.time || 0) > 0 ? currentEpisode : 0);
            if (!lastWatched && !reach[key]) return entry;
            return Object.assign({}, entry, {
                max_episode: Math.max(reach[key] || 0, currentEpisode),
                last_watched_episode: lastWatched
            });
        }

        // The queue holds titles, not episodes. Finishing an episode advances a
        // title to the next one; it removes the title only when that episode
        // was the last one released. Anything else would drop a title after
        // episode 5 of 12 simply because episode 5 was watched to the end.
        var titles = latestEntriesByAnime(entries);
        var stats = {
            records: (entries || []).length,
            titles: titles.length,
            excluded: 0,
            finished_title: 0,
            advanced: 0,
            resumed: 0,
            no_target: 0
        };
        (entries || []).forEach(function (entry) { if (!hasResumeTarget(entry)) stats.no_target += 1; });

        var queue = titles.filter(function (entry) {
            if (allowed(entry)) return true;
            stats.excluded += 1;
            return false;
        }).map(function (entry) {
            var annotated = annotate(entry);
            if (!isFinishedEpisode(entry)) {
                stats.resumed += 1;
                return annotated;
            }
            var next = nextEpisodeEntry(annotated, reach, ceilings);
            if (next) stats.advanced += 1;
            else stats.finished_title += 1;
            return next;
        }).filter(Boolean);
        lastContinueStats = stats;
        queue.sort(function (a, b) { return Number(b.updated_at || 0) - Number(a.updated_at || 0); });
        if (queue.length) return queue;
        // The dashboard advertises the last watched title. Keep that title in
        // the queue when the completed-list filter would otherwise leave
        // Continue Watching empty — but never resurrect a title whose last
        // released episode is already watched: there is nothing to continue.
        return latestEntriesByAnime(entries).slice(0, 1).filter(function (entry) {
            if (!isFinishedEpisode(entry)) return true;
            var key = animeKey(entry);
            var ceiling = ceilings[key] || 0;
            return !ceiling || Math.max(reach[key] || 0, episodeNumber(entry)) + 1 <= ceiling;
        }).map(annotate);
    }

    function hasClockTimestamp(value) {
        return Number(value || 0) >= 1000000000;
    }

    function shouldReplaceLocal(current, entry) {
        if (!current) return true;
        var remoteAt = Number(entry && entry.updated_at || 0);
        var localAt = Number(current.updated_at || 0);
        if (hasClockTimestamp(remoteAt) && hasClockTimestamp(localAt)) {
            if (remoteAt > localAt) return true;
            return remoteAt === localAt && Number(entry.time || 0) > Number(current.time || 0);
        }
        var remoteEpisode = Number(entry && entry.number || 0);
        var localEpisode = Number(current.number || 0);
        if (remoteEpisode > localEpisode) return true;
        return remoteEpisode === localEpisode && Number(entry && entry.time || 0) > Number(current.time || 0);
    }

    function importRemoteIntoLocal(localSaved, remoteEntries) {
        var history = {};
        Object.keys(localSaved || {}).forEach(function (id) { history[id] = localSaved[id]; });
        var latest = {};
        (remoteEntries || []).forEach(function (entry) {
            var id = String(entry && entry.anime_id || '');
            if (!id) return;
            if (!latest[id] || Number(entry.updated_at || 0) > Number(latest[id].updated_at || 0)) latest[id] = entry;
        });
        var imported = 0;
        Object.keys(latest).forEach(function (id) {
            var entry = latest[id];
            var current = history[id];
            if (!shouldReplaceLocal(current, entry)) return;
            history[id] = {
                number: window.LampaYaniEpisode.normalize(entry.number || current && current.number || ''),
                video_id: entry.video_id || current && current.video_id || '',
                time: Number(entry.time || 0),
                duration: Math.max(0, Number(entry.duration || current && current.duration || 0)),
                player: String(entry.player || current && current.player || '').toLowerCase(),
                voice: String(entry.voice || current && current.voice || ''),
                episode_url: current && current.episode_url || '',
                title: entry.title || current && current.title || '',
                poster: entry.poster || current && current.poster || '',
                card: current && current.card || {
                    title: entry.title || '',
                    poster: entry.poster || '',
                    anime_id: entry.anime_id
                },
                updated_at: Number(entry.updated_at || Date.now()),
                remote: true
            };
            imported += 1;
        });
        return {history: history, imported: imported};
    }

    function attachHistoryEntry(card, entry) {
        card.yani_id = card.yani_id || Number(entry.anime_id) || entry.anime_id;
        card.yani_resume = {
            number: window.LampaYaniEpisode.normalize(entry.number),
            video_id: entry.video_id || '',
            time: Number(entry.time || 0),
            duration: Number(entry.duration || 0),
            player: entry.player || '',
            voice: entry.voice || '',
            updated_at: Number(entry.updated_at || 0)
        };
        card.yani_resume.max_episode = Math.max(0, Number(entry.max_episode || 0));
        card.yani_resume.last_watched_episode = Math.max(0, Number(entry.last_watched_episode || 0));
        card.yani_resume.resume_next = Boolean(entry.resume_next);
        card.yani_history_entry = entry;
        return card;
    }

    function historyCard(entry, deps, enrich, loadDetail) {
        var source = Object.assign({}, entry.card || {}, {
            anime_id: entry.anime_id,
            title: entry.title || entry.card && entry.card.title || deps.t('untitled'),
            poster: entry.poster || entry.card && entry.card.poster || ''
        });
        var fallback = attachHistoryEntry(deps.toCard(source), entry);
        if (!enrich && entry.title && fallback.poster) return Promise.resolve(fallback);
        if (!loadDetail) return Promise.resolve(fallback);
        return loadDetail(entry.anime_id).then(function (payload) {
            var value = payload && payload.response ? payload.response : payload;
            return value ? attachHistoryEntry(deps.toCard(Object.assign({}, source, value)), entry) : fallback;
        }).catch(function () { return fallback; });
    }

    function history(object, deps) {
        var comp = new Lampa.InteractionCategory(object);
        var continueMode = object.mode === 'continue';
        var limit = continueMode ? 300 : 30;
        var offset = 0;
        var hasMore = false;
        var seen = {};
        object.page = 1;

        var detailRequests = {};

        function loadDetail(id) {
            var key = String(id || '');
            if (!key || !deps.detail) return Promise.resolve(null);
            if (!detailRequests[key]) detailRequests[key] = deps.detail(id);
            return detailRequests[key];
        }

        function uniqueEntries(entries) {
            return entries.filter(function (entry) {
                var key = historyEntryKey(entry);
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
        }

        function loadRemotePage() {
            if (!deps.authorized()) return Promise.resolve({entries: [], count: 0});
            return deps.fetchRemote(limit, offset).then(function (payload) {
                var raw = historyPayloadItems(payload);
                offset += raw.length;
                return {entries: normalizeRemoteHistory(payload), count: raw.length};
            });
        }

        function cardsFor(entries) {
            var mapper = function (entry) { return historyCard(entry, deps, continueMode, loadDetail); };
            if (continueMode && window.LampaYaniCardRails && window.LampaYaniCardRails.mapLimit) {
                return window.LampaYaniCardRails.mapLimit(entries, 3, mapper);
            }
            return Promise.all(entries.map(mapper));
        }

        // A queue shorter than the history it was built from is the expected
        // outcome, but from the outside it looks like records went missing.
        // Console only: this is for whoever is debugging the queue, not
        // something to put on a viewer's screen.
        function reportContinueStats(page) {
            var stats = continueStats();
            if (!stats) return;
            console.log('[YummyAnime Continue] remote=' + ((page && page.entries && page.entries.length) || 0) +
                ' records=' + stats.records +
                ' titles=' + stats.titles +
                ' queued=' + (stats.resumed + stats.advanced) +
                ' (resumed=' + stats.resumed + ' advanced=' + stats.advanced + ')' +
                ' completed=' + stats.finished_title);
        }

        /**
         * How many episodes each finished title has released, asked of the title
         * itself. Without this the queue only knows a count for titles opened
         * since the count started being stored, which is almost none of them —
         * and an unknown count is what decides between "offer episode 6" and
         * "this title is over".
         */
        function resolveCeilings(entries) {
            if (!continueMode || !deps.detail) return Promise.resolve({});
            var wanted = {};
            (entries || []).forEach(function (entry) {
                if (!isFinishedEpisode(entry)) return;
                var key = String(entry.anime_id || entry.animeId || '');
                if (key) wanted[key] = true;
            });
            var ids = Object.keys(wanted);
            if (!ids.length) return Promise.resolve({});
            return Promise.all(ids.map(function (id) {
                return loadDetail(id).then(function (payload) {
                    var value = payload && payload.response ? payload.response : payload;
                    var episodes = value && (value.episodes || {}) || {};
                    var count = Number(episodes.aired || episodes.released || episodes.count || episodes.total || 0);
                    return {id: id, count: count > 0 ? count : 0};
                }).catch(function () { return {id: id, count: 0}; });
            })).then(function (results) {
                var ceilings = {};
                results.forEach(function (result) { if (result.count) ceilings[result.id] = result.count; });
                return ceilings;
            });
        }

        comp.create = function () {
            var self = this;
            var local = deps.history();
            this.activity.loader(true);
            var remote = loadRemotePage().catch(function (error) {
                console.warn('[YummyAnime History] Server history is unavailable', error);
                return {entries: [], count: 0, failed: true};
            });
            Promise.resolve(remote).then(function (page) {
                hasMore = !continueMode && deps.authorized() && !page.failed && page.count >= limit;
                if (page.entries && page.entries.length && deps.importRemote) deps.importRemote(page.entries);
                var entries = mergeHistory(deps.history() || local, page.entries);
                if (!continueMode) return cardsFor(uniqueEntries(entries));
                return resolveCeilings(entries).then(function (ceilings) {
                    var queue = continueWatchingEntries(entries, {}, ceilings);
                    reportContinueStats(page);
                    return cardsFor(uniqueEntries(queue));
                });
            }).then(function (cards) {
                var totalPages = hasMore ? 2 : 1;
                self.build({results: cards.filter(Boolean), total_pages: totalPages, title: deps.t(continueMode ? 'continue_watching' : 'watch_history')});
                if (!cards.length) Lampa.Noty.show(deps.t('history_empty'));
            }).catch(function (error) {
                console.error('[YummyAnime History]', error);
                self.activity.loader(false);
                Lampa.Noty.show(deps.t('history_load_error'));
            });
        };

        comp.nextPageReuest = function (requestObject, resolve, reject) {
            if (!hasMore) {
                resolve({results: [], total_pages: requestObject.page, title: deps.t('watch_history')});
                return;
            }
            loadRemotePage().then(function (page) {
                hasMore = page.count >= limit;
                if (page.entries && page.entries.length && deps.importRemote) deps.importRemote(page.entries);
                return cardsFor(uniqueEntries(page.entries));
            }).then(function (cards) {
                resolve({
                    results: cards.filter(Boolean),
                    total_pages: hasMore ? requestObject.page + 1 : requestObject.page,
                    title: deps.t(continueMode ? 'continue_watching' : 'watch_history')
                });
            }).catch(function (error) {
                requestObject.page = Math.max(1, requestObject.page - 1);
                console.error('[YummyAnime History]', error);
                Lampa.Noty.show(deps.t('next_page_error'));
                reject(error);
            });
        };
        comp.nextPageRequest = comp.nextPageReuest;
        comp.cardRender = deps.historyCardRender;
        return comp;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.HomeSections = window.LampaYaniHomeSections = {
        history: history,
        normalizeRemoteHistory: normalizeRemoteHistory,
        normalizeLocalHistory: normalizeLocalHistory,
        mergeHistory: mergeHistory,
        historyEntryKey: historyEntryKey,
        isContinueEntry: isContinueEntry,
        continueWatchingEntries: continueWatchingEntries,
        continueStats: continueStats,
        importRemoteIntoLocal: importRemoteIntoLocal,
        shouldReplaceLocal: shouldReplaceLocal
    };
}(window));
