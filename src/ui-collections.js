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
            yani_collection_tile: true,
            yani_collection: collection,
            yani_collection_previews: previews,
            yani_collection_views: Number(collection.views || 0),
            yani_collection_likes: likes,
            yani_collection_count: Number(collection.animes_count || collection.count || collection.total || (Array.isArray(collection.animes) ? collection.animes.length : 0) || 0)
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

        rendered.addClass('yani-collection-card yani-collection-catalog-tile');
        if (!rendered.closest('.yani-card-rails').length) {
            rendered.closest('.category-full, .items-cards').addClass('yani-card-grid');
        }

        if (view.length && !view.find('.yani-collection-tile-card__copy').length) {
            var copy = $('<div class="yani-collection-tile-card__copy"></div>');
            copy.append($('<strong></strong>').text(card.title || ''));
            if (card.yani_collection_count) {
                copy.append($('<span></span>').text(card.yani_collection_count + ' ' + deps.t('anime_count')));
            }
            view.append(copy);
        }
    }

    function uniqueCollections(items, seen) {
        return (items || []).filter(function (collection) {
            var id = collection && collection.id;
            var key = id === undefined || id === null ? String(collection && collection.title || '') : String(id);
            if (!key || seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    function hub(object, deps) {
        var collectionsRequest = null;
        var collections = [];
        var seen = {};
        var catalogOffset = 0;
        var catalogDone = false;
        var pageSize = 4;

        function fromPayload(payload) {
            var response = responseValue(payload) || {};
            var items = Array.isArray(response.collections) ? response.collections : collectionItems(payload);
            return uniqueCollections(items, seen);
        }

        function rememberCatalogPage(payload) {
            var raw = collectionItems(payload);
            catalogOffset += raw.length;
            catalogDone = raw.length < 20;
            collections = collections.concat(fromPayload(payload));
            return collections;
        }

        function loadCollectionList() {
            if (collectionsRequest) return collectionsRequest;
            collectionsRequest = deps.feed().then(function (payload) {
                var items = fromPayload(payload);
                if (items.length) {
                    collections = items;
                    return collections;
                }
                return deps.load(20, 0).then(rememberCatalogPage);
            }).catch(function () {
                return deps.load(20, 0).then(rememberCatalogPage);
            });
            return collectionsRequest;
        }

        function ensureCollections(needed) {
            return loadCollectionList().then(function () {
                if (collections.length >= needed || catalogDone) return collections;
                return deps.load(20, catalogOffset).then(function (payload) {
                    rememberCatalogPage(payload);
                    return ensureCollections(needed);
                }).catch(function () {
                    catalogDone = true;
                    return collections;
                });
            });
        }

        function ensureAllCollections() {
            return loadCollectionList().then(function () {
                if (catalogDone) return collections;
                return deps.load(20, catalogOffset).then(function (payload) {
                    rememberCatalogPage(payload);
                    return ensureAllCollections();
                }).catch(function () {
                    catalogDone = true;
                    return collections;
                });
            });
        }

        function collectionTileFallback(title, index) {
            var colors = [
                ['#a68af0', '#6653b4'],
                ['#ef7086', '#954e86'],
                ['#58b9c3', '#3564a5'],
                ['#e4a15c', '#b84f68']
            ][index % 4];
            var raw = String(title || '');
            var display = raw.length > 24 ? raw.slice(0, 23) + '…' : raw;
            var label = display.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            var size = display.length > 18 ? 25 : display.length > 13 ? 28 : 32;
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="440" height="248" viewBox="0 0 440 248">' +
                '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + colors[0] + '"/><stop offset="1" stop-color="' + colors[1] + '"/></linearGradient></defs>' +
                '<rect width="440" height="248" rx="28" fill="url(#g)"/><circle cx="370" cy="40" r="125" fill="#fff" opacity=".1"/>' +
                '<path d="M48 65 112 38l64 27-64 27-64-27Zm0 40 64 27 64-27m-128 40 64 27 64-27" fill="none" stroke="#fff" stroke-opacity=".72" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<text x="205" y="205" fill="#fff" font-family="sans-serif" font-size="' + size + '" font-weight="700">' + label + '</text></svg>';
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        }

        function collectionTilesRow(list) {
            var cards = (list || []).map(function (collection, index) {
                var title = collection.title || collection.name || deps.t('collection');
                var previews = previewPosters(collection);
                var poster = previews[0] || collectionTileFallback(title, index);
                return {
                    title: title,
                    poster: poster,
                    img: poster,
                    yani_collection_tile: true,
                    yani_collection: collection,
                    yani_collection_count: Number(collection.animes_count || collection.count || collection.total || (collection.animes || []).length || 0)
                };
            });
            return {
                title: deps.t('collections') + ' · ' + cards.length,
                yani_collection_tiles: true,
                results: cards,
                nomore: true,
                card_events: {
                    onEnter: function (target, card) {
                        if (card && card.yani_collection) deps.open(card.yani_collection);
                    },
                    onFocus: function (target, card) {
                        // Lazily add text overlay when cardRender did not run
                        if (!card || !card.yani_collection_tile || !target) return;
                        var view = $(target).find('.card__view').first();
                        if (!view.length || view.find('.yani-collection-tile-card__copy').length) return;
                        var copy = $('<div class="yani-collection-tile-card__copy"></div>');
                        copy.append($('<strong></strong>').text(card.title || ''));
                        if (card.yani_collection_count) {
                            copy.append($('<span></span>').text(card.yani_collection_count + ' ' + deps.t('anime_count')));
                        }
                        view.append(copy);
                    }
                }
            };
        }

        function rowFor(collection) {
            var existing = Array.isArray(collection.animes) ? collection.animes : [];
            var load = existing.length
                ? Promise.resolve(collection)
                : deps.detail(collection.id, 11, 0).then(function (payload) {
                    return Object.assign({}, collection, responseValue(payload) || {});
                }).catch(function () { return collection; });
            return load.then(function (full) {
                var animes = Array.isArray(full.animes) ? full.animes : existing;
                var cards = animes.slice(0, 10).map(deps.toCard).filter(Boolean);
                if (!cards.length) return null;
                var total = Number(full.animes_count || full.count || full.total || collection.animes_count || animes.length) || cards.length;
                return {
                    title: collection.title || collection.name || deps.t('collection'),
                    total: total,
                    results: cards,
                    onMore: function () { deps.open(collection); },
                    visual: {
                        from: '#a68af0',
                        to: '#6653b4',
                        icon: '<path d="M4 6.5 12 3l8 3.5-8 3.5-8-3.5Z"/><path d="m4 11 8 3.5 8-3.5M4 15.5 12 19l8-3.5"/>'
                    }
                };
            });
        }

        function loadPage(page, size) {
            size = Math.max(1, Number(size || pageSize));
            var offset = Math.max(0, Number(page || 0)) * size;
            var source = Number(page || 0) === 0 ? ensureAllCollections() : ensureCollections(offset + size);
            return source.then(function (list) {
                var batch = list.slice(offset, offset + size);
                if (!batch.length) return [];
                return window.LampaYaniCardRails.mapLimit(batch, size, rowFor).then(function (rows) {
                    rows = rows.filter(Boolean);
                    return Number(page || 0) === 0 ? [collectionTilesRow(list)].concat(rows) : rows;
                });
            });
        }

        return window.LampaYaniCardRails.create(object, {
            id: 'collections:' + String(object && object.url || 'yani/collections'),
            viewClass: 'yani-collections-hub',
            t: deps.t,
            openCard: deps.openCard,
            decorate: deps.decorate,
            onError: function () { if (deps.error) deps.error(deps.t('collections_load_error')); },
            pageSize: pageSize,
            loadPage: loadPage
        });
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
        var catalogCards = [];
        var destroyed = false;

        function uniqueCards(items) {
            return (items || []).map(function (collection) {
                var id = collection && collection.id;
                var key = id === undefined || id === null ? String(collection && collection.title || '') : String(id);
                if (!key || seen[key]) return null;
                seen[key] = true;
                var card = collectionCard(collection);
                card.params = {
                    on: {
                        'hover:enter': function () { deps.open(collection); }
                    }
                };
                return card;
            }).filter(Boolean);
        }

        function bindVisibleCollectionTiles(self, cards) {
            var root = self && self.render ? self.render() : null;
            if (!root) return;
            $(root).find('.card').each(function (index) {
                var card = this.card_data && this.card_data.yani_collection ? this.card_data : cards[index];
                if (card) bindCollectionCard(this, card, null, deps);
            });
        }

        function buildInitial(self, items) {
            catalogCards = uniqueCards(items);
            self.build({results: catalogCards, total_pages: maxPages, title: deps.t('collections')});
            if (self.activity && self.activity.loader) self.activity.loader(false);
            if (self.render) self.render().addClass('yani-tile-catalog yani-collections-tile-catalog');
            bindVisibleCollectionTiles(self, catalogCards);
            setTimeout(function () { bindVisibleCollectionTiles(self, catalogCards); }, 0);
        }

        comp.create = function () {
            var self = this;
            var activityView = this.activity.render && this.activity.render(true);
            if (activityView) $(activityView).find('.yani-section-state-host').remove();
            this.activity.loader(true);
            var control = {timeout: 8000, retry: false};
            Promise.all([
                deps.feed(control).catch(function (error) { return {__error: error}; }),
                deps.load(limit, 0, control).catch(function (error) { return {__error: error}; })
            ]).then(function (payloads) {
                if (destroyed) return;
                var feedResponse = responseValue(payloads[0]) || {};
                var feedItems = Array.isArray(feedResponse.collections) ? feedResponse.collections : [];
                var catalogItems = payloads[1] && payloads[1].__error ? [] : collectionItems(payloads[1]);
                var items = feedItems.length ? feedItems : catalogItems;
                if (!items.length) throw payloads[1].__error || payloads[0].__error || new Error('Collections are empty');
                requestedOffsets[0] = true;
                nextCatalogOffset = catalogItems.length;
                catalogDone = catalogItems.length > 0 && catalogItems.length < limit;
                buildInitial(self, items);
            }).catch(function (error) {
                if (destroyed) return;
                console.error('[YummyAnime Collections]', error);
                if (self.activity && self.activity.loader) self.activity.loader(false);
                var states = LampaYaniSectionState.forActivity(self.activity, {t: deps.t});
                states.offline({
                    title: deps.t('collections_load_error'),
                    onRetry: function () { self.create(); }
                });
                self.activity.toggle();
                states.focus();
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
                deps.load(limit, offset, {timeout: 8000, retry: false}).then(function (payload) {
                    var raw = collectionItems(payload);
                    nextCatalogOffset = offset + raw.length;
                    catalogDone = raw.length < limit;
                    var cards = uniqueCards(raw);
                    catalogCards = catalogCards.concat(cards);
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
        var originalCatalogDestroy = comp.destroy;
        comp.destroy = function () {
            destroyed = true;
            if (originalCatalogDestroy) originalCatalogDestroy.apply(this, arguments);
        };
        return comp;
    }

    function detail(object, deps) {
        object.page = 1;
        var comp = new Lampa.InteractionCategory(object);
        var limit = 30;
        var maxPages = 1000;
        var seen = {};
        var destroyed = false;

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
                if (destroyed) return;
                var collection = responseValue(payload) || {};
                var anime = Array.isArray(collection.animes) ? collection.animes : [];
                var cards = detailCards(collection);
                if (anime.length < limit) object.page = maxPages;
                self.build({results: cards, total_pages: maxPages, title: collection.title || deps.t('collection')});
                if (self.activity && self.activity.loader) self.activity.loader(false);
                if (self.render) self.render().addClass('yani-collection-view');
                if (!cards.length) deps.error(deps.t('collection_empty'));
            }).catch(function (error) {
                if (destroyed) return;
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
        var originalDetailDestroy = comp.destroy;
        comp.destroy = function () {
            destroyed = true;
            if (originalDetailDestroy) originalDetailDestroy.apply(this, arguments);
        };
        return comp;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Collections = window.LampaYaniCollections = {
        catalog: catalog,
        hub: hub,
        detail: detail,
        normalize: collectionItems,
        card: collectionCard
    };
}(window));
