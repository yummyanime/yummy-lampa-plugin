(function (window) {
    'use strict';
    function create(object, deps) {
        deps = deps || {};
        // A missing dependency used to throw while the component was being
        // built, and Lampa answers that by drawing its empty-list screen - so a
        // playable episode looked like a title with no sources at all. Nothing
        // here is worth losing the player over.
        var t = deps.t || function (name) { return name; };
        var closing = false;
        var html = $('<div class="yani-player"></div>');
        var iframe = $('<iframe class="yani-player__iframe" frameborder="0" allowfullscreen></iframe>');
        function close() {
            if (closing) return;
            closing = true;
            // Stop the remote page before restoring the previous Lampa
            // controller. This prevents its media and key handlers surviving
            // behind the title card after Back.
            iframe.attr('src', 'about:blank');
            if (deps.goBack) deps.goBack();
        }
        var back = $('<div class="yani-player__back selector"></div>').text(t('back_to_lampa')).on('hover:enter click', close);
        return {create: function () { iframe.attr('src', (deps.sourceUrl ? deps.sourceUrl(object) : '') || (object && object.iframe_url) || '').attr('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture; payment'); html.append(iframe, back); this.activity.loader(false); this.activity.toggle(); }, start: function () { Lampa.Controller.add('content', {toggle: function () { Lampa.Controller.collectionSet(html, false, true); Lampa.Controller.collectionFocus(back, html, true); }, left: function () {}, right: function () {}, up: function () { Lampa.Controller.toggle('head'); }, down: function () {}, back: close}); Lampa.Controller.toggle('content'); }, render: function (js) { return js ? html[0] : html; }, destroy: function () { closing = true; iframe.attr('src', 'about:blank'); iframe.remove(); back.off().remove(); html.remove(); }};
    }
    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Player = window.LampaYaniPlayer = {create: create};
}(window));
