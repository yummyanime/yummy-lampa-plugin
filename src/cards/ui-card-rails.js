(function (window) {
    'use strict';

    function escapeSvgText(value) {
        return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function mapLimit(items, limit, mapper) {
        items = items || [];
        limit = Math.max(1, Number(limit) || 1);
        return new Promise(function (resolve, reject) {
            var index = 0;
            var active = 0;
            var results = new Array(items.length);
            function next() {
                if (index >= items.length && active === 0) return resolve(results);
                while (active < limit && index < items.length) {
                    (function (current) {
                        active += 1;
                        Promise.resolve(mapper(items[current], current)).then(function (value) {
                            results[current] = value;
                            active -= 1;
                            next();
                        }).catch(reject);
                    }(index++));
                }
            }
            if (!items.length) resolve([]);
            else next();
        });
    }

    function renderValues(first, second, third) {
        var card;
        var element;
        [first, second, third].forEach(function (value) {
            if (!value) return;
            var isElement = value.jquery || value.nodeType || typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
            if (isElement && !element) element = value;
            if (!card && value.yani_more) card = value;
            if (!card && value.yani_genre_tile) card = value;
            if (!card && value.yani_collection_tile) card = value;
            if (!card && value.yani_id) card = value;
            if (!card) {
                var candidate = value.card || value.object || value.data;
                if (candidate && (candidate.yani_more || candidate.yani_genre_tile || candidate.yani_collection_tile || candidate.yani_id)) card = candidate;
            }
        });
        // Current Lampa builds can call cardRender with the rendered node only.
        // Card stores the original payload on that node as `card_data`.
        var node = element && element.jquery ? element[0] : element;
        if (!card && node && node.card_data) {
            var data = node.card_data;
            if (data.yani_more || data.yani_genre_tile || data.yani_collection_tile || data.yani_id) card = data;
        }
        if (!element && card && card.render) element = card.render(true);
        return {card: card, element: element};
    }

    function morePoster(row, title) {
        var visual = row && row.visual || {};
        var from = visual.from || '#a68af0';
        var to = visual.to || '#6653b4';
        var icon = visual.icon || '<path d="m9 6 6 6-6 6"/>';
        var label = escapeSvgText(title);
        var total = Math.max(0, Number(row && row.total || 0));
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="540" viewBox="0 0 360 540">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + from + '"/><stop offset="1" stop-color="' + to + '"/></linearGradient><radialGradient id="r"><stop stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
            '<rect width="360" height="540" rx="28" fill="url(#g)"/><circle cx="292" cy="92" r="170" fill="url(#r)"/><path d="M-30 430C90 330 212 478 390 340v210H-30Z" fill="#090a12" opacity=".16"/>' +
            '<g transform="translate(120 124) scale(5)" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + icon + '</g>' +
            '<text x="180" y="354" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="48" font-weight="700">' + label + '</text>' +
            (total ? '<text x="180" y="406" text-anchor="middle" fill="#fff" fill-opacity=".72" font-family="sans-serif" font-size="30">' + total + '</text>' : '') +
            '<path d="m160 458 40 0m-13-13 13 13-13 13" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function withMore(row, deps) {
        var results = (row.results || []).slice(0, 10);
        var poster = morePoster(row, deps.t('more'));
        results.push({
            title: deps.t('more'),
            poster: poster,
            img: poster,
            yani_more: true,
            yani_on_more: row.onMore
        });
        return {
            title: row.title + (typeof row.total === 'number' && row.total > 0 && row.title.indexOf('·') < 0 ? ' · ' + row.total : ''),
            results: results,
            nomore: true,
            card_events: {
                onEnter: function (target, card) {
                    if (card && card.yani_more) {
                        if (typeof card.yani_on_more === 'function') card.yani_on_more();
                        return;
                    }
                    if (deps.openCard) deps.openCard(card);
                }
            }
        };
    }

    function decorateCard(first, second, third, deps) {
        var values = renderValues(first, second, third);
        if (!values.card || !values.element) return;
        var render = values.element.jquery ? values.element : $(values.element);
        if (values.card.yani_genre_tile) {
            render.addClass('yani-genre-tile-card');
            return;
        }
        if (values.card.yani_collection_tile) {
            render.addClass('yani-collection-tile-card');
            var view = render.find('.card__view').first();
            if (view.length && !view.find('.yani-collection-tile-card__copy').length) {
                var copy = $('<div class="yani-collection-tile-card__copy"></div>');
                copy.append($('<strong></strong>').text(values.card.title || ''));
                if (values.card.yani_collection_count) {
                    copy.append($('<span></span>').text(values.card.yani_collection_count + ' ' + deps.t('anime_count')));
                }
                view.append(copy);
            }
            return;
        }
        if (values.card.yani_more) {
            render.addClass('yani-rail-more');
            return;
        }
        if (deps.decorate) deps.decorate(render, values.card);
    }

    function create(object, deps) {
        deps = deps || {};
        var component = new Lampa.InteractionMain(object);
        var destroyed = false;
        var pageSize = Math.max(1, Number(deps.pageSize || 4));
        var fetchBatch = Math.max(1, Number(deps.fetchBatch || pageSize));
        var maxPages = Math.max(1, Number(deps.maxPages || 64));

        function prepare(rows) {
            return (rows || []).filter(Boolean).map(function (row) {
                if (row.yani_genre_tiles || row.yani_collection_tiles) return row;
                return withMore(row, deps);
            });
        }

        function loadPage(page) {
            if (typeof deps.loadPage === 'function') {
                return Promise.resolve(deps.loadPage(page, fetchBatch));
            }
            if (page === 0) return Promise.resolve(deps.loadRows ? deps.loadRows() : []);
            return Promise.resolve([]);
        }

        // Lampa InteractionMain only renders additional rows reliably through
        // its own next/pushLoaded queue. Incremental emit('build') after the
        // first screen leaves the scroll stuck at eight rows on real devices,
        // so hub screens fetch every batch up front and call build() once.
        function loadAllRows() {
            var rows = [];
            var page = 0;
            var emptyStreak = 0;

            function step() {
                if (destroyed || page >= maxPages) return Promise.resolve(rows);
                return loadPage(page).then(function (batch) {
                    batch = (batch || []).filter(Boolean);
                    if (batch.length) {
                        rows = rows.concat(batch);
                        emptyStreak = 0;
                        page += 1;
                        return step();
                    }
                    emptyStreak += 1;
                    if (emptyStreak >= 2) return rows;
                    page += 1;
                    return step();
                });
            }

            return step();
        }

        // Lampa's compiled build may call cardRender with only the DOM node,
        // so class-per-card is unreliable. Instead, mark the items-line container
        // for the tiles row by position, letting CSS handle all cards inside it.
        function markTilesLines(self, rows) {
            var body = self.scroll && self.scroll.body ? self.scroll.body(true) : null;
            if (!body && self.scroll && self.scroll.render) {
                var root = self.scroll.render(true);
                body = root && root.querySelector ? root.querySelector('.scroll__body') : root;
            }
            if (!body) return;
            var bodyNode = body.jquery ? body[0] : body;
            if (!bodyNode || !bodyNode.querySelectorAll) return;
            var allLines = bodyNode.querySelectorAll('.items-line');
            rows.forEach(function (row, i) {
                if (!row) return;
                var line = allLines[i];
                if (!line) return;
                if (row.yani_genre_tiles) line.className += ' yani-genre-tiles-line';
                else if (row.yani_collection_tiles) line.className += ' yani-collection-tiles-line';
            });
        }

        function prependHeader(self, node) {
            if (!node) return;
            var element = node.jquery ? node[0] : node;
            if (!element) return;
            var body = self.scroll && self.scroll.body ? self.scroll.body(true) : null;
            if (!body && self.scroll && self.scroll.render) {
                var root = self.scroll.render(true);
                body = root && root.querySelector ? root.querySelector('.scroll__body') : root;
            }
            if (!body) return;
            if (body.insertBefore) body.insertBefore(element, body.firstChild || null);
            else if (body.prepend) body.prepend(element);
        }

        function mountInteraction(self) {
            if (self.activity && self.activity.loader) self.activity.loader(true);
            if (self.scroll && typeof self.scroll.minus === 'function') self.scroll.minus();
            var host = self.html;
            var scrollNode = self.scroll && self.scroll.render ? self.scroll.render(true) : null;
            if (host && scrollNode) {
                if (host.jquery) {
                    if (!host.find('.scroll').length) host.append(scrollNode);
                } else if (typeof host.append === 'function' && (!host.contains || !host.contains(scrollNode))) {
                    host.append(scrollNode);
                }
            }
            if (typeof self.emit === 'function') self.emit('create');
        }

        component.create = function () {
            var self = this;
            mountInteraction(self);

            var header = typeof deps.header === 'function'
                ? Promise.resolve(deps.header(self))
                : Promise.resolve(null);

            Promise.all([header, loadAllRows()]).then(function (result) {
                if (destroyed) return;
                var rows = (result[1] || []).filter(Boolean);
                var preparedRows = prepare(rows);
                self.build(preparedRows);
                if (self.render) self.render().addClass('yani-card-rails ' + (deps.viewClass || ''));
                prependHeader(self, result[0]);
                markTilesLines(self, preparedRows);
                if (self.activity && self.activity.loader) self.activity.loader(false);
            }).catch(function (error) {
                if (destroyed) return;
                console.error('[YummyAnime Card Rails]', error);
                self.build([]);
                if (self.activity && self.activity.loader) self.activity.loader(false);
                if (deps.onError) deps.onError(error);
            });
        };
        component.cardRender = function (first, second, third) {
            decorateCard(first, second, third, deps);
        };
        component.nextPageReuest = function (requestObject, resolve, reject) {
            if (reject) reject();
        };
        component.nextPageRequest = component.nextPageReuest;
        if (window.LampaYaniNavigation && LampaYaniNavigation.attachComponent) {
            LampaYaniNavigation.attachComponent(component, {
                id: deps.id || ('card-rails:' + String(object && object.url || 'yani/rails')),
                root: function () { return component.render ? component.render() : $(); },
                collection: function () { return component.render ? component.render() : $(); },
                selector: '.selector'
            });
        }
        var originalDestroy = component.destroy;
        component.destroy = function () {
            destroyed = true;
            if (originalDestroy) originalDestroy.apply(this, arguments);
        };
        return component;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.CardRails = window.LampaYaniCardRails = {
        create: create,
        mapLimit: mapLimit,
        withMore: withMore,
        morePoster: morePoster
    };
}(window));
