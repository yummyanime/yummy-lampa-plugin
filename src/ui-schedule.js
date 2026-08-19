(function (window) {
    'use strict';

    function create(object, deps) {
        var t = deps.t, locale = deps.locale, toCard = deps.toCard;
        var playbackSourceId = deps.playbackSourceId || function () { return ''; };
        var isPlaybackSourceEnabled = deps.isPlaybackSourceEnabled || function () { return true; };
        var scroll = new Lampa.Scroll({mask: true, over: true, step: 250});
        scroll.minus();
        var html = $('<div class="yani-schedule"></div>');
        var content = $('<div class="yani-schedule__content"></div>');
        var last, dayGroups = [], selectedDay = 0, remoteShortcutHandler = null, videosCache = {}, ratingCache = {};
        var focusScope = LampaYaniNavigation.createScope({
            id: 'schedule:' + String(object && object.url || 'yani/schedule'),
            root: function () { return html; },
            collection: function () { return scroll.render(); },
            scroll: scroll,
            selector: '.selector',
            fallback: function () { return content.find('.yani-schedule__day-chip.selected, .selector').first()[0] || null; }
        });
        function startOfWeek(date) {
            var start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
            return start;
        }
        function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
        function timestampDate(value) {
            var timestamp = Number(value || 0);
            if (!timestamp) return null;
            if (timestamp < 100000000000) timestamp *= 1000;
            var date = new Date(timestamp);
            return isNaN(date.getTime()) ? null : date;
        }
        function dayLabel(date, relativeOffset) { var prefix = relativeOffset === 0 ? t('today') + ', ' : relativeOffset === 1 ? t('tomorrow') + ', ' : ''; try { return prefix + date.toLocaleDateString(locale(), {weekday: 'long', day: 'numeric', month: 'long'}); } catch (error) { return prefix + date.toLocaleDateString(); } }
        function timeLabel(date) { try { return date.toLocaleTimeString(locale(), {hour: '2-digit', minute: '2-digit'}); } catch (error) { return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2); } }
        function dateTimeLabel(date) { try { return date.toLocaleString(locale(), {day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'}); } catch (error) { return date.toLocaleString(); } }
        function episodeLabel(episodes, isAired) { var aired = Number(episodes.aired || 0), count = Number(episodes.count || 0); if (count === 1 && aired === 0) return t('release'); var number = isAired ? aired : aired + 1; return count > 1 ? t('episode') + ' ' + number + ' ' + t('of') + ' ' + count : t('episode') + ' ' + number; }
        function releaseEpisodeNumber(entry) {
            var episodes = entry && entry.item && entry.item.episodes || {};
            var aired = Number(episodes.aired || 0);
            var count = Number(episodes.count || 0);
            if (count === 1 && aired === 0) return 1;
            return entry && entry.aired ? Math.max(1, aired) : aired + 1;
        }
        function appendYummyRating(host, card) {
            host = host && host.jquery ? host : $(host);
            if (!host.length || host.find('.yani-schedule__rating').length) return false;
            var value = window.LampaYaniUiUtils && typeof LampaYaniUiUtils.yummyRatingValue === 'function'
                ? LampaYaniUiUtils.yummyRatingValue(card)
                : 0;
            if (!(value > 0)) return false;
            var text = value.toFixed(1);
            host.append($('<span class="yani-rating-ya yani-schedule__rating"></span>')
                .attr({title: 'YummyAnime ' + text, 'aria-label': 'YummyAnime ' + text})
                .append($('<b></b>').text('YA'))
                .append(document.createTextNode(text)));
            return true;
        }
        function loadAnimeRatingCard(animeId) {
            animeId = String(animeId || '');
            if (!animeId) return Promise.resolve(null);
            if (!ratingCache[animeId]) {
                ratingCache[animeId] = LampaYaniApi.detail(animeId).then(function (payload) {
                    var item = payload && payload.response !== undefined ? payload.response : payload;
                    return item && typeof item === 'object' ? toCard(item) : null;
                }).catch(function () {
                    return null;
                });
            }
            return ratingCache[animeId];
        }
        function enrichItemRating(host, card) {
            if (appendYummyRating(host, card)) return;
            var animeId = card && card.yani_id;
            if (!animeId) return;
            loadAnimeRatingCard(animeId).then(function (detailed) {
                if (!detailed || !host[0] || !document.documentElement.contains(host[0])) return;
                appendYummyRating(host, detailed);
            });
        }
        function videoEpisodeNumber(video) {
            var raw = video && (video.number || video.index || video.episode || video.ep_title || video.episode_title);
            if (typeof raw === 'number') return raw;
            var match = String(raw || '').match(/(\d+(?:\.\d+)?)/);
            return match ? Number(match[1]) : 0;
        }
        function rememberTranslationName(bucket, name) {
            var raw = String(name || '').replace(/\s+/g, ' ').trim();
            if (!raw) return;
            var kind = window.LampaYaniUiUtils && LampaYaniUiUtils.translationKind
                ? LampaYaniUiUtils.translationKind(raw)
                : 'voices';
            var label = window.LampaYaniUiUtils && LampaYaniUiUtils.translationLabel
                ? LampaYaniUiUtils.translationLabel(raw, kind)
                : raw;
            if (!label) return;
            var key = label.toLowerCase();
            if (!bucket[kind][key]) bucket[kind][key] = label;
        }
        function sortedTranslationNames(values) {
            return Object.keys(values).map(function (key) { return values[key]; }).sort(function (a, b) {
                try { return a.localeCompare(b, locale()); } catch (error) { return a.localeCompare(b); }
            });
        }
        function translationGroupsFromVideos(videos, episode) {
            var bucket = {voices: {}, subtitles: {}};
            (videos || []).forEach(function (video) {
                var number = videoEpisodeNumber(video);
                if (episode && number && Number(number) !== Number(episode)) return;
                if (episode && !number) return;
                var data = window.LampaYaniUiUtils && LampaYaniUiUtils.videoData
                    ? LampaYaniUiUtils.videoData(video)
                    : video && video.data || {};
                var sourceId = playbackSourceId(Object.assign({}, video || {}, data || {}));
                if (!isPlaybackSourceEnabled(sourceId)) return;
                rememberTranslationName(bucket, data.dubbing || data.translation || data.voice || video.dub_title || video.dubbing);
            });
            return {
                voices: sortedTranslationNames(bucket.voices),
                subtitles: sortedTranslationNames(bucket.subtitles)
            };
        }
        function loadAnimeVideos(animeId) {
            animeId = String(animeId || '');
            if (!animeId) return Promise.resolve([]);
            if (!videosCache[animeId]) {
                videosCache[animeId] = LampaYaniApi.videos(animeId, {}).then(function (payload) {
                    var videos = payload && payload.response !== undefined ? payload.response : payload;
                    return Object.prototype.toString.call(videos) === '[object Array]' ? videos : [];
                }).catch(function () {
                    return [];
                });
            }
            return videosCache[animeId];
        }
        function renderTranslationRow(kind, title, values) {
            if (!values || !values.length) return null;
            var row = $('<div class="yani-schedule__translation-row yani-schedule__translation-row--' + kind + '"></div>');
            var heading = $('<div class="yani-schedule__translation-heading"></div>');
            heading.append(kind === 'voices'
                ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9H5l-3 3 3 3h4l5 4V5L9 9Zm8.5.2a4 4 0 0 1 0 5.6M20 6.5a7.5 7.5 0 0 1 0 11"/></svg>'
                : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm3 8h4M14 13h4M6 16h7"/></svg>');
            heading.append($('<span></span>').text(title));
            heading.append($('<b></b>').text(values.length));
            row.append(heading);
            var list = $('<div class="yani-schedule__translation-list"></div>');
            values.forEach(function (value) {
                list.append($('<span></span>').attr('title', value).text(value));
            });
            row.append(list);
            return row;
        }
        function paintTranslations(host, groups) {
            host = host && host.jquery ? host : $(host);
            if (!host.length) return;
            host.empty();
            var voices = renderTranslationRow('voices', t('voice_teams'), groups && groups.voices);
            var subtitles = renderTranslationRow('subtitles', t('subtitle_teams'), groups && groups.subtitles);
            if (!voices && !subtitles) {
                host.removeClass('yani-schedule__translations--visible').hide();
                return;
            }
            host.append($('<div class="yani-schedule__translations-title"></div>').text(t('available_translations')));
            if (voices) host.append(voices);
            if (subtitles) host.append(subtitles);
            host.addClass('yani-schedule__translations--visible').show();
        }
        function enrichItemTranslations(host, entry) {
            var item = entry && entry.item || {};
            var animeId = item.anime_id || item.animeId || item.id;
            // Only the episode tied to this schedule day (prev_date → aired N, next_date → N+1).
            var episode = releaseEpisodeNumber(entry);
            var initial = translationGroupsFromVideos(Array.isArray(item.videos) ? item.videos : [], episode);
            paintTranslations(host, initial);
            if (!animeId || !(episode > 0)) return;
            loadAnimeVideos(animeId).then(function (videos) {
                if (!host[0] || !document.documentElement.contains(host[0])) return;
                paintTranslations(host, translationGroupsFromVideos(videos, episode));
            });
        }
        function createItem(entry) {
            var item = entry.item, card = toCard(item), episodes = item.episodes || {}, releaseDate = entry.date || new Date();
            var row = $('<div class="yani-schedule__item selector"></div>'), poster = $('<img class="yani-schedule__poster" alt="">').attr('src', card.poster || '');
            LampaYaniMedia.bindPosterFallback(poster, card);
            var info = $('<div class="yani-schedule__info"></div>'), release = $('<div class="yani-schedule__release"></div>');
            var translations = $('<div class="yani-schedule__translations"></div>').hide();
            var rating = $('<div class="yani-schedule__rating-slot"></div>');
            info.append($('<div class="yani-schedule__title"></div>').text(card.title));
            info.append(rating);
            enrichItemRating(rating, card);
            info.append($('<div class="yani-schedule__episode"></div>').text(episodeLabel(episodes, entry.aired)));
            info.append(translations);
            release.append($('<div class="yani-schedule__time"></div>').text(timeLabel(releaseDate))); release.append($('<div class="yani-schedule__timezone"></div>').text(t('local_time')));
            row.append(poster, info, release);
            enrichItemTranslations(translations, entry);
            // A schedule item already has a YummyAnime id.  Opening its
            // native Lampa match first can show a transient "not found" page
            // before the inevitable YummyAnime fallback, so go straight to
            // the known detail card.
            var opened = false, open = function () { if (opened) return; opened = true; card.yani_schedule = episodeLabel(episodes, entry.aired) + ', ' + dateTimeLabel(releaseDate); deps.openYummyDetail(card, false); setTimeout(function () { opened = false; }, 500); };
            row.on('hover:focus', function (event) { var target = event.currentTarget || event.target; content.find('.yani-schedule__item.focus').removeClass('focus'); row.addClass('focus'); last = target; scroll.update($(target), true); });
            row.on('hover:blur', function () { row.removeClass('focus'); }); row.on('hover:enter click.yaniSchedule', open);
            return row;
        }
        function revealDayChip(chip) {
            var days = content.find('.yani-schedule__days');
            if (!days.length || !chip || !chip.length) return;
            var left = chip[0].offsetLeft - Math.max(0, (days.innerWidth() - chip.outerWidth()) / 2);
            days.scrollLeft(Math.max(0, left));
        }
        function dayChipNodes() {
            return content.find('.yani-schedule__day-chip');
        }
        function dayChipIndex(element) {
            return dayChipNodes().index(element);
        }
        function refreshFocus(element) {
            if (element) last = element;
            if (!last) return null;
            var collection = scroll.render();
            if (Lampa.Controller && Lampa.Controller.collectionSet) Lampa.Controller.collectionSet(collection);
            if (window.Navigator && Navigator.add) Navigator.add(last);
            if (Lampa.Controller && Lampa.Controller.collectionFocus) Lampa.Controller.collectionFocus(last, collection, true);
            if (focusScope && focusScope.remember) focusScope.remember(last);
            scroll.update($(last), true);
            return last;
        }
        function focusSelectedChip() {
            var chip = dayChipNodes().eq(selectedDay);
            if (!chip.length) return false;
            revealDayChip(chip);
            refreshFocus(chip[0]);
            return true;
        }
        function select(index, focusMode) {
            selectedDay = Math.max(0, Math.min(index, dayGroups.length - 1));
            var group = dayGroups[selectedDay];
            if (!group) return;
            var chip = dayChipNodes().removeClass('selected').eq(selectedDay).addClass('selected');
            content.find('.yani-schedule__selected-title').text(dayLabel(group.day, group.relativeOffset));
            var releases = content.find('.yani-schedule__releases').empty();
            if (!group.releases.length) releases.append($('<div class="yani-schedule__empty"></div>').text(t('no_releases')));
            else group.releases.forEach(function (entry) { releases.append(createItem(entry)); });
            revealDayChip(chip);
            updateShortcutBadges();
            var collection = scroll.render();
            if (Lampa.Controller && Lampa.Controller.collectionSet) Lampa.Controller.collectionSet(collection);
            if (focusMode === 'releases') {
                if (!focusFirstRelease()) refreshFocus(chip[0]);
            } else if (focusMode === 'chip' || focusMode === true) {
                refreshFocus(chip[0]);
            } else {
                last = chip[0];
            }
        }
        function moveDay(delta) {
            var index = dayChipIndex(last);
            if (index < 0) index = selectedDay;
            var next = index + delta;
            if (next < 0 || next >= dayGroups.length) return false;
            select(next, 'chip');
            return true;
        }
        function scheduleItems(items) {
            var normalized = [];
            (items || []).forEach(function (item) {
                var episodes = item && item.episodes || {};
                [
                    {value: episodes.prev_date, aired: true},
                    {value: episodes.next_date, aired: false}
                ].forEach(function (release) {
                    var releaseDate = timestampDate(release.value);
                    if (releaseDate) normalized.push({item: item, date: releaseDate, aired: release.aired});
                });
            });
            return normalized;
        }
        function render(items) {
            var today = startOfDay(new Date()), currentWeek = startOfWeek(today), rangeStart = new Date(currentWeek.getTime()), releasesByDay = {}, scheduled = scheduleItems(items);
            rangeStart.setDate(rangeStart.getDate() - 7);
            scheduled.forEach(function (entry) {
                var key = startOfDay(entry.date).getTime();
                if (!releasesByDay[key]) releasesByDay[key] = [];
                // Keep the release wrapper here, rather than only the anime.
                // The wrapper carries the concrete date and whether this is a
                // previous or upcoming episode; losing it made the following
                // sort call access `undefined.date` and aborted the page.
                releasesByDay[key].push(entry);
            });
            dayGroups = [];
            for (var offset = 0; offset < 28; offset++) {
                var day = new Date(rangeStart.getTime()); day.setDate(rangeStart.getDate() + offset);
                var releases = releasesByDay[day.getTime()] || [];
                releases.sort(function (a, b) {
                    var first = a && a.date instanceof Date ? a.date.getTime() : 0;
                    var second = b && b.date instanceof Date ? b.date.getTime() : 0;
                    return first - second;
                });
                dayGroups.push({day: day, relativeOffset: Math.round((day.getTime() - today.getTime()) / 86400000), releases: releases});
            }
            var days = $('<div class="yani-schedule__days"></div>');
            dayGroups.forEach(function (group, index) {
                var chip = $('<div class="yani-schedule__day-chip selector"></div>').attr('data-yani-focus-key', 'day-' + index);
                chip.append($('<div class="yani-schedule__day-name"></div>').text(dayLabel(group.day, group.relativeOffset)));
                chip.append($('<div class="yani-schedule__day-count"></div>').text(group.releases.length));
                if (group.relativeOffset === 0) chip.append(shortcutBadge('red'));
                chip.on('hover:focus', function (event) {
                    content.find('.yani-schedule__day-chip.focus').removeClass('focus');
                    chip.addClass('focus');
                    last = event.currentTarget || chip[0];
                    revealDayChip(chip);
                    if (index !== selectedDay) select(index, false);
                });
                chip.on('hover:blur', function () { chip.removeClass('focus'); });
                chip.on('hover:enter click.yaniScheduleDay', function () { select(index, 'releases'); });
                days.append(chip);
            });
            content.append(days).append($('<div class="yani-schedule__selected-title"></div>')).append($('<div class="yani-schedule__releases"></div>'));
            var todayIndex = dayGroups.findIndex(function (group) { return group.relativeOffset === 0; });
            select(todayIndex >= 0 ? todayIndex : 0, false);
        }
        function focusFirstRelease() {
            var first = content.find('.yani-schedule__releases .yani-schedule__item.selector').first();
            if (!first.length) return false;
            refreshFocus(first[0]);
            return true;
        }
        function remoteColor(event) {
            var key = String(event && (event.key || event.code || '') || '').toLowerCase();
            var code = Number(event && (event.keyCode || event.which));
            if (key === 'colorf0red' || key === 'red' || code === 403) return 'red';
            if (key === 'colorf1green' || key === 'green' || code === 404) return 'green';
            if (key === 'colorf2yellow' || key === 'yellow' || code === 405) return 'yellow';
            if (key === 'colorf3blue' || key === 'blue' || code === 406) return 'blue';
            return '';
        }
        function handleRemoteShortcut(event) {
            if (!html.is(':visible') || event.defaultPrevented || $(event.target).closest('input, textarea, select, [contenteditable=true]').length) return;
            var color = remoteColor(event);
            var todayIndex = dayGroups.findIndex(function (group) { return group.relativeOffset === 0; });
            if (!color) return;
            event.preventDefault(); event.stopPropagation();
            if (color === 'red') select(todayIndex >= 0 ? todayIndex : selectedDay, 'releases');
            else if (color === 'green') select(selectedDay - 1, 'releases');
            else if (color === 'yellow') select(selectedDay + 1, 'releases');
            else if (color === 'blue') focusFirstRelease();
        }
        function shortcutBadge(color) {
            return $('<span class="yani-schedule__shortcut-badge" aria-hidden="true"><i class="yani-schedule__shortcut-color yani-schedule__shortcut-color--' + color + '"></i></span>');
        }
        function updateShortcutBadges() {
            var chips = dayChipNodes();
            chips.find('.yani-schedule__shortcut-badge--relative').remove();
            if (selectedDay > 0) chips.eq(selectedDay - 1).append(shortcutBadge('green').addClass('yani-schedule__shortcut-badge--relative'));
            if (selectedDay + 1 < dayGroups.length) chips.eq(selectedDay + 1).append(shortcutBadge('yellow').addClass('yani-schedule__shortcut-badge--relative'));
            var releases = content.find('.yani-schedule__releases .yani-schedule__item');
            releases.find('.yani-schedule__shortcut-badge').remove();
            releases.first().append(shortcutBadge('blue'));
        }
        var state = LampaYaniSectionState.create({t: t});
        html.append(state.root);
        function ensureMounted() {
            if (!html.find('.scroll').length && !html.find('.scroll__body').length) {
                scroll.append(content);
                html.append(scroll.render(true));
            }
            focusScope.bind(html);
            if (!remoteShortcutHandler) {
                remoteShortcutHandler = handleRemoteShortcut;
                document.addEventListener('keydown', remoteShortcutHandler, true);
            }
        }
        function load() {
            content.empty();
            state.show('loading', {skeleton: 'rows'});
            ensureMounted();
            last = state.focus(scroll.render()) || last;
            LampaYaniApi.schedule({}).then(function (payload) {
                var items = LampaYaniApi.normalize(payload);
                content.empty();
                if (!items.length) {
                    state.show('empty', {
                        title: t('no_releases'),
                        hint: t('section_state_empty_hint'),
                        onRetry: load
                    });
                    last = state.focus(scroll.render()) || last;
                    return;
                }
                if (LampaYaniSectionState.fromCache(payload)) {
                    state.show('cached', {compact: true, onRetry: load});
                } else {
                    state.clear();
                }
                render(items);
                last = dayChipNodes().filter('.selected').first()[0] || content.find('.selector').first()[0] || last;
                refreshFocus(last);
            }).catch(function (error) {
                console.error('[YummyAnime]', error);
                content.empty();
                state.show('offline', {
                    title: t('schedule_load_error'),
                    onRetry: load
                });
                last = state.focus(scroll.render()) || last;
            });
        }
        var comp = {
            create: function () {
                this.activity.loader(false);
                load();
                this.activity.toggle();
            },
            start: function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        var restored = focusScope.restore(last, false);
                        if (restored) last = restored;
                    },
                    left: function () {
                        var current = $(last);
                        if (current.hasClass('yani-schedule__day-chip')) {
                            if (!moveDay(-1)) Lampa.Controller.toggle('menu');
                            return;
                        }
                        if (Navigator.canmove('left')) Navigator.move('left');
                        else Lampa.Controller.toggle('menu');
                    },
                    right: function () {
                        var current = $(last);
                        if (current.hasClass('yani-schedule__day-chip')) {
                            moveDay(1);
                            return;
                        }
                        Navigator.move('right');
                    },
                    up: function () {
                        var current = $(last);
                        if (current.hasClass('yani-schedule__item')) {
                            var items = content.find('.yani-schedule__releases .yani-schedule__item');
                            if (items.length && items[0] === last) {
                                focusSelectedChip();
                                return;
                            }
                        }
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else Lampa.Controller.toggle('head');
                    },
                    down: function () {
                        var current = $(last);
                        if (current.hasClass('yani-schedule__day-chip') && focusFirstRelease()) return;
                        if (Navigator.canmove('down')) Navigator.move('down');
                        else scroll.wheel(300);
                    },
                    back: deps.goBack
                });
                Lampa.Controller.toggle('content');
            },
            render: function (js) { return js ? html[0] : html; },
            destroy: function () {
                if (remoteShortcutHandler) document.removeEventListener('keydown', remoteShortcutHandler, true);
                remoteShortcutHandler = null;
                focusScope.destroy();
                scroll.destroy();
                html.remove();
            }
        };
        return comp;
    }
    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Schedule = window.LampaYaniSchedule = {create: create};
}(window));
