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
        loadVideos: function (id, options) { return videoData.payload(id, options); }
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
        allohaIframeEnabled: function () { return allohaIframeEnabled(); },
        groupPlaybackPriority: function (group) { return groupPlaybackPriority(group); },
        videoPlaybackPriority: function (video, group) { return videoPlaybackPriority(video, group); },
        playerMatchesPreference: function (group, preference) { return playerMatchesPreference(group, preference); },
        rememberPlayer: function (group) { return rememberPlayer(group); },
        launchVideo: function (card, group, videos, selected, options) { return launchVideo(card, group, videos, selected, options); },
        enrichEpisodeTitles: function (card, group) { return enrichEpisodeTitles(card, group); },
        enrichVoiceOptionQuality: function (item, target) { return enrichVoiceOptionQuality(item, target); },
        episodeOptionTitle: function (card, video) { return episodeOptionTitle(card, video); },
        playbackTargetPreference: function () { return playbackTargetPreference(); },
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
        cardRenderElement: cardRenderElement,
        openVideos: function (card, resume) { return openVideos(card, resume); },
        addCardPlaybackProgress: addCardPlaybackProgress,
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
    var autoProgressSyncEnabled = playbackHistoryApi.autoProgressSyncEnabled;
    var syncServerProgress = playbackHistoryApi.syncServerProgress;
    var renderHistoryProgress = playbackHistoryApi.renderHistoryProgress;
    var refreshVisiblePlaybackProgress = playbackHistoryApi.refreshVisiblePlaybackProgress;
    var updatePlaybackProgress = playbackHistoryApi.updatePlaybackProgress;
    var syncPlaybackHistoryManually = playbackHistoryApi.syncPlaybackHistoryManually;
    var bindHistoryCardRender = playbackHistoryApi.bindHistoryCardRender;

    var externalRestoreState = {
        pending: false,
        installed: false,
        openedAt: 0,
        departed: false,
        controller: 'content',
        element: null,
        collection: null
    };
    var usagePolicyVisible = false;

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
        var originalBack = params.onBack;
        params.onBack = function () {
            // A nested Select may deliberately rebuild its parent list.
            // Only the root window should restore the underlying Activity.
            if (originalBack) return originalBack();
            restoreTransientInteraction(snapshot);
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
                    registerOnlineSource();
                    registerSearchSource();
                } catch (settingsError) {
                    console.error('[YummyAnime] Settings registration failed', settingsError);
                }
                var account = LampaYaniAuth.get();
                if (account.token && LampaYaniAuth.refreshIfNeeded) {
                    LampaYaniAuth.refreshIfNeeded();
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

    function Catalog(object) {
        var comp = new Lampa.InteractionCategory(object);
        var topMode = Boolean(object.topMode);
        var baseParams = copyParams(object.params || {limit: 30, sort: 'top', sort_forward: true});
        var limit = Number(baseParams.limit || 30);
        var maxPages = Math.ceil(20000 / limit) + 1;
        var seen = {};
        var requestedOffsets = {};
        var genreHeader;
        var genreDescriptionRequested = false;

        object.page = 1;
        baseParams.limit = limit;
        baseParams.offset = Number(baseParams.offset || 0);
        baseParams.sort = baseParams.sort || 'top';
        var hasSortDirection = Object.prototype.hasOwnProperty.call(baseParams, 'sort_forward');
        baseParams.sort_forward = hasSortDirection ?
            baseParams.sort_forward === true || baseParams.sort_forward === 'true' :
            baseParams.sort === 'top';

        function installGenreHeader() {
            var context = object.genre_context;
            if (!context || genreHeader) return;
            var view = comp.render && comp.render();
            if (!view || !view.length) return;
            var title = genreTitle(context);
            if (!title) return;
            var description = genreDescription(context) || t('genre_catalog_fallback').replace('{genre}', title);
            genreHeader = $('<div class="yani-genre-catalog-header"></div>');
            genreHeader.append('<span class="yani-genre-catalog-header__orb" aria-hidden="true"><i></i><i></i><i></i></span>');
            var copy = $('<div class="yani-genre-catalog-header__copy"></div>');
            copy.append($('<span class="yani-genre-catalog-header__eyebrow"></span>').text(t('genre_catalog')));
            copy.append($('<strong class="yani-genre-catalog-header__title"></strong>').text(title));
            copy.append($('<p class="yani-genre-catalog-header__description"></p>').text(description));
            genreHeader.append(copy);
            view.addClass('yani-genre-catalog-view').prepend(genreHeader);
            if (comp.scroll && comp.scroll.minus) comp.scroll.minus(genreHeader);
            loadGenreDescription(context);
        }

        function loadGenreDescription(context) {
            if (genreDescriptionRequested) return;
            var genreId = context && (context.id !== undefined ? context.id : context.value);
            if (!/^\d+$/.test(String(genreId || ''))) return;
            genreDescriptionRequested = true;
            LampaYaniApi.genre(genreId).then(function (payload) {
                var detailed = payload && payload.response ? payload.response : payload;
                var description = genreDescription(detailed);
                if (!description || !genreHeader || !genreHeader.length || !genreHeader.closest('body').length) return;
                genreHeader.find('.yani-genre-catalog-header__description').text(description);
            }).catch(function () {
                // The localized bundled description remains visible offline.
            });
        }

        function annotateGenreTop(items, offset) {
            if (!object.genre_context || baseParams.sort !== 'top' || !baseParams.sort_forward) return items;
            var title = genreTitle(object.genre_context);
            (items || []).forEach(function (item, index) {
                var position = Number(offset || 0) + index + 1;
                if (item && position <= 100) item.yani_genre_top = {position: position, genre: title};
            });
            return items;
        }
        var controls = LampaYaniCatalogControls.create({
            comp: comp,
            object: object,
            baseParams: baseParams,
            topMode: topMode,
            t: t,
            copyParams: copyParams,
            showSelect: showYummySelect,
            navigationSnapshot: transientNavigationSnapshot,
            filterModel: LampaYaniCatalogFilters
        });

        comp.create = function () {
            var self = this;
            this.activity.loader(true);
            LampaYaniApi.catalog(baseParams)
                .then(function (payload) {
                    var raw = annotateGenreTop(LampaYaniApi.normalize(payload), baseParams.offset);
                    var results = mapUniqueCards(raw, seen);
                    requestedOffsets[baseParams.offset] = true;
                    if (raw.length < limit) object.page = maxPages;
                    self.build({results: results, total_pages: maxPages, title: t(topMode ? 'top_rated' : 'anime')});
                    installGenreHeader();
                    controls.install();
                })
                .catch(function (error) {
                    console.error('[YummyAnime]', error);
                    self.activity.loader(false);
                    Lampa.Noty.show(t('catalog_load_error'));
                });
        };
        comp.nextPageReuest = function (requestObject, resolve, reject) {
            var params = copyParams(baseParams);
            params.offset = baseParams.offset + (requestObject.page - 1) * limit;
            if (requestedOffsets[params.offset]) {
                resolve({results: [], total_pages: maxPages, title: t(topMode ? 'top_rated' : 'anime')});
                return;
            }
            requestedOffsets[params.offset] = true;

            LampaYaniApi.catalog(params).then(function (payload) {
                var raw = annotateGenreTop(LampaYaniApi.normalize(payload), params.offset);
                var results = mapUniqueCards(raw, seen);
                if (raw.length < limit) requestObject.page = maxPages;
                resolve({results: results, total_pages: maxPages, title: t(topMode ? 'top_rated' : 'anime')});
            }).catch(function (error) {
                delete requestedOffsets[params.offset];
                requestObject.page = Math.max(1, requestObject.page - 1);
                console.error('[YummyAnime]', error);
                Lampa.Noty.show(t('next_page_error'));
                reject(error);
            });
        };
        // Lampa builds use both spellings across releases.
        comp.nextPageRequest = comp.nextPageReuest;
        comp.cardRender = bindYummyCardRender;
        var originalCatalogDestroy = comp.destroy;
        comp.destroy = function () {
            controls.destroy();
            if (originalCatalogDestroy) originalCatalogDestroy.apply(this, arguments);
        };
        return comp;
    }

    function Home(object) {
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
        var lastHomeSection = 'explore';
        var lastIntroContext = '';
        var lastIntroPoster = '';
        var lastStoredFocusKey = '';
        var homeFocusFrame = 0;
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
            {key: 'for_you', title: t('for_you'), group: 'discover', action: function () {
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
            var discoverPreview;
            var libraryStrip;
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
                    libraryStrip = $('<div class="yani-home__library-preview" aria-hidden="true"></div>');
                    root.append(libraryStrip);
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
                        discover = $('<div class="yani-home__panel yani-home__panel--discover yani-home__discover"><div class="yani-home__discover-head"><span class="yani-home__panel-chapter" aria-hidden="true">04</span><span class="yani-home__discover-title"></span><span class="yani-home__panel-line" aria-hidden="true"></span><span class="yani-home__chapter-state"><i></i><b></b></span><span class="yani-home__discover-mark" aria-hidden="true"><i></i><i></i><i></i></span></div><div class="yani-home__discover-preview"></div><div class="yani-home__discover-items"></div></div>');
                        discover.find('.yani-home__discover-title').text(t('discover'));
                        discoverPreview = discover.find('.yani-home__discover-preview');
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
                return scroll.render().add(sectionRail);
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

            function renderDiscoveryPreviews(discovery) {
                if (!discoverPreview || !discoverPreview.length) return;
                discoverPreview.empty();
                discovery = discovery || {};

                function appendPreview(options) {
                    if (!options || !options.id) return;
                    var node = $('<div class="yani-home__discover-preview-card yani-home__discover-preview-card--' + options.kind + ' selector" role="button" tabindex="-1"></div>');
                    var poster = String(options.poster || '');
                    if (!lowMemoryDevice && !lowCpuDevice && /^https?:\/\//i.test(poster)) {
                        node.append($('<span class="yani-home__discover-preview-art" aria-hidden="true"></span>').css('background-image', 'url("' + poster.replace(/["\\]/g, '') + '")'));
                    }
                    node.append(
                        $('<span class="yani-home__discover-preview-kicker"></span>').text(options.kicker),
                        $('<b></b>').text(options.title || t('untitled')),
                        $('<small></small>').text(options.meta || ''),
                        $('<i aria-hidden="true">›</i>')
                    );
                    node.data('yani-home-context-key', options.targetKey);
                    node.data('yani-home-group', 'discover');
                    node.data('yani-home-title', options.kicker);
                    node.data('yani-home-insight-title', options.title || '');
                    node.data('yani-home-insight-meta', options.meta || '');
                    node.data('yani-home-poster', poster);
                    node.on('hover:focus', function (event) {
                        activateHomeFocus(event.currentTarget || event.target, {
                            storageKey: options.targetKey,
                            panel: discover
                        });
                    });
                    node.on('hover:enter click.yaniHomeDiscoveryPreview', options.action);
                    discoverPreview.append(node);
                }

                var release = discovery.new_release;
                if (release && release.anime_id) {
                    appendPreview({
                        id: release.anime_id,
                        kind: 'release',
                        targetKey: 'new_releases',
                        kicker: t('new_releases'),
                        title: release.title,
                        meta: release.meta,
                        poster: release.poster,
                        action: function () {
                            openYummyDetail(toCard({anime_id: release.anime_id, title: release.title, poster: release.poster, year: release.year, type: release.type}), false);
                        }
                    });
                }
                var collection = discovery.collection;
                if (collection && collection.id !== '' && collection.id !== null && collection.id !== undefined) {
                    appendPreview({
                        id: collection.id,
                        kind: 'collection',
                        targetKey: 'collections',
                        kicker: t('collection'),
                        title: collection.title,
                        meta: collection.count ? collection.count + ' ' + t('anime_count') : '',
                        poster: collection.poster,
                        action: function () { openCollection({id: collection.id, title: collection.title}); }
                    });
                }
                discoverPreview.toggleClass('yani-home__discover-preview--visible', Boolean(discoverPreview.children().length));
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

            function renderLibraryStrip(entries) {
                if (!libraryStrip) return;
                if (last && $(last).hasClass('yani-home__library-mini')) last = homeButtons.continue_watching && homeButtons.continue_watching[0] || null;
                libraryStrip.empty().removeClass('yani-home__library-preview--visible').attr('aria-hidden', 'true');
                if (!entries || !entries.length) return;
                entries.forEach(function (entry) {
                    if (!entry.anime_id) return;
                    var mini = $('<div class="yani-home__library-mini selector" role="button"></div>');
                    var art = $('<span class="yani-home__library-mini-art"></span>');
                    var poster = String(entry.poster || '').replace(/["\\]/g, '');
                    var meta = [];
                    if (entry.episode) meta.push(t('episode') + ' ' + entry.episode);
                    if (entry.progress) meta.push(entry.progress + '%');
                    mini.attr('data-yani-anime-id', String(entry.anime_id));
                    mini.attr('aria-label', [t('continue_watching'), entry.title, meta.join(' · ')].filter(Boolean).join(': '));
                    mini.data('yani-home-context-key', 'continue_watching');
                    mini.data('yani-home-title', t('continue_watching'));
                    mini.data('yani-home-group', 'library');
                    mini.data('yani-home-insight-title', entry.title || 'YummyAnime');
                    mini.data('yani-home-insight-meta', meta.join(' · '));
                    mini.data('yani-home-poster', poster);
                    if (!reducedMotion && !lowMemoryDevice && !lowCpuDevice && /^https?:\/\//i.test(poster)) art.css('background-image', 'url("' + poster + '")');
                    mini.append(art, $('<span class="yani-home__library-mini-shade"></span>'));
                    if (entry.episode) mini.append($('<span class="yani-home__library-mini-episode"></span>').text(t('episode') + ' ' + entry.episode));
                    mini.append($('<span class="yani-home__library-mini-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>'));
                    mini.append($('<span class="yani-home__library-mini-title"></span>').text(entry.title || 'YummyAnime'));
                    mini.append($('<span class="yani-home__library-mini-progress"><i></i></span>'));
                    mini.find('.yani-home__library-mini-progress i').css('width', String(entry.progress || 0) + '%');
                    mini.on('hover:focus', function (event) {
                        activateHomeFocus(event.currentTarget || event.target, {storageKey: 'continue_watching'});
                    });
                    mini.on('hover:enter click.yaniHomeResume', function () {
                        var source = Object.assign({}, entry.card || {}, {
                            anime_id: entry.anime_id,
                            title: entry.title || entry.card && entry.card.title || t('untitled'),
                            poster: entry.poster || entry.card && entry.card.poster || ''
                        });
                        var card = toCard(source);
                        card.yani_resume = {
                            number: String(entry.episode || ''),
                            video_id: entry.video_id || '',
                            time: Number(entry.time || 0),
                            duration: Number(entry.duration || 0),
                            player: entry.player || '',
                            voice: entry.voice || '',
                            updated_at: Number(entry.updated_at || 0)
                        };
                        openVideos(card, true);
                    });
                    libraryStrip.append(mini);
                });
                if (libraryStrip.children().length) libraryStrip.addClass('yani-home__library-preview--visible').attr('aria-hidden', 'false');
            }

            renderLibraryStrip(LampaYaniHomeInsights.libraryPreview(continuing, 3));

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

            function applyPlaybackSnapshot(remoteEntries, excludedAnimeIds) {
                if (destroyed) return;
                if (remoteEntries && remoteEntries.length) importRemoteEntries(remoteEntries);
                localHistory = playbackHistory();
                var merged = LampaYaniHomeSections.mergeHistory(localHistory, remoteEntries || []);
                continuing = LampaYaniHomeSections.continueWatchingEntries(merged, excludedAnimeIds || {});
                renderLibraryStrip(LampaYaniHomeInsights.libraryPreview(continuing, 3));
                renderPersonal(personalStats);
            }

            var playbackUserKey = account && (account.user_id || account.login) || '';
            var playbackCache = readHomePlaybackSnapshot(playbackUserKey);
            if (playbackCache.available) applyPlaybackSnapshot(playbackCache.entries, playbackCache.excluded);
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
                Promise.all([
                    LampaYaniApi.watchHistory(30, 0, control).then(LampaYaniHomeSections.normalizeRemoteHistory).catch(function (error) {
                        if (!homeRequestCancelled(error)) console.warn('[YummyAnime Home] Server playback history is unavailable', error);
                        return null;
                    }),
                    loadContinueWatchingExclusions(control).catch(function (error) {
                        if (!homeRequestCancelled(error)) console.warn('[YummyAnime Home] Playback exclusions are unavailable', error);
                        return playbackCache.excluded || {};
                    })
                ]).then(function (result) {
                    if (destroyed) return;
                    if (result[0] !== null) {
                        cacheHomePlaybackSnapshot(playbackUserKey, result[0], result[1]);
                        applyPlaybackSnapshot(result[0], result[1]);
                    }
                    finishLibraryRefresh(result[0] === null);
                });
            }, 140 * homeDelayScale);

            if (listNeedsRefresh) scheduleHomeTask(function () {
                LampaYaniApi.userListStats(account.user_id, homeRequestControl()).then(function (stats) {
                    if (destroyed) return;
                    var normalized = LampaYaniHomeInsights.listCounts(stats);
                    var hasCounts = Object.keys(normalized).some(function (key) { return Number(normalized[key] || 0) > 0; });
                    cacheHomeListCounts(account.user_id, hasCounts ? normalized : readHomeListCounts(account.user_id));
                    personalStats = stats;
                    renderPersonal(personalStats);
                    finishLibraryRefresh(false);
                }).catch(function (error) {
                    if (!homeRequestCancelled(error)) console.warn('[YummyAnime Home] Personal list insights are unavailable', error);
                    finishLibraryRefresh(true);
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
                    renderNotifications(count);
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
                    renderDiscoveryPreviews(discovery);
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
                LampaYaniHomeInsights.dashboard({
                    feed: function () { return LampaYaniApi.feed(homeRequestControl()); },
                    schedule: function () { return LampaYaniApi.schedule(homeRequestControl()); },
                    now: Date.now()
                }).then(function (dashboard) {
                    if (destroyed) return;
                    var service = dashboard.service || {};
                    var merged = LampaYaniHomeInsights.mergeDashboardSnapshot(dashboardCache.dashboard, dashboard);
                    var state = service.api ? service.degraded ? 'partial' : 'live' : dashboardCache.available ? 'offline' : 'offline';
                    var updatedAt = service.api ? Date.now() : dashboardCache.updated_at;
                    renderDashboardSnapshot(merged, state, updatedAt);
                    if (service.feed && service.schedule) cacheHomeDashboardSnapshot(dashboard);
                }).catch(function (error) {
                    if (homeRequestCancelled(error)) return;
                    if (dashboardCache.available) setIntroDataState('offline', dashboardCache.updated_at);
                    setChapterState('episode_flow', dashboardCache.available ? 'cached' : 'offline');
                    setChapterState('discover', dashboardCache.available ? 'cached' : 'offline');
                    setChapterState('service', 'offline');
                    console.warn('[YummyAnime Home] Dashboard insights are unavailable', error);
                });
            }
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    var collection = homeCollection();
                    Lampa.Controller.collectionSet(collection);
                    var target = last && document.documentElement.contains(last) ? last : false;
                    if (!target) {
                        var savedKey = Lampa.Storage && Lampa.Storage.get ? String(Lampa.Storage.get(homeFocusStorageKey, '') || '') : '';
                        var availableKeys = [];
                        var availableNodes = {};
                        collection.find('.selector[data-yani-home-key]').each(function () {
                            var key = String($(this).attr('data-yani-home-key') || '');
                            if (!key) return;
                            availableKeys.push(key);
                            availableNodes[key] = this;
                        });
                        var focusKey = LampaYaniHomeInsights.dashboardInitialFocus(savedKey, preferredHomeKey, availableKeys);
                        target = availableNodes[focusKey] || false;
                    }
                    if (!target) target = collection.find('.selector')[0] || false;
                    Lampa.Controller.collectionFocus(target, collection);
                    if (target) {
                        renderIntroContext($(target));
                        scroll.update($(target), true);
                    }
                },
                left: function () { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                right: function () { Navigator.move('right'); },
                up: function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                down: function () { movePageDown(scroll); },
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
            if (homeAbortController) homeAbortController.abort();
            homeButtons = {};
            currentEpisodeFlow = null;
            preferredHomeKey = 'catalog';
            renderIntroContext = function () {};
            updateEpisodeCountdown = function () {};
            homeCollection = function () { return scroll.render(); };
            scroll.destroy();
            html.remove();
        };
    }

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
            recommendations: LampaYaniApi.recommendations,
            catalog: LampaYaniApi.catalog,
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
        return LampaYaniCollections.hub(object, {
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

    function Genres(object) {
        return LampaYaniCardRails.create(object, {
            id: 'genres:' + String(object && object.url || 'yani/genres'),
            viewClass: 'yani-genres-hub',
            t: t,
            decorate: function (element, card) {
                cardRenderers.decorate(element, card);
                LampaYaniMedia.attachPosterFallback(element, card);
            },
            openCard: function (card) { openYummyDetail(card, false); },
            onError: function () { Lampa.Noty.show(t('genres_load_error')); },
            pageSize: 8,
            header: function (component, api) {
                return loadGenreList().then(function (genres) {
                    if (api && api.prepend) api.prepend(renderGenreTiles(genres));
                });
            },
            loadPage: createGenreRowLoader()
        });
    }

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
            fetchExcluded: loadContinueWatchingExclusions,
            importRemote: importRemoteEntries,
            historyCardRender: bindHistoryCardRender
        });
    }

    function loadContinueWatchingExclusions(control) {
        control = control || {};
        if (!LampaYaniAuth.token()) return Promise.resolve({});
        var account = LampaYaniAuth.get();

        function withUserId() {
            var storedId = Number(account && account.user_id || 0);
            if (storedId) return Promise.resolve(storedId);
            return LampaYaniApi.profile(control).then(function (payload) {
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

        function cacheKey(userId) { return 'yani_continue_excluded_' + userId; }
        function readCache(userId) {
            try {
                var cached = Lampa.Storage.get(cacheKey(userId), '{}');
                if (typeof cached === 'string') cached = JSON.parse(cached || '{}');
                return {
                    ids: cached && cached.ids || {},
                    fresh: Boolean(cached && cached.updated_at && Date.now() - Number(cached.updated_at) < 300000)
                };
            } catch (error) { return {ids: {}, fresh: false}; }
        }

        return withUserId().then(function (userId) {
            var cached = readCache(userId);
            if (cached.fresh) return cached.ids;
            return LampaYaniApi.userLists(userId, control).then(normalizeUserList).then(function (items) {
                var excluded = {};
                [2, 3].forEach(function (listId) {
                    filterAccountListItems({id: listId}, items).forEach(function (item) {
                        var animeId = item && (item.anime_id || item.id || item.yani_id);
                        if (animeId) excluded[String(animeId)] = true;
                    });
                });
                try {
                    Lampa.Storage.set(cacheKey(userId), JSON.stringify({updated_at: Date.now(), ids: excluded}));
                } catch (error) {
                    console.warn('[YummyAnime Continue Watching] Could not cache exclusions', error);
                }
                return excluded;
            }).catch(function (error) {
                if (Object.keys(cached.ids).length) return cached.ids;
                throw error;
            });
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
                addAccountNotice(t('not_logged_in'), t('login_hint'));
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

        function addAccountNotice(title, description) {
            var notice = $('<div class="yani-account__notice selector"></div>');
            notice.append($('<div class="yani-account__notice-title"></div>').text(title));
            notice.append($('<div class="yani-account__notice-text"></div>').text(description));
            bindAccountFocus(notice);
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

    function AuthPage(object) {
        return LampaYaniAuthPage.create(object, {
            t: t,
            input: showYummyInput,
            goBack: goBack,
            onAuthorized: function () { pullRemoteProgress(100).catch(function () {}); }
        });
    }

    function openNotifications() {
        Lampa.Activity.push({url: 'yani/notifications', title: t('notifications_title'), component: 'yani_notifications'});
    }

    function openUserLists() {
        if (!LampaYaniAuth.token()) return Lampa.Noty.show(t('login_required'));
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
    var homePlaybackCacheKey = 'yani_home_playback_snapshot';
    var homePlaybackCacheLifetime = 300000;

    function readHomePlaybackSnapshot(userKey) {
        if (!userKey || !Lampa.Storage || !Lampa.Storage.get) return {available: false, fresh: false, entries: [], excluded: {}};
        try {
            var cached = Lampa.Storage.get(homePlaybackCacheKey, '{}');
            if (typeof cached === 'string') cached = JSON.parse(cached || '{}');
            if (String(cached && cached.user_key || '') !== String(userKey) || !Array.isArray(cached.entries)) {
                return {available: false, fresh: false, entries: [], excluded: {}};
            }
            return {
                available: true,
                fresh: Boolean(cached.updated_at && Date.now() - Number(cached.updated_at) < homePlaybackCacheLifetime),
                entries: cached.entries,
                excluded: cached.excluded && typeof cached.excluded === 'object' ? cached.excluded : {}
            };
        } catch (error) { return {available: false, fresh: false, entries: [], excluded: {}}; }
    }

    function cacheHomePlaybackSnapshot(userKey, entries, excluded) {
        if (!userKey || !Lampa.Storage || !Lampa.Storage.set) return;
        Lampa.Storage.set(homePlaybackCacheKey, JSON.stringify({
            user_key: String(userKey),
            updated_at: Date.now(),
            entries: Array.isArray(entries) ? entries.slice(0, 100) : [],
            excluded: excluded || {}
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
                LampaYaniApi.watchHistory(100, 0).catch(function () { return []; })
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
                poster: entry.poster || entry.card && entry.card.poster,
                updated_at: entry.updated_at || 0
            }));
            card.yani_list_progress = entry.duration > 0 ? Math.max(0, Math.min(1, Number(entry.time || 0) / Number(entry.duration))) : 0;
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

        var missing = cards.filter(function (card) { return card.yani_id && !card.poster; }).slice(0, 10);
        function next(offset) {
            if (offset >= missing.length) return Promise.resolve(cards);
            return Promise.all(missing.slice(offset, offset + 2).map(function (card) {
                return LampaYaniApi.detail(card.yani_id).then(function (payload) {
                    var value = payload && payload.response ? payload.response : payload;
                    var detailed = toCard(value || {});
                    if (detailed.poster) card.poster = card.img = detailed.poster;
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
        if (!LampaYaniAuth.token()) return Lampa.Noty.show(t('login_required'));
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
            loadVideos: function (id, options) { return videoData.list(id, options); },
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
            (group.source ? ' · ' + group.source : '') + ' · ' + group.videos.length + ' ' + t('episodes_short');
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
                    var number = Number(item.episodeNumber || item.episode || item.number);
                    if (number > 0 && item.title) titles[number] = item.title;
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
            var number = Number(video.number || video.index);
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

    // Stream sources that already carry a direct Alloha stream and must not be
    // routed through the Alloha policy a second time.
    var ALLOHA_RESOLVED_SOURCES = ['lampac-alloha', 'yani-resolver'];

    function launchVideo(card, group, videos, selected, options) {
        options = options || {};
        var url = videoSourceUrl(selected);
        if (!url) {
            Lampa.Noty.show(t('no_videos'));
            restorePlaybackInteraction();
            return;
        }
        var allohaSource = isAllohaUrl(url) || /alloha/i.test(String(group && (group.player || group.title) || ''));
        var resolvedAlloha = ALLOHA_RESOLVED_SOURCES.indexOf(String(selected.yani_stream_source || '').toLowerCase()) >= 0;
        if (allohaSource && !resolvedAlloha) {
            return launchAllohaPlayer(card, group, selected, url);
        }
        if (!isExternalPlayableUrl(url, selected) && window.LampaYaniStreamResolver && LampaYaniStreamResolver.canResolve(url)) {
            setLoading(true);
            LampaYaniStreamResolver.resolve(url, selected).then(function (result) {
                setLoading(false);
                if (result && result.url) {
                    selected.yani_stream_url = result.url;
                    selected.yani_stream_quality = result.quality || '';
                    selected.yani_stream_qualities = result.qualities || null;
                    selected.yani_stream_source = result.source || '';
                    selected.yani_stream_headers = result.headers || null;
                }
                launchResolvedVideo(card, group, videos, selected, videoSourceUrl(selected) || url, options);
            }).catch(function (error) {
                setLoading(false);
                console.warn('[YummyAnime] Stream resolve failed', error);
                launchResolvedVideo(card, group, videos, selected, url, options);
            });
            return;
        }
        launchResolvedVideo(card, group, videos, selected, url, options);
    }

    function launchResolvedVideo(card, group, videos, selected, url, options) {
        options = options || {};
        var title = (card.title || 'YummyAnime') + ' · ' + t('episode') + ' ' + (selected.number || selected.index || '?') + ' · ' + group.title;
        playbackContext = {card: card, group: group, videos: videos, selected: selected};
        rememberPlayback(card, group, selected);
        syncServerProgress(selected);

        var playlist = buildExternalPlaylist(card, videos);
        var current = playlist.filter(function (item) { return item.source === selected; })[0] || {
            title: title,
            url: url,
            time: Number(selected.watched && selected.watched.end_time || 0),
            source: selected,
            headers: videoStreamHeaders(selected),
            quality: videoStreamQualities(selected),
            poster: card.poster || card.img || ''
        };
        if (!isExternalPlayableUrl(current.url, current.source)) {
            // The user already chose "watch in player". Asking again with the
            // same YummyTV dialog left a stale Select onBack that then reported
            // the player as unavailable.
            if (openEmbeddedEpisode(card, group, selected, current.url)) return;
            showExternalPlaybackOptions(card, {
                url: current.url,
                title: current.title,
                onPlayer: function () {
                    if (openEmbeddedEpisode(card, group, selected, current.url)) return true;
                    if (openAndroidAppUri(current.url)) return true;
                    return openExternalUri(current.url);
                }
            });
            return;
        }

        if (showDirectPlaybackOptions(card, current, playlist, options)) {
            return;
        }

        if (openExternalPlayer(current, playlist, card)) {
            return;
        }

        if (playInternalPlayer(current, playlist)) {
            return;
        }

        Lampa.Noty.show(url);
        restorePlaybackInteraction();
    }

    // Both services answer the same question - "give me a direct stream for this
    // Alloha page" - so they are tried in order and the first usable answer
    // wins. The self-hosted resolver goes first because it drives the real
    // player page and therefore matches the exact episode and dubbing, while
    // Lampac has to find the title again by its external ids.
    function allohaResolvers(card, group, selected, url) {
        var chain = [];
        if (window.LampaYaniResolver && LampaYaniResolver.enabled()) {
            chain.push(function () { return LampaYaniResolver.resolve(url); });
        }
        if (window.LampaYaniLampacResolver && LampaYaniLampacResolver.enabled()) {
            chain.push(function () { return LampaYaniLampacResolver.resolveAlloha(card, selected, group, url); });
        }
        return chain;
    }

    function resolveInOrder(chain, index) {
        index = index || 0;
        if (index >= chain.length) return Promise.reject(new Error('No Alloha resolver produced a stream'));
        return chain[index]().then(function (result) {
            if (result && result.url) return result;
            throw new Error('Empty resolver result');
        }).catch(function (error) {
            if (index + 1 >= chain.length) throw error;
            console.warn('[YummyAnime] Alloha resolver failed, trying the next one', error);
            return resolveInOrder(chain, index + 1);
        });
    }

    function launchAllohaPlayer(card, group, selected, url) {
        var chain = allohaResolvers(card, group, selected, url);
        if (!chain.length) return blockAllohaPlayback(card, group, selected, url);
        setLoading(true);
        resolveInOrder(chain).then(function (result) {
            setLoading(false);
            selected.yani_stream_url = result.url;
            selected.yani_stream_quality = result.quality || '';
            selected.yani_stream_qualities = result.qualities || null;
            selected.yani_stream_headers = result.headers || null;
            selected.yani_stream_source = result.source || 'lampac-alloha';
            launchResolvedVideo(card, group, group.videos || [selected], selected, result.url);
        }).catch(function (error) {
            setLoading(false);
            console.warn('[YummyAnime] Alloha resolve failed; playback blocked', error);
            blockAllohaPlayback(card, group, selected, url);
        });
        return true;
    }

    // Alloha streams only from inside its own signed player page: the page
    // refuses to run outside an iframe and its CDN requires rotating headers a
    // media player cannot supply. Without a direct stream the embedded page is
    // therefore the last remaining playback path, and it stays opt-in because
    // it has no Lampa timeline and cannot be handed to an external player.
    function allohaIframeEnabled() {
        if (!Lampa.Storage || !Lampa.Storage.get) return false;
        var value = Lampa.Storage.get('yani_alloha_iframe', false);
        return value === true || value === 'true';
    }

    function blockAllohaPlayback(card, group, selected, url) {
        if (url && allohaIframeEnabled() && openAllohaEmbed(card, group, selected, url)) return true;
        Lampa.Noty.show(t('alloha_direct_required'));
        restorePlaybackInteraction();
        return true;
    }

    function openEmbeddedEpisode(card, group, selected, url) {
        if (!url || !Lampa.Activity || !Lampa.Activity.push) return false;
        try {
            rememberPlayback(card, group, selected);
            // Activity owns the back stack for the embedded page and will
            // restart the detail controller itself.
            clearPlaybackReturn();
            Lampa.Activity.push({
                url: 'yani/player',
                title: (card && card.title || 'YummyAnime') + ' · ' + t('episode') + ' ' + ((selected && (selected.number || selected.index)) || '?'),
                component: 'yani_player',
                iframe_url: url
            });
            return true;
        } catch (error) {
            console.warn('[YummyAnime] Embedded player failed to open', error);
            return false;
        }
    }

    function openAllohaEmbed(card, group, selected, url) {
        return openEmbeddedEpisode(card, group, selected, url);
    }

    function setLoading(enabled) {
        if (!window.Lampa || !Lampa.Loading) return;
        try {
            if (enabled && Lampa.Loading.start) Lampa.Loading.start();
            if (!enabled && Lampa.Loading.stop) Lampa.Loading.stop();
        } catch (ignore) {}
    }

    function buildExternalPlaylist(card, videos) {
        return (videos || []).map(function (video) {
            var url = videoSourceUrl(video);
            if (!url) return null;
            return {
                title: (card.title || 'YummyAnime') + ' · ' + t('episode') + ' ' + (video.number || video.index || '?'),
                url: url,
                time: Number(video.watched && video.watched.end_time || 0),
                source: video,
                headers: videoStreamHeaders(video),
                quality: videoStreamQualities(video),
                poster: card.poster || card.img || ''
            };
        }).filter(Boolean);
    }

    function playInternalDirectVideo(current, playlist) {
        if (!Lampa.Player || !Lampa.Player.play || !Lampa.Player.runas) return false;
        var directPlaylist = (playlist || []).filter(function (item) { return isDirectVideoUrl(item.url); }).map(function (item) {
            return LampaYaniUiUtils.internalPlayerItem({
                title: item.title,
                url: item.url,
                time: item.time,
                quality: item.quality || videoStreamQualities(item.source),
                headers: item.headers || videoStreamHeaders(item.source),
                poster: item.poster || ''
            });
        }).filter(Boolean);
        var directCurrent = directPlaylist.filter(function (item) { return item.url === current.url; })[0] || LampaYaniUiUtils.internalPlayerItem({
            title: current.title,
            url: current.url,
            time: current.time,
            quality: current.quality || videoStreamQualities(current.source),
            headers: current.headers || videoStreamHeaders(current.source),
            poster: current.poster || ''
        });
        if (!directCurrent) return false;
        if (!directPlaylist.length) directPlaylist = [directCurrent];
        try {
            // Lampa.Player.play follows the globally configured player unless
            // the caller explicitly selects the built-in Lampa engine.
            Lampa.Player.runas('lampa');
            Lampa.Player.play(directCurrent);
            if (Lampa.Player.playlist) Lampa.Player.playlist(directPlaylist);
            if (Lampa.Player.callback) {
                Lampa.Player.callback(function () {
                    flushPlaybackProgress(true);
                    restorePlaybackInteraction();
                });
            }
            return true;
        } catch (error) {
            console.warn('[YummyAnime] Internal Lampa player failed to start', error);
            return false;
        }
    }

    function playbackTargetPreference() {
        if (Lampa.Storage && Lampa.Storage.get && Lampa.Storage.get('yani_player_preference', 'last') === 'lampa') return 'internal';
        var value = Lampa.Storage && Lampa.Storage.get ? Lampa.Storage.get('yani_playback_target', 'ask') : 'ask';
        return value === 'internal' || value === 'external' ? value : 'ask';
    }

    function openExternalPlayer(current, playlist, card) {
        return openExternalVideo(current.url, current.title, {
            playlist: externalPlayablePlaylist(playlist),
            time: current.time,
            poster: card.poster || card.img || '',
            requireDirect: true,
            source: current.source,
            headers: current.headers || videoStreamHeaders(current.source),
            quality: current.quality || videoStreamQualities(current.source)
        });
    }

    function playInternalPlayer(current, playlist) {
        var started = isDirectVideoUrl(current && current.url) && playInternalDirectVideo(current, playlist);
        if (started) startPlaybackWatcher(playbackContext);
        return started;
    }

    // Set right before playback is dispatched so the watcher knows which title
    // and episode started, whichever of the three entry points ran.
    var playbackContext = null;
    var playbackWatcher = null;
    var playbackWatcherGeneration = 0;
    var PLAYER_STARTUP_GRACE_MS = 120000;
    var NEXT_PREFETCH_LEAD = 90;
    var NEXT_ADVANCE_LEAD = 5;

    function skipPreference() {
        var value = Lampa.Storage && Lampa.Storage.get ? Lampa.Storage.get('yani_aniskip', 'off') : 'off';
        return value === 'op' || value === 'ed' || value === 'op_ed' || value === 'suggest' ? value : 'off';
    }

    function skipTypesForMode(mode) {
        return {
            op: mode === 'op' || mode === 'op_ed' || mode === 'suggest',
            ed: mode === 'ed' || mode === 'op_ed' || mode === 'suggest'
        };
    }

    function autoNextEnabled() {
        if (!Lampa.Storage || !Lampa.Storage.get) return false;
        var value = Lampa.Storage.get('yani_auto_next', false);
        return value === true || value === 'true';
    }

    // Lampa's internal player is an HTML5 video element whichever skin is
    // active, and reading it directly avoids depending on player internals that
    // differ between Lampa builds. External players are out of reach by design.
    function playerVideoElement() {
        var selectors = ['.player-video video', '.player video', 'video'];
        for (var i = 0; i < selectors.length; i++) {
            var element = document.querySelector(selectors[i]);
            if (element && isFinite(element.duration) && element.duration > 0) return element;
        }
        return null;
    }

    function stopPlaybackWatcher() {
        if (!playbackWatcher) return;
        clearInterval(playbackWatcher.timer);
        playbackWatcher = null;
        destroySkipPrompt();
    }

    function startPlaybackWatcher(context) {
        stopPlaybackWatcher();
        var generation = ++playbackWatcherGeneration;
        if (!context) return;
        var skipMode = skipPreference();
        var autoNext = autoNextEnabled();
        var progressSync = autoProgressSyncEnabled();

        var state = {
            context: context,
            timer: 0,
            segments: [],
            skipped: {},
            skipMode: skipMode,
            skipPrompt: skipMode === 'suggest',
            skipReady: false,
            skipLoading: false,
            skipLength: 0,
            autoNext: autoNext,
            progressSync: progressSync,
            lastLocalSync: 0,
            lastLocalPosition: Number(context.selected && context.selected.watched && context.selected.watched.end_time || 0),
            lastObservedPosition: Number(context.selected && context.selected.watched && context.selected.watched.end_time || 0),
            lastObservedDuration: Number(context.selected && context.selected.duration || 0),
            lastServerSync: Date.now(),
            lastServerPosition: Number(context.selected && context.selected.watched && context.selected.watched.end_time || 0),
            prefetched: false,
            advanced: false,
            lastSeenAt: Date.now()
        };
        playbackWatcher = state;
        state.timer = setInterval(function () { watchPlayback(generation, context, state); }, 1000);
        var initialLength = Number(context.selected && context.selected.duration || 0);
        if (skipMode !== 'off' && initialLength >= 60) loadSkipSegments(generation, context, state, skipMode, initialLength);
    }

    function flushPlaybackProgress(remote) {
        var state = playbackWatcher;
        var context = state && state.context || playbackContext;
        if (!context || !context.selected) {
            stopPlaybackWatcher();
            return;
        }
        var element = playerVideoElement();
        var position = element ? Number(element.currentTime || 0) : Number(state && state.lastObservedPosition || context.selected.watched && context.selected.watched.end_time || 0);
        var duration = element ? Number(element.duration || 0) : Number(state && state.lastObservedDuration || context.selected.duration || 0);
        if (position > 0) updatePlaybackProgress(context, position, duration, Boolean(remote));
        stopPlaybackWatcher();
    }

    function loadSkipSegments(generation, context, state, mode, episodeLength) {
        if (!window.LampaYaniAniSkip) return;
        var ids = (context.card && context.card.yani_remote_ids) || {};
        var malId = Number(ids.myanimelist_id || ids.mal_id || 0);
        var selected = context.selected || {};
        var episode = Number(selected.number || selected.index || 0);
        if (!malId || !episode) return;
        var length = Math.max(0, Math.round(Number(episodeLength) || 0));
        state.skipLoading = true;
        state.skipReady = false;
        state.skipLength = length;
        state.skipRequest = (state.skipRequest || 0) + 1;
        var request = state.skipRequest;
        LampaYaniAniSkip.times(malId, episode, length).then(function (intervals) {
            if (generation !== playbackWatcherGeneration || request !== state.skipRequest) return;
            var types = skipTypesForMode(mode);
            var segments = [];
            if (types.op && intervals.op) segments.push({type: 'op', interval: intervals.op, label: t('aniskip_opening_skipped')});
            if (types.ed && intervals.ed) segments.push({type: 'ed', interval: intervals.ed, label: t('aniskip_ending_skipped')});
            state.segments = segments;
            state.skipLoading = false;
            state.skipReady = true;
        });
    }

    var skipPromptState = {root: null, panel: null, segment: null, video: null};

    function skipPromptLabel(segment) {
        if (segment && segment.type === 'ed') return t('aniskip_skip_ending');
        if (segment && segment.type === 'op') return t('aniskip_skip_opening');
        return t('aniskip_skip');
    }

    function skipPromptHost() {
        return document.querySelector('.player') || document.querySelector('.player-video') || document.body;
    }

    function bindSkipAction(element) {
        if (!element || element._yani_skip_bound) return element;
        element._yani_skip_bound = true;
        element.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            confirmSkipPrompt();
        });
        if (window.$) $(element).on('hover:enter', function () { confirmSkipPrompt(); });
        return element;
    }

    function ensureSkipPrompt() {
        if (skipPromptState.root && document.body.contains(skipPromptState.root)) return skipPromptState.root;
        var button = document.createElement('div');
        button.className = 'yani-skip-prompt selector';
        skipPromptState.root = bindSkipAction(button);
        return skipPromptState.root;
    }

    function syncSkipPanelButton(segment) {
        var right = document.querySelector('.player-panel__right') ||
            document.querySelector('.player-panel .player-panel__buttons') ||
            document.querySelector('.player-panel');
        if (!right) return;
        var button = skipPromptState.panel;
        if (!button || !document.body.contains(button)) {
            button = document.createElement('div');
            button.className = 'player-panel__button selector yani-skip-panel';
            skipPromptState.panel = bindSkipAction(button);
        }
        if (skipPromptState.panel.parentNode !== right) right.appendChild(skipPromptState.panel);
        skipPromptState.panel.textContent = skipPromptLabel(segment);
        skipPromptState.panel.style.display = '';
    }

    function hideSkipPanelButton() {
        if (skipPromptState.panel) skipPromptState.panel.style.display = 'none';
    }

    function showSkipPrompt(segment, video) {
        var button = ensureSkipPrompt();
        var host = skipPromptHost();
        if (button.parentNode !== host) host.appendChild(button);
        button.textContent = skipPromptLabel(segment);
        button.classList.add('yani-skip-prompt--visible');
        skipPromptState.segment = segment;
        skipPromptState.video = video;
        syncSkipPanelButton(segment);
    }

    function hideSkipPrompt() {
        if (skipPromptState.root) skipPromptState.root.classList.remove('yani-skip-prompt--visible');
        skipPromptState.segment = null;
        skipPromptState.video = null;
        hideSkipPanelButton();
    }

    function destroySkipPrompt() {
        hideSkipPrompt();
        if (skipPromptState.root && skipPromptState.root.parentNode) skipPromptState.root.parentNode.removeChild(skipPromptState.root);
        skipPromptState.root = null;
        if (skipPromptState.panel && skipPromptState.panel.parentNode) skipPromptState.panel.parentNode.removeChild(skipPromptState.panel);
        skipPromptState.panel = null;
    }

    function applySkip(video, segment, state) {
        if (!video || !segment || !state || state.skipped[segment.type]) return;
        state.skipped[segment.type] = true;
        try {
            video.currentTime = segment.interval.end;
        } catch (error) {
            console.warn('[YummyAnime] Could not skip a segment', error);
            state.skipped[segment.type] = false;
            return;
        }
        Lampa.Noty.show(segment.label);
        hideSkipPrompt();
    }

    function confirmSkipPrompt() {
        var state = playbackWatcher;
        var segment = skipPromptState.segment;
        var video = skipPromptState.video || playerVideoElement();
        if (!state || !segment || !video) return;
        applySkip(video, segment, state);
    }

    function watchPlayback(generation, context, state) {
        if (generation !== playbackWatcherGeneration) return stopPlaybackWatcher();
        var video = playerVideoElement();
        if (!video) {
            // The player may still be starting up, so give it a grace period
            // before the watcher gives up on this episode.
            if (Date.now() - state.lastSeenAt > PLAYER_STARTUP_GRACE_MS) stopPlaybackWatcher();
            return;
        }
        state.lastSeenAt = Date.now();
        var position = Number(video.currentTime) || 0;
        var duration = Number(video.duration) || 0;
        state.lastObservedPosition = position;
        state.lastObservedDuration = duration;

        if (state.skipMode !== 'off' && duration >= 60) {
            var rounded = Math.round(duration);
            if (!state.skipLoading && (!state.skipReady || Math.abs((state.skipLength || 0) - rounded) > 15)) {
                state.segments = [];
                hideSkipPrompt();
                loadSkipSegments(generation, context, state, state.skipMode, rounded);
            }
        }

        if (position > 0) {
            var now = Date.now();
            var finalState = video.paused || video.ended || duration > 0 && position >= duration - 2;
            if (now - state.lastLocalSync >= 10000 || finalState && Math.abs(position - state.lastLocalPosition) >= 2) {
                state.lastLocalSync = now;
                state.lastLocalPosition = position;
                updatePlaybackProgress(context, position, duration, false);
            }
            if (state.progressSync && (now - state.lastServerSync >= 60000 || finalState && Math.abs(position - state.lastServerPosition) >= 5)) {
                state.lastServerSync = now;
                state.lastServerPosition = position;
                updatePlaybackProgress(context, position, duration, true);
            }
        }

        var activePrompt = null;
        state.segments.forEach(function (segment) {
            if (state.skipped[segment.type]) return;
            var inside = position >= segment.interval.start && position < segment.interval.end - 1;
            if (state.skipPrompt) {
                if (inside) activePrompt = segment;
                return;
            }
            if (!inside) return;
            applySkip(video, segment, state);
        });
        if (state.skipPrompt) {
            if (activePrompt) showSkipPrompt(activePrompt, video);
            else hideSkipPrompt();
        }

        if (!state.autoNext || duration < 60 || position <= 0) return;
        var remaining = duration - position;
        if (!state.prefetched && remaining <= NEXT_PREFETCH_LEAD) {
            state.prefetched = true;
            prefetchNextEpisode(context);
        }
        if (!state.advanced && remaining <= NEXT_ADVANCE_LEAD && !video.paused) {
            state.advanced = true;
            stopPlaybackWatcher();
            advanceToNextEpisode(context);
        }
    }

    function nextEpisodeVideo(context) {
        var videos = (context && context.videos) || [];
        var index = videos.indexOf(context.selected);
        if (index < 0 || index + 1 >= videos.length) return null;
        return videos[index + 1];
    }

    // Resolving a stream costs a round trip through the source's player page,
    // which is long enough to be noticeable between episodes. Doing it while
    // the current episode still plays hides that entirely, and the resolver
    // caches the result for the launch that follows.
    function prefetchNextEpisode(context) {
        var next = nextEpisodeVideo(context);
        if (!next || next.yani_stream_url) return;
        var url = videoSourceUrl(next);
        if (!url || isExternalPlayableUrl(url, next)) return;
        if (!window.LampaYaniStreamResolver || !LampaYaniStreamResolver.canResolve(url)) return;
        LampaYaniStreamResolver.resolve(url, next).then(function (result) {
            if (!result || !result.url) return;
            next.yani_stream_url = result.url;
            next.yani_stream_quality = result.quality || '';
            next.yani_stream_qualities = result.qualities || null;
            next.yani_stream_source = result.source || '';
            next.yani_stream_headers = result.headers || null;
        }).catch(function (error) {
            // The episode is launched normally later; a failed prefetch only
            // costs the time it would have saved.
            console.warn('[YummyAnime] Next episode prefetch failed', error);
        });
    }

    function advanceToNextEpisode(context) {
        var next = nextEpisodeVideo(context);
        if (!next) return;
        Lampa.Noty.show(t('auto_next_starting') + ' ' + (next.number || next.index || ''));
        launchVideo(context.card, context.group, context.videos, next, {autoAdvance: true});
    }

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
        var preference = Lampa.Storage.get('yani_player_preference', 'last');
        if (preference === 'ask') return '';
        if (preference === 'last') return Lampa.Storage.get('yani_last_player', '');
        return preference;
    }

    function playerMatchesPreference(group, preference) {
        if (!preference) return false;
        if (String(preference).toLowerCase() === 'lampa') return groupPlaybackPriority(group) > 0;
        var value = String(group && (group.player || group.title) || '').toLowerCase();
        return value.indexOf(String(preference).toLowerCase()) >= 0;
    }

    function rememberPlayer(group) {
        if (Lampa.Storage) Lampa.Storage.set('yani_last_player', playerKey(group));
    }

    function episodeOptionTitle(card, video) {
        var number = String(video.number || video.index || '?');
        var parts = [t('episode') + ' ' + number];
        var quality = videoQualityLabel(video);
        if (quality) parts.push(quality);
        if (video.yani_episode_title) parts.push(video.yani_episode_title);
        if (Number(video.duration) > 0) parts.push(Math.max(1, Math.round(Number(video.duration) / 60)) + ' ' + t('minutes_short'));
        if (Number(video.views) > 0) parts.push(formatCompactNumber(video.views) + ' ' + t('views_short'));
        var playback = getPlayback(card && card.yani_id);
        return (playback && playback.number === number ? '▶ ' : '') + parts.join(' · ');
    }

    function formatCompactNumber(value) {
        value = Number(value) || 0;
        if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 0 : 1).replace('.0', '') + t('million_short');
        if (value >= 1000) return (value / 1000).toFixed(value >= 10000 ? 0 : 1).replace('.0', '') + t('thousand_short');
        return String(value);
    }

    function IframePlayer(object) {
        return LampaYaniPlayer.create(object, {
            sourceUrl: function (item) { return videoSourceUrl(item) || item && item.iframe_url || ''; },
            goBack: goBack
        });
    }

    function openGenres() {
        Lampa.Activity.push({
            url: 'yani/genres',
            title: 'YummyAnime ' + t('genres'),
            component: 'yani_genres'
        });
    }

    var genreHubRows = null;
    var genreHubRowsAt = 0;
    var genreHubRequest = null;
    var genreList = null;
    var genreListAt = 0;
    var genreListRequest = null;
    var GENRE_HUB_TTL = 15 * 60 * 1000;
    var GENRE_HUB_CONCURRENCY = 8;

    function loadGenreList() {
        if (genreList && Date.now() - genreListAt < GENRE_HUB_TTL) return Promise.resolve(genreList);
        if (genreListRequest) return genreListRequest;
        genreListRequest = LampaYaniApi.genres().then(function (payload) {
            var genres = LampaYaniApi.normalizeGenres(payload).filter(function (genre) {
                return genreTitle(genre) && genreValue(genre) !== null;
            });
            if (!genres.length) Lampa.Noty.show(t('genres_empty'));
            genreList = genres;
            genreListAt = Date.now();
            genreListRequest = null;
            return genres;
        }).catch(function (error) {
            genreListRequest = null;
            throw error;
        });
        return genreListRequest;
    }

    function renderGenreTiles(genres) {
        var wrap = $('<div class="yani-genre-tiles"></div>');
        wrap.append($('<div class="yani-genre-tiles__title"></div>').text(t('genre_tiles')));
        var grid = $('<div class="yani-genre-tiles__grid"></div>');
        (genres || []).forEach(function (genre) {
            var title = genreTitle(genre);
            var tile = $('<div class="yani-genre-tile selector"></div>');
            tile.append($('<span class="yani-genre-tile__mark" aria-hidden="true"></span>').text(title.charAt(0)));
            tile.append($('<span class="yani-genre-tile__name"></span>').text(title));
            tile.on('hover:enter click.yaniGenreTile', function (event) {
                if (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
                openGenreCatalog(genre);
            });
            grid.append(tile);
        });
        wrap.append(grid);
        return wrap;
    }

    function createGenreRowLoader() {
        function loadGenreRows(page) {
            if (Number(page || 0) > 0) return Promise.resolve([]);
            if (genreHubRows && Date.now() - genreHubRowsAt < GENRE_HUB_TTL) return Promise.resolve(genreHubRows);
            if (genreHubRequest) return genreHubRequest;
            genreHubRequest = loadGenreList().then(function (genres) {
                return LampaYaniCardRails.mapLimit(genres, GENRE_HUB_CONCURRENCY, function (genre) {
                    var id = genreValue(genre);
                    return LampaYaniApi.catalog({limit: 10, genres: id, sort: 'top', sort_forward: true}, {
                        cacheTtl: GENRE_HUB_TTL,
                        staleFallback: true
                    }).then(function (payload) {
                        var items = LampaYaniApi.normalize(payload).slice(0, 10);
                        if (!items.length) return null;
                        return {
                            title: genreTitle(genre),
                            results: items.map(toCard),
                            onMore: function () { openGenreCatalog(genre); },
                            visual: {
                                from: '#ff6878',
                                to: '#825ed8',
                                icon: '<path d="M4 6h16M4 12h16M4 18h16"/>'
                            }
                        };
                    }).catch(function () { return null; });
                });
            }).then(function (rows) {
                genreHubRows = (rows || []).filter(Boolean);
                genreHubRowsAt = Date.now();
                genreHubRequest = null;
                return genreHubRows;
            }).catch(function (error) {
                genreHubRequest = null;
                throw error;
            });
            return genreHubRequest;
        }

        return loadGenreRows;
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
        Lampa.Activity.push({
            url: 'yani/genre/' + encodeURIComponent(genreId),
            title: title,
            component: 'yani_catalog',
            genre_context: context,
            params: {limit: 30, genres: genreId}
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

    function openExternalVideo(url, title, options) {
        options = options || {};
        url = options.youtubeIntent ? externalTrailerUrl(url) : LampaYaniUiUtils.normalizeVideoUrl(url);
        if (options.requireDirect && !isExternalPlayableUrl(url, options.source)) return false;
        var intentUrl = options.youtubeIntent ? youtubeIntentUrl(url) : '';
        var externalUrl = intentUrl || url;
        var playlist = Array.isArray(options.playlist) ? options.playlist.map(function (item) {
            return {
                title: cleanPlaybackTitle(item.title),
                url: item.url,
                time: Number(item.time || 0),
                headers: item.headers || null,
                quality: item.quality || null
            };
        }).filter(function (item) { return item.url; }) : [];
        var payload = {
            title: cleanPlaybackTitle(title || 'YummyAnime'),
            url: url,
            poster: options.poster || '',
            time: Number(options.time || 0),
            playlist: playlist,
            headers: options.headers || null,
            quality: options.quality || null
        };
        if (!options.youtubeIntent) {
            if (tryExternalOpen('Lampa.Android.openPlayer', function () {
                if (!Lampa.Android || !Lampa.Android.openPlayer) return false;
                prepareExternalRestore();
                Lampa.Android.openPlayer(url, payload);
                return true;
            })) return true;
            if (tryExternalOpen('Android.openPlayer', function () {
                if (!window.Android || typeof Android.openPlayer !== 'function') return false;
                prepareExternalRestore();
                Android.openPlayer(url, JSON.stringify(payload));
                return true;
            })) return true;
            if (tryExternalOpen('AndroidJS.openPlayer', function () {
                if (!window.AndroidJS || typeof AndroidJS.openPlayer !== 'function') return false;
                prepareExternalRestore();
                AndroidJS.openPlayer(url, JSON.stringify(payload));
                return true;
            })) return true;
        }
        if (options.youtubeIntent) {
            if (openAndroidAppUri(externalUrl)) return true;
            if (url !== externalUrl && openAndroidAppUri(url)) return true;
        }
        return openExternalUri(externalUrl);
    }

    function openExternalUri(externalUrl) {
        if (!externalUrl) return false;
        if (tryExternalOpen('Lampa.External.open', function () {
            if (!Lampa.External || !Lampa.External.open) return false;
            prepareExternalRestore();
            Lampa.External.open(externalUrl);
            return true;
        })) return true;
        if (tryExternalOpen('Lampa.Utils.open', function () {
            if (!Lampa.Utils || !Lampa.Utils.open) return false;
            prepareExternalRestore();
            Lampa.Utils.open(externalUrl);
            return true;
        })) return true;
        if (tryExternalOpen('navigator.app.loadUrl', function () {
            if (!window.navigator || !navigator.app || !navigator.app.loadUrl) return false;
            prepareExternalRestore();
            navigator.app.loadUrl(externalUrl, {openExternal: true});
            return true;
        })) return true;
        if (tryExternalOpen('window.open', function () {
            if (!window.open) return false;
            prepareExternalRestore();
            window.open(externalUrl, '_system');
            return true;
        })) return true;
        cancelExternalRestore();
        return false;
    }

    function yummyTvEnabled() {
        if (!Lampa.Storage || !Lampa.Storage.get) return false;
        var value = Lampa.Storage.get('yani_yummytv_enabled', false);
        return value === true || value === 'true' || value === 1 || value === '1';
    }

    function yummyTvAnimeId(card) {
        return card && (card.yani_id || card.anime_id || card.yummy_id);
    }

    function openYummyTv(card) {
        if (!yummyTvEnabled()) return false;
        var url = LampaYaniUiUtils.yummyTvDetailsUrl(yummyTvAnimeId(card));
        if (!url) {
            Lampa.Noty.show(t('yummytv_id_missing'));
            return false;
        }
        if (openAndroidAppUri(url)) return true;
        Lampa.Noty.show(t('yummytv_open_failed'));
        return false;
    }

    function openAndroidAppUri(url) {
        if (!url) return false;
        if (tryExternalOpen('Lampa.Android.openBrowser', function () {
            if (!Lampa.Android || typeof Lampa.Android.openBrowser !== 'function') return false;
            prepareExternalRestore();
            Lampa.Android.openBrowser(url);
            return true;
        })) return true;
        if (tryExternalOpen('AndroidJS.openBrowser', function () {
            if (!window.AndroidJS || typeof AndroidJS.openBrowser !== 'function') return false;
            prepareExternalRestore();
            AndroidJS.openBrowser(url);
            return true;
        })) return true;
        if (tryExternalOpen('Android.openBrowser', function () {
            if (!window.Android || typeof Android.openBrowser !== 'function') return false;
            prepareExternalRestore();
            Android.openBrowser(url);
            return true;
        })) return true;
        cancelExternalRestore();
        return false;
    }

    function prepareExternalRestore() {
        installExternalRestoreHooks();
        if (!playbackReturnState.active) beginPlaybackNavigation();
        var origin = playbackReturnSnapshot();
        externalRestoreState.pending = true;
        externalRestoreState.openedAt = Date.now();
        externalRestoreState.departed = false;
        externalRestoreState.controller = origin.controller;
        externalRestoreState.element = origin.element;
        externalRestoreState.collection = origin.collection;
        // Some Android launchers show their chooser without emitting blur or
        // Cordova pause. A delayed check prevents the underlying detail page
        // from remaining attached to a stale Select controller in that case.
        setTimeout(restoreExternalFocus, 1500);
    }

    function cancelExternalRestore() {
        externalRestoreState.pending = false;
        externalRestoreState.departed = false;
        externalRestoreState.openedAt = 0;
        externalRestoreState.element = null;
        externalRestoreState.collection = null;
    }

    function installExternalRestoreHooks() {
        if (externalRestoreState.installed) return;
        externalRestoreState.installed = true;
        window.addEventListener('blur', markExternalDeparture, false);
        window.addEventListener('focus', restoreExternalFocus, false);
        window.addEventListener('pageshow', restoreExternalFocus, false);
        document.addEventListener('pause', markExternalDeparture, false);
        document.addEventListener('resume', function () {
            externalRestoreState.departed = true;
            restoreExternalFocus();
        }, false);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) markExternalDeparture();
            else restoreExternalFocus();
        }, false);
    }

    function markExternalDeparture() {
        if (externalRestoreState.pending) externalRestoreState.departed = true;
    }

    function currentControllerName() {
        try {
            var enabled = Lampa.Controller && Lampa.Controller.enabled ? Lampa.Controller.enabled() : null;
            return enabled && enabled.name || '';
        } catch (ignore) {
            return '';
        }
    }

    function restoreExternalFocus() {
        if (!externalRestoreState.pending) return;
        if (playbackReturnState.active) {
            cancelExternalRestore();
            return;
        }
        var elapsed = Date.now() - externalRestoreState.openedAt;
        // Android may emit focus while the chooser is only starting. Ignore
        // that event until the app departed or enough time has passed.
        if (!externalRestoreState.departed && elapsed < 1200) {
            setTimeout(restoreExternalFocus, 1200 - elapsed);
            return;
        }
        var delay = Math.max(0, 250 - elapsed);
        setTimeout(function () {
            if (!externalRestoreState.pending) return;
            externalRestoreState.pending = false;
            restorePlaybackInteraction({
                controller: externalRestoreState.controller || 'content',
                element: externalRestoreState.element,
                collection: externalRestoreState.collection
            });
        }, delay);
    }

    function showExternalPlaybackOptions(card, options) {
        options = options || {};
        var items = [];
        var yummyTvUrl = yummyTvEnabled() ? LampaYaniUiUtils.yummyTvDetailsUrl(yummyTvAnimeId(card)) : '';
        if (options.url || options.onPlayer) {
            items.push({title: t('watch_in_player'), subtitle: t('watch_in_player_description'), action: 'player'});
        }
        if (yummyTvUrl) items.push({title: t('watch_in_yummytv'), subtitle: t('watch_in_yummytv_description'), action: 'yummytv'});
        if (!items.length || !Lampa.Select || !Lampa.Select.show) {
            if (options.onPlayer && options.onPlayer()) return true;
            if (yummyTvUrl && openYummyTv(card)) return true;
            Lampa.Noty.show(t('external_stream_unavailable'));
            restorePlaybackInteraction();
            return false;
        }
        showPlaybackSelect({
            title: t('choose_playback'),
            items: items,
            onSelect: function (item) {
                if (item && item.action === 'player') {
                    if (options.onPlayer && options.onPlayer()) return;
                    if (options.url && openExternalUri(options.url)) return;
                    Lampa.Noty.show(t('external_stream_unavailable'));
                    restorePlaybackInteraction();
                    return;
                }
                if (item && item.action === 'yummytv' && !openYummyTv(card)) restorePlaybackInteraction();
            }
        });
        return true;
    }

    function tryExternalOpen(name, callback) {
        try {
            return !!callback();
        } catch (error) {
            console.warn('[YummyAnime] Could not open trailer through ' + name, error);
            return false;
        }
    }

    function cleanPlaybackTitle(value) {
        return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    function externalTrailerUrl(url) {
        var id = youtubeVideoId(url);
        return id ? 'https://www.youtube.com/watch?v=' + encodeURIComponent(id) : url;
    }

    function youtubeVideoId(url) {
        url = String(url || '');
        try {
            var parsed = new URL(url);
            var host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '');
            if (host === 'youtu.be') return parsed.pathname.replace(/^\/+/, '').split('/')[0] || '';
            if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
                if (parsed.searchParams.get('v')) return parsed.searchParams.get('v');
                var match = parsed.pathname.match(/\/(?:embed|shorts|v)\/([^/?#]+)/i);
                if (match) return match[1];
            }
        } catch (error) {
            var fallback = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*[&?])?v=|embed\/|shorts\/|v\/))([^&#?/]+)/i);
            return fallback ? fallback[1] : '';
        }
        return '';
    }

    function youtubeIntentUrl(url) {
        var id = youtubeVideoId(url);
        if (!id || !Lampa.Platform || !Lampa.Platform.is || !Lampa.Platform.is('android')) return '';
        var watch = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
        return 'intent://www.youtube.com/watch?v=' + encodeURIComponent(id) + '#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=' + encodeURIComponent(watch) + ';end';
    }

    function copyParams(params) {
        var copy = {};
        Object.keys(params || {}).forEach(function (key) {
            copy[key] = params[key];
        });
        return copy;
    }

    function mapUniqueCards(items, seen) {
        return items.map(toCard).filter(function (card) {
            var key = card.yani_id || card.yani_url || card.title;
            if (seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    function addSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        Lampa.SettingsApi.addComponent({
            component: 'yani',
            icon: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M18.45 0H1.55A1.55 1.55 0 000 1.55v16.9A1.54 1.54 0 001.55 20h16.9A1.55 1.55 0 0020 18.45V1.55A1.54 1.54 0 0018.45 0Zm-2.83 5.93-2.1 2.66-2.3-5.43a6.95 6.95 0 014.4 2.77Zm-2.9 6.57h-4l2.03-4.8 1.98 4.8Zm-2.37-9.34L7.8 9.06 4.87 5.33c.64-.7 1.4-1.26 2.27-1.65a8.18 8.18 0 013.2-.52ZM3.57 7.39l3.2 4.06-1.56 3.58A6.96 6.96 0 013.57 7.39Zm6.57 9.56c-1.05.01-2.1-.2-3.05-.65l.76-1.8h5.7l.49 1.15a6.93 6.93 0 01-3.9 1.3Zm6.8-7.07a7.8 7.8 0 01-1.17 4L14.55 11l2.17-2.77c.14.54.21 1.1.23 1.65Z"/></svg>',
            name: 'YummyAnime'
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_about', type: 'button'},
            field: {
                name: t('version_name'),
                description: t('version_label') + ' ' + LampaYaniConfig.version + ' · ' + t('extension') + ' · ' + t('website_description') + ': ' + yummyWebsiteUrl()
            },
            onChange: openYummyWebsite
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_usage_policy', type: 'button'},
            field: {name: t('usage_policy_title'), description: t('usage_policy_settings_description')},
            onChange: showUsagePolicy
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_language', type: 'select', values: {ru: 'Русский', uk: 'Українська', en: 'English'}, default: 'ru'},
            field: {name: t('language_name'), description: t('language_description')},
            onChange: function (value) {
                if (value && typeof value === 'object') value = value.value;
                LampaYaniI18n.setLanguage(value);
                Lampa.Noty.show(t('language_changed'));
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {
                name: 'yani_player_preference',
                type: 'select',
                values: {last: t('player_last'), ask: t('player_ask'), lampa: t('watch_internal_lampa'), kodik: 'Kodik', alloha: 'Alloha', cvh: 'CVH', sibnet: 'Sibnet', aksor: 'Aksor'},
                default: 'last'
            },
            field: {name: t('player_preference'), description: t('player_preference_description')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {
                name: 'yani_playback_target',
                type: 'select',
                values: {ask: t('playback_target_ask'), external: t('playback_target_external'), internal: t('playback_target_internal')},
                default: 'ask'
            },
            field: {name: t('playback_target'), description: t('playback_target_description')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {
                name: 'yani_aniskip',
                type: 'select',
                values: {off: t('aniskip_off'), op: t('aniskip_openings'), ed: t('aniskip_endings'), op_ed: t('aniskip_openings_endings'), suggest: t('aniskip_suggest')},
                default: 'off'
            },
            field: {name: t('aniskip'), description: t('aniskip_description')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_auto_next', type: 'trigger', default: false},
            field: {name: t('auto_next'), description: t('auto_next_description')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_playback_services_title', type: 'title'},
            field: {name: t('playback_services')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_yummytv_enabled', type: 'trigger', default: false},
            field: {name: t('yummytv_integration'), description: t('yummytv_integration_description')}
        });

        var resolverUrl = window.LampaYaniResolver ? LampaYaniResolver.baseUrl() : '';
        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_resolver_server', type: 'button'},
            field: {
                name: t('resolver_server'),
                description: t('resolver_server_description') + ': ' + (resolverUrl || t('not_configured'))
            },
            onChange: editResolverServer
        });

        if (resolverUrl) {
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_resolver_check', type: 'button'},
                field: {name: t('resolver_check'), description: t('resolver_check_description')},
                onChange: function () {
                    LampaYaniResolver.health().then(function (payload) {
                        Lampa.Noty.show(t('resolver_ok') + (payload && payload.version ? ' · v' + payload.version : ''));
                    }).catch(function (error) {
                        console.error('[YummyAnime]', error);
                        Lampa.Noty.show(t('resolver_error'));
                    });
                }
            });
        }

        var lampacUrl = window.LampaYaniLampacResolver ? LampaYaniLampacResolver.baseUrl() : '';
        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_lampac_server', type: 'button'},
            field: {
                name: t('lampac_server'),
                description: t('lampac_server_description') + ': ' + (lampacUrl || t('not_configured'))
            },
            onChange: editLampacServer
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_alloha_iframe', type: 'trigger', default: false},
            field: {name: t('alloha_iframe'), description: t('alloha_iframe_description')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_clear_playback_history', type: 'button'},
            field: {name: t('clear_history'), description: t('clear_history_description')},
            onChange: function () {
                if (Lampa.Storage) Lampa.Storage.set('yani_playback_history', '{}');
                Lampa.Noty.show(t('history_cleared'));
            }
        });

        var authorized = Boolean(LampaYaniAuth.token());
        if (authorized) {
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_account_state', type: 'button'},
                field: {name: t('authorized') + ': ' + authDisplayName(), description: t('auth_manage_description')},
                onChange: openSettingsLogin
            });
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_auto_sync_progress', type: 'trigger', default: true},
                field: {name: t('auto_sync_progress'), description: t('auto_sync_progress_description')}
            });
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_account_refresh', type: 'button'},
                field: {name: t('refresh_name'), description: t('refresh_description')},
                onChange: function () {
                    LampaYaniAuth.refresh().then(function () {
                        Lampa.Noty.show(t('token_refreshed'));
                    }).catch(function (error) {
                        console.error('[YummyAnime]', error);
                        Lampa.Noty.show(t('token_refresh_error'));
                    });
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_account_logout', type: 'button'},
                field: {name: t('logout_name'), description: t('logout_description')},
                onChange: function () {
                    LampaYaniAuth.logout().then(function () {
                        Lampa.Noty.show(t('logged_out'));
                    }).catch(function (error) {
                        console.error('[YummyAnime]', error);
                        Lampa.Noty.show(t('token_removed'));
                    });
                }
            });
        } else {
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_account_login', type: 'button'},
                field: {name: t('login_name'), description: t('login_description')},
                onChange: openSettingsLogin
            });
        }

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_api_settings_title', type: 'title'},
            field: {name: t('api_settings')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_api_check', type: 'button'},
            field: {name: t('api_check_name'), description: t('api_check_description')},
            onChange: function () {
                LampaYaniApi.health().then(function () {
                    Lampa.Noty.show(t('api_ok'));
                }).catch(function (error) {
                    console.error('[YummyAnime]', error);
                    Lampa.Noty.show(t('api_error'));
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_lampa_card_title', type: 'title'},
            field: {name: t('lampa_card_integration')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_lampa_card_rating', type: 'trigger', default: true},
            field: {name: t('lampa_card_rating'), description: t('lampa_card_rating_description')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_lampa_card_button', type: 'trigger', default: true},
            field: {name: t('lampa_card_button'), description: t('lampa_card_button_description')}
        });

        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_home_sections_title', type: 'title'},
            field: {name: t('home_sections')}
        });

        [
            ['catalog', 'catalog'],
            ['genres', 'genres'],
            ['search', 'search'],
            ['schedule', 'schedule'],
            ['new_translations', 'new_translations'],
            ['continue_watching', 'continue_watching'],
            ['user_lists', 'user_lists'],
            ['new_releases', 'new_releases'],
            ['top_rated', 'top_rated'],
            ['for_you', 'for_you'],
            ['updates', 'updates'],
            ['collections', 'collections'],
            ['notifications', 'notifications'],
            ['account', 'account'],
            ['status', 'status']
        ].forEach(function (section) {
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_section_' + section[0], type: 'trigger', default: true},
                field: {name: t(section[1]), description: t('section_visibility_description')}
            });
        });

        // A title row is deliberately non-interactive: the repository URL is
        // reference text, not another settings action or external link.
        Lampa.SettingsApi.addParam({
            component: 'yani',
            param: {name: 'yani_repo_notice', type: 'title'},
            field: {name: t('repo_notice')}
        });
    }

    function yummyWebsiteUrl() {
        var language = LampaYaniI18n.getLanguage();
        return language === 'en' || language === 'uk' ? 'https://en.yummyani.me/' : 'https://ru.yummyani.me/';
    }

    function yummyTitleUrl(card) {
        var slug = card && card.yani_url;
        if (!slug || typeof slug !== 'string') return '';
        if (/^https?:\/\//i.test(slug)) return slug;
        slug = slug.replace(/^\/+/, '').replace(/^catalog\/item\//i, '');
        return yummyWebsiteUrl().replace(/\/$/, '') + '/catalog/item/' + encodeURIComponent(slug);
    }

    function openYummyWebsite() {
        var url = yummyWebsiteUrl();
        if (Lampa.Browser && Lampa.Browser.open) return Lampa.Browser.open(url);
        if (Lampa.External && Lampa.External.open) return Lampa.External.open(url);
        if (Lampa.Utils && Lampa.Utils.open) return Lampa.Utils.open(url);
        if (window.open) return window.open(url, '_blank');
        Lampa.Noty.show(url);
    }

    function openSettingsLogin() {
        Lampa.Activity.push({
            url: 'yani/auth',
            title: 'YummyAnime · ' + t('auth_title'),
            component: 'yani_auth'
        });
    }

    function authDisplayName() {
        var account = LampaYaniAuth.get();
        return account.display_name || account.login || t('user');
    }

    function editLampacServer() {
        if (!window.LampaYaniLampacResolver) return Lampa.Noty.show(t('lampac_unavailable'));
        showYummyInput({
            title: t('lampac_server_prompt'),
            value: LampaYaniLampacResolver.baseUrl(),
            nosave: true
        }, function (value) {
            value = String(value || '').trim();
            var saved = LampaYaniLampacResolver.setBaseUrl(value);
            if (value && !saved) return Lampa.Noty.show(t('lampac_server_invalid'));
            Lampa.Noty.show(saved ? t('lampac_server_saved') : t('lampac_server_disabled'));
        });
    }

    function editResolverServer() {
        if (!window.LampaYaniResolver) return Lampa.Noty.show(t('resolver_unavailable'));
        showYummyInput({
            title: t('resolver_server_prompt'),
            value: LampaYaniResolver.baseUrl(),
            nosave: true
        }, function (value) {
            value = String(value || '').trim();
            var saved = LampaYaniResolver.setBaseUrl(value);
            if (value && !saved) return Lampa.Noty.show(t('resolver_server_invalid'));
            Lampa.Noty.show(saved ? t('resolver_server_saved') : t('resolver_server_disabled'));
        });
    }

    function showYummyInput(params, callback) {
        if (!Lampa.Input) {
            Lampa.Noty.show(t('input_unavailable'));
            return;
        }
        var navigation = transientNavigationSnapshot();
        var inputParams = Object.assign({}, params || {});
        var originalBack = inputParams.onBack;
        var complete = function (value) {
            var result = callback(value);
            setTimeout(function () {
                var controller = currentControllerName();
                if (!controller || controller === 'input' || controller === 'settings_component') {
                    restoreTransientInteraction(navigation);
                }
            }, 0);
            return result;
        };
        inputParams.onBack = function () {
            if (originalBack) originalBack();
            restoreTransientInteraction(navigation);
        };
        if (Lampa.Input.show) {
            inputParams.onEnter = complete;
            return Lampa.Input.show(inputParams);
        }
        if (Lampa.Input.edit) return Lampa.Input.edit(inputParams, complete);
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
