(function (window) {
    'use strict';

    function t(name) {
        return window.LampaYaniI18n ? LampaYaniI18n.t(name) : name;
    }

    function locale() {
        return window.LampaYaniI18n ? LampaYaniI18n.locale() : 'ru-RU';
    }

    var videoData = LampaYaniVideoData.create({
        fetch: function (id, options) { return LampaYaniApi.videos(id, options); }
    });

    var cardModel = LampaYaniCardModel.create({
        t: t,
        getPlayback: function (id) { return getPlayback(id); },
        formatRating: function (value) { return formatRating(value); },
        createRatingLogo: function (rating, className) { return createRatingLogo(rating, className); }
    });
    var toCard = cardModel.toCard;
    var extractRatings = cardModel.extractRatings;
    var mediaMeta = cardModel.mediaMeta;
    var watchedEpisodeCount = cardModel.watchedEpisodeCount;
    var createDetailRatings = cardModel.createDetailRatings;

    var cardRenderers = LampaYaniCardRenderers.create({
        t: t,
        locale: locale,
        getPlayback: function (id) { return getPlayback(id); },
        mediaMeta: function (item) { return mediaMeta(item); },
        loadVideos: function (id, options) { return videoData.payload(id, options); },
        clearEpisodeProgress: function (card, videos) {
            var operation = clearEpisodeProgress(card, videos);
            videoData.invalidate(card && card.yani_id);
            return operation;
        }
    });
    var cardRenderElement = cardRenderers.cardRenderElement;
    var addCardMediaBadges = cardRenderers.addCardMediaBadges;
    var mediaTypeLabels = cardRenderers.mediaTypeLabels;
    var cardMediaMotionAllowed = cardRenderers.cardMediaMotionAllowed;
    var cardStatusLabel = cardRenderers.cardStatusLabel;
    var cardStatusKey = cardRenderers.cardStatusKey;
    var cardEpisodesLabel = cardRenderers.cardEpisodesLabel;
    var addCardMetadata = cardRenderers.addCardMetadata;
    var cardFreshness = cardRenderers.cardFreshness;
    var addCardUpdateBadge = cardRenderers.addCardUpdateBadge;
    var addCardRecommendationBadge = cardRenderers.addCardRecommendationBadge;
    var addCardListBadge = cardRenderers.addCardListBadge;
    var cardPlaybackState = cardRenderers.cardPlaybackState;
    var addCardPlaybackProgress = cardRenderers.addCardPlaybackProgress;
    var syncCardEpisodesMeta = cardRenderers.syncCardEpisodesMeta;
    var syncCardOverlayLayout = cardRenderers.syncCardOverlayLayout;
    var formatRating = cardRenderers.formatRating;
    var createRatingLogo = cardRenderers.createRatingLogo;
    var addCardRatings = cardRenderers.addCardRatings;

    var cardBind = LampaYaniCardBind.create({
        decorate: cardRenderers.decorate,
        cardRenderElement: cardRenderElement,
        attachPosterFallback: function (element, card) { return LampaYaniMedia.attachPosterFallback(element, card); },
        openYummyDetail: function (card, notifyFallback) { return openYummyDetail(card, notifyFallback); },
        openStandardLampaCard: function (card) { return openStandardLampaCard(card); },
        showYummyActions: function (card, originElement, originCollection) {
            return showYummyActions(card, originElement, originCollection);
        }
    });
    var getYummyId = cardBind.getYummyId;
    var hasYummyCardData = cardBind.hasYummyCardData;
    var openCardOnce = cardBind.openCardOnce;
    var bindYummyCard = cardBind.bindYummyCard;
    var bindYummyCardRender = cardBind.bindYummyCardRender;
    var bindRecommendedCardRender = cardBind.bindRecommendedCardRender;

    var standardCard = LampaYaniStandardCard.create({
        t: t,
        getYummyId: function (card) { return getYummyId(card); },
        hasYummyCardData: function (value) { return hasYummyCardData(value); },
        openYummyDetail: function (card, notifyFallback) { return openYummyDetail(card, notifyFallback); },
        toCard: function (item) { return toCard(item); },
        formatRating: formatRating
    });
    var openStandardLampaCard = standardCard.openStandardLampaCard;
    var installUndefinedTmdbGuard = standardCard.installUndefinedTmdbGuard;
    var findStandardLampaCard = standardCard.findStandardLampaCard;
    var findYummyMatches = standardCard.findYummyMatches;
    var isNativeAnimeCard = standardCard.isNativeAnimeCard;
    var installFullRating = standardCard.installFullRating;


    var playbackMenu = LampaYaniPlaybackMenu.create({
        t: t,
        showYummySelect: function (params, snapshot) { return showYummySelect(params, snapshot); },
        currentControllerName: function () { return currentControllerName(); },
        listActionTitle: function (card, key) { return listActionTitle(card, key); },
        openYummyDetail: function (card, notifyFallback) { return openYummyDetail(card, notifyFallback); },
        commentsMenu: function (animeId, page, comments, navigation) { return commentsMenu(animeId, page, comments, navigation); },
        openSettingsLogin: function () { return openSettingsLogin(); },
        addCardListBadge: addCardListBadge,
        syncCardOverlayLayout: syncCardOverlayLayout,
        getPlayback: function (id) { return getPlayback(id); },
        voiceOptionSubtitle: function (group) { return voiceOptionSubtitle(group); },
        videoQualityLabel: function (video) { return videoQualityLabel(video); },
        getPreferredPlayer: function () { return getPreferredPlayer(); },
        getPreferredVoice: function () { return getPreferredVoice(); },
        allohaIframeEnabled: function () { return allohaIframeEnabled(); },
        groupPlaybackPriority: function (group) { return groupPlaybackPriority(group); },
        videoPlaybackPriority: function (video, group) { return videoPlaybackPriority(video, group); },
        playerMatchesPreference: function (group, preference) { return playerMatchesPreference(group, preference); },
        rememberPlayer: function (group) { return rememberPlayer(group); },
        launchVideo: function (card, group, videos, selected, options) { return launchVideo(card, group, videos, selected, options); },
        enrichEpisodeTitles: function (card, group) { return enrichEpisodeTitles(card, group); },
        enrichVoiceOptionQuality: function (item, target) { return enrichVoiceOptionQuality(item, target); },
        episodeOptionTitle: function (card, video) { return episodeOptionTitle(card, video); },
        episodeFlags: function (card) { return episodeFlagsFor(card); },
        playbackTargetPreference: function () { return playbackTargetPreference(); },
        androidExternalPlayerAvailable: function () { return externalPlayerAvailable(); },
        externalPlayerKind: function () { return isWebOsPlatform() ? 'webos' : 'android'; },
        isPlaybackSourceEnabled: function (sourceId) { return isPlaybackSourceEnabled(sourceId); },
        playbackSourceId: function (group) { return playbackSourceId(group); },
        openExternalPlayer: function (current, playlist, card) { return openExternalPlayer(current, playlist, card); },
        playInternalPlayer: function (current, playlist) { return playInternalPlayer(current, playlist); },
        yummyTvEnabled: function () { return yummyTvEnabled(); },
        yummyTvAnimeId: function (card) { return yummyTvAnimeId(card); },
        openYummyTv: function (card) { return openYummyTv(card); },
        cancelExternalRestore: function () { return cancelExternalRestore(); },
        loadVideos: function (id, options) { return videoData.payload(id, options); }
    });
    var playbackReturnState = playbackMenu.playbackReturnState;
    var videoSourceUrl = playbackMenu.videoSourceUrl;
    var playerKey = playbackMenu.playerKey;
    var beginPlaybackNavigation = playbackMenu.beginPlaybackNavigation;
    var playbackReturnSnapshot = playbackMenu.playbackReturnSnapshot;
    var clearPlaybackReturn = playbackMenu.clearPlaybackReturn;
    var restorePlaybackInteraction = playbackMenu.restorePlaybackInteraction;
    var showPlaybackSelect = playbackMenu.showPlaybackSelect;
    var showYummyActions = playbackMenu.showYummyActions;
    var openVideos = playbackMenu.openVideos;
    var chooseEpisode = playbackMenu.chooseEpisode;
    var showDirectPlaybackOptions = playbackMenu.showDirectPlaybackOptions;
    var openTitlePlaybackOptions = playbackMenu.openTitlePlaybackOptions;


    var playbackHistoryApi = LampaYaniPlaybackHistory.create({
        t: t,
        bindYummyCardRender: function (first, second, third, options) {
            return bindYummyCardRender(first, second, third, options);
        },
        cardRenderTarget: function (first, second, third) { return cardBind.cardRenderTarget(first, second, third); },
        cardRenderElement: cardRenderElement,
        openVideos: function (card, resume) { return openVideos(card, resume); },
        openYummyDetail: function (card, notifyFallback) { return openYummyDetail(card, notifyFallback); },
        addCardPlaybackProgress: addCardPlaybackProgress,
        syncCardEpisodesMeta: cardRenderers.syncCardEpisodesMeta,
        syncCardOverlayLayout: cardRenderers.syncCardOverlayLayout,
        playerKey: function (group) { return playerKey(group); },
        videoSourceUrl: function (video) { return videoSourceUrl(video); }
    });
    var playbackHistory = playbackHistoryApi.playbackHistory;
    var getPlayback = playbackHistoryApi.getPlayback;
    var rememberPlayback = playbackHistoryApi.rememberPlayback;
    var importRemoteEntries = playbackHistoryApi.importRemoteEntries;
    var importVideosProgress = playbackHistoryApi.importVideosProgress;
    var pullRemoteProgress = playbackHistoryApi.pullRemoteProgress;
    var ensureRemoteHistory = playbackHistoryApi.ensureRemoteHistory;
    var autoProgressSyncEnabled = playbackHistoryApi.autoProgressSyncEnabled;
    var syncServerProgress = playbackHistoryApi.syncServerProgress;
    var clearEpisodeProgress = playbackHistoryApi.clearEpisodeProgress;
    var renderHistoryProgress = playbackHistoryApi.renderHistoryProgress;
    var refreshVisiblePlaybackProgress = playbackHistoryApi.refreshVisiblePlaybackProgress;
    var updatePlaybackProgress = playbackHistoryApi.updatePlaybackProgress;
    var syncPlaybackHistoryManually = playbackHistoryApi.syncPlaybackHistoryManually;
    var bindHistoryCardRender = playbackHistoryApi.bindHistoryCardRender;

    var externalPlayer = LampaYaniExternalPlayer.create({
        t: t,
        playbackReturnState: playbackReturnState,
        beginPlaybackNavigation: function () { return beginPlaybackNavigation(); },
        playbackReturnSnapshot: function () { return playbackReturnSnapshot(); },
        restorePlaybackInteraction: function (snapshot, options) { return restorePlaybackInteraction(snapshot, options); },
        showPlaybackSelect: function (params) { return showPlaybackSelect(params); },
        isAndroidTvPlatform: function () { return isAndroidTvPlatform(); },
        isExternalPlayableUrl: function (url, source) { return isExternalPlayableUrl(url, source); }
    });
    var openExternalVideo = externalPlayer.openExternalVideo;
    var openExternalUri = externalPlayer.openExternalUri;
    var openAndroidAppUri = externalPlayer.openAndroidAppUri;
    var yummyTvEnabled = externalPlayer.yummyTvEnabled;
    var yummyTvAnimeId = externalPlayer.yummyTvAnimeId;
    var openYummyTv = externalPlayer.openYummyTv;
    var prepareExternalRestore = externalPlayer.prepareExternalRestore;
    var cancelExternalRestore = externalPlayer.cancelExternalRestore;
    var currentControllerName = externalPlayer.currentControllerName;
    var showExternalPlaybackOptions = externalPlayer.showExternalPlaybackOptions;

    var usagePolicyVisible = false;
    var tileNavigationKey = '';
    var tileNavigationAt = 0;

    function beginTileNavigation(key) {
        var now = Date.now();
        key = String(key || '');
        if (key && tileNavigationKey === key && now - tileNavigationAt < 1000) return false;
        tileNavigationKey = key;
        tileNavigationAt = now;
        return true;
    }

    function goBack() {
        if (window.Lampa && Lampa.Activity && Lampa.Activity.backward) {
            Lampa.Activity.backward();
        }
    }

    function transientNavigationSnapshot() {
        if (window.LampaYaniNavigation && LampaYaniNavigation.captureSnapshot) {
            var shared = LampaYaniNavigation.captureSnapshot();
            shared.controller = currentControllerName() || 'content';
            return shared;
        }
        var element = document.querySelector('.yani-home .selector.focus, .yani-detail .selector.focus, .yani-account .selector.focus, .yani-schedule .selector.focus') ||
            document.querySelector('.selector.focus') ||
            document.querySelector('.yani-home .selector, .yani-detail .selector, .yani-account .selector, .yani-schedule .selector') ||
            document.querySelector('.selector');
        var collection = element ? $(element).closest('.scroll, .yani-detail, .yani-home, .yani-account, .yani-schedule') : null;
        return {
            controller: currentControllerName() || 'content',
            element: element || null,
            collection: collection && collection.length ? collection : null
        };
    }

    function restoreTransientInteraction(snapshot) {
        snapshot = snapshot || transientNavigationSnapshot();
        setTimeout(function () {
            try {
                if (window.LampaYaniNavigation && LampaYaniNavigation.restoreSnapshot) {
                    LampaYaniNavigation.restoreSnapshot(snapshot);
                    return;
                }
                var controller = snapshot.controller && snapshot.controller !== 'select' && snapshot.controller !== 'input'
                    ? snapshot.controller
                    : 'content';
                var element = snapshot.element;
                if (!element || !document.documentElement.contains(element)) {
                    element = document.querySelector('.yani-home .selector') ||
                        document.querySelector('.yani-detail .selector') ||
                        document.querySelector('.yani-account .selector') ||
                        document.querySelector('.yani-schedule .selector') ||
                        document.querySelector('.selector');
                }
                var collection = snapshot.collection;
                if (!collection || !collection.length || !document.documentElement.contains(collection[0])) {
                    collection = element ? $(element).closest('.scroll, .yani-detail, .yani-home, .yani-account, .yani-schedule') : null;
                }
                if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle(controller);
                if (collection && collection.length && Lampa.Controller && Lampa.Controller.collectionSet) {
                    Lampa.Controller.collectionSet(collection);
                }
                if (element && Lampa.Controller && Lampa.Controller.collectionFocus) {
                    // Select leaves Navigator on hidden selectbox items; re-register
                    // the page target so D-pad focus is visible without an extra key.
                    if (window.Navigator && Navigator.add) Navigator.add(element);
                    Lampa.Controller.collectionFocus(element, collection && collection.length ? collection : undefined);
                }
            } catch (error) {
                console.warn('[YummyAnime] Could not restore transient navigation', error);
            }
        }, 0);
    }

    function showYummySelect(params, snapshot) {
        if (!Lampa.Select || !Lampa.Select.show) return false;
        snapshot = snapshot || transientNavigationSnapshot();
        params = Object.assign({}, params || {});
        // Playback chains disable this and restore themselves after the last window.
        var restoreOnClose = params.yaniRestore !== false;
        delete params.yaniRestore;
        var originalBack = params.onBack;
        var originalSelect = params.onSelect;
        var restored = false;

        function restoreAfterClose() {
            if (!restoreOnClose || restored) return;
            restored = true;
            restoreTransientInteraction(snapshot);
        }

        params.onBack = function () {
            // A nested Select may deliberately rebuild its parent list.
            // Only the root window should restore the underlying Activity.
            if (originalBack) {
                restored = true;
                return originalBack();
            }
            restoreAfterClose();
        };
        // Lampa Select.hide() after a choice does not call onBack, so Controller
        // would stay on 'select' until the next remote key. Restore when the box
        // actually closes and is not immediately replaced by another Select.
        params.onSelect = function (item) {
            var result = originalSelect ? originalSelect.apply(this, arguments) : undefined;
            if (!params.nohide) {
                setTimeout(function () {
                    if (restored) return;
                    if (Lampa.Select && typeof Lampa.Select.opened === 'function' && Lampa.Select.opened()) return;
                    restoreAfterClose();
                }, 0);
            }
            return result;
        };
        Lampa.Select.show(params);
        return true;
    }

    var trailerUi = LampaYaniTrailers.create({
        t: t,
        goBack: goBack,
        showSelect: showYummySelect,
        openExternalVideo: openExternalVideo,
        openEmbedded: openEmbeddedTrailer,
        api: LampaYaniApi,
        utils: LampaYaniUiUtils
    });
    var openTrailers = trailerUi.open;
    var TrailerList = trailerUi.Component;

    window.LampaYani = {
        register: function () {
            if (!window.Lampa || !Lampa.Component || !Lampa.Component.add) {
                console.error('[YummyAnime] Unsupported Lampa version');
                return;
            }

            var settingsReady = false;
            var sidebar = null;

            function addInterface() {
                if (settingsReady) return;
                settingsReady = true;
                try {
                    addSettings();
                    // The account's watch history is shared between devices, so
                    // pull it before anything draws progress from the local
                    // copy — otherwise the TV keeps showing what the phone
                    // already finished.
                    ensureRemoteHistory();
                    registerOnlineSource();
                    registerSearchSource();
                    registerAndroidDirectVideoTube();
                } catch (settingsError) {
                    console.error('[YummyAnime] Settings registration failed', settingsError);
                }
                var account = LampaYaniAuth.get();
                if (account.token && LampaYaniAuth.refreshIfNeeded) {
                    LampaYaniAuth.refreshIfNeeded().then(function () {
                        if (LampaYaniAuth.verify) return LampaYaniAuth.verify();
                    }).catch(function () {});
                }
            }

            Lampa.Component.add('yani_home', Home);

            Lampa.Component.add('yani_catalog', Catalog);
            Lampa.Component.add('yani_top', Top);

            Lampa.Component.add('yani_recommended', Recommended);
            Lampa.Component.add('yani_updates', Updates);
            Lampa.Component.add('yani_new_translations', NewTranslations);
            Lampa.Component.add('yani_new_releases', NewReleases);
            Lampa.Component.add('yani_collections', Collections);
            Lampa.Component.add('yani_collection', CollectionDetail);
            Lampa.Component.add('yani_genres', Genres);
            Lampa.Component.add('yani_schedule', Schedule);
            Lampa.Component.add('yani_history', History);

            Lampa.Component.add('yani_detail', Detail);
            Lampa.Component.add('yani_policy', UsagePolicy);
            Lampa.Component.add('yani_trailers', TrailerList);
            Lampa.Component.add('yani_account', Account);
            Lampa.Component.add('yani_user_lists', UserLists);
            Lampa.Component.add('yani_account_list', AccountList);
            Lampa.Component.add('yani_notifications', Notifications);
            Lampa.Component.add('yani_subscriptions', Subscriptions);
            Lampa.Component.add('yani_auth', AuthPage);

            Lampa.Component.add('yani_status', StatusDashboard);
            Lampa.Component.add('yani_player', IframePlayer);

            installUndefinedTmdbGuard();
            installFullRating();

            if (window.appready) addInterface();
            else if (Lampa.Listener && Lampa.Listener.follow) {
                Lampa.Listener.follow('app', function (event) {
                    if (event.type === 'ready') addInterface();
                });
            }

            try {
                if (window.LampaYaniMenu && typeof LampaYaniMenu.create === 'function') {
                    sidebar = LampaYaniMenu.create({
                        onEnter: function () {
                            Lampa.Activity.push({
                                url: 'yani',
                                title: window.LampaYaniMenu.TITLE,
                                component: 'yani_home'
                            });
                        }
                    });
                    sidebar.start(Lampa.Listener);
                }
            } catch (menuError) {
                console.error('[YummyAnime] Sidebar registration failed', menuError);
            }

            console.log('[YummyAnime] Extension registered');
        }
    };

    function Top(object) {
        object.topMode = true;
        object.params = Object.assign({limit: 30, sort: 'top', sort_forward: true, from_year: 1900}, object.params || {});
        return Catalog(object);
    }

    var catalogScreen = LampaYaniCatalogScreen.create({
        t: t,
        bindYummyCardRender: bindYummyCardRender,
        transientNavigationSnapshot: transientNavigationSnapshot,
        showYummySelect: showYummySelect,
        genreTitle: genreTitle,
        genreDescription: genreDescription,
        copyParams: copyParams,
        mapUniqueCards: mapUniqueCards
    });
    var Catalog = catalogScreen.Component;

    var homeScreen = LampaYaniHomeScreen.create({
        t: t,
        locale: locale,
        toCard: toCard,
        openVideos: openVideos,
        playbackHistory: playbackHistory,
        importRemoteEntries: importRemoteEntries,
        goBack: goBack,
        yummyAnimeIcon: yummyAnimeIcon,
        openNotifications: openNotifications,
        openUserLists: openUserLists,
        openContinueWatching: openContinueWatching,
        readHomePlaybackSnapshot: readHomePlaybackSnapshot,
        cacheHomePlaybackSnapshot: cacheHomePlaybackSnapshot,
        readHomeDashboardSnapshot: readHomeDashboardSnapshot,
        cacheHomeDashboardSnapshot: cacheHomeDashboardSnapshot,
        readHomeNotificationCount: readHomeNotificationCount,
        cacheHomeNotificationCount: cacheHomeNotificationCount,
        readHomeListCounts: readHomeListCounts,
        homeListCountsFresh: homeListCountsFresh,
        cacheHomeListCounts: cacheHomeListCounts,
        openYummyDetail: openYummyDetail,
        movePageDown: movePageDown,
        homeSectionEnabled: homeSectionEnabled,
        openGenres: openGenres,
        openSearch: openSearch,
        openAccount: openAccount,
        openCollections: openCollections,
        openCollection: openCollection,
        resetUserListsSnapshot: function () { userListsSnapshot = null; }
    });
    var Home = homeScreen.Component;

    function UsagePolicy(object) {
        var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
        scroll.minus();
        var html = $('<div class="yani-policy"></div>');
        var title;
        var accept;

        this.create = function () {
            var self = this;
            var mark = $('<div class="yani-policy__mark" aria-hidden="true"></div>').html(yummyAnimeIcon());
            title = $('<div class="yani-policy__title selector"></div>').text(t('usage_policy_title'));
            var content = $('<div class="yani-policy__content"></div>');
            [
                t('usage_policy_as_is'),
                t('usage_policy_information'),
                t('usage_policy_legal'),
                t('usage_policy_responsibility')
            ].forEach(function (paragraph) {
                content.append($('<div class="yani-policy__paragraph"></div>').text(paragraph));
            });
            accept = $('<div class="yani-policy__accept selector"></div>').text(t('usage_policy_accept'));
            accept.on('hover:enter click.yaniPolicyAccept', function (event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                closeUsagePolicy();
            });
            html.append(mark, title, content, accept);
            html.on('hover:focus', function (event) {
                var target = $(event.target).closest('.selector');
                html.find('.focus').removeClass('focus');
                target.addClass('focus');
                scroll.update(target, true);
            });
            scroll.append(html);
            self.activity.loader(false);
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () { Lampa.Controller.collectionSet(scroll.render()); Lampa.Controller.collectionFocus(title, scroll.render()); },
                left: function () { Lampa.Controller.toggle('menu'); },
                right: function () {},
                up: function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                down: function () { movePageDown(scroll); },
                enter: function () {
                    if (accept && accept.trigger) accept.trigger('hover:enter');
                },
                back: function () { closeUsagePolicy(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.render = function (js) { return js ? scroll.render(true) : scroll.render(); };
        this.destroy = function () { usagePolicyVisible = false; scroll.destroy(); html.remove(); };
    }

    var usagePolicyLayer = null;
    var usagePolicyController = '';

    function closeUsagePolicy() {
        usagePolicyVisible = false;
        if (usagePolicyLayer) {
            usagePolicyLayer.remove();
            usagePolicyLayer = null;
        }
        var controller = usagePolicyController || 'settings';
        usagePolicyController = '';
        if (window.Lampa && Lampa.Controller && Lampa.Controller.toggle) {
            try { Lampa.Controller.toggle(controller); } catch (ignore) {}
        }
    }

    function showUsagePolicy() {
        if (usagePolicyVisible) return;
        usagePolicyVisible = true;
        usagePolicyController = document.querySelector('.settings') ? 'settings' : (currentControllerName() || 'settings');
        var layer = $('<div class="yani-policy-layer"></div>');
        var dialog = $('<div class="yani-policy"></div>');
        var mark = $('<div class="yani-policy__mark" aria-hidden="true"></div>').html(yummyAnimeIcon());
        var title = $('<div class="yani-policy__title"></div>').text(t('usage_policy_title'));
        var content = $('<div class="yani-policy__content"></div>');
        [
            t('usage_policy_as_is'),
            t('usage_policy_information'),
            t('usage_policy_legal'),
            t('usage_policy_responsibility')
        ].forEach(function (paragraph) {
            content.append($('<div class="yani-policy__paragraph"></div>').text(paragraph));
        });
        var accept = $('<div class="yani-policy__accept selector"></div>').text(t('usage_policy_accept'));
        accept.on('hover:enter click.yaniPolicyAccept', function (event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            closeUsagePolicy();
        });
        dialog.append(mark, title, content, accept);
        layer.append(dialog);
        layer.on('hover:focus', function (event) {
            var target = $(event.target).closest('.selector');
            layer.find('.focus').removeClass('focus');
            target.addClass('focus');
        });
        $('body').append(layer);
        usagePolicyLayer = layer;
        Lampa.Controller.add('yani_policy', {
            toggle: function () {
                Lampa.Controller.collectionSet(layer);
                Lampa.Controller.collectionFocus(accept, layer);
            },
            left: function () {},
            right: function () {},
            up: function () { if (window.Navigator && Navigator.canmove('up')) Navigator.move('up'); },
            down: function () { if (window.Navigator && Navigator.canmove('down')) Navigator.move('down'); },
            enter: function () { accept.trigger('hover:enter'); },
            back: function () { closeUsagePolicy(); }
        });
        Lampa.Controller.toggle('yani_policy');
    }

    function lampaIcon() {
        return '<svg viewBox="0 0 110 104" aria-hidden="true"><path d="M81.674 103.11C98.568 93.723 110 75.697 110 55 110 24.624 85.376 0 55 0S0 24.624 0 55c0 20.697 11.432 38.723 28.326 48.11C14.887 94.372 6 79.224 6 62 6 34.938 27.938 13 55 13s49 21.938 49 49c0 17.224-8.887 32.373-22.326 41.11Z"/><path d="M92.955 80.008C95.549 74.55 97 68.445 97 62 97 38.804 78.196 20 55 20S13 38.804 13 62c0 6.445 1.452 12.55 4.045 18.008C16.362 77.116 16 74.1 16 71c0-21.539 17.461-39 39-39s39 17.461 39 39c0 3.1-.362 6.116-1.045 9.008Z"/><path d="M55 89c14.359 0 26-11.641 26-26 0-5.071-1.451-9.802-3.961-13.801C82.579 54.799 86 62.5 86 71c0 17.121-13.879 31-31 31S24 88.121 24 71c0-8.5 3.421-16.201 8.961-21.801C30.451 53.198 29 57.929 29 63c0 14.359 11.641 26 26 26Z"/><circle cx="55" cy="63" r="18"/></svg>';
    }

    function yummyAnimeIcon() {
        return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M18.45 0H1.55A1.55 1.55 0 0 0 0 1.55v16.9A1.54 1.54 0 0 0 1.55 20h16.9A1.55 1.55 0 0 0 20 18.45V1.55A1.54 1.54 0 0 0 18.45 0Zm-2.83 5.93-2.1 2.66-2.3-5.43a6.95 6.95 0 0 1 4.4 2.77Zm-2.9 6.57h-4l2.03-4.8 1.98 4.8Zm-2.37-9.34L7.8 9.06 4.87 5.33c.64-.7 1.4-1.26 2.27-1.65a8.18 8.18 0 0 1 3.2-.52ZM3.57 7.39l3.2 4.06-1.56 3.58A6.96 6.96 0 0 1 3.57 7.39Zm6.57 9.56c-1.05.01-2.1-.2-3.05-.65l.76-1.8h5.7l.49 1.15a6.93 6.93 0 0 1-3.9 1.3Zm6.8-7.07a7.8 7.8 0 0 1-1.17 4L14.55 11l2.17-2.77c.14.54.21 1.1.23 1.65Z"/></svg>';
    }

    function Recommended(object) {
        return LampaYaniRecommendations.component(object, {
            t: t,
            history: playbackHistory,
            authorized: function () { return Boolean(LampaYaniAuth.token()); },
            watchHistory: LampaYaniApi.watchHistory,
            resolveUserId: resolveUserListsUserId,
            loadLists: loadUserListsSnapshot,
            loadList: LampaYaniApi.userList,
            normalizeList: normalizeUserList,
            subscriptions: LampaYaniApi.subscriptions,
            schedule: LampaYaniApi.schedule,
            feed: LampaYaniApi.feed,
            notifications: LampaYaniApi.notifications,
            normalizeNotifications: normalizeNotifications,
            detail: LampaYaniApi.detail,
            normalize: LampaYaniApi.normalize,
            toCard: toCard,
            cardRender: bindRecommendedCardRender,
            notice: function (message) { Lampa.Noty.show(message); }
        });
    }

    function NewTranslations(object) {
        return LampaYaniTranslations.component(object, {
            t: t,
            feed: LampaYaniApi.feed,
            toCard: toCard,
            cardRender: bindRecommendedCardRender,
            notice: function (message) { Lampa.Noty.show(message); }
        });
    }

    function NewReleases(object) {
        return LampaYaniReleases.component(object, {
            t: t,
            feed: LampaYaniApi.feed,
            toCard: toCard,
            cardRender: bindRecommendedCardRender,
            notice: function (message) { Lampa.Noty.show(message); }
        });
    }

    function Collections(object) {
        return LampaYaniCollections.catalog(object, {
            t: t,
            feed: LampaYaniApi.feed,
            load: LampaYaniApi.collectionCatalog,
            detail: LampaYaniApi.collectionDetail,
            toCard: toCard,
            decorate: function (element, card) {
                cardRenderers.decorate(element, card);
                LampaYaniMedia.attachPosterFallback(element, card);
            },
            open: openCollection,
            openCard: function (card) { openYummyDetail(card, false); },
            error: function (message) { Lampa.Noty.show(message); }
        });
    }

    var genresScreen = LampaYaniGenresScreen.create({
        t: t,
        toCard: toCard,
        genreTitle: genreTitle,
        genreValue: genreValue,
        openGenreCatalog: openGenreCatalog
    });
    var Genres = genresScreen.Component;

    function CollectionDetail(object) {
        return LampaYaniCollections.detail(object, {
            t: t,
            detail: LampaYaniApi.collectionDetail,
            toCard: toCard,
            cardRender: bindRecommendedCardRender,
            error: function (message) { Lampa.Noty.show(message); }
        });
    }

    function Updates(object) {
        return LampaYaniUpdates.component(object, {
            t: t,
            authorized: function () { return Boolean(LampaYaniAuth.token()); },
            resolveUserId: resolveUserListsUserId,
            loadLists: loadUserListsSnapshot,
            subscriptions: LampaYaniApi.subscriptions,
            schedule: LampaYaniApi.schedule,
            feed: LampaYaniApi.feed,
            normalize: LampaYaniApi.normalize,
            toCard: toCard,
            cardRender: bindYummyCardRender,
            notice: function (message) { Lampa.Noty.show(message); }
        });
    }

    function History(object) {
        return LampaYaniHomeSections.history(object, {
            t: t,
            history: playbackHistory,
            toCard: toCard,
            detail: LampaYaniApi.detail,
            authorized: function () { return Boolean(LampaYaniAuth.token()); },
            fetchRemote: LampaYaniApi.watchHistory,
            importRemote: importRemoteEntries,
            historyCardRender: bindHistoryCardRender,
            // Redraws one already-rendered card after its details arrive, so
            // Continue Watching can show the list first and fill the badges in
            // afterwards instead of waiting for a request per title.
            redrawCard: function (card) {
                if (!card || !card.yani_id) return;
                var selector = '[data-yani-card-id="' + String(card.yani_id).replace(/"/g, '') + '"]';
                $(selector).each(function () {
                    try { cardRenderers.decorate(this, card); } catch (error) {}
                });
            }
        });
    }

    function listActionTitle(card, key) {
        var ids = {watching: 0, planned: 1, completed: 2, dropped: 3, postponed: 5};
        var title = t(key);
        return hasYummyList(card, ids[key]) ? '✓ ' + title : title;
    }

    function hasYummyList(card, listId) {
        return Boolean(card) && card.yani_list_id !== null && card.yani_list_id !== undefined && card.yani_list_id !== '' && Number(card.yani_list_id) === listId;
    }

    var accountScreen = LampaYaniAccountScreen.create({
        t: t,
        autoProgressSyncEnabled: autoProgressSyncEnabled,
        syncPlaybackHistoryManually: syncPlaybackHistoryManually,
        goBack: goBack,
        openNotifications: openNotifications,
        openSubscriptions: openSubscriptions,
        openUserReviews: openUserReviews,
        accountListDefinitions: accountListDefinitions,
        cacheHomeListCounts: cacheHomeListCounts,
        openAccountList: openAccountList,
        formatAccountDate: formatAccountDate,
        formatWatchTime: formatWatchTime,
        localizedAuthText: function (key) { return localizedAuthText(key); },
        openAccountLogin: function () { return openAccountLogin(); },
        logoutFromAccount: function () { return logoutFromAccount(); }
    });
    var Account = accountScreen.Component;

    function AuthPage(object) {
        return LampaYaniAuthPage.create(object, {
            t: t,
            input: showYummyInput,
            goBack: goBack,
            hint: function () { return localizedAuthText('auth_hint'); },
            onAuthChanged: syncSettingsAuthStatus,
            onAuthorized: function () {
                ensureRemoteHistory(true).catch(function () {});
                if (object && object.refresh_account_on_authorized) {
                    setTimeout(function () {
                        Lampa.Activity.replace({url: 'yani/account', title: 'YummyAnime ' + t('account'), component: 'yani_account'});
                    }, 0);
                }
            }
        });
    }

    function openNotifications() {
        Lampa.Activity.push({url: 'yani/notifications', title: t('notifications_title'), component: 'yani_notifications'});
    }

    function openUserLists() {
        if (!LampaYaniAuth.token()) return Lampa.Noty.show(localizedAuthText('login_required'));
        Lampa.Activity.push({
            url: 'yani/user-lists',
            title: 'YummyAnime · ' + t('user_lists'),
            component: 'yani_user_lists'
        });
    }

    function openWatchHistory() {
        Lampa.Activity.push({
            url: 'yani/history',
            title: 'YummyAnime · ' + t('watch_history'),
            component: 'yani_history',
            mode: 'history'
        });
    }

    function openContinueWatching() {
        Lampa.Activity.push({
            url: 'yani/continue-watching',
            title: 'YummyAnime · ' + t('continue_watching'),
            component: 'yani_history',
            mode: 'continue'
        });
    }

    function openSubscriptions(userId) {
        Lampa.Activity.push({url: 'yani/subscriptions', title: t('subscriptions'), component: 'yani_subscriptions', userId: userId});
    }

    function openUserReviews(userId) {
        LampaYaniApi.userReviews(userId, 30, 0).then(function (payload) {
            var response = payload && payload.response ? payload.response : payload;
            var items = Array.isArray(response) ? response : response && (response.items || response.data || response.reviews) || [];
            if (!items.length) return Lampa.Noty.show(t('reviews_empty'));
            showYummySelect({title: t('my_reviews'), items: items.map(function (review) {
                var anime = review.anime || review.title_data || review.object || {};
                var title = anime.title || anime.name || review.anime_title || review.title || t('anime');
                var text = cleanCommentText(review.text || review.body || review.description || '');
                var score = review.rate || review.rating || review.score;
                return {
                    title: title + (score ? ' · ' + score + '/10' : ''),
                    subtitle: text.slice(0, 180),
                    review: review,
                    anime: anime
                };
            }), onSelect: function (item) {
                var anime = item.anime || {};
                var id = anime.anime_id || anime.id || item.review.anime_id;
                if (id) openYummyDetail(toCard(anime.anime_id || anime.id ? anime : {anime_id: id, title: item.title}), true);
            }});
        }).catch(function (error) {
            console.error('[YummyAnime Reviews]', error);
            Lampa.Noty.show(t('reviews_error'));
        });
    }

    function Subscriptions(object) {
        return LampaYaniAccountLists.subscriptions(object, {toCard: toCard, cardRender: bindYummyCardRender, t: t});
    }

    function Notifications(object) {
        return LampaYaniNotifications.create(object, {
            t: t,
            normalize: normalizeNotifications,
            formatDate: formatNotificationDate,
            toCard: toCard,
            openDetail: openYummyDetail,
            resolveAnime: LampaYaniApi.detail,
            fetch: LampaYaniApi.notifications,
            markRead: LampaYaniApi.markNotificationRead,
            markAllRead: LampaYaniApi.markAllNotificationsRead,
            deleteAll: LampaYaniApi.deleteAllNotifications,
            onUnreadCount: function (count) {
                var account = LampaYaniAuth.get();
                cacheHomeNotificationCount(account && (account.user_id || account.login) || '', count);
            },
            goBack: goBack
        });
    }

    function accountListDefinitions() {
        return [
            {id: 0, key: 'watching', title: t('watching'), icon: 'eye'},
            {id: 1, key: 'planned', title: t('planned'), icon: 'cloud'},
            {id: 2, key: 'completed', title: t('completed'), icon: 'flag'},
            {id: 3, key: 'dropped', title: t('dropped'), icon: 'eye-off'},
            {id: 4, key: 'favorites', title: t('favorites'), icon: 'heart'},
            {id: 5, key: 'postponed', title: t('postponed'), icon: 'hourglass'}
        ];
    }

    var userListsSnapshot = null;
    var homeListCountsCacheKey = 'yani_home_list_counts';
    var homeListCountsCacheLifetime = 300000;
    var homeNotificationCacheKey = 'yani_home_notification_count';
    var homeNotificationCacheLifetime = 300000;
    var homeDashboardCacheKey = 'yani_home_dashboard_snapshot';
    var homeDashboardCacheLifetime = 86400000;
    var homePlaybackCacheKey = 'yani_home_playback_snapshot_v2';
    var homePlaybackCacheLifetime = 300000;

    function readHomePlaybackSnapshot(userKey) {
        if (!userKey || !Lampa.Storage || !Lampa.Storage.get) return {available: false, fresh: false, entries: []};
        try {
            var cached = Lampa.Storage.get(homePlaybackCacheKey, '{}');
            if (typeof cached === 'string') cached = JSON.parse(cached || '{}');
            if (String(cached && cached.user_key || '') !== String(userKey) || !Array.isArray(cached.entries)) {
                return {available: false, fresh: false, entries: []};
            }
            return {
                available: true,
                fresh: Boolean(cached.updated_at && Date.now() - Number(cached.updated_at) < homePlaybackCacheLifetime),
                entries: cached.entries
            };
        } catch (error) { return {available: false, fresh: false, entries: []}; }
    }

    function cacheHomePlaybackSnapshot(userKey, entries) {
        if (!userKey || !Lampa.Storage || !Lampa.Storage.set) return;
        Lampa.Storage.set(homePlaybackCacheKey, JSON.stringify({
            user_key: String(userKey),
            updated_at: Date.now(),
            entries: Array.isArray(entries) ? entries.slice(0, 300) : []
        }));
    }

    function readHomeDashboardSnapshot() {
        if (!Lampa.Storage || !Lampa.Storage.get) return {available: false, updated_at: 0, dashboard: {}};
        try {
            var cached = Lampa.Storage.get(homeDashboardCacheKey, '{}');
            if (typeof cached === 'string') cached = JSON.parse(cached || '{}');
            var updatedAt = Number(cached && cached.updated_at || 0);
            var available = Boolean(updatedAt && Date.now() - updatedAt < homeDashboardCacheLifetime && cached.dashboard && typeof cached.dashboard === 'object');
            return {available: available, updated_at: updatedAt, dashboard: available ? cached.dashboard : {}};
        } catch (error) { return {available: false, updated_at: 0, dashboard: {}}; }
    }

    function cacheHomeDashboardSnapshot(dashboard) {
        if (!dashboard || !Lampa.Storage || !Lampa.Storage.set) return;
        Lampa.Storage.set(homeDashboardCacheKey, JSON.stringify({updated_at: Date.now(), dashboard: dashboard}));
    }

    function readHomeNotificationCount(userKey) {
        if (!userKey || !Lampa.Storage || !Lampa.Storage.get) return {available: false, fresh: false, count: 0};
        try {
            var cached = Lampa.Storage.get(homeNotificationCacheKey, '{}');
            if (typeof cached === 'string') cached = JSON.parse(cached || '{}');
            if (String(cached && cached.user_key || '') !== String(userKey)) return {available: false, fresh: false, count: 0};
            return {
                available: cached.count !== undefined,
                fresh: Boolean(cached.updated_at && Date.now() - Number(cached.updated_at) < homeNotificationCacheLifetime),
                count: Math.max(0, Number(cached.count) || 0)
            };
        } catch (error) { return {available: false, fresh: false, count: 0}; }
    }

    function cacheHomeNotificationCount(userKey, count) {
        if (!userKey || !Lampa.Storage || !Lampa.Storage.set) return;
        Lampa.Storage.set(homeNotificationCacheKey, JSON.stringify({
            user_key: String(userKey),
            updated_at: Date.now(),
            count: Math.max(0, Number(count) || 0)
        }));
    }

    function homeListCountsCache(userId) {
        if (!userId || !Lampa.Storage || !Lampa.Storage.get) return {};
        try {
            var cached = Lampa.Storage.get(homeListCountsCacheKey, '{}');
            if (typeof cached === 'string') cached = JSON.parse(cached || '{}');
            return Number(cached && cached.user_id || 0) === Number(userId) ? cached : {};
        } catch (error) { return {}; }
    }

    function readHomeListCounts(userId) {
        return homeListCountsCache(userId).counts || {};
    }

    function homeListCountsFresh(userId) {
        var cached = homeListCountsCache(userId);
        return Boolean(cached.updated_at && Date.now() - Number(cached.updated_at) < homeListCountsCacheLifetime);
    }

    function cacheHomeListCounts(userId, counts) {
        if (!userId || !Lampa.Storage || !Lampa.Storage.set) return;
        Lampa.Storage.set(homeListCountsCacheKey, JSON.stringify({
            user_id: Number(userId),
            updated_at: Date.now(),
            counts: counts || {}
        }));
    }

    function resolveUserListsUserId() {
        var account = LampaYaniAuth.get();
        var storedId = Number(account && account.user_id || 0);
        if (storedId) return Promise.resolve(storedId);
        return LampaYaniApi.profile().then(function (payload) {
            var profile = payload && payload.response ? payload.response : payload;
            var userId = Number(profile && (profile.id || profile.user_id || profile.user && profile.user.id) || 0);
            if (!userId) throw new Error('YummyAnime profile id is missing');
            LampaYaniAuth.save({
                token: LampaYaniAuth.token(),
                login: account && account.login,
                display_name: account && account.display_name,
                user_id: userId
            });
            return userId;
        });
    }

    function loadUserListsSnapshot(userId) {
        var now = Date.now();
        if (userListsSnapshot && userListsSnapshot.userId === userId && now - userListsSnapshot.createdAt < 300000) {
            return userListsSnapshot.promise;
        }
        var promise = LampaYaniApi.userLists(userId).then(normalizeUserList);
        userListsSnapshot = {userId: userId, createdAt: now, promise: promise};
        promise.catch(function () {
            if (userListsSnapshot && userListsSnapshot.promise === promise) userListsSnapshot = null;
        });
        return promise;
    }

    function loadUserListShortcutCounts() {
        var counts = {history: Object.keys(playbackHistory()).length};
        return resolveUserListsUserId().then(function (id) {
            return Promise.all([
                loadUserListsSnapshot(id),
                LampaYaniHomeSections.fetchHistoryRange(LampaYaniApi.watchHistory, 100, 30).catch(function () { return []; })
            ]);
        }).then(function (result) {
            var definitions = accountListDefinitions();
            definitions.forEach(function (definition) {
                counts[definition.key] = filterAccountListItems(definition, result[0]).length;
            });
            var historyPayload = result[1] && result[1].response ? result[1].response : result[1];
            var remoteHistory = Array.isArray(historyPayload) ? historyPayload : historyPayload && (historyPayload.items || historyPayload.data || historyPayload.history || historyPayload.results) || [];
            counts.history = Math.max(counts.history, remoteHistory.length);
            cacheHomeListCounts(LampaYaniAuth.get().user_id, counts);
            return counts;
        });
    }

    function userListItemTime(item) {
        item = item || {};
        var current = item.user && item.user.list || item.user_list || item.list_state || {};
        var nested = current.list && typeof current.list === 'object' ? current.list : {};
        var value = item.updated_at || item.date || item.created_at || current.updated_at || current.date ||
            current.created_at || nested.updated_at || nested.date || nested.created_at || 0;
        var numeric = Number(value);
        if (numeric > 0) return numeric < 100000000000 ? numeric * 1000 : numeric;
        var parsed = Date.parse(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    function localHistoryCards(remotePayload) {
        var remote = LampaYaniHomeSections.normalizeRemoteHistory(remotePayload || []);
        return LampaYaniHomeSections.mergeHistory(playbackHistory(), remote).map(function (entry) {
            var card = toCard(Object.assign({}, entry.card || {}, {
                anime_id: entry.anime_id,
                title: entry.title || entry.card && entry.card.title,
                poster: entry.screenshot || entry.poster || entry.card && entry.card.poster,
                updated_at: entry.updated_at || 0
            }));
            card.yani_list_progress = entry.duration > 0 ? Math.max(0, Math.min(1, Number(entry.time || 0) / Number(entry.duration))) : 0;
            card.yani_episode_number = entry.number || '';
            card.yani_screenshot = entry.screenshot || '';
            card.yani_remote_ids = Object.assign({}, card.yani_remote_ids || {}, entry.mal_id ? {mal: entry.mal_id} : {});
            return card;
        });
    }

    function hydrateHistoryPosters(cards, listItems) {
        var known = {};
        (listItems || []).forEach(function (item) {
            var card = toCard(item);
            if (card.yani_id && card.poster) known[String(card.yani_id)] = card.poster;
        });
        cards.forEach(function (card) {
            var poster = known[String(card.yani_id || '')];
            if (!card.poster && poster) card.poster = card.img = poster;
        });

        function videoFrame(card) {
            return videoData.payload(card.yani_id).then(function (payload) {
                var groups = payload && payload.response ? payload.response : payload;
                var videos = [];
                (Array.isArray(groups) ? groups : []).forEach(function (group) {
                    videos = videos.concat(group && group.videos || []);
                });
                var wanted = window.LampaYaniEpisode.normalize(card.yani_episode_number || '');
                var video = videos.filter(function (item) {
                    return window.LampaYaniEpisode.same(window.LampaYaniEpisode.valueOf(item), wanted);
                })[0] || {};
                var data = LampaYaniUiUtils.videoData(video);
                return video.screenshot || video.thumbnail || video.preview || data.screenshot || data.thumbnail || data.preview || '';
            }).catch(function () { return ''; });
        }

        function resolveEpisodeFrame(card, detailed) {
            if (card.yani_screenshot) return Promise.resolve(card.yani_screenshot);
            var remote = detailed && detailed.yani_remote_ids || card.yani_remote_ids || {};
            var malId = remote.mal || remote.mal_id || remote.myanimelist;
            var tenrai = malId && card.yani_episode_number
                ? LampaYaniApi.episodeThumbnails(malId).then(function (images) {
                    return images[String(window.LampaYaniEpisode.normalize(card.yani_episode_number))] || '';
                })
                : Promise.resolve('');
            return tenrai.then(function (image) { return image || videoFrame(card); });
        }

        var missing = cards.filter(function (card) { return card.yani_id && !card.yani_screenshot; }).slice(0, 10);
        function next(offset) {
            if (offset >= missing.length) return Promise.resolve(cards);
            return Promise.all(missing.slice(offset, offset + 2).map(function (card) {
                return LampaYaniApi.detail(card.yani_id).then(function (payload) {
                    var value = payload && payload.response ? payload.response : payload;
                    var detailed = toCard(value || {});
                    card.yani_remote_ids = detailed.yani_remote_ids || card.yani_remote_ids;
                    return resolveEpisodeFrame(card, detailed).then(function (frame) {
                        if (frame) card.poster = card.img = card.yani_screenshot = frame;
                        else if (!card.poster && detailed.poster) card.poster = card.img = detailed.poster;
                    });
                }).catch(function () {});
            })).then(function () { return next(offset + 2); });
        }
        return next(0);
    }

    function loadUserListRows() {
        return resolveUserListsUserId().then(function (userId) {
            return Promise.all([
                loadUserListsSnapshot(userId),
                LampaYaniApi.watchHistory(30, 0).catch(function () { return []; })
            ]);
        }).then(function (result) {
            var items = result[0];
            var rows = accountListDefinitions().map(function (definition) {
                var selected = filterAccountListItems(definition, items).slice().sort(function (a, b) {
                    return userListItemTime(b) - userListItemTime(a);
                });
                return {
                    title: definition.title,
                    definition: definition,
                    total: selected.length,
                    results: selected.slice(0, 10).map(function (item) {
                        var card = toCard(item);
                        card.yani_list_progress = LampaYaniAccountListControls.progress(item);
                        return card;
                    })
                };
            });
            var history = localHistoryCards(result[1]);
            return hydrateHistoryPosters(history.slice(0, 10), items).then(function (preview) {
                rows.push({title: t('watch_history'), history: true, total: history.length, results: preview});
                return rows;
            });
        });
    }

    function filterAccountListItems(definition, items) {
        return LampaYaniAccountLists.filterItems(definition, items);
    }

    function pushAccountList(definition, items, lazy) {
        Lampa.Activity.push({
            url: 'yani/account/list/' + definition.key,
            title: 'YummyAnime · ' + definition.title,
            component: 'yani_account_list',
            definition: definition,
            page: 1,
            lazy: Boolean(lazy),
            items: items || []
        });
    }

    function openAccountList(definition, items, userId) {
        var selected = filterAccountListItems(definition, items);
        var load = definition.id === 4 || !userId ? Promise.resolve(selected) : LampaYaniApi.userList(userId, definition.id).then(function (payload) {
            var result = normalizeUserList(payload);
            return result.length ? result : selected;
        }).catch(function () { return selected; });
        load.then(function (result) {
            pushAccountList(definition, result);
        });
    }

    function openUserListShortcut(definition) {
        if (!LampaYaniAuth.token()) return Lampa.Noty.show(localizedAuthText('login_required'));
        pushAccountList(definition, [], true);
        return Promise.resolve();
    }

    function loadUserListShortcutItems(definition) {
        function cacheKey(userId) { return 'yani_user_list_' + userId + '_' + definition.id; }
        function readCache(userId) {
            try {
                var cached = Lampa.Storage.get(cacheKey(userId), '{}');
                if (typeof cached === 'string') cached = JSON.parse(cached || '{}');
                return cached && Array.isArray(cached.items) ? cached.items : null;
            } catch (error) { return null; }
        }
        function writeCache(userId, items) {
            try { Lampa.Storage.set(cacheKey(userId), JSON.stringify({updated_at: Date.now(), items: items || []})); }
            catch (error) { console.warn('[YummyAnime User Lists] Could not cache list', error); }
            return items || [];
        }

        return resolveUserListsUserId().then(function (userId) {
            return loadUserListsSnapshot(userId).then(function (items) {
                return writeCache(userId, filterAccountListItems(definition, items));
            }).catch(function (error) {
                var cached = readCache(userId);
                if (cached) return cached;
                throw error;
            });
        });
    }

    function normalizeUserList(payload) {
        return LampaYaniAccountLists.normalize(payload);
    }

    function AccountList(object) {
        return LampaYaniAccountLists.accountList(object, {
            t: t,
            showSelect: showYummySelect,
            toCard: toCard,
            cardRender: bindYummyCardRender,
            loadItems: loadUserListShortcutItems,
            onError: function () { Lampa.Noty.show(t('user_lists_error')); }
        });
    }

    function UserLists(object) {
        return LampaYaniAccountLists.userLists(object, {
            t: t,
            openList: openUserListShortcut,
            openHistory: openWatchHistory,
            // These previews belong to the YummyAnime account, so avoid a
            // second native-card lookup before opening their details.
            openCard: function (card) { openYummyDetail(card, false); },
            loadRows: loadUserListRows,
            goBack: goBack,
            onError: function () { Lampa.Noty.show(t('user_lists_error')); }
        });
    }

    function formatAccountDate(timestamp) {
        if (!timestamp) return '—';
        try {
            return new Date(Number(timestamp) * 1000).toLocaleDateString(locale(), {day: 'numeric', month: 'long', year: 'numeric'});
        } catch (error) {
            return new Date(Number(timestamp) * 1000).toLocaleDateString();
        }
    }

    function normalizeNotifications(payload) {
        return LampaYaniNotifications.normalize(payload);
    }

    function formatNotificationDate(value) {
        if (!value) return '';
        if (typeof value === 'number' || /^\d+$/.test(String(value))) return formatAccountDate(value);
        var parsed = new Date(value);
        return isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString(locale(), {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
    }

    function formatWatchTime(seconds) {
        var hours = Math.floor(Number(seconds || 0) / 3600);
        var days = Math.floor(hours / 24);
        var restHours = hours % 24;
        return days ? days + ' ' + t('days_short') + ' ' + restHours + ' ' + t('hours_short') : hours + ' ' + t('hours_short');
    }

    function StatusDashboard(object) {
        return LampaYaniStatus.create(object, {
            t: t,
            locale: locale,
            goBack: goBack
        });
    }

    function Schedule(object) {
        return LampaYaniSchedule.create(object, {
            t: t,
            locale: locale,
            toCard: toCard,
            playbackSourceId: playbackSourceId,
            isPlaybackSourceEnabled: isPlaybackSourceEnabled,
            openYummyDetail: openYummyDetail,
            goBack: goBack
        });
    }

    function Detail(object) {
        return LampaYaniDetail.create(object, {
            t: t,
            locale: locale,
            getYummyId: getYummyId,
            toCard: toCard,
            getPlayback: getPlayback,
            mediaTypeLabels: mediaTypeLabels,
            cardMediaMotionAllowed: cardMediaMotionAllowed,
            createDetailRatings: createDetailRatings,
            detailGenres: detailGenres,
            genreTitle: genreTitle,
            genreValue: genreValue,
            openGenreCatalog: openGenreCatalog,
            openSubjectCatalog: openSubjectCatalog,
            beginPlaybackNavigation: beginPlaybackNavigation,
            openTitlePlaybackOptions: openTitlePlaybackOptions,
            openTrailers: openTrailers,
            lampaIcon: lampaIcon,
            openStandardLampaCard: openStandardLampaCard,
            addCardListBadge: addCardListBadge,
            syncCardOverlayLayout: syncCardOverlayLayout,
            hasYummyList: hasYummyList,
            showYummySelect: showYummySelect,
            openYummyDetail: openYummyDetail,
            commentItem: commentItem,
            commentReplies: commentReplies,
            commentsMenu: commentsMenu,
            transientNavigationSnapshot: transientNavigationSnapshot,
            movePageDown: movePageDown,
            goBack: goBack,
            cleanCommentText: cleanCommentText,
            loadVideos: function (id, options) {
                options = options || {};
                return typeof options.onCached === 'function'
                    ? videoData.stagedList(id, options, options.onCached)
                    : videoData.list(id, options);
            },
            importVideosProgress: importVideosProgress
        });
    }

    function allohaDirectResolverEnabled() {
        return Boolean(
            window.LampaYaniResolver && LampaYaniResolver.enabled && LampaYaniResolver.enabled() ||
            window.LampaYaniLampacResolver && LampaYaniLampacResolver.enabled && LampaYaniLampacResolver.enabled()
        );
    }

    function videoPlaybackPriority(video, group) {
        var url = videoSourceUrl(video);
        if (!url) return 0;
        if (isExternalPlayableUrl(url, video)) return 4;
        var player = String(group && (group.player || group.title) || '');
        var alloha = isAllohaUrl(url) || /alloha/i.test(player);
        if (alloha) return allohaDirectResolverEnabled() ? 3 : 0;
        if (window.LampaYaniStreamResolver && LampaYaniStreamResolver.canResolve && LampaYaniStreamResolver.canResolve(url)) return 3;
        return 1;
    }

    function groupPlaybackPriority(group) {
        var videos = group && group.videos || [];
        return videos.length ? videoPlaybackPriority(videos[0], group) : 0;
    }

    function voiceOptionSubtitle(group) {
        return t('video_quality') + ': ' + (group.quality || t('quality_auto')) +
            (group.source ? ' · ' + group.source : '') +
            (group.latestEpisode ? ' · ' + t('latest_episode') + ': ' + group.latestEpisode : '') +
            ' · ' + Number(group.episodeCount || group.videos.length) + ' ' + t('episodes_short');
    }

    function enrichVoiceOptionQuality(item, target) {
        var group = item && item.group;
        if (!group || group.quality || group.qualityLoading || group.qualityLoaded || !group.videos.length) return;
        var probe = group.videos[0];
        var url = videoSourceUrl(probe);
        if (!url || !window.LampaYaniStreamResolver || !LampaYaniStreamResolver.canResolve(url)) return;
        group.qualityLoading = true;
        LampaYaniStreamResolver.resolve(url, probe).then(function (result) {
            group.qualityLoading = false;
            group.qualityLoaded = true;
            if (!result || !result.url) return;
            probe.yani_stream_url = result.url;
            probe.yani_stream_quality = result.quality || '';
            probe.yani_stream_qualities = result.qualities || null;
            probe.yani_stream_source = result.source || '';
            probe.yani_stream_headers = result.headers || null;
            probe.yani_stream_headers_required = Boolean(result.headersRequired);
            group.quality = result.quality || group.quality;
            item.subtitle = voiceOptionSubtitle(group);
            $(target).find('.selectbox-item__subtitle').text(item.subtitle);
        }).catch(function (error) {
            group.qualityLoading = false;
            group.qualityLoaded = true;
            console.warn('[YummyAnime] Could not inspect voice quality', error);
        });
    }

    function registerOnlineSource() {
        if (!Lampa.Online || !Lampa.Online.register || window.yummyanime_online_source_ready) return;
        window.yummyanime_online_source_ready = true;
        Lampa.Online.register('yummyanime', {
            title: 'YummyAnime',
            search: function (movie, oncomplite) {
                openYummyForMovie(movie);
                if (oncomplite) oncomplite([]);
            },
            onContextMenu: function () { return {name: 'YummyAnime'}; }
        });
    }

    var searchController;

    function getSearchController() {
        if (!searchController) {
            searchController = LampaYaniSearch.create({
                lampa: Lampa,
                api: LampaYaniApi,
                utils: LampaYaniUiUtils,
                toCard: toCard,
                sourceTitle: 'YummyAnime',
                searchTitle: t('search_title'),
                showInput: showYummyInput,
                openDetail: function (card) { openYummyDetail(card, false); },
                openResults: function (query) {
                    Lampa.Activity.push({
                        url: 'yani/search/' + encodeURIComponent(query),
                        title: query,
                        component: 'yani_catalog',
                        params: {q: query, limit: 30}
                    });
                },
                onError: function (error) {
                    console.warn('[YummyAnime] Global search failed', error);
                }
            });
        }
        return searchController;
    }

    function registerSearchSource() {
        getSearchController().register();
    }

    function openYummyForMovie(movie) {
        beginPlaybackNavigation();
        if (movie && movie.yani_card) return openVideos(movie.yani_card);
        if (Lampa.Loading && Lampa.Loading.start) Lampa.Loading.start();
        findYummyMatches(movie).then(function (matches) {
            if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
            if (!matches.length) {
                Lampa.Noty.show(t('no_yummy_match'));
                restorePlaybackInteraction();
                return;
            }
            if (matches.length === 1) return openVideos(matches[0]);

            showPlaybackSelect({
                title: t('choose_anime'),
                items: matches.map(function (card) {
                    return {title: card.title + (card.release_date ? ' · ' + card.release_date : ''), card: card};
                }),
                onSelect: function (item) { openVideos(item.card); }
            });
        }).catch(function (error) {
            if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
            console.error('[YummyAnime Search Source]', error);
            Lampa.Noty.show(t('catalog_load_error'));
            restorePlaybackInteraction();
        });
    }

    function openYummyDetail(card, notifyFallback) {
        var id = getYummyId(card);
        if (!id) {
            Lampa.Noty.show(t('no_yummy_match'));
            return;
        }
        card.yani_id = id;
        if (notifyFallback && Lampa.Noty) Lampa.Noty.show(t('lampa_card_fallback'));
        var current = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
        if (current && current.component === 'yani_detail' && String(current.yani_id || current.id) === String(id)) return;
        Lampa.Activity.push({
            url: 'yani/detail/' + encodeURIComponent(id),
            title: card.title,
            component: 'yani_detail',
            id: id,
            yani_id: id,
            card: card
        });
    }



    function movePageDown(scroll) { LampaYaniNavigation.moveDown(scroll); }

    function homeSectionEnabled(key) {
        if (!Lampa.Storage || !Lampa.Storage.get) return true;
        var value = Lampa.Storage.get('yani_section_' + key, true);
        return value !== false && value !== 'false';
    }

    var episodeTitlesCache = {};

    function episodeTitlesForCard(card) {
        var malId = card && card.yani_remote_ids && (card.yani_remote_ids.myanimelist_id || card.yani_remote_ids.mal_id);
        if (!malId) return Promise.resolve(null);
        var key = String(malId);
        var entry = episodeTitlesCache[key];
        if (entry) return entry.promise;
        entry = episodeTitlesCache[key] = {titles: null, promise: null};
        entry.promise = LampaYaniApi.episodeInfo(malId).then(function (payload) {
            var items = payload && payload.episodes;
            var titles = {};
            if (Array.isArray(items)) {
                items.forEach(function (item) {
                    var number = window.LampaYaniEpisode.key(item.episodeNumber || item.episode || item.number);
                    if (number && item.title) titles[number] = item.title;
                });
            }
            entry.titles = titles;
            return titles;
        }).catch(function () {
            delete episodeTitlesCache[key];
            return null;
        });
        return entry.promise;
    }

    function applyEpisodeTitles(group, titles) {
        if (!group || !titles) return;
        group.episodeTitlesLoaded = true;
        (group.videos || []).forEach(function (video) {
            var number = window.LampaYaniEpisode.key(window.LampaYaniEpisode.valueOf(video));
            if (titles[number]) video.yani_episode_title = titles[number];
        });
    }

    function enrichEpisodeTitles(card, group) {
        var malId = card && card.yani_remote_ids && (card.yani_remote_ids.myanimelist_id || card.yani_remote_ids.mal_id);
        if (!malId) {
            if (group) group.episodeTitlesLoaded = true;
            return Promise.resolve();
        }
        var entry = episodeTitlesCache[String(malId)];
        if (group && entry && entry.titles) applyEpisodeTitles(group, entry.titles);
        else episodeTitlesForCard(card);
        return Promise.resolve();
    }

    function isAndroidPlatform() {
        return window.LampaYaniUiUtils && typeof LampaYaniUiUtils.isAndroidPlatform === 'function'
            ? LampaYaniUiUtils.isAndroidPlatform()
            : false;
    }

    function isAndroidTvPlatform() {
        return window.LampaYaniUiUtils && typeof LampaYaniUiUtils.isAndroidTvPlatform === 'function'
            ? LampaYaniUiUtils.isAndroidTvPlatform()
            : false;
    }

    function isWebOsPlatform() {
        return window.LampaYaniUiUtils && typeof LampaYaniUiUtils.isWebOsPlatform === 'function'
            ? LampaYaniUiUtils.isWebOsPlatform()
            : false;
    }

    var PLAYBACK_SOURCE_IDS = ['kodik', 'vk', 'alloha', 'cvh', 'sibnet', 'aksor'];
    var PLAYBACK_SOURCE_LABELS = {kodik: 'Kodik', vk: 'VK', alloha: 'Alloha', cvh: 'CVH', sibnet: 'Sibnet', aksor: 'Aksor'};
    var EXPERIMENTAL_PLAYBACK_SOURCE_IDS = ['alloha', 'cvh'];

    function playbackSourceDefaultEnabled(sourceId) {
        // CVH exposes direct MP4 streams but its JSON endpoints have no CORS
        // headers. The Android internal player uses a source-specific video
        // element while WebOS can play the stream directly; other platforms
        // keep the source opt-in.
        if (sourceId === 'cvh') return isAndroidPlatform() || isWebOsPlatform();
        return EXPERIMENTAL_PLAYBACK_SOURCE_IDS.indexOf(sourceId) < 0;
    }

    function playbackSourceLabel(sourceId) {
        return PLAYBACK_SOURCE_LABELS[sourceId] || String(sourceId || '');
    }

    function triggerSettingEnabled(value, storageKey, fallback) {
        if (value && typeof value === 'object') value = value.value;
        if (value === undefined && Lampa.Storage && Lampa.Storage.get) value = Lampa.Storage.get(storageKey, fallback);
        return value === true || value === 'true' || value === 1 || value === '1';
    }

    function migrateLegacyPlayerPreference() {
        if (!Lampa.Storage || Lampa.Storage.get('yani_player_pref_migrated', false)) return;
        var legacy = Lampa.Storage.get('yani_player_preference', 'last');
        if (legacy === 'lampa') {
            var target = Lampa.Storage.get('yani_playback_target', 'ask');
            if (target === 'ask' || !target) Lampa.Storage.set('yani_playback_target', 'internal');
            Lampa.Storage.set('yani_player_preference', 'last');
        }
        Lampa.Storage.set('yani_player_pref_migrated', true);
    }

    function playbackSourceId(group) {
        var key = String(group && (group.player || group.title || group.source) || '').toLowerCase();
        if (!key) return '';
        for (var i = 0; i < PLAYBACK_SOURCE_IDS.length; i++) {
            if (key.indexOf(PLAYBACK_SOURCE_IDS[i]) >= 0) return PLAYBACK_SOURCE_IDS[i];
        }
        return '';
    }

    function isPlaybackSourceEnabled(sourceId) {
        if (!sourceId) return true;
        var fallback = playbackSourceDefaultEnabled(sourceId);
        if (!Lampa.Storage || !Lampa.Storage.get) return fallback;
        var value = Lampa.Storage.get('yani_source_' + sourceId, fallback);
        return value !== false && value !== 'false' && value !== 0 && value !== '0';
    }

    // Android hands the stream to an installed player app; webOS hands it to
    // the system media player of the TV. Elsewhere there is nothing to hand to.
    function externalPlayerAvailable() {
        return isAndroidPlatform() || isWebOsPlatform();
    }

    function playbackTargetPreference() {
        migrateLegacyPlayerPreference();
        // External players exist only on Android and webOS, so playback is
        // always forced through the internal Lampa player on other platforms.
        if (!externalPlayerAvailable()) return 'internal';
        var value = Lampa.Storage && Lampa.Storage.get ? Lampa.Storage.get('yani_playback_target', 'ask') : 'ask';
        return value === 'internal' || value === 'external' ? value : 'ask';
    }

    var playbackWatcherApi = LampaYaniPlaybackWatcher.create({
        t: t,
        playbackReturnState: playbackReturnState,
        videoSourceUrl: function (video) { return videoSourceUrl(video); },
        beginPlaybackNavigation: function () { return beginPlaybackNavigation(); },
        restorePlaybackInteraction: function (snapshot, options) { return restorePlaybackInteraction(snapshot, options); },
        autoProgressSyncEnabled: function () { return autoProgressSyncEnabled(); },
        updatePlaybackProgress: function (context, position, duration, remote) {
            return updatePlaybackProgress(context, position, duration, remote);
        },
        launchVideo: function (card, group, videos, selected, options) {
            return launchVideo(card, group, videos, selected, options);
        },
        launchResolvedVideo: function (card, group, videos, selected, url, options) {
            return launchResolvedVideo(card, group, videos, selected, url, options);
        },
        videoResolverUrl: function (video) { return videoResolverUrl(video); },
        isDirectVideoUrl: function (url) { return isDirectVideoUrl(url); },
        isExternalPlayableUrl: function (url, source) { return isExternalPlayableUrl(url, source); },
        isCvhPlaybackSource: function (url, group) { return isCvhPlaybackSource(url, group); }
    });
    var autoNextEnabled = playbackWatcherApi.autoNextEnabled;
    var startPlaybackWatcher = playbackWatcherApi.startPlaybackWatcher;
    var stopPlaybackWatcher = playbackWatcherApi.stopPlaybackWatcher;
    var flushPlaybackProgress = playbackWatcherApi.flushPlaybackProgress;
    var destroySkipPrompt = playbackWatcherApi.destroySkipPrompt;

    var playbackLaunch = LampaYaniPlaybackLaunch.create({
        t: t,
        videoData: videoData,
        findStandardLampaCard: findStandardLampaCard,
        playbackReturnState: playbackReturnState,
        videoSourceUrl: videoSourceUrl,
        playbackReturnSnapshot: playbackReturnSnapshot,
        restorePlaybackInteraction: restorePlaybackInteraction,
        showPlaybackSelect: showPlaybackSelect,
        showDirectPlaybackOptions: showDirectPlaybackOptions,
        rememberPlayback: rememberPlayback,
        syncServerProgress: syncServerProgress,
        openExternalUri: openExternalUri,
        openAndroidAppUri: openAndroidAppUri,
        showExternalPlaybackOptions: showExternalPlaybackOptions,
        openExternalVideo: openExternalVideo,
        prepareExternalRestore: prepareExternalRestore,
        cancelExternalRestore: cancelExternalRestore,
        isAndroidPlatform: isAndroidPlatform,
        isWebOsPlatform: isWebOsPlatform,
        playbackWatcherApi: playbackWatcherApi,
        stopPlaybackWatcher: stopPlaybackWatcher,
        flushPlaybackProgress: flushPlaybackProgress,
        destroySkipPrompt: destroySkipPrompt,
        autoNextEnabled: autoNextEnabled,
        startPlaybackWatcher: startPlaybackWatcher,
        videoStreamHeaders: videoStreamHeaders,
        videoStreamQualities: videoStreamQualities,
        isExternalPlayableUrl: isExternalPlayableUrl,
        externalPlayablePlaylist: externalPlayablePlaylist,
        isAllohaUrl: isAllohaUrl,
        isVkPlaybackSource: isVkPlaybackSource,
        isSibnetPlaybackSource: isSibnetPlaybackSource,
        isCvhPlaybackSource: isCvhPlaybackSource
    });
    var launchVideo = playbackLaunch.launchVideo;
    var launchResolvedVideo = playbackLaunch.launchResolvedVideo;
    var allohaIframeEnabled = playbackLaunch.allohaIframeEnabled;
    var acknowledgeAllohaWebNotice = playbackLaunch.acknowledgeAllohaWebNotice;
    var videoResolverUrl = playbackLaunch.videoResolverUrl;
    var registerAndroidDirectVideoTube = playbackLaunch.registerAndroidDirectVideoTube;
    var openExternalPlayer = playbackLaunch.openExternalPlayer;
    var playInternalPlayer = playbackLaunch.playInternalPlayer;

    function externalPlayablePlaylist(playlist) {
        return (playlist || []).filter(function (item) { return isExternalPlayableUrl(item.url, item.source); });
    }

    function videoStreamHeaders(video) {
        if (!video) return null;
        var data = LampaYaniUiUtils.videoData(video);
        return video.yani_stream_headers || data.yani_stream_headers || null;
    }

    function videoStreamQualities(video) {
        if (!video) return null;
        var data = LampaYaniUiUtils.videoData(video);
        return video.yani_stream_qualities || data.yani_stream_qualities || null;
    }

    function isDirectVideoUrl(url) {
        return /\.(m3u8|mpd|mp4|webm)(?:[?#].*)?$/i.test(String(url || ''));
    }

    function isExternalPlayableUrl(url, source) {
        return isDirectVideoUrl(url) || !!(source && source.yani_stream_url && source.yani_stream_url === url);
    }

    function isKodikUrl(url) {
        return /(^|\/\/)(?:www\.)?kodik\.(?:info|cc|biz|site|com|tv)(?:[/:]|$)/i.test(url || '');
    }

    function isAllohaUrl(url) {
        return /(^|\/\/)(?:www\.)?alloha(?:\.[a-z0-9-]+)+(?::\d+)?(?:[/:]|$)/i.test(url || '');
    }

    function isVkPlaybackSource(url, group) {
        var data = group ? LampaYaniUiUtils.videoData(group) : {};
        var value = String(url || '') + ' ' + String(group && (group.player || group.title || group.source || group.yani_stream_source) || '') +
            ' ' + String(data.yani_stream_source || data.player || '');
        return /iframevk|vkvideo|vk\.com|video_ext\.php|(?:^|\s)vk(?:\s|$)/i.test(value);
    }

    function isSibnetPlaybackSource(url, group) {
        var data = group ? LampaYaniUiUtils.videoData(group) : {};
        var value = String(url || '') + ' ' + String(group && (group.player || group.title || group.source || group.yani_stream_source) || '') +
            ' ' + String(data.yani_stream_source || data.player || '');
        return /video\.sibnet\.ru|(?:^|\s)sibnet(?:\s|$)/i.test(value);
    }

    function isCvhPlaybackSource(url, group) {
        var data = group ? LampaYaniUiUtils.videoData(group) : {};
        var value = String(url || '') + ' ' + String(group && (group.player || group.title || group.source || group.yani_stream_source) || '') +
            ' ' + String(data.yani_stream_source || data.player || '');
        return /iframecvh|cdnvideohub|(?:^|\s)cvh(?:\s|$)/i.test(value);
    }


    function videoQualityLabel(video) {
        var data = LampaYaniUiUtils.videoData(video);
        var values = [video && video.yani_stream_quality, video && video.quality, video && video.resolution, data.quality, data.resolution, videoSourceUrl(video)];
        var best = 0;
        values.forEach(function (value) {
            var text = String(value || '');
            var match = text.match(/(2160|1440|1080|720|576|480|360)\s*p?/i);
            if (match) best = Math.max(best, Number(match[1]));
            if (/4k/i.test(text)) best = Math.max(best, 2160);
        });
        return best >= 2160 ? '4K' : best ? best + 'p' : '';
    }

    function getPreferredPlayer() {
        if (!Lampa.Storage) return '';
        return Lampa.Storage.get('yani_last_player', '') || '';
    }

    function episodeFlagsEnabled() {
        if (!Lampa.Storage || !Lampa.Storage.get) return true;
        var value = Lampa.Storage.get('yani_episode_flags', true);
        return value !== false && value !== 'false';
    }

    // Filler and recap marks need the MyAnimeList id; a card without it simply
    // shows none rather than costing an extra request for the title details.
    function episodeFlagsFor(card) {
        if (!episodeFlagsEnabled() || !LampaYaniApi.episodeFlags) return Promise.resolve({});
        var remote = card && card.yani_remote_ids || {};
        var malId = remote.mal || remote.mal_id || remote.myanimelist;
        if (!malId) return Promise.resolve({});
        return LampaYaniApi.episodeFlags(malId).catch(function () { return {}; });
    }

    function getPreferredVoice() {
        if (!Lampa.Storage) return '';
        return Lampa.Storage.get('yani_last_voice', '') || '';
    }

    function playerMatchesPreference(group, preference) {
        if (!preference) return false;
        var value = String(group && (group.player || group.title) || '').toLowerCase();
        return value.indexOf(String(preference).toLowerCase()) >= 0;
    }

    function rememberPlayer(group) {
        if (!Lampa.Storage) return;
        Lampa.Storage.set('yani_last_player', playerKey(group));
        var voice = window.LampaYaniUiUtils && window.LampaYaniUiUtils.voiceGroupPart
            ? window.LampaYaniUiUtils.voiceGroupPart(group && group.title)
            : String(group && group.title || '').trim().toLowerCase();
        if (voice) Lampa.Storage.set('yani_last_voice', voice);
    }

    function episodeOptionTitle(card, video) {
        var number = window.LampaYaniEpisode.valueOf(video) || '?';
        var parts = [t('episode') + ' ' + number];
        var quality = videoQualityLabel(video);
        if (quality) parts.push(quality);
        if (video.yani_episode_title) parts.push(video.yani_episode_title);
        if (Number(video.duration) > 0) parts.push(Math.max(1, Math.round(Number(video.duration) / 60)) + ' ' + t('minutes_short'));
        if (Number(video.views) > 0) parts.push(formatCompactNumber(video.views) + ' ' + t('views_short'));
        var playback = getPlayback(card && card.yani_id);
        return (playback && window.LampaYaniEpisode.same(playback.number, number) ? '▶ ' : '') + parts.join(' · ');
    }

    function formatCompactNumber(value) {
        value = Number(value) || 0;
        if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 0 : 1).replace('.0', '') + t('million_short');
        if (value >= 1000) return (value / 1000).toFixed(value >= 10000 ? 0 : 1).replace('.0', '') + t('thousand_short');
        return String(value);
    }

    function IframePlayer(object) {
        return LampaYaniPlayer.create(object, {
            t: t,
            // Only Android handles Back outside the web page; everywhere else a
            // focus inside the frame would swallow the way out. See ui-player.
            handOverFocus: isAndroidPlatform(),
            sourceUrl: function (item) { return videoSourceUrl(item) || item && item.iframe_url || ''; },
            goBack: function () {
                goBack();
                setTimeout(function () {
                    restorePlaybackInteraction(object && object.return_snapshot, {timeout: 2400, interval: 120});
                }, 80);
            }
        });
    }

    function openGenres() {
        Lampa.Activity.push({
            url: 'yani/genres',
            title: 'YummyAnime ' + t('genres'),
            component: 'yani_genres'
        });
    }

    function genreTitle(genre) {
        return typeof genre === 'string' ? genre : genre && (genre.title || genre.name || genre.label || genre.alias) || '';
    }

    function genreValue(genre) {
        if (typeof genre === 'string') return genre;
        if (!genre) return null;
        var value = genre.value;
        if (value === undefined || value === null || value === '') value = genre.id;
        if (value === undefined || value === null || value === '') value = genre.href;
        if (value === undefined || value === null || value === '') value = genre.alias;
        if (value === undefined || value === null || value === '') value = genre.slug;
        return value === undefined || value === null || value === '' ? null : value;
    }

    function genreDescription(genre) {
        if (!genre || typeof genre === 'string') return '';
        var value = genre.description || genre.desc || genre.about || genre.text || genre.content || genre.seo_description || '';
        if (value && typeof value === 'object') {
            var language = String(locale() || 'ru').slice(0, 2);
            value = value[language] || value.ru || value.en || value.uk || value.text || '';
        }
        value = String(value || '').replace(/<[^>]+>/g, ' ');
        if (value && typeof document !== 'undefined') {
            var decoder = document.createElement('textarea');
            decoder.innerHTML = value;
            value = decoder.value;
        }
        value = value.replace(/\s+/g, ' ').trim();
        if (!value && window.LampaYaniGenreDescriptions) value = LampaYaniGenreDescriptions.resolve(genre, locale());
        return value;
    }

    function detailGenres(card) {
        var raw = card && (card.yani_genres || card.genres || card.genre) || [];
        if (!Array.isArray(raw)) raw = raw && (raw.items || raw.data || raw.genres) || [];
        var seen = {};
        return raw.filter(function (genre) {
            var title = genreTitle(genre), value = genreValue(genre), key = String(value === null ? title : value);
            if (!title || value === null || seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    function openGenreCatalog(genre, value) {
        var context = typeof genre === 'object' && genre ? Object.assign({}, genre) : {title: genre, value: value};
        var title = genreTitle(context);
        var genreId = genreValue(context);
        if (!title || genreId === null) return;
        if (!beginTileNavigation('genre:' + String(genreId))) return;
        Lampa.Activity.push({
            url: 'yani/genre/' + encodeURIComponent(genreId),
            title: title,
            component: 'yani_catalog',
            genre_context: context,
            params: {limit: 30, genres: genreId}
        });
    }

    function pushSubjectCatalog(kind, subject) {
        var id = subject && subject.id;
        var title = String(subject && (subject.title || subject.name) || '').trim();
        if (!title || id === undefined || id === null) return;
        var context = Object.assign({}, subject, {kind: kind, title: title});
        if (!beginTileNavigation(kind + ':' + String(id))) return;
        var params = {limit: 30};
        params[kind === 'studio' ? 'studio_ids' : 'director_ids'] = id;
        Lampa.Activity.push({
            url: 'yani/' + kind + '/' + encodeURIComponent(id),
            title: title,
            component: 'yani_catalog',
            subject_context: context,
            params: params
        });
    }

    function openSubjectCatalog(kind, subject) {
        if (!subject) return;
        if (subject.id !== undefined && subject.id !== null) return pushSubjectCatalog(kind, subject);
        if (kind !== 'studio' || !subject.url) return;
        LampaYaniApi.studio(subject.url).then(function (payload) {
            var detailed = payload && payload.response ? payload.response : payload;
            pushSubjectCatalog(kind, Object.assign({}, subject, detailed || {}));
        }).catch(function (error) {
            console.error('[YummyAnime] Studio details failed', error);
            Lampa.Noty.show(t('catalog_load_error'));
        });
    }

    function openSearch() {
        getSearchController().open();
    }

    function openAccount() {
        Lampa.Activity.push({url: 'yani/account', title: 'YummyAnime ' + t('account'), component: 'yani_account'});
    }

    function openCollections() {
        Lampa.Activity.push({url: 'yani/collections', title: 'YummyAnime ' + t('collections'), component: 'yani_collections'});
    }

    function openCollection(collection) {
        if (!collection || collection.id === undefined || collection.id === null) return;
        if (!beginTileNavigation('collection:' + String(collection.id))) return;
        Lampa.Activity.push({
            url: 'yani/collection/' + encodeURIComponent(collection.id),
            title: collection.title || t('collection'),
            component: 'yani_collection',
            collectionId: collection.id
        });
    }

    function openEmbeddedTrailer(url, title) {
        url = LampaYaniUiUtils.normalizeVideoUrl(url);
        if (!url) return false;
        try {
            Lampa.Activity.push({
                url: 'yani/player',
                title: title || t('trailers'),
                component: 'yani_player',
                iframe_url: url
            });
            return true;
        } catch (error) {
            console.warn('[YummyAnime] Embedded trailer failed to open', error);
            return false;
        }
    }

    function copyParams(params) {
        var copy = {};
        Object.keys(params || {}).forEach(function (key) {
            copy[key] = params[key];
        });
        return copy;
    }

    function mapUniqueCards(items, seen) {
        if (!Array.isArray(items)) items = items ? [items] : [];
        return items.map(toCard).filter(function (card) {
            var key = card.yani_id || card.yani_url || card.title;
            if (seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    var settingsSection = LampaYaniSettings.create({
        t: t,
        playbackSourceIds: PLAYBACK_SOURCE_IDS,
        experimentalPlaybackSourceIds: EXPERIMENTAL_PLAYBACK_SOURCE_IDS,
        showUsagePolicy: function () { return showUsagePolicy(); },
        acknowledgeAllohaWebNotice: function () { return acknowledgeAllohaWebNotice(); },
        isAndroidTvPlatform: function () { return isAndroidTvPlatform(); },
        isWebOsPlatform: function () { return isWebOsPlatform(); },
        playbackSourceDefaultEnabled: function (sourceId) { return playbackSourceDefaultEnabled(sourceId); },
        playbackSourceLabel: function (sourceId) { return playbackSourceLabel(sourceId); },
        triggerSettingEnabled: function (value, storageKey, fallback) { return triggerSettingEnabled(value, storageKey, fallback); },
        migrateLegacyPlayerPreference: function () { return migrateLegacyPlayerPreference(); },
        externalPlayerAvailable: function () { return externalPlayerAvailable(); },
        showYummyInput: function (params, callback) { return showYummyInput(params, callback); }
    });
    var addSettings = settingsSection.addSettings;
    var localizedAuthText = settingsSection.localizedAuthText;
    var syncSettingsAuthStatus = settingsSection.syncSettingsAuthStatus;
    var openSettingsLogin = settingsSection.openSettingsLogin;
    var openAccountLogin = settingsSection.openAccountLogin;
    var logoutFromAccount = settingsSection.logoutFromAccount;

    var inputActive = false;
    function showYummyInput(params, callback) {
        if (!Lampa.Input) {
            Lampa.Noty.show(t('input_unavailable'));
            return;
        }
        // Prevent double-showing input on some devices
        if (inputActive) return;
        var controller = currentControllerName();
        if (controller === 'input' || controller === 'keyboard') return;

        inputActive = true;
        var navigation = transientNavigationSnapshot();
        var inputParams = Object.assign({}, params || {});
        var originalBack = inputParams.onBack;
        var complete = function (value) {
            inputActive = false;
            var result = callback(value);
            setTimeout(function () {
                var ctrl = currentControllerName();
                if (!ctrl || ctrl === 'input' || ctrl === 'settings_component') {
                    restoreTransientInteraction(navigation);
                }
            }, 0);
            return result;
        };
        inputParams.onBack = function () {
            inputActive = false;
            if (originalBack) originalBack();
            restoreTransientInteraction(navigation);
        };
        // Prefer Input.edit — documented standard API in recent Lampa versions.
        // Input.show exists on some builds but can render duplicate UI components.
        if (typeof Lampa.Input.edit === 'function') {
            return Lampa.Input.edit(inputParams, complete);
        }
        if (typeof Lampa.Input.show === 'function') {
            inputParams.onEnter = complete;
            return Lampa.Input.show(inputParams);
        }
        inputActive = false;
        Lampa.Noty.show(t('input_unavailable'));
    }

    function commentsMenu(id, skip, existing, navigation) {
        skip = Number(skip || 0);
        existing = existing || [];
        navigation = navigation || transientNavigationSnapshot();
        if (Lampa.Loading && Lampa.Loading.start) Lampa.Loading.start();
        LampaYaniApi.comments(id, skip).then(function (payload) {
            if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
            var page = LampaYaniApi.normalizeComments(payload);
            var comments = existing.concat(page);
            if (!comments.length) return Lampa.Noty.show(t('comments_empty'));
            renderCommentList(t('comments_title'), comments, page.length >= 20 ? function () {
                commentsMenu(id, skip + page.length, comments, navigation);
            } : null, null, navigation);
        }).catch(function (error) {
            if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
            console.error('[YummyAnime Comments]', error);
            Lampa.Noty.show(t('comments_error'));
        });
    }

    function commentReplies(comment, skip, existing, onBack, navigation) {
        skip = Number(skip || 0);
        existing = existing || [];
        navigation = navigation || transientNavigationSnapshot();
        if (Lampa.Loading && Lampa.Loading.start) Lampa.Loading.start();
        LampaYaniApi.commentChildren(comment.id, skip).then(function (payload) {
            if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
            var page = LampaYaniApi.normalizeComments(payload);
            var comments = existing.concat(page);
            if (!comments.length) return Lampa.Noty.show(t('comments_empty'));
            renderCommentList(t('replies_title'), comments, page.length >= 20 ? function () {
                commentReplies(comment, skip + page.length, comments, onBack, navigation);
            } : null, onBack, navigation);
        }).catch(function (error) {
            if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
            console.error('[YummyAnime Comment Replies]', error);
            Lampa.Noty.show(t('comments_error'));
        });
    }

    function renderCommentList(title, comments, onMore, onBack, navigation) {
        navigation = navigation || transientNavigationSnapshot();
        var items = comments.map(commentItem);
        if (onMore) items.push({title: t('load_more'), load_more: true});
        var params = {
            title: title,
            items: items,
            onSelect: function (item) {
                if (item.load_more) return onMore();
                if (item.comment && Number(item.comment.children_count) > 0) {
                    return commentReplies(item.comment, 0, [], function () {
                        // Lampa closes the current Select after onBack. Reopen
                        // the parent on the next turn so that it is not removed
                        // together with the child dialog.
                        setTimeout(function () {
                            renderCommentList(title, comments, onMore, onBack, navigation);
                        }, 0);
                    }, navigation);
                }
            }
        };
        if (onBack) params.onBack = onBack;
        showYummySelect(params, navigation);
    }

    function commentItem(comment) {
        var author = comment.name || (comment.author && comment.author.name) || t('user');
        var text = cleanCommentText(comment.text || comment.body || '');
        var date = Number(comment.time) > 0 ? new Date(Number(comment.time) * 1000).toLocaleDateString(locale()) : '';
        var stats = [];
        if (Number(comment.likes) > 0) stats.push('♥ ' + comment.likes);
        if (Number(comment.dislikes) > 0) stats.push('−' + comment.dislikes);
        if (Number(comment.children_count) > 0) stats.push('↳ ' + comment.children_count + ' ' + t('replies'));
        return {
            title: author + (date ? ' · ' + date : '') + ': ' + text,
            subtitle: stats.join(' · '),
            comment: comment
        };
    }

    function cleanCommentText(text) {
        return String(text || '').replace(/\[ник\]([^[]+)\[\/ник\]/gi, '@$1').replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim();
    }

}(window));
