(function (window) {
    'use strict';

    function videoData(video) {
        var value = video && video.data;
        if (!value) return {};
        if (typeof value === 'object') return value;
        if (typeof value === 'string') {
            try { return JSON.parse(value) || {}; } catch (error) { return {}; }
        }
        return {};
    }

    function normalizeVideoUrl(url) {
        if (!url) return '';
        url = String(url).trim();
        if (url.indexOf('//') === 0) url = 'https:' + url;
        if (/^http:\/\/(?:www\.)?kodik\./i.test(url)) url = 'https://' + url.slice(7);
        return url;
    }

    function videoHost(url) {
        try { return new URL(url).hostname.replace(/^www\./, ''); } catch (error) { return ''; }
    }

    function posterUrl(value, role) {
        if (!value) return '';
        if (typeof value === 'string') {
            value = value.trim();
            return value.indexOf('//') === 0 ? 'https:' + value : value;
        }
        if (typeof value !== 'object') return '';
        // Cards on TV are only a few hundred pixels wide. Prefer a mid-size
        // file so the WebView does not decode a huge poster and then crush it
        // with a low-quality scaler. Fullscreen / detail still take the largest.
        var full = value.huge || value.mega || value.fullsize || value.original || value.full ||
            value.big || value.large || value.medium || value.small || value.preview || value.url || '';
        if (role === 'card') {
            return posterUrl(
                value.big || value.large || value.huge || value.mega ||
                value.fullsize || value.original || value.full ||
                value.medium || value.small || value.preview || value.url || ''
            );
        }
        return posterUrl(full);
    }

    function posterSources(value) {
        var card = posterUrl(value, 'card');
        var full = posterUrl(value, 'full');
        return {
            card: card || full,
            full: full || card
        };
    }

    function titleValues(item) {
        var values = [];
        var add = function (value) { if (typeof value === 'string' && value.trim() && values.indexOf(value.trim()) < 0) values.push(value.trim()); };
        ['title', 'name', 'russian', 'english', 'original_title', 'original_name', 'japanese', 'romaji', 'synonym'].forEach(function (key) { add(item && item[key]); });
        // YummyAnime keeps the most useful international aliases in
        // `other_titles` (for example, "Наруто" -> "NARUTO", "ナルト").
        // Include it together with the generic alias fields so both native
        // Lampa and YummyAnime searches can resolve the same title.
        ['aliases', 'alternative_titles', 'alternative_names', 'other_titles', 'titles', 'synonyms', 'names'].forEach(function (key) {
            var list = item && item[key];
            if (Array.isArray(list)) {
                list.forEach(function (value) { add(typeof value === 'string' ? value : value && (value.title || value.name || value.value)); });
                return;
            }
            if (list && typeof list === 'object') {
                Object.keys(list).forEach(function (aliasKey) {
                    var value = list[aliasKey];
                    add(typeof value === 'string' ? value : value && (value.title || value.name || value.value));
                });
            }
        });
        return values;
    }

    function normalizeMatchTitle(value) { return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').trim(); }

    function titleScriptRank(title) {
        if (/[A-Za-z]/.test(title) && !/[А-Яа-яЁё]/.test(title)) return 0;
        if (/[\u3040-\u30ff\u3400-\u9fff]/.test(title)) return 1;
        return 2;
    }

    function stripSeasonSuffix(title) {
        var value = String(title || '').trim();
        if (!value) return '';
        var patterns = [
            /\s*[:\-–—]?\s*(?:the\s+)?(?:\d+(?:st|nd|rd|th)\s+)?seasons?\s*\d*\s*$/i,
            /\s*[:\-–—]?\s*s(?:eason)?\s*\d+\s*$/i,
            /\s*[:\-–—]?\s*(?:tv|тв)\s*[- ]?\d+\s*$/i,
            /\s*[:\-–—]?\s*сезон\s*\d+\s*$/i,
            /\s*[:\-–—]?\s*\d+\s*сезон\s*$/i,
            /\s*第\s*\d+\s*期\s*$/,
            /\s*[:\-–—]?\s*(?:II|III|IV|VI|VII|VIII|IX|X|V)\s*$/i,
            /\s*[:\-–—]?\s*[2-9]\s*$/
        ];
        var next = value;
        var changed = true;
        while (changed) {
            changed = false;
            for (var index = 0; index < patterns.length; index++) {
                var stripped = next.replace(patterns[index], '').trim();
                if (stripped && stripped !== next) {
                    next = stripped;
                    changed = true;
                }
            }
        }
        return next;
    }

    function titleMatchCores(titles) {
        var cores = [];
        (titles || []).forEach(function (title) {
            var core = normalizeMatchTitle(stripSeasonSuffix(title));
            if (core && cores.indexOf(core) < 0) cores.push(core);
        });
        return cores;
    }

    function titlesOverlap(left, right) {
        if (!left || !right) return false;
        if (left === right) return true;
        if (left.indexOf(right) < 0 && right.indexOf(left) < 0) return false;
        return Math.min(left.length, right.length) >= 6;
    }

    function titleTokens(value) {
        return normalizeMatchTitle(value).split(/\s+/).filter(function (token) {
            return token.length >= 2;
        });
    }

    function titleTokenJaccard(left, right) {
        var a = titleTokens(left);
        var b = titleTokens(right);
        if (!a.length || !b.length) return 0;
        var shared = {};
        var union = {};
        a.forEach(function (token) { union[token] = true; });
        b.forEach(function (token) { union[token] = true; });
        a.forEach(function (token) {
            if (b.indexOf(token) >= 0) shared[token] = true;
        });
        return Object.keys(shared).length / Object.keys(union).length;
    }

    function titleEditSimilarity(left, right) {
        left = normalizeMatchTitle(left);
        right = normalizeMatchTitle(right);
        if (!left || !right) return 0;
        if (left === right) return 1;
        var rows = left.length + 1;
        var cols = right.length + 1;
        var matrix = new Array(rows);
        var row;
        var col;
        for (row = 0; row < rows; row++) {
            matrix[row] = new Array(cols);
            matrix[row][0] = row;
        }
        for (col = 0; col < cols; col++) matrix[0][col] = col;
        for (row = 1; row < rows; row++) {
            for (col = 1; col < cols; col++) {
                var cost = left.charAt(row - 1) === right.charAt(col - 1) ? 0 : 1;
                matrix[row][col] = Math.min(
                    matrix[row - 1][col] + 1,
                    matrix[row][col - 1] + 1,
                    matrix[row - 1][col - 1] + cost
                );
            }
        }
        return 1 - (matrix[left.length][right.length] / Math.max(left.length, right.length));
    }

    function titlesCloselyRelated(left, right) {
        if (!left || !right) return false;
        if (left === right) return true;
        if (titlesOverlap(left, right) && titleTokenJaccard(left, right) >= 0.6) return true;
        if (titleTokenJaccard(left, right) >= 0.75) return true;
        return titleEditSimilarity(left, right) >= 0.88;
    }

    var romanSeasonValues = {i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10};

    function parseSeasonHint(title) {
        var value = String(title || '').replace(/\s*[\(\[]?\s*\d{4}\s*[\)\]]?\s*$/i, '').trim();
        if (!value) return 0;
        var match = value.match(/(?:season|сезон|s)\s*(\d+)\s*$/i) ||
            value.match(/(\d+)\s*сезон\s*$/i) ||
            value.match(/(?:tv|тв)\s*[- ]?(\d+)\s*$/i) ||
            value.match(/(\d+)(?:st|nd|rd|th)\s+season\s*$/i) ||
            value.match(/第\s*(\d+)\s*期\s*$/);
        if (match) return Number(match[1]) || 0;
        match = value.match(/\s(II|III|IV|VI|VII|VIII|IX|X|V)\s*$/i);
        if (match) return romanSeasonValues[match[1].toLowerCase()] || 0;
        match = value.match(/\s([2-9])\s*$/);
        return match ? Number(match[1]) : 0;
    }

    function cardSeasonHint(card) {
        var titles = [];
        ['title', 'name', 'original_title', 'original_name'].forEach(function (key) {
            if (card && card[key]) titles.push(card[key]);
        });
        if (card && Array.isArray(card.yani_titles)) titles = titles.concat(card.yani_titles);
        var season = 0;
        titles.forEach(function (title) {
            var hint = parseSeasonHint(title);
            if (hint > season) season = hint;
        });
        return season;
    }

    function isSafeTmdbSeasonMatch(yaniCard, candidate) {
        var expected = standardSearchTitles(yaniCard || {}).map(normalizeMatchTitle).filter(Boolean);
        var tmdbTitles = [
            candidate && candidate.title,
            candidate && candidate.name,
            candidate && candidate.original_title,
            candidate && candidate.original_name
        ].map(normalizeMatchTitle).filter(Boolean);
        if (tmdbTitles.some(function (title) { return expected.indexOf(title) >= 0; })) return true;

        var yummyYear = String(yaniCard && (yaniCard.release_date || yaniCard.year) || '').slice(0, 4);
        var tmdbYear = String(candidate && (candidate.release_date || candidate.first_air_date) || '').slice(0, 4);
        if (/^\d{4}$/.test(yummyYear) && /^\d{4}$/.test(tmdbYear) && Math.abs(Number(yummyYear) - Number(tmdbYear)) <= 1) {
            return true;
        }

        var yummySeason = cardSeasonHint(yaniCard);
        var tmdbSeason = 0;
        [candidate && candidate.title, candidate && candidate.name, candidate && candidate.original_title, candidate && candidate.original_name].forEach(function (title) {
            var hint = parseSeasonHint(title);
            if (hint > tmdbSeason) tmdbSeason = hint;
        });
        return yummySeason >= 2 && tmdbSeason === yummySeason;
    }

    function standardSearchTitles(card) {
        var result = [], values = titleValues(card || {});
        if (card && Array.isArray(card.yani_titles)) values = values.concat(card.yani_titles);
        values.forEach(function (title) {
            if (result.indexOf(title) < 0) result.push(title);
            var withoutYear = String(title).replace(/\s*[\(\[]?\s*\d{4}\s*[\)\]]?\s*$/i, '').trim();
            if (withoutYear && result.indexOf(withoutYear) < 0) result.push(withoutYear);
            var core = stripSeasonSuffix(withoutYear || title);
            if (core && result.indexOf(core) < 0) result.push(core);
        });
        // TMDB indexes English/romaji far more reliably than a long localised
        // YummyAnime title. Search those first so the title-page button does
        // not burn the query budget on a Russian name that never matches.
        return result.sort(function (left, right) {
            var rank = titleScriptRank(left) - titleScriptRank(right);
            return rank || left.length - right.length;
        });
    }

    function scoreTitleMatch(expectedTitles, expectedYear, candidate) {
        var expected = (expectedTitles || []).map(normalizeMatchTitle).filter(Boolean);
        var titles = [
            candidate && candidate.title,
            candidate && candidate.name,
            candidate && candidate.original_title,
            candidate && candidate.original_name
        ].map(normalizeMatchTitle).filter(Boolean);
        var expectedCores = titleMatchCores(expectedTitles);
        var candidateCores = titleMatchCores(titles);
        var exact = titles.some(function (title) { return expected.indexOf(title) >= 0; }) ||
            candidateCores.some(function (title) { return expectedCores.indexOf(title) >= 0; });
        // Near-miss localizations like "Класс убийц" vs "Клуб убийц" share a
        // year and one word, but must not open the live-action title in Lampa.
        var related = !exact && (
            titles.some(function (title) {
                return expected.some(function (value) { return titlesCloselyRelated(title, value); });
            }) ||
            candidateCores.some(function (title) {
                return expectedCores.some(function (value) { return titlesCloselyRelated(title, value); });
            })
        );
        var candidateYear = String(candidate && (candidate.release_date || candidate.first_air_date) || '').slice(0, 4);
        var yearScore = 0;
        if (expectedYear && /^\d{4}$/.test(expectedYear) && /^\d{4}$/.test(candidateYear)) {
            var delta = Math.abs(Number(expectedYear) - Number(candidateYear));
            if (delta === 0) yearScore = 30;
            else if (delta === 1) yearScore = 20;
        }
        return (exact ? 100 : related ? 75 : 0) + yearScore;
    }

    function isAnimeTmdbCard(card) {
        var ids = card && (card.genre_ids || card.genres_ids || card.genre_id);
        if (Array.isArray(ids) && ids.some(function (id) { return Number(id) === 16; })) return true;

        var source = card && (card.genres || card.genre || card.category || card.categories);
        var values = Array.isArray(source) ? source : source ? [source] : [];
        var names = values.map(function (genre) {
            if (typeof genre === 'string') return genre;
            return genre && (genre.name || genre.title || genre.label) || '';
        }).join(' ').toLowerCase();
        if (/(?:animation|animated|anime|аниме|мультфильм|мультипликац)/.test(names)) return true;

        var language = String(card && (card.original_language || card.language) || '').toLowerCase();
        var countries = card && (card.origin_country || card.production_countries) || [];
        var japaneseOrigin = Array.isArray(countries) && countries.some(function (country) {
            return String(typeof country === 'string' ? country : country && (country.iso_3166_1 || country.code) || '').toUpperCase() === 'JP';
        });
        return language === 'ja' || japaneseOrigin;
    }

    function yummyTvDetailsUrl(animeId) {
        var id = Number(animeId);
        if (!isFinite(id) || id <= 0) return '';
        return 'yummytv://details/' + Math.floor(id);
    }

    function internalPlayerItem(item) {
        item = item || {};
        var url = normalizeVideoUrl(item.url);
        if (!url) return null;
        var result = {
            title: String(item.title || 'YummyAnime'),
            url: url,
            time: Math.max(0, Number(item.time || 0)),
            isonline: true
        };
        if (item.quality && typeof item.quality === 'object') result.quality = item.quality;
        if (item.headers && typeof item.headers === 'object') result.headers = item.headers;
        if (item.poster) result.poster = item.poster;
        return result;
    }

    function detailRouteId(activity) {
        activity = activity || {};
        var candidates = [activity, activity.card, activity.object, activity.data, activity.movie];
        var result = '';

        candidates.some(function (candidate) {
            if (!candidate || typeof candidate !== 'object') return false;
            var anime = candidate.anime && typeof candidate.anime === 'object' ? candidate.anime : {};
            var value = candidate.yani_id || candidate.anime_id || candidate.animeId ||
                anime.yani_id || anime.anime_id || anime.animeId;
            if (value === undefined || value === null || value === '' || value === 'undefined') return false;
            result = String(value);
            return true;
        });

        if (result) return result;

        var route = String(activity.url || activity.route || '');
        var match = route.match(/(?:^|\/)yani\/detail\/([^/?#]+)/i);
        if (match && match[1]) {
            try { result = decodeURIComponent(match[1]); } catch (error) { result = match[1]; }
        }

        if (!result && activity.component === 'yani_detail' && activity.id !== undefined && activity.id !== null && activity.id !== '' && activity.id !== 'undefined') {
            result = String(activity.id);
        }
        return result;
    }

    function positiveNumber(value) {
        value = Number(value);
        return isFinite(value) && value > 0 ? value : 0;
    }

    function explicitSeasonCount(item) {
        var seasons = item && (item.yani_seasons || item.seasons);
        if (Array.isArray(seasons)) return seasons.length;
        return positiveNumber(item && (item.yani_seasons_count || item.seasons_count || item.season_count));
    }

    function median(values) {
        values = values.slice().sort(function (a, b) { return a - b; });
        if (!values.length) return 0;
        var middle = Math.floor(values.length / 2);
        return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
    }

    function formatWatchedEpisodeNumbers(values) {
        var numbers = [];
        (Array.isArray(values) ? values : []).forEach(function (value) {
            var number = Number(value);
            if (!(number > 0) || numbers.indexOf(number) >= 0) return;
            numbers.push(number);
        });
        numbers.sort(function (a, b) { return a - b; });
        if (!numbers.length) return '';
        var parts = [];
        var start = numbers[0];
        var prev = numbers[0];
        for (var index = 1; index <= numbers.length; index++) {
            var current = numbers[index];
            if (current === prev + 1) {
                prev = current;
                continue;
            }
            parts.push(start === prev ? String(start) : start + '–' + prev);
            start = prev = current;
        }
        return parts.join(', ');
    }

    function compactWatchedEpisodeLabel(values, limit) {
        var numbers = [];
        (Array.isArray(values) ? values : []).forEach(function (value) {
            var number = Number(value);
            if (!(number > 0) || numbers.indexOf(number) >= 0) return;
            numbers.push(number);
        });
        numbers.sort(function (a, b) { return a - b; });
        var full = formatWatchedEpisodeNumbers(numbers);
        if (!full) return '';
        limit = limit > 0 ? limit : 32;
        if (full.length <= limit) return full;
        var suffix = '… · ' + numbers.length;
        var parts = full.split(', ');
        var kept = [];
        var used = 0;
        for (var index = 0; index < parts.length; index++) {
            var extra = (kept.length ? 2 : 0) + parts[index].length;
            if (kept.length && used + extra + suffix.length > limit) break;
            kept.push(parts[index]);
            used += extra;
        }
        if (!kept.length) return String(numbers[0]) + suffix;
        return kept.join(', ') + suffix;
    }

    function detailEpisodeStats(item, videos, localPlayback) {
        item = item || {};
        videos = Array.isArray(videos) ? videos : [];
        var episodes = item.yani_episodes || item.episodes || {};
        var stats = {
            seasons: explicitSeasonCount(item),
            total: positiveNumber(episodes.count || episodes.total || item.episodes_count),
            aired: positiveNumber(episodes.aired || episodes.released || item.episodes_aired),
            watched: 0,
            watchedNumbers: [],
            watchedLabel: '',
            watchedTitle: '',
            minutes: 0
        };
        var grouped = {};

        videos.forEach(function (video, index) {
            video = video || {};
            var number = video.number !== undefined && video.number !== null && video.number !== '' ? String(video.number) :
                video.index !== undefined && video.index !== null && video.index !== '' ? String(video.index) : 'video:' + String(video.video_id || video.id || index);
            var episode = grouped[number] || (grouped[number] = {durations: [], watched: false});
            var duration = positiveNumber(video.duration);
            // YummyAnime video durations are seconds. Ignore implausibly short
            // and long values before calculating one representative duration
            // per episode, so duplicate dubbings do not skew the average.
            if (duration >= 60 && duration <= 4 * 60 * 60) episode.durations.push(duration);
            if (positiveNumber(video.watched && video.watched.end_time) > 0) episode.watched = true;
        });

        if (localPlayback && localPlayback.number !== undefined && localPlayback.number !== null && positiveNumber(localPlayback.time) > 0) {
            var localNumber = String(localPlayback.number || 'local');
            var localEpisode = grouped[localNumber] || (grouped[localNumber] = {durations: [], watched: false});
            localEpisode.watched = true;
            var localDuration = positiveNumber(localPlayback.duration);
            if (localDuration >= 60 && localDuration <= 4 * 60 * 60) localEpisode.durations.push(localDuration);
        }

        var episodeKeys = Object.keys(grouped);
        var durations = [];
        var watchedNumbers = [];
        episodeKeys.forEach(function (key) {
            var episode = grouped[key];
            if (episode.watched) {
                stats.watched += 1;
                if (key !== 'local' && key.indexOf('video:') !== 0) {
                    var watchedNumber = Number(key);
                    if (watchedNumber > 0) watchedNumbers.push(watchedNumber);
                }
            }
            var representative = median(episode.durations);
            if (representative > 0) durations.push(representative);
        });
        watchedNumbers.sort(function (a, b) { return a - b; });
        stats.watchedNumbers = watchedNumbers;
        stats.watchedTitle = formatWatchedEpisodeNumbers(watchedNumbers);
        stats.watchedLabel = compactWatchedEpisodeLabel(watchedNumbers) || (stats.watched ? String(stats.watched) : '');
        if (!stats.aired && episodeKeys.length) stats.aired = episodeKeys.length;
        if (!stats.total && stats.aired) stats.total = stats.aired;
        if (durations.length) {
            stats.minutes = Math.max(1, Math.round(durations.reduce(function (sum, value) { return sum + value; }, 0) / durations.length / 60));
        } else {
            var fallbackDuration = positiveNumber(item.yani_episode_duration || item.episode_duration || item.duration);
            if (fallbackDuration) stats.minutes = Math.max(1, Math.round(fallbackDuration > 300 ? fallbackDuration / 60 : fallbackDuration));
        }
        return stats;
    }

    function mediaTypeInfo(value) {
        var source = value && typeof value === 'object' ? value : {};
        var full = String(source.name || source.title || source.title_long || '').trim();
        // `alias` is a routing/filter value in parts of the API and is not a
        // user-facing abbreviation. Prefer only the documented short-name
        // fields here.
        var short = String(source.shortname || source.short_name || source.short || '').trim();
        var raw = String(full || short || (typeof value === 'string' ? value : '')).trim();
        if (!raw) return {key: '', full: '', short: ''};

        var normalized = raw.toLowerCase().replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
        var key = '';
        if (/^(?:tv|tv series|series|serial|сериал|серіал)$/.test(normalized)) key = 'series';
        else if (/^(?:movie|film|feature film|full length film|фильм|полнометражный фильм|фільм|повнометражний фільм)$/.test(normalized)) key = 'movie';
        else if (/^(?:short|short film|короткометражный фильм|короткометражний фільм)$/.test(normalized)) key = 'short';
        else if (/^ova$/.test(normalized)) key = 'ova';
        else if (/^ona$/.test(normalized)) key = 'ona';
        else if (/^(?:special|tv special|спецвыпуск|спецвипуск)$/.test(normalized)) key = 'special';
        else if (/^(?:music|music video|музыкальное видео|музичне відео)$/.test(normalized)) key = 'music';

        return {key: key, full: full, short: short};
    }

    // YummyAnime has no separate subtitle flag: kind is inferred from data.dubbing.
    // Voice prefixes must win, otherwise teams like "Kazoku Sub" / "SubVost" land in
    // the subtitles row even when the API labels them as озвучка.
    function translationKind(name) {
        var cleaned = String(name || '').replace(/\s+/g, ' ').trim();
        if (!cleaned) return 'voices';
        // JS \b is ASCII-only, so Cyrillic prefixes need an explicit separator.
        if (/^(?:озвучка|озвучення|дубляж|dub(?:bing)?|voice(?:\s*over)?)(?:$|[\s:：\-–—])/i.test(cleaned)) return 'voices';
        if (/^(?:субтитры|субтитри|sub(?:title|titles)?s?|сабы?)(?:$|[\s:：\-–—])/i.test(cleaned)) return 'subtitles';
        if (/(?:soft\s*subs?|hard\s*subs?|fansubs?|softsub|hardsub|софт\s*саб(?:ы)?|хард\s*саб(?:ы)?|closed\s*captions?|(?:^|[\s\[(/_-])(?:subs?|сабы?)(?:$|[\s\])/_-]))/i.test(cleaned)) {
            return 'subtitles';
        }
        if (/субтитр|субтитри/i.test(cleaned)) return 'subtitles';
        return 'voices';
    }

    function translationLabel(name, kind) {
        var cleaned = String(name || '').replace(/\s+/g, ' ').trim();
        if (!cleaned) return '';
        // Section headings already say "Озвучка" / "Субтитры", so keep that
        // word on a chip only when the API did not provide a team name.
        var prefix = kind === 'subtitles'
            ? /^(?:субтитры|субтитри|sub(?:title|titles)?s?|сабы?)\s*[:\-–—]?\s+/i
            : /^(?:озвучка|озвучення|дубляж|dub(?:bing)?|voice(?:\s*over)?)\s*[:\-–—]?\s+/i;
        var withoutPrefix = cleaned.replace(prefix, '').trim();
        return withoutPrefix || cleaned;
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.UiUtils = window.LampaYaniUiUtils = {
        videoData: videoData,
        normalizeVideoUrl: normalizeVideoUrl,
        videoHost: videoHost,
        posterUrl: posterUrl,
        posterSources: posterSources,
        titleValues: titleValues,
        normalizeMatchTitle: normalizeMatchTitle,
        stripSeasonSuffix: stripSeasonSuffix,
        parseSeasonHint: parseSeasonHint,
        cardSeasonHint: cardSeasonHint,
        isSafeTmdbSeasonMatch: isSafeTmdbSeasonMatch,
        standardSearchTitles: standardSearchTitles,
        scoreTitleMatch: scoreTitleMatch,
        titleTokenJaccard: titleTokenJaccard,
        titleEditSimilarity: titleEditSimilarity,
        isAnimeTmdbCard: isAnimeTmdbCard,
        yummyTvDetailsUrl: yummyTvDetailsUrl,
        internalPlayerItem: internalPlayerItem,
        detailRouteId: detailRouteId,
        formatWatchedEpisodeNumbers: formatWatchedEpisodeNumbers,
        compactWatchedEpisodeLabel: compactWatchedEpisodeLabel,
        detailEpisodeStats: detailEpisodeStats,
        mediaTypeInfo: mediaTypeInfo,
        translationKind: translationKind,
        translationLabel: translationLabel
    };
}(window));
