(function (window) {
    'use strict';

    // Native Lampa card resolve (Yummy -> TMDB), reverse match (TMDB -> Yummy),
    // and full-detail rating/button decoration. Detail Activity push stays in ui.js.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var getYummyId = deps.getYummyId || function () { return null; };
        var hasYummyCardData = deps.hasYummyCardData || function () { return false; };
        var openYummyDetail = deps.openYummyDetail || function () {};
        var toCard = deps.toCard || function (item) { return item; };
        var formatRating = deps.formatRating || function (value) { return String(value || ''); };

        function openStandardLampaCard(card) {
            // Resolve a real TMDB card before opening Lampa's native detail page.
            // Never call `full` with an absent id: some Lampa builds then request
            // `/movie/undefined` forever.  A YummyAnime detail remains a useful
            // fallback when TMDB has no equivalent title.
            var settled = false;
            if (Lampa.Loading && Lampa.Loading.start) Lampa.Loading.start();

            function finish(match) {
                if (settled) return;
                settled = true;
                if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();

                if (!match || !match.card || !isValidNativeId(match.card.id) || !match.method) {
                    openYummyDetail(card, true);
                    return;
                }

                var nativeCard = match.card;
                nativeCard.source = nativeCard.source || 'tmdb';
                nativeCard.yani_card = card;
                Lampa.Activity.push({
                    url: nativeCard.url || '',
                    component: 'full',
                    id: nativeCard.id,
                    method: match.method,
                    card: nativeCard,
                    source: nativeCard.source
                });
            }

            // Do not leave the UI blocked if a third-party TMDB proxy silently
            // drops a request. The normal request callbacks still win when they
            // finish in time.
            setTimeout(function () { finish(null); }, 20000);
            enrichCardForStandardSearch(card).then(findStandardLampaCard).then(finish).catch(function (error) {
                console.warn('[YummyAnime] Native Lampa card lookup failed', error);
                finish(null);
            });
        }

        function enrichCardForStandardSearch(card) {
            // Catalog responses deliberately stay small.  The detail response
            // contains `other_titles`, including romanised and Japanese names,
            // which TMDB indexes more reliably than a single localised title.
            var id = getYummyId(card);
            if (!id || !LampaYaniApi || !LampaYaniApi.detail) return Promise.resolve(card);

            return LampaYaniApi.detail(id).then(function (payload) {
                var item = payload && payload.response ? payload.response : payload;
                if (!item || typeof item !== 'object') return card;

                var detailed = toCard(item);
                var titles = (card.yani_titles || []).concat(detailed.yani_titles || []);
                card.yani_titles = titles.filter(function (title, index, list) {
                    return title && list.indexOf(title) === index;
                });
                card.yani_remote_ids = Object.assign({}, card.yani_remote_ids || {}, detailed.yani_remote_ids || {});
                if (!card.original_title || card.original_title === card.title) card.original_title = detailed.original_title || card.original_title;
                if (!card.release_date) card.release_date = detailed.release_date || '';
                return card;
            }).catch(function (error) {
                // A temporary YummyAnime detail failure must not prevent the
                // existing list-card title from being looked up in Lampa.
                console.warn('[YummyAnime] Could not enrich title aliases', error);
                return card;
            });
        }

        function installUndefinedTmdbGuard() {
            if (!Lampa.Activity || !Lampa.Activity.push || Lampa.Activity.push._yaniUndefinedTmdbGuard) return;

            var originalPush = Lampa.Activity.push;
            function guardedPush(activity) {
                var card = activity && (activity.card || activity.object || activity.data);
                var missingId = !activity || activity.id === undefined || activity.id === null || activity.id === '' || activity.id === 'undefined';
                var isNativeDetail = activity && activity.component === 'full';
                var isYummyCard = card && (card._yani_card || hasYummyCardData(card));

                // A native Lampa detail page cannot open an anime without a TMDB
                // id.  Redirect only our marked cards, leaving all normal Lampa
                // activity navigation untouched.
                if (isNativeDetail && missingId) {
                    if (card && (card.yani_genre_tile || card.yani_genre || card.yani_collection_tile || card.yani_collection_id || card.yani_collection)) {
                        console.warn('[YummyAnime] Blocked native TMDB detail for genre/collection tile');
                        return;
                    }
                    if (isYummyCard) {
                        var yaniId = getYummyId(card);
                        if (yaniId) {
                            console.warn('[YummyAnime] Blocked native TMDB detail with undefined id', yaniId);
                            return originalPush.call(this, {
                                url: 'yani/detail/' + encodeURIComponent(yaniId),
                                title: card.title || card.name || 'YummyAnime',
                                component: 'yani_detail',
                                id: yaniId,
                                yani_id: yaniId,
                                card: card
                            });
                        }
                    }
                }
                return originalPush.apply(this, arguments);
            }

            guardedPush._yaniUndefinedTmdbGuard = true;
            guardedPush._yaniOriginalPush = originalPush;
            Lampa.Activity.push = guardedPush;
        }

            var standardNativeCacheStorageKey = 'yani_standard_native_matches_v3';
        var standardNativeCacheLimit = 60;
        var standardNativePositiveTtl = 30 * 24 * 60 * 60 * 1000;
        var standardNativeCache = null;
        var standardNativePending = {};

        function standardNativeLookupKey(card) {
            var id = getYummyId(card);
            if (id) return 'id:' + String(id);
            var title = LampaYaniUiUtils.standardSearchTitles(card)[0] || '';
            var year = String(card && (card.release_date || card.first_air_date || card.year) || '').slice(0, 4);
            return 'title:' + LampaYaniUiUtils.normalizeMatchTitle(title) + '|' + year;
        }

        function loadStandardNativeCache() {
            if (standardNativeCache) return standardNativeCache;
            standardNativeCache = {};
            if (!Lampa.Storage || !Lampa.Storage.get) return standardNativeCache;
            try {
                var stored = JSON.parse(Lampa.Storage.get(standardNativeCacheStorageKey, '{}'));
                if (stored && typeof stored === 'object' && !Array.isArray(stored)) standardNativeCache = stored;
            } catch (error) {
                console.warn('[YummyAnime] Could not read native card cache', error);
            }
            return standardNativeCache;
        }

        function saveStandardNativeCache() {
            if (!Lampa.Storage || !Lampa.Storage.set) return;
            var cache = loadStandardNativeCache();
            var keys = Object.keys(cache).sort(function (a, b) {
                return Number(cache[b] && cache[b].updated || 0) - Number(cache[a] && cache[a].updated || 0);
            });
            keys.slice(standardNativeCacheLimit).forEach(function (key) { delete cache[key]; });
            try { Lampa.Storage.set(standardNativeCacheStorageKey, JSON.stringify(cache)); } catch (error) {
                console.warn('[YummyAnime] Could not save native card cache', error);
            }
        }

        function cachedStandardNativeMatch(key) {
            var cache = loadStandardNativeCache();
            var entry = cache[key];
            if (!entry) return {hit: false, match: null};
            if (Number(entry.expires || 0) <= Date.now()) {
                delete cache[key];
                saveStandardNativeCache();
                return {hit: false, match: null};
            }
            if (entry.empty) return {hit: true, match: null};
            if (!entry.match || !entry.match.card || !isValidNativeId(entry.match.card.id) || !entry.match.method) {
                delete cache[key];
                saveStandardNativeCache();
                return {hit: false, match: null};
            }
            return {hit: true, match: entry.match};
        }

        function compactStandardNativeMatch(match) {
            if (!match || !match.card || !isValidNativeId(match.card.id) || !match.method) return null;
            var source = match.card;
            var card = {id: source.id, source: source.source || 'tmdb'};
            ['title', 'name', 'original_title', 'original_name', 'release_date', 'first_air_date', 'poster_path', 'backdrop_path', 'vote_average', 'genre_ids'].forEach(function (key) {
                if (source[key] !== undefined && source[key] !== null) card[key] = source[key];
            });
            return {method: match.method, card: card};
        }

        function rememberStandardNativeMatch(key, match) {
            var compact = compactStandardNativeMatch(match);
            // A miss must not be stored. The title-page button used to cache an
            // empty result after a slow TMDB proxy lookup and then keep saying
            // the Lampa card was missing.
            if (!compact) return null;
            var now = Date.now();
            loadStandardNativeCache()[key] = {
                updated: now,
                expires: now + standardNativePositiveTtl,
                empty: false,
                match: compact
            };
            saveStandardNativeCache();
            return compact;
        }

        function findStandardLampaCard(card) {
            // Use the same public resolver as Lampa's own search screen. Calling
            // individual API endpoints skipped parts of the active TMDB source
            // configuration on some builds, so YummyAnime titles never matched.
            // Online plugins which work with Cub TMDB Proxy use this source. The
            // proxy may decorate it while leaving Lampa.TMDB untouched, so prefer
            // it and retain the public object as a fallback for newer builds.
            var cacheKey = standardNativeLookupKey(card);
            var cached = cachedStandardNativeMatch(cacheKey);
            if (cached.hit) {
                console.info('[YummyAnime] Native TMDB cache hit', {yaniId: getYummyId(card), matched: !!cached.match});
                return Promise.resolve(cached.match);
            }
            if (standardNativePending[cacheKey]) return standardNativePending[cacheKey];

            var tmdb = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb || Lampa.TMDB;
            if (!tmdb || (!tmdb.search && !tmdb.get)) return Promise.resolve(null);
            var titles = LampaYaniUiUtils.standardSearchTitles(card).filter(function (title, index, list) {
                return title && list.indexOf(title) === index;
            });
            console.info('[YummyAnime] Native TMDB resolve started', {yaniId: getYummyId(card), titles: titles});

            function resolveTitles(searchTitles) {
                // Search aliases in small batches. Eight aliases multiplied by
                // movie and TV endpoints created a large simultaneous request
                // burst that could terminate low-memory Android WebViews.
                var titlesToSearch = (searchTitles || []).slice(0, 6);
                var collected = [];
                function next(offset) {
                    if (offset >= titlesToSearch.length) return Promise.resolve(bestStandardCard(collected, card));
                    return Promise.all(titlesToSearch.slice(offset, offset + 2).map(function (title) {
                        return searchTmdbTitle(tmdb, title).catch(function () { return []; });
                    })).then(function (rows) {
                        rows.forEach(function (row) { collected = collected.concat(Array.isArray(row) ? row : []); });
                        var match = bestStandardCard(collected, card);
                        return match || next(offset + 2);
                    });
                }
                return next(0);
            }

            standardNativePending[cacheKey] = resolveTitles(titles).then(function (match) {
                if (match) return match;
                var remoteIds = card.yani_remote_ids || {};
                var malId = remoteIds.myanimelist_id || remoteIds.mal_id;
                if (!malId || !LampaYaniApi.malTitles) return null;
                return LampaYaniApi.malTitles(malId).then(function (malTitles) {
                    var known = card.yani_titles || [];
                    card.yani_titles = known.concat(malTitles || []).filter(function (title, index, list) {
                        return title && list.indexOf(title) === index;
                    });
                    // Retry only newly acquired names. Otherwise a long Yummy
                    // alias list could consume the eight-query budget first.
                    var retryTitles = (malTitles || []).filter(function (title, index, list) {
                        return title && known.indexOf(title) < 0 && list.indexOf(title) === index;
                    });
                    return resolveTitles(retryTitles);
                }).catch(function (error) {
                    console.warn('[YummyAnime] Could not load MyAnimeList title aliases', error);
                    return null;
                });
            }).then(function (match) {
                if (match) {
                    console.info('[YummyAnime] Native TMDB match found', {
                        id: match.card.id,
                        method: match.method,
                        title: match.card.name || match.card.title || '',
                        source: match.card.source || ''
                    });
                } else {
                    console.warn('[YummyAnime] Native TMDB resolver found no matching card', {yaniId: getYummyId(card), titles: titles});
                }
                return rememberStandardNativeMatch(cacheKey, match);
            }).then(function (match) {
                delete standardNativePending[cacheKey];
                return match;
            }, function (error) {
                delete standardNativePending[cacheKey];
                throw error;
            });
            return standardNativePending[cacheKey];
        }

        function searchTmdbTitle(tmdb, title) {
            if (!title) return Promise.resolve([]);
            // Lampa.TMDB.search waits for movie, TV and person requests together.
            // Some proxy configurations fail only the person request and never
            // reach that aggregate callback.  Resolve the two card endpoints
            // directly first, through the same Lampa TMDB client and credentials.
            if (tmdb.get) {
                return searchTmdbCardEndpoints(tmdb, title).then(function (result) {
                    // An empty but successful movie/TV response is authoritative.
                    // Repeating it through aggregate search doubled every miss.
                    return result.usable ? result.items : searchTmdbAggregate(tmdb, title);
                });
            }
            return searchTmdbAggregate(tmdb, title);
        }

        function searchTmdbCardEndpoints(tmdb, title) {
            return new Promise(function (resolve) {
                var pending = 2;
                var completed = false;
                var items = [];
                var responses = 0;
                var timeout = setTimeout(finish, 3000);

                function finish() {
                    if (completed) return;
                    completed = true;
                    clearTimeout(timeout);
                    resolve({items: items, usable: responses > 0});
                }

                function complete() {
                    pending--;
                    if (pending <= 0) finish();
                }

                ['tv', 'movie'].forEach(function (method) {
                    try {
                        tmdb.get('search/' + method, {query: title, page: 1}, function (response) {
                            responses++;
                            var results = response && Array.isArray(response.results) ? response.results : [];
                            results.forEach(function (card) { items.push({card: card, method: method}); });
                            complete();
                        }, complete);
                    } catch (error) {
                        console.warn('[YummyAnime] TMDB ' + method + ' search call failed', error);
                        complete();
                    }
                });
            });
        }

        function searchTmdbAggregate(tmdb, title) {
            return new Promise(function (resolve) {
                var completed = false;
                var timeout = setTimeout(function () { finish([]); }, 6000);

                function finish(items) {
                    if (completed) return;
                    completed = true;
                    clearTimeout(timeout);
                    resolve(items);
                }

                try {
                    tmdb.search({query: title, page: 1}, function (groups) {
                        var items = [];
                        (Array.isArray(groups) ? groups : []).forEach(function (group) {
                            var method = group && group.type;
                            if (method !== 'tv' && method !== 'movie') return;
                            (group.results || []).forEach(function (item) {
                                items.push({card: item, method: method});
                            });
                        });
                        finish(items);
                    });
                } catch (error) {
                    console.warn('[YummyAnime] TMDB search call failed', error);
                    finish([]);
                }
            });
        }

        function isValidNativeId(id) {
            return id !== undefined && id !== null && id !== '' && id !== 'undefined' &&
                String(id).match(/^\d+$/) !== null;
        }

        function bestStandardCard(items, yaniCard) {
            var expectedTitles = LampaYaniUiUtils.standardSearchTitles(yaniCard);
            var expectedYear = String(yaniCard.release_date || '').slice(0, 4);
            items.forEach(function (entry) {
                entry.score = LampaYaniUiUtils.scoreTitleMatch(expectedTitles, expectedYear, entry.card || {});
            });
            items.sort(function (a, b) { return b.score - a.score; });

            var animeMatches = [];
            var exactMatches = [];
            for (var index = 0; index < items.length; index++) {
                var entry = items[index];
                if (!entry || entry.score < 70 || !isValidNativeId(entry.card && entry.card.id)) continue;
                if (!LampaYaniUiUtils.isSafeTmdbSeasonMatch(yaniCard, entry.card)) {
                    console.warn('[YummyAnime] Skipping parent TMDB series for a later YummyAnime season', {
                        yaniId: getYummyId(yaniCard),
                        yaniTitle: yaniCard && yaniCard.title,
                        yaniYear: yaniCard && yaniCard.release_date,
                        tmdbTitle: entry.card.name || entry.card.title || '',
                        tmdbYear: entry.card.first_air_date || entry.card.release_date || ''
                    });
                    continue;
                }
                entry.card.source = entry.card.source || 'tmdb';
                if (LampaYaniUiUtils.isAnimeTmdbCard(entry.card)) animeMatches.push(entry);
                else if (entry.score >= 100) exactMatches.push(entry);
                else {
                    console.warn('[YummyAnime] Skipping non-anime TMDB near-match', {
                        yaniId: getYummyId(yaniCard),
                        yaniTitle: yaniCard && yaniCard.title,
                        tmdbTitle: entry.card.name || entry.card.title || '',
                        score: entry.score
                    });
                }
            }
            // Prefer animation/Japanese titles. Exact non-anime matches remain a
            // last resort for rare one-to-one localizations without genre metadata.
            return animeMatches[0] || exactMatches[0] || null;
        }

        var nativeMatchCache = {};
        var nativeMatchPending = {};
        var nativeMatchOrder = [];

        function nativeMatchKey(movie) {
            return [movie && (movie.source || ''), movie && (movie.id || ''), movie && (movie.title || movie.name || ''), movie && (movie.release_date || movie.first_air_date || '')].join('|').toLowerCase();
        }

        function rememberNativeMatch(key, cards) {
            nativeMatchCache[key] = cards;
            nativeMatchOrder = nativeMatchOrder.filter(function (item) { return item !== key; });
            nativeMatchOrder.push(key);
            while (nativeMatchOrder.length > 50) delete nativeMatchCache[nativeMatchOrder.shift()];
        }

        function findYummyMatches(movie) {
            movie = movie || {};
            var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
            var year = String(movie.release_date || movie.first_air_date || movie.year || '').slice(0, 4);
            if (!title) return Promise.resolve([]);
            var cacheKey = nativeMatchKey(movie);
            if (Object.prototype.hasOwnProperty.call(nativeMatchCache, cacheKey)) return Promise.resolve(nativeMatchCache[cacheKey]);
            if (nativeMatchPending[cacheKey]) return nativeMatchPending[cacheKey];

            var queries = LampaYaniUiUtils.titleValues(movie);
            if (queries.indexOf(title) < 0) queries.unshift(title);
            // Native cards usually expose a localized and an original title. Two
            // queries are enough for matching and avoid an eight-request burst on
            // low-memory TVs whenever Lampa emits the full-card event twice.
            nativeMatchPending[cacheKey] = Promise.all(queries.slice(0, 2).map(function (query) {
                return LampaYaniApi.search(query, {limit: 10}).then(function (payload) {
                    return LampaYaniApi.normalize(payload).map(toCard);
                }).catch(function () { return []; });
            })).then(function (rows) {
                var cardsById = {};
                rows.forEach(function (cards) { cards.forEach(function (card) {
                    var key = String(card.yani_id || card.title);
                    if (!cardsById[key]) cardsById[key] = card;
                }); });
                var cards = Object.keys(cardsById).map(function (key) { return cardsById[key]; });
                var expected = LampaYaniUiUtils.normalizeMatchTitle(title);
                cards.forEach(function (card) {
                    var titles = card.yani_titles.map(LampaYaniUiUtils.normalizeMatchTitle);
                    card._match_score = (titles.indexOf(expected) >= 0 ? 100 : titles.some(function (value) { return value.indexOf(expected) >= 0 || expected.indexOf(value) >= 0; }) ? 40 : 0) + (year && card.release_date === year ? 30 : 0);
                });
                cards.sort(function (a, b) { return b._match_score - a._match_score; });
                // A partial title without a matching year is not sufficient for
                // the native-card integration: it produces false YummyAnime
                // buttons on unrelated live-action titles.
                if (!cards.length || cards[0]._match_score < 70) return [];
                var best = cards[0]._match_score;
                return cards.filter(function (card, index) { return index < 5 && (card._match_score === best || card._match_score >= 70); });
            }).then(function (cards) {
                delete nativeMatchPending[cacheKey];
                rememberNativeMatch(cacheKey, cards);
                return cards;
            }, function (error) {
                delete nativeMatchPending[cacheKey];
                throw error;
            });
            return nativeMatchPending[cacheKey];
        }

        function isNativeAnimeCard(movie) {
            var ids = movie && (movie.genre_ids || movie.genres_ids || movie.genre_id);
            if (Array.isArray(ids) && ids.some(function (id) { return Number(id) === 16; })) return true;

            var source = movie && (movie.genres || movie.genre || movie.category || movie.categories);
            var values = Array.isArray(source) ? source : source ? [source] : [];
            var names = values.map(function (genre) {
                if (typeof genre === 'string') return genre;
                return genre && (genre.name || genre.title || genre.label) || '';
            }).join(' ').toLowerCase();
            if (/(?:animation|animated|anime|аниме|мультфильм|мультипликац)/.test(names)) return true;

            // Missing genres used to classify every film and series as anime,
            // causing background YummyAnime searches on every native detail page.
            // A Japanese origin is a safer fallback when genre metadata is absent.
            var language = String(movie && (movie.original_language || movie.language) || '').toLowerCase();
            var countries = movie && (movie.origin_country || movie.production_countries) || [];
            var japaneseOrigin = Array.isArray(countries) && countries.some(function (country) {
                return String(typeof country === 'string' ? country : country && (country.iso_3166_1 || country.code) || '').toUpperCase() === 'JP';
            });
            return language === 'ja' && japaneseOrigin;
        }

        function installFullRating() {
            if (window.yummyanime_full_rating_ready || !Lampa.Listener) return;
            window.yummyanime_full_rating_ready = true;

            Lampa.Listener.follow('full', function (event) {
                if (event.type !== 'complite') return;
                var movie = event.data && event.data.movie ? event.data.movie : event.object && event.object.card_data;
                if (!movie || !event.object || !event.object.activity) return;
                if (!lampaCardIntegrationEnabled('rating') && !lampaCardIntegrationEnabled('button')) return;
                // A native Lampa card may be a film or a live-action series with
                // an accidentally similar title. Do not decorate those cards
                // with a YummyAnime action.
                if (!movie.yani_card && !isNativeAnimeCard(movie)) return;

                var matchRequest = movie.yani_card ? Promise.resolve([movie.yani_card]) : findYummyMatches(movie);
                matchRequest.then(function (matches) {
                    var anime = matches[0];
                    if (!anime) return;
                    var render = event.object.activity.render();
                    var line = $('.full-start-new__rate-line, .full-start__rate-line', render).first();
                    // Lampa already owns the usual TMDB/IMDb/Kinopoisk rating
                    // line, and rating plugins may add MAL/Shikimori too.  The
                    // native card needs one clear YummyAnime marker, not a second
                    // competing list of the same services.
                    nativeLampaRatings(anime.yani_ratings || []).forEach(function (rating) {
                        var className = 'rate--yummyanime-' + rating.key;
                        if ($('.' + className, render).length) return;
                        var block = $('<div class="full-start__rate ' + className + '"><div>' + formatRating(rating.value) + '</div><div class="yani-full-rating-label" title="' + rating.title + '" aria-label="' + rating.title + '">YA</div></div>');
                        line.append(block);
                    });
                    addYummyFullButton(render, movie, anime);
                }).catch(function () {});
            });
        }

        function nativeLampaRatings(ratings) {
            if (!lampaCardIntegrationEnabled('rating')) return [];
            return (ratings || []).filter(function (rating) {
                return rating && rating.key === 'yummy' && Number(rating.value) > 0;
            });
        }

        function lampaCardIntegrationEnabled(feature) {
            if (!Lampa.Storage || !Lampa.Storage.get) return true;
            var value = Lampa.Storage.get('yani_lampa_card_' + feature, true);
            return value !== false && value !== 'false';
        }

        function yummyRatingLogo() {
            return '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M18.45 0H1.55A1.55 1.55 0 000 1.55v16.9A1.54 1.54 0 001.55 20h16.9A1.55 1.55 0 0020 18.45V1.55A1.54 1.54 0 0018.45 0Zm-2.83 5.93-2.1 2.66-2.3-5.43a6.95 6.95 0 014.4 2.77Zm-2.9 6.57h-4l2.03-4.8 1.98 4.8Zm-2.37-9.34L7.8 9.06 4.87 5.33c.64-.7 1.4-1.26 2.27-1.65a8.18 8.18 0 013.2-.52ZM3.57 7.39l3.2 4.06-1.56 3.58A6.96 6.96 0 013.57 7.39Zm6.57 9.56c-1.05.01-2.1-.2-3.05-.65l.76-1.8h5.7l.49 1.15a6.93 6.93 0 01-3.9 1.3Zm6.8-7.07a7.8 7.8 0 01-1.17 4L14.55 11l2.17-2.77c.14.54.21 1.1.23 1.65Z"/></svg>';
        }

        function addYummyFullButton(render, movie, anime) {
            if (!lampaCardIntegrationEnabled('button')) return;
            var container = $('.full-start-new__buttons', render);
            if (!container.length) container = $('.full-start__buttons', render);
            if (!container.length) return;

            if (!$('.view--yummyanime', render).length) {
                var button = $('<div class="full-start__button selector view--yummyanime" title="YummyAnime" aria-label="YummyAnime"><span class="view--yummyanime__icon" aria-hidden="true">' + yummyRatingLogo() + '</span></div>');
                button.on('hover:enter click.yaniFullDetail', function () { openYummyDetail(anime, false); });
                container.prepend(button);
            }
        }


        return {
            openStandardLampaCard: openStandardLampaCard,
            enrichCardForStandardSearch: enrichCardForStandardSearch,
            installUndefinedTmdbGuard: installUndefinedTmdbGuard,
            findStandardLampaCard: findStandardLampaCard,
            isValidNativeId: isValidNativeId,
            findYummyMatches: findYummyMatches,
            isNativeAnimeCard: isNativeAnimeCard,
            installFullRating: installFullRating,
            lampaCardIntegrationEnabled: lampaCardIntegrationEnabled
        };
    }

    window.LampaYaniStandardCard = {create: create};
}(window));
