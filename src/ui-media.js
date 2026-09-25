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
    var subjectCache = {};

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
            var options = source.graphql
                ? {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify({query: source.graphql, variables: source.variables || {}})}
                : source.query
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

    function normalizedName(value) {
        return String(value || '').toLowerCase().replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff]+/g, '');
    }

    function remoteMalId(item) {
        var ids = item && (item.remote_ids || item.yani_remote_ids) || {};
        return ids.myanimelist_id || ids.myAnimeListId || ids.mal || ids.myanimelist || '';
    }

    function firstAvailable(loaders, index) {
        index = index || 0;
        if (index >= loaders.length) return Promise.resolve('');
        return loaders[index]().then(function (url) {
            return url || firstAvailable(loaders, index + 1);
        }).catch(function () { return firstAvailable(loaders, index + 1); });
    }

    function commonsFileUrl(file) {
        return file ? 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=360' : '';
    }

    function wikimediaSubjectImage(title, studio) {
        var api = 'https://www.wikidata.org/w/api.php?origin=*&format=json';
        return requestJson({url: api + '&action=wbsearchentities&language=en&uselang=en&limit=8&search=' + encodeURIComponent(title)}).then(function (payload) {
            var wanted = normalizedName(title);
            var match = (payload && payload.search || []).filter(function (row) {
                return normalizedName(row && row.label) === wanted;
            })[0];
            if (!match || !match.id) return '';
            return requestJson({url: api + '&action=wbgetentities&props=claims&ids=' + encodeURIComponent(match.id)}).then(function (details) {
                var entity = details && details.entities && details.entities[match.id];
                var claims = entity && entity.claims || {};
                var properties = studio ? ['P154', 'P18'] : ['P18'];
                var file = '';
                properties.some(function (property) {
                    var claim = claims[property] && claims[property][0];
                    file = claim && claim.mainsnak && claim.mainsnak.datavalue && claim.mainsnak.datavalue.value || '';
                    return Boolean(file);
                });
                return commonsFileUrl(file);
            });
        });
    }

    function aniListDirectorImage(malId, title) {
        if (!malId) return Promise.resolve('');
        var query = 'query ($idMal: Int) { Media(idMal: $idMal, type: ANIME) { staff(perPage: 50) { edges { role node { name { full native } image { large medium } } } } } }';
        return requestJson({url: 'https://graphql.anilist.co', graphql: query, variables: {idMal: Number(malId)}}).then(function (payload) {
            var edges = payload && payload.data && payload.data.Media && payload.data.Media.staff && payload.data.Media.staff.edges || [];
            var directors = edges.filter(function (edge) { return /^director$/i.test(String(edge && edge.role || '').trim()); });
            var wanted = normalizedName(title);
            var match = directors.filter(function (edge) {
                var name = edge && edge.node && edge.node.name || {};
                return normalizedName(name.full) === wanted || normalizedName(name.native) === wanted;
            })[0];
            if (!match && directors.length === 1) match = directors[0];
            var image = match && match.node && match.node.image || {};
            return image.large || image.medium || '';
        });
    }

    function jikanStudioImage(title) {
        return requestJson({url: 'https://api.jikan.moe/v4/producers?q=' + encodeURIComponent(title) + '&limit=8'}).then(function (payload) {
            var rows = payload && payload.data || [];
            var wanted = normalizedName(title);
            var match = rows.filter(function (row) { return normalizedName(row && row.name) === wanted; })[0];
            var images = match && match.images || {};
            return images.jpg && (images.jpg.large_image_url || images.jpg.image_url) || images.webp && (images.webp.large_image_url || images.webp.image_url) || '';
        });
    }

    function jikanDirectorImage(malId, title) {
        if (!malId) return Promise.resolve('');
        return requestJson({url: 'https://api.jikan.moe/v4/anime/' + encodeURIComponent(malId) + '/staff'}).then(function (payload) {
            var directors = (payload && payload.data || []).filter(function (row) {
                return Array.isArray(row && row.positions) && row.positions.some(function (position) { return /^director$/i.test(String(position).trim()); });
            });
            var wanted = normalizedName(title);
            var match = directors.filter(function (row) { return normalizedName(row && row.person && row.person.name) === wanted; })[0];
            if (!match && directors.length === 1) match = directors[0];
            var images = match && match.person && match.person.images || {};
            return images.jpg && (images.jpg.image_url || images.jpg.large_image_url) || images.webp && (images.webp.image_url || images.webp.large_image_url) || '';
        });
    }

    function subjectImage(kind, subject, reference) {
        var title = String(subject && (subject.title || subject.name) || '').trim();
        var key = kind + ':' + String(subject && subject.id || title).toLowerCase();
        if (!title) return Promise.resolve('');
        if (Object.prototype.hasOwnProperty.call(subjectCache, key)) return Promise.resolve(subjectCache[key] || '');
        if (pending[key]) return pending[key];

        var operation;
        var malId = remoteMalId(reference);
        if (kind === 'studio') {
            operation = firstAvailable([
                function () { return wikimediaSubjectImage(title, true); },
                function () { return jikanStudioImage(title); }
            ]);
        } else {
            operation = firstAvailable([
                function () { return aniListDirectorImage(malId, title); },
                function () { return jikanDirectorImage(malId, title); },
                function () { return wikimediaSubjectImage(title, false); }
            ]);
        }

        pending[key] = operation.then(function (url) {
            delete pending[key];
            subjectCache[key] = url || null;
            return url || '';
        }).catch(function () {
            delete pending[key];
            subjectCache[key] = null;
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
        findSubjectImage: subjectImage,
        attachPosterFallback: attach,
        bindPosterFallback: bind
    };
}(window));
