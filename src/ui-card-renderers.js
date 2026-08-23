(function (window) {
    'use strict';

    // Shared YummyAnime card decoration helpers. Catalog/search/history cards
    // all bind through these so badge, metadata and progress markup stay in one
    // place while the enter/open lifecycle remains in ui.js.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var locale = deps.locale || function () { return 'ru'; };
        var getPlayback = deps.getPlayback || function () { return null; };
        var mediaMeta = deps.mediaMeta || function () { return {}; };
        var loadVideos = deps.loadVideos || function () { return Promise.reject(new Error('videos unavailable')); };

        function cardRenderElement(element, card) {
            var render = element && element.jquery ? element : element ? $(element) : $();
            if (!render.length && card && card.render) render = $(card.render(true));
            return render;
        }

        function addCardMediaBadges(element, card) {
            var requested = false;
            var cardRender = cardRenderElement(element, card);
            renderCardMediaBadges(element, card, card.yani_media || mediaMeta(card));
            if (!card.yani_id || (card.yani_media && card.yani_media.loaded)) return;

            cardRender.off('hover:focus.yaniMedia').one('hover:focus.yaniMedia', function () {
                if (requested) return;
                requested = true;
                loadVideos(card.yani_id).then(function (payload) {
                    var videos = payload && payload.response ? payload.response : payload;
                    card.yani_media = mediaMeta({videos: Array.isArray(videos) ? videos : []});
                    card.yani_media.loaded = true;
                    renderCardMediaBadges(element, card, card.yani_media);
                }).catch(function () {});
            });
        }

        function mediaTypeLabels(value) {
            var info = LampaYaniUiUtils.mediaTypeInfo(value);
            if (!info.key && !info.full && !info.short) return null;
            var fallback = info.key ? t('media_type_' + info.key) : '';
            var fallbackShort = info.key ? t('media_type_' + info.key + '_short') : '';
            return {
                full: info.full || fallback || info.short,
                short: info.short || fallbackShort || fallback || info.full
            };
        }

        function renderCardMediaBadges(element, card, meta) {
            meta = meta || {};
            var genreTop = genreTopPosition(card);
            if (!meta.quality && !meta.voices && !genreTop) return;
            var render = cardRenderElement(element, card);
            var view = $('.card__view', render).first();
            if (!view.length) return;
            var block = $('.yani-card-media', view);
            if (!block.length) block = $('<div class="yani-card-media"></div>').appendTo(view);
            block.empty();
            if (genreTop) {
                var topLabel = t('genre_top_position')
                    .replace('{genre}', card.yani_genre_top.genre || '')
                    .replace('{position}', genreTop);
                var topBadge = $('<span class="yani-card-media__badge yani-card-media__genre-top"></span>')
                    .attr({'title': topLabel, 'aria-label': topLabel});
                topBadge.append('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v3h3v2c0 3.2-1.8 5.5-5 6.3V17h3v3H6v-3h3v-2.7C5.8 13.5 4 11.2 4 8V6h3V3Zm0 5H6c0 1.7.8 3 2.3 3.7A8.8 8.8 0 0 1 7 8Zm10 0c-.1 1.4-.5 2.6-1.3 3.7C17.2 11 18 9.7 18 8h-1Z"/></svg>');
                topBadge.append($('<b></b>').text('#' + genreTop));
                block.append(topBadge);
            }
            if (meta.quality || meta.voices) {
                var availability = $('<span class="yani-card-media__availability"></span>');
                if (cardMediaMotionAllowed()) availability.addClass('yani-card-media__availability--motion');
                if (meta.quality) {
                    var quality = $('<span class="yani-card-media__availability-part yani-card-media__quality"></span>');
                    quality.append('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H4zM8 20h8M12 16.5V20"/></svg>');
                    quality.append($('<b></b>').text(meta.quality));
                    availability.append(quality);
                }
                if (meta.voices) {
                    var voicesLabel = meta.voices + ' ' + t('voices_short');
                    var voices = $('<span class="yani-card-media__availability-part yani-card-media__voices"></span>')
                        .attr({'title': voicesLabel, 'aria-label': voicesLabel});
                    voices.append('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H5l-3 3 3 3h4l5 4V5L9 9Zm8.5.2a4 4 0 0 1 0 5.6M20 6.5a7.5 7.5 0 0 1 0 11"/></svg>');
                    voices.append($('<b></b>').text(meta.voices));
                    voices.append($('<small></small>').text(t('voices_short')));
                    availability.append(voices);
                }
                block.append(availability);
            }
        }

        function cardMediaMotionAllowed() {
            var navigatorInfo = window.navigator || {};
            var reduced = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            var lowMemory = Number(navigatorInfo.deviceMemory || 0) > 0 && Number(navigatorInfo.deviceMemory) <= 2;
            var lowCpu = Number(navigatorInfo.hardwareConcurrency || 0) > 0 && Number(navigatorInfo.hardwareConcurrency) <= 2;
            return !reduced && !lowMemory && !lowCpu;
        }

        function genreTopPosition(card) {
            var top = card && card.yani_genre_top;
            var position = Number(top && top.position);
            return position >= 1 && position <= 100 ? Math.floor(position) : 0;
        }

        function cardStatusLabel(status) {
            if (!status) return '';
            if (typeof status === 'string') return status;
            if (status.title) return status.title;
            var aliases = {released: 'status_released', ongoing: 'status_ongoing', announced: 'status_announced'};
            return status.alias && aliases[status.alias] ? t(aliases[status.alias]) : '';
        }

        function cardStatusKey(status) {
            var value = typeof status === 'string' ? status : status && (status.alias || status.title) || '';
            value = String(value).toLowerCase();
            if (/ongoing|онго|онґо|выходит|виходить/.test(value)) return 'ongoing';
            if (/announce|анонс/.test(value)) return 'announced';
            if (/released|вышел|вийшов|заверш/.test(value)) return 'released';
            return 'unknown';
        }

        function cardEpisodesLabel(episodes, watched) {
            if (!episodes) return '';
            var total = typeof episodes === 'number' ? Number(episodes) : Number(episodes.count || episodes.total || 0);
            var aired = typeof episodes === 'object' ? Number(episodes.aired || episodes.released || 0) : 0;
            watched = Math.max(0, Math.floor(Number(watched || 0)));
            var available = aired || total;
            if (watched > 0 && available > 0) return Math.min(watched, available) + '/' + available + ' ' + t('episodes_short');
            if (aired > 0 && total > 0 && aired !== total) return aired + '/' + total + ' ' + t('episodes_short');
            var count = total || aired;
            return count > 0 ? count + ' ' + t('episodes_short') : '';
        }

        function addCardMetadata(element, card) {
            var render = cardRenderElement(element, card);
            if (!render.length || render.find('.yani-card-meta').length) return;
            var values = [];
            var type = mediaTypeLabels(card && card.yani_type);
            if (type && type.short) values.push({kind: 'type', text: type.short});
            var status = cardStatusLabel(card && card.yani_status);
            if (status) values.push({kind: 'status status--' + cardStatusKey(card.yani_status), text: status});
            var episodes = cardEpisodesLabel(card && card.yani_episodes, card && card.yani_watched_episodes);
            if (episodes) values.push({kind: 'episodes', text: episodes});
            var year = String(card && (card.yani_year || card.release_date) || '').slice(0, 4);
            if (/^\d{4}$/.test(year)) values.push({kind: 'year', text: year});
            if (!values.length) return;

            var metadata = $('<div class="yani-card-meta" aria-hidden="true"></div>');
            values.forEach(function (value) {
                metadata.append($('<span></span>').addClass(value.kind.split(' ').map(function (name) {
                    return 'yani-card-meta__' + name;
                }).join(' ')).text(value.text));
            });
            var age = render.find('.card__age').first();
            var title = render.find('.card__title').first();
            if (age.length) age.addClass('yani-card-meta__native-age').after(metadata);
            else if (title.length) title.after(metadata);
            else render.append(metadata);
        }

        function cardUpdateTimestamp(value) {
            if (value === undefined || value === null || value === '') return 0;
            var numeric = Number(value);
            if (isFinite(numeric) && numeric > 0) return numeric < 1000000000000 ? numeric * 1000 : numeric;
            var parsed = Date.parse(String(value));
            return isNaN(parsed) ? 0 : parsed;
        }

        function cardFreshness(value) {
            var timestamp = cardUpdateTimestamp(value);
            if (!timestamp) return null;
            var now = new Date();
            var updated = new Date(timestamp);
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            var updatedDay = new Date(updated.getFullYear(), updated.getMonth(), updated.getDate()).getTime();
            var days = Math.round((today - updatedDay) / 86400000);
            if (days < 0) return null;
            if (days === 0) return {label: t('fresh_today'), recent: true};
            if (days === 1) return {label: t('fresh_yesterday'), recent: true};
            try {
                return {label: updated.toLocaleDateString(locale(), {day: 'numeric', month: 'short'}), recent: days < 7};
            } catch (error) {
                var month = updated.getMonth() + 1;
                return {label: updated.getDate() + '.' + (month < 10 ? '0' : '') + month, recent: days < 7};
            }
        }

        function addCardUpdateBadge(element, card) {
            if (!card) return;
            var freshness = cardFreshness(card.yani_update_date || card.yani_updated_at);
            if (!card.yani_update_episode && !card.yani_update_label && !freshness) return;
            var render = cardRenderElement(element, card);
            var view = $('.card__view', render).first();
            if (!view.length || view.find('.yani-card-update').length) return;
            var label = card.yani_update_label || t('episode') + ' ' + card.yani_update_episode;
            var badge = $('<span class="yani-card-update"></span>');
            if (label) badge.append($('<span class="yani-card-update__label"></span>').text(label));
            if (freshness) badge.append($('<span class="yani-card-update__freshness"></span>').text(freshness.label));
            if (freshness && freshness.recent) {
                badge.addClass('yani-card-update--fresh');
                render.addClass('yani-card--fresh');
            }
            view.append(badge);
        }

        function addCardRecommendationBadge(element, card) {
            if (!card || !card.yani_recommendation_label) return;
            var render = cardRenderElement(element, card);
            var view = $('.card__view', render).first();
            if (!view.length || view.find('.yani-card-recommendation').length) return;
            view.append($('<span class="yani-card-recommendation"></span>').text(card.yani_recommendation_label));
        }

        function syncCardOverlayLayout(element, card) {
            var render = cardRenderElement(element, card);
            var view = $('.card__view', render).first();
            if (!view.length) return view;
            var root = view[0];
            if (!root || !root.classList) return view;

            var list = root.querySelector('.yani-card-list');
            var playback = root.querySelector('.yani-card-playback');
            var history = root.querySelector('.yani-card-history');
            var progress = root.querySelector('.yani-card-playback-progress, .yani-card-history-progress');
            var ratings = root.querySelector('.yani-card-ratings');
            var update = root.querySelector('.yani-card-update');
            var availability = root.querySelector('.yani-card-media__availability');
            var voices = root.querySelector('.yani-card-media__voices');
            var genreTop = root.querySelector('.yani-card-media__genre-top');
            var recommendation = root.querySelector('.yani-card-recommendation');
            var media = root.querySelector('.yani-card-media');

            var hasFooter = Boolean(list || playback || history);
            var hasProgress = Boolean(progress);
            var hasRatings = Boolean(ratings);
            var hasTopEnd = Boolean(update || history);
            var hasTopStart = Boolean((media && media.children && media.children.length) || recommendation);

            root.classList.toggle('yani-card-view--has-footer', hasFooter);
            root.classList.toggle('yani-card-view--has-progress', hasProgress);
            root.classList.toggle('yani-card-view--has-ratings', hasRatings);
            root.classList.toggle('yani-card-view--has-top-end', hasTopEnd);
            root.classList.toggle('yani-card-view--has-top-start', hasTopStart);

            var width = root.clientWidth || root.offsetWidth || 0;
            var height = root.clientHeight || root.offsetHeight || 0;
            var fontSize = 16;
            try {
                fontSize = parseFloat(window.getComputedStyle(root).fontSize) || fontSize;
            } catch (error) {}
            fontSize = Math.max(fontSize, 1);

            var plan = cardOverlayPriorityPlan({
                width: width,
                height: height,
                emWidth: width / fontSize,
                emHeight: height / fontSize,
                list: Boolean(list),
                playback: Boolean(playback),
                history: Boolean(history),
                progress: hasProgress,
                ratings: hasRatings,
                update: Boolean(update),
                updateFreshness: Boolean(update && update.querySelector('.yani-card-update__freshness')),
                availability: Boolean(availability),
                voices: Boolean(voices),
                genreTop: Boolean(genreTop),
                recommendation: Boolean(recommendation)
            });

            root.classList.toggle('yani-card-view--hide-recommendation', plan.recommendation);
            root.classList.toggle('yani-card-view--hide-ratings', plan.ratings);
            root.classList.toggle('yani-card-view--hide-genre-top', plan.genreTop);
            root.classList.toggle('yani-card-view--hide-voices', plan.voices);
            root.classList.toggle('yani-card-view--hide-availability', plan.availability);
            root.classList.toggle('yani-card-view--hide-update-freshness', plan.updateFreshness);
            root.classList.toggle('yani-card-view--hide-update', plan.update);

            return view;
        }

        // Small-poster priority (keep → hide): list, progress, fresh episode,
        // quality/voices, genre top, ratings. Secondary badges disappear instead
        // of stacking on top of higher-priority chrome.
        function cardOverlayPriorityPlan(state) {
            state = state || {};
            var hide = {
                recommendation: false,
                ratings: false,
                genreTop: false,
                voices: false,
                availability: false,
                updateFreshness: false,
                update: false
            };
            var width = Number(state.width || 0);
            var height = Number(state.height || 0);
            // Prefer font-relative size so Lampa interface scale (root em) and
            // 720p/4K CSS pixels do not change when badges start collapsing.
            var emWidth = Number(state.emWidth || 0);
            var emHeight = Number(state.emHeight || 0);
            if (!(emWidth > 0) && width > 0) emWidth = width / 16;
            if (!(emHeight > 0) && height > 0) emHeight = height / 16;
            var pressure = 0;

            if (emWidth > 0) {
                if (emWidth < 11.5) pressure += 1;
                if (emWidth < 9.7) pressure += 1;
                if (emWidth < 8.1) pressure += 1;
            }
            if (emWidth > 0 && emWidth < 12.5) {
                if (emHeight > 0 && emHeight < 12.5) pressure += 1;
                if (state.list && (state.playback || state.history)) pressure += 1;
                if (state.ratings && (state.list || state.playback || state.progress)) pressure += 1;
                if ((state.availability || state.genreTop) && (state.update || state.history)) pressure += 1;
            }

            if (state.recommendation && (state.availability || state.genreTop || state.update || state.history)) {
                hide.recommendation = true;
            }

            // Fresh episode outranks quality/top/ratings: only trim its date text
            // here, and drop the whole badge in extreme widths below.
            var steps = [];
            if (state.ratings) steps.push(function () { hide.ratings = true; });
            if (state.genreTop) steps.push(function () { hide.genreTop = true; });
            if (state.voices) steps.push(function () { hide.voices = true; });
            if (state.availability) steps.push(function () { hide.availability = true; });
            if (state.updateFreshness) steps.push(function () { hide.updateFreshness = true; });

            for (var index = 0; index < Math.min(pressure, steps.length); index++) steps[index]();

            if (state.update && emWidth > 0 && emWidth < 6.6 && (state.list || state.playback || state.progress || state.history)) {
                hide.update = true;
            }

            return hide;
        }

        function listBadgeKey(card) {
            var keys = {0: 'watching', 1: 'planned', 2: 'completed', 3: 'dropped', 5: 'postponed'};
            if (card && card.yani_list_id !== null && card.yani_list_id !== undefined && card.yani_list_id !== '') {
                return keys[Number(card.yani_list_id)] || '';
            }
            return card && card.yani_is_favorite ? 'favorites' : '';
        }

        function listBadgeIcon(key) {
            var icons = {
                watching: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>',
                planned: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h13a3 3 0 0 0 .4-6A6.5 6.5 0 0 0 6 10.5 3.8 3.8 0 0 0 5 18Z"/></svg>',
                completed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4m1 1h10l-2.3 3L17 11H7"/></svg>',
                dropped: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 16M10.6 6.3A9.8 9.8 0 0 1 12 6c5.8 0 9 6 9 6a15 15 0 0 1-2.1 3M7.2 7.3C4.5 9.2 3 12 3 12s3.2 6 9 6c1.1 0 2.1-.2 3-.6"/></svg>',
                postponed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10M7 21h10M8 4c0 4 1.2 5.5 4 8-2.8 2.5-4 4-4 8M16 4c0 4-1.2 5.5-4 8 2.8 2.5 4 4 4 8"/></svg>',
                favorites: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 8.8c0 5-8.5 10.2-8.5 10.2S3.5 13.8 3.5 8.8A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.5 1.6Z"/></svg>'
            };
            return icons[key] || icons.watching;
        }

        function addCardListBadge(element, card) {
            if (!card || (card.yani_list_id === null && !card.yani_is_favorite)) return;
            var render = cardRenderElement(element, card);
            var view = $('.card__view', render).first();
            if (!view.length) return;
            var key = listBadgeKey(card);
            if (!key && !card.yani_is_favorite) return;
            var labels = {0: t('watching'), 1: t('planned'), 2: t('completed'), 3: t('dropped'), 5: t('postponed')};
            var label = labels[card.yani_list_id] || (card.yani_is_favorite ? t('favorite') : '');
            if (card.yani_is_favorite && labels[card.yani_list_id]) label += ' · ' + t('favorite');
            var badge = $('.yani-card-list', view);
            if (!badge.length) badge = $('<span class="yani-card-list"></span>').appendTo(view);
            badge.empty()
                .removeClass('yani-card-list--watching yani-card-list--planned yani-card-list--completed yani-card-list--dropped yani-card-list--postponed yani-card-list--favorites')
                .addClass('yani-card-list--' + (key || 'favorites'))
                .attr('title', label)
                .attr('aria-label', label);
            badge.append($('<span class="yani-card-list__icon"></span>').html(listBadgeIcon(key || 'favorites')));
            if (card.yani_is_favorite && key && key !== 'favorites') {
                badge.append($('<span class="yani-card-list__icon yani-card-list__icon--fav"></span>').html(listBadgeIcon('favorites')));
            }
        }

        function cardPlaybackState(card) {
            if (!card) return null;
            var playback = card.yani_resume || getPlayback(card.yani_id) || {};
            var duration = Math.max(0, Number(playback.duration || 0));
            var position = Math.max(0, Number(playback.time || 0));
            var progress = duration > 0 ? position / duration : Number(card.yani_list_progress || 0);
            progress = Math.max(0, Math.min(1, progress));
            var episode = playback.number || card.yani_watched_episodes || '';
            if (!episode && !(progress > 0)) return null;
            var reached = Math.max(0, Number(playback.max_episode || 0));
            return {
                episode: episode,
                // How far the viewer got overall, shown next to the episode the
                // queue is offering. Without it a card reading "episode 5" is
                // ambiguous: resumed halfway, or waiting to be started?
                reached: reached > Number(episode || 0) ? reached : 0,
                next: Boolean(playback.resume_next),
                percent: progress > 0 ? Math.round(progress * 100) : 0,
                progress: progress
            };
        }

        function addCardPlaybackProgress(element, card) {
            var state = cardPlaybackState(card);
            var render = cardRenderElement(element, card);
            var view = $('.card__view', render).first();
            if (!view.length) return;
            var existing = view.find('.yani-card-playback, .yani-card-playback-progress');
            if (!state) {
                if (existing.length) existing.remove();
                return;
            }
            existing.remove();
            var parts = [];
            if (state.episode) parts.push((state.next ? '▶ ' : '') + t('episode') + ' ' + state.episode);
            if (state.percent) parts.push(state.percent + '%');
            else if (state.reached) parts.push(t('episodes_watched') + ' ' + state.reached);
            view.append($('<span class="yani-card-playback"></span>').text(parts.join(' · ')));
            if (state.progress > 0) {
                view.append($('<span class="yani-card-playback-progress"><span></span></span>')
                    .find('span').css('width', state.percent + '%').end());
            }
        }

        function formatRating(value) {
            return Number(value) > 0 ? Number(value).toFixed(1) : '—';
        }

        function createRatingLogo(rating, className) {
            return $('<span class="' + className + ' yani-rating-logo yani-rating-logo--' + rating.key + '"></span>')
                .text(rating.short || rating.key)
                .attr('title', rating.title || rating.key)
                .attr('aria-label', rating.title || rating.key);
        }

        function visibleCardRatings(ratings) {
            var positive = (ratings || []).filter(function (rating) {
                return rating && Number(rating.value) > 0;
            });
            positive.sort(function (a, b) {
                if (a.key === 'yummy') return -1;
                if (b.key === 'yummy') return 1;
                return Number(b.value) - Number(a.value);
            });
            return positive.slice(0, 3);
        }

        function addCardRatings(element, card) {
            var ratings = visibleCardRatings(card && card.yani_ratings);
            if (!ratings.length || !card) return;
            var render = cardRenderElement(element, card);
            var view = $('.card__view', render).first();
            if (!view.length) return;
            // Lampa may call cardRender repeatedly for the same node. Keep the
            // first compact panel instead of rebuilding chips on every paint.
            if (view.find('.yani-card-ratings').length) return;

            $('.card__vote', render).hide();
            var block = $('<div class="yani-card-ratings" role="group" aria-label="ratings"></div>');
            ratings.forEach(function (rating) {
                var badge = $('<div class="yani-card-rating yani-card-rating--' + rating.key + '"></div>');
                badge.attr('title', (rating.title || rating.key) + ' ' + formatRating(rating.value));
                badge.append(createRatingLogo(rating, 'yani-card-rating__logo'));
                badge.append($('<span class="yani-card-rating__value"></span>').text(formatRating(rating.value)));
                block.append(badge);
            });
            view.append(block);
        }

        function decorate(element, card) {
            addCardRatings(element, card);
            addCardMediaBadges(element, card);
            addCardMetadata(element, card);
            addCardUpdateBadge(element, card);
            addCardRecommendationBadge(element, card);
            addCardListBadge(element, card);
            addCardPlaybackProgress(element, card);
            syncCardOverlayLayout(element, card);
        }

        return {
            cardRenderElement: cardRenderElement,
            addCardMediaBadges: addCardMediaBadges,
            mediaTypeLabels: mediaTypeLabels,
            renderCardMediaBadges: renderCardMediaBadges,
            cardMediaMotionAllowed: cardMediaMotionAllowed,
            genreTopPosition: genreTopPosition,
            cardStatusLabel: cardStatusLabel,
            cardStatusKey: cardStatusKey,
            cardEpisodesLabel: cardEpisodesLabel,
            addCardMetadata: addCardMetadata,
            cardUpdateTimestamp: cardUpdateTimestamp,
            cardFreshness: cardFreshness,
            addCardUpdateBadge: addCardUpdateBadge,
            addCardRecommendationBadge: addCardRecommendationBadge,
            listBadgeKey: listBadgeKey,
            listBadgeIcon: listBadgeIcon,
            addCardListBadge: addCardListBadge,
            cardPlaybackState: cardPlaybackState,
            addCardPlaybackProgress: addCardPlaybackProgress,
            syncCardOverlayLayout: syncCardOverlayLayout,
            cardOverlayPriorityPlan: cardOverlayPriorityPlan,
            formatRating: formatRating,
            createRatingLogo: createRatingLogo,
            visibleCardRatings: visibleCardRatings,
            addCardRatings: addCardRatings,
            decorate: decorate
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.CardRenderers = window.LampaYaniCardRenderers = {
        create: create
    };
}(window));
