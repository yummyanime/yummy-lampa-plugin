(function (window) {
    'use strict';

    function isYouTubeTrailer(url) {
        return Boolean(youtubeVideoId(url));
    }

    function youtubeVideoId(url) {
        url = String(url || '').trim();
        if (/^[\w-]{11}$/.test(url)) return url;
        try {
            var parsed = new URL(url.indexOf('//') === 0 ? 'https:' + url : url);
            var host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '');
            if (host === 'youtu.be') return parsed.pathname.replace(/^\/+/, '').split('/')[0] || '';
            if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
                if (parsed.searchParams.get('v')) return parsed.searchParams.get('v');
                var path = parsed.pathname.match(/\/(?:embed|shorts|v)\/([^/?#]+)/i);
                if (path) return path[1];
            }
        } catch (error) {
            var fallback = String(url || '').match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*[&?])?v=|embed\/|shorts\/|v\/))([^&#?/]+)/i);
            return fallback ? fallback[1] : '';
        }
        return '';
    }

    function youtubeWatchUrl(url) {
        var id = youtubeVideoId(url);
        return id ? 'https://www.youtube.com/watch?v=' + encodeURIComponent(id) : '';
    }

    function youtubeEmbedUrl(url) {
        var id = youtubeVideoId(url);
        return id ? 'https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0' : '';
    }

    function normalizeTrailerItems(payload) {
        var value = payload && payload.response !== undefined ? payload.response : payload;
        if (Array.isArray(value)) return value;
        if (!value || typeof value !== 'object') return [];
        return value.trailers || value.items || value.data || value.results || value.videos || [];
    }

    function youtubeLogoDataUri() {
        return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ff0033" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"/><path fill="#fff" d="m9.6 15.8 6.3-3.8-6.3-3.8v7.6Z"/></svg>');
    }

    function youtubeLogoSvg() {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff0033" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"/><path fill="#fff" d="m9.6 15.8 6.3-3.8-6.3-3.8v7.6Z"/></svg>';
    }

    function externalVideoIcon() {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>';
    }

    function create(options) {
        options = options || {};
        var t = options.t;
        var goBack = options.goBack;
        var showYummySelect = options.showSelect;
        var openExternalVideo = options.openExternalVideo;
        var openEmbedded = options.openEmbedded;
        var api = options.api || window.LampaYaniApi;
        var utils = options.utils || window.LampaYaniUiUtils;

        function trailerUrl(trailer) {
            if (!trailer) return '';
            if (typeof trailer === 'string') return resolveTrailerUrl(trailer);
            var raw = trailer.iframe_url || trailer.url || trailer.video_url || trailer.link ||
                trailer.src || trailer.embed || trailer.embed_url || trailer.trailer_url ||
                trailer.player_url || trailer.watch_url || trailer.href || trailer.youtube_url || '';
            if (raw && typeof raw === 'object') raw = raw.url || raw.src || raw.iframe || raw.iframe_url || '';
            var id = trailer.youtube_id || trailer.youtubeId || trailer.yt_id || trailer.youtube_video_id ||
                (typeof trailer.video_id === 'string' ? trailer.video_id : '');
            return resolveTrailerUrl(raw || id);
        }

        function resolveTrailerUrl(value) {
            value = utils.normalizeVideoUrl(value);
            if (!value) return '';
            return youtubeWatchUrl(value) || value;
        }

        function trailerTitle(trailer, index) {
            return trailer && (trailer.number || trailer.title || trailer.name || trailer.dubbing || trailer.player) ||
                (t('trailers') + ' ' + (index + 1));
        }

        function trailerHostLabel(url) {
            var host = utils.videoHost(url);
            if (!host) return t('trailers');
            return host.replace(/^m\./, '').replace(/^youtu\.be$/, 'youtube.com');
        }

        function playLampaPlayer(url, title) {
            var player = (typeof Lampa !== 'undefined' && Lampa.Player) || (window.Lampa && window.Lampa.Player);
            if (!player || typeof player.play !== 'function') return false;
            try {
                if (player.runas) player.runas('lampa');
                player.play({
                    title: title || t('trailers'),
                    url: url
                });
                return true;
            } catch (error) {
                console.warn('[YummyAnime] Lampa player failed to start a trailer', error);
                return false;
            }
        }

        function playEmbedded(url, title) {
            if (typeof openEmbedded !== 'function') return false;
            try {
                return !!openEmbedded(url, title);
            } catch (error) {
                console.warn('[YummyAnime] Embedded trailer failed to start', error);
                return false;
            }
        }

        function openTrailer(url, title) {
            url = resolveTrailerUrl(url);
            if (!url) return;
            var youtube = isYouTubeTrailer(url);
            var embed = youtube ? youtubeEmbedUrl(url) : url;
            if (youtube && playLampaPlayer(url, title)) return;
            if (playEmbedded(embed, title)) return;
            if (openExternalVideo && openExternalVideo(url, title, {youtubeIntent: youtube})) return;
            Lampa.Noty.show(t('no_trailers'));
        }

        function mapTrailerItems(payload) {
            return normalizeTrailerItems(payload).map(function (trailer, index) {
                var url = trailerUrl(trailer);
                return {
                    title: trailerTitle(trailer, index),
                    url: url,
                    icon: isYouTubeTrailer(url) ? youtubeLogoDataUri() : null
                };
            }).filter(function (item) { return item.url; });
        }

        function legacyOpenTrailers(card) {
            if (!card || !card.yani_id) return;
            if (Lampa.Loading && Lampa.Loading.start) Lampa.Loading.start();
            api.trailers(card.yani_id).then(function (payload) {
                if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
                var items = mapTrailerItems(payload);
                if (!items.length) {
                    Lampa.Noty.show(t('no_trailers'));
                    return;
                }
                if (items.length === 1) {
                    openTrailer(items[0].url, items[0].title);
                    return;
                }
                showYummySelect({
                    title: t('trailers'),
                    items: items,
                    onSelect: function (item) { openTrailer(item.url, item.title); }
                });
            }).catch(function (error) {
                if (Lampa.Loading && Lampa.Loading.stop) Lampa.Loading.stop();
                console.error('[YummyAnime] Trailers failed', error);
                Lampa.Noty.show(t('catalog_load_error'));
            });
        }

        function openTrailers(card) {
            if (!card || !card.yani_id) return;
            if (Lampa.Select && Lampa.Select.show) {
                legacyOpenTrailers(card);
                return;
            }
            Lampa.Activity.push({
                url: 'yani/trailers/' + encodeURIComponent(card.yani_id),
                title: t('trailers'),
                component: 'yani_trailers',
                card: card
            });
        }

        function TrailerList(object) {
            var card = object.card || {};
            var html = $('<div class="yani-trailers"></div>');
            var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
            var last;

            scroll.minus();

            this.create = function () {
                var self = this;
                this.activity.loader(true);
                api.trailers(card.yani_id).then(function (payload) {
                    var items = normalizeTrailerItems(payload).filter(function (trailer) { return trailerUrl(trailer); });
                    render(items);
                    self.activity.loader(false);
                    self.activity.toggle();
                }).catch(function (error) {
                    console.error('[YummyAnime] Trailers failed', error);
                    html.append($('<div class="yani-trailers__empty selector"></div>').text(t('catalog_load_error')));
                    scroll.append(html);
                    self.activity.loader(false);
                    self.activity.toggle();
                });
            };

            function render(items) {
                if (!items.length) {
                    html.append($('<div class="yani-trailers__empty selector"></div>').text(t('no_trailers')));
                    scroll.append(html);
                    return;
                }
                var list = $('<div class="yani-trailers__list"></div>');
                items.forEach(function (trailer, index) {
                    var url = trailerUrl(trailer);
                    var title = trailerTitle(trailer, index);
                    var row = $('<div class="yani-trailers__item selector"></div>');
                    row.append($('<div class="yani-trailers__icon"></div>').html(isYouTubeTrailer(url) ? youtubeLogoSvg() : externalVideoIcon()));
                    row.append($('<div class="yani-trailers__body"></div>').append($('<div class="yani-trailers__title"></div>').text(title)).append($('<div class="yani-trailers__host"></div>').text(trailerHostLabel(url))));
                    row.on('hover:focus', function () {
                        last = row[0];
                        row.addClass('focus');
                        scroll.update(row, true);
                    });
                    row.on('hover:blur', function () { row.removeClass('focus'); });
                    row.on('hover:enter click.yaniTrailer', function () { openTrailer(url, title); });
                    list.append(row);
                });
                html.append(list);
                scroll.append(html);
            }

            this.start = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(scroll.render());
                        Lampa.Controller.collectionFocus(last || scroll.render().find('.selector')[0] || false, scroll.render());
                    },
                    left: function () { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                    right: function () { Navigator.move('right'); },
                    up: function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                    down: function () { if (Navigator.canmove('down')) Navigator.move('down'); else scroll.wheel(300); },
                    back: goBack
                });
                Lampa.Controller.toggle('content');
            };

            this.render = function (js) { return js ? scroll.render()[0] : scroll.render(); };
            this.destroy = function () { scroll.destroy(); html.remove(); };
        }

        return {
            open: openTrailers,
            Component: TrailerList,
            legacyOpenTrailers: legacyOpenTrailers,
            openTrailer: openTrailer
        };
    }

    window.LampaYaniTrailers = {
        create: create,
        isYouTubeTrailer: isYouTubeTrailer,
        youtubeVideoId: youtubeVideoId,
        youtubeWatchUrl: youtubeWatchUrl,
        youtubeEmbedUrl: youtubeEmbedUrl,
        normalizeTrailerItems: normalizeTrailerItems,
        youtubeLogoDataUri: youtubeLogoDataUri,
        youtubeLogoSvg: youtubeLogoSvg,
        externalVideoIcon: externalVideoIcon
    };
}(window));
