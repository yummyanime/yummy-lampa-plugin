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
                if (!node) return;
                if (node.focus) node.focus();
                // Focusing the element is not the same as handing the keys to
                // the page inside it. `contentWindow.focus()` is one of the few
                // things allowed across origins, and it moves the browsing
                // context itself - which is what makes a real OK press from the
                // remote arrive at the embedded player rather than at Lampa.
                // Synthetic events are not an option here: a cross-origin frame
                // accepts none, so the page's own play button can only ever be
                // pressed by genuine input.
                if (node.contentWindow && node.contentWindow.focus) node.contentWindow.focus();
            } catch (error) {}
        }

        // The embedded page sets up its own player after load and can take the
        // focus back while doing so. A couple of late attempts cost nothing and
        // cover the slow start of a television.
        function focusPlayerRepeatedly() {
            focusPlayer();
            [400, 1200, 3000].forEach(function (delay) {
                setTimeout(function () { if (!closing) focusPlayer(); }, delay);
            });
        }

        return {
            create: function () {
                iframe
                    .attr('src', (deps.sourceUrl ? deps.sourceUrl(object) : '') || (object && object.iframe_url) || '')
                    .attr('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture; payment')
                    .attr('tabindex', '0')
                    .attr('title', t('back_to_lampa'))
                    .on('load', focusPlayerRepeatedly);
                html.append(iframe);
                claimScreen(true);
                this.activity.loader(false);
                this.activity.toggle();
            },
            start: function () {
                Lampa.Controller.add('content', {
                    toggle: focusPlayer,
                    // OK belongs to the embedded page, not to us. Handing the
                    // focus over again on every press is the closest thing to
                    // pressing its play button that a cross-origin frame allows.
                    enter: focusPlayer,
                    back: close
                });
                Lampa.Controller.toggle('content');
                focusPlayerRepeatedly();
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
