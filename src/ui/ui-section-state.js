(function (window) {
    'use strict';

    // Shared loading / empty / offline / cached / retry chrome for YummyAnime
    // sections. Screens keep their own data flow; this module only renders the
    // modern state surfaces so every list looks consistent.

    function icon(kind) {
        var paths = {
            loading: '<circle cx="12" cy="12" r="8" fill="none"/><path d="M12 4a8 8 0 0 1 8 8" fill="none"/>',
            offline: '<path d="M2 8.5C5.5 5 9.5 3.5 12 3.5c2.5 0 6.5 1.5 10 5M5 12c2.4-2.2 4.8-3.2 7-3.2s4.6 1 7 3.2M8.5 15.2c1.4-1.1 2.8-1.6 3.5-1.6s2.1.5 3.5 1.6M12 19h.01" fill="none"/><path d="m3 3 18 18" fill="none"/>',
            cached: '<path d="M7 7h10v4H7zM5 11h14v8H5zM9 15h6" fill="none"/>',
            empty: '<path d="M4 7h16v12H4zM8 7V5h8v2M9 12h6M9 15h4" fill="none"/>',
            error: '<circle cx="12" cy="12" r="9" fill="none"/><path d="M12 7v6M12 16.5h.01" fill="none"/>'
        };
        return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[kind] || paths.empty) + '</svg>';
    }

    function skeleton(kind) {
        var type = kind === 'rows' || kind === 'list' ? kind : 'cards';
        var count = type === 'rows' ? 5 : type === 'list' ? 4 : 6;
        var box = $('<div class="yani-section-state__skeleton yani-section-state__skeleton--' + type + '" aria-hidden="true"></div>');
        for (var index = 0; index < count; index++) box.append('<i></i>');
        return box;
    }

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var root = $('<div class="yani-section-state" hidden></div>');

        function defaults(state) {
            if (state === 'loading') return {title: t('section_state_loading'), hint: ''};
            if (state === 'offline' || state === 'error') return {title: t('section_state_offline'), hint: t('section_state_offline_hint')};
            if (state === 'cached') return {title: t('section_state_cached'), hint: t('section_state_cached_hint')};
            if (state === 'empty') return {title: t('section_state_empty'), hint: t('section_state_empty_hint')};
            return {title: '', hint: ''};
        }

        function clear() {
            root.attr('hidden', 'hidden').attr('data-state', '').removeClass(
                'yani-section-state--loading yani-section-state--offline yani-section-state--error yani-section-state--cached yani-section-state--empty yani-section-state--banner'
            ).empty();
            return api;
        }

        function show(state, options) {
            options = options || {};
            var copy = defaults(state);
            var title = options.title || copy.title;
            var hint = options.hint === undefined ? copy.hint : options.hint;
            var compact = Boolean(options.compact || state === 'cached' && options.banner !== false && options.onRetry);
            clear();
            root.removeAttr('hidden').attr('data-state', state).addClass('yani-section-state--' + state);
            if (compact) root.addClass('yani-section-state--banner');

            if (state === 'loading') {
                root.append(skeleton(options.skeleton));
                root.append($('<div class="yani-section-state__loading-copy"></div>').text(title));
                return api;
            }

            var panel = $('<div class="yani-section-state__panel' + (options.focusable === false ? '' : ' selector') + '"></div>');
            panel.append($('<span class="yani-section-state__icon"></span>').html(icon(state === 'error' ? 'error' : state)));
            var text = $('<div class="yani-section-state__copy"></div>');
            text.append($('<strong></strong>').text(title));
            if (hint) text.append($('<span></span>').text(hint));
            panel.append(text);

            if (typeof options.onRetry === 'function' && state !== 'loading') {
                var retry = $('<div class="yani-section-state__retry selector"></div>').text(t('section_retry'));
                retry.on('hover:enter click.yaniSectionRetry', function (event) {
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    options.onRetry();
                });
                panel.append(retry);
            }

            root.append(panel);
            return api;
        }

        function mount(parent) {
            if (parent && parent.length) parent.append(root);
            return api;
        }

        function focus(collection) {
            var target = root.find('.selector').first()[0];
            if (!target || !window.Lampa || !Lampa.Controller) return target;
            var scope = collection || root;
            Lampa.Controller.collectionSet(scope, false, true);
            Lampa.Controller.collectionFocus(target, scope, true);
            return target;
        }

        var api = {
            root: root,
            show: show,
            clear: clear,
            mount: mount,
            focus: focus
        };
        return api;
    }

    function activityHost(activity) {
        if (!activity || !activity.render) return $();
        var rendered = activity.render(true);
        return rendered && rendered.jquery ? rendered : rendered ? $(rendered) : $();
    }

    function forActivity(activity, deps) {
        var state = create(deps);
        var host;

        function ensure() {
            var root = activityHost(activity);
            if (!root.length) return state;
            host = root.children('.yani-section-state-host');
            if (!host.length) {
                host = $('<div class="yani-section-state-host"></div>');
                root.append(host);
            }
            host.empty().append(state.root);
            return state;
        }

        return {
            api: state,
            loading: function (skeleton) {
                if (activity && activity.loader) activity.loader(true);
                ensure().show('loading', {skeleton: skeleton || 'cards'});
            },
            ready: function () {
                if (activity && activity.loader) activity.loader(false);
                state.clear();
                if (host) host.empty();
            },
            empty: function (options) {
                if (activity && activity.loader) activity.loader(false);
                ensure().show('empty', options || {});
            },
            offline: function (options) {
                if (activity && activity.loader) activity.loader(false);
                ensure().show('offline', options || {});
            },
            cached: function (options) {
                if (activity && activity.loader) activity.loader(false);
                ensure().show('cached', Object.assign({compact: true}, options || {}));
            },
            focus: function () {
                return state.focus(activityHost(activity));
            }
        };
    }

    function fromCache(payload) {
        if (window.LampaYaniApi && LampaYaniApi.fromCache) return LampaYaniApi.fromCache(payload);
        return Boolean(payload && payload.__yaniFromCache);
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.SectionState = window.LampaYaniSectionState = {
        create: create,
        forActivity: forActivity,
        fromCache: fromCache,
        icon: icon
    };
}(window));
