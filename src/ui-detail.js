(function (window) {
    'use strict';

    function toggleEpisodeSubscription(card, button, deps) {
        var t = deps.t;
        if (!LampaYaniAuth.token()) return Lampa.Noty.show(t('login_required'));
        if (!card || !card.yani_id) return;
        var key = 'yani_subscribed_video_' + card.yani_id;
        var subscribed = Lampa.Storage && Lampa.Storage.get(key, '');
        var videoRequest = subscribed ? Promise.resolve(String(subscribed)) : Promise.resolve(
            deps.loadVideos ? deps.loadVideos(card.yani_id) : LampaYaniApi.videos(card.yani_id)
        ).then(function (payload) {
            var videos = Array.isArray(payload) ? payload : payload && payload.response ? payload.response : payload;
            videos = Array.isArray(videos) ? videos : videos && (videos.videos || videos.items) || [];
            videos = videos.filter(function (video) { return video && (video.video_id || video.id); });
            if (!videos.length) throw new Error('No subscribable videos');
            videos.sort(function (a, b) { return Number(b.number || b.index || 0) - Number(a.number || a.index || 0); });
            return String(videos[0].video_id || videos[0].id);
        });
        videoRequest.then(function (videoId) {
            var action = subscribed ? LampaYaniApi.unsubscribeVideo(videoId) : LampaYaniApi.subscribeVideo(videoId);
            return action.then(function () {
                if (Lampa.Storage) {
                    if (subscribed) Lampa.Storage.set(key, '');
                    else Lampa.Storage.set(key, String(videoId));
                }
                button.text(subscribed ? t('subscribe_episodes') : t('unsubscribe_episodes'));
                Lampa.Noty.show(subscribed ? t('subscription_removed') : t('subscription_added'));
            });
        }).catch(function (error) {
            console.error('[YummyAnime] Subscription failed', error);
            Lampa.Noty.show(t('subscription_error'));
        });
    }

    function keepHorizontalFocusVisible(container, element) {
        var viewport = container && container[0];
        var target = element && element[0];
        if (!viewport || !target) return;
        var padding = Math.max(8, Math.round(viewport.clientWidth * 0.035));
        var viewportRect = viewport.getBoundingClientRect();
        var targetRect = target.getBoundingClientRect();
        var leftEdge = viewportRect.left + padding;
        var rightEdge = viewportRect.right - padding;
        if (targetRect.left < leftEdge) {
            viewport.scrollLeft = Math.max(0, viewport.scrollLeft - (leftEdge - targetRect.left));
        } else if (targetRect.right > rightEdge) {
            viewport.scrollLeft += targetRect.right - rightEdge;
        }
    }

    function createViewingOrder(data, deps) {
        var t = deps.t;
        var toCard = deps.toCard;
        var openYummyDetail = deps.openYummyDetail;
        var section = $('<div class="yani-detail__order"></div>');
        section.append($('<div class="yani-detail__order-title"></div>').text(t('viewing_order')));
        var list = $('<div class="yani-detail__order-list"></div>');
        data.yani_viewing_order.forEach(function (entry, index) {
            var related = toCard(entry);
            var relation = entry.data && (entry.data.text || entry.data.title) || '';
            var row = $('<div class="yani-detail__order-item selector"></div>');
            row.append($('<span class="yani-detail__order-index"></span>').text((index + 1) + '.'));
            row.append($('<span class="yani-detail__order-name"></span>').text(related.title));
            if (related.release_date) row.append($('<span class="yani-detail__order-year"></span>').text(related.release_date));
            if (relation) row.append($('<span class="yani-detail__order-relation"></span>').text('· ' + relation));
            appendYummyRating(row, related, 'yani-detail__order-rating');
            row.on('hover:focus', function () { row.addClass('focus'); });
            row.on('hover:blur', function () { row.removeClass('focus'); });
            // Viewing-order entries already contain YummyAnime identifiers.
            // Open them directly without a misleading native-Lampa fallback.
            row.on('hover:enter click.yaniOrder', function () { openYummyDetail(related, false); });
            list.append(row);
        });
        section.append(list);
        return section;
    }

    function appendYummyRating(host, card, className) {
        var value = window.LampaYaniUiUtils && typeof LampaYaniUiUtils.yummyRatingValue === 'function'
            ? LampaYaniUiUtils.yummyRatingValue(card)
            : 0;
        if (!(value > 0) || !host) return;
        var text = value.toFixed(1);
        host.append($('<span class="yani-rating-ya ' + (className || '') + '"></span>')
            .attr({title: 'YummyAnime ' + text, 'aria-label': 'YummyAnime ' + text})
            .append($('<b></b>').text('YA'))
            .append(document.createTextNode(text)));
    }

    function loadDetailRecommendations(data, container, bindFocus, appendNavigation, deps) {
        var t = deps.t;
        var toCard = deps.toCard;
        var openYummyDetail = deps.openYummyDetail;
        var section = $('<div class="yani-detail__extra yani-detail__recommendations"><div class="yani-detail__extra-title"></div></div>');
        $('.yani-detail__extra-title', section).text(t('recommendations'));
        var list = $('<div class="yani-detail__recommendations-list"></div>');
        section.append(list);
        container.append(section);
        LampaYaniApi.recommendations(data.yani_id).then(function (payload) {
            var items = LampaYaniApi.normalize(payload).slice(0, 12);
            if (!items.length) return section.remove();
            items.forEach(function (item) {
                var card = toCard(item);
                var row = $('<div class="yani-detail__recommendation selector"></div>');
                var recommendationPoster = $('<img class="yani-detail__recommendation-poster" alt="">').attr('src', card.poster || '');
                LampaYaniMedia.bindPosterFallback(recommendationPoster, card);
                row.append(recommendationPoster);
                row.append($('<div class="yani-detail__recommendation-title"></div>').text(card.title));
                if (card.release_date) row.append($('<div class="yani-detail__recommendation-year"></div>').text(card.release_date));
                row.on('hover:focus', function () {
                    row.addClass('focus');
                    keepHorizontalFocusVisible(list, row);
                });
                row.on('hover:blur', function () { row.removeClass('focus'); });
                // Recommendations already originate from YummyAnime. Do not
                // show a misleading Lampa-card fallback message before their
                // direct YummyAnime detail page opens.
                row.on('hover:enter click.yaniRecommendation', function () { openYummyDetail(card, false); });
                list.append(row);
                if (bindFocus) bindFocus(row);
                if (appendNavigation) appendNavigation(row);
            });
        }).catch(function () { section.remove(); });
    }

    function loadDetailCollections(data, container, bindFocus, deps) {
        var t = deps.t;
        var toCard = deps.toCard;
        var openYummyDetail = deps.openYummyDetail;
        var showYummySelect = deps.showYummySelect;
        var cleanCommentText = deps.cleanCommentText;
        var section = $('<div class="yani-detail__extra yani-detail__collections"><div class="yani-detail__extra-title"></div></div>');
        section.find('.yani-detail__extra-title').text(t('collections'));
        var list = $('<div class="yani-detail__collections-list"></div>');
        section.append(list);
        container.append(section);
        LampaYaniApi.collections(data.yani_id, 10, 0).then(function (payload) {
            var response = payload && payload.response ? payload.response : payload;
            var items = Array.isArray(response) ? response : response && (response.items || response.data || response.collections) || [];
            if (!items.length) return section.remove();
            items.forEach(function (collection) {
                var row = $('<div class="yani-detail__collection selector"></div>');
                row.append($('<div class="yani-detail__collection-title"></div>').text(collection.title || collection.name || t('collection')));
                if (collection.description) row.append($('<div class="yani-detail__collection-description"></div>').text(cleanCommentText(collection.description)));
                var animes = Array.isArray(collection.animes) ? collection.animes : [];
                if (animes.length) row.append($('<div class="yani-detail__collection-count"></div>').text(animes.length + ' ' + t('anime_count')));
                row.on('hover:focus', function () { row.addClass('focus'); });
                row.on('hover:blur', function () { row.removeClass('focus'); });
                row.on('hover:enter click.yaniCollection', function () {
                    if (!animes.length) return;
                    showYummySelect({title: collection.title || t('collection'), items: animes.map(function (item) {
                        var card = toCard(item);
                        return {title: card.title, card: card};
                    }), onSelect: function (item) { openYummyDetail(item.card, true); }});
                });
                list.append(row);
                if (bindFocus) bindFocus(row);
            });
        }).catch(function () { section.remove(); });
    }

    function create(object, deps) {
        var t = deps.t;
        var locale = deps.locale;
        var getYummyId = deps.getYummyId;
        var toCard = deps.toCard;
        var getPlayback = deps.getPlayback;
        var mediaTypeLabels = deps.mediaTypeLabels;
        var cardMediaMotionAllowed = deps.cardMediaMotionAllowed;
        var createDetailRatings = deps.createDetailRatings;
        var detailGenres = deps.detailGenres;
        var genreTitle = deps.genreTitle;
        var genreValue = deps.genreValue;
        var openGenreCatalog = deps.openGenreCatalog;
        var beginPlaybackNavigation = deps.beginPlaybackNavigation;
        var openTitlePlaybackOptions = deps.openTitlePlaybackOptions;
        var openTrailers = deps.openTrailers;
        var lampaIcon = deps.lampaIcon;
        var openStandardLampaCard = deps.openStandardLampaCard;
        var addCardListBadge = deps.addCardListBadge;
        var syncCardOverlayLayout = deps.syncCardOverlayLayout;
        var hasYummyList = deps.hasYummyList;
        var showYummySelect = deps.showYummySelect;
        var openYummyDetail = deps.openYummyDetail;
        var commentItem = deps.commentItem;
        var commentReplies = deps.commentReplies;
        var commentsMenu = deps.commentsMenu;
        var transientNavigationSnapshot = deps.transientNavigationSnapshot;
        var movePageDown = deps.movePageDown;
        var goBack = deps.goBack;

        var comp = {};
        var detailComponent = comp;
        object = object || {};
        var restoredActivity = !object.card || typeof object.card !== 'object' || !getYummyId(object.card);
        var data = object.card || object.object || object.data || {};
        var routeId = LampaYaniUiUtils.detailRouteId(object);
        if (routeId && !getYummyId(data)) data = Object.assign({}, data, {yani_id: routeId});
        if (!data.title && object.title) data.title = object.title;
        var html = $('<div class="yani-detail"></div>');
        var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
        scroll.minus();
        var button;
        var titleFocus;
        var destroyed = false;
        var refreshDetailWatchState = function () {};
        var videosAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var posterViewer = null;
        var posterExpanded = false;
        var detailFocus = LampaYaniNavigation.createScope({
            id: 'detail:' + String(routeId || getYummyId(data) || object.url || 'unknown'),
            root: function () { return html; },
            collection: function () { return scroll.render(); },
            scroll: scroll,
            selector: '.selector',
            fallback: function () {
                return (titleFocus && (titleFocus[0] || titleFocus)) ||
                    (button && (button[0] || button)) ||
                    html.find('.yani-detail__title.selector, .selector').first()[0] ||
                    null;
            }
        });

        function appendDetailNavigation(container) {
            if (destroyed || !container || !Lampa.Controller || !Lampa.Controller.enabled || !Lampa.Controller.collectionAppend) return;
            var enabled = Lampa.Controller.enabled();
            if (!enabled || enabled.name !== 'content' || !enabled.controller || enabled.controller.yaniDetailOwner !== detailComponent) return;
            var targets = container.hasClass && container.hasClass('selector')
                ? container.add(container.find('.selector'))
                : container.find('.selector');
            if (targets.length) Lampa.Controller.collectionAppend(targets);
        }

        detailFocus.bind(html);
        $(document).on('yani:watch-progress.yaniDetail', function (event, card) {
            if (destroyed) return;
            if (!card || String(card.yani_id) !== String(data.yani_id)) return;
            refreshDetailWatchState();
        });

        function closePosterViewer() {
            if (!posterExpanded) return false;
            posterExpanded = false;
            if (posterViewer) posterViewer.remove();
            posterViewer = null;
            $('body').removeClass('yani-poster-viewer-open');
            html.find('.yani-detail__poster').attr('aria-expanded', 'false');
            return true;
        }

        function togglePosterViewer(poster, cardData) {
            if (closePosterViewer()) return;
            var source = cardData.yani_poster_full || poster.attr('src') || cardData.img || cardData.poster || '';
            if (!source) return;
            posterExpanded = true;
            poster.attr('aria-expanded', 'true');
            posterViewer = $('<div class="yani-poster-viewer" role="dialog" aria-modal="true"></div>');
            posterViewer.append($('<img class="yani-poster-viewer__image" alt="">')
                .attr('src', source)
                .attr('alt', cardData.title || 'YummyAnime'));
            posterViewer.on('click.yaniPosterViewer', function (event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                closePosterViewer();
            });
            $('body').addClass('yani-poster-viewer-open').append(posterViewer);
        }

        function loadDetailVideos() {
            var load = deps.loadVideos || function (id, options) {
                return LampaYaniApi.videos(id, options).then(function (payload) {
                    var videos = payload && payload.response ? payload.response : payload;
                    return Object.prototype.toString.call(videos) === '[object Array]' ? videos : [];
                });
            };
            return load(data.yani_id, {signal: videosAbort && videosAbort.signal}).then(function (videos) {
                if (deps.importVideosProgress) deps.importVideosProgress(data, videos);
                return videos;
            });
        }

        comp.create = function () {
            var self = this;
            var settled = false;
            var timeoutId;
            this.activity.loader(true);

            function finish(card) {
                if (settled) return;
                settled = true;
                if (timeoutId) clearTimeout(timeoutId);
                try {
                    renderDetail(card);
                } catch (error) {
                    console.error('[YummyAnime Detail render]', error);
                    html.empty().append($('<div class="yani-detail__error selector"></div>').text(t('detail_load_error')));
                } finally {
                    self.activity.loader(false);
                    self.activity.toggle();
                }
            }

            function canRenderSnapshot(card) {
                return Boolean(card && (card.img || card.poster || card.overview ||
                    card.yani_titles && card.yani_titles.length || card.yani_ratings && card.yani_ratings.length));
            }

            function fail(error) {
                if (settled) return;
                settled = true;
                if (timeoutId) clearTimeout(timeoutId);
                if (error) console.error('[YummyAnime Detail restore]', error);
                self.activity.loader(false);

                // Plugin cache resets can restore the route but discard its
                // transient card object. If the route can no longer be
                // hydrated, replace the broken activity with YummyAnime Home
                // instead of leaving an unusable partial title page onscreen.
                if (restoredActivity && Lampa.Activity && Lampa.Activity.replace) {
                    setTimeout(function () {
                        Lampa.Activity.replace({url: 'yani', title: 'YummyAnime', component: 'yani_home'});
                    }, 0);
                    return;
                }
                html.empty();
                button = $('<div class="yani-detail__error selector"></div>').text(t('detail_load_error'));
                bindDetailButtonFocus(button);
                html.append(button);
                scroll.append(html);
                self.activity.toggle();
            }

            timeoutId = setTimeout(function () {
                console.error('[YummyAnime Detail] timeout');
                if (canRenderSnapshot(data)) finish(data);
                else fail(new Error('Detail restore timed out'));
            }, 20000);

            if (routeId || data.yani_id) {
                var detailId = routeId || data.yani_id;
                data.yani_id = detailId;
                LampaYaniApi.detail(detailId).then(function (payload) {
                    var item = payload && payload.response ? payload.response : payload;
                    var detailed = item ? toCard(item) : data;
                    if (!detailed.yani_id) detailed.yani_id = detailId;
                    detailed.yani_schedule = data.yani_schedule;
                    finish(detailed);
                }).catch(function (error) {
                    console.error('[YummyAnime]', error);
                    if (canRenderSnapshot(data)) finish(data);
                    else fail(error);
                });
            } else {
                if (canRenderSnapshot(data)) finish(data);
                else fail(new Error('YummyAnime detail id is missing'));
            }
        };

        function renderDetail(cardData) {
            data = cardData;
            var malId = data.yani_remote_ids && (data.yani_remote_ids.myanimelist_id || data.yani_remote_ids.mal_id);
            if (malId) LampaYaniApi.episodeInfo(malId).catch(function () {});
            var poster = $('<img class="yani-detail__poster selector" role="button" aria-expanded="false">')
                .attr('src', data.img || data.poster || '')
                .attr('alt', data.title || 'YummyAnime');
            LampaYaniMedia.bindPosterFallback(poster, data);
            poster.on('hover:enter.yaniPoster click.yaniPoster', function (event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                togglePosterViewer(poster, data);
            });
            bindDetailButtonFocus(poster);
            var info = $('<div class="yani-detail__info"></div>');
            // The title is deliberately a selector and the default landing
            // focus, so the page opens on the name and Up from actions returns
            // the viewport to the beginning of the detail card.
            titleFocus = $('<div class="yani-detail__title selector"></div>').text(data.title || 'YummyAnime');
            bindDetailButtonFocus(titleFocus);
            info.append(titleFocus);
            var alternativeTitles = (data.yani_titles || []).filter(function (title) { return title && title !== data.title; });
            if (alternativeTitles.length) info.append($('<div class="yani-detail__alternative-titles"></div>').text(alternativeTitles.join(' · ')));
            var detailType = mediaTypeLabels(data.yani_type);
            if (detailType) info.append($('<div class="yani-detail__type"></div>').text(detailType.full));
            var genres = detailGenres(data);
            if (genres.length) info.append(createDetailGenres(genres));
            if (data.release_date) info.append($('<div class="yani-detail__meta"></div>').text(data.release_date));
            var episodeSummary = createDetailEpisodeSummary(data);
            if (episodeSummary) info.append(episodeSummary);
            info.append(createDetailTranslations());
            info.append(createDetailRatings(data.yani_ratings || [], data.vote_count));
            info.append(createDetailRatingAction(data));
            if (data.yani_schedule) info.append($('<div class="yani-detail__schedule"></div>').text(data.yani_schedule));
            info.append($('<div class="yani-detail__overview"></div>').text(data.overview || ''));
            var actions = $('<div class="yani-detail__actions"></div>');
            button = $('<div class="yani-detail__button yani-detail__button--watch selector"></div>').text(t('watch'));
            // Keep playback behind one action. When YummyTV is enabled the
            // destination is selected first; regular playback then opens the
            // dubbing/source and episode selectors as before.
            button.on('hover:enter click.yaniWatch', function () {
                beginPlaybackNavigation(button, scroll.render());
                openTitlePlaybackOptions(data);
            });
            bindDetailButtonFocus(button);
            var trailersButton = $('<div class="yani-detail__button selector"></div>').text(t('trailers'));
            trailersButton.on('hover:enter click.yaniDetailTrailers', function () { openTrailers(data); });
            bindDetailButtonFocus(trailersButton);
            var searchButton = $('<div class="yani-detail__button yani-detail__button--lampa selector"></div>');
            searchButton.append($('<span class="yani-detail__button-icon"></span>').html(lampaIcon()));
            searchButton.append($('<span></span>').text(t('open_lampa_search')));
            searchButton.on('hover:enter click.yaniLampaCard', function (event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                openStandardLampaCard(data);
            });
            bindDetailButtonFocus(searchButton);
            var subscribeButton = $('<div class="yani-detail__button selector"></div>').text(t('subscribe_episodes'));
            if (Lampa.Storage && Lampa.Storage.get('yani_subscribed_video_' + data.yani_id, '')) {
                subscribeButton.text(t('unsubscribe_episodes'));
            }
            subscribeButton.on('hover:enter', function () {
                toggleEpisodeSubscription(data, subscribeButton, {
                    t: t,
                    loadVideos: function () { return loadDetailVideos(); }
                });
            });
            bindDetailButtonFocus(subscribeButton);
            var comments = $('<div class="yani-detail__comments"></div>');
            var listPanel = createDetailListPanel(data);
            actions.append(button, trailersButton, searchButton);
            actions.append(subscribeButton);
            // Keep the principal actions next to the synopsis, before the
            // long viewing-order, recommendations and comments sections.
            info.append(actions);
            info.append(listPanel);
            if (data.yani_viewing_order && data.yani_viewing_order.length) info.append(createViewingOrder(data, deps));
            loadDetailRecommendations(data, info, bindDetailScrollTargets, appendDetailNavigation, deps);
            info.append(comments);
            html.append(poster, info);
            scroll.append(html);
            bindDetailScrollTargets(html);
            loadInlineComments(data, comments);
        }

        function createDetailEpisodeSummary(cardData) {
            var lastVideos = [];
            var stats = LampaYaniUiUtils.detailEpisodeStats(cardData, lastVideos, getPlayback(cardData.yani_id));
            if (!stats.seasons && !stats.total && !stats.aired && !stats.watched && !stats.minutes) return null;
            var block = $('<div class="yani-detail__episode-summary selector"></div>')
                .attr('aria-label', t('episode_information'));
            var loading = false;
            var loaded = false;

            function render(values) {
                var items = [];
                if (values.seasons) items.push({icon: 'seasons', text: values.seasons + ' ' + t('seasons_short')});
                if (values.total) items.push({icon: 'episodes', text: values.total + ' ' + t('episodes_short')});
                if (values.aired) items.push({icon: 'aired', text: t('episodes_aired') + ' ' + values.aired});
                if (values.watched) {
                    var watchedText = t('episodes_watched') + ' ' + (values.watchedLabel || values.watched);
                    items.push({
                        icon: 'watched',
                        kind: 'watched',
                        text: watchedText,
                        title: values.watchedTitle ? t('episodes_watched') + ' ' + values.watchedTitle : watchedText
                    });
                }
                if (values.minutes) items.push({icon: 'duration', text: '≈ ' + values.minutes + ' ' + t('minutes_short')});
                block.empty();
                items.forEach(function (item) {
                    var stat = $('<span class="yani-detail__episode-stat"></span>');
                    if (item.kind) stat.addClass('yani-detail__episode-stat--' + item.kind);
                    if (item.title) stat.attr('title', item.title);
                    block.append(stat
                        .append($('<span class="yani-detail__episode-stat-icon"></span>').html(detailEpisodeIcon(item.icon)))
                        .append($('<span class="yani-detail__episode-stat-text"></span>').text(item.text)));
                });
            }

            refreshDetailWatchState = function () {
                render(LampaYaniUiUtils.detailEpisodeStats(cardData, lastVideos, getPlayback(cardData.yani_id)));
            };

            function enrich() {
                if (loading || loaded) return;
                loading = true;
                block.addClass('loading');
                loadDetailVideos().then(function (videos) {
                    lastVideos = Array.isArray(videos) ? videos : [];
                    loaded = true;
                    loading = false;
                    block.removeClass('loading');
                    refreshDetailWatchState();
                }).catch(function (error) {
                    loading = false;
                    loaded = true;
                    block.removeClass('loading');
                    console.warn('[YummyAnime] Episode summary enrichment failed', error);
                });
            }

            render(stats);
            bindDetailButtonFocus(block);
            block.one('hover:focus.yaniEpisodeSummary', enrich);
            // Normal one-cour titles are cheap to enrich in the background.
            // Very long shows wait until this compact row receives focus to
            // avoid loading thousands of video variants on weak devices.
            if (stats.total > 0 && stats.total <= 100) setTimeout(enrich, 350);
            return block;
        }

        function detailTranslationGroups(videos) {
            var voices = {};
            var subtitles = {};
            (videos || []).forEach(function (video) {
                var videoInfo = LampaYaniUiUtils.videoData(video);
                var raw = String(videoInfo.dubbing || '').replace(/\s+/g, ' ').trim();
                if (!raw) return;
                var kind = LampaYaniUiUtils.translationKind(raw);
                var name = LampaYaniUiUtils.translationLabel(raw, kind);
                var target = kind === 'subtitles' ? subtitles : voices;
                var key = name.toLowerCase();
                if (!target[key]) target[key] = name;
            });
            var sort = function (values) {
                return Object.keys(values).map(function (key) { return values[key]; }).sort(function (a, b) {
                    return a.localeCompare(b, locale());
                });
            };
            return {voices: sort(voices), subtitles: sort(subtitles)};
        }

        function createDetailTranslations() {
            var block = $('<div class="yani-detail__translations selector loading"></div>')
                .attr('aria-label', t('available_translations'));
            block.addClass(cardMediaMotionAllowed() ? 'yani-detail__translations--motion' : 'yani-detail__translations--static');
            block.append($('<div class="yani-detail__translations-title"></div>').text(t('available_translations')));
            block.append('<div class="yani-detail__translations-skeleton"><i></i><i></i><i></i></div>');
            bindDetailButtonFocus(block);

            function renderRow(kind, title, values) {
                if (!values.length) return null;
                var row = $('<div class="yani-detail__translation-row yani-detail__translation-row--' + kind + '"></div>');
                var heading = $('<div class="yani-detail__translation-heading"></div>');
                heading.append(kind === 'voices'
                    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H5l-3 3 3 3h4l5 4V5L9 9Zm8.5.2a4 4 0 0 1 0 5.6M20 6.5a7.5 7.5 0 0 1 0 11"/></svg>'
                    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm3 8h4M14 13h4M6 16h7"/></svg>');
                heading.append($('<span></span>').text(title));
                heading.append($('<b></b>').text(values.length));
                row.append(heading);
                var list = $('<div class="yani-detail__translation-list"></div>');
                values.forEach(function (value, index) {
                    list.append($('<span></span>').css('animation-delay', Math.min(index, 8) * 24 + 'ms').text(value));
                });
                row.append(list);
                return row;
            }

            loadDetailVideos().then(function (videos) {
                if (destroyed) return;
                var groups = detailTranslationGroups(videos);
                block.removeClass('loading').empty();
                block.append($('<div class="yani-detail__translations-title"></div>').text(t('available_translations')));
                var voices = renderRow('voices', t('voice_teams'), groups.voices);
                var subtitles = renderRow('subtitles', t('subtitle_teams'), groups.subtitles);
                if (voices) block.append(voices);
                if (subtitles) block.append(subtitles);
                if (!voices && !subtitles) block.append($('<div class="yani-detail__translations-empty"></div>').text(t('translations_unknown')));
                bindDetailScrollTargets(block);
                appendDetailNavigation(block);
            }).catch(function () {
                block.removeClass('loading').addClass('unavailable');
                block.find('.yani-detail__translations-skeleton').remove();
                block.append($('<div class="yani-detail__translations-empty"></div>').text(t('translations_unknown')));
            });
            return block;
        }

        function detailEpisodeIcon(name) {
            var icons = {
                seasons: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v4H5V4Zm-2 6h18v4H3v-4Zm2 6h14v4H5v-4Z"/></svg>',
                episodes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4V4Zm2 2v5h5V6H6Zm7 0v5h5V6h-5ZM6 13v5h5v-5H6Zm7 0v5h5v-5h-5Z"/></svg>',
                aired: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.2 16.6-4.1-4.1 1.4-1.4 2.7 2.7 8.3-8.3 1.4 1.4-9.7 9.7ZM4 20h16v2H4v-2Z"/></svg>',
                watched: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-5.2 0-9.4 3.4-11 7 1.6 3.6 5.8 7 11 7s9.4-3.4 11-7c-1.6-3.6-5.8-7-11-7Zm0 11.2A4.2 4.2 0 1 1 12 7.8a4.2 4.2 0 0 1 0 8.4Zm0-2A2.2 2.2 0 1 0 12 9.8a2.2 2.2 0 0 0 0 4.4Z"/></svg>',
                duration: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm1-13h-2v6l5 3 1-1.7-4-2.3V7Z"/></svg>'
            };
            return icons[name] || '';
        }

        function createDetailListPanel(cardData) {
            var panel = $('<div class="yani-detail__list-panel"></div>');
            var actions = [
                {key: 'watching', id: 0, icon: 'eye'},
                {key: 'planned', id: 1, icon: 'cloud'},
                {key: 'completed', id: 2, icon: 'flag'},
                {key: 'dropped', id: 3, icon: 'eye-off'},
                {key: 'postponed', id: 5, icon: 'hourglass'},
                {key: 'favorite', favorite: true, icon: 'heart'}
            ];

            actions.forEach(function (action) {
                var item = $('<div class="yani-detail__list-action selector"></div>')
                    .attr('title', t(action.key))
                    .attr('aria-label', t(action.key))
                    .append($('<span class="yani-detail__list-icon"></span>').html(detailListIcon(action.icon)));
                item.on('hover:enter click.yaniDetailList', function () {
                    toggleDetailListState(cardData, action, panel);
                });
                bindDetailButtonFocus(item);
                panel.append(item);
            });
            updateDetailListPanel(panel, cardData);
            return panel;
        }

        function createDetailRatingAction(cardData) {
            var action = $('<div class="yani-detail__rating-action selector"></div>');
            action.append('<span class="yani-detail__rating-icon" aria-hidden="true">★</span>');
            action.append('<span class="yani-detail__rating-label"></span>');

            function update() {
                var value = Number(cardData.yani_user_rating || 0);
                action.toggleClass('active', value > 0);
                action.attr('aria-label', value > 0 ? t('my_rating') + ': ' + value + '/10' : t('set_rating'));
                action.find('.yani-detail__rating-label').text(value > 0 ? t('my_rating') + ': ' + value + '/10' : t('set_rating'));
            }

            action.on('hover:enter click.yaniDetailRating', function () {
                if (!LampaYaniAuth.token()) {
                    Lampa.Noty.show(t('login_required'));
                    return;
                }
                var items = [];
                for (var value = 10; value >= 1; value--) {
                    items.push({
                        title: (Number(cardData.yani_user_rating) === value ? '✓ ' : '') + value + '/10',
                        value: value
                    });
                }
                if (Number(cardData.yani_user_rating || 0) > 0) items.push({title: t('remove_rating'), remove: true});

                showYummySelect({
                    title: t('set_rating'),
                    items: items,
                    onSelect: function (selected) {
                        var request = selected.remove
                            ? LampaYaniApi.removeRate(cardData.yani_id)
                            : LampaYaniApi.rate(cardData.yani_id, selected.value);
                        request.then(function () {
                            cardData.yani_user_rating = selected.remove ? null : Number(selected.value);
                            update();
                            Lampa.Noty.show(selected.remove ? t('rating_removed') : t('saved'));
                        }).catch(function (error) {
                            console.error('[YummyAnime Rating]', error);
                            Lampa.Noty.show(t('save_error'));
                        });
                    }
                });
            });
            bindDetailButtonFocus(action);
            update();
            return action;
        }

        function createDetailGenres(genres) {
            var block = $('<div class="yani-detail__genres"></div>');
            genres.forEach(function (genre) {
                var title = genreTitle(genre);
                var value = genreValue(genre);
                if (!title || value === null) return;
                var chip = $('<div class="yani-detail__genre selector"></div>').text(title);
                chip.on('hover:enter click.yaniDetailGenre', function () { openGenreCatalog(genre); });
                bindDetailButtonFocus(chip);
                block.append(chip);
            });
            return block;
        }

        function updateDetailListPanel(panel, cardData) {
            panel.children('.yani-detail__list-action').each(function (index) {
                var action = [
                    {id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 5}, {favorite: true}
                ][index];
                var active = action.favorite ? Boolean(cardData.yani_is_favorite) : hasYummyList(cardData, action.id);
                $(this).toggleClass('active', active).attr('aria-pressed', active ? 'true' : 'false');
            });
            addCardListBadge(null, cardData);
            syncCardOverlayLayout(null, cardData);
        }

        function toggleDetailListState(cardData, action, panel) {
            if (!LampaYaniAuth.token()) {
                Lampa.Noty.show(t('login_required'));
                return;
            }
            var active = action.favorite ? Boolean(cardData.yani_is_favorite) : hasYummyList(cardData, action.id);
            var request = action.favorite
                ? (active ? LampaYaniApi.removeFavorite(cardData.yani_id) : LampaYaniApi.addFavorite(cardData.yani_id))
                : (active ? LampaYaniApi.removeFromList(cardData.yani_id) : LampaYaniApi.addToList(cardData.yani_id, action.id));
            request.then(function () {
                if (action.favorite) cardData.yani_is_favorite = !active;
                else cardData.yani_list_id = active ? null : action.id;
                updateDetailListPanel(panel, cardData);
                Lampa.Noty.show(t('saved'));
            }).catch(function (error) {
                console.error('[YummyAnime]', error);
                Lampa.Noty.show(t('save_error'));
            });
        }

        function detailListIcon(name) {
            var icons = {
                eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-5.2 0-9.4 3.4-11 7 1.6 3.6 5.8 7 11 7s9.4-3.4 11-7c-1.6-3.6-5.8-7-11-7Zm0 11.2A4.2 4.2 0 1 1 12 7.8a4.2 4.2 0 0 1 0 8.4Zm0-2A2.2 2.2 0 1 0 12 9.8a2.2 2.2 0 0 0 0 4.4Z"/></svg>',
                cloud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.5 19H6.2A4.2 4.2 0 1 1 7 10.7 5.5 5.5 0 0 1 17.5 12 3.5 3.5 0 0 1 18.5 19Zm-12.3-2h12.3a1.5 1.5 0 0 0 0-3c-.4 0-.8.1-1.1.3l-1.6.8.1-1.8A3.5 3.5 0 0 0 9 12.5l.1 1.4-1.3-1A2.2 2.2 0 1 0 6.2 17Z"/></svg>',
                flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h2v2h9.2l-1 3 1 3H8v10H6V3Zm2 6h6.3l-.3-1 .3-1H8v2Z"/></svg>',
                'eye-off': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.3 2 18.7 18.7-1.4 1.4-3.1-3.1a11.7 11.7 0 0 1-5.5 1.5c-5.2 0-9.4-3.4-11-7a12.7 12.7 0 0 1 4.5-5.1L1.9 3.4 3.3 2ZM12 8.5a3.5 3.5 0 0 0-1.3.2l4.6 4.6A3.5 3.5 0 0 0 12 8.5Zm0-3.5c5.2 0 9.4 3.4 11 7a12.8 12.8 0 0 1-4.1 4.8l-1.5-1.5A10.8 10.8 0 0 0 20.8 12c-1.8-3-5.2-5-8.8-5-1 0-1.9.1-2.8.4L7.6 5.8C9 5.3 10.5 5 12 5ZM3.2 12c.6 1.1 1.5 2.1 2.5 2.9l-1.4-1.4A9.7 9.7 0 0 1 3.2 12Z"/></svg>',
                hourglass: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12v2c0 3-1.2 5.2-3.5 7 2.3 1.8 3.5 4 3.5 7v2H6v-2c0-3 1.2-5.2 3.5-7C7.2 9.2 6 7 6 4V2Zm2 2c0 2.6 1.2 4.5 4 6.3C14.8 8.5 16 6.6 16 4H8Zm0 16h8c0-2.6-1.2-4.5-4-6.3C9.2 15.5 8 17.4 8 20Z"/></svg>',
                heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.2 3.7 13A5.6 5.6 0 0 1 11.6 5L12 5.5l.4-.5a5.6 5.6 0 0 1 7.9 8l-8.3 8.2ZM7.6 6.4A3.6 3.6 0 0 0 5.1 12L12 18.3l6.9-6.8a3.6 3.6 0 0 0-5.1-5.1L12 8l-1.4-1.6a3.6 3.6 0 0 0-3-1Z"/></svg>'
            };
            return icons[name] || '';
        }

        function loadDetailCommunityStats(cardData, container) {
            var section = $('<div class="yani-detail__community selector"><div class="yani-detail__community-title"></div><div class="yani-detail__community-grid"></div></div>');
            section.on('hover:focus', function () { section.addClass('focus'); });
            section.find('.yani-detail__community-title').text(t('community_stats'));
            container.append(section);
            bindDetailScrollTargets(section);
            Promise.all([LampaYaniApi.ratingBuckets(cardData.yani_id), LampaYaniApi.listStats(cardData.yani_id)]).then(function (responses) {
                var rates = normalizeDetailStats(responses[0]);
                var lists = normalizeDetailStats(responses[1]);
                if (!rates.length && !lists.length) return section.remove();
                var grid = section.find('.yani-detail__community-grid');
                rates.slice(0, 10).forEach(function (item) {
                    var label = item.rating || item.value || item.name || item.title;
                    var count = item.count || item.counters || item.total || 0;
                    if (label !== undefined) grid.append($('<div class="yani-detail__community-item"></div>').text(String(label) + ': ' + String(count)));
                });
                lists.slice(0, 8).forEach(function (item) {
                    var label = item.list && (item.list.title || item.list.name) || item.title || item.name || item.status;
                    var count = item.count || item.total || item.counters || 0;
                    if (label) grid.append($('<div class="yani-detail__community-item"></div>').text(String(label) + ': ' + String(count)));
                });
                if (!grid.children().length) section.remove();
            }).catch(function () { section.remove(); });
        }

        function normalizeDetailStats(payload) {
            var response = payload && payload.response ? payload.response : payload;
            return Array.isArray(response) ? response : response && (response.items || response.data || response.rates || response.lists) || [];
        }

        function bindDetailButtonFocus(element) {
            element.on('hover:focus', function () {
                element.siblings('.focus').removeClass('focus');
                element.addClass('focus');
                scroll.update(element, true);
            });
            element.on('hover:blur', function () { element.removeClass('focus'); });
        }

        function bindDetailScrollTargets(container) {
            var targets = container.hasClass && container.hasClass('selector') ? container.add(container.find('.selector')) : container.find('.selector');
            targets.each(function () {
                var element = $(this);
                element.off('hover:focus.yaniDetailScroll').on('hover:focus.yaniDetailScroll', function () {
                    // Bind on the selector itself. In some Lampa builds the
                    // custom hover event does not bubble to the detail root,
                    // which previously allowed focus to leave the viewport
                    // when moving back up through a long page.
                    scroll.update(element, true);
                });
            });
        }

        function loadInlineComments(cardData, container) {
            var commentsTitle = $('<div class="yani-detail__comments-title selector"></div>').text(t('comments_title') + (cardData.yani_comments_count ? ' (' + cardData.yani_comments_count + ')' : ''));
            commentsTitle.on('hover:focus', function () { commentsTitle.addClass('focus'); });
            container.append(commentsTitle);
            var list = $('<div class="yani-detail__comments-list"></div>');
            list.append($('<div class="yani-detail__comments-loading"></div>').text('…'));
            container.append(list);
            bindDetailScrollTargets(container);
            LampaYaniApi.comments(cardData.yani_id, 0).then(function (payload) {
                var comments = LampaYaniApi.normalizeComments(payload);
                list.empty();
                if (!comments.length) {
                    var empty = $('<div class="yani-detail__comments-empty selector"></div>').text(t('comments_empty'));
                    empty.on('hover:focus', function () { empty.addClass('focus'); });
                    list.append(empty);
                    bindDetailScrollTargets(empty);
                    appendDetailNavigation(empty);
                    return;
                }
                comments.forEach(function (comment) {
                    var item = commentItem(comment);
                    var row = $('<div class="yani-detail__comment selector"></div>');
                    row.append($('<div class="yani-detail__comment-title"></div>').text(item.title));
                    if (item.subtitle) row.append($('<div class="yani-detail__comment-stats"></div>').text(item.subtitle));
                    row.on('hover:focus', function () { row.addClass('focus'); });
                    row.on('hover:enter click.yaniComment', function () {
                        var navigation = transientNavigationSnapshot();
                        if (Number(comment.children_count) > 0) commentReplies(comment, 0, [], null, navigation);
                        else commentsMenu(cardData.yani_id, 0, [], navigation);
                    });
                    list.append(row);
                    bindDetailScrollTargets(row);
                    appendDetailNavigation(row);
                });
            }).catch(function (error) {
                console.error('[YummyAnime Comments]', error);
                var errorRow = $('<div class="yani-detail__comments-error selector"></div>').text(t('comments_error'));
                errorRow.on('hover:focus', function () { errorRow.addClass('focus'); });
                list.empty().append(errorRow);
                bindDetailScrollTargets(errorRow);
                appendDetailNavigation(errorRow);
            });
        }

        comp.start = function () {
            refreshDetailWatchState();
            var controller = {
                link: detailComponent,
                yaniDetailOwner: detailComponent,
                // Prefer the last focused control; only fall back to the title.
                toggle: function () { detailFocus.restore(null, true); },
                left: function () { if (!posterExpanded) { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); } },
                right: function () { if (!posterExpanded) Navigator.move('right'); },
                up: function () { if (!posterExpanded) { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); } },
                down: function () { if (!posterExpanded) movePageDown(scroll); },
                back: function () { if (!closePosterViewer()) goBack(); }
            };
            Lampa.Controller.add('content', controller);
            Lampa.Controller.toggle('content');
            setTimeout(function () {
                var remembered = detailFocus.target();
                var first = remembered ? $(remembered) : (titleFocus && titleFocus.length ? titleFocus : html.find('.yani-detail__title.selector').first());
                if (!first || !first.length) {
                    first = html.find('.yani-detail__button.selector, .yani-detail__order-item.selector, .yani-detail__comment.selector').first();
                }
                if (first.length) {
                    scroll.update(first, true);
                    detailFocus.remember(first[0]);
                    Lampa.Controller.collectionFocus(first, scroll.render());
                }
            }, 0);
        };

        comp.render = function (js) { return js ? scroll.render(true) : scroll.render(); };
        comp.destroy = function () {
            destroyed = true;
            $(document).off('.yaniDetail');
            closePosterViewer();
            if (videosAbort) videosAbort.abort();
            detailFocus.destroy();
            scroll.destroy();
            html.remove();
        };

        return comp;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Detail = window.LampaYaniDetail = {create: create};
}(window));
