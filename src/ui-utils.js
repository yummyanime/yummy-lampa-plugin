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

    function posterUrl(value) {
        if (!value) return '';
        if (typeof value === 'string') {
            value = value.trim();
            return value.indexOf('//') === 0 ? 'https:' + value : value;
        }
        if (typeof value !== 'object') return '';
        return posterUrl(
            value.huge || value.mega || value.big || value.large ||
            value.fullsize || value.original || value.full ||
            value.medium || value.small || value.preview || value.url || ''
        );
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
            if (Array.isArray(list)) list.forEach(function (value) { add(typeof value === 'string' ? value : value && (value.title || value.name || value.value)); });
        });
        return values;
    }

    function normalizeMatchTitle(value) { return String(value || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').trim(); }

    function standardSearchTitles(card) {
        var result = [], values = titleValues(card || {});
        if (card && Array.isArray(card.yani_titles)) values = values.concat(card.yani_titles);
        values.forEach(function (title) {
            if (result.indexOf(title) < 0) result.push(title);
            var withoutYear = String(title).replace(/\s*[\(\[]?\s*\d{4}\s*[\)\]]?\s*$/i, '').trim();
            if (withoutYear && result.indexOf(withoutYear) < 0) result.push(withoutYear);
        });
        return result;
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
        titleValues: titleValues,
        normalizeMatchTitle: normalizeMatchTitle,
        standardSearchTitles: standardSearchTitles,
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
