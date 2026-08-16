(function (window) {
    'use strict';

    var DEFAULT_DELAY = 400;
    var CACHE_TTL = 2 * 60 * 1000;
    var CACHE_LIMIT = 20;

    function safeQuery(params) {
        var value = params && params.query !== undefined ? params.query : params;
        value = String(value || '').replace(/\+/g, ' ');
        try { value = decodeURIComponent(value); } catch (error) { /* Keep the original input. */ }
        return value.trim();
    }

    function rankCards(cards, query, utils) {
        var normalize = utils && utils.normalizeMatchTitle || function (value) {
            return String(value || '').toLowerCase().trim();
        };
        var titleValues = utils && utils.titleValues || function (card) {
            return [card && card.title, card && card.original_title].filter(Boolean);
        };
        var wanted = normalize(query);

        return (cards || []).map(function (card, index) {
            var values = titleValues(card || {});
            if (Array.isArray(card && card.yani_titles)) values = values.concat(card.yani_titles);
            var score = 0;

            values.forEach(function (value, titleIndex) {
                var candidate = normalize(value);
                if (!candidate || !wanted) return;
                var current = candidate === wanted ? 400 :
                    candidate.indexOf(wanted) === 0 ? 260 :
                    candidate.indexOf(wanted) >= 0 ? 160 :
                    wanted.indexOf(candidate) >= 0 ? 100 : 0;
                if (titleIndex === 0 && current) current += 20;
                if (current > score) score = current;
            });

            return {card: card, index: index, score: score};
        }).sort(function (left, right) {
            return right.score - left.score || left.index - right.index;
        }).map(function (entry) { return entry.card; });
    }

    function create(options) {
        options = options || {};
        var api = options.api;
        var lampa = options.lampa;
        var utils = options.utils || {};
        var delay = options.delay === undefined ? DEFAULT_DELAY : Math.max(0, Number(options.delay) || 0);
        var timer = null;
        var generation = 0;
        var pendingComplete = null;
        var cache = {};
        var cacheOrder = [];

        function completeOnce(callback) {
            var completed = false;
            return function (value) {
                if (completed) return;
                completed = true;
                callback(value);
            };
        }

        function cacheGet(key) {
            var entry = cache[key];
            if (!entry || Date.now() - entry.time > CACHE_TTL) {
                if (entry) delete cache[key];
                return null;
            }
            return entry.cards;
        }

        function cacheSet(key, cards) {
            if (!cache[key]) cacheOrder.push(key);
            cache[key] = {time: Date.now(), cards: cards};
            while (cacheOrder.length > CACHE_LIMIT) delete cache[cacheOrder.shift()];
        }

        function groups(cards) {
            return cards.length ? [{
                title: options.sourceTitle || 'YummyAnime',
                type: 'anime',
                results: cards,
                total: cards.length,
                total_pages: 1
            }] : [];
        }

        function search(params, oncomplete) {
            var query = safeQuery(params);
            var done = completeOnce(typeof oncomplete === 'function' ? oncomplete : function () {});
            var requestGeneration = ++generation;
            var key = (utils.normalizeMatchTitle ? utils.normalizeMatchTitle(query) : query.toLowerCase());

            if (timer) clearTimeout(timer);
            timer = null;
            if (pendingComplete) pendingComplete([]);
            pendingComplete = done;

            if (!query) {
                pendingComplete = null;
                done([]);
                return;
            }

            var cached = cacheGet(key);
            if (cached) {
                pendingComplete = null;
                done(groups(cached));
                return;
            }

            timer = setTimeout(function () {
                timer = null;
                api.search(query, {limit: 30}).then(function (payload) {
                    if (requestGeneration !== generation) return;
                    var cards = api.normalize(payload).map(options.toCard);
                    cards = rankCards(cards, query, utils);
                    cacheSet(key, cards);
                    pendingComplete = null;
                    done(groups(cards));
                }).catch(function (error) {
                    if (requestGeneration !== generation) return;
                    pendingComplete = null;
                    if (options.onError) options.onError(error);
                    done([]);
                });
            }, delay);
        }

        function register() {
            if (!lampa || !lampa.Search || !lampa.Search.addSource || window.yummyanime_search_source_ready) return false;
            window.yummyanime_search_source_ready = true;
            lampa.Search.addSource({
                title: options.sourceTitle || 'YummyAnime',
                // Lampa Results.empty reads source.params.start_typing / nofound
                // immediately on create. Missing params crashes global Search.
                params: {
                    save: true
                },
                search: search,
                onSelect: function (params, close) {
                    if (typeof close === 'function') close();
                    if (options.openDetail) options.openDetail(params && params.element);
                }
            });
            return true;
        }

        function open() {
            if (!options.showInput) return;
            options.showInput({title: options.searchTitle || 'Search', value: ''}, function (value) {
                var query = safeQuery(value);
                if (!query) return;
                if (options.openResults) options.openResults(query);
            });
        }

        function destroy() {
            generation++;
            if (timer) clearTimeout(timer);
            timer = null;
            if (pendingComplete) pendingComplete([]);
            pendingComplete = null;
        }

        return {search: search, register: register, open: open, destroy: destroy};
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Search = window.LampaYaniSearch = {
        create: create,
        safeQuery: safeQuery,
        rankCards: rankCards
    };
}(window));
