(function (window) {
    'use strict';

    function response(payload) {
        return payload && payload.response ? payload.response : payload || {};
    }

    function uniqueCount(items, id) {
        var seen = {};
        (items || []).forEach(function (item) {
            var value = id(item || {});
            if (value === null || typeof value === 'undefined' || value === '') return;
            var key = String(value);
            seen[key] = true;
        });
        return Object.keys(seen).length;
    }

    function counts(payload) {
        var value = response(payload);
        var releases = Array.isArray(value.new) ? value.new : [];
        var videos = Array.isArray(value.new_videos) ? value.new_videos : [];
        var collections = Array.isArray(value.collections) ? value.collections : [];
        return {
            new_releases: uniqueCount(releases, function (item) {
                return item.anime_id || item.animeId || item.id;
            }),
            new_translations: uniqueCount(videos, function (item) {
                return item.anime_id || item.animeId || item.anime && (item.anime.anime_id || item.anime.id);
            }),
            collections: uniqueCount(collections, function (item) {
                return item.collection_id || item.id || item.slug || item.title;
            })
        };
    }

    function timestampMilliseconds(value) {
        var timestamp = Number(value || 0);
        if (!timestamp) return 0;
        return timestamp < 100000000000 ? timestamp * 1000 : timestamp;
    }

    function titleOf(item) {
        item = item || {};
        return item.title || item.anime_title || item.title_ru || item.name || item.title_en || item.title_original ||
            item.anime && titleOf(item.anime) || '';
    }

    function posterOf(item) {
        item = item || {};
        var poster = item.poster || item.image || item.img || '';
        if (!poster && item.anime) return posterOf(item.anime);
        if (window.LampaYaniUiUtils && window.LampaYaniUiUtils.posterUrl) return window.LampaYaniUiUtils.posterUrl(poster);
        if (poster && typeof poster === 'object') poster = poster.huge || poster.mega || poster.big || poster.large || poster.fullsize || poster.full || poster.medium || poster.small || '';
        poster = String(poster || '');
        return poster.indexOf('//') === 0 ? 'https:' + poster : poster;
    }

    function episodeNumber(value) {
        if (typeof value === 'number') return value;
        var match = String(value || '').match(/(\d+(?:\.\d+)?)/);
        return match ? Number(match[1]) : 0;
    }

    function scheduleReleases(payload) {
        var items = payload && payload.response !== undefined ? payload.response : payload;
        items = Array.isArray(items) ? items : items && (items.items || items.data) || [];
        var releases = [];
        var seen = {};
        items.forEach(function (item) {
            var episodes = item && item.episodes || {};
            [
                {value: episodes.prev_date, aired: true},
                {value: episodes.next_date, aired: false}
            ].forEach(function (release) {
                var timestamp = timestampMilliseconds(release.value);
                if (!timestamp) return;
                var animeId = item.anime_id || item.id || '';
                var key = String(animeId || titleOf(item)) + ':' + timestamp;
                if (seen[key]) return;
                seen[key] = true;
                releases.push({
                    anime_id: animeId,
                    title: titleOf(item),
                    poster: posterOf(item),
                    timestamp: timestamp,
                    episode: release.aired ? Number(episodes.aired || 0) : Number(episodes.aired || 0) + 1,
                    total: Number(episodes.count || 0),
                    aired: release.aired
                });
            });
        });
        return releases.sort(function (a, b) { return a.timestamp - b.timestamp; });
    }

    function translationEntries(payload) {
        var value = response(payload);
        return (Array.isArray(value.new_videos) ? value.new_videos : []).map(function (video) {
            return {
                anime_id: video.anime_id || video.animeId || video.anime && (video.anime.anime_id || video.anime.id) || '',
                title: titleOf(video),
                poster: posterOf(video),
                episode: episodeNumber(video.episode || video.number || video.ep_title || video.episode_title),
                episode_label: video.ep_title || video.episode_title || video.episode || video.number || '',
                dubbing: video.dub_title || video.dubbing || '',
                source: video.player_title || video.player || '',
                timestamp: timestampMilliseconds(video.date || video.updated_at || video.created_at)
            };
        }).sort(function (a, b) { return Number(b.timestamp || 0) - Number(a.timestamp || 0); });
    }

    function scheduleInsight(payload, now) {
        now = Number(now || Date.now());
        var today = new Date(now);
        var dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        var dayEnd = dayStart + 86400000;
        var releases = scheduleReleases(payload);
        var upcoming = releases.filter(function (release) { return release.timestamp >= now; });
        var preview = upcoming[0] || releases[releases.length - 1] || null;
        return {
            today: releases.filter(function (release) { return release.timestamp >= dayStart && release.timestamp < dayEnd; }).length,
            preview: preview
        };
    }

    function releaseCountdown(timestamp, now) {
        var target = timestampMilliseconds(timestamp);
        now = Number(now || Date.now());
        if (!target) return {state: 'unknown', days: 0, hours: 0, minutes: 0};
        var delta = target - now;
        if (delta <= 0) return {state: 'aired', days: 0, hours: 0, minutes: 0};
        var totalMinutes = Math.max(1, Math.ceil(delta / 60000));
        return {
            state: 'upcoming',
            days: Math.floor(totalMinutes / 1440),
            hours: Math.floor(totalMinutes % 1440 / 60),
            minutes: totalMinutes % 60
        };
    }

    function translationInsight(payload) {
        var videos = translationEntries(payload);
        var video = videos[0] || null;
        if (!video) return {count: 0, preview: null};
        return {
            count: uniqueCount(videos, function (item) {
                return item.anime_id;
            }),
            preview: {
                title: titleOf(video),
                episode: video.episode_label || video.episode || '',
                dubbing: video.dubbing || '',
                source: video.source || '',
                poster: video.poster || ''
            }
        };
    }

    function valueLabel(value) {
        if (!value) return '';
        if (typeof value === 'string' || typeof value === 'number') return String(value);
        return value.title || value.name || value.shortname || value.alias || '';
    }

    function discoveryPoster(item) {
        var poster = posterOf(item);
        if (poster) return poster;
        var previews = item && Array.isArray(item.poster_previews) ? item.poster_previews : [];
        if (previews.length) return posterOf({poster: previews[0]});
        var animes = item && Array.isArray(item.animes) ? item.animes : [];
        return animes.length ? posterOf(animes[0]) : '';
    }

    function discoveryInsights(payload) {
        var value = response(payload);
        var releases = Array.isArray(value.new) ? value.new.slice() : [];
        releases.sort(function (a, b) {
            var aTime = timestampMilliseconds(a && (a.updated_at || a.created_at || a.date));
            var bTime = timestampMilliseconds(b && (b.updated_at || b.created_at || b.date));
            return bTime - aTime;
        });
        var collections = Array.isArray(value.collections) ? value.collections : [];
        var release = releases[0] || null;
        var collection = collections[0] || null;
        var releaseAnime = release && release.anime && typeof release.anime === 'object' ? release.anime : {};
        return {
            new_release: release ? {
                anime_id: release.anime_id || release.animeId || releaseAnime.anime_id || releaseAnime.id || release.id || '',
                title: titleOf(release),
                poster: discoveryPoster(release),
                year: valueLabel(release.year || release.release_year || releaseAnime.year || releaseAnime.release_year),
                type: valueLabel(release.type || releaseAnime.type),
                meta: [valueLabel(release.year || release.release_year), valueLabel(release.anime_status || release.status), valueLabel(release.type)].filter(Boolean).join(' · ')
            } : null,
            collection: collection ? {
                id: collection.collection_id || collection.id || collection._id || '',
                title: titleOf(collection),
                poster: discoveryPoster(collection),
                count: Array.isArray(collection.animes) ? collection.animes.length : Math.max(0, Number(collection.anime_count || collection.count || 0))
            } : null
        };
    }

    function episodeFlow(schedulePayload, feedPayload, now) {
        now = Number(now || Date.now());
        var releases = scheduleReleases(schedulePayload);
        var videos = translationEntries(feedPayload);
        var upcoming = releases.filter(function (release) { return release.timestamp >= now; });
        var aired = releases.filter(function (release) { return release.aired && release.timestamp <= now; }).sort(function (a, b) {
            return b.timestamp - a.timestamp;
        });

        function translated(release) {
            return videos.some(function (video) {
                if (!release.anime_id || String(video.anime_id) !== String(release.anime_id)) return false;
                return !release.episode || !video.episode || Number(video.episode) === Number(release.episode);
            });
        }

        var pending = aired.filter(function (release) { return !translated(release); })[0] || null;
        var latestAired = aired[0] || null;
        return {
            japan: upcoming[0] || releases[releases.length - 1] || null,
            waiting: pending ? Object.assign({status: 'waiting'}, pending) : latestAired ? Object.assign({status: translated(latestAired) ? 'ready' : 'waiting'}, latestAired) : null,
            available: videos[0] ? Object.assign({status: 'ready'}, videos[0]) : null
        };
    }

    function listCounts(payload) {
        var value = response(payload);
        var names = ['watching', 'planned', 'completed', 'dropped', 'favorites', 'postponed'];
        var result = {watching: 0, planned: 0, completed: 0, dropped: 0, favorites: 0, postponed: 0};
        var items = Array.isArray(value) ? value : value && (value.items || value.data || value.lists);

        if (!Array.isArray(items) && value && typeof value === 'object') {
            names.forEach(function (name, id) {
                var direct = value[name];
                if (direct === undefined) direct = value[id];
                if (direct !== undefined) result[name] = Math.max(0, Number(direct && (direct.count || direct.total) || direct) || 0);
            });
            return result;
        }

        (items || []).forEach(function (item) {
            item = item || {};
            var list = item.list || {};
            var id = Number(item.list_id !== undefined ? item.list_id : list.id !== undefined ? list.id : item.id);
            if (id < 0 || id >= names.length) return;
            var count = item.count;
            if (count === undefined) count = item.anime_count;
            if (count === undefined) count = item.items_count;
            if (count === undefined) count = item.total;
            if (count === undefined && Array.isArray(item.items)) count = item.items.length;
            result[names[id]] = Math.max(0, Number(count) || 0);
        });
        return result;
    }

    function personalInsight(continuing, account, stats) {
        continuing = Array.isArray(continuing) ? continuing.slice() : [];
        continuing.sort(function (a, b) { return Number(b && b.updated_at || 0) - Number(a && a.updated_at || 0); });
        var lists = listCounts(stats);
        var total = lists.watching + lists.planned + lists.completed + lists.dropped + lists.postponed;
        var tracked = lists.watching + lists.planned + lists.postponed;
        return {
            continue_count: continuing.length,
            continue_preview: continuing[0] || null,
            account_name: account && (account.display_name || account.login) || '',
            lists: lists,
            list_total: total,
            tracked_total: tracked
        };
    }

    function libraryPreview(continuing, limit) {
        continuing = Array.isArray(continuing) ? continuing.slice() : [];
        limit = Math.max(1, Number(limit || 3));
        return continuing.sort(function (a, b) {
            return Number(b && b.updated_at || 0) - Number(a && a.updated_at || 0);
        }).slice(0, limit).map(function (item) {
            item = item || {};
            var duration = Math.max(0, Number(item.duration || 0));
            var time = Math.max(0, Number(item.time || 0));
            return {
                anime_id: item.anime_id || item.animeId || item.id || '',
                video_id: item.video_id || item.videoId || '',
                title: titleOf(item),
                poster: posterOf(item),
                episode: item.number || item.episode || '',
                progress: duration > 0 ? Math.max(0, Math.min(99, Math.round(time / duration * 100))) : 0,
                time: time,
                duration: duration,
                player: item.player || '',
                voice: item.voice || '',
                updated_at: Number(item.updated_at || 0),
                card: item.card || null
            };
        });
    }

    function unreadNumber(value) {
        if (value == null || value === '') return null;
        if (typeof value === 'number' && isFinite(value)) return Math.max(0, value);
        if (typeof value === 'string' && isFinite(Number(value))) return Math.max(0, Number(value));
        if (typeof value !== 'object') return null;
        var keys = ['unread_count', 'unread', 'unviewed', 'not_viewed', 'new_count', 'new'];
        for (var index = 0; index < keys.length; index++) {
            if (!Object.prototype.hasOwnProperty.call(value, keys[index])) continue;
            var nested = unreadNumber(value[keys[index]]);
            if (nested !== null) return nested;
        }
        if (Object.prototype.hasOwnProperty.call(value, 'count')) return unreadNumber(value.count);
        return null;
    }

    function notificationCount(payload) {
        var value = response(payload);
        if (value == null || value === '') return 0;
        if (typeof value !== 'object') return Math.max(0, Number(value) || 0);
        var preferred = [value.unread_count, value.unread, value.unviewed, value.not_viewed, value.new_count];
        for (var index = 0; index < preferred.length; index++) {
            var parsed = unreadNumber(preferred[index]);
            if (parsed !== null) return parsed;
        }
        if (value.notifications && !Array.isArray(value.notifications)) {
            var nested = unreadNumber(value.notifications);
            if (nested !== null) return nested;
        }
        var grouped = unreadNumber(value.counts);
        if (grouped !== null) return grouped;
        var fromList = unreadFromNotifications(payload);
        if (fromList > 0) return fromList;
        var total = unreadNumber(value.count);
        if (total !== null) return total;
        return Object.keys(value).reduce(function (sum, key) {
            return sum + (typeof value[key] === 'number' ? Math.max(0, value[key]) : 0);
        }, 0);
    }

    function unreadFromNotifications(payload) {
        var value = payload && payload.response !== undefined ? payload.response : payload;
        var items = Array.isArray(value) ? value : value && (value.notifications || value.items || value.data) || [];
        if (!Array.isArray(items)) return 0;
        return items.filter(function (item) {
            return Boolean(item) && typeof item === 'object' && !(item.viewed || item.read);
        }).length;
    }

    function resolveNotificationCount(countsPayload, listPayload) {
        var count = notificationCount(countsPayload);
        if (count > 0 || listPayload === undefined) return count;
        return Math.max(count, unreadFromNotifications(listPayload));
    }

    function dashboardPriority(options) {
        options = options || {};
        if (Number(options.continue_count || 0) > 0) return {key: 'continue_watching', label: 'continue_now'};
        if (Number(options.notification_count || 0) > 0) return {key: 'notifications', label: 'notifications_new'};
        if (options.has_translation) return {key: 'new_translations', label: 'fresh_translation'};
        return options.authorized ? {key: 'for_you', label: 'recommended_now'} : {key: 'catalog', label: 'start_catalog'};
    }

    function dashboardInitialFocus(savedKey, priorityKey, availableKeys) {
        availableKeys = Array.isArray(availableKeys) ? availableKeys.map(String) : [];
        savedKey = String(savedKey || '');
        priorityKey = String(priorityKey || '');
        if (savedKey && availableKeys.indexOf(savedKey) >= 0) return savedKey;
        if (priorityKey && availableKeys.indexOf(priorityKey) >= 0) return priorityKey;
        return availableKeys[0] || '';
    }

    function mergeDashboardSnapshot(cached, live) {
        cached = cached && typeof cached === 'object' ? cached : {};
        live = live && typeof live === 'object' ? live : {};
        var service = live.service || {};
        var cachedFlow = cached.episode_flow || {};
        var liveFlow = live.episode_flow || {};
        var hasCached = Boolean(cached.counts || cached.schedule || cached.translations || cached.episode_flow);
        return {
            counts: service.feed ? live.counts || {} : cached.counts || live.counts || {},
            schedule: service.schedule ? live.schedule || {} : cached.schedule || live.schedule || {},
            translations: service.feed ? live.translations || {} : cached.translations || live.translations || {},
            discovery: service.feed ? live.discovery || {} : cached.discovery || live.discovery || {},
            episode_flow: {
                japan: service.schedule ? liveFlow.japan : cachedFlow.japan || liveFlow.japan,
                waiting: service.feed && service.schedule ? liveFlow.waiting : cachedFlow.waiting || liveFlow.waiting,
                available: service.feed ? liveFlow.available : cachedFlow.available || liveFlow.available
            },
            service: service,
            used_cache: hasCached && (!service.feed || !service.schedule)
        };
    }

    function load(feed) {
        return feed().then(counts);
    }

    function dashboard(options) {
        options = options || {};
        function settle(request) {
            if (!request) return Promise.resolve({ok: false, data: null});
            try {
                return request().then(function (data) { return {ok: true, data: data}; }).catch(function () { return {ok: false, data: null}; });
            } catch (error) { return Promise.resolve({ok: false, data: null}); }
        }
        var feedRequest = settle(options.feed);
        var scheduleRequest = settle(options.schedule);
        return Promise.all([feedRequest, scheduleRequest]).then(function (result) {
            var feed = result[0];
            var schedule = result[1];
            return {
                counts: feed.ok ? counts(feed.data) : null,
                schedule: schedule.ok ? scheduleInsight(schedule.data, options.now) : null,
                translations: feed.ok ? translationInsight(feed.data) : null,
                discovery: feed.ok ? discoveryInsights(feed.data) : null,
                episode_flow: episodeFlow(schedule.data, feed.data, options.now),
                service: {
                    api: feed.ok || schedule.ok,
                    degraded: feed.ok !== schedule.ok,
                    feed: feed.ok,
                    schedule: schedule.ok
                }
            };
        });
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.HomeInsights = window.LampaYaniHomeInsights = {
        counts: counts,
        load: load,
        dashboard: dashboard,
        scheduleInsight: scheduleInsight,
        releaseCountdown: releaseCountdown,
        translationInsight: translationInsight,
        discoveryInsights: discoveryInsights,
        episodeFlow: episodeFlow,
        scheduleReleases: scheduleReleases,
        translationEntries: translationEntries,
        listCounts: listCounts,
        personalInsight: personalInsight,
        libraryPreview: libraryPreview,
        notificationCount: notificationCount,
        unreadFromNotifications: unreadFromNotifications,
        resolveNotificationCount: resolveNotificationCount,
        dashboardPriority: dashboardPriority,
        dashboardInitialFocus: dashboardInitialFocus,
        mergeDashboardSnapshot: mergeDashboardSnapshot,
        posterOf: posterOf,
        timestampMilliseconds: timestampMilliseconds,
        uniqueCount: uniqueCount
    };
}(window));
