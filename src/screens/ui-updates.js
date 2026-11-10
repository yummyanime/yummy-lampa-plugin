(function (window) {
    'use strict';

    function responseItems(payload, fields) {
        var value = payload && payload.response !== undefined ? payload.response : payload;
        if (Array.isArray(value)) return value;
        fields = fields || [];
        for (var index = 0; value && index < fields.length; index += 1) {
            if (Array.isArray(value[fields[index]])) return value[fields[index]];
        }
        return [];
    }

    function animeSource(item) {
        return item && (item.anime || item.title_data || item.object) || item || {};
    }

    function animeId(item) {
        var source = animeSource(item);
        return source.anime_id || source.animeId || source.yani_id || source.id || '';
    }

    function listId(item) {
        var source = animeSource(item);
        var state = source.user && source.user.list || item && item.user && item.user.list || source.user_list || source.list_state;
        var list = state && state.list && typeof state.list === 'object' ? state.list : state;
        return list && typeof list.id !== 'undefined' ? Number(list.id) : null;
    }

    function relevantTitles(listItems, subscriptionPayload) {
        var values = {};
        (listItems || []).forEach(function (item) {
            if ([0, 1, 5].indexOf(listId(item)) < 0) return;
            var id = String(animeId(item));
            if (id) values[id] = animeSource(item);
        });
        responseItems(subscriptionPayload, ['items', 'data', 'subscriptions', 'anime']).forEach(function (item) {
            var id = String(animeId(item));
            if (id && !values[id]) values[id] = animeSource(item);
        });
        return values;
    }

    function latestVideoEvents(feedPayload) {
        var events = responseItems(feedPayload, ['new_videos']).slice().sort(function (a, b) {
            return Number(b && b.date || 0) - Number(a && a.date || 0);
        });
        var latest = {};
        events.forEach(function (event) {
            var id = String(animeId(event));
            if (id && !latest[id]) latest[id] = event;
        });
        return latest;
    }

    function updateLabel(event, episodes, t) {
        if (event) {
            return [event.ep_title || event.number && t('episode') + ' ' + event.number, event.dub_title, event.player_title]
                .filter(Boolean).join(' · ');
        }
        if (episodes && Number(episodes.aired || 0)) return t('episode') + ' ' + Number(episodes.aired);
        return t('upcoming_release');
    }

    function cards(listItems, subscriptionPayload, schedulePayload, feedPayload, deps) {
        var relevant = relevantTitles(listItems, subscriptionPayload);
        var schedule = {};
        deps.normalize(schedulePayload).forEach(function (item) {
            var id = String(animeId(item));
            if (id) schedule[id] = item;
        });
        var events = latestVideoEvents(feedPayload);
        var results = Object.keys(relevant).map(function (id) {
            var scheduled = schedule[id] || {};
            var event = events[id] || null;
            var source = Object.assign({}, relevant[id], scheduled, event || {});
            var card = deps.toCard(source);
            var episodes = scheduled.episodes || source.episodes || {};
            card.yani_update_date = Number(event && event.date || episodes.prev_date || episodes.next_date || 0);
            card.yani_update_label = updateLabel(event, episodes, deps.t);
            return card;
        }).filter(function (card) { return Boolean(card.yani_id && card.yani_update_date); });
        return results.sort(function (a, b) {
            return Number(b.yani_update_date || 0) - Number(a.yani_update_date || 0);
        }).slice(0, 40);
    }

    function component(object, deps) {
        var comp = new Lampa.InteractionCategory(object);
        comp.create = function () {
            var self = this;
            var states = LampaYaniSectionState.forActivity(self.activity, deps);
            function load() {
                if (!deps.authorized()) {
                    states.empty({
                        title: deps.t('login_required'),
                        hint: deps.t('login_hint')
                    });
                    self.activity.toggle();
                    states.focus();
                    return;
                }
                states.loading('cards');
                deps.resolveUserId().then(function (userId) {
                    return Promise.all([
                        deps.loadLists(userId),
                        deps.subscriptions(userId).catch(function () { return []; }),
                        deps.schedule().catch(function () { return []; }),
                        deps.feed().catch(function () { return {}; })
                    ]);
                }).then(function (result) {
                    var resultCards = cards(result[0], result[1], result[2], result[3], deps);
                    if (!resultCards.length) {
                        states.empty({
                            title: deps.t('updates_empty'),
                            onRetry: load
                        });
                        self.activity.toggle();
                        states.focus();
                        return;
                    }
                    self.build({results: resultCards, total_pages: 1, title: deps.t('updates')});
                    states.ready();
                }).catch(function (error) {
                    console.error('[YummyAnime Updates]', error);
                    states.offline({
                        title: deps.t('updates_error'),
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
    window.LampaYani.Updates = window.LampaYaniUpdates = {
        component: component,
        animeId: animeId,
        listId: listId,
        relevantTitles: relevantTitles,
        latestVideoEvents: latestVideoEvents,
        cards: cards
    };
}(window));
