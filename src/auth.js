(function (window) {
    'use strict';

    var key = 'lampa_yani_auth';
    var memory = {};
    var refreshPromise = null;
    var refreshInterval = 2 * 24 * 60 * 60 * 1000;
    var refreshRetryDelay = 3 * 60 * 60 * 1000;

    function readStored() {
        try {
            var stored = Lampa.Storage.get(key, '{}');
            if (stored && typeof stored === 'object') return stored;
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    function tokenFrom(data) {
        if (typeof data === 'string') return data.trim();
        return data && String(data.token || data.access_token || '').trim();
    }

    function applicationToken() {
        return LampaYaniConfig.applicationToken ? LampaYaniConfig.applicationToken() : LampaYaniConfig.applicationHeader;
    }

    function emitAuthorizationChanged(authorized) {
        if (typeof document === 'undefined' || !document.dispatchEvent) return;
        var detail = {authorized: Boolean(authorized)};
        var event = null;
        if (typeof CustomEvent === 'function') event = new CustomEvent('yani:auth-changed', {detail: detail});
        else if (document.createEvent) {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent('yani:auth-changed', false, false, detail);
        }
        if (event) document.dispatchEvent(event);
    }

    function persist(data) {
        var wasAuthorized = Boolean(tokenFrom(readStored()));
        memory = data || {};
        Lampa.Storage.set(key, JSON.stringify(memory));
        var authorized = Boolean(tokenFrom(memory));
        if (authorized !== wasAuthorized) emitAuthorizationChanged(authorized);
        return memory;
    }

    function refreshRequest(token) {
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timeout = Number(LampaYaniConfig.requestTimeout || 15000);
        var timer;
        var timeoutPromise = new Promise(function (resolve, reject) {
            timer = setTimeout(function () {
                if (controller) controller.abort();
                reject(new Error('Token refresh timeout'));
            }, timeout);
        });
        var request = fetch(LampaYaniConfig.apiBase + '/profile/token', {
            headers: {
                'X-Application': applicationToken(),
                Authorization: 'Bearer ' + token,
                Accept: 'application/json'
            },
            signal: controller ? controller.signal : undefined
        });
        return Promise.race([request, timeoutPromise]).then(function (response) {
            clearTimeout(timer);
            if (!response.ok) throw new Error('Token refresh failed: ' + response.status);
            return response.json();
        }, function (error) {
            clearTimeout(timer);
            throw error;
        });
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Auth = window.LampaYaniAuth = {
        get: function () {
            var stored = readStored();
            return tokenFrom(stored) ? stored : memory;
        },
        token: function () { return tokenFrom(this.get()); },
        save: function (data) {
            var token = tokenFrom(data);
            var previous = readStored();
            if (!token) throw new Error('Login response did not contain a token');
            memory = {
                token: token,
                refreshed_at: data.refreshed_at || Date.now(),
                login: data.login || previous.login || '',
                display_name: data.display_name || data.login || previous.display_name || previous.login || '',
                user_id: Number(data.user_id || data.id || previous.user_id || 0) || 0,
                refresh_retry_at: Number(data.refresh_retry_at || 0) || 0
            };
            return persist(memory);
        },
        clear: function () { refreshPromise = null; persist({}); },
        needsRefresh: function () {
            var current = this.get();
            if (!tokenFrom(current)) return false;
            var now = Date.now();
            if (Number(current.refresh_retry_at || 0) > now) return false;
            return now - Number(current.refreshed_at || 0) >= refreshInterval;
        },
        refreshIfNeeded: function () {
            var self = this;
            if (!self.needsRefresh()) return Promise.resolve(self.get());
            return self.refresh().catch(function (error) {
                var current = self.get();
                if (!tokenFrom(current)) return current;
                current.refresh_retry_at = Date.now() + refreshRetryDelay;
                persist(current);
                console.warn('[YummyAnime] Automatic token refresh failed; keeping current token', error);
                return current;
            });
        },
        refresh: function () {
            if (!this.token()) return Promise.reject(new Error('Not authorized'));
            if (refreshPromise) return refreshPromise;
            var token = this.token();
            refreshPromise = refreshRequest(token).then(function (payload) {
                var current = LampaYaniAuth.get();
                if (LampaYaniAuth.token() !== token) throw new Error('Authorization changed during token refresh');
                var data = payload.response || payload;
                LampaYaniAuth.save({token: tokenFrom(data), refreshed_at: Date.now(), login: current.login, display_name: current.display_name, user_id: current.user_id});
                return LampaYaniAuth.get();
            });
            refreshPromise = refreshPromise.then(function (result) {
                refreshPromise = null;
                return result;
            }, function (error) {
                refreshPromise = null;
                throw error;
            });
            return refreshPromise;
        },
        login: function (login, password) {
            return fetch(LampaYaniConfig.apiBase + '/profile/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'X-Application': applicationToken(), Accept: 'application/json'},
                body: JSON.stringify({login: login, password: password, need_json: true})
            }).then(function (response) {
                if (!response.ok) throw new Error('Login failed: ' + response.status);
                return response.json();
            }).then(function (payload) {
                var data = payload.response || payload;
                LampaYaniAuth.save({token: tokenFrom(data), refreshed_at: Date.now(), login: login, user_id: data.id || data.user_id});
                return data;
            });
        },
        logout: function () {
            var token = this.token();
            if (!token) {
                this.clear();
                return Promise.resolve(true);
            }
            return fetch(LampaYaniConfig.apiBase + '/profile/logout', {
                method: 'POST',
                headers: {
                    'X-Application': applicationToken(),
                    Authorization: 'Bearer ' + token,
                    Accept: 'application/json'
                }
            }).then(function (response) {
                if (!response.ok) throw new Error('Logout failed: ' + response.status);
                return response.json();
            }).then(function (payload) {
                LampaYaniAuth.clear();
                return payload.response || payload;
            }).catch(function (error) {
                LampaYaniAuth.clear();
                throw error;
            });
        }
    };
}(window));
