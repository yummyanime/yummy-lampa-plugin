(function (window) {
    'use strict';

    // The YummyAnime home screen: the dashboard, its sections and the
    // personal panels drawn from the account.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var locale = deps.locale;
        var toCard = deps.toCard;
        var openVideos = deps.openVideos;
        var playbackHistory = deps.playbackHistory;
        var importRemoteEntries = deps.importRemoteEntries;
        var goBack = deps.goBack;
        var yummyAnimeIcon = deps.yummyAnimeIcon;
        var openNotifications = deps.openNotifications;
        var openUserLists = deps.openUserLists;
        var openContinueWatching = deps.openContinueWatching;
        var readHomePlaybackSnapshot = deps.readHomePlaybackSnapshot;
        var cacheHomePlaybackSnapshot = deps.cacheHomePlaybackSnapshot;
        var readHomeDashboardSnapshot = deps.readHomeDashboardSnapshot;
        var cacheHomeDashboardSnapshot = deps.cacheHomeDashboardSnapshot;
        var readHomeNotificationCount = deps.readHomeNotificationCount;
        var cacheHomeNotificationCount = deps.cacheHomeNotificationCount;
        var readHomeListCounts = deps.readHomeListCounts;
        var homeListCountsFresh = deps.homeListCountsFresh;
        var cacheHomeListCounts = deps.cacheHomeListCounts;
        var openYummyDetail = deps.openYummyDetail;
        var movePageDown = deps.movePageDown;
        var homeSectionEnabled = deps.homeSectionEnabled;
        var openGenres = deps.openGenres;
        var openSearch = deps.openSearch;
        var openAccount = deps.openAccount;
        var openCollections = deps.openCollections;
        var openCollection = deps.openCollection;
        var resetUserListsSnapshot = deps.resetUserListsSnapshot;

        function homeIcon(key) {
            var icons = {
                catalog: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
                genres: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></svg>',
                search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>',
                schedule: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 18h3"/></svg>',
                new_translations: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h10v9H9l-4 4v-4H4zM14 10h6v8h-3l-3 3v-3h-2"/><path d="M7 9h4M16 14h2"/></svg>',
                new_releases: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 13v7h14v-7M8 17h8"/></svg>',
                continue_watching: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg>',
                status: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h4l2-6 4 12 2-6h6"/></svg>',
                top_rated: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/></svg>',
                for_you: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S4 15.7 4 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5c0 6.2-8 11-8 11Z"/><path d="M12 11v5M9.5 13.5h5"/></svg>',
                updates: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h7"/><circle cx="18" cy="16" r="3"/><path d="M18 14v2l1.3 1"/></svg>',
                collections: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5 12 3l8 3.5-8 3.5-8-3.5Z"/><path d="m4 11 8 3.5 8-3.5M4 15.5 12 19l8-3.5"/></svg>',
                user_lists: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v5H5zM5 11h14v9H5z"/><path d="M8 6.5h6M8 14h8M8 17h5"/></svg>',
                notifications: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17h12l-1.5-2.2V10a4.5 4.5 0 0 0-9 0v4.8L6 17zM10 20h4"/><path d="M18.5 5.5 20 4M5.5 5.5 4 4"/></svg>',
                account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4 3.3-6 8-6s7.3 2 8 6"/></svg>'
            };
            return icons[key] || icons.catalog;
        }

        function homeExploreDecoration(key) {
            if (key === 'catalog') {
                return '<span class="yani-home__explore-art yani-home__explore-art--catalog" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></span>';
            }
            if (key === 'genres') {
                return '<span class="yani-home__explore-art yani-home__explore-art--genres" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></span>';
            }
            if (key === 'search') {
                return '<span class="yani-home__explore-art yani-home__explore-art--search" aria-hidden="true"><i></i><b></b><em></em></span>';
            }
            return '';
        }

        function homeFlowIcon(key) {
            var icons = {
                japan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 0 1 14 0M8 12a4 4 0 0 1 8 0"/><circle cx="12" cy="12" r="1.5"/><path d="M12 13.5V21"/></svg>',
                waiting: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
                available: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg>'
            };
            return icons[key] || icons.waiting;
        }

        function Home(object) {
            var homeStartedOnce = false;
            var refreshEpisodeDashboard = function () { return Promise.resolve(); };
            var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
            scroll.minus();
            var html = $('<div class="yani-home" data-yani-section="explore"></div>');
            var grid = $('<div class="yani-home__grid"></div>');
            var last;
            var homeButtons = {};
            var homeFocusStorageKey = 'yani_home_last_focus';
            var destroyed = false;
            var homeAbortController = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var homeTimers = [];
            var currentEpisodeFlow;
            var preferredHomeKey = 'catalog';
            var renderIntroContext = function () {};
            var activateHomeFocus = function () {};
            var updateEpisodeCountdown = function () {};
            var homeCollection = function () { return scroll.render(); };
            var railCollection = function () { return scroll.render(); };
            var railNodes = function () { return $(); };
            var isRailFocus = function () { return false; };
            var focusHomeElement = function () { return false; };
            var focusSectionRail = function () { return false; };
            var lastHomeSection = 'explore';
            var lastIntroContext = '';
            var lastIntroPoster = '';
            var lastStoredFocusKey = '';
            var refreshContinueWatching = function () {};
            var homeFocusFrame = 0;
            var homeRenderIdleTimer = 0;
            var homeRenderFrame = 0;
            var homeNavigationUntil = 0;
            var homePendingRenders = {};
            var homeRenderIdleDelay = 450;
            var homeAuthorized = Boolean(LampaYaniAuth.token());
            var homeAuthorizationChanged = false;
            function onHomeAuthorizationChanged() {
                homeAuthorizationChanged = true;
                resetUserListsSnapshot();
            }
            function onHomeWatchProgress() {
                refreshContinueWatching();
            }
            if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('yani:auth-changed', onHomeAuthorizationChanged);
            if (window.$ && typeof document !== 'undefined') $(document).on('yani:watch-progress.yaniHome', onHomeWatchProgress);
            var navigatorInfo = window.navigator || {};
            var reducedMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            var lowMemoryDevice = Number(navigatorInfo.deviceMemory || 0) > 0 && Number(navigatorInfo.deviceMemory) <= 2;
            var lowCpuDevice = Number(navigatorInfo.hardwareConcurrency || 0) > 0 && Number(navigatorInfo.hardwareConcurrency) <= 2;
            html.addClass(reducedMotion || lowMemoryDevice || lowCpuDevice ? 'yani-home--reduced-motion' : 'yani-home--motion');

            function homeRequestControl() {
                return homeAbortController ? {signal: homeAbortController.signal} : {};
            }

            function scheduleHomeTask(callback, delay) {
                var timer = setTimeout(function () {
                    homeTimers = homeTimers.filter(function (item) { return item !== timer; });
                    if (!destroyed) callback();
                }, Math.max(0, Number(delay || 0)));
                homeTimers.push(timer);
                return timer;
            }

            function scheduleHomeRenderFlush() {
                if (destroyed) return;
                if (homeRenderIdleTimer) clearTimeout(homeRenderIdleTimer);
                var wait = Math.max(0, homeNavigationUntil - Date.now());
                homeRenderIdleTimer = setTimeout(flushHomeRenders, wait ? wait + 16 : 0);
            }

            function flushHomeRenders() {
                homeRenderIdleTimer = 0;
                if (destroyed) {
                    homePendingRenders = {};
                    return;
                }
                if (Date.now() < homeNavigationUntil) {
                    scheduleHomeRenderFlush();
                    return;
                }
                var pending = homePendingRenders;
                var keys = Object.keys(pending);
                homePendingRenders = {};
                if (!keys.length) return;
                if (homeRenderFrame) cancelAnimationFrame(homeRenderFrame);
                homeRenderFrame = requestAnimationFrame(function () {
                    homeRenderFrame = 0;
                    if (destroyed) return;
                    if (Date.now() < homeNavigationUntil) {
                        keys.forEach(function (key) {
                            if (!homePendingRenders[key]) homePendingRenders[key] = pending[key];
                        });
                        scheduleHomeRenderFlush();
                        return;
                    }
                    keys.forEach(function (key) {
                        if (!destroyed && typeof pending[key] === 'function') pending[key]();
                    });
                });
            }

            function queueHomeRender(key, callback) {
                if (destroyed || typeof callback !== 'function') return;
                homePendingRenders[String(key || 'default')] = callback;
                scheduleHomeRenderFlush();
            }

            function noteHomeNavigation() {
                homeNavigationUntil = Date.now() + homeRenderIdleDelay;
                if (Object.keys(homePendingRenders).length || homeRenderFrame) scheduleHomeRenderFlush();
            }

            function homeRequestCancelled(error) {
                return destroyed || homeAbortController && homeAbortController.signal.aborted || error && error.name === 'AbortError';
            }

            var items = [
                {key: 'catalog', title: t('catalog'), group: 'explore', action: function () {
                    Lampa.Activity.push({url: 'yani/catalog', title: 'YummyAnime ' + t('catalog'), component: 'yani_catalog', params: {limit: 30, sort: 'top', sort_forward: false}});
                }},
                {key: 'genres', title: t('genres'), group: 'explore', action: openGenres},
                {key: 'search', title: t('search'), group: 'explore', action: openSearch},
                {key: 'schedule', title: t('schedule'), subtitle: t('japan_broadcast'), group: 'episode_flow', action: function () {
                    Lampa.Activity.push({url: 'yani/schedule', title: 'YummyAnime ' + t('schedule'), component: 'yani_schedule'});
                }},
                {key: 'new_translations', title: t('new_translations'), subtitle: t('translations_and_dubs'), group: 'episode_flow', action: function () {
                    Lampa.Activity.push({url: 'yani/new-translations', title: 'YummyAnime ' + t('new_translations'), component: 'yani_new_translations'});
                }},
                {key: 'continue_watching', title: t('continue_watching'), group: 'library', action: function () {
                    openContinueWatching();
                }},
                {key: 'user_lists', title: t('user_lists'), group: 'library', authorized: true, action: openUserLists},
                {key: 'new_releases', title: t('new_releases'), group: 'discover', action: function () {
                    Lampa.Activity.push({url: 'yani/new-releases', title: 'YummyAnime ' + t('new_releases'), component: 'yani_new_releases'});
                }},
                {key: 'top_rated', title: t('top_rated'), group: 'discover', action: function () {
                    Lampa.Activity.push({url: 'yani/top', title: 'YummyAnime ' + t('top_rated'), component: 'yani_top', topMode: true, params: {limit: 30, sort: 'top', sort_forward: true, from_year: 1900}});
                }},
                {key: 'for_you', title: t('for_you'), subtitle: t('personal_feed_subtitle'), group: 'discover', action: function () {
                    Lampa.Activity.push({url: 'yani/for-you', title: 'YummyAnime ' + t('for_you'), component: 'yani_recommended'});
                }},
                {key: 'updates', title: t('updates'), group: 'library', action: function () {
                    Lampa.Activity.push({url: 'yani/updates', title: 'YummyAnime ' + t('updates'), component: 'yani_updates'});
                }},
                {key: 'collections', title: t('collections'), group: 'discover', action: openCollections},
                {key: 'notifications', title: t('notifications'), group: 'service', authorized: true, action: openNotifications},
                {key: 'account', title: t('account'), group: 'service', action: openAccount},
                {key: 'status', title: t('status'), group: 'service', action: function () {
                    Lampa.Activity.push({url: 'yani/status', title: 'YummyAnime ' + t('status'), component: 'yani_status'});
                }}
            ].filter(function (item) {
                return (!item.authorized || LampaYaniAuth.token()) && homeSectionEnabled(item.key);
            });

            this.create = function () {
                var waves = $(
                    '<div class="yani-home__waves" aria-hidden="true">' +
                        '<span class="yani-home__ambient yani-home__ambient--explore"></span>' +
                        '<span class="yani-home__ambient yani-home__ambient--episode_flow"></span>' +
                        '<span class="yani-home__ambient yani-home__ambient--library"></span>' +
                        '<span class="yani-home__ambient yani-home__ambient--discover"></span>' +
                        '<span class="yani-home__ambient yani-home__ambient--service"></span>' +
                        '<svg viewBox="0 0 1440 760" preserveAspectRatio="none" focusable="false">' +
                            '<path class="yani-home__wave yani-home__wave--far" d="M-120 190 C 120 25 315 335 555 188 S 940 48 1135 215 S 1450 292 1570 115"/>' +
                            '<path class="yani-home__wave yani-home__wave--middle" d="M-110 445 C 115 235 330 565 565 380 S 925 245 1130 420 S 1455 505 1560 330"/>' +
                            '<path class="yani-home__wave yani-home__wave--near" d="M-100 650 C 170 430 350 735 625 560 S 1015 430 1210 585 S 1465 660 1570 505"/>' +
                        '</svg>' +
                        '<span class="yani-home__pulse yani-home__pulse--one"></span>' +
                        '<span class="yani-home__pulse yani-home__pulse--two"></span>' +
                    '</div>'
                );
                var episodeFlow;
                var episodeFlowItems;
                var episodeFlowTimeline;
                var discover;
                var discoverItems;
                var libraryPulse;
                var serviceHub;
                var introMetrics = {};
                var sectionRailNodes = {};
                var panels = {};
                var panelRoots = {};
                var sectionRail = $('<div class="yani-home__section-rail"></div>');
                var sectionDefinitions = [
                    {key: 'explore', chapter: '01', title: t('dashboard_browse')},
                    {key: 'episode_flow', chapter: '02', title: t('episode_flow')},
                    {key: 'library', chapter: '03', title: t('dashboard_library')},
                    {key: 'discover', chapter: '04', title: t('discover')},
                    {key: 'service', chapter: '05', title: t('dashboard_service')}
                ];
                sectionDefinitions.forEach(function (definition) {
                    var available = items.some(function (item) { return item.group === definition.key; });
                    if (!available) return;
                    var node = $('<span class="yani-home__section-rail-node yani-home__section-rail-node--' + definition.key + '"><i><small></small></i><b></b></span>');
                    node.find('small').text(definition.chapter);
                    node.find('b').text(definition.title);
                    sectionRailNodes[definition.key] = node;
                    sectionRail.append(node);
                });
                var intro = $(
                    '<div class="yani-home__intro" data-yani-section="explore">' +
                        '<span class="yani-home__intro-context-art"></span>' +
                        '<div class="yani-home__intro-mark"></div>' +
                        '<div class="yani-home__intro-copy">' +
                            '<div class="yani-home__intro-brand"><span>YummyAnime</span><i aria-hidden="true"></i><em></em></div>' +
                            '<div class="yani-home__intro-title"></div>' +
                            '<div class="yani-home__intro-subtitle"></div>' +
                            '<div class="yani-home__intro-data" aria-hidden="true"><i></i><span></span></div>' +
                        '</div>' +
                        '<div class="yani-home__intro-orbit"><i></i><i></i><i></i></div>' +
                    '</div>'
                );
                intro.find('.yani-home__intro-mark').html(yummyAnimeIcon());
                intro.find('.yani-home__intro-brand em').text(t('dashboard_browse'));
                intro.find('.yani-home__intro-title').text(t('dashboard_title'));
                intro.find('.yani-home__intro-subtitle').text(t('dashboard_subtitle'));
                var introSummary = $('<div class="yani-home__intro-summary"></div>');
                [
                    {key: 'today', label: t('broadcasts_today'), icon: homeIcon('schedule')},
                    {key: 'translations', label: t('new_translations'), icon: homeIcon('new_translations')},
                    {key: 'continue', label: t('continue_watching'), icon: homeIcon('continue_watching')}
                ].forEach(function (metric) {
                    var node = $('<div class="yani-home__intro-metric yani-home__intro-metric--' + metric.key + '"></div>');
                    node.data('yani-home-metric-label', metric.label);
                    node.append(
                        $('<span class="yani-home__intro-metric-icon"></span>').html(metric.icon),
                        $('<span class="yani-home__intro-metric-copy"></span>').append(
                            $('<small></small>').text(metric.label),
                            $('<b></b>').text('—'),
                            $('<em></em>')
                        ),
                        $('<span class="yani-home__intro-metric-arrow" aria-hidden="true">›</span>')
                    );
                    introMetrics[metric.key] = node;
                    introSummary.append(node);
                });
                intro.append(introSummary);
                grid.append(intro);

                function panel(group) {
                    if (panels[group]) return panels[group];
                    var title = group === 'explore' ? t('dashboard_browse') :
                        group === 'library' ? t('dashboard_library') :
                        group === 'service' ? t('dashboard_service') : '';
                    var chapter = group === 'explore' ? '01' : group === 'library' ? '03' : group === 'service' ? '05' : '';
                    var root = $('<div class="yani-home__panel yani-home__panel--' + group + '"></div>');
                    var head = $('<div class="yani-home__panel-head"><span class="yani-home__panel-chapter" aria-hidden="true"></span><span class="yani-home__panel-title"></span><span class="yani-home__panel-line" aria-hidden="true"></span><span class="yani-home__chapter-state"><i></i><b></b></span></div>');
                    var content = $('<div class="yani-home__panel-items"></div>');
                    head.find('.yani-home__panel-chapter').text(chapter);
                    head.find('.yani-home__panel-title').text(title);
                    root.append(head);
                    if (group === 'library') {
                        libraryPulse = $(
                            '<div class="yani-home__library-pulse" aria-live="polite">' +
                                '<span class="yani-home__library-pulse-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
                                '<span class="yani-home__library-pulse-copy"><small></small><b>—</b><em></em></span>' +
                                '<span class="yani-home__library-pulse-meter" aria-hidden="true"><i></i></span>' +
                            '</div>'
                        );
                        libraryPulse.find('small').text(t('dashboard_library'));
                        libraryPulse.find('em').text(t('continue_watching'));
                        root.append(libraryPulse);
                    }
                    if (group === 'service') {
                        var constellation = $('<div class="yani-home__service-constellation"></div>');
                        serviceHub = $(
                            '<div class="yani-home__service-hub yani-home__service-hub--loading" aria-live="polite">' +
                                '<span class="yani-home__service-hub-orbit" aria-hidden="true"><i></i><i></i><i></i></span>' +
                                '<span class="yani-home__service-hub-logo"></span>' +
                                '<span class="yani-home__service-hub-copy"><small>YummyAnime</small><b></b><em></em></span>' +
                            '</div>'
                        );
                        serviceHub.find('.yani-home__service-hub-logo').html(yummyAnimeIcon());
                        serviceHub.find('b').text(t('status'));
                        serviceHub.find('em').text(t('dashboard_data_cached'));
                        constellation.append(serviceHub, content);
                        root.append(constellation);
                    } else {
                        root.append(content);
                    }
                    grid.append(root);
                    panels[group] = content;
                    panelRoots[group] = root;
                    return content;
                }

                function setChapterState(group, state, label) {
                    var root = group === 'episode_flow' ? episodeFlow : group === 'discover' ? discover : panelRoots[group];
                    if (!root || !root.length) return;
                    var labels = {
                        loading: t('dashboard_state_loading'),
                        ready: t('dashboard_state_ready'),
                        partial: t('dashboard_data_partial'),
                        empty: t('dashboard_state_empty'),
                        cached: t('dashboard_data_cached'),
                        offline: t('dashboard_state_offline')
                    };
                    root.removeClass('yani-home__panel--loading yani-home__panel--ready yani-home__panel--partial yani-home__panel--empty yani-home__panel--cached yani-home__panel--offline')
                        .addClass('yani-home__panel--' + state);
                    root.find('.yani-home__chapter-state').first().removeClass('yani-home__chapter-state--loading yani-home__chapter-state--ready yani-home__chapter-state--partial yani-home__chapter-state--empty yani-home__chapter-state--cached yani-home__chapter-state--offline')
                        .addClass('yani-home__chapter-state--' + state).find('b').text(label || labels[state] || '');
                }

                items.forEach(function (item) {
                    var text = $('<div class="yani-home__text"></div>');
                    text.append($('<div class="yani-home__title"></div>').text(item.title));
                    if (item.subtitle) text.append($('<div class="yani-home__subtitle"></div>').text(item.subtitle));
                    var button = $('<div class="yani-home__item yani-home__item--' + item.key + ' selector"></div>');
                    button.attr('data-yani-home-key', item.key);
                    button.data('yani-home-title', item.title);
                    button.data('yani-home-group', item.group || 'explore');
                    button.append(
                        $('<div class="yani-home__icon"></div>').html(homeIcon(item.key)),
                        text,
                        $('<span class="yani-home__count" aria-hidden="true"></span>'),
                        $('<div class="yani-home__arrow">›</div>')
                    );
                    if (item.group === 'explore') button.append(homeExploreDecoration(item.key));
                    homeButtons[item.key] = button;
                    button.on('hover:focus', function (event) {
                        activateHomeFocus(event.currentTarget || event.target, {countdown: true});
                    });
                    button.on('hover:enter click.yaniHome', item.action);
                    if (item.group === 'episode_flow') {
                        if (!episodeFlow) {
                            episodeFlow = $('<div class="yani-home__panel yani-home__panel--episode-flow yani-home__episode-flow"><div class="yani-home__panel-head"><span class="yani-home__panel-chapter" aria-hidden="true">02</span><span class="yani-home__episode-flow-title"></span><span class="yani-home__panel-line" aria-hidden="true"></span><span class="yani-home__chapter-state"><i></i><b></b></span><span class="yani-home__episode-flow-live" aria-hidden="true"><i></i><b></b></span></div><div class="yani-home__episode-timeline"></div><div class="yani-home__episode-flow-items"></div></div>');
                            episodeFlow.find('.yani-home__episode-flow-title').text(t('episode_flow'));
                            episodeFlowTimeline = episodeFlow.find('.yani-home__episode-timeline');
                            episodeFlowItems = episodeFlow.find('.yani-home__episode-flow-items');
                            grid.append(episodeFlow);
                        }
                        episodeFlowItems.append(button);
                    } else if (item.group === 'discover') {
                        if (!discover) {
                            discover = $('<div class="yani-home__panel yani-home__panel--discover yani-home__discover"><div class="yani-home__discover-head"><span class="yani-home__panel-chapter" aria-hidden="true">04</span><span class="yani-home__discover-title"></span><span class="yani-home__panel-line" aria-hidden="true"></span><span class="yani-home__chapter-state"><i></i><b></b></span><span class="yani-home__discover-mark" aria-hidden="true"><i></i><i></i><i></i></span></div><div class="yani-home__discover-items"></div></div>');
                            discover.find('.yani-home__discover-title').text(t('discover'));
                            discoverItems = discover.find('.yani-home__discover-items');
                            grid.append(discover);
                        }
                        discoverItems.append(button);
                    } else if (item.group) {
                        panel(item.group).append(button);
                    } else {
                        grid.append(button);
                    }
                });

                setChapterState('explore', 'ready');
                setChapterState('episode_flow', 'loading');
                setChapterState('library', 'loading');
                setChapterState('discover', 'loading');
                setChapterState('service', 'loading');

                homeCollection = function () {
                    // Keep the section rail out of spatial Navigator: on Android TV it
                    // sits between tiles and steals one invisible focus step.
                    return scroll.render();
                };
                railCollection = function () {
                    return scroll.render().add(sectionRail);
                };
                railNodes = function () {
                    return sectionRail.find('.yani-home__section-rail-node.selector');
                };
                isRailFocus = function (element) {
                    return Boolean(element && $(element).hasClass('yani-home__section-rail-node'));
                };
                focusHomeElement = function (element, collection) {
                    if (!element) return false;
                    last = element;
                    collection = collection && collection.length ? collection : (isRailFocus(element) ? railCollection() : homeCollection());
                    Lampa.Controller.collectionSet(collection);
                    if (window.Navigator && Navigator.add) Navigator.add(element);
                    Lampa.Controller.collectionFocus(element, collection);
                    if (!isRailFocus(element)) scroll.update($(element), true);
                    return true;
                };
                focusSectionRail = function (preferred) {
                    var nodes = railNodes();
                    if (!nodes.length) return false;
                    var target = preferred && nodes.filter(function () { return this === preferred; }).first();
                    if (!target || !target.length) target = sectionRail.find('.yani-home__section-rail-node--active.selector').first();
                    if (!target.length) target = nodes.first();
                    return focusHomeElement(target[0], railCollection());
                };

                sectionDefinitions.forEach(function (definition) {
                    var node = sectionRailNodes[definition.key];
                    var target = items.filter(function (item) { return item.group === definition.key && homeButtons[item.key]; })[0];
                    if (!node || !target) return;
                    node.addClass('selector').attr({role: 'button', tabindex: '-1', 'aria-label': definition.title});
                    node.data('yani-home-target-key', target.key);
                    node.on('hover:focus', function (event) {
                        activateHomeFocus(event.currentTarget || event.target, {
                            storageKey: target.key,
                            context: homeButtons[target.key],
                            panel: homeButtons[target.key].closest('.yani-home__panel')
                        });
                    });
                    node.on('hover:enter click.yaniHomeRail', function () {
                        target.action();
                    });
                });
                if (!homeButtons.schedule) introMetrics.today.remove();
                if (!homeButtons.new_translations) introMetrics.translations.remove();
                if (!homeButtons.continue_watching) introMetrics.continue.remove();

                function bindIntroMetric(metricKey, targetKey) {
                    var metric = introMetrics[metricKey];
                    var target = homeButtons[targetKey];
                    var definition = items.filter(function (item) { return item.key === targetKey; })[0];
                    if (!metric || !metric.length || !target || !definition) return;
                    metric.addClass('selector').attr({role: 'button', tabindex: '-1'});
                    metric.data('yani-home-target-key', targetKey);
                    metric.on('hover:focus', function (event) {
                        activateHomeFocus(event.currentTarget || event.target, {
                            storageKey: targetKey,
                            context: target,
                            panel: target.closest('.yani-home__panel'),
                            countdown: true
                        });
                    });
                    metric.on('hover:enter click.yaniHomeMetric', definition.action);
                }

                bindIntroMetric('today', 'schedule');
                bindIntroMetric('translations', 'new_translations');
                bindIntroMetric('continue', 'continue_watching');
                scroll.append(grid);
                html.append(waves);
                html.append(scroll.render(true));
                html.append(sectionRail);
                this.activity.loader(false);
                this.activity.toggle();

                function setCount(button, count) {
                    count = Number(count || 0);
                    if (!button) return;
                    var badge = $('.yani-home__count', button);
                    if (!count) {
                        badge.text('').attr('aria-hidden', 'true').removeClass('yani-home__count--visible');
                        return;
                    }
                    badge
                        .text(count > 99 ? '99+' : String(count))
                        .attr('aria-hidden', 'false')
                        .addClass('yani-home__count--visible');
                }

                renderIntroContext = function (button) {
                    if (!button || !button.length) return;
                    var key = String(button.data('yani-home-context-key') || button.attr('data-yani-home-key') || 'catalog');
                    setSectionRail(String(button.data('yani-home-group') || 'explore'));
                    var title = String(button.data('yani-home-title') || t('dashboard_title'));
                    var insight = String(button.data('yani-home-insight-title') || '');
                    var meta = String(button.data('yani-home-insight-meta') || '');
                    var poster = String(button.data('yani-home-poster') || '').replace(/["\\]/g, '');
                    var subtitle = [insight, meta].filter(Boolean).join(' · ') || t('dashboard_subtitle');
                    var contextToken = key + '\n' + title + '\n' + subtitle;
                    if (contextToken !== lastIntroContext) {
                        lastIntroContext = contextToken;
                        intro.attr('data-yani-context', key);
                        intro.find('.yani-home__intro-title').text(title);
                        intro.find('.yani-home__intro-subtitle').text(subtitle);
                    }
                    var art = intro.find('.yani-home__intro-context-art');
                    var showArt = !reducedMotion && !lowMemoryDevice && !lowCpuDevice && /^https?:\/\//i.test(poster);
                    if (!showArt) {
                        if (lastIntroPoster) {
                            lastIntroPoster = '';
                            art.removeClass('yani-home__intro-context-art--visible').css('background-image', '');
                        }
                        return;
                    }
                    if (poster === lastIntroPoster) return;
                    lastIntroPoster = poster;
                    art.css('background-image', 'url("' + poster + '")').addClass('yani-home__intro-context-art--visible');
                };

                activateHomeFocus = function (target, options) {
                    options = options || {};
                    var element = $(target);
                    if (!element.length) return;
                    last = element[0];
                    if (homeFocusFrame) cancelAnimationFrame(homeFocusFrame);
                    homeFocusFrame = requestAnimationFrame(function () {
                        homeFocusFrame = 0;
                        if (destroyed || last !== element[0]) return;
                        var storageKey = options.storageKey || String(element.attr('data-yani-home-key') || '');
                        if (storageKey && storageKey !== lastStoredFocusKey && Lampa.Storage && Lampa.Storage.set) {
                            lastStoredFocusKey = storageKey;
                            Lampa.Storage.set(homeFocusStorageKey, storageKey);
                        }
                        var panel = options.panel || element.closest('.yani-home__panel');
                        if (panel && panel.length && !panel.hasClass('yani-home__panel--active')) {
                            html.find('.yani-home__panel--active').removeClass('yani-home__panel--active');
                            panel.addClass('yani-home__panel--active');
                        }
                        renderIntroContext(options.context || element);
                        if (options.countdown && currentEpisodeFlow) updateEpisodeCountdown(currentEpisodeFlow.japan);
                        if (options.scroll === false) return;
                        var node = element[0];
                        var view = scroll.render()[0];
                        if (node && view && node.getBoundingClientRect && view.getBoundingClientRect) {
                            var rect = node.getBoundingClientRect();
                            var box = view.getBoundingClientRect();
                            if (rect.top >= box.top + 8 && rect.bottom <= box.bottom - 8) return;
                        }
                        scroll.update(element, true);
                    });
                };

                function setSectionRail(group) {
                    var activeGroup = 'explore';
                    var activeTitle = t('dashboard_browse');
                    sectionDefinitions.some(function (definition) {
                        if (definition.key !== group) return false;
                        activeGroup = definition.key;
                        activeTitle = definition.title;
                        return true;
                    });
                    if (activeGroup === lastHomeSection && html.attr('data-yani-section') === activeGroup) return;
                    lastHomeSection = activeGroup;
                    html.attr('data-yani-section', activeGroup);
                    intro.attr('data-yani-section', activeGroup);
                    intro.find('.yani-home__intro-brand em').text(activeTitle);
                    var reached = true;
                    sectionDefinitions.forEach(function (definition) {
                        var node = sectionRailNodes[definition.key];
                        if (!node) return;
                        node.removeClass('yani-home__section-rail-node--active yani-home__section-rail-node--passed');
                        if (definition.key === activeGroup) {
                            node.addClass('yani-home__section-rail-node--active');
                            reached = false;
                        } else if (reached) {
                            node.addClass('yani-home__section-rail-node--passed');
                        }
                    });
                }

                function refreshIntroContext(button) {
                    if (button && button.length && last === button[0]) renderIntroContext(button);
                }

                function setPreview(button, title, meta) {
                    if (!button) return;
                    $('.yani-home__item-insight', button).remove();
                    button.removeClass('yani-home__item--with-insight');
                    button.data('yani-home-insight-title', title || '');
                    button.data('yani-home-insight-meta', meta || '');
                    if (!title) {
                        refreshIntroContext(button);
                        return;
                    }
                    var insight = $('<div class="yani-home__item-insight"></div>');
                    insight.append($('<div class="yani-home__item-insight-title"></div>').text(title));
                    if (meta) insight.append($('<div class="yani-home__item-insight-meta"></div>').text(meta));
                    $('.yani-home__text', button).append(insight);
                    button.addClass('yani-home__item--with-insight');
                    refreshIntroContext(button);
                }

                function setServiceState(button, state) {
                    if (!button) return;
                    $('.yani-home__service-state', button).remove();
                    $('<span class="yani-home__service-state yani-home__service-state--' + state + '" aria-hidden="true"></span>').insertBefore($('.yani-home__arrow', button));
                }

                function setServiceHub(state, title, detail) {
                    if (!serviceHub || !serviceHub.length) return;
                    serviceHub.removeClass('yani-home__service-hub--loading yani-home__service-hub--up yani-home__service-hub--attention yani-home__service-hub--degraded yani-home__service-hub--down')
                        .addClass('yani-home__service-hub--' + (state || 'loading'));
                    serviceHub.find('b').text(title || t('status'));
                    serviceHub.find('em').text(detail || '');
                }

                function setIntroMetric(key, value, detail) {
                    var metric = introMetrics[key];
                    if (!metric || !metric.length) return;
                    var known = value !== null && value !== undefined && value !== '';
                    var metricLabel = String(metric.data('yani-home-metric-label') || '');
                    metric.removeClass('yani-home__intro-metric--active yani-home__intro-metric--ready yani-home__intro-metric--unknown');
                    if (!known) {
                        metric.addClass('yani-home__intro-metric--unknown');
                        metric.find('b').text('—');
                        metric.find('em').text('').removeClass('yani-home__intro-metric-detail--visible');
                        metric.attr('aria-label', metricLabel);
                        return;
                    }
                    value = Math.max(0, Number(value) || 0);
                    metric.find('b').text(value > 99 ? '99+' : String(value));
                    metric.find('em').text(String(detail || '')).toggleClass('yani-home__intro-metric-detail--visible', Boolean(detail));
                    metric.attr('aria-label', [metricLabel, value, detail].filter(function (part) { return part !== ''; }).join(': '));
                    metric.addClass('yani-home__intro-metric--ready');
                    if (value) metric.addClass('yani-home__intro-metric--active');
                }

                function setIntroDataState(state, updatedAt) {
                    var status = intro.find('.yani-home__intro-data');
                    var labels = {
                        live: t('dashboard_data_live'),
                        partial: t('dashboard_data_partial'),
                        cached: t('dashboard_data_cached'),
                        offline: t('dashboard_data_offline')
                    };
                    var label = labels[state] || '';
                    if (!label) return status.removeClass('yani-home__intro-data--visible');
                    var time = '';
                    if (updatedAt) {
                        try { time = new Date(updatedAt).toLocaleTimeString(locale(), {hour: '2-digit', minute: '2-digit'}); }
                        catch (error) { time = new Date(updatedAt).toLocaleTimeString(); }
                    }
                    status.removeClass('yani-home__intro-data--live yani-home__intro-data--partial yani-home__intro-data--cached yani-home__intro-data--offline')
                        .addClass('yani-home__intro-data--visible yani-home__intro-data--' + state)
                        .find('span').text(label + (time ? ' · ' + time : ''));
                }

                function setArtwork(button, poster) {
                    if (!button) return;
                    $('.yani-home__item-art', button).remove();
                    button.removeClass('yani-home__item--artwork');
                    poster = String(poster || '');
                    button.data('yani-home-poster', /^https?:\/\//i.test(poster) ? poster : '');
                    if (reducedMotion || lowMemoryDevice || lowCpuDevice || !/^https?:\/\//i.test(poster)) {
                        refreshIntroContext(button);
                        return;
                    }
                    poster = poster.replace(/["\\]/g, '');
                    $('<span class="yani-home__item-art" aria-hidden="true"></span>')
                        .css('background-image', 'linear-gradient(90deg, rgba(22,20,29,.98) 3%, rgba(22,20,29,.72) 48%, rgba(22,20,29,.12) 100%), url("' + poster + '")')
                        .prependTo(button);
                    button.addClass('yani-home__item--artwork');
                    refreshIntroContext(button);
                }

                var prioritySignals = {
                    authorized: Boolean(LampaYaniAuth.token()),
                    continue_count: 0,
                    notification_count: 0,
                    has_translation: false
                };

                function refreshPriority() {
                    var priority = LampaYaniHomeInsights.dashboardPriority(prioritySignals);
                    var button = homeButtons[priority.key];
                    html.find('.yani-home__item--priority').removeClass('yani-home__item--priority').find('.yani-home__priority').remove();
                    preferredHomeKey = button ? priority.key : homeButtons.catalog ? 'catalog' : Object.keys(homeButtons)[0] || '';
                    if (!button) return;
                    button.addClass('yani-home__item--priority');
                    $('<span class="yani-home__priority" aria-hidden="true"></span>').text(t(priority.label)).appendTo(button);
                }

                function renderEpisodeTimeline(flow) {
                    if (!episodeFlowTimeline) return;
                    flow = flow || {};
                    currentEpisodeFlow = flow;
                    updateEpisodeCountdown(flow.japan);
                    var stages = [
                        {key: 'japan', label: t('japan_broadcast')},
                        {key: 'waiting', label: t('translation_waiting')},
                        {key: 'available', label: t('new_translations')}
                    ];
                    function bindEpisodeStage(node, targetKey, definition, data, meta) {
                        var target = homeButtons[targetKey];
                        if (!target) return;
                        node.addClass('selector').attr({role: 'button', tabindex: '-1', 'aria-label': [definition.label, data.title || t('flow_no_data'), meta.join(' · ')].filter(Boolean).join(': ')});
                        node.data('yani-home-context-key', targetKey);
                        node.on('hover:focus', function (event) {
                            activateHomeFocus(event.currentTarget || event.target, {
                                storageKey: targetKey,
                                context: target,
                                panel: target.closest('.yani-home__panel')
                            });
                        });
                        node.on('hover:enter click.yaniHomeFlow', target.action);
                    }
                    episodeFlowTimeline.empty();
                    stages.forEach(function (definition, index) {
                        var data = flow[definition.key] || {};
                        var state = definition.key === 'japan' ? (data.timestamp && data.timestamp <= Date.now() ? 'ready' : 'scheduled') : data.status || 'idle';
                        var node = $('<div class="yani-home__episode-stage yani-home__episode-stage--' + state + '"></div>');
                        var marker = $('<div class="yani-home__episode-stage-marker"></div>').html(homeFlowIcon(definition.key));
                        var copy = $('<div class="yani-home__episode-stage-copy"></div>');
                        copy.append($('<div class="yani-home__episode-stage-label"></div>').text(definition.label));
                        copy.append($('<div class="yani-home__episode-stage-title"></div>').text(data.title || t('flow_no_data')));
                        var meta = [];
                        if (data.episode_label) meta.push(String(data.episode_label));
                        else if (data.episode) meta.push(t('episode') + ' ' + data.episode);
                        if (definition.key === 'japan' && data.timestamp) {
                            var date = new Date(data.timestamp);
                            try { meta.push(date.toLocaleString(locale(), {weekday: 'short', hour: '2-digit', minute: '2-digit'})); }
                            catch (error) { meta.push(date.toLocaleString()); }
                        }
                        if (definition.key === 'waiting' && data.status === 'waiting') meta.push(t('translation_pending'));
                        if (definition.key === 'waiting' && data.status === 'ready') meta.push(t('available_now'));
                        if (definition.key === 'available') meta = meta.concat([data.dubbing, data.source].filter(Boolean));
                        copy.append($('<div class="yani-home__episode-stage-meta"></div>').text(meta.join(' · ') || '—'));
                        node.append(marker, copy);
                        if (index) node.prepend('<span class="yani-home__episode-stage-link"><i></i></span>');
                        bindEpisodeStage(node, definition.key === 'available' ? 'new_translations' : 'schedule', definition, data, meta);
                        episodeFlowTimeline.append(node);
                    });
                }

                updateEpisodeCountdown = function (release) {
                    if (!episodeFlow) return;
                    var indicator = episodeFlow.find('.yani-home__episode-flow-live');
                    var countdown = LampaYaniHomeInsights.releaseCountdown(release && release.timestamp, Date.now());
                    indicator.removeClass('yani-home__episode-flow-live--upcoming yani-home__episode-flow-live--aired yani-home__episode-flow-live--visible');
                    if (countdown.state === 'unknown') return indicator.find('b').text('');
                    var text;
                    if (countdown.state === 'aired') {
                        text = t('broadcast_started');
                    } else {
                        var parts = [];
                        if (countdown.days) parts.push(countdown.days + t('days_short'));
                        if (countdown.hours) parts.push(countdown.hours + t('hours_short'));
                        if (countdown.minutes && !countdown.days) parts.push(countdown.minutes + t('minutes_short'));
                        text = t('next_broadcast') + ' · ' + (parts.join(' ') || '1' + t('minutes_short'));
                    }
                    indicator.addClass('yani-home__episode-flow-live--visible yani-home__episode-flow-live--' + countdown.state).find('b').text(text);
                };

                function continueMetricDetail(entry) {
                    entry = entry || {};
                    var meta = [];
                    if (entry.number || entry.episode) meta.push(t('episode') + ' ' + (entry.number || entry.episode));
                    if (Number(entry.duration || 0) > 0) meta.push(Math.min(99, Math.round(Number(entry.time || 0) / Number(entry.duration) * 100)) + '%');
                    return [entry.title || '', meta.join(' · ')].filter(Boolean).join(' · ');
                }

                var account = LampaYaniAuth.get();
                setServiceHub('loading', t('status'), account && (account.display_name || account.login) ? account.display_name || account.login : t('not_logged_in'));
                var localHistory = playbackHistory();
                var localEntries = LampaYaniHomeSections.normalizeLocalHistory(localHistory);
                var continuing = LampaYaniHomeSections.continueWatchingEntries(localEntries, {});
                setIntroMetric('continue', continuing.length, continueMetricDetail(continuing[0]));

                function renderPersonal(stats) {
                    if (destroyed) return;
                    var personal = LampaYaniHomeInsights.personalInsight(continuing, account, stats);
                    if (libraryPulse && libraryPulse.length) {
                        var libraryActivity = personal.continue_count + personal.tracked_total;
                        var resumeShare = libraryActivity ? Math.round(personal.continue_count / libraryActivity * 100) : 0;
                        libraryPulse.toggleClass('yani-home__library-pulse--active', Boolean(libraryActivity));
                        libraryPulse.find('b').text(libraryActivity ? personal.continue_count + ' / ' + personal.tracked_total : '—');
                        libraryPulse.find('em').text(t('continue_watching') + ' ' + personal.continue_count + ' · ' + t('updates') + ' ' + personal.tracked_total);
                        libraryPulse.find('.yani-home__library-pulse-meter i').css('width', String(resumeShare) + '%');
                    }
                    prioritySignals.continue_count = personal.continue_count;
                    setCount(homeButtons.continue_watching, personal.continue_count);
                    setIntroMetric('continue', personal.continue_count, continueMetricDetail(personal.continue_preview));
                    if (personal.continue_preview) {
                        var resume = personal.continue_preview;
                        var resumeMeta = resume.number ? t('episode') + ' ' + resume.number : '';
                        if (resume.duration > 0) resumeMeta += (resumeMeta ? ' · ' : '') + Math.min(99, Math.round(resume.time / resume.duration * 100)) + '%';
                        setPreview(homeButtons.continue_watching, resume.title, resumeMeta);
                        setArtwork(homeButtons.continue_watching, resume.poster);
                    } else {
                        setPreview(homeButtons.continue_watching, '', '');
                        setArtwork(homeButtons.continue_watching, '');
                    }
                    if (personal.account_name) setPreview(homeButtons.account, personal.account_name, t('authorized'));
                    if (personal.list_total) {
                        setCount(homeButtons.user_lists, personal.list_total);
                        setPreview(homeButtons.user_lists, t('watching') + ' ' + personal.lists.watching, t('planned') + ' ' + personal.lists.planned);
                    }
                    if (personal.tracked_total) {
                        setCount(homeButtons.updates, personal.tracked_total);
                        setPreview(homeButtons.updates, t('watching') + ' ' + personal.lists.watching, t('postponed') + ' ' + personal.lists.postponed);
                    }
                    refreshPriority();
                }

                var personalStats = readHomeListCounts(account && account.user_id);
                renderPersonal(personalStats);

                refreshContinueWatching = function () {
                    queueHomeRender('local-playback', function () {
                        if (destroyed) return;
                        localHistory = playbackHistory();
                        var localEntries = LampaYaniHomeSections.normalizeLocalHistory(localHistory);
                        continuing = LampaYaniHomeSections.continueWatchingEntries(localEntries, {});
                        setIntroMetric('continue', continuing.length, continueMetricDetail(continuing[0]));
                        renderPersonal(personalStats);
                    });
                };

                // A title leaves Continue Watching when its last released episode
                // has been watched — not because of which user list it sits in.
                function applyPlaybackSnapshot(remoteEntries) {
                    if (destroyed) return;
                    if (remoteEntries && remoteEntries.length) importRemoteEntries(remoteEntries);
                    localHistory = playbackHistory();
                    var merged = LampaYaniHomeSections.mergeHistory(localHistory, remoteEntries || []);
                    continuing = LampaYaniHomeSections.continueWatchingEntries(merged, {});
                    renderPersonal(personalStats);
                }

                var playbackUserKey = account && (account.user_id || account.login) || '';
                var playbackCache = readHomePlaybackSnapshot(playbackUserKey);
                if (playbackCache.available) applyPlaybackSnapshot(playbackCache.entries);
                var playbackNeedsRefresh = Boolean(LampaYaniAuth.token() && playbackUserKey && !playbackCache.fresh);
                var listNeedsRefresh = Boolean(LampaYaniAuth.token() && Number(account && account.user_id || 0) && !homeListCountsFresh(account.user_id) && (homeButtons.user_lists || homeButtons.updates));
                var libraryRefreshPending = (playbackNeedsRefresh ? 1 : 0) + (listNeedsRefresh ? 1 : 0);
                var libraryRefreshFailed = false;
                var homeDelayScale = lowMemoryDevice || lowCpuDevice ? 2.4 : 1;

                function finishLibraryRefresh(failed) {
                    if (destroyed) return;
                    libraryRefreshFailed = libraryRefreshFailed || Boolean(failed);
                    libraryRefreshPending = Math.max(0, libraryRefreshPending - 1);
                    if (libraryRefreshPending) return setChapterState('library', 'loading');
                    var personal = LampaYaniHomeInsights.personalInsight(continuing, account, personalStats);
                    var hasLibraryData = personal.continue_count + personal.list_total > 0;
                    setChapterState('library', libraryRefreshFailed && !hasLibraryData ? 'offline' : hasLibraryData ? 'ready' : 'empty');
                }

                if (!libraryRefreshPending) {
                    var initialPersonal = LampaYaniHomeInsights.personalInsight(continuing, account, personalStats);
                    setChapterState('library', initialPersonal.continue_count + initialPersonal.list_total > 0 ? 'ready' : 'empty');
                } else {
                    setChapterState('library', 'loading');
                }

                if (playbackNeedsRefresh) scheduleHomeTask(function () {
                    var control = homeRequestControl();
                    // last-watches can refresh only videos this device already
                    // knows. It cannot discover a title watched on another device,
                    // so the account merge must use the complete history range.
                    var recentPlayback = LampaYaniHomeSections.fetchHistoryRange(LampaYaniApi.watchHistory, 300, 30, control).catch(function (error) {
                        if (!homeRequestCancelled(error)) console.warn('[YummyAnime Home] Server playback history is unavailable', error);
                        return null;
                    });
                    Promise.all([recentPlayback]).then(function (result) {
                        if (destroyed) return;
                        if (result[0] !== null) cacheHomePlaybackSnapshot(playbackUserKey, result[0]);
                        queueHomeRender('remote-playback', function () {
                            if (result[0] !== null) applyPlaybackSnapshot(result[0]);
                            finishLibraryRefresh(result[0] === null);
                        });
                    });
                }, 140 * homeDelayScale);

                if (listNeedsRefresh) scheduleHomeTask(function () {
                    LampaYaniApi.userListStats(account.user_id, homeRequestControl()).then(function (stats) {
                        if (destroyed) return;
                        var normalized = LampaYaniHomeInsights.listCounts(stats);
                        var hasCounts = Object.keys(normalized).some(function (key) { return Number(normalized[key] || 0) > 0; });
                        cacheHomeListCounts(account.user_id, hasCounts ? normalized : readHomeListCounts(account.user_id));
                        queueHomeRender('personal-lists', function () {
                            personalStats = stats;
                            renderPersonal(personalStats);
                            finishLibraryRefresh(false);
                        });
                    }).catch(function (error) {
                        if (!homeRequestCancelled(error)) console.warn('[YummyAnime Home] Personal list insights are unavailable', error);
                        queueHomeRender('personal-lists', function () {
                            finishLibraryRefresh(true);
                        });
                    });
                }, 420 * homeDelayScale);

                var notificationUserKey = account && (account.user_id || account.login) || '';
                var notificationCache = readHomeNotificationCount(notificationUserKey);
                function renderNotifications(count) {
                    if (!homeButtons.notifications || count === null || count === undefined) return;
                    count = Math.max(0, Number(count) || 0);
                    prioritySignals.notification_count = count;
                    setCount(homeButtons.notifications, count);
                    setPreview(homeButtons.notifications, count ? String(count) + ' ' + t('unread') : t('no_unread_notifications'), t('authorized'));
                    setServiceState(homeButtons.notifications, count ? 'attention' : 'up');
                    refreshPriority();
                }
                if (notificationCache.available) renderNotifications(notificationCache.count);
                if (LampaYaniAuth.token() && homeButtons.notifications && (!notificationCache.fresh || notificationCache.count === 0)) scheduleHomeTask(function () {
                    LampaYaniApi.notificationCounts(homeRequestControl()).then(function (payload) {
                        var count = LampaYaniHomeInsights.notificationCount(payload);
                        if (count > 0) return count;
                        return LampaYaniApi.notifications(30, 0).then(function (list) {
                            return LampaYaniHomeInsights.resolveNotificationCount(payload, list);
                        }).catch(function () { return count; });
                    }).then(function (count) {
                        if (destroyed) return;
                        cacheHomeNotificationCount(notificationUserKey, count);
                        queueHomeRender('notifications', function () {
                            renderNotifications(count);
                        });
                    }).catch(function (error) {
                        if (!homeRequestCancelled(error)) console.warn('[YummyAnime Home] Notification count is unavailable', error);
                    });
                }, 760 * homeDelayScale);

                if (homeButtons.schedule || homeButtons.new_translations || homeButtons.new_releases || homeButtons.collections || homeButtons.status) {
                    var dashboardCache = readHomeDashboardSnapshot();

                    function renderDashboardSnapshot(dashboard, dataState, updatedAt) {
                        dashboard = dashboard || {};
                        Object.keys(dashboard.counts || {}).forEach(function (key) {
                            setCount(homeButtons[key], dashboard.counts[key]);
                        });
                        var schedule = dashboard.schedule || {};
                        var scheduleKnown = Object.prototype.hasOwnProperty.call(schedule, 'today');
                        renderEpisodeTimeline(dashboard.episode_flow);
                        var service = dashboard.service || {};
                        var episodeData = dashboard.episode_flow || {};
                        var discoveryData = dashboard.discovery || {};
                        var episodeHasData = Boolean(episodeData.japan || episodeData.waiting || episodeData.available);
                        var discoveryHasData = Boolean(discoveryData.new_release || discoveryData.collection);
                        setChapterState('episode_flow', dataState === 'cached' && episodeHasData ? 'cached' : service.feed && service.schedule ? episodeHasData ? 'ready' : 'empty' : service.api ? 'partial' : episodeHasData ? 'cached' : 'offline');
                        setChapterState('discover', dataState === 'cached' && discoveryHasData ? 'cached' : service.feed ? discoveryHasData ? 'ready' : 'empty' : discoveryHasData ? 'cached' : 'offline');
                        setChapterState('service', dataState === 'cached' ? 'cached' : service.degraded ? 'partial' : service.api ? 'ready' : 'offline');
                        var serviceState = dataState === 'cached' ? 'degraded' : service.degraded ? 'degraded' : service.api ? 'up' : 'down';
                        var serviceTitle = dataState === 'cached' ? t('dashboard_data_cached') : service.degraded ? t('degraded') : service.api ? t('api_ok') : t('api_error');
                        setServiceState(homeButtons.status, serviceState);
                        setServiceHub(serviceState, serviceTitle, account && (account.display_name || account.login) ? account.display_name || account.login : t('not_logged_in'));
                        setPreview(homeButtons.status, serviceTitle, [service.feed ? 'API' : '', service.schedule ? t('schedule') : ''].filter(Boolean).join(' · '));
                        setIntroDataState(dataState, updatedAt);
                        setCount(homeButtons.schedule, schedule.today);
                        if (schedule.preview) {
                            var releaseDate = new Date(schedule.preview.timestamp);
                            var releaseTime;
                            try { releaseTime = releaseDate.toLocaleString(locale(), {weekday: 'short', hour: '2-digit', minute: '2-digit'}); }
                            catch (error) { releaseTime = releaseDate.toLocaleString(); }
                            var episode = schedule.preview.episode ? t('episode') + ' ' + schedule.preview.episode : t('release');
                            if (schedule.preview.total) episode += ' ' + t('of') + ' ' + schedule.preview.total;
                            setPreview(homeButtons.schedule, schedule.preview.title, releaseTime + ' · ' + episode);
                            setArtwork(homeButtons.schedule, schedule.preview.poster);
                            setIntroMetric('today', scheduleKnown ? schedule.today : null, [releaseTime, schedule.preview.title].filter(Boolean).join(' · '));
                        } else {
                            setPreview(homeButtons.schedule, '', '');
                            setArtwork(homeButtons.schedule, '');
                            setIntroMetric('today', scheduleKnown ? schedule.today : null, '');
                        }
                        var translations = dashboard.translations || {};
                        var translationsKnown = Object.prototype.hasOwnProperty.call(translations, 'count');
                        var translation = translations.preview;
                        prioritySignals.has_translation = Boolean(translation);
                        if (translation) {
                            setPreview(homeButtons.new_translations, translation.title, [translation.episode, translation.dubbing, translation.source].filter(Boolean).join(' · '));
                            setArtwork(homeButtons.new_translations, translation.poster);
                            setIntroMetric('translations', translationsKnown ? translations.count : null, [translation.title, translation.dubbing].filter(Boolean).join(' · '));
                        } else {
                            setPreview(homeButtons.new_translations, '', '');
                            setArtwork(homeButtons.new_translations, '');
                            setIntroMetric('translations', translationsKnown ? translations.count : null, '');
                        }
                        var discovery = dashboard.discovery || {};
                        var newRelease = discovery.new_release;
                        if (newRelease) {
                            setPreview(homeButtons.new_releases, newRelease.title, newRelease.meta);
                            setArtwork(homeButtons.new_releases, newRelease.poster);
                        } else {
                            setPreview(homeButtons.new_releases, '', '');
                            setArtwork(homeButtons.new_releases, '');
                        }
                        var featuredCollection = discovery.collection;
                        if (featuredCollection) {
                            setPreview(homeButtons.collections, featuredCollection.title, featuredCollection.count ? featuredCollection.count + ' ' + t('anime_count') : '');
                            setArtwork(homeButtons.collections, featuredCollection.poster);
                        } else {
                            setPreview(homeButtons.collections, '', '');
                            setArtwork(homeButtons.collections, '');
                        }
                        refreshPriority();
                    }

                    if (dashboardCache.available) renderDashboardSnapshot(dashboardCache.dashboard, 'cached', dashboardCache.updated_at);
                    function refreshDashboardInsights(forceRefresh) {
                        var requestControl = homeRequestControl();
                        if (forceRefresh) {
                            requestControl.forceRefresh = true;
                            requestControl.cacheFirst = false;
                            requestControl.backgroundRefresh = false;
                        }
                        return LampaYaniHomeInsights.dashboard({
                        feed: function () { return LampaYaniApi.feed(requestControl); },
                        schedule: function () { return LampaYaniApi.schedule(requestControl); },
                        now: Date.now()
                    }).then(function (dashboard) {
                        if (destroyed) return;
                        var service = dashboard.service || {};
                        var merged = LampaYaniHomeInsights.mergeDashboardSnapshot(dashboardCache.dashboard, dashboard);
                        var state = service.api ? service.degraded ? 'partial' : 'live' : dashboardCache.available ? 'offline' : 'offline';
                        var updatedAt = service.api ? Date.now() : dashboardCache.updated_at;
                        if (service.feed && service.schedule) cacheHomeDashboardSnapshot(dashboard);
                        queueHomeRender('dashboard', function () {
                            renderDashboardSnapshot(merged, state, updatedAt);
                        });
                    }).catch(function (error) {
                        if (homeRequestCancelled(error)) return;
                        queueHomeRender('dashboard', function () {
                            if (dashboardCache.available) setIntroDataState('offline', dashboardCache.updated_at);
                            setChapterState('episode_flow', dashboardCache.available ? 'cached' : 'offline');
                            setChapterState('discover', dashboardCache.available ? 'cached' : 'offline');
                            setChapterState('service', 'offline');
                        });
                        console.warn('[YummyAnime Home] Dashboard insights are unavailable', error);
                    });
                    }
                    refreshDashboardInsights(false);
                    refreshEpisodeDashboard = function () { return refreshDashboardInsights(true); };
                }
            };

            this.start = function () {
                if (homeAuthorizationChanged || homeAuthorized !== Boolean(LampaYaniAuth.token())) {
                    homeAuthorizationChanged = false;
                    Lampa.Activity.replace({
                        url: object && object.url || 'yani/home',
                        title: object && object.title || 'YummyAnime',
                        component: 'yani_home'
                    });
                    return;
                }
                refreshContinueWatching();
                if (homeStartedOnce) refreshEpisodeDashboard();
                homeStartedOnce = true;
                Lampa.Controller.add('content', {
                    toggle: function () {
                        var target = last && document.documentElement.contains(last) ? last : false;
                        if (!target) {
                            var savedKey = Lampa.Storage && Lampa.Storage.get ? String(Lampa.Storage.get(homeFocusStorageKey, '') || '') : '';
                            var availableKeys = [];
                            var availableNodes = {};
                            homeCollection().find('.selector[data-yani-home-key]').each(function () {
                                var key = String($(this).attr('data-yani-home-key') || '');
                                if (!key) return;
                                availableKeys.push(key);
                                availableNodes[key] = this;
                            });
                            var focusKey = LampaYaniHomeInsights.dashboardInitialFocus(savedKey, preferredHomeKey, availableKeys);
                            target = availableNodes[focusKey] || false;
                        }
                        if (!target) target = homeCollection().find('.selector')[0] || false;
                        focusHomeElement(target, isRailFocus(target) ? railCollection() : homeCollection());
                        if (target) renderIntroContext($(target));
                    },
                    left: function () {
                        noteHomeNavigation();
                        if (isRailFocus(last)) {
                            var key = String($(last).data('yani-home-target-key') || '');
                            var tile = key && homeButtons[key] && homeButtons[key][0];
                            if (!tile) tile = homeCollection().find('.selector[data-yani-home-key]').first()[0];
                            if (tile) focusHomeElement(tile, homeCollection());
                            else Lampa.Controller.toggle('menu');
                            return;
                        }
                        if (Navigator.canmove('left')) Navigator.move('left');
                        else Lampa.Controller.toggle('menu');
                    },
                    right: function () {
                        noteHomeNavigation();
                        if (isRailFocus(last)) return;
                        if (Navigator.canmove('right')) Navigator.move('right');
                        else focusSectionRail();
                    },
                    up: function () {
                        noteHomeNavigation();
                        if (isRailFocus(last)) {
                            var nodes = railNodes();
                            var index = nodes.index(last);
                            if (index > 0) focusHomeElement(nodes.get(index - 1), railCollection());
                            else Lampa.Controller.toggle('head');
                            return;
                        }
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else Lampa.Controller.toggle('head');
                    },
                    down: function () {
                        noteHomeNavigation();
                        if (isRailFocus(last)) {
                            var nodes = railNodes();
                            var index = nodes.index(last);
                            if (index >= 0 && index + 1 < nodes.length) focusHomeElement(nodes.get(index + 1), railCollection());
                            return;
                        }
                        movePageDown(scroll);
                    },
                    back: goBack
                });
                Lampa.Controller.toggle('content');
            };

            this.render = function (js) { return js ? html[0] : html; };
            this.destroy = function () {
                destroyed = true;
                if (homeFocusFrame) cancelAnimationFrame(homeFocusFrame);
                homeFocusFrame = 0;
                homeTimers.forEach(function (timer) { clearTimeout(timer); });
                homeTimers = [];
                if (homeRenderIdleTimer) clearTimeout(homeRenderIdleTimer);
                if (homeRenderFrame) cancelAnimationFrame(homeRenderFrame);
                homeRenderIdleTimer = homeRenderFrame = 0;
                homePendingRenders = {};
                if (homeAbortController) homeAbortController.abort();
                if (typeof document !== 'undefined' && document.removeEventListener) document.removeEventListener('yani:auth-changed', onHomeAuthorizationChanged);
                if (window.$ && typeof document !== 'undefined') $(document).off('yani:watch-progress.yaniHome', onHomeWatchProgress);
                homeButtons = {};
                currentEpisodeFlow = null;
                preferredHomeKey = 'catalog';
                renderIntroContext = function () {};
                updateEpisodeCountdown = function () {};
                homeCollection = function () { return scroll.render(); };
                railCollection = function () { return scroll.render(); };
                railNodes = function () { return $(); };
                isRailFocus = function () { return false; };
                focusHomeElement = function () { return false; };
                focusSectionRail = function () { return false; };
                refreshContinueWatching = function () {};
                scroll.destroy();
                html.remove();
            };
        }

        return {Component: Home};
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.HomeScreen = window.LampaYaniHomeScreen = {create: create};
}(window));
