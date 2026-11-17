(function (window) {
    'use strict';

    /*
     * Brings progress from Lampa's own timeline into the YummyAnime history.
     *
     * Other online sources (and torrents) watched through Lampa record their
     * position in Lampa.Timeline, keyed by a hash of season, episode and the
     * card's original title. When such a card is an anime that YummyAnime also
     * has, the episodes found there are copied into the extension's history
     * (Continue Watching, title progress) and, with progress sync on, sent to
     * the YummyAnime account.
     *
     * Only the first TMDB season is read: YummyAnime keeps every season as a
     * separate title, and a native series card is matched to its first one.
     */

    var SCAN_DELAY = 20000;
    var SCAN_PAUSE = 1500;
    var SCAN_LIMIT = 15;
    var PROBE_MIN = 24;
    var PROBE_MAX = 300;
    var MIN_POSITION = 30;
    var SCAN_KEY = 'yani_lampa_timeline_scan';
    var IMPORTED_KEY = 'yani_lampa_timeline_imported';
    var STORE_LIMIT = 500;

    function create(deps) {
        deps = deps || {};
        var findYummyMatches = deps.findYummyMatches || function () { return Promise.resolve([]); };
        var isNativeAnimeCard = deps.isNativeAnimeCard || function () { return false; };
        var loadVideos = deps.loadVideos || function () { return Promise.resolve([]); };
        var importExternalProgress = deps.importExternalProgress || function () { return {imported: 0}; };
        var getPlayback = deps.getPlayback || function () { return null; };
        var autoProgressSyncEnabled = deps.autoProgressSyncEnabled || function () { return false; };
        var wait = deps.wait || function (ms) {
            return new Promise(function (resolve) { setTimeout(resolve, ms); });
        };
        var started = false;
        var running = {};

        function enabled() {
            if (!window.Lampa || !Lampa.Storage) return false;
            return Lampa.Storage.field ? Lampa.Storage.field('yani_lampa_timeline_import') !== false
                : Lampa.Storage.get('yani_lampa_timeline_import', true) !== false;
        }

        function timeline() {
            return window.Lampa && Lampa.Timeline && Lampa.Timeline.view ? Lampa.Timeline : null;
        }

        function hash(value) {
            return window.Lampa && Lampa.Utils && Lampa.Utils.hash ? Lampa.Utils.hash(value) : '';
        }

        function link(movie, season, episode) {
            var api = timeline();
            if (!api || !api.link) return undefined;
            try { return api.link(movie, season, episode) || undefined; } catch (error) { return undefined; }
        }

        function originalTitles(movie) {
            var titles = [];
            [movie.original_name, movie.original_title].forEach(function (title) {
                if (title && titles.indexOf(title) < 0) titles.push(title);
            });
            return titles;
        }

        function isSeries(movie) {
            return Boolean(movie && (movie.original_name || movie.number_of_seasons));
        }

        // The best of the records found under every title spelling. Online
        // sources hash either the original name or the original title, so a
        // series card can carry its progress under either one.
        function bestRoad(roads) {
            var best = null;
            roads.forEach(function (road) {
                if (!road || !(Number(road.percent) > 0 || Number(road.time) > 0)) return;
                if (!best || Number(road.updated || 0) > Number(best.updated || 0) ||
                    Number(road.updated || 0) === Number(best.updated || 0) && Number(road.time || 0) > Number(best.time || 0)) {
                    best = road;
                }
            });
            return best;
        }

        function readEpisode(movie, episode) {
            var api = timeline();
            if (!api) return null;
            var meta = link(movie, 1, episode);
            return bestRoad(originalTitles(movie).map(function (title) {
                var value = hash([1, '', episode, title].join(''));
                return value === '' ? null : api.view(value, meta);
            }));
        }

        function readMovie(movie) {
            var api = timeline();
            if (!api) return null;
            var meta = link(movie);
            return bestRoad(originalTitles(movie).map(function (title) {
                var value = hash(title);
                return value === '' ? null : api.view(value, meta);
            }));
        }

        function probeLimit(movie) {
            var count = Number(movie && movie.number_of_episodes || 0);
            return Math.min(PROBE_MAX, Math.max(PROBE_MIN, isFinite(count) ? count : 0));
        }

        // Every episode Lampa has a position for, as {episode: road}.
        function lampaProgress(movie) {
            var found = {};
            if (!isSeries(movie)) {
                var road = readMovie(movie);
                if (road) found[1] = road;
                return found;
            }
            var last = probeLimit(movie);
            for (var episode = 1; episode <= last; episode++) {
                var value = readEpisode(movie, episode);
                if (value) found[episode] = value;
            }
            return found;
        }

        function signature(progress) {
            return Object.keys(progress).map(function (episode) {
                var road = progress[episode];
                return episode + ':' + Math.round(Number(road.time || 0)) + ':' + Number(road.percent || 0);
            }).join(',');
        }

        function cardKey(movie) {
            return [movie.source || 'tmdb', isSeries(movie) ? 'tv' : 'movie', movie.id || movie.original_name || movie.original_title || ''].join('_');
        }

        function readStore(key) {
            var value = Lampa.Storage.get(key, {});
            return value && typeof value === 'object' ? value : {};
        }

        function writeStore(key, value) {
            var keys = Object.keys(value);
            if (keys.length > STORE_LIMIT) {
                keys.sort(function (a, b) { return Number(value[a].at || 0) - Number(value[b].at || 0); });
                keys.slice(0, keys.length - STORE_LIMIT).forEach(function (item) { delete value[item]; });
            }
            Lampa.Storage.set(key, value);
        }

        function positive(value) {
            var number = Number(value);
            return isFinite(number) && number > 0 ? number : 0;
        }

        // A position Lampa recorded, as seconds against a duration. Old
        // records may carry only a percentage.
        function toEntry(road, video) {
            var duration = positive(road.duration) || positive(video.duration);
            var time = positive(road.time);
            if (!time && positive(road.percent) && duration) time = duration * Number(road.percent) / 100;
            if (!time && Number(road.percent) >= 90) {
                duration = duration || 24 * 60;
                time = duration * Number(road.percent) / 100;
            }
            if (time < MIN_POSITION) return null;
            if (duration && time > duration) time = duration;
            return {video: video, time: Math.floor(time), duration: Math.floor(duration), updated_at: positive(road.updated)};
        }

        function videoDubbing(video) {
            var data = window.LampaYaniUiUtils && LampaYaniUiUtils.videoData ? LampaYaniUiUtils.videoData(video) : {};
            return String(data && data.dubbing || '');
        }

        // One YummyAnime video per episode number: the dubbing this device
        // already watches the title with, otherwise the first one with an id.
        function videosByEpisode(videos, voice) {
            var result = {};
            (videos || []).forEach(function (video) {
                var number = window.LampaYaniEpisode.number(window.LampaYaniEpisode.valueOf(video));
                if (!(number > 0) || Math.floor(number) !== number) return;
                var current = result[number];
                var id = video && (video.video_id || video.id);
                if (!current) { result[number] = video; return; }
                var currentId = current.video_id || current.id;
                if (voice && videoDubbing(video) === voice && videoDubbing(current) !== voice) result[number] = video;
                else if (!currentId && id) result[number] = video;
            });
            return result;
        }

        function collectEntries(movie, progress, videos, previous) {
            var byEpisode = videosByEpisode(videos, previous && previous.voice);
            var numbers = Object.keys(byEpisode).map(Number).sort(function (a, b) { return a - b; });
            var entries = [];
            if (!isSeries(movie)) {
                // A film maps onto a title with a single episode only.
                if (numbers.length !== 1 || !progress[1]) return entries;
                var single = toEntry(progress[1], byEpisode[numbers[0]]);
                if (single) entries.push(single);
                return entries;
            }
            Object.keys(progress).forEach(function (episode) {
                var video = byEpisode[Number(episode)];
                if (!video) return;
                var entry = toEntry(progress[episode], video);
                if (entry) entries.push(entry);
            });
            return entries;
        }

        function stamp(entry) {
            return entry.time + ':' + entry.updated_at;
        }

        function sendToAccount(entries) {
            var watches = entries.map(function (entry) {
                var id = Number(entry.video.video_id || entry.video.id || 0);
                return id > 0 ? {
                    video_id: id,
                    time: entry.time,
                    date: Math.floor((entry.updated_at || Date.now()) / 1000)
                } : null;
            }).filter(Boolean);
            if (!watches.length || !autoProgressSyncEnabled() || !window.LampaYaniAuth || !LampaYaniAuth.token() ||
                !window.LampaYaniApi || !LampaYaniApi.syncVideoWatches) {
                return Promise.resolve(false);
            }
            return LampaYaniApi.syncVideoWatches(watches).then(function () { return true; });
        }

        function importTitle(movie, anime, progress) {
            var id = String(anime && anime.yani_id || '');
            if (!id) return Promise.resolve({imported: 0});
            var highest = Object.keys(progress).reduce(function (max, episode) { return Math.max(max, Number(episode)); }, 0);
            return Promise.resolve(loadVideos(anime.yani_id)).then(function (videos) {
                var entries = collectEntries(movie, progress, videos, getPlayback(anime.yani_id));
                var imported = readStore(IMPORTED_KEY);
                var fresh = entries.filter(function (entry) {
                    var key = id + ':' + window.LampaYaniEpisode.valueOf(entry.video);
                    return !imported[key] || imported[key].stamp !== stamp(entry);
                });
                if (!fresh.length) return {imported: 0};
                var result = importExternalProgress(anime, fresh) || {imported: 0};
                function remember() {
                    var store = readStore(IMPORTED_KEY);
                    fresh.forEach(function (entry) {
                        store[id + ':' + window.LampaYaniEpisode.valueOf(entry.video)] = {stamp: stamp(entry), at: Date.now()};
                    });
                    writeStore(IMPORTED_KEY, store);
                }
                return sendToAccount(fresh).then(function (sent) {
                    remember();
                    console.log('[YummyAnime] Imported ' + fresh.length + ' episode(s) watched outside the extension', {
                        anime: id,
                        title: anime.title || '',
                        highest: highest,
                        sent: sent
                    });
                    return {imported: result.imported || 0, sent: sent};
                }, function (error) {
                    // Kept locally; the account gets it on the next attempt
                    // because nothing is marked as imported yet.
                    console.warn('[YummyAnime] Could not send progress watched outside the extension', error);
                    return {imported: result.imported || 0, sent: false};
                });
            });
        }

        // Matches one native Lampa card and imports what Lampa recorded for it.
        function importCard(movie, options) {
            options = options || {};
            if (!enabled() || !timeline() || !movie) return Promise.resolve({imported: 0});
            if (!movie.yani_card && !isNativeAnimeCard(movie)) return Promise.resolve({imported: 0});
            var key = cardKey(movie);
            if (running[key]) return running[key];
            var progress = lampaProgress(movie);
            var sign = signature(progress);
            if (!sign) return Promise.resolve({imported: 0});
            var scans = readStore(SCAN_KEY);
            if (!options.force && scans[key] && scans[key].sign === sign) return Promise.resolve({imported: 0, unchanged: true});
            var request = movie.yani_card ? Promise.resolve([movie.yani_card]) : findYummyMatches(movie);
            running[key] = request.then(function (matches) {
                // Equal candidates would put progress on a guess.
                if (!matches || matches.length !== 1 || !matches[0] || !matches[0].yani_id) return {imported: 0, unmatched: true};
                return importTitle(movie, matches[0], progress);
            }).then(function (result) {
                var store = readStore(SCAN_KEY);
                store[key] = {sign: sign, at: Date.now()};
                writeStore(SCAN_KEY, store);
                delete running[key];
                return result;
            }, function (error) {
                delete running[key];
                console.warn('[YummyAnime] Lampa progress import failed', error);
                return {imported: 0, failed: true};
            });
            return running[key];
        }

        function historyCards() {
            var favorite = window.Lampa && Lampa.Favorite;
            if (!favorite || !favorite.get) return [];
            var cards;
            try { cards = favorite.get({type: 'history'}); } catch (error) { cards = []; }
            return (Array.isArray(cards) ? cards : []).filter(function (card) {
                return card && (card.yani_card || isNativeAnimeCard(card));
            });
        }

        // Walks the recent Lampa history one card at a time; cards whose
        // timeline did not change since the last walk cost no request.
        function scanHistory() {
            if (!enabled() || !timeline()) return Promise.resolve({imported: 0});
            var cards = historyCards().filter(function (card) {
                return signature(lampaProgress(card)) !== '';
            }).slice(0, SCAN_LIMIT);
            var total = 0;
            return cards.reduce(function (chain, card) {
                return chain.then(function () {
                    return importCard(card).then(function (result) {
                        total += result && result.imported || 0;
                        return result && result.unchanged ? null : wait(SCAN_PAUSE);
                    });
                });
            }, Promise.resolve()).then(function () {
                return {imported: total, cards: cards.length};
            });
        }

        function start() {
            if (started || !window.Lampa) return;
            started = true;
            if (Lampa.Listener && Lampa.Listener.follow) {
                Lampa.Listener.follow('full', function (event) {
                    if (!event || event.type !== 'complite') return;
                    var movie = event.data && event.data.movie ? event.data.movie : event.object && event.object.card_data;
                    if (movie) setTimeout(function () { importCard(movie); }, 1500);
                });
            }
            setTimeout(function () { scanHistory(); }, SCAN_DELAY);
        }

        return {
            start: start,
            scanHistory: scanHistory,
            importCard: importCard,
            lampaProgress: lampaProgress,
            collectEntries: collectEntries
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.LampaTimelineImport = window.LampaYaniLampaTimelineImport = {
        create: create
    };
}(window));
