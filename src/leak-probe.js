(function (window) {
    'use strict';

    // Temporary diagnostic for the renderer crash that appears after roughly
    // eight to ten playback launches in one session. It only counts things and
    // never changes playback; remove it once the leak is identified.
    //
    // The counters separate the possible causes:
    //
    //   N  — how many times a video element started playing;
    //   V  — how many <video> elements exist, and in brackets how many of them
    //        are already detached from the DOM and should have been released;
    //   MS — live MediaSource objects out of the total ever created. These hold
    //        the hardware decoders, and running out of them is what turns the
    //        screen into noise;
    //   OU — object URLs created and never revoked;
    //   IF — iframe count;
    //   JS — heap size, when the engine reports one.
    //
    // A count that grows per launch names the leak. Everything staying flat
    // while playback still dies means the cause is outside the plugin.

    if (window.yani_leak_probe_ready) return;
    window.yani_leak_probe_ready = true;

    var liveMediaSources = 0;
    var totalMediaSources = 0;
    var liveObjectUrls = 0;
    var playCount = 0;
    var history = [];

    function hookMediaSource() {
        var Native = window.MediaSource;
        if (!Native) return;
        function Tracked() {
            var instance = new Native();
            liveMediaSources += 1;
            totalMediaSources += 1;
            instance.addEventListener('sourceclose', function () { liveMediaSources -= 1; });
            return instance;
        }
        Tracked.prototype = Native.prototype;
        Tracked.isTypeSupported = function () { return Native.isTypeSupported.apply(Native, arguments); };
        window.MediaSource = Tracked;
    }

    function hookObjectUrls() {
        if (!window.URL || !URL.createObjectURL) return;
        var create = URL.createObjectURL;
        var revoke = URL.revokeObjectURL;
        URL.createObjectURL = function () {
            liveObjectUrls += 1;
            return create.apply(URL, arguments);
        };
        URL.revokeObjectURL = function () {
            liveObjectUrls -= 1;
            return revoke.apply(URL, arguments);
        };
    }

    function hookPlay() {
        if (!window.HTMLMediaElement) return;
        var play = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
            if (!this.__yaniCounted) {
                this.__yaniCounted = true;
                playCount += 1;
                setTimeout(function () { report('launch'); }, 1500);
            }
            return play.apply(this, arguments);
        };
    }

    function videoStats() {
        var videos = document.querySelectorAll('video');
        var detached = 0;
        for (var i = 0; i < videos.length; i++) {
            if (!document.documentElement.contains(videos[i])) detached += 1;
        }
        return {total: videos.length, detached: detached};
    }

    function heapMb() {
        var memory = window.performance && performance.memory;
        if (!memory || !memory.usedJSHeapSize) return null;
        return Math.round(memory.usedJSHeapSize / 1048576);
    }

    function snapshot() {
        var videos = videoStats();
        return {
            plays: playCount,
            videos: videos.total,
            detached: videos.detached,
            mediaSources: liveMediaSources,
            mediaSourcesTotal: totalMediaSources,
            objectUrls: liveObjectUrls,
            iframes: document.querySelectorAll('iframe').length,
            heap: heapMb()
        };
    }

    function format(state) {
        var parts = [
            'N' + state.plays,
            'V' + state.videos + (state.detached ? '(' + state.detached + '!)' : ''),
            'MS' + state.mediaSources + '/' + state.mediaSourcesTotal,
            'OU' + state.objectUrls,
            'IF' + state.iframes
        ];
        if (state.heap !== null) parts.push('JS' + state.heap + 'M');
        return parts.join(' ');
    }

    function report(reason) {
        var state = snapshot();
        state.at = new Date().toISOString();
        state.reason = reason;
        history.push(state);
        if (history.length > 200) history.shift();
        var line = format(state);
        console.log('[yani-leak] ' + reason + ' ' + line);
        if (window.Lampa && Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(line);
    }

    hookMediaSource();
    hookObjectUrls();
    hookPlay();
    setInterval(function () { report('tick'); }, 15000);
    report('start');

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.LeakProbe = window.yaniLeakProbe = {
        snapshot: snapshot,
        history: function () { return history.slice(); },
        dump: function () { return JSON.stringify(history, null, 1); }
    };
}(window));
