(function (window) {
    'use strict';

    // Catalog/search card bind + open lifecycle. Decoration badges via CardRenderers
    // and opens either the native Lampa card or the YummyAnime detail page.

    function create(deps) {
        deps = deps || {};
        var decorate = deps.decorate || function () {};
        var cardRenderElement = deps.cardRenderElement || function (element, card) {
            var render = element && element.jquery ? element : element ? $(element) : $();
            if (!render.length && card && card.render) render = $(card.render(true));
            return render;
        };
        var attachPosterFallback = deps.attachPosterFallback || function () {};
        var openYummyDetail = deps.openYummyDetail || function () {};
        var openStandardLampaCard = deps.openStandardLampaCard || function () {};
        var showYummyActions = deps.showYummyActions || function () {};

        function getYummyId(card) {
            if (!card) return null;
            return card.yani_id || card.anime_id || card.animeId ||
                card.anime && (card.anime.yani_id || card.anime.anime_id || card.anime.animeId) || null;
        }

        function hasYummyCardData(value) {
            // Do not attach YummyAnime handlers to arbitrary Lampa cards.  The
            // previous title-based check also matched native TMDB cards and left
            // Lampa trying to open a movie with an undefined id.
            return Boolean(value && (value.yani_id || value.anime_id || value.animeId ||
                value.anime && (value.anime.yani_id || value.anime.anime_id || value.anime.animeId)));
        }

        function openCardOnce(card) {
            var id = getYummyId(card);
            if (!card || !id || card._yani_opening) return;
            card.yani_id = id;
            card._yani_opening = true;
            openStandardLampaCard(card);
            setTimeout(function () { card._yani_opening = false; }, 10000);
        }

        function bindYummyCard(element, card, options) {
            // Keep an explicit marker on the original Lampa card.  Some Lampa
            // versions preserve only custom fields when forwarding a card to the
            // default detail handler.
            card._yani_card = true;
            decorate(element, card);
            attachPosterFallback(element, card);
            // Some Lampa versions clone the card object after cardRender. Keep a
            // DOM-level handler as a fallback so search results remain clickable.
            var rendered = cardRenderElement(element, card);
            rendered.attr('data-yani-card-id', String(card.yani_id || ''));
            rendered.closest('.category-full, .items-cards').addClass('yani-card-grid');
            // Lampa cards already have a default `hover:enter` handler. Some
            // builds attach it to an inner card element, not the rendered root.
            // Remove it from the full YummyAnime card tree: otherwise one Enter
            // can still attempt a native TMDB detail with id=undefined before our
            // resolver has chosen a real match or the YummyAnime fallback.
            rendered.add(rendered.find('*')).off('hover:enter click');
            var openCard = options && options.openYummyDetail ? function () { openYummyDetail(card, false); } : function () { openCardOnce(card); };
            rendered.on('hover:enter.yaniOpen click.yaniOpen', function (event) {
                if (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
                openCard();
                return false;
            });
            card.onEnter = openCard;
            card.onMenu = function () {
                if (card.yani_id) showYummyActions(card, rendered, rendered.closest('.scroll, .yani-home'));
            };
        }

        function bindYummyCardRender(first, second, third, options) {
            var element;
            var card;
            [first, second, third].forEach(function (value) {
                if (!value) return;
                var isElement = value.jquery || value.nodeType || (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement);
                if (isElement) element = value;
                else if (!card && hasYummyCardData(value)) card = value;
            });
            [first, second, third].forEach(function (value) {
                if (!value || card) return;
                var candidate = value.card || value.object || value.data;
                if (candidate && hasYummyCardData(candidate)) card = candidate;
            });
            if (!element && second && (second.jquery || second.nodeType)) element = second;
            if (!card && first && hasYummyCardData(first)) card = first;
            if (!element && card && card.render) element = card.render(true);
            if (!card || !element) return;
            bindYummyCard(element, card, options);
        }

        function bindRecommendedCardRender(first, second, third) {
            bindYummyCardRender(first, second, third, {openYummyDetail: true});
        }

        return {
            getYummyId: getYummyId,
            hasYummyCardData: hasYummyCardData,
            openCardOnce: openCardOnce,
            bindYummyCard: bindYummyCard,
            bindYummyCardRender: bindYummyCardRender,
            bindRecommendedCardRender: bindRecommendedCardRender
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.CardBind = window.LampaYaniCardBind = {
        create: create
    };
}(window));
