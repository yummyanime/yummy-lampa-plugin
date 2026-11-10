(function (window) {
    'use strict';

    // The genre grid screen and the genre list it is drawn from.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var toCard = deps.toCard;
        var genreTitle = deps.genreTitle;
        var genreValue = deps.genreValue;
        var openGenreCatalog = deps.openGenreCatalog;

        function bindGenreTile(cardApi, card) {
            if (!card || !card.yani_genre) return;
            // Legacy InteractionCategory sets cardApi.onEnter to push component:'full'
            // before cardRender runs. That native listener fires before any jQuery
            // handler, so the only reliable fix is to replace onEnter itself.
            if (cardApi) {
                cardApi.onEnter = function () { openGenreCatalog(card.yani_genre); };
            }
            var render = cardApi && typeof cardApi.render === 'function'
                ? $(cardApi.render(true))
                : cardApi && (cardApi.jquery || cardApi.nodeType)
                    ? (cardApi.jquery ? cardApi : $(cardApi))
                    : $();
            if (!render.length) return;
            var node = render[0];
            if (node) node.card_data = card;
            render.addClass('yani-genre-tile-card yani-genre-catalog-tile');
        }

        function bindGenreTiles(self, cards) {
            var root = self && self.render ? self.render() : null;
            if (!root) return;
            $(root).find('.card').each(function (index) {
                var card = cards[index];
                if (!card || !card.yani_genre) return;
                if (this.card_data !== card) this.card_data = card;
                $(this).addClass('yani-genre-tile-card yani-genre-catalog-tile');
            });
        }

        function Genres(object) {
            object.page = 1;
            var comp = new Lampa.InteractionCategory(object);
            var genreCards = [];
            var destroyed = false;
            var cacheUpdateHandler = null;
            var focusScope = LampaYaniNavigation.createScope({
                id: 'genres:' + String(object && object.url || 'yani/genres'),
                root: function () { return comp.render ? comp.render() : $(); },
                collection: function () { return comp.scroll && comp.scroll.render ? comp.scroll.render() : comp.render(); },
                scroll: comp.scroll,
                selector: '.card.selector'
            });

            comp.create = function () {
                var self = this;
                this.activity.loader(true);
                if (!cacheUpdateHandler) {
                    cacheUpdateHandler = function (event) {
                        var detail = event && event.detail || {};
                        if (destroyed || detail.path !== '/anime/genres' || !detail.payload) return;
                        var genres = LampaYaniApi.normalizeGenres(detail.payload).filter(function (genre) {
                            return genreTitle(genre) && genreValue(genre) !== null;
                        });
                        if (!genres.length) return;
                        genreList = genres;
                        genreListAt = Date.now();
                        genreCards = genreTilesRow(genres).results;
                        var byId = {};
                        genreCards.forEach(function (card) { byId[String(genreValue(card.yani_genre))] = card; });
                        $(self.render()).find('.card').each(function () {
                            var current = this.card_data;
                            var fresh = current && current.yani_genre ? byId[String(genreValue(current.yani_genre))] : null;
                            if (!fresh) return;
                            this.card_data = fresh;
                            $(this).find('.card__title').first().text(fresh.title || '');
                            if (window.LampaYaniMedia) LampaYaniMedia.attachPosterFallback(this, fresh);
                        });
                    };
                    document.addEventListener('yani:cache-updated', cacheUpdateHandler);
                }
                loadGenreList().then(function (genres) {
                    if (destroyed) return;
                    genreCards = genreTilesRow(genres).results;
                    self.build({results: genreCards, total_pages: 1, title: t('genres')});
                    if (self.activity && self.activity.loader) self.activity.loader(false);
                    if (self.render) self.render().addClass('yani-tile-catalog yani-genres-tile-catalog');
                    bindGenreTiles(self, genreCards);
                    focusScope.bind(self.render());
                    if (!genreCards.length) Lampa.Noty.show(t('genres_empty'));
                }).catch(function (error) {
                    if (destroyed) return;
                    console.error('[YummyAnime Genres]', error);
                    self.activity.loader(false);
                    Lampa.Noty.show(t('genres_load_error'));
                });
            };

            // Lampa legacy signature: cardRender(object, data, cardInstance)
            comp.cardRender = function (first, second, third) {
                var cardApi;
                var card;
                var values = [first, second, third];
                values.forEach(function (value) {
                    if (!value) return;
                    if (!cardApi && typeof value.onEnter !== 'undefined' && typeof value.render === 'function') cardApi = value;
                    if (!card && value.yani_genre_tile) card = value;
                    var candidate = value.card || value.object || value.data;
                    if (!card && candidate && candidate.yani_genre_tile) card = candidate;
                });
                if (!cardApi && third && typeof third.render === 'function') cardApi = third;
                if (!card && second && second.yani_genre_tile) card = second;
                var node = first && (first.jquery || first.nodeType) ? (first.jquery ? first[0] : first) : null;
                if (!card && node && node.card_data && node.card_data.yani_genre_tile) card = node.card_data;
                if (!card) return;
                bindGenreTile(cardApi || node, card);
            };

            var originalGenresDestroy = comp.destroy;
            var originalGenresStart = comp.start;
            comp.start = function () {
                var result = originalGenresStart && originalGenresStart.apply(this, arguments);
                focusScope.bind(comp.render());
                setTimeout(function () { focusScope.restore(comp.last, true); }, 0);
                return result;
            };
            comp.destroy = function () {
                destroyed = true;
                if (cacheUpdateHandler) document.removeEventListener('yani:cache-updated', cacheUpdateHandler);
                cacheUpdateHandler = null;
                focusScope.destroy();
                if (originalGenresDestroy) originalGenresDestroy.apply(this, arguments);
            };

            return comp;
        }

        var genreList = null;
        var genreListAt = 0;
        var genreListRequest = null;
        var GENRE_HUB_TTL = 15 * 60 * 1000;

        function loadGenreList() {
            if (genreList && Date.now() - genreListAt < GENRE_HUB_TTL) {
                LampaYaniApi.genres().catch(function () {});
                return Promise.resolve(genreList);
            }
            if (genreListRequest) return genreListRequest;
            genreListRequest = LampaYaniApi.genres().then(function (payload) {
                var genres = LampaYaniApi.normalizeGenres(payload).filter(function (genre) {
                    return genreTitle(genre) && genreValue(genre) !== null;
                });
                if (!genres.length) Lampa.Noty.show(t('genres_empty'));
                genreList = genres;
                genreListAt = Date.now();
                genreListRequest = null;
                return genres;
            }).catch(function (error) {
                genreListRequest = null;
                throw error;
            });
            return genreListRequest;
        }

        function genreTilePoster(title, index) {
            var colors = [
                ['#ff6878', '#825ed8'],
                ['#50c5b7', '#256ca9'],
                ['#f0a45d', '#d34d74'],
                ['#8b79ed', '#4c60b8']
            ][index % 4];
            var raw = String(title || '');
            var display = raw.length > 20 ? raw.slice(0, 19) + '…' : raw;
            var label = display.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            var mark = raw.charAt(0).toUpperCase();
            var size = display.length > 15 ? 27 : display.length > 11 ? 30 : 34;
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="440" height="200" viewBox="0 0 440 200">' +
                '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + colors[0] + '"/><stop offset="1" stop-color="' + colors[1] + '"/></linearGradient></defs>' +
                '<rect width="440" height="200" rx="28" fill="url(#g)"/>' +
                '<circle cx="388" cy="30" r="118" fill="#fff" opacity=".09"/><circle cx="388" cy="30" r="72" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="3"/>' +
                '<text x="34" y="96" fill="#fff" fill-opacity=".28" font-family="sans-serif" font-size="86" font-weight="800">' + mark + '</text>' +
                '<text x="34" y="155" fill="#fff" font-family="sans-serif" font-size="' + size + '" font-weight="700">' + label + '</text>' +
                '<path d="m378 138 20 0m-7-7 7 7-7 7" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        }

        function genreTilesRow(genres) {
            var cards = (genres || []).map(function (genre, index) {
                var title = genreTitle(genre);
                var poster = genreTilePoster(title, index);
                return {
                    title: title,
                    poster: poster,
                    img: poster,
                    yani_genre_tile: true,
                    yani_genre: genre
                };
            });
            return {
                title: t('genre_tiles') + ' · ' + cards.length,
                yani_genre_tiles: true,
                results: cards,
                nomore: true
            };
        }

        return {Component: Genres};
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.GenresScreen = window.LampaYaniGenresScreen = {create: create};
}(window));
