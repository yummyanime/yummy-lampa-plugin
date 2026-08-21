(function (window) {
    'use strict';

    var config = window.LampaYaniConfig;
    var pendingRequests = {};
    var pendingRefreshes = {};

    function sleep(milliseconds) {
        return new Promise(function (resolve) { setTimeout(resolve, milliseconds); });
    }

    function fetchWithRetry(url, options, canRetry, timeoutMs) {
        var retries = canRetry ? Number(config.requestRetries || 0) : 0;
        var timeout = Number(timeoutMs || config.requestTimeout || 15000);
        var externalSignal = options && options.signal;
        function attempt(number) {
            var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var requestOptions = Object.assign({}, options);
            if (controller) requestOptions.signal = controller.signal;
            var timer;
            var abortRequest;
            if (controller && externalSignal) {
                abortRequest = function () { controller.abort(); };
                if (externalSignal.aborted) abortRequest();
                else if (externalSignal.addEventListener) externalSignal.addEventListener('abort', abortRequest, {once: true});
            }
            function cleanup() {
                clearTimeout(timer);
                if (abortRequest && externalSignal && externalSignal.removeEventListener) externalSignal.removeEventListener('abort', abortRequest);
            }
            var timeoutPromise = new Promise(function (resolve, reject) {
                timer = setTimeout(function () {
                    if (controller) controller.abort();
                    reject(new Error('YummyAnime request timeout'));
                }, timeout);
            });
            return Promise.race([fetch(url, requestOptions), timeoutPromise]).then(function (response) {
                cleanup();
                var retryableStatus = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500;
                if (!response.ok && retryableStatus && number < retries && !(externalSignal && externalSignal.aborted)) {
                    return sleep(Math.pow(2, number) * 400).then(function () { return attempt(number + 1); });
                }
                return response;
            }).catch(function (error) {
                cleanup();
                var aborted = error && error.name === 'AbortError';
                if (number < retries && !aborted && !(externalSignal && externalSignal.aborted)) return sleep(Math.pow(2, number) * 400).then(function () { return attempt(number + 1); });
                throw error;
            });
        }
        return attempt(0);
    }

    function markFromCache(payload) {
        if (!payload || typeof payload !== 'object') return payload;
        try {
            Object.defineProperty(payload, '__yaniFromCache', {value: true, configurable: true});
        } catch (error) {
            payload.__yaniFromCache = true;
        }
        return payload;
    }

    function fromCache(payload) {
        return Boolean(payload && payload.__yaniFromCache);
    }

    function readCache(key) {
        if (!window.Lampa || !Lampa.Storage) return null;
        try {
            var cached = JSON.parse(Lampa.Storage.get(key, 'null'));
            return cached && typeof cached.time === 'number' && cached.data !== undefined ? cached : null;
        } catch (ignore) {
            return null;
        }
    }

    function rememberCacheKey(key) {
        if (!window.Lampa || !Lampa.Storage) return;
        var indexKey = 'lampa_yummyanime_cache_index';
        var keys = [];
        try { keys = JSON.parse(Lampa.Storage.get(indexKey, '[]')) || []; } catch (ignore) {}
        keys = keys.filter(function (item) { return item !== key; });
        keys.push(key);
        while (keys.length > Number(config.cacheEntries || 80)) {
            var expired = keys.shift();
            try { Lampa.Storage.remove(expired); } catch (ignoreRemove) {}
        }
        Lampa.Storage.set(indexKey, JSON.stringify(keys));
    }

    function payloadChanged(previous, current) {
        try {
            return JSON.stringify(previous) !== JSON.stringify(current);
        } catch (ignore) {
            return true;
        }
    }

    function emitCacheUpdate(path, payload, language) {
        if (typeof document === 'undefined' || !document.dispatchEvent) return;
        var detail = {path: path, payload: payload, language: language};
        var event;
        if (typeof CustomEvent === 'function') {
            event = new CustomEvent('yani:cache-updated', {detail: detail});
        } else if (document.createEvent) {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent('yani:cache-updated', false, false, detail);
        }
        if (event) document.dispatchEvent(event);
    }

    function refreshCacheInBackground(path, options, cached, language) {
        var key = [language, path, options.auth ? 'auth' : 'public', options.token ? 'token' : ''].join('|');
        if (pendingRefreshes[key]) return;
        var refreshOptions = Object.assign({}, options, {
            cacheFirst: false,
            forceRefresh: true,
            backgroundRefresh: false,
            authRefreshChecked: true
        });
        pendingRefreshes[key] = request(path, refreshOptions).then(function (payload) {
            if (payloadChanged(cached.data, payload)) emitCacheUpdate(path, payload, language);
        }).catch(function () {
            // Cached content remains usable when a silent refresh fails.
        }).then(function () {
            delete pendingRefreshes[key];
        });
    }

    function request(path, options) {
        options = options || {};
        if (options.auth && !options.authRefreshChecked && window.LampaYaniAuth && LampaYaniAuth.token() && LampaYaniAuth.refreshIfNeeded) {
            var refreshedOptions = Object.assign({}, options, {authRefreshChecked: true});
            return LampaYaniAuth.refreshIfNeeded().then(function () {
                return request(path, refreshedOptions);
            });
        }
        var headers = Object.assign({}, options.headers || {});
        var apiLanguage = window.LampaYaniI18n ? LampaYaniI18n.getLanguage() : 'ru';
        var cacheKey = 'lampa_yummyanime_cache_' + apiLanguage + '_' + path;
        var cacheTtl = options.cacheTtl || config.cacheTtl || 300000;
        var method = options.method || 'GET';

        // Stable public sections are cache-first: revisiting them should not
        // wait for the network. Expired data is still kept as an offline
        // fallback while a normal request tries to refresh it.
        var cached = method === 'GET' && options.cache !== false ? readCache(cacheKey) : null;
        if (options.cacheFirst && !options.forceRefresh && cached && Date.now() - cached.time < cacheTtl) {
            if (options.backgroundRefresh !== false) refreshCacheInBackground(path, options, cached, apiLanguage);
            return Promise.resolve(cached.data);
        }

        var applicationToken = config.applicationToken ? config.applicationToken() : config.applicationHeader;
        if (applicationToken) headers['X-Application'] = applicationToken;
        if (options.auth && LampaYaniAuth && LampaYaniAuth.token()) headers.Authorization = 'Bearer ' + LampaYaniAuth.token();
        headers.Accept = 'application/json';
        headers.Lang = apiLanguage;
        if (options.token) headers.Authorization = 'Bearer ' + options.token;

        var pendingKey = method === 'GET' && options.dedupe !== false && !options.signal
            ? [apiLanguage, path, options.auth ? 'auth' : 'public', options.token ? 'token' : ''].join('|')
            : '';
        if (pendingKey && pendingRequests[pendingKey]) return pendingRequests[pendingKey];

        var operation = fetchWithRetry(config.apiBase + path, {
            method: method,
            headers: headers,
            body: options.body,
            signal: options.signal
        }, method === 'GET' && options.retry !== false, options.timeout).then(function (response) {
            if (!response.ok) throw new Error('YummyAnime API: ' + response.status);
            return response.json();
        }).then(function (payload) {
            if (method === 'GET' && options.cache !== false && window.Lampa && Lampa.Storage) {
                Lampa.Storage.set(cacheKey, JSON.stringify({time: Date.now(), data: payload}));
                rememberCacheKey(cacheKey);
            }
            return payload;
        }).catch(function (error) {
            if (method === 'GET' && options.cache !== false && window.Lampa && Lampa.Storage) {
                cached = cached || readCache(cacheKey);
                if (cached && (options.staleFallback || Date.now() - cached.time < cacheTtl)) return markFromCache(cached.data);
            }
            throw error;
        });

        if (!pendingKey) return operation;
        pendingRequests[pendingKey] = operation.then(function (payload) {
            delete pendingRequests[pendingKey];
            return payload;
        }, function (error) {
            delete pendingRequests[pendingKey];
            throw error;
        });
        return pendingRequests[pendingKey];
    }

    function externalRequest(base, path, options) {
        options = options || {};
        var url = base.replace(/\/$/, '') + path;
        return fetchWithRetry(url, {
            method: options.method || 'GET',
            headers: {Accept: 'application/json'}
        }, options.retry !== false, options.timeout).then(function (response) {
            if (!response.ok) throw new Error('External API: ' + response.status);
            return response.json();
        });
    }

    var malTitlesCache = {};
    var episodeInfoCache = {};

    function malTitles(malId) {
        if (!malId) return Promise.resolve([]);
        var key = String(malId);
        if (malTitlesCache[key]) return malTitlesCache[key];
        malTitlesCache[key] = externalRequest('https://api.jikan.moe/v4', '/anime/' + encodeURIComponent(key) + '/full').then(function (payload) {
            var anime = payload && payload.data || {};
            var titles = [anime.title, anime.title_english, anime.title_japanese].concat(Array.isArray(anime.title_synonyms) ? anime.title_synonyms : []);
            return titles.filter(function (title, index, list) {
                return typeof title === 'string' && title.trim() && list.indexOf(title) === index;
            });
        }).catch(function (error) {
            delete malTitlesCache[key];
            throw error;
        });
        return malTitlesCache[key];
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Api = window.LampaYaniApi = {
        request: request,
        fromCache: fromCache,
        search: function (query, params) {
            params = params || {};
            params.q = query || undefined;
            params.limit = params.limit || 20;
            return request('/anime?' + new URLSearchParams(params), {auth: true});
        },
        catalog: function (params, options) {
            return request('/anime?' + new URLSearchParams(params || {limit: 20}), Object.assign({auth: true}, options || {}));
        },
        normalize: function (payload) {
            var response = payload && payload.response ? payload.response : payload;
            if (Array.isArray(response)) return response;
            return response && (response.anime || response.results || response.items || response.data) || [];
        },
        normalizeGenres: function (payload) {
            var response = payload && payload.response ? payload.response : payload;
            if (Array.isArray(response)) return response;
            return response && response.genres || [];
        },
        genres: function (control) {
            control = control || {};
            return request('/anime/genres', {
                cacheTtl: 24 * 60 * 60 * 1000,
                cacheFirst: true,
                staleFallback: true,
                forceRefresh: control.forceRefresh,
                backgroundRefresh: control.backgroundRefresh,
                signal: control.signal
            });
        },
        genre: function (id, control) {
            control = control || {};
            return request('/anime/genres/' + encodeURIComponent(id), {
                cacheTtl: 24 * 60 * 60 * 1000,
                cacheFirst: true,
                staleFallback: true,
                forceRefresh: control.forceRefresh,
                backgroundRefresh: control.backgroundRefresh,
                signal: control.signal
            });
        },
        schedule: function (control) {
            control = control || {};
            return request('/anime/schedule', {
                cacheTtl: 60 * 60 * 1000,
                cacheFirst: true,
                staleFallback: true,
                forceRefresh: control.forceRefresh,
                backgroundRefresh: control.backgroundRefresh,
                signal: control.signal
            });
        },
        feed: function (control) {
            control = control || {};
            return request('/feed', {
                auth: true,
                cacheTtl: 5 * 60 * 1000,
                cacheFirst: control.cacheFirst === true,
                staleFallback: true,
                forceRefresh: control.forceRefresh,
                backgroundRefresh: control.backgroundRefresh,
                signal: control.signal,
                timeout: control.timeout,
                retry: control.retry
            });
        },
        collectionCatalog: function (limit, offset, control) {
            control = control || {};
            return request('/collection?limit=' + encodeURIComponent(limit || 20) + '&offset=' + encodeURIComponent(offset || 0), {
                auth: true,
                cacheTtl: 10 * 60 * 1000,
                cacheFirst: true,
                staleFallback: true,
                forceRefresh: control.forceRefresh,
                backgroundRefresh: control.backgroundRefresh,
                signal: control.signal,
                timeout: control.timeout,
                retry: control.retry
            });
        },
        collectionDetail: function (id, limit, offset, control) {
            control = control || {};
            var query = '?limit=' + encodeURIComponent(limit || 30) + '&offset=' + encodeURIComponent(offset || 0);
            return request('/collection/' + encodeURIComponent(id) + query, {
                auth: true,
                cacheTtl: 10 * 60 * 1000,
                cacheFirst: true,
                staleFallback: true,
                forceRefresh: control.forceRefresh,
                backgroundRefresh: control.backgroundRefresh,
                signal: control.signal,
                timeout: control.timeout,
                retry: control.retry
            });
        },
        episodeInfo: function (malId) {
            if (!malId) return Promise.reject(new Error('MAL id is missing'));
            var key = String(malId);
            if (episodeInfoCache[key]) return episodeInfoCache[key];
            episodeInfoCache[key] = externalRequest('https://api.jikan.moe/v4', '/anime/' + encodeURIComponent(malId) + '/episodes', {
                timeout: 4000,
                retry: false
            }).then(function (payload) {
                return {
                    episodes: (payload && payload.data || []).map(function (item) {
                        return {episodeNumber: item.mal_id, title: item.title || item.title_romanji || item.title_japanese || ''};
                    })
                };
            }).catch(function (error) {
                delete episodeInfoCache[key];
                throw error;
            });
            return episodeInfoCache[key];
        },
        malTitles: malTitles,
        detail: function (id) {
            return request('/anime/' + encodeURIComponent(id), {auth: true});
        },
        videos: function (id, options) {
            options = options || {};
            return request('/anime/' + encodeURIComponent(id) + '/videos', {
                auth: true,
                cache: false,
                signal: options.signal
            });
        },
        subscribeVideo: function (videoId) {
            return request('/video/' + encodeURIComponent(videoId) + '/subscribe', {
                method: 'PUT',
                auth: true,
                headers: {'Content-Type': 'application/json'},
                body: '{}'
            });
        },
        unsubscribeVideo: function (videoId) {
            return request('/video/' + encodeURIComponent(videoId) + '/subscribe', {
                method: 'DELETE',
                auth: true
            });
        },
        trailers: function (id) {
            return request('/anime/' + encodeURIComponent(id) + '/trailers');
        },
        recommendations: function (id) {
            return request('/anime/' + encodeURIComponent(id) + '/recommendations');
        },
        collections: function (id, limit, offset) {
            return request('/anime/' + encodeURIComponent(id) + '/collections?limit=' + encodeURIComponent(limit || 10) + '&offset=' + encodeURIComponent(offset || 0));
        },
        ratingBuckets: function (id) {
            return request('/anime/' + encodeURIComponent(id) + '/rates', {auth: true});
        },
        listStats: function (id) {
            return request('/anime/' + encodeURIComponent(id) + '/lists', {auth: true});
        },
        rate: function (id, value) {
            return request('/anime/' + encodeURIComponent(id) + '/rate', {
                method: 'PUT',
                auth: true,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({rate: value})
            });
        },
        removeRate: function (id) {
            return request('/anime/' + encodeURIComponent(id) + '/rate', {method: 'DELETE', auth: true});
        },
        addFavorite: function (id) {
            return request('/anime/' + encodeURIComponent(id) + '/list/fav', {
                method: 'PUT',
                auth: true,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({date: Math.floor(Date.now() / 1000)})
            });
        },
        removeFavorite: function (id) {
            return request('/anime/' + encodeURIComponent(id) + '/list/fav', {method: 'DELETE', auth: true});
        },
        addToList: function (id, list) {
            var listIds = {watching: 0, planned: 1, completed: 2, dropped: 3, postponed: 5};
            var listId = typeof list === 'number' ? list : listIds[list];
            if (typeof listId !== 'number') return Promise.reject(new Error('Unknown YummyAnime list: ' + list));
            return request('/anime/' + encodeURIComponent(id) + '/list', {
                method: 'PUT',
                auth: true,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({list: listId, date: Math.floor(Date.now() / 1000)})
            });
        },
        removeFromList: function (id) {
            return request('/anime/' + encodeURIComponent(id) + '/list', {method: 'DELETE', auth: true});
        },
        comments: function (id, skip) {
            return request('/comments/anime/' + encodeURIComponent(id) + '?limit=20&sort=new&skip=' + encodeURIComponent(skip || 0));
        },
        commentChildren: function (id, skip) {
            return request('/comments/' + encodeURIComponent(id) + '/children?skip=' + encodeURIComponent(skip || 0));
        },
        normalizeComments: function (payload) {
            var response = payload && payload.response ? payload.response : payload;
            if (Array.isArray(response)) return response;
            return response && (response.comments || response.items || response.data) || [];
        },
        profile: function (control) {
            control = control || {};
            return request('/profile', {auth: true, cache: false, signal: control.signal});
        },
        userListStats: function (id, control) {
            control = control || {};
            return request('/users/' + encodeURIComponent(id) + '/stats/lists', {auth: true, cache: false, signal: control.signal});
        },
        userLists: function (id, control) {
            control = control || {};
            return request('/users/' + encodeURIComponent(id) + '/lists', {auth: true, cache: false, signal: control.signal});
        },
        subscriptions: function (id) {
            return request('/users/' + encodeURIComponent(id) + '/lists/subs', {auth: true, cache: false});
        },
        userList: function (id, listId) {
            return request('/users/' + encodeURIComponent(id) + '/lists/' + encodeURIComponent(listId), {auth: true, cache: false});
        },
        userStatsGenres: function (id) {
            return request('/users/' + encodeURIComponent(id) + '/stats/genres', {auth: true, cache: false});
        },
        userStatsRatings: function (id) {
            return request('/users/' + encodeURIComponent(id) + '/stats/ratings', {auth: true, cache: false});
        },
        userStatsTypes: function (id) {
            return request('/users/' + encodeURIComponent(id) + '/stats/types-v2', {auth: true, cache: false});
        },
        userReviews: function (id, limit, offset) {
            return request('/users/' + encodeURIComponent(id) + '/reviews?type=approved&limit=' + encodeURIComponent(limit || 30) + '&offset=' + encodeURIComponent(offset || 0), {auth: true, cache: false});
        },
        notifications: function (limit, offset) {
            return request('/profile/notifications?limit=' + encodeURIComponent(limit || 30) + '&offset=' + encodeURIComponent(offset || 0), {auth: true, cache: false});
        },
        notificationCounts: function (control) {
            control = control || {};
            return request('/profile/notifications/counts', {auth: true, cache: false, signal: control.signal});
        },
        markNotificationRead: function (id) {
            return request('/profile/notifications/' + encodeURIComponent(id) + '/read', {method: 'POST', auth: true, cache: false});
        },
        markAllNotificationsRead: function () {
            return request('/profile/notifications/read', {method: 'POST', auth: true, cache: false, headers: {'Content-Type': 'application/json'}, body: '{}'});
        },
        deleteNotification: function (id) {
            return request('/profile/notifications/' + encodeURIComponent(id), {method: 'DELETE', auth: true, cache: false});
        },
        deleteAllNotifications: function () {
            return request('/profile/notifications', {method: 'DELETE', auth: true, cache: false});
        },
        syncVideoProgress: function (videoId, time, duration) {
            return request('/video/' + encodeURIComponent(videoId), {
                method: 'PUT',
                auth: true,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({time: Math.max(0, Number(time) || 0), duration: Math.max(0, Number(duration) || 0), times: []})
            });
        },
        syncVideoWatches: function (videos) {
            return request('/video', {
                method: 'POST',
                auth: true,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({videos: videos || []})
            });
        },
        watchHistory: function (limit, offset, control) {
            control = control || {};
            return request('/video/watch-history?limit=' + encodeURIComponent(limit || 30) + '&offset=' + encodeURIComponent(offset || 0), {
                auth: true,
                cache: false,
                signal: control.signal
            });
        },
        health: function () {
            return request('/anime?limit=1');
        },
        status: function () {
            return fetchWithRetry(config.statusUrl + '?_=' + Date.now(), {cache: 'no-store'}, true).then(function (response) {
                if (!response.ok) throw new Error('YummyStatus snapshot: ' + response.status);
                return response.json();
            })
        }
    };
}(window));
