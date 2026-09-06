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
        // Claiming the screen must never be able to take the player down with
        // it: this component is what a viewer sees instead of the video when
        // anything in it throws.
        function claimScreen(on) {
            try {
                var body = $('body');
                if (!body || typeof body.addClass !== 'function') return;
                if (on) body.addClass('yani-player-open');
                else body.removeClass('yani-player-open');
            } catch (error) {}
        }

        function close() {
            if (closing) return;
            closing = true;
            // Stop the remote page before restoring the previous Lampa
            // controller. This prevents its media and key handlers surviving
            // behind the title card after Back.
            iframe.attr('src', 'about:blank');
            claimScreen(false);
            if (deps.goBack) deps.goBack();
        }

        // The embedded page owns the keys while it is open.
        //
        // This screen used to carry a back control, and being the only focusable
        // element in the collection it received every OK press - so the play
        // button and the controls of the embedded player could never be reached
        // with a remote. Nothing of ours is focusable now: the iframe takes the
        // focus, its own page decides what the arrows and OK do, and Back is
        // the one key this component still answers.
        function focusPlayer() {
            try {
                var node = iframe[0];
                if (node && node.focus) node.focus();
            } catch (error) {}
        }

        return {
            create: function () {
                iframe
                    .attr('src', (deps.sourceUrl ? deps.sourceUrl(object) : '') || (object && object.iframe_url) || '')
                    .attr('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture; payment')
                    .attr('tabindex', '0')
                    .attr('title', t('back_to_lampa'))
                    .on('load', focusPlayer);
                html.append(iframe);
                claimScreen(true);
                this.activity.loader(false);
                this.activity.toggle();
            },
            start: function () {
                Lampa.Controller.add('content', {
                    toggle: focusPlayer,
                    back: close
                });
                Lampa.Controller.toggle('content');
                focusPlayer();
            },
            render: function (js) { return js ? html[0] : html; },
            destroy: function () {
                closing = true;
                claimScreen(false);
                iframe.off().attr('src', 'about:blank');
                iframe.remove();
                html.remove();
            }
        };
    }
    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Player = window.LampaYaniPlayer = {create: create};
}(window));
