(function (window) {
    'use strict';

    function videoItems(payload) {
        var value = payload && payload.response ? payload.response : payload || {};
        return Array.isArray(value.new_videos) ? value.new_videos : [];
    }

    function animeId(video) {
        video = video || {};
        return video.anime_id || video.animeId || video.anime && (video.anime.anime_id || video.anime.id) || '';
    }

    function latestEvents(payload) {
        var grouped = {};
        videoItems(payload).slice().sort(function (a, b) {
            return Number(b && b.date || 0) - Number(a && a.date || 0);
        }).forEach(function (video) {
            var id = String(animeId(video));
            if (!id) return;
            if (!grouped[id]) grouped[id] = {latest: video, count: 0};
            grouped[id].count += 1;
        });
        return Object.keys(grouped).map(function (id) { return grouped[id]; });
    }

    function label(video, additional) {
        var labels = [video.ep_title, video.dub_title, video.player_title].filter(Boolean);
        if (additional > 0) labels.push('+' + additional);
        return labels.join(' · ');
    }

    function normalize(payload, toCard) {
        return latestEvents(payload).map(function (group) {
            var video = group.latest;
            var card = toCard(video);
            card.yani_id = animeId(video);
            card.yani_update_date = Number(video.date || 0);
            card.yani_translation_count = group.count;
            card.yani_update_label = label(video, group.count - 1);
            card.overview = [video.description, video.dub_title, video.player_title].filter(Boolean).join(' · ');
            return card;
        }).filter(function (card) { return Boolean(card.yani_id); }).sort(function (a, b) {
            return Number(b.yani_update_date || 0) - Number(a.yani_update_date || 0);
        });
    }

    function component(object, deps) {
        var comp = new Lampa.InteractionCategory(object);
        comp.create = function () {
            var self = this;
            var states = LampaYaniSectionState.forActivity(self.activity, deps);
            function load() {
                states.loading('cards');
                deps.feed().then(function (payload) {
                    var cards = normalize(payload, deps.toCard);
                    if (!cards.length) {
                        states.empty({
                            title: deps.t('new_translations_empty'),
                            onRetry: load
                        });
                        self.activity.toggle();
                        states.focus();
                        return;
                    }
                    self.build({results: cards, total_pages: 1, title: deps.t('new_translations')});
                    if (LampaYaniSectionState.fromCache(payload)) states.cached({onRetry: load});
                    else states.ready();
                }).catch(function (error) {
                    console.error('[YummyAnime New Translations]', error);
                    states.offline({
                        title: deps.t('new_translations_error'),
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
    window.LampaYani.Translations = window.LampaYaniTranslations = {
        component: component,
        videoItems: videoItems,
        animeId: animeId,
        latestEvents: latestEvents,
        normalize: normalize
    };
}(window));
