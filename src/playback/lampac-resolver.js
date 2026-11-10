(function (window) {
    'use strict';

    var STORAGE_KEY = 'yani_lampac_url';
    var MAX_STEPS = 5;

    function normalizeBaseUrl(value) {
        value = String(value || '').trim().replace(/\/+$/, '');
        if (!value) return '';
        if (!/^https?:\/\//i.test(value)) return '';
        return value;
    }

    function baseUrl() {
        if (!window.Lampa || !Lampa.Storage || !Lampa.Storage.get) return '';
        return normalizeBaseUrl(Lampa.Storage.get(STORAGE_KEY, ''));
    }

    function setBaseUrl(value) {
        var normalized = normalizeBaseUrl(value);
        if (window.Lampa && Lampa.Storage && Lampa.Storage.set) Lampa.Storage.set(STORAGE_KEY, normalized);
        return normalized;
    }

    function absoluteUrl(base, value) {
        value = String(value || '').trim();
        if (!value) return '';
        if (/^https?:\/\//i.test(value)) return value;
        if (value.indexOf('//') === 0) return 'https:' + value;
        return base.replace(/\/$/, '') + '/' + value.replace(/^\//, '');
    }

    function responseText(value) {
        if (typeof value === 'string') return value;
        if (value === undefined || value === null) return '';
        try { return JSON.stringify(value); } catch (ignore) { return String(value); }
    }

    function requestText(url) {
        return new Promise(function (resolve, reject) {
            if (!window.Lampa || !Lampa.Reguest) return reject(new Error('Lampa native request is unavailable'));
            var network = new Lampa.Reguest();
            var timeout = Number((window.LampaYaniConfig && LampaYaniConfig.requestTimeout) || 15000);
            if (network.timeout) network.timeout(timeout);
            network.native(url, function (value) {
                resolve(responseText(value));
            }, function (error, exception) {
                var message = error && (error.responseText || error.message || error.status) || exception || 'Lampac request failed';
                reject(new Error(String(message)));
            }, false, {dataType: 'text', timeout: timeout});
        });
    }

    function decodeAttribute(value) {
        return String(value || '')
            .replace(/&quot;/gi, '"')
            .replace(/&#34;/g, '"')
            .replace(/&#39;|&apos;/gi, "'")
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&amp;/gi, '&');
    }

    function parseDataItems(markup, className) {
        var result = [];
        var tagPattern = /<[^>]+>/g;
        var tag;
        while ((tag = tagPattern.exec(String(markup || '')))) {
            var text = tag[0];
            var classMatch = text.match(/\bclass\s*=\s*(["'])(.*?)\1/i);
            if (!classMatch || classMatch[2].split(/\s+/).indexOf(className) < 0) continue;
            var jsonMatch = text.match(/\bdata-json\s*=\s*(["'])([\s\S]*?)\1/i);
            if (!jsonMatch) continue;
            try {
                var item = JSON.parse(decodeAttribute(jsonMatch[2]));
                var seasonMatch = text.match(/\bs\s*=\s*(["'])(.*?)\1/i);
                var episodeMatch = text.match(/\be\s*=\s*(["'])(.*?)\1/i);
                var tagNameMatch = text.match(/^<([a-z0-9]+)/i);
                if (tagNameMatch) {
                    var closing = '</' + tagNameMatch[1] + '>';
                    var closingAt = String(markup || '').toLowerCase().indexOf(closing.toLowerCase(), tagPattern.lastIndex);
                    if (closingAt >= 0) {
                        var inner = String(markup || '').slice(tagPattern.lastIndex, closingAt).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                        if (inner && !item.text) item.text = decodeAttribute(inner);
                    }
                }
                if (seasonMatch) item.season = Number(seasonMatch[2]);
                if (episodeMatch) item.episode = Number(episodeMatch[2]);
                if (/\bactive\b/i.test(classMatch[2])) item.active = true;
                result.push(item);
            } catch (ignore) {}
        }
        return result;
    }

    function firstValue(values) {
        for (var i = 0; i < values.length; i++) {
            if (values[i] !== undefined && values[i] !== null && String(values[i]).trim()) return values[i];
        }
        return '';
    }

    function externalIds(card) {
        return card && (card.yani_remote_ids || card.external_ids || card.ids) || {};
    }

    function extractOrid(sourceUrl) {
        sourceUrl = String(sourceUrl || '');
        try {
            var parsed = new URL(sourceUrl);
            var value = firstValue([
                parsed.searchParams.get('orid'),
                parsed.searchParams.get('token_movie'),
                parsed.searchParams.get('token')
            ]);
            if (value && String(value).length >= 6) return String(value);
        } catch (ignore) {}
        var pathMatch = sourceUrl.match(/\/(?:embed|iframe|player)\/([a-z0-9_-]{6,})/i);
        return pathMatch ? pathMatch[1] : '';
    }

    // The YummyAnime player URL already states which season, episode and
    // dubbing were picked: `?token_movie=…&translation=128&season=1&episode=2`.
    // Lampac has to rediscover the title from scratch, so feeding these back is
    // the difference between landing on the requested episode and landing on
    // whatever the balancer happens to list first.
    function sourceHints(sourceUrl) {
        var hints = {season: 0, episode: 0, translation: ''};
        try {
            var query = new URL(String(sourceUrl || '')).searchParams;
            hints.season = Number(query.get('season')) || 0;
            hints.episode = Number(query.get('episode')) || 0;
            hints.translation = String(query.get('translation') || '');
        } catch (ignore) {}
        return hints;
    }

    function buildRootUrl(card, sourceUrl) {
        var base = baseUrl();
        if (!base) return '';
        card = card || {};
        var ids = externalIds(card);
        var params = new URLSearchParams();
        var hints = sourceHints(sourceUrl);
        var orid = extractOrid(sourceUrl);
        var imdb = firstValue([ids.imdb_id, ids.imdb, card.imdb_id]);
        var kinopoisk = firstValue([ids.kinopoisk_id, ids.kp_id, ids.kp, card.kinopoisk_id]);
        var titles = window.LampaYaniUiUtils ? LampaYaniUiUtils.titleValues(card) : [card.title];
        var title = firstValue([card.title, card.name, titles[0]]);
        var originalTitle = firstValue([card.original_title, card.original_name, titles[1], title]);
        var year = String(firstValue([card.release_date, card.year, card.first_air_date]) || '').match(/\d{4}/);

        if (orid) params.set('orid', orid);
        if (imdb) params.set('imdb_id', imdb);
        if (kinopoisk) params.set('kinopoisk_id', kinopoisk);
        if (title) params.set('title', title);
        if (originalTitle) params.set('original_title', originalTitle);
        if (year) params.set('year', year[0]);
        if (hints.season) params.set('s', String(hints.season));
        params.set('serial', '1');
        params.set('original_language', 'ja');
        // `orid` is an Alloha-internal movie token, not something Lampac can
        // look a title up by, so it does not count as an identifier here: for
        // anime without an IMDb or Kinopoisk id, title matching is all Lampac
        // has to work with.
        if (!imdb && !kinopoisk) params.set('similar', 'true');
        return base + '/lite/alloha?' + params.toString();
    }

    function cleanText(value) {
        return String(value || '').toLowerCase().replace(/[^a-zа-я0-9]+/gi, ' ').trim();
    }

    function chooseByTitle(items, card) {
        var wanted = (window.LampaYaniUiUtils ? LampaYaniUiUtils.titleValues(card || {}) : [card && card.title]).map(cleanText).filter(Boolean);
        var best = null;
        var bestScore = -1;
        items.forEach(function (item) {
            var candidate = cleanText(item.title || item.name || item.text);
            var score = wanted.indexOf(candidate) >= 0 ? 100 : wanted.some(function (title) {
                return title && candidate && (title.indexOf(candidate) >= 0 || candidate.indexOf(title) >= 0);
            }) ? 40 : 0;
            if (score > bestScore) { best = item; bestScore = score; }
        });
        return best || items[0];
    }

    function chooseSeason(items, selected, hints) {
        var data = window.LampaYaniUiUtils ? LampaYaniUiUtils.videoData(selected || {}) : {};
        var season = Number(firstValue([selected && selected.season, data.season, hints && hints.season, 1]));
        return items.filter(function (item) { return Number(item.season || item.text || 0) === season; })[0] || items[0];
    }

    function chooseVoice(buttons, group) {
        var wanted = cleanText(group && group.title);
        return buttons.filter(function (item) {
            var title = cleanText(item.title || item.name || item.text);
            return wanted && title && (wanted.indexOf(title) >= 0 || title.indexOf(wanted) >= 0);
        })[0] || buttons.filter(function (item) { return item.active; })[0] || buttons[0];
    }

    function chooseEpisode(items, selected, hints) {
        var number = window.LampaYaniEpisode.normalize(firstValue([selected && selected.number, selected && selected.episode, selected && selected.index, hints && hints.episode]));
        return items.filter(function (item) { return window.LampaYaniEpisode.same(item.episode || item.e, number); })[0] || items[0];
    }

    function directResult(item, base) {
        item = item || {};
        var url = firstValue([item.stream, item.streamlink, item.file, item.url]);
        if (typeof url !== 'string') return null;
        url = url.split(' or ')[0].trim();
        url = absoluteUrl(base, url);
        if (!url || !/\.m3u8|\.mpd|\.mp4|\.webm/i.test(url)) return null;
        return {
            url: url,
            quality: typeof item.quality === 'string' ? item.quality : item.voice_name || '',
            qualities: item.qualitys || (typeof item.quality === 'object' ? item.quality : null),
            headers: item.headers || null,
            source: 'lampac-alloha'
        };
    }

    function parseJsonResult(text, base) {
        try {
            var payload = typeof text === 'string' ? JSON.parse(text) : text;
            return directResult(payload, base);
        } catch (ignore) {
            return null;
        }
    }

    function resolvePage(markup, card, selected, group, hints, visited, depth) {
        var base = baseUrl();
        var jsonResult = parseJsonResult(markup, base);
        if (jsonResult) return Promise.resolve(jsonResult);
        if (depth >= MAX_STEPS) return Promise.reject(new Error('Lampac resolution limit reached'));

        var items = parseDataItems(markup, 'videos__item');
        var buttons = parseDataItems(markup, 'videos__button');
        if (!items.length) return Promise.reject(new Error('Lampac returned no playable items'));

        if (buttons.length) {
            var voice = chooseVoice(buttons, group);
            if (voice && voice.url && !voice.active) return follow(voice.url, card, selected, group, hints, visited, depth);
        }

        var playable = items.filter(function (item) { return item.method === 'play' || item.method === 'call' || item.stream; });
        if (playable.length) {
            var episode = chooseEpisode(playable, selected, hints);
            var direct = directResult(episode, base);
            if (direct) return Promise.resolve(direct);
            if (episode.url) return follow(episode.url, card, selected, group, hints, visited, depth);
        }

        var links = items.filter(function (item) { return item.url; });
        if (links.length) {
            var target = links.some(function (item) { return item.similar; }) ? chooseByTitle(links, card) : chooseSeason(links, selected, hints);
            if (target && target.url) return follow(target.url, card, selected, group, hints, visited, depth);
        }
        return Promise.reject(new Error('Lampac did not expose a direct stream'));
    }

    function follow(url, card, selected, group, hints, visited, depth) {
        var base = baseUrl();
        url = absoluteUrl(base, url);
        if (!url || visited[url]) return Promise.reject(new Error('Lampac returned a repeated URL'));
        visited[url] = true;
        return requestText(url).then(function (markup) {
            return resolvePage(markup, card, selected, group, hints, visited, depth + 1);
        });
    }

    function resolveAlloha(card, selected, group, sourceUrl) {
        var root = buildRootUrl(card, sourceUrl);
        if (!root) return Promise.reject(new Error('Lampac server is not configured'));
        return follow(root, card, selected, group, sourceHints(sourceUrl), {}, 0);
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.LampacResolver = window.LampaYaniLampacResolver = {
        baseUrl: baseUrl,
        setBaseUrl: setBaseUrl,
        enabled: function () { return Boolean(baseUrl()); },
        normalizeBaseUrl: normalizeBaseUrl,
        extractOrid: extractOrid,
        sourceHints: sourceHints,
        buildRootUrl: buildRootUrl,
        parseDataItems: parseDataItems,
        resolveAlloha: resolveAlloha
    };
}(window));
