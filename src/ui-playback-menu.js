(function (window) {
    'use strict';

    // Playback select windows, return-focus helpers, and the voice/episode menus.
    // Stream launch, Alloha policy, and player watchers stay in ui.js.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var showYummySelect = deps.showYummySelect || function () { return false; };
        var currentControllerName = deps.currentControllerName || function () { return 'content'; };
        var listActionTitle = deps.listActionTitle || function (card, key) { return key; };
        var openYummyDetail = deps.openYummyDetail || function () {};
        var commentsMenu = deps.commentsMenu || function () {};
        var openSettingsLogin = deps.openSettingsLogin || function () {};
        var addCardListBadge = deps.addCardListBadge || function () {};
        var syncCardOverlayLayout = deps.syncCardOverlayLayout || function () {};
        var getPlayback = deps.getPlayback || function () { return null; };
        var voiceOptionSubtitle = deps.voiceOptionSubtitle || function () { return ''; };
        var videoQualityLabel = deps.videoQualityLabel || function () { return ''; };
        var getPreferredPlayer = deps.getPreferredPlayer || function () { return ''; };
        var allohaIframeEnabled = deps.allohaIframeEnabled || function () { return false; };
        var groupPlaybackPriority = deps.groupPlaybackPriority || function () { return 0; };
        var videoPlaybackPriority = deps.videoPlaybackPriority || function () { return 0; };
        var playerMatchesPreference = deps.playerMatchesPreference || function () { return false; };
        var rememberPlayer = deps.rememberPlayer || function () {};
        var launchVideo = deps.launchVideo || function () {};
        var enrichEpisodeTitles = deps.enrichEpisodeTitles || function () { return Promise.resolve(); };
        var enrichVoiceOptionQuality = deps.enrichVoiceOptionQuality || function () {};
        var episodeOptionTitle = deps.episodeOptionTitle || function (card, video) {
            return String(video && (video.number || video.index) || '?');
        };
        var playbackTargetPreference = deps.playbackTargetPreference || function () { return 'ask'; };
        var androidExternalPlayerAvailable = deps.androidExternalPlayerAvailable || function () { return false; };
        var isPlaybackSourceEnabled = deps.isPlaybackSourceEnabled || function () { return true; };
        var playbackSourceId = deps.playbackSourceId || function () { return ''; };
        var openExternalPlayer = deps.openExternalPlayer || function () { return false; };
        var playInternalPlayer = deps.playInternalPlayer || function () { return false; };
        var yummyTvEnabled = deps.yummyTvEnabled || function () { return false; };
        var yummyTvAnimeId = deps.yummyTvAnimeId || function () { return ''; };
        var openYummyTv = deps.openYummyTv || function () { return false; };
        var loadVideos = deps.loadVideos || function (id, options) { return LampaYaniApi.videos(id, options); };

        var cancelExternalRestore = deps.cancelExternalRestore || function () {};
        var playbackSession = 0;
        var restoreTimer = null;
        var playbackReturnState = {
            active: false,
            session: 0,
            controller: 'content',
            element: null,
            collection: null
        };

        function videoSourceUrl(video) {
            if (!video) return '';
            var data = window.LampaYaniUiUtils && window.LampaYaniUiUtils.videoData
                ? window.LampaYaniUiUtils.videoData(video)
                : {};
            var normalize = window.LampaYaniUiUtils && window.LampaYaniUiUtils.normalizeVideoUrl
                ? window.LampaYaniUiUtils.normalizeVideoUrl
                : function (url) { return url || ''; };
            return normalize(video.yani_stream_url || data.yani_stream_url || video.iframe_url || video.url || video.player_url || video.link ||
                data.iframe_url || data.url || data.player_url || data.link);
        }

        function playerKey(group) {
            return String(group && (group.player || group.title) || '').toLowerCase();
        }

        function normalizeVoiceName(value) {
            return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
        }

        function lastWatchedVoice(voices, card) {
            var playback = card && (card.yani_resume || getPlayback(card.yani_id));
            if (!playback || !voices || !voices.length) return null;
            var videoId = playback.video_id ? String(playback.video_id) : '';
            var byVideo = videoId && voices.filter(function (voice) {
                return voice.group && voice.group.videos && voice.group.videos.some(function (video) {
                    return String(video.video_id || video.id || '') === videoId;
                });
            })[0];
            if (byVideo) return byVideo;
            var savedVoice = normalizeVoiceName(playback.voice);
            if (!savedVoice) return null;
            var named = voices.filter(function (voice) {
                return normalizeVoiceName(voice.group && voice.group.title) === savedVoice;
            });
            if (playback.player) {
                var withPlayer = named.filter(function (voice) {
                    return playerMatchesPreference(voice.group, playback.player);
                });
                if (withPlayer.length) return withPlayer[0];
            }
            return named[0] || null;
        }

        function markLastWatchedVoice(voices, card) {
            var last = lastWatchedVoice(voices, card);
            if (!last) return -1;
            last.selected = true;
            if (String(last.title || '').indexOf('▶ ') !== 0) last.title = '▶ ' + last.title;
            return voices.indexOf(last);
        }

        function beginPlaybackNavigation(element, collection) {
            // Temporary Select windows must not replace the detail controller and
            // focus target that need to be restored after playback.
            playbackSession += 1;
            playbackReturnState.session = playbackSession;
            if (restoreTimer) {
                clearTimeout(restoreTimer);
                restoreTimer = null;
            }
            cancelExternalRestore();
            if (playbackReturnState.active) return;
            var controller = currentControllerName() || 'content';
            if (controller === 'select') controller = 'content';
            var target = element && element.jquery ? element[0] : element;
            if (!target) target = document.querySelector('.selector.focus') || document.querySelector('.selector');
            var root = collection && collection.jquery ? collection : collection ? $(collection) : null;
            if ((!root || !root.length) && target) root = $(target).closest('.scroll, .yani-detail, .yani-home');
            playbackReturnState.active = true;
            playbackReturnState.controller = controller;
            playbackReturnState.element = target || null;
            playbackReturnState.collection = root && root.length ? root : null;
        }

        function playbackReturnSnapshot() {
            return {
                controller: playbackReturnState.controller || 'content',
                element: playbackReturnState.element,
                collection: playbackReturnState.collection
            };
        }

        function clearPlaybackReturn() {
            playbackReturnState.active = false;
            playbackReturnState.controller = 'content';
            playbackReturnState.element = null;
            playbackReturnState.collection = null;
        }

        function restorePlaybackInteraction(snapshot) {
            snapshot = snapshot && snapshot.controller ? snapshot : playbackReturnSnapshot();
            var session = playbackReturnState.session;
            if (restoreTimer) clearTimeout(restoreTimer);
            restoreTimer = setTimeout(function () {
                restoreTimer = null;
                if (playbackReturnState.session !== session || !playbackReturnState.active) return;
                try {
                    var controller = snapshot.controller && snapshot.controller !== 'select' ? snapshot.controller : 'content';
                    if (window.Lampa && Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle(controller);
                    var element = snapshot.element;
                    if (!element || !document.documentElement.contains(element)) {
                        element = document.querySelector('.yani-detail .selector.focus') ||
                            document.querySelector('.yani-detail .selector') ||
                            document.querySelector('.selector.focus') || document.querySelector('.selector');
                    }
                    var collection = snapshot.collection;
                    if (!collection || !collection.length || !document.documentElement.contains(collection[0])) {
                        collection = element ? $(element).closest('.scroll, .yani-detail, .yani-home') : $('body');
                    }
                    if (collection && collection.length && Lampa.Controller && Lampa.Controller.collectionSet) {
                        Lampa.Controller.collectionSet(collection);
                    }
                    if (element && Lampa.Controller && Lampa.Controller.collectionFocus) {
                        Lampa.Controller.collectionFocus(element, collection);
                    }
                } catch (error) {
                    console.warn('[YummyAnime] Could not restore playback navigation', error);
                } finally {
                    if (playbackReturnState.session === session) clearPlaybackReturn();
                }
            }, 0);
        }

        function showPlaybackSelect(params) {
            if (!window.Lampa || !Lampa.Select || !Lampa.Select.show) {
                restorePlaybackInteraction();
                return false;
            }
            params = Object.assign({}, params || {});
            var settled = false;
            var originalBack = params.onBack;
            var originalSelect = params.onSelect;
            // Some Lampa builds close Select by calling onBack even after a
            // choice. That used to restore the title card and kill the next
            // voice / episode / player window.
            params.onSelect = function (item) {
                settled = true;
                if (originalSelect) originalSelect(item);
            };
            params.onBack = function () {
                if (settled) return;
                if (originalBack) originalBack();
                restorePlaybackInteraction();
            };
            // Chained voice/episode/player windows own return focus themselves.
            params.yaniRestore = false;
            showYummySelect(params);
            return true;
        }

        function showYummyActions(card, originElement, originCollection) {
            if (!card || !card.yani_id) return;
            var originNode = originElement && originElement.jquery ? originElement[0] : originElement;
            var navigation = {
                controller: 'content',
                element: originNode || null,
                collection: originCollection && originCollection.length ? originCollection : null
            };
            var items = [
                {title: t('watch'), action: 'watch'},
                {title: t('yummy_details'), action: 'details'},
                {title: t('comments'), action: 'comments'}
            ];
            if (window.LampaYaniAuth && LampaYaniAuth.token()) {
                items = items.concat([
                    {title: t('favorite'), action: 'favorite'},
                    {title: listActionTitle(card, 'watching'), action: 'watching'},
                    {title: listActionTitle(card, 'planned'), action: 'planned'},
                    {title: listActionTitle(card, 'completed'), action: 'completed'},
                    {title: listActionTitle(card, 'dropped'), action: 'dropped'},
                    {title: listActionTitle(card, 'postponed'), action: 'postponed'}
                ], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (value) {
                    return {title: value + '/10', value: value};
                }));
            } else {
                items.push({title: t('login_name'), action: 'login'});
            }

            showYummySelect({
                title: t('actions'),
                items: items,
                onSelect: function (item) {
                    if (item.action === 'watch') {
                        beginPlaybackNavigation(originElement, originCollection);
                        return openVideos(card);
                    }
                    if (item.action === 'details') return openYummyDetail(card, false);
                    if (item.action === 'comments') return commentsMenu(card.yani_id, 0, [], navigation);
                    if (item.action === 'login') return openSettingsLogin();
                    if (!window.LampaYaniAuth || !LampaYaniAuth.token()) return Lampa.Noty.show(t('login_required'));
                    var action = item.action === 'favorite' ? LampaYaniApi.addFavorite(card.yani_id) : item.action ? LampaYaniApi.addToList(card.yani_id, item.action) : LampaYaniApi.rate(card.yani_id, item.value);
                    action.then(function () {
                        if (item.action === 'favorite') card.yani_is_favorite = true;
                        else if (item.action) card.yani_list_id = {watching: 0, planned: 1, completed: 2, dropped: 3, postponed: 5}[item.action];
                        addCardListBadge(null, card);
                        syncCardOverlayLayout(null, card);
                        Lampa.Noty.show(t('saved'));
                    }).catch(function (error) {
                        console.error('[YummyAnime]', error);
                        Lampa.Noty.show(t('save_error'));
                    });
                }
            }, navigation);
        }

        function isAbortError(error) {
            return Boolean(error && (error.name === 'AbortError' || /aborted/i.test(String(error && error.message || ''))));
        }

        function loadVideosForPlayback(id) {
            return loadVideos(id).catch(function (error) {
                if (!isAbortError(error)) throw error;
                return loadVideos(id);
            });
        }

        function openVideos(card, resume) {
            beginPlaybackNavigation();
            if (!card || !card.yani_id) {
                Lampa.Noty.show(t('no_videos'));
                restorePlaybackInteraction();
                return;
            }
            if (Lampa.Loading && Lampa.Loading.start) Lampa.Loading.start();
            enrichEpisodeTitles(card);

            loadVideosForPlayback(card.yani_id).then(function (payload) {
                if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
                var videos = payload && payload.response ? payload.response : payload;
                videos = (Array.isArray(videos) ? videos : []).filter(function (video) {
                    return video && videoSourceUrl(video);
                });
                videos.forEach(function (video) {
                    // Keep one normalized field for all player implementations.
                    video.iframe_url = videoSourceUrl(video);
                });
                if (!videos.length) {
                    Lampa.Noty.show(t('no_videos'));
                    restorePlaybackInteraction();
                    return;
                }

                var groups = {};
                videos.forEach(function (video) {
                    var data = LampaYaniUiUtils.videoData(video);
                    var title = data.dubbing || data.player || t('source');
                    var quality = videoQualityLabel(video);
                    var key = title + '|' + String(data.player_id || data.player || '') + '|' + quality;
                    if (!groups[key]) groups[key] = {title: title, player: data.player || '', quality: quality, source: LampaYaniUiUtils.videoHost(videoSourceUrl(video)), videos: []};
                    groups[key].videos.push(video);
                });

                var voices = Object.keys(groups).map(function (key) {
                    var group = groups[key];
                    var sourceName = group.player && group.player !== group.title ? group.player : '';
                    return {
                        title: group.title + (sourceName ? ' · ' + sourceName : ''),
                        subtitle: voiceOptionSubtitle(group),
                        group: group
                    };
                }).filter(function (voice) {
                    return isPlaybackSourceEnabled(playbackSourceId(voice.group));
                });
                if (!voices.length) {
                    Lampa.Noty.show(t('no_enabled_sources'));
                    restorePlaybackInteraction();
                    return;
                }
                var preferredPlayer = getPreferredPlayer();
                voices.sort(function (a, b) {
                    if (!allohaIframeEnabled()) {
                        var playableA = groupPlaybackPriority(a.group);
                        var playableB = groupPlaybackPriority(b.group);
                        if (playableA !== playableB) return playableB - playableA;
                    }
                    var preferredA = playerMatchesPreference(a.group, preferredPlayer) ? 1 : 0;
                    var preferredB = playerMatchesPreference(b.group, preferredPlayer) ? 1 : 0;
                    return preferredB - preferredA || a.title.localeCompare(b.title);
                });
                if (voices.length && playerMatchesPreference(voices[0].group, preferredPlayer)) voices[0].title = '★ ' + voices[0].title;

                if (resume) {
                    var playback = card.yani_resume || getPlayback(card.yani_id);
                    var resumeVoice = playback && voices.filter(function (voice) {
                        if (playback.video_id && voice.group.videos.some(function (video) {
                            return String(video.video_id || video.id || '') === String(playback.video_id);
                        })) return true;
                        return playerMatchesPreference(voice.group, playback.player);
                    })[0];
                    var resumeVideo = resumeVoice && resumeVoice.group.videos.filter(function (video) {
                        if (playback.video_id && String(video.video_id || video.id || '') === String(playback.video_id)) return true;
                        return String(video.number || video.index || '') === String(playback.number || '');
                    })[0];
                    if (resumeVideo) {
                        resumeVideo.watched = resumeVideo.watched || {};
                        resumeVideo.watched.end_time = Math.max(Number(resumeVideo.watched.end_time || 0), Number(playback.time || 0));
                        if (!resumeVideo.duration && playback.duration) resumeVideo.duration = Number(playback.duration);
                        rememberPlayer(resumeVoice.group);
                        return launchVideo(card, resumeVoice.group, resumeVoice.group.videos, resumeVideo);
                    }
                }

                if (voices.length === 1) {
                    rememberPlayer(voices[0].group);
                    enrichEpisodeTitles(card, voices[0].group);
                    return chooseEpisode(card, voices[0].group);
                }
                var selectedVoice = markLastWatchedVoice(voices, card);
                showPlaybackSelect({
                    title: t('choose_voice'),
                    items: voices,
                    selected: selectedVoice >= 0 ? selectedVoice : 0,
                    onFocus: enrichVoiceOptionQuality,
                    onSelect: function (item) {
                        rememberPlayer(item.group);
                        enrichEpisodeTitles(card, item.group);
                        chooseEpisode(card, item.group);
                    }
                });
            }).catch(function (error) {
                if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
                console.error('[YummyAnime Videos]', error);
                Lampa.Noty.show(t('videos_load_error'));
                restorePlaybackInteraction();
            });
        }

        function chooseEpisode(card, group) {
            var videos = group.videos.slice().sort(function (a, b) {
                if (!allohaIframeEnabled()) {
                    var playableA = videoPlaybackPriority(a, group);
                    var playableB = videoPlaybackPriority(b, group);
                    if (playableA !== playableB) return playableB - playableA;
                }
                var numberA = parseFloat(a.number);
                var numberB = parseFloat(b.number);
                if (isFinite(numberA) && isFinite(numberB)) return numberA - numberB;
                return Number(a.index || 0) - Number(b.index || 0);
            });
            var episodes = videos.map(function (video) {
                return {title: episodeOptionTitle(card, video), video: video};
            });
            if (episodes.length === 1) return launchVideo(card, group, videos, videos[0]);
            showPlaybackSelect({
                title: t('choose_episode') + ' · ' + group.title,
                items: episodes,
                onSelect: function (item) { launchVideo(card, group, videos, item.video); }
            });
        }

        function showDirectPlaybackOptions(card, current, playlist, options) {
            // An automatic episode change must never interrupt viewing with a
            // dialog: playback simply continues where it already was.
            var target = options && options.autoAdvance ? 'internal' : playbackTargetPreference();
            var canExternal = androidExternalPlayerAvailable();
            if (target === 'external' && !canExternal) target = 'internal';
            if (target === 'external') return openExternalPlayer(current, playlist, card);
            if (target === 'internal') {
                if (playInternalPlayer(current, playlist)) return true;
                Lampa.Noty.show(t('internal_player_unavailable'));
                restorePlaybackInteraction();
                return true;
            }
            if (!Lampa.Select || !Lampa.Select.show) return false;
            // Android-only: external players are APK intents. Tizen / WebOS / browsers
            // should not be offered an option that cannot work on those platforms.
            var items = [];
            if (canExternal) {
                items.push({title: t('watch_external_player'), subtitle: t('watch_external_player_description'), action: 'external'});
            }
            items.push({title: t('watch_internal_lampa'), subtitle: t('watch_internal_lampa_description'), action: 'internal'});
            if (items.length === 1) {
                if (playInternalPlayer(current, playlist)) return true;
                Lampa.Noty.show(t('internal_player_unavailable'));
                restorePlaybackInteraction();
                return true;
            }
            showPlaybackSelect({
                title: t('choose_playback'),
                items: items,
                onSelect: function (item) {
                    if (item && item.action === 'internal') {
                        if (playInternalPlayer(current, playlist)) return;
                        Lampa.Noty.show(t('internal_player_unavailable'));
                        restorePlaybackInteraction();
                        return;
                    }
                    if (openExternalPlayer(current, playlist, card)) return;
                    if (playInternalPlayer(current, playlist)) return;
                    Lampa.Noty.show(current.url);
                    restorePlaybackInteraction();
                }
            });
            return true;
        }

        function openTitlePlaybackOptions(card) {
            var yummyTvUrl = yummyTvEnabled() ? LampaYaniUiUtils.yummyTvDetailsUrl(yummyTvAnimeId(card)) : '';
            if (!yummyTvUrl || !Lampa.Select || !Lampa.Select.show) {
                openVideos(card, false);
                return;
            }

            showPlaybackSelect({
                title: t('choose_playback'),
                items: [
                    {title: t('watch_in_player'), subtitle: t('watch_in_player_description'), action: 'player'},
                    {title: t('watch_in_yummytv'), subtitle: t('watch_in_yummytv_description'), action: 'yummytv'}
                ],
                onSelect: function (item) {
                    if (item && item.action === 'yummytv') {
                        if (!openYummyTv(card)) restorePlaybackInteraction();
                        return;
                    }
                    openVideos(card, false);
                }
            });
        }

        return {
            playbackReturnState: playbackReturnState,
            videoSourceUrl: videoSourceUrl,
            playerKey: playerKey,
            beginPlaybackNavigation: beginPlaybackNavigation,
            playbackReturnSnapshot: playbackReturnSnapshot,
            clearPlaybackReturn: clearPlaybackReturn,
            restorePlaybackInteraction: restorePlaybackInteraction,
            showPlaybackSelect: showPlaybackSelect,
            showYummyActions: showYummyActions,
            openVideos: openVideos,
            chooseEpisode: chooseEpisode,
            showDirectPlaybackOptions: showDirectPlaybackOptions,
            openTitlePlaybackOptions: openTitlePlaybackOptions
        };
    }

    window.LampaYaniPlaybackMenu = {create: create};
}(window));
