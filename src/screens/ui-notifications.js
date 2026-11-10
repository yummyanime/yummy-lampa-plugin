(function (window) {
    'use strict';

    function htmlToText(value) {
        return String(value || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p\s*>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;|&apos;/gi, "'")
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&#(\d+);/g, function (match, code) { return String.fromCharCode(Number(code)); })
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function responseItems(payload) {
        var response = payload && payload.response !== undefined ? payload.response : payload;
        var values = Array.isArray(response) ? response : response && (response.notifications || response.items || response.data) || [];
        return Array.isArray(values) ? values : [];
    }

    function extractAnimeSlug(uri) {
        var match = String(uri || '').match(/\/catalog\/item\/([^/?#]+)/i);
        if (!match) return '';
        try { return decodeURIComponent(match[1]); }
        catch (error) { return match[1]; }
    }

    function notificationKind(notification) {
        var type = String(notification && notification.type || '').toLowerCase();
        var subtype = String(notification && notification.sub_type || notification && notification.subType || '').toLowerCase();
        if (type === 'anime_episode' || subtype === 'new_episode') return 'episode';
        if (type.indexOf('comment') >= 0 || subtype.indexOf('comment') >= 0) return 'comment';
        if (type.indexOf('friend') >= 0 || type.indexOf('user') >= 0 || subtype.indexOf('friend') >= 0) return 'social';
        if (type.indexOf('news') >= 0 || subtype.indexOf('news') >= 0) return 'news';
        return 'system';
    }

    function notificationTimestamp(notification) {
        var value = notification && (notification.date || notification.date_seconds || notification.dateSeconds);
        if (!value) return 0;
        if (typeof value === 'number' || /^\d+$/.test(String(value))) {
            var numeric = Number(value) || 0;
            return numeric > 0 && numeric < 100000000000 ? numeric * 1000 : numeric;
        }
        return Date.parse(value) || 0;
    }

    function notificationDayGroup(notification, now) {
        var timestamp = notificationTimestamp(notification);
        if (!timestamp) return 'earlier';
        var current = new Date(now || Date.now());
        var target = new Date(timestamp);
        var currentDay = new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();
        var targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
        var difference = Math.round((currentDay - targetDay) / 86400000);
        if (difference <= 0) return 'today';
        if (difference === 1) return 'yesterday';
        return 'earlier';
    }

    function isOpenable(notification) {
        return Boolean(notification && (
            notification.anime_id || notification.animeId ||
            notification.kind === 'episode' && notification.anime_slug
        ));
    }

    function normalize(payload) {
        return responseItems(payload).map(function (source) {
            source = source || {};
            var item = Object.assign({}, source);
            item.title = htmlToText(source.title_html || source.titleHtml || source.title || '');
            item.text = htmlToText(source.text_html || source.textHtml || source.text || source.message || '');
            item.click_uri = source.click_uri || source.clickUri || '';
            item.sub_type = source.sub_type || source.subType || '';
            item.anime_slug = extractAnimeSlug(item.click_uri);
            item.kind = notificationKind(item);
            item.unread = !(source.viewed || source.read);
            return item;
        });
    }

    function icon(kind) {
        var paths = {
            episode: '<path d="M8 5v14l11-7z"/><path d="M4 4h16v16H4z" fill="none"/>',
            comment: '<path d="M4 5h16v11H9l-5 4z" fill="none"/><path d="M8 9h8M8 12h6"/>',
            social: '<path d="M16 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9.5 10a4 4 0 100-8 4 4 0 000 8zM17 8v6M14 11h6" fill="none"/>',
            news: '<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" fill="none"/>',
            system: '<path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" fill="none"/>'
        };
        return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[kind] || paths.system) + '</svg>';
    }

    function create(object, deps) {
        var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
        var html = $('<div class="yani-notifications"></div>');
        var content = $('<div class="yani-notifications__content"></div>');
        var list = $('<div class="yani-notifications__list"></div>');
        var summary;
        var last;
        var offset = 0;
        var pageSize = 30;
        var destroyed = false;
        var opening = false;
        var lastDayGroup = '';
        scroll.minus();

        function focusable(element) {
            LampaYaniNavigation.bindFocus(element, scroll, {set last(value) { last = value; }});
            return element;
        }

        function refreshFocus(preferred) {
            setTimeout(function () {
                if (destroyed) return;
                var collection = scroll.render();
                var target = preferred && preferred.offsetParent !== null ? preferred : (last && last.offsetParent !== null ? last : collection.find('.selector').first()[0]);
                if (target) last = target;
                Lampa.Controller.collectionSet(collection, false, true);
                Lampa.Controller.collectionFocus(target || false, collection, true);
            }, 0);
        }

        function unreadCount() {
            return list.find('.yani-notification.unread').length;
        }

        function updateSummary() {
            var count = unreadCount();
            if (deps.onUnreadCount) deps.onUnreadCount(count);
            if (!summary) return;
            summary.toggleClass('has-unread', count > 0);
            summary.find('strong').text(String(count));
            summary.find('span').text(deps.t(count ? 'notification_unread_count' : 'notifications_all_read'));
        }

        function kindLabel(kind) {
            return deps.t('notification_kind_' + kind);
        }

        function openNotification(notification, element) {
            if (notification.unread && notification.id) {
                notification.unread = false;
                element.removeClass('unread').addClass('read');
                element.find('.yani-notification__state').text(deps.t('notification_read'));
                deps.markRead(notification.id).catch(function () {});
                updateSummary();
            }

            var directId = notification.anime_id || notification.animeId;
            if (directId) {
                deps.openDetail(deps.toCard({anime_id: directId, title: notification.title || deps.t('anime')}), false);
                return;
            }
            if (notification.kind !== 'episode' || !notification.anime_slug || opening) return;
            opening = true;
            element.addClass('loading');
            deps.resolveAnime(notification.anime_slug).then(function (payload) {
                if (destroyed) return;
                var value = payload && payload.response !== undefined ? payload.response : payload;
                var card = deps.toCard(value || {});
                if (card && card.yani_id) deps.openDetail(card, false);
            }).catch(function (error) {
                console.warn('[YummyAnime Notifications] Could not resolve anime notification', error);
            }).then(function () {
                opening = false;
                element.removeClass('loading');
            });
        }

        function notificationCard(notification) {
            var item = focusable($('<div class="yani-notification selector"></div>'));
            item.data('yani-notification', notification);
            item.addClass('yani-notification--' + notification.kind);
            item.toggleClass('unread', notification.unread).toggleClass('read', !notification.unread);
            item.toggleClass('is-actionable', isOpenable(notification));

            var visual = $('<div class="yani-notification__visual"></div>').html(icon(notification.kind));
            var body = $('<div class="yani-notification__body"></div>');
            var meta = $('<div class="yani-notification__meta"></div>');
            meta.append($('<span class="yani-notification__kind"></span>').text(kindLabel(notification.kind)));
            var date = notification.date || notification.date_seconds || notification.dateSeconds;
            if (date) meta.append($('<span class="yani-notification__date"></span>').text(deps.formatDate(date)));
            body.append(meta);
            body.append($('<div class="yani-notification__title"></div>').text(notification.title || kindLabel(notification.kind)));
            if (notification.text) body.append($('<div class="yani-notification__text"></div>').text(notification.text));

            var footer = $('<div class="yani-notification__footer"></div>');
            footer.append($('<span class="yani-notification__state"></span>').text(deps.t(notification.unread ? 'notification_unread' : 'notification_read')));
            if (isOpenable(notification)) {
                footer.append($('<span class="yani-notification__open"></span>').text(deps.t('notification_open_anime')));
            }
            body.append(footer);
            item.append($('<span class="yani-notification__dot"></span>'), visual, body);
            if (isOpenable(notification)) item.append($('<span class="yani-notification__chevron">›</span>'));
            item.on('hover:enter click.yaniNotification', function () { openNotification(notification, item); });
            return item;
        }

        function appendDayGroup(key) {
            if (!key || key === lastDayGroup) return;
            lastDayGroup = key;
            list.append($('<div class="yani-notifications__day"></div>').text(deps.t('notifications_' + key)));
        }

        function emptyState() {
            var empty = LampaYaniSectionState.create({t: deps.t});
            empty.show('empty', {
                title: deps.t('notifications_empty'),
                hint: deps.t('notifications_empty_hint'),
                focusable: true
            });
            empty.root.removeAttr('hidden');
            return focusable(empty.root.addClass('yani-notifications__empty'));
        }

        function offlineState(onRetry) {
            var offline = LampaYaniSectionState.create({t: deps.t});
            offline.show('offline', {
                title: deps.t('notifications_error'),
                onRetry: onRetry
            });
            return focusable(offline.root);
        }

        function appendItems(items, append) {
            list.find('.yani-notifications__more').remove();
            if (!append) {
                list.empty();
                lastDayGroup = '';
            }
            items.forEach(function (notification) {
                appendDayGroup(notificationDayGroup(notification));
                list.append(notificationCard(notification));
            });
            if (!list.children('.yani-notification').length) {
                list.append(emptyState());
                updateSummary();
                return;
            }
            if (items.length >= pageSize) {
                var more = focusable($('<div class="yani-notifications__more selector"></div>'));
                more.append('<span>＋</span>', $('<strong></strong>').text(deps.t('notifications_more')));
                more.on('hover:enter click.yaniNotificationsMore', function () {
                    var previous = more.prev('.selector')[0];
                    more.addClass('loading');
                    offset += items.length;
                    deps.fetch(pageSize, offset).then(function (payload) {
                        appendItems(deps.normalize(payload), true);
                        refreshFocus(previous);
                    }).catch(function (error) {
                        offset = Math.max(0, offset - items.length);
                        more.removeClass('loading');
                        console.warn('[YummyAnime Notifications] Could not load the next page', error);
                    });
                });
                list.append(more);
            }
            updateSummary();
        }

        function buildHeader() {
            var hero = $('<div class="yani-notifications__hero"></div>');
            var identity = $('<div class="yani-notifications__identity"></div>');
            identity.append($('<div class="yani-notifications__hero-icon"></div>').html(icon('system')));
            var copy = $('<div></div>');
            copy.append($('<span class="yani-notifications__eyebrow"></span>').text('YUMMYANIME'));
            copy.append($('<div class="yani-notifications__title"></div>').text(deps.t('notifications_title')));
            copy.append($('<div class="yani-notifications__subtitle"></div>').text(deps.t('notifications_subtitle')));
            identity.append(copy);
            summary = $('<div class="yani-notifications__summary"><strong>0</strong><span></span></div>');
            hero.append(identity, summary);

            var actions = $('<div class="yani-notifications__actions"></div>');
            var mark = focusable($('<div class="yani-notifications__action selector"></div>'));
            mark.append('<span>✓</span>', $('<strong></strong>').text(deps.t('mark_all_read')));
            mark.on('hover:enter click.yaniNotificationsRead', function () {
                deps.markAllRead().then(function () {
                    list.find('.yani-notification').each(function () {
                        var notification = $(this).data('yani-notification');
                        if (notification) notification.unread = false;
                    }).removeClass('unread').addClass('read');
                    list.find('.yani-notification__state').text(deps.t('notification_read'));
                    updateSummary();
                    Lampa.Noty.show(deps.t('saved'));
                    refreshFocus(mark[0]);
                });
            });
            var remove = focusable($('<div class="yani-notifications__action yani-notifications__action--danger selector"></div>'));
            remove.append('<span>×</span>', $('<strong></strong>').text(deps.t('delete_all_notifications')));
            remove.on('hover:enter click.yaniNotificationsDelete', function () {
                deps.deleteAll().then(function () {
                    list.empty().append(emptyState());
                    updateSummary();
                    refreshFocus(remove[0]);
                });
            });
            actions.append(mark, remove);
            content.append(hero, actions, list);
        }

        function load(self) {
            offset = 0;
            list.empty();
            var loading = LampaYaniSectionState.create({t: deps.t});
            loading.show('loading', {skeleton: 'list'});
            list.append(loading.root);
            deps.fetch(pageSize, offset).then(function (payload) {
                var items = deps.normalize(payload);
                appendItems(items, false);
                if (LampaYaniSectionState.fromCache(payload) && items.length) {
                    var cached = LampaYaniSectionState.create({t: deps.t});
                    cached.show('cached', {compact: true, onRetry: function () { load(self); }});
                    list.prepend(cached.root);
                }
                if (!scroll.render().parent().length) {
                    scroll.append(content);
                    html.append(scroll.render(true));
                }
                self.activity.loader(false);
                self.activity.toggle();
                refreshFocus();
            }).catch(function (error) {
                console.error('[YummyAnime Notifications]', error);
                list.empty().append(offlineState(function () { load(self); }));
                if (!scroll.render().parent().length) {
                    scroll.append(content);
                    html.append(scroll.render(true));
                }
                self.activity.loader(false);
                self.activity.toggle();
                refreshFocus();
            });
        }

        return {
            create: function () {
                var self = this;
                this.activity.loader(false);
                buildHeader();
                load(self);
            },
            start: function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(scroll.render(), false, true);
                        Lampa.Controller.collectionFocus(last || scroll.render().find('.selector').first()[0] || false, scroll.render(), true);
                    },
                    left: function () { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                    right: function () { if (Navigator.canmove('right')) Navigator.move('right'); },
                    up: function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                    down: function () { LampaYaniNavigation.moveDown(scroll); },
                    back: deps.goBack
                });
                Lampa.Controller.toggle('content');
            },
            render: function (js) { return js ? html[0] : html; },
            destroy: function () { destroyed = true; scroll.destroy(); html.remove(); }
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Notifications = window.LampaYaniNotifications = {
        create: create,
        normalize: normalize,
        htmlToText: htmlToText,
        extractAnimeSlug: extractAnimeSlug,
        notificationKind: notificationKind,
        notificationDayGroup: notificationDayGroup,
        isOpenable: isOpenable
    };
}(window));
