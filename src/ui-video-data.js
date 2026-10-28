(function (window) {
    'use strict';

    // One in-flight /videos request per title, shared by catalog cards,
    // detail episode stats, translation chips, and the Watch menu.
    // Completed payloads stay in a small TTL cache; closing a title card
    // drops that card's waiters and aborts the network request when nobody
    // else still needs it.

    function abortError() {
        var error = new Error('Aborted');
        error.name = 'AbortError';
        return error;
    }

    function isAbort(error) {
        return Boolean(error && (error.name === 'AbortError' || /aborted/i.test(String(error.message || ''))));
    }

    function videosFromPayload(payload) {
        var videos = payload && payload.response ? payload.response : payload;
        if (Object.prototype.toString.call(videos) === '[object Array]') return videos;
        return videos && (videos.videos || videos.items) || [];
    }

    function create(deps) {
        deps = deps || {};
        var config = window.LampaYaniConfig || {};
        var fetchVideos = deps.fetch || function (id, options) {
            return window.LampaYaniApi.videos(id, options);
        };
        var ttl = Number(deps.ttl || config.videosCacheTtl || 120000);
        var maxEntries = Number(deps.maxEntries || config.videosCacheEntries || 20);
        var staleTtl = Number(deps.staleTtl || config.videosStaleCacheTtl || 24 * 60 * 60 * 1000);
        var persistentEntries = Number(deps.persistentEntries || config.videosPersistentEntries || 6);
        var persistentMaxBytes = Number(deps.persistentMaxBytes || config.videosPersistentMaxBytes || 350000);
        var now = deps.now || function () { return Date.now(); };
        var storage = deps.storage || window.Lampa && window.Lampa.Storage;
        var language = deps.language || function () {
            return window.LampaYaniI18n && window.LampaYaniI18n.getLanguage
                ? window.LampaYaniI18n.getLanguage()
                : 'ru';
        };
        var entries = {};
        var order = [];
        var storageIndexKey = 'lampa_yummyanime_videos_cache_index_v1';

        function persistentKey(key) {
            return 'lampa_yummyanime_videos_cache_v1_' + String(language() || 'ru') + '_' + key;
        }

        function storageGet(key, fallback) {
            if (!storage || !storage.get) return fallback;
            try { return storage.get(key, fallback); } catch (ignore) { return fallback; }
        }

        function storageSet(key, value) {
            if (!storage || !storage.set) return false;
            try {
                storage.set(key, value);
                return true;
            } catch (ignore) { return false; }
        }

        function storageRemove(key) {
            if (!storage || !storage.remove) return;
            try { storage.remove(key); } catch (ignore) {}
        }

        function readStorageIndex() {
            var value = storageGet(storageIndexKey, '[]');
            try { return Array.isArray(value) ? value : JSON.parse(value || '[]'); }
            catch (ignore) { return []; }
        }

        function writeStorageIndex(keys) {
            storageSet(storageIndexKey, JSON.stringify(keys));
        }

        function rememberPersistentKey(key) {
            var keys = readStorageIndex().filter(function (item) { return item !== key; });
            keys.push(key);
            while (keys.length > persistentEntries) storageRemove(keys.shift());
            writeStorageIndex(keys);
        }

        function readPersistent(key, maxAge) {
            var storageKey = persistentKey(key);
            var value = storageGet(storageKey, '');
            if (!value) return null;
            try {
                var saved = typeof value === 'string' ? JSON.parse(value) : value;
                var age = now() - Number(saved && saved.at || 0);
                if (!saved || saved.payload === undefined || age < 0 || age >= maxAge) return null;
                return {payload: saved.payload, at: Number(saved.at), age: age};
            } catch (ignore) { return null; }
        }

        function writePersistent(key, payload) {
            var storageKey = persistentKey(key);
            var serialized;
            try { serialized = JSON.stringify({at: now(), payload: payload}); }
            catch (ignore) { return; }
            // Very large /videos responses can exhaust WebView localStorage on
            // weak devices. They remain in the bounded in-memory cache only.
            if (!serialized || serialized.length > persistentMaxBytes) return;
            if (storageSet(storageKey, serialized)) rememberPersistentKey(storageKey);
        }

        function removePersistent(key) {
            var storageKey = persistentKey(key);
            storageRemove(storageKey);
            writeStorageIndex(readStorageIndex().filter(function (item) { return item !== storageKey; }));
        }

        function persistentSnapshot(key, maxAge) {
            var entry = entries[key];
            if (entry && !entry.inflight && entry.payload !== null && now() - entry.at < maxAge) {
                return {payload: entry.payload, at: entry.at, age: now() - entry.at};
            }
            return readPersistent(key, maxAge);
        }

        function remember(key) {
            var index = order.indexOf(key);
            if (index >= 0) order.splice(index, 1);
            order.push(key);
            evict();
        }

        function forget(key, entry) {
            if (entry && entries[key] !== entry) return;
            delete entries[key];
            var index = order.indexOf(key);
            if (index >= 0) order.splice(index, 1);
        }

        function evict() {
            var skipped = 0;
            while (order.length > maxEntries && skipped < order.length) {
                var oldest = order[0];
                var entry = entries[oldest];
                if (entry && entry.inflight) {
                    order.push(order.shift());
                    skipped += 1;
                    continue;
                }
                order.shift();
                delete entries[oldest];
            }
        }

        function clearWaiter(waiter) {
            if (!waiter || waiter.cleared) return;
            waiter.cleared = true;
            if (waiter.abortListener && waiter.signal && waiter.signal.removeEventListener) {
                waiter.signal.removeEventListener('abort', waiter.abortListener);
            }
        }

        function settleWaiters(entry, error, payload) {
            var waiters = entry.waiters || [];
            entry.waiters = [];
            waiters.forEach(function (waiter) {
                if (waiter.cleared) return;
                clearWaiter(waiter);
                if (error) waiter.reject(error);
                else waiter.resolve(payload);
            });
        }

        function cancelWaiter(key, entry, waiter) {
            if (!waiter || waiter.cleared) return;
            clearWaiter(waiter);
            entry.waiters = (entry.waiters || []).filter(function (item) { return item !== waiter; });
            waiter.reject(abortError());
            if (entry.inflight && !entry.waiters.length && entry.controller && entry.controller.abort) {
                entry.controller.abort();
            }
        }

        function attachWaiter(key, entry, signal) {
            return new Promise(function (resolve, reject) {
                if (signal && signal.aborted) {
                    reject(abortError());
                    if (entry.inflight && !(entry.waiters && entry.waiters.length) && entry.controller && entry.controller.abort) {
                        entry.controller.abort();
                    }
                    return;
                }
                var waiter = {resolve: resolve, reject: reject, signal: signal, cleared: false};
                waiter.abortListener = function () { cancelWaiter(key, entry, waiter); };
                if (signal && signal.addEventListener) signal.addEventListener('abort', waiter.abortListener);
                entry.waiters.push(waiter);
            });
        }

        function start(key, id) {
            var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var entry = {
                inflight: true,
                controller: controller,
                waiters: [],
                at: 0,
                payload: null
            };
            entries[key] = entry;
            remember(key);
            Promise.resolve(fetchVideos(id, {signal: controller && controller.signal})).then(function (payload) {
                if (controller && controller.signal && controller.signal.aborted) throw abortError();
                entry.inflight = false;
                entry.controller = null;
                entry.payload = payload;
                entry.at = now();
                remember(key);
                writePersistent(key, payload);
                settleWaiters(entry, null, payload);
            }).catch(function (error) {
                entry.inflight = false;
                entry.controller = null;
                forget(key, entry);
                settleWaiters(entry, isAbort(error) ? abortError() : error);
            });
            return entry;
        }

        function payload(id, options) {
            options = options || {};
            var key = String(id || '');
            if (!key) return Promise.reject(new Error('YummyAnime video id is missing'));
            var entry = entries[key];
            if (!options.forceRefresh && entry && !entry.inflight && entry.payload !== null && now() - entry.at < ttl) {
                if (options.signal && options.signal.aborted) return Promise.reject(abortError());
                remember(key);
                return Promise.resolve(entry.payload);
            }
            if (entry && entry.inflight) return attachWaiter(key, entry, options.signal);
            if (!options.forceRefresh) {
                var saved = readPersistent(key, ttl);
                if (saved) {
                    entry = {inflight: false, controller: null, waiters: [], at: saved.at, payload: saved.payload};
                    entries[key] = entry;
                    remember(key);
                    if (options.signal && options.signal.aborted) return Promise.reject(abortError());
                    return Promise.resolve(saved.payload);
                }
            }
            entry = start(key, id);
            return attachWaiter(key, entry, options.signal);
        }

        function list(id, options) {
            return payload(id, options).then(videosFromPayload);
        }

        function markDisplayOnly(videos) {
            try {
                Object.defineProperty(videos, '_yaniStaleDisplay', {value: true, configurable: true});
            } catch (ignore) {
                videos._yaniStaleDisplay = true;
            }
            return videos;
        }

        function stagedList(id, options, onCached) {
            options = options || {};
            var key = String(id || '');
            if (!key) return Promise.reject(new Error('YummyAnime video id is missing'));
            if (options.signal && options.signal.aborted) return Promise.reject(abortError());
            var snapshot = persistentSnapshot(key, staleTtl);
            if (!snapshot || snapshot.age < ttl) return list(id, options);

            var cachedVideos = markDisplayOnly(videosFromPayload(snapshot.payload));
            if (typeof onCached === 'function') {
                onCached(cachedVideos, {cached: true, stale: true, age: snapshot.age});
            }
            return list(id, Object.assign({}, options, {forceRefresh: true})).catch(function (error) {
                if (isAbort(error)) throw error;
                return cachedVideos;
            });
        }

        function invalidate(id) {
            var key = String(id || '');
            if (!key) {
                Object.keys(entries).forEach(function (item) {
                    if (entries[item] && !entries[item].inflight) forget(item, entries[item]);
                });
                readStorageIndex().forEach(storageRemove);
                writeStorageIndex([]);
                return;
            }
            var entry = entries[key];
            if (entry && !entry.inflight) forget(key, entry);
            removePersistent(key);
        }

        return {
            payload: payload,
            list: list,
            stagedList: stagedList,
            invalidate: invalidate,
            videosFromPayload: videosFromPayload
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.VideoData = window.LampaYaniVideoData = {create: create, videosFromPayload: videosFromPayload};
}(window));
