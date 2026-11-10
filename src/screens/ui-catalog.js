(function (window) {
    'use strict';

    // The YummyAnime catalog screen: filters, sorting, top lists and paging.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var bindYummyCardRender = deps.bindYummyCardRender;
        var transientNavigationSnapshot = deps.transientNavigationSnapshot;
        var showYummySelect = deps.showYummySelect;
        var genreTitle = deps.genreTitle;
        var genreDescription = deps.genreDescription;
        var copyParams = deps.copyParams;
        var mapUniqueCards = deps.mapUniqueCards;

        function Catalog(object) {
            var requestedParams = copyParams(object.catalog_params || object.params || {limit: 30, sort: 'top', sort_forward: true});
            var comp = new Lampa.InteractionCategory(object);
            var topMode = Boolean(object.topMode);
            var baseParams = requestedParams;
            var limit = Number(baseParams.limit || 30);
            var maxPages = Math.ceil(20000 / limit) + 1;
            var seen = {};
            var requestedOffsets = {};
            var genreHeader;
            var genreDescriptionRequested = false;
            var subjectReferenceAnime = null;
            var destroyed = false;

            object.page = 1;
            baseParams.limit = limit;
            baseParams.offset = Number(baseParams.offset || 0);
            baseParams.sort = baseParams.sort || 'top';
            var hasSortDirection = Object.prototype.hasOwnProperty.call(baseParams, 'sort_forward');
            baseParams.sort_forward = hasSortDirection ?
                baseParams.sort_forward === true || baseParams.sort_forward === 'true' :
                baseParams.sort === 'top';

            function installGenreHeader() {
                var context = object.subject_context || object.genre_context;
                if (!context || genreHeader) return;
                var view = comp.render && comp.render();
                if (!view || !view.length) return;
                var isSubject = Boolean(object.subject_context);
                var title = isSubject ? String(context.title || context.name || '') : genreTitle(context);
                if (!title) return;
                var description = isSubject
                    ? t(context.kind === 'studio' ? 'studio_catalog_description' : 'creator_catalog_description').replace('{name}', title)
                    : genreDescription(context) || t('genre_catalog_fallback').replace('{genre}', title);
                genreHeader = $('<div class="yani-genre-catalog-header"></div>');
                var orb = $('<span class="yani-genre-catalog-header__orb" aria-hidden="true"><img alt=""><b></b><i></i><i></i><i></i></span>');
                if (isSubject) {
                    var initials = title.split(/[\s\-_]+/).filter(Boolean).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
                    orb.addClass('is-subject is-' + (context.kind === 'studio' ? 'studio' : 'director')).find('b').text(initials || title.charAt(0).toUpperCase());
                }
                genreHeader.append(orb);
                var copy = $('<div class="yani-genre-catalog-header__copy"></div>');
                copy.append($('<span class="yani-genre-catalog-header__eyebrow"></span>').text(t(isSubject ? (context.kind === 'studio' ? 'studio' : 'creator') : 'genre_catalog')));
                copy.append($('<strong class="yani-genre-catalog-header__title"></strong>').text(title));
                copy.append($('<p class="yani-genre-catalog-header__description"></p>').text(description));
                genreHeader.append(copy);
                view.addClass('yani-genre-catalog-view');
                if (isSubject) view.addClass('yani-subject-catalog-view');
                view.prepend(genreHeader);
                if (comp.scroll && comp.scroll.minus) comp.scroll.minus(genreHeader);
                if (isSubject) loadSubjectInformation(context);
                else loadGenreDescription(context);
            }

            function loadSubjectInformation(context) {
                if (genreDescriptionRequested) return;
                var request;
                if (context.kind === 'studio' && context.url) request = LampaYaniApi.studio(context.url);
                else if (context.kind === 'director' && context.id !== undefined && context.id !== null) request = LampaYaniApi.director(context.id);
                if (!request) return;
                genreDescriptionRequested = true;
                if (window.LampaYaniMedia && LampaYaniMedia.findSubjectImage) {
                    LampaYaniMedia.findSubjectImage(context.kind, context, subjectReferenceAnime).then(function (image) {
                        if (!image || !genreHeader || !genreHeader.closest('body').length) return;
                        genreHeader.find('.yani-genre-catalog-header__orb').addClass('has-image').find('img').attr('src', image);
                    });
                }
                request.then(function (payload) {
                    var detailed = payload && payload.response ? payload.response : payload;
                    if (!detailed || !genreHeader || !genreHeader.closest('body').length) return;
                    var title = String(detailed.title || context.title || '').trim();
                    var secondary = String(detailed.title_jp || detailed.japanese_title || '').trim();
                    if (title) genreHeader.find('.yani-genre-catalog-header__title').text(title);
                    if (secondary) genreHeader.find('.yani-genre-catalog-header__description').text(t('original_name') + ': ' + secondary);
                }).catch(function () {});
            }

            function loadGenreDescription(context) {
                if (genreDescriptionRequested) return;
                var genreId = context && (context.id !== undefined ? context.id : context.value);
                if (!/^\d+$/.test(String(genreId || ''))) return;
                genreDescriptionRequested = true;
                LampaYaniApi.genre(genreId).then(function (payload) {
                    var detailed = payload && payload.response ? payload.response : payload;
                    var description = genreDescription(detailed);
                    if (!description || !genreHeader || !genreHeader.length || !genreHeader.closest('body').length) return;
                    genreHeader.find('.yani-genre-catalog-header__description').text(description);
                }).catch(function () {
                    // The localized bundled description remains visible offline.
                });
            }

            function annotateGenreTop(items, offset) {
                if (!object.genre_context || baseParams.sort !== 'top' || !baseParams.sort_forward) return items;
                var title = genreTitle(object.genre_context);
                (items || []).forEach(function (item, index) {
                    var position = Number(offset || 0) + index + 1;
                    if (item && position <= 100) item.yani_genre_top = {position: position, genre: title};
                });
                return items;
            }
            var controls = LampaYaniCatalogControls.create({
                comp: comp,
                object: object,
                baseParams: baseParams,
                topMode: topMode,
                t: t,
                copyParams: copyParams,
                showSelect: showYummySelect,
                navigationSnapshot: transientNavigationSnapshot,
                filterModel: LampaYaniCatalogFilters
            });

            comp.create = function () {
                var self = this;
                this.activity.loader(true);
                LampaYaniApi.catalog(baseParams, {
                    cacheFirst: true,
                    staleFallback: true,
                    cacheTtl: 15 * 60 * 1000,
                    backgroundRefresh: true
                })
                    .then(function (payload) {
                        if (destroyed) return;
                        var raw = annotateGenreTop(LampaYaniApi.normalize(payload), baseParams.offset);
                        if (object.subject_context && raw.length) subjectReferenceAnime = raw[0];
                        var results = mapUniqueCards(raw, seen);
                        requestedOffsets[baseParams.offset] = true;
                        if (raw.length < limit) object.page = maxPages;
                        self.build({results: results, total_pages: maxPages, title: t(topMode ? 'top_rated' : 'anime')});
                        if (self.activity && self.activity.loader) self.activity.loader(false);
                        installGenreHeader();
                        controls.install();
                    })
                    .catch(function (error) {
                        if (destroyed) return;
                        console.error('[YummyAnime]', error);
                        self.activity.loader(false);
                        Lampa.Noty.show(t('catalog_load_error'));
                    });
            };
            comp.nextPageReuest = function (requestObject, resolve, reject) {
                var params = copyParams(baseParams);
                params.offset = baseParams.offset + (requestObject.page - 1) * limit;
                if (requestedOffsets[params.offset]) {
                    resolve({results: [], total_pages: maxPages, title: t(topMode ? 'top_rated' : 'anime')});
                    return;
                }
                requestedOffsets[params.offset] = true;

                LampaYaniApi.catalog(params, object.genre_context ? {
                    cacheFirst: true,
                    staleFallback: true,
                    cacheTtl: 15 * 60 * 1000
                } : {}).then(function (payload) {
                    if (destroyed) return reject(new Error('YummyAnime catalog was closed'));
                    var raw = annotateGenreTop(LampaYaniApi.normalize(payload), params.offset);
                    var results = mapUniqueCards(raw, seen);
                    if (raw.length < limit) requestObject.page = maxPages;
                    resolve({results: results, total_pages: maxPages, title: t(topMode ? 'top_rated' : 'anime')});
                }).catch(function (error) {
                    delete requestedOffsets[params.offset];
                    requestObject.page = Math.max(1, requestObject.page - 1);
                    console.error('[YummyAnime]', error);
                    Lampa.Noty.show(t('next_page_error'));
                    reject(error);
                });
            };
            // Lampa builds use both spellings across releases.
            comp.nextPageRequest = comp.nextPageReuest;
            comp.cardRender = bindYummyCardRender;
            var originalCatalogDestroy = comp.destroy;
            comp.destroy = function () {
                destroyed = true;
                controls.destroy();
                if (originalCatalogDestroy) originalCatalogDestroy.apply(this, arguments);
            };
            return comp;
        }

        return {Component: Catalog};
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.CatalogScreen = window.LampaYaniCatalogScreen = {create: create};
}(window));
