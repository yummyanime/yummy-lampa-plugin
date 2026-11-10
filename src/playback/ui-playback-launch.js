(function (window) {
    'use strict';

    // Starts an episode: resolves its stream, follows the Alloha and
    // embedded-page policies, and hands it to the internal Lampa player,
    // the webOS system player or an external one.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var videoData = deps.videoData;
        var findStandardLampaCard = deps.findStandardLampaCard;
        var playbackReturnState = deps.playbackReturnState;
        var videoSourceUrl = deps.videoSourceUrl;
        var playbackReturnSnapshot = deps.playbackReturnSnapshot;
        var restorePlaybackInteraction = deps.restorePlaybackInteraction;
        var showPlaybackSelect = deps.showPlaybackSelect;
        var showDirectPlaybackOptions = deps.showDirectPlaybackOptions;
        var rememberPlayback = deps.rememberPlayback;
        var syncServerProgress = deps.syncServerProgress;
        var openExternalUri = deps.openExternalUri;
        var openAndroidAppUri = deps.openAndroidAppUri;
        var showExternalPlaybackOptions = deps.showExternalPlaybackOptions;
        var openExternalVideo = deps.openExternalVideo;
        var prepareExternalRestore = deps.prepareExternalRestore;
        var cancelExternalRestore = deps.cancelExternalRestore;
        var isAndroidPlatform = deps.isAndroidPlatform;
        var isWebOsPlatform = deps.isWebOsPlatform;
        var playbackWatcherApi = deps.playbackWatcherApi;
        var stopPlaybackWatcher = deps.stopPlaybackWatcher;
        var flushPlaybackProgress = deps.flushPlaybackProgress;
        var destroySkipPrompt = deps.destroySkipPrompt;
        var autoNextEnabled = deps.autoNextEnabled;
        var startPlaybackWatcher = deps.startPlaybackWatcher;
        var videoStreamHeaders = deps.videoStreamHeaders;
        var videoStreamQualities = deps.videoStreamQualities;
        var isExternalPlayableUrl = deps.isExternalPlayableUrl;
        var externalPlayablePlaylist = deps.externalPlayablePlaylist;
        var isAllohaUrl = deps.isAllohaUrl;
        var isVkPlaybackSource = deps.isVkPlaybackSource;
        var isSibnetPlaybackSource = deps.isSibnetPlaybackSource;
        var isCvhPlaybackSource = deps.isCvhPlaybackSource;

        // Stream sources that already carry a direct Alloha stream and must not be
        // routed through the Alloha policy a second time.
        var ALLOHA_RESOLVED_SOURCES = ['lampac-alloha', 'yani-resolver'];
        var lampaHistoryPending = {};

        function lampaHistoryEnabled() {
            if (!Lampa.Storage || !Lampa.Storage.get) return true;
            var value = Lampa.Storage.get('yani_add_to_lampa_history', true);
            return value !== false && value !== 'false' && value !== 0 && value !== '0';
        }

        function addToLampaHistory(card) {
            if (!lampaHistoryEnabled() || !card || !card.yani_id || !Lampa.Favorite || !Lampa.Favorite.add) return;
            var key = String(card.yani_id);
            if (lampaHistoryPending[key]) return;

            // Lampa history must contain a real native card. Saving a YummyAnime id
            // as if it were a TMDB id creates a history item that cannot be opened.
            // Resolve in the background so starting playback is never delayed.
            lampaHistoryPending[key] = Promise.resolve().then(function () {
                return findStandardLampaCard(card);
            }).then(function (match) {
                if (!lampaHistoryEnabled() || !match || !match.card || !match.card.id) return;
                var nativeCard = Object.assign({}, match.card);
                nativeCard.source = nativeCard.source || 'tmdb';
                Lampa.Favorite.add('history', nativeCard);
            }).catch(function (error) {
                console.warn('[YummyAnime] Could not add title to Lampa history', error);
            }).then(function () {
                delete lampaHistoryPending[key];
            });
        }

        function launchVideo(card, group, videos, selected, options) {
            if (card && card.yani_id && selected) videoData.retain(card.yani_id, selected);
            options = options || {};
            var url = videoSourceUrl(selected);
            if (!url) {
                Lampa.Noty.show(t('no_videos'));
                restorePlaybackInteraction();
                return;
            }
            var allohaPageUrl = selected.yani_alloha_iframe_url || (isAllohaUrl(selected.iframe_url) ? selected.iframe_url : url);
            var allohaSource = isAllohaUrl(allohaPageUrl) || /alloha/i.test(String(group && (group.player || group.title) || ''));
            var resolvedAlloha = ALLOHA_RESOLVED_SOURCES.indexOf(String(selected.yani_stream_source || '').toLowerCase()) >= 0;
            if (allohaSource && (!resolvedAlloha || !options.autoAdvance)) {
                return launchAllohaPlayer(card, group, selected, allohaPageUrl, options);
            }
            // Sibnet protects the extracted MP4 with a Referer check that Lampa's
            // built-in <video> cannot satisfy - it signs every request with the
            // Lampa page - and no engine of Lampa's on any platform turned out to
            // send headers instead. So the official embedded page is the one route
            // that actually shows the video: it supplies the header for its own
            // stream. Its play button needs a pointer or a press that reaches the
            // page, which the focus handover in the player component is for.
            var sibnetPageUrl = selected.iframe_url || url;
            if (isSibnetPlaybackSource(sibnetPageUrl, group)) {
                return openEmbeddedEpisode(card, group, selected, sibnetPageUrl);
            }
            if (!isExternalPlayableUrl(url, selected) && window.LampaYaniStreamResolver && LampaYaniStreamResolver.canResolve(url)) {
                selected.yani_stream_origin = url;
                setLoading(true);
                LampaYaniStreamResolver.resolve(url, selected).then(function (result) {
                    setLoading(false);
                    if (result && result.url) {
                        selected.yani_stream_url = result.url;
                        selected.yani_stream_quality = result.quality || '';
                        selected.yani_stream_qualities = result.qualities || null;
                        selected.yani_stream_source = result.source || '';
                        selected.yani_stream_headers = result.headers || null;
                        selected.yani_stream_headers_required = Boolean(result.headersRequired);
                    }
                    launchResolvedVideo(card, group, videos, selected, videoSourceUrl(selected) || url, options);
                }).catch(function (error) {
                    setLoading(false);
                    console.warn('[YummyAnime] Stream resolve failed', error);
                    if (isVkPlaybackSource(url, group)) {
                        Lampa.Noty.show(t('vk_stream_unavailable'));
                        restorePlaybackInteraction();
                        return;
                    }
                    if (isCvhPlaybackSource(url, group)) {
                        Lampa.Noty.show(t(error && error.code === 'CVH_REGION_BLOCKED' ? 'cvh_region_blocked' : 'cvh_stream_unavailable'));
                        restorePlaybackInteraction();
                        return;
                    }
                    launchResolvedVideo(card, group, videos, selected, url, options);
                });
                return;
            }
            launchResolvedVideo(card, group, videos, selected, url, options);
        }

        function launchResolvedVideo(card, group, videos, selected, url, options) {
            options = options || {};
            var title = (card.title || 'YummyAnime') + ' · ' + t('episode') + ' ' + (selected.number || selected.index || '?') + ' · ' + group.title;
            if (!options.recovery) {
                selected.yani_internal_recovery = 0;
                selected.yani_internal_recovery_total = 0;
                // Lampa's internal player starts from `timeline.time` only and
                // ignores the playlist item's `time`, so an episode opened from the
                // title card always began at zero. The playback watcher seeks to the
                // saved position itself once the stream reports its duration.
                selected.yani_resume_seek = Math.max(0, Math.floor(Number(selected.watched && selected.watched.end_time || 0)));
                selected.yani_resume_kind = 'history';
            }
            playbackWatcherApi.setContext({card: card, group: group, videos: videos, selected: selected});
            rememberPlayback(card, group, selected);
            addToLampaHistory(card);
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

        function launchAllohaDirect(card, group, selected, url, chain, options) {
            setLoading(true);
            resolveInOrder(chain).then(function (result) {
                setLoading(false);
                selected.yani_stream_url = result.url;
                selected.yani_stream_quality = result.quality || '';
                selected.yani_stream_qualities = result.qualities || null;
                selected.yani_stream_headers = result.headers || null;
                selected.yani_stream_headers_required = Boolean(result.headersRequired);
                selected.yani_stream_source = result.source || 'lampac-alloha';
                launchResolvedVideo(card, group, group.videos || [selected], selected, result.url, options);
            }).catch(function (error) {
                setLoading(false);
                console.warn('[YummyAnime] Alloha resolve failed; playback blocked', error);
                blockAllohaPlayback(card, group, selected, url);
            });
            return true;
        }

        function launchAllohaPlayer(card, group, selected, url, options) {
            options = options || {};
            if (selected && isAllohaUrl(url)) selected.yani_alloha_iframe_url = url;
            var chain = allohaResolvers(card, group, selected, url);
            var webAvailable = allohaIframeEnabled();
            if (!chain.length) return blockAllohaPlayback(card, group, selected, url);

            // Auto-next must stay uninterrupted. The direct resolver is the only
            // Alloha route that can preserve Lampa's playlist and progress model.
            if (options.autoAdvance || !webAvailable) {
                return launchAllohaDirect(card, group, selected, url, chain, options);
            }

            var shown = showPlaybackSelect({
                title: t('alloha_playback_title'),
                items: [
                    {
                        title: t('alloha_watch_lampa'),
                        subtitle: t('alloha_watch_lampa_description'),
                        action: 'direct'
                    },
                    {
                        title: t('alloha_watch_web'),
                        subtitle: t('alloha_watch_web_description'),
                        action: 'web'
                    }
                ],
                onSelect: function (item) {
                    if (item && item.action === 'web') {
                        openAllohaWebPlayer(card, group, selected, url);
                        return;
                    }
                    launchAllohaDirect(card, group, selected, url, chain, options);
                }
            });
            if (!shown) return launchAllohaDirect(card, group, selected, url, chain, options);
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
            if (url && allohaIframeEnabled() && openAllohaWebPlayer(card, group, selected, url)) return true;
            Lampa.Noty.show(t('alloha_direct_required'));
            restorePlaybackInteraction();
            return true;
        }

        function acknowledgeAllohaWebNotice() {
            if (!Lampa.Storage || !Lampa.Storage.get || !Lampa.Storage.set) return;
            if (Lampa.Storage.get('yani_alloha_web_notice_seen', false)) return;
            Lampa.Storage.set('yani_alloha_web_notice_seen', true);
            Lampa.Noty.show(t('alloha_web_player_notice'));
        }

        function openAllohaWebPlayer(card, group, selected, url) {
            acknowledgeAllohaWebNotice();
            return openAllohaEmbed(card, group, selected, url);
        }

        function openEmbeddedEpisode(card, group, selected, url) {
            if (!url || !Lampa.Activity || !Lampa.Activity.push) return false;
            try {
                rememberPlayback(card, group, selected);
                addToLampaHistory(card);
                // The embedded site player is still a watch, so the account has to
                // learn about it like it does for the internal and external ones.
                // Only the start can be reported: the page plays inside an iframe
                // this plugin cannot read a position from.
                syncServerProgress(selected);
                // AniSkip can control only Lampa's own video element. Embedded
                // pages are cross-origin, so remove the unusable old prompt.
                stopPlaybackWatcher();
                destroySkipPrompt();
                Lampa.Activity.push({
                    url: 'yani/player',
                    title: (card && card.title || 'YummyAnime') + ' · ' + t('episode') + ' ' + ((selected && (selected.number || selected.index)) || '?'),
                    component: 'yani_player',
                    iframe_url: url,
                    return_snapshot: playbackReturnSnapshot()
                });
                return true;
            } catch (error) {
                console.warn('[YummyAnime] Embedded player failed to open', error);
                return false;
            }
        }

        /**
         * Alloha's player page starts paused and waits for a click on its own play
         * button - which a remote cannot deliver, because the page lives in a
         * cross-origin iframe nothing here can reach into. It does read `autoplay`
         * out of the query string into its own settings, so asking for it up front
         * is what makes the embedded page usable without a pointer.
         */
        function allohaAutoplayUrl(url) {
            var value = String(url || '');
            if (!value || /[?&]autoplay=/i.test(value)) return value;
            return value + (value.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
        }

        /**
         * Wraps the player address in the project's own bridge page.
         *
         * Alloha answers 404 to a request carrying no referrer, and Lampa's Android
         * app serves its interface locally, so an iframe opened straight from the
         * app arrives with an empty referrer - the viewer is told the content does
         * not exist. Which referrer it is does not matter, so a static page on the
         * same Pages site that serves this plugin is enough to stand between them.
         * No server anyone has to run.
         */
        function allohaEmbedUrl(url) {
            var target = allohaAutoplayUrl(url);
            var bridge = window.LampaYaniConfig && LampaYaniConfig.allohaEmbedUrl;
            if (!target || !bridge) return target;
            return bridge + '?url=' + encodeURIComponent(target);
        }

        function openAllohaEmbed(card, group, selected, url) {
            return openEmbeddedEpisode(card, group, selected, allohaEmbedUrl(url));
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

        function videoResolverUrl(video) {
            if (!video) return '';
            var data = LampaYaniUiUtils.videoData(video);
            var normalize = LampaYaniUiUtils.normalizeVideoUrl || function (url) { return url || ''; };
            return normalize(video.yani_stream_origin || video.iframe_url || video.url || video.player_url || video.link ||
                data.iframe_url || data.url || data.player_url || data.link);
        }

        function internalPlayerExtensionHint(item) {
            if (!isAndroidPlatform() || !item) return '';
            if (isVkPlaybackSource(item.url, item.source)) {
                return /\.m3u8(?:[?#]|$)/i.test(String(item.url || '')) ? 'm3u8' : 'mp4';
            }
            return isCvhPlaybackSource(item.url, item.source) ? 'mp4' : '';
        }

        function markAndroidDirectVideoUrl(url, extensionHint) {
            url = String(url || '');
            if (!url || !extensionHint || !isAndroidPlatform() || /(?:#|&)yani\.(?:mp4|m3u8)(?:&|$)/i.test(url)) return url;
            return url + (url.indexOf('#') >= 0 ? '&' : '#') + 'yani.' + extensionHint;
        }

        function markAndroidDirectVideoQualities(qualities, extensionHint) {
            if (!qualities || typeof qualities !== 'object' || !extensionHint) return qualities;
            var marked = {};
            Object.keys(qualities).forEach(function (label) {
                var value = qualities[label];
                if (typeof value !== 'string') {
                    marked[label] = value;
                    return;
                }
                var qualityExtension = extensionHint === 'm3u8'
                    ? (/\.m3u8(?:[?#]|$)/i.test(value) ? 'm3u8' : 'mp4')
                    : extensionHint;
                marked[label] = markAndroidDirectVideoUrl(value, qualityExtension);
            });
            return marked;
        }

        function isAndroidDirectVideoUrl(src) {
            src = String(src || '');
            return isAndroidPlatform() &&
                /^https?:\/\/[^/?#]*okcdn\.ru(?:[/?#]|$)/i.test(src) &&
                /(?:#|&)yani\.(?:mp4|m3u8)(?:&|$)/i.test(src);
        }

        function registerAndroidDirectVideoTube() {
            if (window.LampaYaniAndroidDirectVideoTube) return true;
            if (!window.Lampa || !Lampa.PlayerVideo || typeof Lampa.PlayerVideo.registerTube !== 'function') return false;

            var tube = {
                name: 'YummyAnime Android direct video',
                verify: function (src) {
                    return isAndroidDirectVideoUrl(src);
                },
                create: function (callback) {
                    // CVH and VK CDN responses do not include Access-Control-Allow-Origin.
                    // Lampa's default crossorigin attribute makes Android WebView
                    // reject those streams, so this source uses a plain video tag.
                    var element = $('<video class="player-video__video" poster="./img/video_poster.png"></video>');
                    callback(element[0]);
                    return element;
                }
            };

            Lampa.PlayerVideo.registerTube(tube);
            window.LampaYaniAndroidDirectVideoTube = tube;
            return true;
        }

        function internalPlayerPlaylistItem(item) {
            if (!item) return null;
            var extensionHint = internalPlayerExtensionHint(item);
            var quality = item.quality || videoStreamQualities(item.source);
            var sourceUrl = markAndroidDirectVideoUrl(item.url, extensionHint);
            quality = markAndroidDirectVideoQualities(quality, extensionHint);
            return LampaYaniUiUtils.internalPlayerItem({
                title: item.title,
                url: sourceUrl,
                time: item.time,
                quality: quality,
                headers: item.headers || videoStreamHeaders(item.source),
                poster: item.poster || '',
                extensionHint: extensionHint,
                extension: extensionHint,
                mime: extensionHint === 'mp4' ? 'video/mp4' : extensionHint === 'm3u8' ? 'application/vnd.apple.mpegurl' : ''
            });
        }

        // Headers only matter where a player can actually send them, which on this
        // plugin's platforms means Android. Elsewhere the built-in engine stays the
        // right choice, headers or not.
        /**
         * Warns when a stream asks for request headers the chosen player may not
         * send. Sibnet is the case that made this necessary: its file is guarded by
         * a referrer check, and Lampa's built-in engine is a <video> element, which
         * signs every request with the Lampa page instead - the file then comes back
         * refused and the screen fills with noise and "video not found", which reads
         * as a broken plugin rather than as a source that needs a different player.
         *
         * The choice of player stays with the viewer; this only makes the trade-off
         * visible instead of letting them meet it as a failure.
         */
        function warnAboutRequestHeaders(item) {
            if (!needsRequestHeaders(item)) return;
            if (!Lampa.Noty || !Lampa.Noty.show) return;
            Lampa.Noty.show(t('internal_player_headers_warning'));
        }

        // True only for a stream the resolver marked as unplayable without its
        // headers. Merely carrying headers is not that: CVH and VK results carry a
        // User-Agent, sometimes a Referer, and play fine in a <video> without them.
        // Treating any header as a requirement is what broke both of them.
        function needsRequestHeaders(item) {
            if (!item) return false;
            if (item.headersRequired) return true;
            var source = item.source;
            return Boolean(source && source.yani_stream_headers_required);
        }

        function playInternalDirectVideo(current, playlist) {
            if (!Lampa.Player || !Lampa.Player.play || !Lampa.Player.runas) return false;
            var callbackContext = playbackWatcherApi.context();
            var callbackSession = playbackReturnState.session;
            var directPlaylist = (playlist || []).filter(function (item) { return isExternalPlayableUrl(item.url, item.source); })
                .map(internalPlayerPlaylistItem).filter(Boolean);
            var normalizedCurrent = internalPlayerPlaylistItem(current);
            var directCurrent = normalizedCurrent && directPlaylist.filter(function (item) { return item.url === normalizedCurrent.url; })[0] || normalizedCurrent;
            if (!directCurrent) return false;
            if (!directPlaylist.length) directPlaylist = [directCurrent];
            try {
                // Lampa.Player.play follows the globally configured player unless
                // the caller explicitly selects the built-in Lampa engine.
                //
                // That engine is a <video> in the WebView, and a <video> cannot send
                // request headers: it signs every request with the Lampa page as the
                // referrer. Sibnet checks the referrer and answers 403, which the
                // element reports as an unplayable file. The same URL and headers
                // play fine in a native player, so a stream that states headers is
                // left to whichever engine the platform provides instead of being
                // forced into the one that must fail. Streams without headers - CVH,
                // VK, Kodik - keep using the built-in engine exactly as before.
                Lampa.Player.runas('lampa');
                Lampa.Player.play(directCurrent);
                if (Lampa.Player.playlist) Lampa.Player.playlist(directPlaylist);
                if (Lampa.Player.callback) {
                    Lampa.Player.callback(function () {
                        flushPlaybackProgress(true, callbackContext);
                        // Closing the previous episode during auto-next invokes its
                        // callback after a new playback session has begun. That old
                        // callback must not restore the detail focus over the next
                        // episode's player.
                        if (playbackReturnState.session !== callbackSession) return;
                        // Player.callback can fire before Lampa finishes removing its
                        // player controller. Verify the detail focus after that lifecycle.
                        restorePlaybackInteraction(null, {timeout: 2400, interval: 120});
                    });
                }
                return true;
            } catch (error) {
                console.warn('[YummyAnime] Internal Lampa player failed to start', error);
                return false;
            }
        }

        /**
         * Plays a stream in the LG system player (com.webos.app.photovideo).
         *
         * Lampa launches it itself when asked to `runas('webos')`, and the only
         * thing it passes along besides the address is `timeline.time` as the start
         * position - so the timeline is filled here, or every episode would start
         * from zero. The player is a separate app: nothing in it can be observed,
         * so auto-next, intro skipping and progress recording do not happen there.
         *
         * CVH and VK sign their links for the User-Agent that requested them, and
         * the system player fetches with its own, so those two keep the built-in
         * player instead of opening into an error.
         */
        function openWebOsPlayer(current, playlist, card) {
            if (!Lampa.Player || !Lampa.Player.play || !Lampa.Player.runas || !current || !current.url) return false;
            var playbackContext = playbackWatcherApi.context();
            var group = playbackContext && playbackContext.group;
            var origin = current.source ? videoResolverUrl(current.source) : '';
            if (isCvhPlaybackSource(origin || current.url, group) || isVkPlaybackSource(origin || current.url, group)) {
                if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(t('webos_player_internal_only'));
                return playInternalPlayer(current, playlist);
            }
            var item = internalPlayerPlaylistItem(current);
            if (!item) return false;
            var time = Math.max(0, Number(current.time || 0));
            var duration = Math.max(0, Number(current.source && current.source.duration || 0));
            item.timeline = {
                hash: 'yani_' + String(card && card.yani_id || '') + '_' + String(current.source && (current.source.number || current.source.index) || ''),
                time: time,
                duration: duration,
                percent: duration > 0 ? Math.round(time / duration * 100) : 0
            };
            try {
                prepareExternalRestore();
                Lampa.Player.runas('webos');
                Lampa.Player.play(item);
                return true;
            } catch (error) {
                cancelExternalRestore();
                console.warn('[YummyAnime] The webOS player could not be opened', error);
                return false;
            }
        }

        function openExternalPlayer(current, playlist, card) {
            if (isWebOsPlatform()) return openWebOsPlayer(current, playlist, card);
            if (!isAndroidPlatform()) return false;
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
            // Lampa's player also auto-plays the next playlist item when a video
            // ends. If this plugin already owns auto-next, a multi-item playlist
            // would skip one extra episode.
            var items = autoNextEnabled() && current ? [current] : playlist;
            var started = isExternalPlayableUrl(current && current.url, current && current.source) && playInternalDirectVideo(current, items);
            if (started) {
                warnAboutRequestHeaders(current);
                startPlaybackWatcher(playbackWatcherApi.context());
            }
            return started;
        }

        return {
            launchVideo: launchVideo,
            launchResolvedVideo: launchResolvedVideo,
            allohaIframeEnabled: allohaIframeEnabled,
            acknowledgeAllohaWebNotice: acknowledgeAllohaWebNotice,
            videoResolverUrl: videoResolverUrl,
            registerAndroidDirectVideoTube: registerAndroidDirectVideoTube,
            openExternalPlayer: openExternalPlayer,
            playInternalPlayer: playInternalPlayer
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.PlaybackLaunch = window.LampaYaniPlaybackLaunch = {create: create};
}(window));
