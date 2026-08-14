(function (window) {
    'use strict';

    function responseValue(payload) {
        return payload && payload.response !== undefined ? payload.response : payload;
    }

    function collectionItems(payload) {
        var value = responseValue(payload);
        if (Array.isArray(value)) return value;
        return value && (value.collections || value.items || value.data || value.results) || [];
    }

    function posterUrl(poster) {
        if (window.LampaYaniUiUtils && window.LampaYaniUiUtils.posterUrl) return window.LampaYaniUiUtils.posterUrl(poster);
        if (typeof poster === 'string') return poster;
        if (!poster || typeof poster !== 'object') return '';
        return poster.huge || poster.mega || poster.big || poster.large || poster.fullsize || poster.medium || poster.small || poster.url || '';
    }

    function previewPosters(collection) {
        var previews = Array.isArray(collection.poster_previews) ? collection.poster_previews : [];
        if (!previews.length && Array.isArray(collection.animes)) {
            previews = collection.animes.map(function (anime) { return anime && anime.poster; });
        }
        return previews.map(posterUrl).filter(Boolean).filter(function (url, index, list) {
            return list.indexOf(url) === index;
        }).slice(0, 4);
    }

    function collectionCard(collection) {
        var previews = previewPosters(collection);
        var likes = collection.likes && typeof collection.likes === 'object' ? Number(collection.likes.likes || 0) : Number(collection.likes || 0);
        return {
            title: collection.title || collection.name || '',
            overview: collection.description || '',
            poster: previews[0] || '',
            img: previews[0] || '',
            yani_collection_id: collection.id,
            yani_collection: collection,
            yani_collection_previews: previews,
            yani_collection_views: Number(collection.views || 0),
            yani_collection_likes: likes,
            yani_collection_count: Array.isArray(collection.animes) ? collection.animes.length : 0
        };
    }

    function renderElement(first, second, third) {
        var values = [first, second, third];
        var element;
        var card;
        values.forEach(function (value) {
            if (!value) return;
            var isElement = value.jquery || value.nodeType || (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement);
            if (isElement) element = value;
            else if (!card && value.yani_collection_id) card = value;
        });
        values.forEach(function (value) {
            if (!value || card) return;
            var candidate = value.card || value.object || value.data;
            if (candidate && candidate.yani_collection_id) card = candidate;
        });
        if (!element && card && card.render) element = card.render(true);
        return {element: element && element.jquery ? element : element ? $(element) : $(), card: card};
    }

    function bindCollectionCard(first, second, third, deps) {
        var resolved = renderElement(first, second, third);
        var element = resolved.element;
        var card = resolved.card;
        if (!element.length || !card) return;
        var rendered = element;
        var view = $('.card__view', rendered).first();
        var previews = card.yani_collection_previews || [];

        rendered.add(rendered.find('*')).off('hover:enter click');
        rendered.on('hover:enter.yaniCollection click.yaniCollection', function (event) {
            if (event) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            deps.open(card.yani_collection);
        });
        rendered.addClass('yani-collection-card');
        rendered.closest('.category-full, .items-cards').addClass('yani-card-grid');

        if (view.length && previews.length > 1 && !view.find('.yani-collection-card__previews').length) {
            var mosaic = $('<div class="yani-collection-card__previews"></div>');
            previews.slice(1, 4).forEach(function (url) {
                mosaic.append($('<span></span>').css('background-image', 'url("' + String(url).replace(/"/g, '%22') + '")'));
            });
            view.append(mosaic);
        }

        if (view.length && !view.find('.yani-collection-card__meta').length) {
            var labels = [];
            if (card.yani_collection_count) labels.push(card.yani_collection_count + ' ' + deps.t('anime_count'));
            if (card.yani_collection_views) labels.push('◉ ' + card.yani_collection_views);
            if (card.yani_collection_likes) labels.push('♥ ' + card.yani_collection_likes);
            if (labels.length) view.append($('<div class="yani-collection-card__meta"></div>').text(labels.join(' · ')));
        }
    }

    function catalog(object, deps) {
        object.page = 1;
        var comp = new Lampa.InteractionCategory(object);
        var limit = 20;
        var maxPages = 1000;
        var seen = {};
        var requestedOffsets = {};
        var nextCatalogOffset = 0;
        var catalogDone = false;

        function uniqueCards(items) {
            return (items || []).map(function (collection) {
                var id = collection && collection.id;
                var key = id === undefined || id === null ? String(collection && collection.title || '') : String(id);
                if (!key || seen[key]) return null;
                seen[key] = true;
                return collectionCard(collection);
            }).filter(Boolean);
        }

        function buildInitial(self, items) {
            self.build({results: uniqueCards(items), total_pages: maxPages, title: deps.t('collections')});
        }

        comp.create = function () {
            var self = this;
            this.activity.loader(true);
            deps.feed().then(function (payload) {
                var response = responseValue(payload) || {};
                var items = Array.isArray(response.collections) ? response.collections : [];
                if (items.length) return buildInitial(self, items);
                requestedOffsets[0] = true;
                return deps.load(limit, 0).then(function (fallback) {
                    var raw = collectionItems(fallback);
                    nextCatalogOffset = raw.length;
                    catalogDone = raw.length < limit;
                    buildInitial(self, raw);
                });
            }).catch(function (error) {
                requestedOffsets[0] = true;
                deps.load(limit, 0).then(function (fallback) {
                    var raw = collectionItems(fallback);
                    nextCatalogOffset = raw.length;
                    catalogDone = raw.length < limit;
                    buildInitial(self, raw);
                }).catch(function (fallbackError) {
                    console.error('[YummyAnime Collections]', fallbackError || error);
                    var states = LampaYaniSectionState.forActivity(self.activity, {
                        t: deps.t
                    });
                    states.offline({
                        title: deps.t('collections_load_error'),
                        onRetry: function () { self.create(); }
                    });
                    self.activity.toggle();
                    states.focus();
                });
            });
        };

        comp.nextPageReuest = function (requestObject, resolve, reject) {
            function loadNext(attempt) {
                if (catalogDone || attempt > 4) {
                    requestObject.page = maxPages;
                    resolve({results: [], total_pages: maxPages, title: deps.t('collections')});
                    return;
                }
                var offset = nextCatalogOffset;
                if (requestedOffsets[offset]) {
                    nextCatalogOffset += limit;
                    loadNext(attempt + 1);
                    return;
                }
                requestedOffsets[offset] = true;
                deps.load(limit, offset).then(function (payload) {
                    var raw = collectionItems(payload);
                    nextCatalogOffset = offset + raw.length;
                    catalogDone = raw.length < limit;
                    var cards = uniqueCards(raw);
                    if (!cards.length && !catalogDone) return loadNext(attempt + 1);
                    if (catalogDone) requestObject.page = maxPages;
                    resolve({results: cards, total_pages: maxPages, title: deps.t('collections')});
                }).catch(function (error) {
                    delete requestedOffsets[offset];
                    requestObject.page = Math.max(1, Number(requestObject.page || 2) - 1);
                    deps.error(deps.t('next_page_error'));
                    reject(error);
                });
            }
            loadNext(0);
        };
        comp.nextPageRequest = comp.nextPageReuest;
        comp.cardRender = function (first, second, third) { bindCollectionCard(first, second, third, deps); };
        return comp;
    }

    function detail(object, deps) {
        object.page = 1;
        var comp = new Lampa.InteractionCategory(object);
        var limit = 30;
        var maxPages = 1000;
        var seen = {};

        function detailCards(collection) {
            return (Array.isArray(collection.animes) ? collection.animes : []).map(deps.toCard).filter(function (card) {
                var key = String(card.yani_id || '');
                if (!key || seen[key]) return false;
                seen[key] = true;
                return true;
            });
        }

        comp.create = function () {
            var self = this;
            this.activity.loader(true);
            deps.detail(object.collectionId, limit, 0).then(function (payload) {
                var collection = responseValue(payload) || {};
                var anime = Array.isArray(collection.animes) ? collection.animes : [];
                var cards = detailCards(collection);
                if (anime.length < limit) object.page = maxPages;
                self.build({results: cards, total_pages: maxPages, title: collection.title || deps.t('collection')});
                if (!cards.length) deps.error(deps.t('collection_empty'));
            }).catch(function (error) {
                console.error('[YummyAnime Collection]', error);
                self.activity.loader(false);
                deps.error(deps.t('collection_load_error'));
            });
        };
        comp.nextPageReuest = function (requestObject, resolve, reject) {
            var offset = Math.max(0, (Number(requestObject.page || 2) - 1) * limit);
            deps.detail(object.collectionId, limit, offset).then(function (payload) {
                var collection = responseValue(payload) || {};
                var anime = Array.isArray(collection.animes) ? collection.animes : [];
                if (anime.length < limit) requestObject.page = maxPages;
                resolve({results: detailCards(collection), total_pages: maxPages, title: collection.title || deps.t('collection')});
            }).catch(function (error) {
                requestObject.page = Math.max(1, Number(requestObject.page || 2) - 1);
                deps.error(deps.t('next_page_error'));
                reject(error);
            });
        };
        comp.nextPageRequest = comp.nextPageReuest;
        comp.cardRender = deps.cardRender;
        return comp;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Collections = window.LampaYaniCollections = {
        catalog: catalog,
        detail: detail,
        normalize: collectionItems,
        card: collectionCard
    };
}(window));
