(function (window) {
    'use strict';

    // The account screen: profile, statistics, lists and account actions.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var autoProgressSyncEnabled = deps.autoProgressSyncEnabled;
        var syncPlaybackHistoryManually = deps.syncPlaybackHistoryManually;
        var goBack = deps.goBack;
        var openNotifications = deps.openNotifications;
        var openSubscriptions = deps.openSubscriptions;
        var openUserReviews = deps.openUserReviews;
        var accountListDefinitions = deps.accountListDefinitions;
        var cacheHomeListCounts = deps.cacheHomeListCounts;
        var openAccountList = deps.openAccountList;
        var formatAccountDate = deps.formatAccountDate;
        var formatWatchTime = deps.formatWatchTime;
        var localizedAuthText = deps.localizedAuthText;
        var openAccountLogin = deps.openAccountLogin;
        var logoutFromAccount = deps.logoutFromAccount;

        function Account(object) {
            var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
            scroll.minus();
            var html = $('<div class="yani-account"></div>');
            var content = $('<div class="yani-account__content"></div>');
            var last;

            this.create = function () {
                var self = this;
                this.activity.loader(true);

                if (!LampaYaniAuth.token()) {
                    var expired = LampaYaniAuth.sessionExpired && LampaYaniAuth.sessionExpired();
                    addAccountNotice(expired ? t('auth_session_expired') : t('not_logged_in'), localizedAuthText('login_hint'), {title: t('login_name'), handler: openAccountLogin});
                    finish(self);
                    return;
                }

                LampaYaniApi.profile().then(function (payload) {
                    var profile = payload && payload.response ? payload.response : payload;
                    return Promise.all([
                        Promise.resolve(profile),
                        LampaYaniApi.userListStats(profile.id).then(responseData).catch(function () { return []; }),
                        LampaYaniApi.userLists(profile.id).then(responseData).catch(function () { return []; }),
                        LampaYaniApi.userStatsGenres(profile.id).then(responseData).catch(function () { return []; }),
                        LampaYaniApi.userStatsRatings(profile.id).then(responseData).catch(function () { return []; }),
                        LampaYaniApi.userStatsTypes(profile.id).then(responseData).catch(function () { return []; })
                    ]);
                }).then(function (result) {
                    renderAccount(result[0], result[1], result[2], result[3], result[4], result[5]);
                    finish(self);
                }).catch(function (error) {
                    console.error('[YummyAnime]', error);
                    addAccountNotice(t('account_load_error'), t('account_retry'));
                    finish(self);
                });
            };

            function finish(component) {
                scroll.append(content);
                html.append(scroll.render(true));
                component.activity.loader(false);
                component.activity.toggle();
            }

            function responseData(payload) {
                return payload && payload.response ? payload.response : payload || [];
            }

            function addAccountNotice(title, description, action) {
                var notice = $('<div class="yani-account__notice"></div>');
                notice.append($('<div class="yani-account__notice-title"></div>').text(title));
                notice.append($('<div class="yani-account__notice-text"></div>').text(description));
                if (action && action.handler) {
                    var button = $('<div class="yani-account__notification-button yani-account__login-button selector"></div>');
                    button.append($('<strong></strong>').text(action.title || t('login_name')));
                    button.append($('<span aria-hidden="true">→</span>'));
                    bindAccountFocus(button);
                    button.on('hover:enter click.yaniAccountLogin', action.handler);
                    notice.append(button);
                } else {
                    notice.addClass('selector');
                    bindAccountFocus(notice);
                }
                content.append(notice);
            }

            function renderAccount(profile, stats, lists, genreStats, ratingStats, typeStats) {
                stats = Array.isArray(stats) ? stats : [];
                lists = Array.isArray(lists) ? lists : [];
                var header = $('<div class="yani-account__profile selector"></div>');
                var avatar = profile.avatars && (profile.avatars.big || profile.avatars.full || profile.avatars.small);
                if (avatar && avatar.indexOf('//') === 0) avatar = 'https:' + avatar;
                if (avatar) header.append($('<img class="yani-account__avatar" alt="">').attr('src', avatar));

                var identity = $('<div class="yani-account__identity"></div>');
                identity.append($('<div class="yani-account__name"></div>').text(profile.nickname || 'YummyAnime User'));
                identity.append($('<div class="yani-account__status"></div>').text(t('authorized')));
                identity.append($('<div class="yani-account__id"></div>').text('ID ' + profile.id));
                if (profile.about) identity.append($('<div class="yani-account__about"></div>').text(profile.about));
                if (profile.banned) identity.append($('<div class="yani-account__warning"></div>').text(t('banned')));
                header.append(identity);
                bindAccountFocus(header);
                content.append(header);

                var info = $('<div class="yani-account__grid"></div>');
                addInfo(info, t('registration'), formatAccountDate(profile.register_date));
                addInfo(info, t('last_visit'), formatAccountDate(profile.last_online));
                addInfo(info, t('roles'), profile.roles && profile.roles.length ? profile.roles.join(', ') : t('user'));
                addInfo(info, t('messages'), String(profile.messages && profile.messages.unread_count || 0) + ' ' + t('unread'));
                addInfo(info, t('notifications'), String(profile.notifications && profile.notifications.count || 0));
                addInfo(info, t('total_lists'), String(lists.length || 0));
                content.append(info);

                var notificationButton = $('<div class="yani-account__notification-button selector"></div>');
                notificationButton.append($('<strong></strong>').text(t('notifications')));
                notificationButton.append($('<span></span>').text(String(profile.notifications && (profile.notifications.unread_count || profile.notifications.count) || 0) + ' ' + t('unread')));
                bindAccountFocus(notificationButton);
                notificationButton.on('hover:enter click.yaniNotifications', openNotifications);
                content.append(notificationButton);
                var subscriptionsButton = $('<div class="yani-account__notification-button selector"></div>');
                subscriptionsButton.append($('<strong></strong>').text(t('subscriptions')));
                subscriptionsButton.append($('<span></span>').text(t('subscriptions')));
                bindAccountFocus(subscriptionsButton);
                subscriptionsButton.on('hover:enter click.yaniSubscriptions', function () { openSubscriptions(profile.id); });
                content.append(subscriptionsButton);
                // Manual synchronization remains available from the account page
                // when automatic progress synchronization is deliberately off.
                if (!autoProgressSyncEnabled()) {
                    var syncButton = $('<div class="yani-account__notification-button selector"></div>');
                    syncButton.append($('<strong></strong>').text(t('sync_history')));
                    syncButton.append($('<span></span>').text(t('sync_history_description')));
                    bindAccountFocus(syncButton);
                    syncButton.on('hover:enter click.yaniSync', syncPlaybackHistoryManually);
                    content.append(syncButton);
                }
                var reviewsButton = $('<div class="yani-account__notification-button selector"></div>');
                reviewsButton.append($('<strong></strong>').text(t('my_reviews')));
                reviewsButton.append($('<span></span>').text(t('my_reviews_description')));
                bindAccountFocus(reviewsButton);
                reviewsButton.on('hover:enter click.yaniReviews', function () { openUserReviews(profile.id); });
                content.append(reviewsButton);

                var counts = {};
                lists.forEach(function (anime) {
                    var userList = anime.user && anime.user.list;
                    if (!userList) return;
                    if (userList.list && typeof userList.list.id !== 'undefined') counts[userList.list.id] = (counts[userList.list.id] || 0) + 1;
                    if (userList.is_fav) counts[4] = (counts[4] || 0) + 1;
                });
                cacheHomeListCounts(profile.id, counts);

                content.append($('<div class="yani-account__section-title"></div>').text(t('list_stats')));
                var listGrid = $('<div class="yani-account__lists"></div>');
                accountListDefinitions().forEach(function (definition) {
                    var stat = stats.filter(function (item) { return Number(item.list && item.list.id) === definition.id; })[0] || {};
                    var tile = $('<div class="yani-account__list selector"></div>');
                    tile.append($('<div class="yani-account__list-title"></div>').text(definition.title));
                    tile.append($('<div class="yani-account__list-count"></div>').text(String(counts[definition.id] || 0) + ' ' + t('anime_count')));
                    tile.append($('<div class="yani-account__list-time"></div>').text(t('total_time') + ': ' + formatWatchTime(stat.seconds)));
                    bindAccountFocus(tile);
                    tile.on('hover:enter', function () { openAccountList(definition, lists, profile.id); });
                    listGrid.append(tile);
                });
                content.append(listGrid);
                renderAccountStatistics(genreStats, ratingStats, typeStats);

                var logoutButton = $('<div class="yani-account__notification-button yani-account__logout-button selector"></div>');
                logoutButton.append($('<strong></strong>').text(t('logout_name')));
                logoutButton.append($('<span></span>').text(t('logout_description')));
                bindAccountFocus(logoutButton);
                logoutButton.on('hover:enter click.yaniAccountLogout', logoutFromAccount);
                content.append(logoutButton);
            }

            function renderAccountStatistics(genreStats, ratingStats, typeStats) {
                var sections = [
                    {title: t('genres_statistics'), items: genreStats, label: function (item) { return item.title || item.name; }},
                    {title: t('ratings_statistics'), items: ratingStats, label: function (item) { return String(item.rating || '—'); }},
                    {title: t('types_statistics'), items: typeStats, label: function (item) { return item.type && (item.type.name || item.type.shortname) || item.name; }}
                ];
                var available = sections.filter(function (section) { return Array.isArray(section.items) && section.items.length; });
                if (!available.length) return;
                content.append($('<div class="yani-account__section-title"></div>').text(t('account_statistics')));
                available.forEach(function (section) {
                    var block = $('<div class="yani-account__stats"></div>');
                    block.append($('<div class="yani-account__stats-title"></div>').text(section.title));
                    section.items.slice(0, 12).forEach(function (item) {
                        var row = $('<div class="yani-account__stats-row selector"></div>');
                        row.append($('<span></span>').text(section.label(item) || '—'));
                        row.append($('<strong></strong>').text(String(item.count || 0)));
                        bindAccountFocus(row);
                        block.append(row);
                    });
                    content.append(block);
                });
            }

            function addInfo(grid, title, value) {
                var tile = $('<div class="yani-account__info selector"></div>');
                tile.append($('<div class="yani-account__info-title"></div>').text(title));
                tile.append($('<div class="yani-account__info-value"></div>').text(value || '—'));
                bindAccountFocus(tile);
                grid.append(tile);
            }

            function bindAccountFocus(element) {
                element.on('hover:focus', function (event) {
                    var target = event.currentTarget || event.target;
                    last = target;
                    scroll.update($(target), true);
                });
            }

            this.start = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(scroll.render());
                        Lampa.Controller.collectionFocus(last || false, scroll.render());
                    },
                    left: function () { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                    right: function () { Navigator.move('right'); },
                    up: function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                    down: function () { LampaYaniNavigation.moveDown(scroll); },
                    back: goBack
                });
                Lampa.Controller.toggle('content');
            };

            this.render = function (js) { return js ? html[0] : html; };
            this.destroy = function () { scroll.destroy(); html.remove(); };
        }

        return {Component: Account};
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.AccountScreen = window.LampaYaniAccountScreen = {create: create};
}(window));
