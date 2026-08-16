(function (global) {
    'use strict';

    var cache = {};
    var order = [];
    var pending = {};
    var queue = [];
    var active = 0;
    var limit = 80;
    var maxActive = 2;
    var requestTimeout = 8000;

    function remember(key, value) {
        if (Object.prototype.hasOwnProperty.call(cache, key)) {
            order = order.filter(function (item) { return item !== key; });
        }
        cache[key] = value;
        order.push(key);
        while (order.length > limit) delete cache[order.shift()];
    }

    function enqueue(task) {
        return new Promise(function (resolve, reject) {
            queue.push({task: task, resolve: resolve, reject: reject});
            drain();
        });
    }

    function drain() {
        while (active < maxActive && queue.length) {
            (function (entry) {
                active++;
                var operation;
                try { operation = entry.task(); } catch (error) { operation = Promise.reject(error); }
                operation.then(entry.resolve, entry.reject).then(function () {
                    active--;
                    drain();
                });
            }(queue.shift()));
        }
    }

    function requestJson(source) {
        return enqueue(function () {
            var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var options = source.query
                ? {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({query: 'query ($search: String) { Page(perPage: 1) { media(search: $search, type: ANIME) { coverImage { extraLarge large } } } }', variables: {search: source.query}})}
                : {};
            if (controller) options.signal = controller.signal;
            var timer;
            var timeout = new Promise(function (resolve, reject) {
                timer = setTimeout(function () {
                    if (controller) controller.abort();
                    reject(new Error('poster request timeout'));
                }, requestTimeout);
            });
            return Promise.race([fetch(source.url, options), timeout]).then(function (response) {
                clearTimeout(timer);
                if (!response.ok) throw new Error('poster source ' + response.status);
                return response.json();
            }).catch(function (error) {
                clearTimeout(timer);
                throw error;
            });
        });
    }

    function titles(item) {
        var values = [];
        var add = function (value) {
            value = typeof value === 'string' ? value.trim() : '';
            if (value && values.indexOf(value) < 0) values.push(value);
        };
        ['title', 'name', 'russian', 'english', 'original_title', 'original_name', 'japanese', 'romaji', 'synonym'].forEach(function (key) { add(item && item[key]); });
        ['aliases', 'alternative_titles', 'alternative_names', 'titles', 'synonyms', 'names'].forEach(function (key) {
            var list = item && item[key];
            if (Array.isArray(list)) list.forEach(function (value) { add(typeof value === 'string' ? value : value && (value.title || value.name || value.value)); });
        });
        // A missing poster must not fan out into dozens of requests on a TV.
        return values.slice(0, 2);
    }

    function posterFromPayload(payload, aniList) {
        var item = aniList && payload && payload.data && payload.data.Page
            ? payload.data.Page.media && payload.data.Page.media[0]
            : payload && payload.data
                ? (Array.isArray(payload.data) ? payload.data[0] : payload.data)
                : payload;
        var images = item && item.images || {};
        return aniList
            ? item && item.coverImage && (item.coverImage.extraLarge || item.coverImage.large)
            : images.jpg && (images.jpg.large_image_url || images.jpg.image_url) ||
                images.webp && (images.webp.large_image_url || images.webp.image_url) ||
                (window.LampaYaniUiUtils && window.LampaYaniUiUtils.posterUrl
                    ? window.LampaYaniUiUtils.posterUrl(item && (item.poster || item.image))
                    : item && (item.poster || item.image));
    }

    function find(card) {
        var key = String(card && (card.yani_id || card.title) || '').toLowerCase();
        if (!key) return Promise.resolve('');
        if (Object.prototype.hasOwnProperty.call(cache, key)) return Promise.resolve(cache[key] || '');
        if (pending[key]) return pending[key];

        var ids = card.yani_remote_ids || {};
        var urls = [];
        if (ids.mal || ids.myanimelist) urls.push({url: 'https://api.jikan.moe/v4/anime/' + encodeURIComponent(ids.mal || ids.myanimelist) + '/full'});
        if (ids.shikimori) urls.push({url: 'https://shikimori.one/api/animes/' + encodeURIComponent(ids.shikimori) + '.json'});
        titles(card).forEach(function (title) {
            urls.push({url: 'https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(title) + '&limit=1'});
            urls.push({url: 'https://graphql.anilist.co', query: title});
        });

        function load(index) {
            if (index >= urls.length) return Promise.resolve('');
            var source = urls[index];
            var aniList = source.url === 'https://graphql.anilist.co';
            return requestJson(source).then(function (payload) {
                var poster = posterFromPayload(payload, aniList);
                if (!poster) throw new Error('alternative poster is empty');
                return poster;
            }).catch(function () { return load(index + 1); });
        }

        pending[key] = (urls.length ? load(0) : Promise.resolve('')).then(function (poster) {
            delete pending[key];
            remember(key, poster || null);
            return poster || '';
        }, function () {
            delete pending[key];
            remember(key, null);
            return '';
        });
        return pending[key];
    }

    function renderElement(element, card) {
        var render = element && element.jquery ? element : element ? $(element) : $();
        if (!render.length && card && card.render) render = $(card.render(true));
        return render;
    }

    function isLowMemoryDevice() {
        var navigatorInfo = window.navigator || {};
        return Number(navigatorInfo.deviceMemory || 0) > 0 && Number(navigatorInfo.deviceMemory) <= 2;
    }

    function prepareImage(image) {
        if (!image || !image.length) return;
        // Cheap TV WebViews often decode `lazy`/`async` posters at a thumbnail
        // size and then stretch them. Fullscreen creates a fresh <img> without
        // those hints, which is why the same file looks sharp there.
        var lowMemory = isLowMemoryDevice();
        image.attr('loading', lowMemory ? 'lazy' : 'eager').attr('decoding', lowMemory ? 'async' : 'sync');
    }

    function applyPoster(image, box, poster) {
        if (!poster) return;
        if (image && image.length) image.attr('src', poster);
        if (box && box.length) box.css('background-image', 'url("' + poster.replace(/"/g, '%22') + '")');
    }

    function attach(element, card) {
        var render = renderElement(element, card);
        var image = render.find('img').first();
        var box = render.find('.card__img').first();
        var apply = function (poster) { applyPoster(image, box, poster); };
        var alternative = function () { find(card).then(apply); };
        prepareImage(image);
        // Always write the plugin URL over Lampa's copy. Some builds keep a
        // resized/cached bitmap that stays soft even after the real file loads.
        apply(card && (card.poster || card.img) || '');
        if (image.length) image.off('error.yaniPoster').one('error.yaniPoster', alternative);
        // Do not create a second hidden Image probe. On low-memory WebViews it
        // decoded every catalog poster twice and could terminate the process.
        if (!card.poster && !card.img) alternative();
    }

    function bind(image, card) {
        prepareImage(image);
        image.off('error.yaniPoster').one('error.yaniPoster', function () {
            find(card).then(function (poster) { if (poster) image.attr('src', poster); });
        });
        if (!card.poster && !card.img) find(card).then(function (poster) { if (poster) image.attr('src', poster); });
    }

    global.LampaYani = global.LampaYani || {};
    global.LampaYani.Media = global.LampaYaniMedia = {
        findAlternativePoster: find,
        attachPosterFallback: attach,
        bindPosterFallback: bind
    };
}(window));
