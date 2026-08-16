(function (window) {
    'use strict';

    function catalogSortIcon(key) {
        var icons = {
            top: '<svg viewBox="0 0 24 24"><path d="M8 4h8v3c0 4-1.5 6-4 7-2.5-1-4-3-4-7V4zM8 6H4v2c0 2.2 1.6 4 4.1 4.5M16 6h4v2c0 2.2-1.6 4-4.1 4.5M12 14v4M8 20h8"/></svg>',
            new: '<svg viewBox="0 0 24 24"><path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14"/></svg>',
            rating: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
            votes: '<svg viewBox="0 0 24 24"><path d="M7 11a3 3 0 100-6 3 3 0 000 6zm10 0a3 3 0 100-6 3 3 0 000 6zM2 20c0-4 2-6 5-6s5 2 5 6m0 0c0-4 2-6 5-6s5 2 5 6"/></svg>',
            views: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z"/></svg>',
            title: '<svg viewBox="0 0 24 24"><path d="M4 19l4-14 4 14M5.5 14h5M15 6h6l-6 12h6"/></svg>',
            random: '<svg viewBox="0 0 24 24"><path d="M4 7h3c5 0 5 10 10 10h3M17 4l3 3-3 3M4 17h3c2.5 0 3.7-2.5 5-5M17 14l3 3-3 3"/></svg>'
        };
        return icons[key] || icons.top;
    }

    function topTypeIcon(key) {
        var icons = {
            all: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6-4.3-4.2 6-.9z"/></svg>',
            tv: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="m8 3 4 3 4-3M9 22h6"/></svg>',
            movie: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 5l3 5M14 5l3 5"/></svg>',
            ona: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4zM4 12h2M18 12h2"/></svg>'
        };
        return icons[key] || icons.all;
    }

    function create(options) {
        options = options || {};
        var comp = options.comp;
        var object = options.object || {};
        var baseParams = options.baseParams || {};
        var topMode = Boolean(options.topMode);
        var t = options.t;
        var copyParams = options.copyParams;
        var showSelect = options.showSelect;
        var navigationSnapshot = options.navigationSnapshot;
        var filterModel = options.filterModel;
        var toolbar;
        var toolbarTrack;
        var topButton;
        var filterButton;
        var controlsReady = false;
        var lastCatalogCard = null;
        var shortcutHandler = null;
        var focusScope = LampaYaniNavigation.createScope({
            id: 'catalog:' + cleanCatalogRoute(),
            root: function () { return comp.render(); },
            collection: function () { return navigationCollection(); },
            scroll: comp.scroll,
            // Cards only: the command deck is mouse/shortcut controlled and must
            // never enter the TV remote focus path.
            selector: '.card.selector',
            fallback: firstCard
        });
        var sortDefinitions = [
            {key: 'top', sort: 'top', forward: true, title: t('catalog_sort_top')},
            {key: 'new', sort: 'year', forward: false, title: t('catalog_sort_new')},
            {key: 'rating', sort: 'rating', forward: false, title: t('catalog_sort_rating')},
            {key: 'votes', sort: 'rating_counters', forward: false, title: t('catalog_sort_votes')},
            {key: 'views', sort: 'views', forward: false, title: t('catalog_sort_views')},
            {key: 'title', sort: 'title', forward: true, title: t('catalog_sort_title')},
            {key: 'random', sort: 'random', forward: false, title: t('catalog_sort_random')}
        ];
        var topDefinitions = [
            {key: 'all', types: '', title: t('top_all')},
            {key: 'tv', types: 'tv', title: t('top_tv')},
            {key: 'movie', types: 'movie', title: t('top_movies')},
            {key: 'ona', types: 'ona', title: t('top_ona')}
        ];
        var controlDefinitions = topMode ? topDefinitions : sortDefinitions;

        function remoteShortcuts() {
            if (topMode) return [
                {color: 'red', definition: topDefinitions[0]},
                {color: 'green', definition: topDefinitions[1]},
                {color: 'yellow', definition: topDefinitions[2]},
                {color: 'blue', definition: topDefinitions[3]}
            ];
            return [
                {color: 'red', definition: sortDefinitions[0]},
                {color: 'green', definition: sortDefinitions[1]},
                {color: 'yellow', definition: sortDefinitions[2]},
                {color: 'blue', filter: true, title: t('catalog_filters')}
            ];
        }

        function activeSort(definition) {
            if (topMode) return String(baseParams.types || '') === definition.types;
            return definition.sort === baseParams.sort && definition.forward === baseParams.sort_forward;
        }

        function cleanCatalogRoute() {
            return String(object.url || 'yani/catalog').replace(/\/(?:sort|filter)\/[^/]+/g, '');
        }

        function changeSort(definition) {
            if (activeSort(definition) && definition.key !== 'random') return;
            var params = copyParams(baseParams);
            params.offset = 0;
            if (topMode) {
                params.sort = 'top';
                params.sort_forward = true;
                params.from_year = 1900;
                if (definition.types) params.types = definition.types;
                else delete params.types;
                var topRoute = String(object.url || 'yani/top').replace(/\/type\/[^/]+$/, '');
                Lampa.Activity.replace({
                    url: topRoute + '/type/' + definition.key,
                    title: object.title || ('YummyAnime ' + t('top_rated')),
                    component: 'yani_top',
                    topMode: true,
                    catalog_params: params,
                    params: params
                });
                return;
            }
            params.sort = definition.sort;
            params.sort_forward = definition.forward;
            Lampa.Activity.replace({
                url: cleanCatalogRoute() + '/sort/' + definition.key,
                title: object.title || ('YummyAnime ' + t('catalog')),
                component: 'yani_catalog',
                genre_context: object.genre_context,
                catalog_params: params,
                params: params
            });
        }

        function replaceWithFilters(params) {
            Lampa.Activity.replace({
                url: cleanCatalogRoute() + '/filter/' + filterModel.signature(params),
                title: object.title || ('YummyAnime ' + t('catalog')),
                component: 'yani_catalog',
                genre_context: object.genre_context,
                catalog_params: params,
                params: params
            });
        }

        function openFilterValues(field, navigation) {
            showSelect({
                title: field.title,
                items: field.values.map(function (item) {
                    var isSelected = filterModel.selected(field, baseParams).key === item.key;
                    return {title: item.title, value: item.value, subtitle: isSelected ? '✓' : '', selected: isSelected};
                }),
                onSelect: function (item) {
                    replaceWithFilters(filterModel.apply(baseParams, field, item.value));
                },
                onBack: function () {
                    setTimeout(function () { openFilterMenu(navigation); }, 0);
                }
            }, navigation);
        }

        function openFilterMenu(navigation) {
            navigation = navigation || navigationSnapshot();
            var fields = filterModel.definitions(t, new Date().getFullYear());
            var items = fields.map(function (field) {
                var current = filterModel.selected(field, baseParams);
                return {title: field.title, subtitle: current.title, field: field};
            });
            if (filterModel.activeCount(baseParams)) items.unshift({title: t('catalog_filter_reset'), reset: true});
            showSelect({
                title: t('catalog_filters'),
                items: items,
                onSelect: function (item) {
                    if (item.reset) return replaceWithFilters(filterModel.clear(baseParams));
                    openFilterValues(item.field, navigation);
                }
            }, navigation);
        }

        function firstCard() {
            if (comp.items && comp.items.length && comp.items[0].render) return comp.items[0].render(true);
            var collection = comp.scroll && comp.scroll.render ? comp.scroll.render() : comp.render();
            return collection && collection.find ? collection.find('.card.selector').first()[0] : null;
        }

        function navigationCollection() {
            var root = comp.render();
            return root && root.length ? root : (comp.scroll && comp.scroll.render ? comp.scroll.render() : comp.render());
        }

        function activeCatalogController() {
            if (!Lampa.Controller || !Lampa.Controller.enabled) return null;
            var enabled = Lampa.Controller.enabled();
            if (!enabled || enabled.name !== 'content') return null;
            // Lampa exposes the current controller in two different shapes.
            // Android/TV builds commonly return the controller object itself,
            // while web builds wrap it in {name, controller}.
            var controller = enabled.controller || enabled;
            return controller && (typeof controller.down === 'function' || controller.link === comp) ? controller : null;
        }

        function syncNavigationCollection() {
            if (!controlsReady) return;
            var controller = activeCatalogController();
            var ownsController = controller && (controller.yaniCatalogOwner === comp || controller.link === comp);
            if (!ownsController) return;
            var collection = navigationCollection();
            if (!collection || !collection.length) return;
            // Keep Navigator limited to title cards so D-pad never lands on the
            // sort/filter command deck.
            Lampa.Controller.collectionSet(collection, false, true);
            if (lastCatalogCard && document.documentElement.contains(lastCatalogCard)) Navigator.add(lastCatalogCard);
        }

        function focusCards(first) {
            var collection = navigationCollection();
            var target = first ? firstCard() : lastCatalogCard || comp.last || firstCard();
            if (target && !document.documentElement.contains(target)) target = firstCard();
            if (target && $(target).closest('.yani-catalog-command-deck').length) target = firstCard();
            if (target) {
                lastCatalogCard = target;
                comp.last = target;
                Navigator.add(target);
                focusScope.remember(target);
            }
            Lampa.Controller.collectionSet(collection, false, true);
            Lampa.Controller.collectionFocus(target || false, collection, true);
        }

        function focusedCatalogCard() {
            var collection = comp.scroll && comp.scroll.render ? comp.scroll.render() : comp.render();
            var focused = collection && collection.find ? collection.find('.card.selector.focus').first() : null;
            return focused && focused.length ? focused : $();
        }

        function focusCardInDirection(direction) {
            var collection = comp.scroll && comp.scroll.render ? comp.scroll.render() : comp.render();
            var current = focusedCatalogCard();
            if (!collection || !collection.length || !current.length) return false;
            var currentRect = current[0].getBoundingClientRect();
            var currentCenterX = currentRect.left + currentRect.width / 2;
            var currentCenterY = currentRect.top + currentRect.height / 2;
            var verticalThreshold = Math.max(12, currentRect.height * 0.25);
            var target = null;
            var score = Infinity;
            collection.find('.card.selector').each(function () {
                if (this === current[0] || this.offsetParent === null) return;
                var rect = this.getBoundingClientRect();
                var centerY = rect.top + rect.height / 2;
                var distanceY = centerY - currentCenterY;
                var isCorrectDirection = direction === 'down' ? distanceY > verticalThreshold : distanceY < -verticalThreshold;
                if (!isCorrectDirection) return;
                // Prefer the closest next row, then retain the current column.
                // This stays deterministic when Lampa did not create Navigator
                // links for the vertically rendered catalog grid.
                var distanceX = Math.abs((rect.left + rect.width / 2) - currentCenterX);
                var candidateScore = Math.abs(distanceY) * 10000 + distanceX;
                if (candidateScore < score) {
                    score = candidateScore;
                    target = this;
                }
            });
            if (!target) return false;
            lastCatalogCard = target;
            comp.last = target;
            Navigator.add(target);
            Lampa.Controller.collectionFocus(target, collection, true);
            if (comp.scroll && comp.scroll.update) comp.scroll.update($(target), true);
            focusScope.remember(target);
            return true;
        }

        function isFirstCardRow(card) {
            if (!card || !card.length) return false;
            var collection = comp.scroll && comp.scroll.render ? comp.scroll.render() : comp.render();
            var currentRect = card[0].getBoundingClientRect();
            var currentCenter = currentRect.top + currentRect.height / 2;
            var firstCenter = currentCenter;
            collection.find('.card.selector').each(function () {
                if (this.offsetParent === null) return;
                var rect = this.getBoundingClientRect();
                firstCenter = Math.min(firstCenter, rect.top + rect.height / 2);
            });
            return Math.abs(currentCenter - firstCenter) < Math.max(20, currentRect.height * 0.45);
        }

        function scrollToTop() {
            if (comp.scroll && comp.scroll.reset) comp.scroll.reset();
            else if (comp.scroll && comp.scroll.render) comp.scroll.render(true).scrollTop = 0;
            focusCards(true);
        }

        function shortcutEventName(event) {
            return String(event && (event.key || event.code || '') || '').toLowerCase();
        }

        function shortcutColor(event) {
            var name = shortcutEventName(event);
            var code = Number(event && (event.keyCode || event.which));
            if (name === 'colorf0red' || name === 'red' || code === 403) return 'red';
            if (name === 'colorf1green' || name === 'green' || code === 404) return 'green';
            if (name === 'colorf2yellow' || name === 'yellow' || code === 405) return 'yellow';
            if (name === 'colorf3blue' || name === 'blue' || code === 406) return 'blue';
            return '';
        }

        function shortcutNumber(event) {
            var name = shortcutEventName(event);
            var match = name.match(/(?:digit|numpad)?([0-9])$/);
            if (match) return Number(match[1]);
            var code = Number(event && (event.keyCode || event.which));
            return code >= 48 && code <= 57 ? code - 48 : -1;
        }

        function shortcutsEnabled(event) {
            if (!controlsReady || !toolbar || !toolbar.length || !toolbar.is(':visible')) return false;
            var target = event && event.target;
            if (!target) return true;
            var tag = target && String(target.tagName || '').toLowerCase();
            return tag !== 'input' && tag !== 'textarea' && tag !== 'select' && !$(target).closest('input, textarea, select, [contenteditable=true]').length;
        }

        function handleRemoteShortcut(event) {
            if (!shortcutsEnabled(event) || event.defaultPrevented) return;
            var shortcut = remoteShortcuts().filter(function (item) { return item.color === shortcutColor(event); })[0];
            var number = shortcutNumber(event);
            if (!shortcut && number >= 1 && number <= controlDefinitions.length) shortcut = {definition: controlDefinitions[number - 1]};
            if (!shortcut && number === 0) {
                event.preventDefault();
                event.stopPropagation();
                scrollToTop();
                return;
            }
            if (!shortcut) return;
            event.preventDefault();
            event.stopPropagation();
            if (shortcut.filter) openFilterMenu();
            else if (shortcut.definition) changeSort(shortcut.definition);
        }

        function shortcutColorFor(definition) {
            var shortcut = remoteShortcuts().filter(function (item) { return item.definition === definition; })[0];
            return shortcut ? shortcut.color : '';
        }

        function shortcutBadge(number, color) {
            var badge = $('<span class="yani-catalog-shortcut-badge" aria-hidden="true"></span>');
            if (color) badge.append('<i class="yani-catalog-shortcut-badge__color yani-catalog-shortcut-badge__color--' + color + '"></i>');
            if (typeof number === 'number') badge.append($('<b class="yani-catalog-shortcut-badge__number"></b>').text(number));
            return badge;
        }

        function install() {
            if (controlsReady) return;
            var root = comp.render();
            if (!root || !root.length) return;
            controlsReady = true;
            root.addClass('yani-catalog-view');
            toolbar = $('<div class="yani-catalog-command-deck"></div>');
            var heading = $('<div class="yani-catalog-command-deck__heading"></div>');
            heading.append('<span class="yani-catalog-command-deck__mark"></span>');
            heading.append($('<span class="yani-catalog-command-deck__caption"></span>').text(topMode ? t('top_rated') : t('catalog')));
            toolbarTrack = $('<div class="yani-catalog-command-deck__rail"></div>');
            topButton = $('<div class="yani-catalog-top" aria-label="' + t('scroll_to_top') + '"></div>');
            topButton.append('<span class="yani-catalog-top__icon">↑</span>');
            topButton.append($('<span class="yani-catalog-top__title"></span>').text(t('scroll_to_top')));
            topButton.append(shortcutBadge(0, ''));
            topButton.on('click.yaniCatalogTop', scrollToTop);
            toolbarTrack.append(topButton);
            if (!topMode) {
                var activeFilters = filterModel.activeCount(baseParams);
                filterButton = $('<div class="yani-catalog-sort yani-catalog-filter"></div>');
                filterButton.toggleClass('yani-catalog-sort--active', activeFilters > 0);
                filterButton.append($('<span class="yani-catalog-sort__icon"></span>').html('<svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>'));
                if (activeFilters) filterButton.append($('<span class="yani-catalog-filter__count"></span>').text(activeFilters));
                filterButton.append($('<span class="yani-catalog-sort__title"></span>').text(t('catalog_filters')));
                filterButton.append(shortcutBadge(null, 'blue'));
                filterButton.on('click.yaniCatalogFilter', function () { openFilterMenu(); });
                toolbarTrack.append(filterButton);
            }
            controlDefinitions.forEach(function (definition, index) {
                var button = $('<div class="yani-catalog-sort"></div>');
                button.toggleClass('yani-catalog-sort--active', activeSort(definition));
                button.append($('<span class="yani-catalog-sort__icon"></span>').html(topMode ? topTypeIcon(definition.key) : catalogSortIcon(definition.key)));
                button.append($('<span class="yani-catalog-sort__title"></span>').text(definition.title));
                button.append(shortcutBadge(index + 1, shortcutColorFor(definition)));
                button.on('click.yaniCatalogSort', function () {
                    toolbarTrack[0].scrollLeft = Math.max(0, button[0].offsetLeft - toolbarTrack[0].clientWidth / 3);
                    changeSort(definition);
                });
                toolbarTrack.append(button);
            });
            toolbar.append(heading).append(toolbarTrack);
            var genreHeader = root.find('.yani-genre-catalog-header').first();
            if (genreHeader.length) toolbar.insertAfter(genreHeader);
            else root.prepend(toolbar);
            if (comp.scroll && comp.scroll.minus) comp.scroll.minus(toolbar);
            focusScope.bind(root);
            root.off('hover:focus.yaniCatalogCard').on('hover:focus.yaniCatalogCard', '.card.selector', function (event) {
                lastCatalogCard = event.currentTarget || this;
                comp.last = lastCatalogCard;
            });
            setTimeout(function () {
                syncNavigationCollection();
                focusCards(true);
            }, 0);
            shortcutHandler = handleRemoteShortcut;
            document.addEventListener('keydown', shortcutHandler, true);
        }

        function patchCatalogController(controller) {
            if (!controller || controller.yaniCatalogOwner === comp) return;
            var originalUp = controller.up;
            var originalDown = controller.down;
            controller.yaniCatalogOwner = comp;
            controller.up = function () {
                var focusedCard = focusedCatalogCard();
                if (focusedCard.length && isFirstCardRow(focusedCard)) return Lampa.Controller.toggle('head');
                if (focusCardInDirection('up')) return;
                if (Navigator.canmove('up')) return Navigator.move('up');
                if (originalUp) return originalUp();
                return Lampa.Controller.toggle('head');
            };
            controller.down = function () {
                if (focusCardInDirection('down')) return;
                if (Navigator.canmove('down')) return Navigator.move('down');
                if (comp.scroll && comp.scroll.wheel) {
                    comp.scroll.wheel(300);
                    setTimeout(function () { syncNavigationCollection(); }, 0);
                    return;
                }
                if (originalDown) originalDown();
            };
        }

        if (comp.on) {
            comp.on('toggle', function () { setTimeout(syncNavigationCollection, 0); });
            comp.on('scroll', function () { setTimeout(syncNavigationCollection, 0); });
            comp.on('controller', patchCatalogController);
        }

        var originalStart = comp.start;
        comp.start = function () {
            var result = originalStart.apply(this, arguments);
            patchCatalogController(activeCatalogController());
            syncNavigationCollection();
            setTimeout(function () { focusScope.restore(comp.last || firstCard(), false); }, 0);
            return result;
        };

        return {
            install: install,
            sync: syncNavigationCollection,
            destroy: function () {
                if (shortcutHandler) document.removeEventListener('keydown', shortcutHandler, true);
                shortcutHandler = null;
                focusScope.destroy();
            }
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.CatalogControls = window.LampaYaniCatalogControls = {
        create: create,
        catalogSortIcon: catalogSortIcon,
        topTypeIcon: topTypeIcon
    };
}(window));
