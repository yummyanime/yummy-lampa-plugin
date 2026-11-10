(function (window) {
    'use strict';

    // Lampa's menu editor stores labels in menu_sort / menu_hide and later
    // finds items with jQuery :contains(), which also matches "YummyAnime"
    // when the saved name is "Anime". Plugin items added after Menu.init
    // are also easy to miss on devices without MutationObserver, or when
    // Menu.addButton is missing. Restore by exact label and insert the
    // button ourselves, the same way IPTV does.

    var ACTION = 'yummyanime';
    var TITLE = 'YummyAnime';
    var ICON = '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M18.45 0H1.55A1.55 1.55 0 000 1.55v16.9A1.54 1.54 0 001.55 20h16.9A1.55 1.55 0 0020 18.45V1.55A1.54 1.54 0 0018.45 0Zm-2.83 5.93-2.1 2.66-2.3-5.43a6.95 6.95 0 014.4 2.77Zm-2.9 6.57h-4l2.03-4.8 1.98 4.8Zm-2.37-9.34L7.8 9.06 4.87 5.33c.64-.7 1.4-1.26 2.27-1.65a8.18 8.18 0 013.2-.52ZM3.57 7.39l3.2 4.06-1.56 3.58A6.96 6.96 0 013.57 7.39Zm6.57 9.56c-1.05.01-2.1-.2-3.05-.65l.76-1.8h5.7l.49 1.15a6.93 6.93 0 01-3.9 1.3Zm6.8-7.07a7.8 7.8 0 01-1.17 4L14.55 11l2.17-2.77c.14.54.21 1.1.23 1.65Z"/></svg>';

    function asList(value) {
        if (Object.prototype.toString.call(value) === '[object Array]') {
            return value.map(function (item) { return String(item || '').trim(); }).filter(Boolean);
        }
        if (typeof value === 'string') {
            var trimmed = value.trim();
            if (!trimmed) return [];
            try { return asList(JSON.parse(trimmed)); } catch (error) { return trimmed ? [trimmed] : []; }
        }
        return [];
    }

    function ensureListed(list, title) {
        var next = asList(list).slice();
        if (next.indexOf(title) === -1) next.push(title);
        return next;
    }

    function isHidden(hide, title) {
        return asList(hide).indexOf(title) !== -1;
    }

    function insertBeforeTitle(sort, presentTitles, title) {
        var order = asList(sort);
        var present = asList(presentTitles);
        var index = order.indexOf(title);
        if (index === -1) return '';
        for (var i = index + 1; i < order.length; i++) {
            if (order[i] !== title && present.indexOf(order[i]) !== -1) return order[i];
        }
        return '';
    }

    function insertAfterTitle(sort, presentTitles, title) {
        var order = asList(sort);
        var present = asList(presentTitles);
        var index = order.indexOf(title);
        if (index === -1) return '';
        for (var i = index - 1; i >= 0; i--) {
            if (order[i] !== title && present.indexOf(order[i]) !== -1) return order[i];
        }
        return '';
    }

    function itemLabel(node, $) {
        try {
            var text = $(node).find('.menu__text');
            if (!text) return '';
            if (text.eq) return String(text.eq(0).text() || '').trim();
            if (text.first) return String(text.first().text() || '').trim();
            if (text.text) return String(text.text() || '').trim();
            return '';
        } catch (error) {
            return '';
        }
    }

    function create(deps) {
        deps = deps || {};
        var icon = deps.icon || ICON;
        var title = deps.title || TITLE;
        var action = deps.action || ACTION;
        var restoreDelay = deps.restoreDelay == null ? 600 : Number(deps.restoreDelay);
        var maxAttempts = deps.maxAttempts == null ? 10 : Number(deps.maxAttempts);
        var wait = deps.setTimeout || function (fn, ms) { return window.setTimeout(fn, ms); };
        var cancel = deps.clearTimeout || function (id) { return window.clearTimeout(id); };
        var added = false;
        var started = false;
        var item = null;
        var restoreTimers = [];
        var attempts = 0;

        function jq() {
            return deps.$ || window.$;
        }

        function storage() {
            return deps.Storage || (window.Lampa && Lampa.Storage);
        }

        function activity() {
            return deps.Activity || (window.Lampa && Lampa.Activity);
        }

        function onEnter() {
            if (typeof deps.onEnter === 'function') return deps.onEnter();
            var Activity = activity();
            if (Activity && Activity.push) {
                Activity.push({
                    url: 'yani',
                    title: title,
                    component: 'yani_home'
                });
            }
        }

        function emptySet() {
            var $ = jq();
            return $ && typeof $ === 'function' ? $() : {length: 0};
        }

        function listRoot() {
            if (typeof deps.listRoot === 'function') return deps.listRoot();
            var $ = jq();
            if (!$ || typeof $ !== 'function') return emptySet();
            var Menu = deps.Menu || (window.Lampa && Lampa.Menu);
            if (Menu && typeof Menu.render === 'function') {
                try {
                    var rendered = Menu.render();
                    if (rendered) {
                        var fromMenu = $(rendered).find('.menu__list').eq(0);
                        if (fromMenu && fromMenu.length) return fromMenu;
                    }
                } catch (error) {}
            }
            return $('.menu .menu__list').eq(0);
        }

        function existing() {
            var $ = jq();
            if (!$ || typeof $ !== 'function') return emptySet();
            var found = $('.menu__item[data-action="' + action + '"]');
            if (found.length) return found;
            $('.menu .menu__list .menu__item').each(function () {
                if (itemLabel(this, $) === title) found = found.add(this);
            });
            return found;
        }

        function menuItems(list) {
            if (list && typeof list.find === 'function') {
                var found = list.find('.menu__item');
                if (found && typeof found.each === 'function') return found;
            }
            return list.children('.menu__item');
        }

        function presentTitles(list) {
            var names = [];
            var $ = jq();
            menuItems(list).each(function () {
                names.push(itemLabel(this, $));
            });
            return names;
        }

        function attached(target) {
            if (!target || !target.length) return false;
            try {
                var parent = target.parent && target.parent();
                return !!(parent && parent.length);
            } catch (error) {
                return false;
            }
        }

        function restore(target) {
            try {
                target = target || item;
                var Storage = storage();
                if (!target || !target.length || !Storage || !Storage.get) return;
                if (!attached(target)) return;
                var list = target.parent();
                if (!list || !list.length) return;
                var stored = asList(Storage.get('menu_sort', '[]'));
                var sort = stored.slice();
                if (stored.indexOf(title) === -1) {
                    sort = ensureListed(stored, title);
                    if (stored.length && Storage.set) Storage.set('menu_sort', sort);
                }
                var hide = asList(Storage.get('menu_hide', '[]'));
                var names = presentTitles(list);
                var before = insertBeforeTitle(sort, names, title);
                var after = before ? '' : insertAfterTitle(sort, names, title);
                var $ = jq();
                if (before) {
                    menuItems(list).each(function () {
                        if (itemLabel(this, $) === before) {
                            target.insertBefore(this);
                            return false;
                        }
                    });
                } else if (after) {
                    var placed = false;
                    menuItems(list).each(function () {
                        if (itemLabel(this, $) !== after) return;
                        if (typeof target.insertAfter === 'function') target.insertAfter(this);
                        else {
                            var next = this.nextSibling || (this.next && this.next());
                            if (next) target.insertBefore(next);
                            else list.append(target);
                        }
                        placed = true;
                        return false;
                    });
                    if (!placed) list.append(target);
                } else if (sort.indexOf(title) === -1) {
                    list.append(target);
                }
                target.toggleClass('hidden', isHidden(hide, title));
            } catch (error) {
                if (typeof console !== 'undefined' && console.error) {
                    console.error('[YummyAnime] Sidebar restore failed', error);
                }
            }
        }

        function scheduleRestore(target) {
            restoreTimers.forEach(function (id) { cancel(id); });
            restoreTimers = [];
            restore(target);
            if (!restoreDelay) return;
            var pulses = deps.restoreDelays || [550, 900, 1800];
            pulses.forEach(function (ms) {
                restoreTimers.push(wait(function () {
                    var found = existing();
                    if (found && found.length) restore(found.eq(0));
                    else add();
                }, ms));
            });
        }

        function buildItem() {
            var $ = jq();
            var node = $('<li class="menu__item selector" data-action="' + action + '"><div class="menu__ico">' + icon + '</div><div class="menu__text">' + title + '</div></li>');
            node.on('hover:enter', onEnter);
            return node;
        }

        function add() {
            try {
                var found = existing();
                if (found && found.length) {
                    item = found.eq(0);
                    if (item.attr) item.attr('data-action', action);
                    if (found.slice) found.slice(1).remove();
                    added = true;
                    scheduleRestore(item);
                    return true;
                }
                var list = listRoot();
                if (!list || !list.length) return false;
                var $ = jq();
                if (!$ || typeof $ !== 'function') return false;
                item = buildItem();
                list.append(item);
                if (!item || !item.length) return false;
                if (item.parent && !item.parent().length) return false;
                added = true;
                scheduleRestore(item);
                return true;
            } catch (error) {
                if (typeof console !== 'undefined' && console.error) {
                    console.error('[YummyAnime] Sidebar item failed', error);
                }
                return false;
            }
        }

        function retry() {
            if (add() || attempts >= maxAttempts) return;
            attempts += 1;
            wait(retry, attempts < 5 ? 250 : 1000);
        }

        function start(listener) {
            if (started) {
                add();
                return added;
            }
            started = true;
            add();
            if (!added) retry();
            if (listener && typeof listener.follow === 'function') {
                listener.follow('app', function (event) {
                    if (event && event.type === 'ready') add();
                });
                listener.follow('menu', function (event) {
                    if (event && (event.type === 'start' || event.type === 'end' || event.type === 'toggle')) add();
                });
            }
            var Storage = storage();
            if (Storage && Storage.listener && typeof Storage.listener.follow === 'function') {
                Storage.listener.follow('change', function (event) {
                    if (!event || (event.name !== 'menu_sort' && event.name !== 'menu_hide')) return;
                    add();
                });
            }
            return added;
        }

        return {
            ACTION: action,
            TITLE: title,
            add: add,
            restore: restore,
            start: start,
            added: function () { return added; }
        };
    }

    window.LampaYaniMenu = {
        ACTION: ACTION,
        TITLE: TITLE,
        ICON: ICON,
        asList: asList,
        ensureListed: ensureListed,
        isHidden: isHidden,
        insertBeforeTitle: insertBeforeTitle,
        insertAfterTitle: insertAfterTitle,
        create: create
    };
})(window);
