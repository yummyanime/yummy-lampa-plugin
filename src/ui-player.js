(function (window) {
    'use strict';
    function create(object, deps) {
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
        var back = $('<div class="yani-player__back selector"></div>').text(deps.t('back_to_lampa')).on('hover:enter click', close);
        return {create: function () { iframe.attr('src', deps.sourceUrl(object)).attr('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture; payment'); html.append(iframe, back); this.activity.loader(false); this.activity.toggle(); }, start: function () { Lampa.Controller.add('content', {toggle: function () { Lampa.Controller.collectionSet(html, false, true); Lampa.Controller.collectionFocus(back, html, true); }, left: function () {}, right: function () {}, up: function () { Lampa.Controller.toggle('head'); }, down: function () {}, back: close}); Lampa.Controller.toggle('content'); }, render: function (js) { return js ? html[0] : html; }, destroy: function () { closing = true; iframe.attr('src', 'about:blank'); iframe.remove(); back.off().remove(); html.remove(); }};
    }
    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Player = window.LampaYaniPlayer = {create: create};
}(window));
