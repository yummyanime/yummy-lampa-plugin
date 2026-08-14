(function (window) {
    'use strict';

    // Shared YummyAnime → Lampa card mapping used by catalog, detail, and
    // standard-card integration. Keeps rating/media/progress derivation in one place.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var getPlayback = deps.getPlayback || function () { return null; };
        var formatRating = deps.formatRating || function (value) {
            var number = Number(value);
            if (!(number > 0)) return '—';
            return number.toFixed(1);
        };
        var createRatingLogo = deps.createRatingLogo || function (rating, className) {
            return $('<span></span>').addClass(className || '').text((rating && (rating.short || rating.key)) || '');
        };

        function extractRatings(rating) {
            rating = rating && typeof rating === 'object' ? rating : {average: rating};
            return [
                {key: 'yummy', short: 'YA', title: 'YummyAnime', value: Number(rating.average || 0)},
                {key: 'kp', short: 'KP', title: t('kinopoisk'), value: Number(rating.kp_rating || 0)},
                {key: 'shikimori', short: 'SH', title: 'Shikimori', value: Number(rating.shikimori_rating || 0)},
                {key: 'anidub', short: 'AD', title: 'AniDUB', value: Number(rating.anidub_rating || 0)},
                {key: 'mal', short: 'MAL', title: 'MyAnimeList', value: Number(rating.myanimelist_rating || 0)},
                {key: 'worldart', short: 'WA', title: 'World-Art', value: Number(rating.worldart_rating || 0)}
            ].filter(function (item) { return Number(item.value) > 0; });
        }

        function mediaMeta(item) {
            item = item || {};
            var videos = Array.isArray(item.videos) ? item.videos : [];
            var voices = {};
            var quality = 0;
            videos.forEach(function (video) {
                var data = window.LampaYaniUiUtils && window.LampaYaniUiUtils.videoData
                    ? window.LampaYaniUiUtils.videoData(video)
                    : {};
                var voice = data.dubbing || data.translation || data.voice || data.player;
                if (voice) voices[String(voice)] = true;
                [video.quality, video.resolution, data.quality, data.resolution].forEach(function (value) {
                    var match = String(value || '').match(/(2160|1440|1080|720|576|480|360)\s*p?/i);
                    if (match) quality = Math.max(quality, Number(match[1]));
                    if (/4k/i.test(String(value || ''))) quality = Math.max(quality, 2160);
                });
            });
            var translates = Array.isArray(item.translates) ? item.translates.length : 0;
            return {
                voices: Object.keys(voices).length || translates,
                quality: quality >= 2160 ? '4K' : quality ? quality + 'p' : ''
            };
        }

        function watchedEpisodeCount(item, animeId) {
            item = item || {};
            var user = item.user || {};
            var state = user.list || item.list || {};
            var nested = state.list && typeof state.list === 'object' ? state.list : {};
            var candidates = [
                state.watched_episodes, state.episodes_watched, state.watched, state.progress,
                nested.watched_episodes, nested.episodes_watched, nested.watched, nested.progress,
                item.watched_episodes, item.episodes_watched
            ];
            var episodes = item.episodes && typeof item.episodes === 'object' ? item.episodes : {};
            var total = Number(episodes.aired || episodes.count || episodes.total || item.episodes_count || 0);
            for (var index = 0; index < candidates.length; index++) {
                var explicit = Number(candidates[index]);
                if (explicit > 0 && explicit < 1 && total > 0) return Math.floor(explicit * total);
                if (explicit >= 1) return Math.floor(explicit);
            }
            var playback = animeId ? getPlayback(animeId) : null;
            var episode = playback && Number(playback.number);
            if (!(episode > 0)) return 0;
            var duration = Number(playback.duration || 0);
            var position = Number(playback.time || 0);
            return Math.max(0, Math.floor(episode) - (duration > 0 && position / duration < 0.75 ? 1 : 0));
        }

        function toCard(item) {
            item = item || {};
            if (item.anime && typeof item.anime === 'object') {
                var nestedAnime = Object.assign({}, item.anime);
                if (item.user) nestedAnime.user = item.user;
                item = nestedAnime;
            }
            var title = item.title || item.name || item.russian || item.original_title || t('untitled');
            var titles = window.LampaYaniUiUtils && window.LampaYaniUiUtils.titleValues
                ? window.LampaYaniUiUtils.titleValues(item)
                : [];
            if (titles.indexOf(title) < 0) titles.unshift(title);
            var poster = window.LampaYaniUiUtils && window.LampaYaniUiUtils.posterUrl
                ? (window.LampaYaniUiUtils.posterUrl(item.poster) || window.LampaYaniUiUtils.posterUrl(item.cover) || window.LampaYaniUiUtils.posterUrl(item.image) || window.LampaYaniUiUtils.posterUrl(item.poster_url))
                : '';
            var rating = typeof item.rating === 'object' ? item.rating.average : item.rating;
            var votes = typeof item.rating === 'object' ? item.rating.counters : item.rating_counters;
            var ratings = extractRatings(item.rating);
            var animeId = item.anime_id || item.animeId || item.id || item._id;
            return {
                title: title,
                original_title: item.original_title || item.japanese || title,
                yani_titles: titles,
                poster: poster,
                img: poster,
                release_date: String(item.year || item.release_year || ''),
                vote_average: rating || item.score || item.rating_score || 0,
                vote_count: votes || item.votes || item.vote_count || 0,
                yani_rating: rating || item.score || item.rating_score || 0,
                yani_ratings: ratings,
                yani_media: mediaMeta(item),
                overview: item.description || item.synopsis || '',
                yani_id: animeId,
                yani_url: item.anime_url || item.url,
                yani_comments_count: Number(item.comments_count || 0),
                yani_list_id: item.user && item.user.list && item.user.list.list ? Number(item.user.list.list.id) : null,
                yani_is_favorite: Boolean(item.user && item.user.list && item.user.list.is_fav),
                yani_user_rating: Number(item.user && (item.user.rate || item.user.rating || item.user.score) || item.user_rate || 0) || null,
                yani_viewing_order: Array.isArray(item.viewing_order) ? item.viewing_order : [],
                yani_genres: item.genres || item.genre || [],
                yani_genre_top: item.yani_genre_top && typeof item.yani_genre_top === 'object' ? item.yani_genre_top : null,
                yani_type: item.type || null,
                yani_status: item.anime_status || item.status || null,
                yani_year: item.year || item.release_year || null,
                yani_episodes: item.episodes || null,
                yani_watched_episodes: watchedEpisodeCount(item, animeId),
                yani_seasons: Array.isArray(item.seasons) ? item.seasons : null,
                yani_seasons_count: Number(item.seasons_count || item.season_count || 0) || 0,
                yani_episode_duration: Number(item.episode_duration || item.average_episode_duration || item.duration || 0) || 0,
                yani_update_date: item.yani_update_date || item.updated_at || item.update_date || item.last_update || null,
                yani_remote_ids: item.remote_ids || {}
            };
        }

        function createDetailRatings(ratings, votes) {
            var items = (ratings || []).filter(function (rating) { return rating && Number(rating.value) > 0; });
            if (!items.length) return $();
            var block = $('<div class="yani-ratings" role="group"></div>');
            items.forEach(function (rating) {
                var item = $('<div class="yani-ratings__item"></div>');
                var label = rating.title || rating.key;
                if (rating.key === 'yummy' && votes) label += ' · ' + votes + ' ' + t('ratings_count');
                item.attr('title', label);
                item.attr('aria-label', label);
                item.append(createRatingLogo(rating, 'yani-ratings__logo'));
                item.append($('<span class="yani-ratings__value"></span>').text(formatRating(rating.value)));
                if (rating.key === 'yummy' && votes) {
                    item.append($('<span class="yani-ratings__votes"></span>').text(votes + ' ' + t('ratings_count')));
                }
                block.append(item);
            });
            return block;
        }

        return {
            extractRatings: extractRatings,
            mediaMeta: mediaMeta,
            watchedEpisodeCount: watchedEpisodeCount,
            toCard: toCard,
            createDetailRatings: createDetailRatings
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.CardModel = window.LampaYaniCardModel = {
        create: create
    };
}(window));
