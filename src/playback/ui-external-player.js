(function (window) {
    'use strict';

    // Hands playback to something outside Lampa - an Android player app, the
    // YouTube app, YummyTV or the system browser - and restores the title card
    // and its focus when the viewer comes back.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var playbackReturnState = deps.playbackReturnState || {};
        var beginPlaybackNavigation = deps.beginPlaybackNavigation;
        var playbackReturnSnapshot = deps.playbackReturnSnapshot;
        var restorePlaybackInteraction = deps.restorePlaybackInteraction;
        var showPlaybackSelect = deps.showPlaybackSelect;
        var isAndroidTvPlatform = deps.isAndroidTvPlatform;
        var isExternalPlayableUrl = deps.isExternalPlayableUrl;

        var externalRestoreState = {
            pending: false,
            installed: false,
            session: 0,
            openedAt: 0,
            departed: false,
            controller: 'content',
            element: null,
            collection: null
        };

        function openExternalVideo(url, title, options) {
            options = options || {};
            url = options.youtubeIntent ? externalTrailerUrl(url) : LampaYaniUiUtils.normalizeVideoUrl(url);
            if (options.requireDirect && !isExternalPlayableUrl(url, options.source)) return false;
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
            // A plain https YouTube URL, not a hand-built `intent://...package=
            // com.google.android.youtube...end` string. That form only resolves if
            // whoever receives it calls Android's own `Intent.parseUri(url,
            // URI_INTENT_SCHEME)` before starting it; Lampa's native "open
            // browser" bridges instead do a plain `Uri.parse` + ACTION_VIEW, which
            // has no handler for a literal "intent" scheme and surfaces as "No
            // application can perform this action" - exactly the failure this was
            // written to work around. A verified https:// link needs none of that:
            // Android's own package manager already routes it to the installed
            // YouTube app via App Links, which is also how YummyTV opens trailers
            // (see ExternalIntentUtils.kt - a plain ACTION_VIEW + CATEGORY_BROWSABLE
            // on the unmodified URL, no intent-URI construction at all).
            if (options.youtubeIntent && openAndroidAppUri(url)) return true;
            return openExternalUri(url);
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
            if (!isAndroidTvPlatform()) return false;
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
            externalRestoreState.session = playbackReturnState.session;
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
            externalRestoreState.session = 0;
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
            if (!webViewReadyForFocus()) {
                waitForWebViewFocus();
                return;
            }
            // The active playback-return state is the state we must restore. Only
            // cancel when it was already completed or a newer playback session won.
            if (!playbackReturnState.active || playbackReturnState.session !== externalRestoreState.session) {
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
                if (!webViewReadyForFocus()) {
                    waitForWebViewFocus();
                    return;
                }
                if (!playbackReturnState.active || playbackReturnState.session !== externalRestoreState.session) {
                    cancelExternalRestore();
                    return;
                }
                var snapshot = {
                    controller: externalRestoreState.controller || 'content',
                    element: externalRestoreState.element,
                    collection: externalRestoreState.collection
                };
                cancelExternalRestore();
                restorePlaybackInteraction(snapshot, {timeout: 2400, interval: 120});
            }, delay);
        }

        function webViewReadyForFocus() {
            if (typeof document === 'undefined') return true;
            if (document.hidden) return false;
            try {
                if (typeof document.hasFocus === 'function' && !document.hasFocus()) return false;
            } catch (ignore) {}
            return true;
        }

        function waitForWebViewFocus() {
            setTimeout(function () {
                if (externalRestoreState.pending && webViewReadyForFocus()) restoreExternalFocus();
            }, 180);
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

        return {
            openExternalVideo: openExternalVideo,
            openExternalUri: openExternalUri,
            openAndroidAppUri: openAndroidAppUri,
            yummyTvEnabled: yummyTvEnabled,
            yummyTvAnimeId: yummyTvAnimeId,
            openYummyTv: openYummyTv,
            prepareExternalRestore: prepareExternalRestore,
            cancelExternalRestore: cancelExternalRestore,
            currentControllerName: currentControllerName,
            showExternalPlaybackOptions: showExternalPlaybackOptions
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.ExternalPlayer = window.LampaYaniExternalPlayer = {create: create};
}(window));
