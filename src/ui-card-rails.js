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
            if (!card && value.yani_id) card = value;
            if (!card) {
                var candidate = value.card || value.object || value.data;
                if (candidate && (candidate.yani_more || candidate.yani_id)) card = candidate;
            }
        });
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

    function rowNeedsMore(index, count, size) {
        size = Math.max(1, Number(size || 4));
        count = Math.max(0, Number(count || 0));
        index = Number(index);
        if (!count || !isFinite(index) || index < 0) return false;
        var remaining = count - 1 - index;
        if (remaining >= size) return false;
        return (index + 1) % size === 0 || remaining <= 0;
    }

    function decorateCard(first, second, third, deps) {
        var values = renderValues(first, second, third);
        if (!values.card || !values.element) return;
        var render = values.element.jquery ? values.element : $(values.element);
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
        var nextPage = 0;
        var loadingPage = false;
        var finished = false;
        var renderedRows = 0;
        var boundaryTimer = 0;
        var retryAfter = 0;

        function prepare(rows) {
            return (rows || []).filter(Boolean).map(function (row) {
                return withMore(row, deps);
            });
        }

        function loadPage(page) {
            if (typeof deps.loadPage === 'function') {
                return Promise.resolve(deps.loadPage(page, pageSize));
            }
            if (page === 0) return Promise.resolve(deps.loadRows ? deps.loadRows() : []);
            return Promise.resolve([]);
        }

        function requestNext(resolve, reject) {
            if (destroyed || finished) {
                if (reject) reject();
                return;
            }
            if (Date.now() < retryAfter) return;
            // A second end-of-scroll tick while a page is in flight must not
            // reject: Lampa treats reject as "no more rows" and never asks again.
            if (loadingPage) return;
            loadingPage = true;

            function attempt(page, hops) {
                return loadPage(page).then(function (rows) {
                    if (destroyed) return;
                    rows = (rows || []).filter(Boolean);
                    if (rows.length) {
                        loadingPage = false;
                        nextPage = page + 1;
                        resolve(prepare(rows));
                        return;
                    }
                    if (hops >= 8) {
                        loadingPage = false;
                        finished = true;
                        if (reject) reject();
                        return;
                    }
                    return attempt(page + 1, hops + 1);
                });
            }

            attempt(nextPage, 0).catch(function (error) {
                loadingPage = false;
                retryAfter = Date.now() + 3000;
                if (reject) reject(error);
                else if (deps.onError) deps.onError(error);
            });
        }

        function rowCount() {
            if (component.items && component.items.length) return component.items.length;
            return renderedRows;
        }

        function loadIfBoundary(index) {
            var count = rowCount();
            if (index == null || index < 0) index = count - 1;
            if (!rowNeedsMore(index, count, pageSize)) return;
            requestNext(appendRows, function () {});
        }

        function appendRows(rows) {
            if (destroyed || !rows || !rows.length) return;
            renderedRows += rows.length;
            // Later pages must not go through InteractionMain.build(): that
            // toggles the activity and steals focus from the row the user is on.
            if (typeof component.emit === 'function') component.emit('build', rows);
            else component.build(rows);
            bindScrollEnd();
            bindRowTriggers();
            // If the user is already sitting on the 8th/12th/... row, do not
            // wait for another end-of-scroll event that Lampa will not fire.
            loadIfBoundary(Number(component.active || 0));
        }

        function bindScrollEnd() {
            if (!component.scroll) return;
            component.scroll.onEnd = function () {
                loadIfBoundary(rowCount() - 1);
            };
        }

        function startBoundaryWatcher() {
            if (boundaryTimer || typeof setInterval !== 'function') return;
            boundaryTimer = setInterval(function () {
                if (destroyed || finished || loadingPage) return;
                loadIfBoundary(Number(component.active || 0));
            }, 300);
        }

        function bindRowTriggers() {
            var items = component.items;
            if (!items || !items.length) return;
            items.forEach(function (item, index) {
                if (!item || item._yani_rail_more) return;
                item._yani_rail_more = true;
                if (typeof item.use === 'function') {
                    item.use({
                        onToggle: function () {
                            var current = items.indexOf(item);
                            loadIfBoundary(current < 0 ? index : current);
                        }
                    });
                    return;
                }
                var toggle = item.toggle;
                if (typeof toggle !== 'function') return;
                item.toggle = function () {
                    var result = toggle.apply(this, arguments);
                    var current = (component.items || items).indexOf(item);
                    loadIfBoundary(current < 0 ? index : current);
                    return result;
                };
            });
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
            // Modern InteractionMain wires wheel / onAnimateEnd here. Skipping
            // this leaves onNext able to fetch rows that never get appended.
            if (typeof self.emit === 'function') self.emit('create');
        }

        component.create = function () {
            var self = this;
            mountInteraction(self);
            loadPage(0).then(function (rows) {
                if (destroyed) return;
                rows = (rows || []).filter(Boolean);
                nextPage = 1;
                renderedRows = rows.length;
                if (!rows.length) finished = true;
                self.build(prepare(rows));
                if (self.render) self.render().addClass('yani-card-rails ' + (deps.viewClass || ''));
                bindScrollEnd();
                bindRowTriggers();
                startBoundaryWatcher();
                // The first end-of-scroll event is easy to miss on TV (4 rows
                // and a 1s InteractionMain guard). Prefetch the next batch so
                // the fifth row is already on the way when the user reaches it.
                if (!finished) requestNext(appendRows, function () {});
            }).catch(function (error) {
                if (destroyed) return;
                console.error('[YummyAnime Card Rails]', error);
                self.build([]);
                if (deps.onError) deps.onError(error);
            });
        };
        component.cardRender = function (first, second, third) {
            decorateCard(first, second, third, deps);
        };
        component.nextPageReuest = function (requestObject, resolve, reject) {
            requestNext(resolve, reject);
        };
        component.nextPageRequest = component.nextPageReuest;
        if (typeof component.use === 'function') {
            component.use({
                onNext: requestNext,
                onInstance: function (item) {
                    if (!item || item._yani_rail_more) return;
                    item._yani_rail_more = true;
                    if (typeof item.use !== 'function') return;
                    item.use({
                        onToggle: function () {
                            var current = (component.items || []).indexOf(item);
                            loadIfBoundary(current);
                        }
                    });
                },
                onDown: function () {
                    loadIfBoundary(Number(component.active || 0));
                }
            });
        }
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
            if (boundaryTimer) clearInterval(boundaryTimer);
            boundaryTimer = 0;
            if (originalDestroy) originalDestroy.apply(this, arguments);
        };
        return component;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.CardRails = window.LampaYaniCardRails = {
        create: create,
        mapLimit: mapLimit,
        withMore: withMore,
        morePoster: morePoster,
        rowNeedsMore: rowNeedsMore
    };
}(window));
