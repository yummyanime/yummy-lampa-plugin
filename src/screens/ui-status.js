(function (window) {
    'use strict';
    function create(object, deps) {
        var scroll = new Lampa.Scroll({mask: true, over: true, step: 250}), html = $('<div class="yani-status"></div>'), content = $('<div class="yani-status__content"></div>'), last, lastKey = '', ready = false, period = '3hour', component;
        scroll.minus();
        function date(value) { if (!value) return '—'; try { return new Date(value).toLocaleString(deps.locale(), {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}); } catch (error) { return new Date(value).toLocaleString(); } }
        function focus(element, key) { if (key) element.attr('data-yani-focus-key', key); element.on('hover:focus', function (event) { var target = event.currentTarget || event.target; last = target; lastKey = key || $(target).attr('data-yani-focus-key') || ''; scroll.update($(target), true); }); return element; }
        function metric(title, value) { return $('<div class="yani-status__metric"></div>').append($('<span></span>').text(title), $('<strong></strong>').text(value)); }
        function domainName(domain) { var names = {'old.yummyani.me': 'domain_old', 'old.yummy-ani.me': 'domain_old_mirror', 'ru.yummyani.me': 'domain_new', 'ru.yummy-ani.me': 'domain_new_mirror', 'api.yani.tv': 'domain_api', 'waf.valtrix.org': 'domain_waf'}; return names[domain.domain] ? deps.t(names[domain.domain]) : (domain.label || domain.domain); }
        function renderError() {
            content.empty();
            var state = LampaYaniSectionState.create({t: deps.t});
            state.show('offline', {
                title: deps.t('status_load_error'),
                hint: deps.t('status_error_hint'),
                onRetry: function () { load(false); }
            });
            content.append(state.root);
            refreshFocus();
        }
        function render(data) {
            content.empty(); var periods = data.periods || null, selected = periods ? (periods[period] || periods[data.default_period] || periods['3hour']) : data; if (!selected) return renderError();
            var labels = {'3hour': deps.t('period_3hour'), day: deps.t('period_day'), week: deps.t('period_week'), month: deps.t('period_month')}, switches = $('<div class="yani-status__periods"></div>');
            Object.keys(labels).forEach(function (key) { var button = focus($('<div class="yani-status__period selector"></div>').text(labels[key]), 'period-' + key); if (key === period) button.addClass('active'); button.on('hover:enter', function () { period = key; lastKey = 'period-' + key; render(data); }); switches.append(button); }); content.append(switches);
            var summary = selected.summary || {}, state = summary.status || 'unknown', title = state === 'up' ? deps.t('all_up') : state === 'down' ? deps.t('all_down') : state === 'unknown' ? deps.t('no_monitoring') : deps.t('degraded'), color = state === 'up' ? '#4caf50' : state === 'down' ? '#db4455' : state === 'unknown' ? '#888' : '#f0a33b';
            var block = focus($('<div class="yani-status__summary selector yani-status--' + state + '"></div>')), ring = $('<div class="yani-status__ring"><div class="yani-status__ring-center"></div></div>'); ring.css('background', 'conic-gradient(#4caf50 0 ' + Number(summary.uptime_percent || 0) + '%, #db4455 ' + Number(summary.uptime_percent || 0) + '% 100%)'); ring.find('.yani-status__ring-center').append($('<strong></strong>').text(summary.checks || 0), $('<span></span>').text(deps.t('checks')));
            var info = $('<div class="yani-status__summary-info"></div>').append($('<div class="yani-status__headline"></div>').css('color', color).text(title)); var metrics = $('<div class="yani-status__metrics"></div>').append(metric(deps.t('availability'), Number(summary.uptime_percent || 0).toFixed(1) + '%'), metric(deps.t('average_load'), String(summary.average_ms || 0) + ' ' + deps.t('milliseconds')), metric(deps.t('errors'), String(summary.failed || 0)), metric(deps.t('updated'), date(selected.generated_at))); info.append(metrics); block.append(ring, info); content.append(block);
            var legend = focus($('<div class="yani-status__legend selector"></div>')).html('<span class="yani-status__dot yani-status__dot--up"></span>' + deps.t('up') + ' <span class="yani-status__dot yani-status__dot--degraded"></span>' + deps.t('unstable') + ' <span class="yani-status__dot yani-status__dot--down"></span>' + deps.t('down')); content.append(legend);
            (selected.domains || []).forEach(function (domain) { var row = focus($('<div class="yani-status__domain selector yani-status--' + domain.status + '"></div>')), head = $('<div class="yani-status__domain-head"></div>'), name = $('<div class="yani-status__domain-name"></div>').append('<span class="yani-status__state"></span>', $('<strong></strong>').text(domainName(domain)), $('<small></small>').text(domain.domain)), values = $('<div class="yani-status__domain-values"></div>').append($('<span></span>').text('HTTP ' + (domain.average_ms || 0) + ' ' + deps.t('milliseconds')), $('<span></span>').text('Ping ' + (domain.ping_ms || 0) + ' ' + deps.t('milliseconds'))), history = $('<div class="yani-status__history"></div>'); (domain.history || []).forEach(function (point) { history.append($('<i class="yani-status__bar yani-status__bar--' + point.status + '"></i>').attr('title', date(point.time))); }); head.append(name, values); row.append(head, history); content.append(row); });
            content.append(focus($('<div class="yani-status__source selector"></div>').text(deps.t('source') + ': YummyStatus · ' + deps.t('period') + ': ' + labels[period] + ' · ' + deps.t('snapshot_notice'))));
            content.append(focus($('<div class="yani-status__refresh selector"></div>').text(deps.t('refresh_status')).on('hover:enter', function () { Lampa.Noty.show(deps.t('refreshing_status')); load(false); }))); refreshFocus();
        }
        function refreshFocus() { if (!ready) return; var target = last && document.documentElement.contains(last) ? $(last) : lastKey ? content.find('[data-yani-focus-key="' + lastKey + '"]').first() : $(); if (!target.length) target = content.find('.selector').first(); last = target.length ? target[0] : null; Lampa.Controller.collectionSet(scroll.render()); Lampa.Controller.collectionFocus(last || false, scroll.render()); if (target.length) scroll.update(target, true); }
        function load(first) {
            if (first) {
                component.activity.loader(false);
                content.empty();
                var loading = LampaYaniSectionState.create({t: deps.t});
                loading.show('loading', {skeleton: 'rows'});
                content.append(loading.root);
            }
            LampaYaniApi.status().then(function (data) {
                render(data);
                if (first) {
                    component.activity.toggle();
                    ready = true;
                    refreshFocus();
                }
            }).catch(function (error) {
                console.error('[YummyAnime Status]', error);
                renderError();
                if (first) {
                    component.activity.toggle();
                    ready = true;
                    refreshFocus();
                }
            });
        }
        component = {create: function () { scroll.append(content); html.append(scroll.render(true)); load(true); }, start: function () { Lampa.Controller.add('content', {toggle: function () { Lampa.Controller.collectionSet(scroll.render()); Lampa.Controller.collectionFocus(last || false, scroll.render()); }, left: function () { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); }, right: function () { Navigator.move('right'); }, up: function () { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); }, down: function () { LampaYaniNavigation.moveDown(scroll); }, back: deps.goBack}); Lampa.Controller.toggle('content'); }, render: function (js) { return js ? html[0] : html; }, destroy: function () { scroll.destroy(); html.remove(); }};
        return component;
    }
    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Status = window.LampaYaniStatus = {create: create};
}(window));
