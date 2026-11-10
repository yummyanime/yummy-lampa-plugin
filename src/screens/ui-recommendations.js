(function (window) {
    'use strict';

    function payloadItems(payload, fields) {
        var value = payload && payload.response !== undefined ? payload.response : payload;
        if (Array.isArray(value)) return value;
        fields = fields || ['items', 'data', 'history', 'watches', 'results'];
        for (var index = 0; value && index < fields.length; index += 1) {
            if (Array.isArray(value[fields[index]])) return value[fields[index]];
        }
        return [];
    }

    function timestamp(value) {
        if (!value) return 0;
        if (typeof value === 'string' && !/^\d+$/.test(value)) return Date.parse(value) || 0;
        var number = Number(value) || 0;
        return number > 0 && number < 100000000000 ? number * 1000 : number;
    }

    function animeSource(item) {
        if (!item) return {};
        if (item.anime && typeof item.anime === 'object') {
            var anime = Object.assign({}, item.anime);
            if (item.user) anime.user = item.user;
            if (item.date && !anime.date) anime.date = item.date;
            return anime;
        }
        return item.card && typeof item.card === 'object'
            ? Object.assign({}, item.card, item)
            : item;
    }

    function animeId(item) {
        var source = animeSource(item);
        return source.anime_id || source.animeId || source.yani_id || source.id || source._id || '';
    }

    function listId(item) {
        var source = animeSource(item);
        var state = source.user && source.user.list || source.user_list || source.list_state;
        var list = state && state.list && typeof state.list === 'object' ? state.list : state;
        return list && typeof list.id !== 'undefined' ? Number(list.id) : null;
    }

    function sourceTitle(item) {
        var source = animeSource(item);
        return source.title || source.anime_title || source.name || source.original_title || '';
    }

    function sourceTime(item) {
        var source = animeSource(item);
        return timestamp(source.updated_at || source.date || source.created_at || source.update_date);
    }

    function recentSources(localHistory, remotePayload, limit) {
        var candidates = [];
        Object.keys(localHistory || {}).forEach(function (key) {
            var item = localHistory[key] || {};
            var source = animeSource(item);
            candidates.push({
                id: item.anime_id || source.anime_id || key,
                title: item.title || source.title || '',
                updatedAt: timestamp(item.updated_at || item.date || source.updated_at || source.date),
                source: source,
                reason: 'history'
            });
        });
        payloadItems(remotePayload).forEach(function (item) {
            var source = animeSource(item);
            candidates.push({
                id: animeId(source),
                title: sourceTitle(source),
                updatedAt: sourceTime(item),
                source: source,
                reason: 'history'
            });
        });
        candidates.sort(function (a, b) { return b.updatedAt - a.updatedAt; });
        var seen = {};
        return candidates.filter(function (item) {
            var key = String(item.id || '');
            if (!key || seen[key]) return false;
            seen[key] = true;
            return true;
        }).slice(0, limit || 4);
    }

    function personalSources(localHistory, remotePayload, listItems, subscriptionPayload, limit) {
        var candidates = recentSources(localHistory, remotePayload, Math.max(30, Number(limit || 80)));
        (listItems || []).forEach(function (item) {
            var id = animeId(item);
            var state = listId(item);
            if (!id || state === 3) return;
            candidates.push({
                id: id,
                title: sourceTitle(item),
                updatedAt: sourceTime(item),
                source: animeSource(item),
                reason: 'list'
            });
        });
        payloadItems(subscriptionPayload, ['items', 'data', 'subscriptions', 'anime', 'results']).forEach(function (item) {
            var id = animeId(item);
            if (!id) return;
            candidates.push({
                id: id,
                title: sourceTitle(item),
                updatedAt: sourceTime(item),
                source: animeSource(item),
                reason: 'subscription'
            });
        });
        candidates.sort(function (a, b) { return b.updatedAt - a.updatedAt; });
        var seen = {};
        return candidates.filter(function (item) {
            var key = String(item.id || '');
            if (!key || seen[key]) return false;
            seen[key] = true;
            return true;
        }).slice(0, limit || 80);
    }

    function latestVideoEvents(feedPayload) {
        var events = payloadItems(feedPayload, ['new_videos']).slice().sort(function (a, b) {
            return timestamp(b && (b.date || b.updated_at)) - timestamp(a && (a.date || a.updated_at));
        });
        var latest = {};
        events.forEach(function (event) {
            var id = String(animeId(event));
            if (id && !latest[id]) latest[id] = event;
        });
        return latest;
    }

    function notificationAnimeId(notification) {
        return notification && (notification.anime_id || notification.animeId || notification.object_id || notification.objectId) || '';
    }

    function notificationEventKind(notification) {
        var kind = String(notification && notification.kind || '').toLowerCase();
        var text = [
            notification && notification.type,
            notification && notification.sub_type,
            notification && notification.title,
            notification && notification.text
        ].filter(Boolean).join(' ').toLowerCase();
        if (/trailer|трейлер|трейлер/.test(text)) return 'trailer';
        if (kind === 'news' || /news|новост|новин/.test(text)) return 'news';
        if (/translation|translate|dub|subtitle|озвуч|перевод|субтитр|переклад/.test(text)) return 'translation';
        if (kind === 'episode' || /episode|серия|серії/.test(text)) return 'episode';
        return '';
    }

    function latestNotificationEvents(payload, normalizeNotifications) {
        var values = normalizeNotifications ? normalizeNotifications(payload) : payloadItems(payload, ['notifications', 'items', 'data']);
        var latest = {};
        (values || []).slice().sort(function (a, b) {
            return timestamp(b && (b.date || b.updated_at)) - timestamp(a && (a.date || a.updated_at));
        }).forEach(function (notification) {
            var id = String(notificationAnimeId(notification));
            var kind = notificationEventKind(notification);
            if (id && kind && !latest[id]) latest[id] = {item: notification, kind: kind};
        });
        return latest;
    }

    function videoEventLabel(event, t) {
        if (!event) return '';
        return [
            event.ep_title || event.number && t('episode') + ' ' + event.number,
            event.dub_title || event.translation_title || event.voice_title,
            event.subtitle_title
        ].filter(Boolean).join(' · ');
    }

    function notificationEventLabel(event, t) {
        if (!event) return '';
        var labels = {
            trailer: t('personal_new_trailer'),
            news: t('personal_news'),
            translation: t('personal_new_translation'),
            episode: t('personal_new_episode')
        };
        var item = event.item || {};
        var detail = item.title || item.text || '';
        var label = labels[event.kind] || '';
        return detail && detail.toLowerCase().indexOf(String(label).toLowerCase()) < 0
            ? label + ' · ' + detail
            : detail || label;
    }

    function eventCards(sources, schedulePayload, feedPayload, notificationsPayload, deps) {
        var tracked = {};
        (sources || []).forEach(function (source) { tracked[String(source.id)] = source; });
        var schedule = {};
        deps.normalize(schedulePayload).forEach(function (item) {
            var id = String(animeId(item));
            if (id) schedule[id] = item;
        });
        var videos = latestVideoEvents(feedPayload);
        var notifications = latestNotificationEvents(notificationsPayload, deps.normalizeNotifications);
        return Object.keys(tracked).map(function (id) {
            var trackedSource = tracked[id];
            var scheduled = schedule[id] || {};
            var video = videos[id] || null;
            var notification = notifications[id] || null;
            var episodes = scheduled.episodes || {};
            var videoDate = timestamp(video && (video.date || video.updated_at));
            var notificationDate = timestamp(notification && notification.item && (notification.item.date || notification.item.updated_at));
            var scheduleDate = timestamp(episodes.prev_date || episodes.next_date || scheduled.updated_at);
            var source = Object.assign({}, trackedSource.source || {}, scheduled, video || {});
            var card = deps.toCard(source);
            if (!card.yani_id) card.yani_id = trackedSource.id;
            if (!card.title && trackedSource.title) card.title = trackedSource.title;
            if (notification && notificationDate >= videoDate && notificationDate >= scheduleDate) {
                card.yani_update_label = notificationEventLabel(notification, deps.t);
                card.yani_update_date = notificationDate;
                card.yani_personal_event = notification.kind;
            } else if (video) {
                card.yani_update_label = videoEventLabel(video, deps.t) || deps.t('personal_new_translation');
                card.yani_update_date = videoDate;
                card.yani_personal_event = 'video';
            } else if (scheduleDate) {
                card.yani_update_label = Number(episodes.next_date || 0) && !Number(episodes.prev_date || 0)
                    ? deps.t('upcoming_release')
                    : deps.t('personal_new_episode') + (episodes.aired ? ' ' + episodes.aired : '');
                card.yani_update_date = scheduleDate;
                card.yani_personal_event = 'schedule';
            }
            return card;
        }).filter(function (card) {
            return Boolean(card && card.yani_id && card.yani_update_date && card.yani_update_label);
        }).sort(function (a, b) {
            return Number(b.yani_update_date || 0) - Number(a.yani_update_date || 0);
        });
    }

    function detailValue(payload) {
        return payload && payload.response !== undefined ? payload.response : payload;
    }

    function relatedCards(detailPayloads, sources, toCard, t, excluded) {
        var seen = Object.assign({}, excluded || {});
        var cards = [];
        (detailPayloads || []).forEach(function (payload, index) {
            var detail = detailValue(payload) || {};
            var source = sources[index] || {};
            var related = Array.isArray(detail.viewing_order) ? detail.viewing_order
                : Array.isArray(detail.related) ? detail.related
                : [];
            related.forEach(function (item) {
                var card = toCard(item);
                var key = String(card && card.yani_id || '');
                if (!key || seen[key]) return;
                seen[key] = true;
                card.yani_recommendation_label = t('personal_related_to') + ' ' + (source.title || '');
                card.yani_personal_event = 'related';
                cards.push(card);
            });
        });
        return cards.slice(0, 12);
    }

    function cardsFromRows(rows, sources, toCard, t) {
        var seen = {};
        (sources || []).forEach(function (source) { seen[String(source.id)] = true; });
        var cards = [];
        (rows || []).forEach(function (row, index) {
            var source = sources[index] || {};
            (row || []).forEach(function (item) {
                var card = toCard(item);
                var key = String(card && (card.yani_id || card.title) || '');
                if (!card || !card.yani_id || !key || seen[key]) return;
                seen[key] = true;
                card.yani_recommendation_label = source.title
                    ? t('personal_related_to') + ' ' + source.title
                    : t('recommended_for_you');
                cards.push(card);
            });
        });
        return cards.slice(0, 40);
    }

    function loadAccountData(deps) {
        if (!deps.authorized()) return Promise.resolve({items: [], subscriptions: []});
        return deps.resolveUserId().then(function (userId) {
            return deps.loadLists(userId).catch(function () { return []; }).then(function (snapshot) {
                snapshot = Array.isArray(snapshot) ? snapshot : [];
                if (snapshot.some(function (item) { return Boolean(animeId(item)); })) return snapshot;
                if (!deps.loadList) return snapshot;
                return Promise.all([0, 1, 2, 5].map(function (id) {
                    return deps.loadList(userId, id).then(deps.normalizeList).catch(function () { return []; });
                })).then(function (lists) {
                    return snapshot.concat.apply(snapshot, lists);
                });
            }).then(function (items) {
                return deps.subscriptions(userId).catch(function () { return []; }).then(function (subscriptions) {
                    return {items: items, subscriptions: subscriptions};
                });
            });
        }).catch(function (error) {
            console.warn('[YummyAnime For You] Account lists are unavailable', error);
            return {items: [], subscriptions: []};
        });
    }

    function loadRelated(sources, deps) {
        var selected = (sources || []).slice(0, 4);
        return Promise.all(selected.map(function (source) {
            return deps.detail(source.id).catch(function (error) {
                console.warn('[YummyAnime For You] Related titles are unavailable', source.id, error);
                return {};
            });
        })).then(function (details) {
            var excluded = {};
            (sources || []).forEach(function (source) { excluded[String(source.id)] = true; });
            return relatedCards(details, selected, deps.toCard, deps.t, excluded);
        });
    }

    function component(object, deps) {
        var comp = new Lampa.InteractionCategory(object);
        comp.create = function () {
            var self = this;
            var states = LampaYaniSectionState.forActivity(self.activity, deps);
            function load() {
                states.loading('cards');
                var remote = deps.authorized()
                    ? deps.watchHistory(30, 0).catch(function (error) {
                        console.warn('[YummyAnime For You] Remote history is unavailable', error);
                        return [];
                    })
                    : Promise.resolve([]);
                var notifications = deps.authorized()
                    ? deps.notifications(30, 0).catch(function () { return []; })
                    : Promise.resolve([]);
                Promise.all([
                    remote,
                    loadAccountData(deps),
                    deps.schedule().catch(function () { return []; }),
                    deps.feed().catch(function () { return {}; }),
                    notifications
                ]).then(function (result) {
                    var sources = personalSources(deps.history(), result[0], result[1].items, result[1].subscriptions, 80);
                    var updates = eventCards(sources, result[2], result[3], result[4], deps).slice(0, 28);
                    return loadRelated(sources, deps).then(function (related) {
                        var seen = {};
                        var cards = updates.concat(related).filter(function (card) {
                            var key = String(card && card.yani_id || '');
                            if (!key || seen[key]) return false;
                            seen[key] = true;
                            return true;
                        }).slice(0, 40);
                        if (!cards.length) {
                            states.empty({
                                title: deps.t('personal_feed_empty'),
                                onRetry: load
                            });
                            self.activity.toggle();
                            states.focus();
                            return;
                        }
                        self.build({results: cards, total_pages: 1, title: deps.t('for_you')});
                        states.ready();
                    });
                }).catch(function (error) {
                    console.error('[YummyAnime For You]', error);
                    states.offline({
                        title: deps.t('personal_feed_error'),
                        onRetry: load
                    });
                    self.activity.toggle();
                    states.focus();
                });
            }
            load();
        };
        comp.cardRender = deps.cardRender;
        return comp;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Recommendations = window.LampaYaniRecommendations = {
        component: component,
        payloadItems: payloadItems,
        recentSources: recentSources,
        personalSources: personalSources,
        latestVideoEvents: latestVideoEvents,
        latestNotificationEvents: latestNotificationEvents,
        notificationEventKind: notificationEventKind,
        eventCards: eventCards,
        relatedCards: relatedCards,
        cardsFromRows: cardsFromRows
    };
}(window));
