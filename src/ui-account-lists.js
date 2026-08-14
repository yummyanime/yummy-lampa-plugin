(function (window) {
    'use strict';

    function responseItems(payload) {
        var value = payload;
        var fields = ['anime', 'animes', 'results', 'items', 'data', 'list', 'values'];
        var depth = 0;

        while (value && !Array.isArray(value) && depth < 4) {
            if (value.response && value.response !== value) {
                value = value.response;
                depth += 1;
                continue;
            }

            var next;
            fields.some(function (field) {
                if (Array.isArray(value[field])) {
                    next = value[field];
                    return true;
                }
                return false;
            });
            if (next) return next;
            break;
        }

        return Array.isArray(value) ? value : [];
    }

    function normalize(payload) {
        return responseItems(payload).map(function (item) {
            if (!item || !item.anime || typeof item.anime !== 'object') return item;
            var anime = Object.assign({}, item.anime);
            if (item.user) anime.user = item.user;
            if (item.date && !anime.date) anime.date = item.date;
            return anime;
        }).filter(Boolean);
    }

    function state(item) {
        return item && (item.user && item.user.list || item.user_list || item.list_state) || null;
    }

    function filterItems(definition, items) {
        return (items || []).filter(function (item) {
            var current = state(item);
            if (!current) return false;
            if (definition.id === 4) return Boolean(current.is_fav || current.is_favorite || current.favorite);
            var list = current.list && typeof current.list === 'object' ? current.list : current;
            return typeof list.id !== 'undefined' && Number(list.id) === Number(definition.id);
        });
    }

    function listVisual(key) {
        var visuals = {
            watching: {from: '#ff6878', to: '#a94372', icon: '<path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.7"/>'},
            planned: {from: '#59bfea', to: '#5367d6', icon: '<path d="M5 18h13a3 3 0 0 0 .4-6A6.5 6.5 0 0 0 6 10.5 3.8 3.8 0 0 0 5 18Z"/>'},
            completed: {from: '#62d39a', to: '#328d75', icon: '<path d="M6 21V4m1 1h10l-2.3 3L17 11H7"/>'},
            dropped: {from: '#97a1b5', to: '#555f78', icon: '<path d="m4 4 16 16M10.6 6.3A9.8 9.8 0 0 1 12 6c5.8 0 9 6 9 6a15 15 0 0 1-2.1 3M7.2 7.3C4.5 9.2 3 12 3 12s3.2 6 9 6c1.1 0 2.1-.2 3-.6"/>'},
            favorites: {from: '#f174ae', to: '#b53f76', icon: '<path d="M20.5 8.8c0 5-8.5 10.2-8.5 10.2S3.5 13.8 3.5 8.8A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.5 1.6Z"/>'},
            postponed: {from: '#efbd68', to: '#bd7546', icon: '<path d="M7 3h10M7 21h10M8 4c0 4 1.2 5.5 4 8-2.8 2.5-4 4-4 8M16 4c0 4-1.2 5.5-4 8 2.8 2.5 4 4 4 8"/>'},
            history: {from: '#a68af0', to: '#6653b4', icon: '<path d="M4 5v5h5M5.2 17a8 8 0 1 0-.8-8M12 7v5l3.5 2"/>'}
        };
        return visuals[key] || visuals.history;
    }

    function listIcon(key) {
        return '<svg viewBox="0 0 24 24" aria-hidden="true">' + listVisual(key).icon + '</svg>';
    }

    function escapeSvgText(value) {
        return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function markCard(card, definition, total, progress) {
        card = Object.assign({}, card || {});
        var key = definition && definition.key || 'history';
        card.yani_list_key = key;
        card.yani_list_title = definition && definition.title || '';
        card.yani_list_total = Number(total || 0);
        card.yani_list_progress = Math.max(0, Math.min(1, Number(progress || 0)));
        return card;
    }

    function cardRenderValues(first, second, third) {
        var card;
        var element;
        [first, second, third].forEach(function (value) {
            if (!value) return;
            var isElement = value.jquery || value.nodeType || typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
            if (isElement && !element) element = value;
            if (!card && value.yani_list_key) card = value;
            if (!card) {
                var candidate = value.card || value.object || value.data;
                if (candidate && candidate.yani_list_key) card = candidate;
            }
        });
        if (!element && card && card.render) element = card.render(true);
        return {card: card, element: element};
    }

    function decorateListCard(first, second, third) {
        var values = cardRenderValues(first, second, third);
        if (!values.card || !values.element) return;
        var card = values.card;
        var render = values.element.jquery ? values.element : $(values.element);
        var view = render.find('.card__view').first();
        if (!view.length && render.hasClass('card__view')) view = render;
        if (!view.length) return;
        render.addClass('yani-user-list-card yani-user-list-card--' + card.yani_list_key);
        render.closest('.category-full, .items-cards').addClass('yani-card-grid');
        if (card.yani_more) render.addClass('yani-user-list-card--more');
        var badge = view.find('.yani-user-list-card__badge');
        if (!badge.length) badge = $('<span class="yani-user-list-card__badge"></span>').prependTo(view);
        badge.html(listIcon(card.yani_list_key));
        if (card.yani_more && typeof card.yani_shortcut_number === 'number') {
            var shortcut = view.find('.yani-user-list-card__shortcut');
            if (!shortcut.length) shortcut = $('<span class="yani-user-list-card__shortcut"></span>').appendTo(view);
            shortcut.empty();
            if (card.yani_shortcut_color) shortcut.append('<i class="yani-user-list-card__shortcut-color yani-user-list-card__shortcut-color--' + card.yani_shortcut_color + '"></i>');
            shortcut.append($('<b></b>').text(card.yani_shortcut_number));
        }
        if (card.yani_list_progress > 0 && card.yani_list_progress < 1 && !card.yani_more) {
            var progress = view.find('.yani-user-list-card__progress');
            if (!progress.length) progress = $('<span class="yani-user-list-card__progress"><i></i></span>').appendTo(view);
            progress.find('i').css('width', Math.round(card.yani_list_progress * 100) + '%');
        }
    }

    function accountList(object, deps) {
        // InteractionCategory only requests the next page when object.page is
        // numeric. Account-list activities are opened without API pagination,
        // so initialise the local pager explicitly for both old and current
        // Lampa builds.
        object.page = 1;
        var comp = new Lampa.InteractionCategory(object);
        var items = [];
        var pageSize = 30;
        var totalPages = 1;
        var destroyed = false;
        var controls = LampaYaniAccountListControls.create({
            comp: comp,
            object: object,
            t: deps.t,
            showSelect: deps.showSelect,
            onSelect: function (sort) {
                var next = Object.assign({}, object, {
                    url: String(object.url || 'yani/account/list').replace(/\/sort\/[^/]+$/, '') + '/sort/' + sort,
                    sort: sort,
                    page: 1,
                    lazy: false,
                    items: items
                });
                Lampa.Activity.replace(next);
            }
        });

        function pageCards(page) {
            var start = Math.max(0, (page - 1) * pageSize);
            return items.slice(start, start + pageSize).map(function (item) {
                return markCard(deps.toCard(item), object.definition, items.length, LampaYaniAccountListControls.progress(item));
            });
        }

        comp.create = function () {
            var self = this;
            this.activity.loader(true);
            var source = object.lazy && deps.loadItems
                ? deps.loadItems(object.definition)
                : Promise.resolve(object.items || []);
            source.then(function (loaded) {
                if (destroyed) return;
                items = controls.sort(Array.isArray(loaded) ? loaded : []);
                totalPages = Math.max(1, Math.ceil(items.length / pageSize));
                self.build({results: pageCards(1), total_pages: totalPages, title: object.title});
                controls.install(items.length);
            }).catch(function (error) {
                if (destroyed) return;
                console.error('[YummyAnime User List]', error);
                self.build({results: [], total_pages: 1, title: object.title});
                if (deps.onError) deps.onError(error);
            });
        };
        comp.nextPageReuest = function (requestObject, resolve) {
            var page = Math.max(2, Number(requestObject.page) || 2);
            resolve({results: pageCards(page), total_pages: totalPages, title: object.title});
        };
        comp.nextPageRequest = comp.nextPageReuest;
        comp.cardRender = function (first, second, third) {
            if (deps.cardRender) deps.cardRender(first, second, third);
            decorateListCard(first, second, third);
        };
        var originalDestroy = comp.destroy;
        comp.destroy = function () {
            destroyed = true;
            controls.destroy();
            if (originalDestroy) originalDestroy.apply(this, arguments);
        };
        return comp;
    }
    function subscriptions(object, deps) {
        var comp = new Lampa.InteractionCategory(object);
        comp.create = function () {
            var self = this; this.activity.loader(true);
            LampaYaniApi.subscriptions(object.userId).then(function (payload) {
                var response = payload && payload.response ? payload.response : payload, values = Array.isArray(response) ? response : response && (response.anime || response.items || response.data || response.subscriptions) || [];
                var cards = values.map(function (item) { var source = item && (item.anime || item.title_data || item.object) || item; return source && (source.anime_id || source.id || source.title) ? deps.toCard(source) : null; }).filter(Boolean);
                if (!cards.length) Lampa.Noty.show(deps.t('subscriptions_empty'));
                self.build({results: cards, total_pages: 1, title: deps.t('subscriptions')});
            }).catch(function (error) { console.error('[YummyAnime Subscriptions]', error); self.activity.loader(false); Lampa.Noty.show(deps.t('subscriptions_error')); });
        };
        comp.cardRender = deps.cardRender;
        return comp;
    }

    function userLists(object, deps) {
        var component = new Lampa.InteractionMain(object);
        var destroyed = false;
        var remoteShortcutHandler = null;
        var shortcutRows = {};

        function remoteColor(event) {
            var key = String(event && (event.key || event.code || '') || '').toLowerCase();
            var code = Number(event && (event.keyCode || event.which));
            if (key === 'colorf0red' || key === 'red' || code === 403) return 'red';
            if (key === 'colorf1green' || key === 'green' || code === 404) return 'green';
            if (key === 'colorf2yellow' || key === 'yellow' || code === 405) return 'yellow';
            if (key === 'colorf3blue' || key === 'blue' || code === 406) return 'blue';
            return '';
        }

        function openShortcutRow(row) {
            if (!row) return;
            if (row.history) deps.openHistory();
            else if (row.definition) deps.openList(row.definition);
        }

        function handleRemoteShortcut(event) {
            var root = component.render ? component.render() : $();
            if (!root.length || !root.is(':visible') || event.defaultPrevented || $(event.target).closest('input, textarea, select, [contenteditable=true]').length) return;
            var color = remoteColor(event);
            var number = Number(event && (event.keyCode || event.which));
            var byColor = {red: 'watching', green: 'planned', yellow: 'favorites', blue: 'history'};
            var ordered = ['watching', 'planned', 'completed', 'dropped', 'favorites', 'postponed'];
            var row = color ? shortcutRows[byColor[color]] : number >= 49 && number <= 54 ? shortcutRows[ordered[number - 49]] : number === 48 ? shortcutRows.history : null;
            if (!row) return;
            event.preventDefault(); event.stopPropagation(); openShortcutRow(row);
        }

        function shortcutMeta(row) {
            var key = row.history ? 'history' : row.definition && row.definition.key || '';
            var numbers = {watching: 1, planned: 2, completed: 3, dropped: 4, favorites: 5, postponed: 6, history: 0};
            var colors = {watching: 'red', planned: 'green', favorites: 'yellow', history: 'blue'};
            return {number: numbers[key], color: colors[key] || ''};
        }

        function morePoster(row) {
            var key = row.history ? 'history' : row.definition && row.definition.key || 'history';
            var visual = listVisual(key);
            var title = escapeSvgText(deps.t('more'));
            var total = Math.max(0, Number(row.total || 0));
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="540" viewBox="0 0 360 540">' +
                '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + visual.from + '"/><stop offset="1" stop-color="' + visual.to + '"/></linearGradient><radialGradient id="r"><stop stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
                '<rect width="360" height="540" rx="28" fill="url(#g)"/><circle cx="292" cy="92" r="170" fill="url(#r)"/><path d="M-30 430C90 330 212 478 390 340v210H-30Z" fill="#090a12" opacity=".16"/>' +
                '<g transform="translate(120 124) scale(5)" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + visual.icon + '</g>' +
                '<text x="180" y="354" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="48" font-weight="700">' + title + '</text>' +
                '<text x="180" y="406" text-anchor="middle" fill="#fff" fill-opacity=".72" font-family="sans-serif" font-size="30">' + total + '</text>' +
                '<path d="m160 458 40 0m-13-13 13 13-13 13" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        }

        function withMore(row) {
            var definition = row.history ? {key: 'history', title: row.title} : row.definition;
            var results = (row.results || []).slice(0, 10).map(function (card) {
                return markCard(card, definition, row.total, card.yani_list_progress);
            });
            var poster = morePoster(row);
            var shortcut = shortcutMeta(row);
            results.push({
                title: deps.t('more'),
                poster: poster,
                img: poster,
                yani_more: true,
                yani_list_key: definition && definition.key || 'history',
                yani_list_title: row.title,
                yani_list_total: Number(row.total || 0),
                yani_definition: row.definition,
                yani_history: Boolean(row.history),
                yani_shortcut_number: shortcut.number,
                yani_shortcut_color: shortcut.color
            });
            return {
                title: row.title + (typeof row.total === 'number' ? ' · ' + row.total : ''),
                results: results,
                nomore: true,
                definition: row.definition,
                history: row.history,
                card_events: {
                    onEnter: function (target, card) {
                        if (card && card.yani_more) {
                            if (card.yani_history) deps.openHistory();
                            else deps.openList(card.yani_definition);
                            return;
                        }
                        deps.openCard(card);
                    }
                }
            };
        }

        component.create = function () {
            if (!LampaYaniAuth.token()) {
                Lampa.Noty.show(deps.t('login_required'));
                deps.goBack();
                return;
            }
            var self = this;
            this.activity.loader(true);
            deps.loadRows().then(function (rows) {
                if (destroyed) return;
                (rows || []).forEach(function (row) {
                    if (row.history) shortcutRows.history = row;
                    else if (row.definition && row.definition.key) shortcutRows[row.definition.key] = row;
                });
                self.build((rows || []).map(withMore));
                if (self.render) {
                    var root = self.render().addClass('yani-user-lists-view');
                    remoteShortcutHandler = handleRemoteShortcut;
                    document.addEventListener('keydown', remoteShortcutHandler, true);
                }
            }).catch(function (error) {
                if (destroyed) return;
                console.error('[YummyAnime User Lists]', error);
                self.build([]);
                if (deps.onError) deps.onError(error);
            });
        };
        component.cardRender = decorateListCard;
        LampaYaniNavigation.attachComponent(component, {
            id: 'user-lists:' + String(object && object.url || 'yani/user-lists'),
            root: function () { return component.render ? component.render() : $(); },
            collection: function () { return component.render ? component.render() : $(); },
            selector: '.selector'
        });
        var originalDestroy = component.destroy;
        component.destroy = function () {
            destroyed = true;
            if (remoteShortcutHandler) document.removeEventListener('keydown', remoteShortcutHandler, true);
            remoteShortcutHandler = null;
            if (originalDestroy) originalDestroy.apply(this, arguments);
        };
        return component;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.AccountLists = window.LampaYaniAccountLists = {
        accountList: accountList,
        subscriptions: subscriptions,
        userLists: userLists,
        normalize: normalize,
        filterItems: filterItems,
        listVisual: listVisual
    };
}(window));
