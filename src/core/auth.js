(function (window) {
    'use strict';

    var key = 'lampa_yani_auth';
    var memory = {};
    var refreshPromise = null;
    var verifyPromise = null;
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
            if (!response.ok) {
                var error = new Error('Token refresh failed: ' + response.status);
                error.status = response.status;
                throw error;
            }
            return response.json();
        }, function (error) {
            clearTimeout(timer);
            throw error;
        });
    }

    // For list and title requests the server does not reject a token it no
    // longer accepts: it answers as if nobody were signed in, without watch
    // progress, subscriptions or the viewer's ratings. Only the account
    // endpoints say so, with 401 or 403, and that is the one signal a dead
    // session gives. Network failures and server errors say nothing about the
    // token and must never sign the viewer out.
    function sessionRejected(error) {
        var status = Number(error && error.status);
        return status === 401 || status === 403;
    }

    function expireSession(error) {
        console.warn('[YummyAnime] The server no longer accepts this session; signing out', error);
        var previous = LampaYaniAuth.get();
        refreshPromise = null;
        verifyPromise = null;
        // The mark stays until the next sign-in, so every place that shows the
        // account state can tell "the session ended, sign in again" apart from
        // "never signed in". The login is kept to prefill the sign-in form.
        persist({expired_at: Date.now(), login: previous.login || ''});
        if (window.Lampa && Lampa.Noty && Lampa.Noty.show && window.LampaYaniI18n) {
            Lampa.Noty.show(LampaYaniI18n.t('session_expired'));
        }
        if (error) error.sessionExpired = true;
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
            if (token !== tokenFrom(previous)) verifyPromise = null;
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
        clear: function () { refreshPromise = null; verifyPromise = null; persist({}); },
        sessionExpired: function () {
            var stored = readStored();
            return !tokenFrom(stored) && Number(stored.expired_at || 0) > 0;
        },
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
                if (!tokenFrom(current) || error && error.sessionExpired) return current;
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
                if (sessionRejected(error) && LampaYaniAuth.token() === token) expireSession(error);
                throw error;
            });
            return refreshPromise;
        },
        // Asks the account endpoint whether the stored token still works.
        // Refreshing happens only every two days, so without this a session
        // the server has dropped keeps the plugin "signed in" and anonymous
        // until then. Once per run is enough.
        verify: function () {
            var token = this.token();
            if (!token) return Promise.resolve(false);
            if (verifyPromise) return verifyPromise;
            verifyPromise = fetch(LampaYaniConfig.apiBase + '/profile', {
                headers: {
                    'X-Application': applicationToken(),
                    Authorization: 'Bearer ' + token,
                    Accept: 'application/json'
                }
            }).then(function (response) {
                if (response.ok) return true;
                var error = new Error('Session check failed: ' + response.status);
                error.status = response.status;
                if (sessionRejected(error) && LampaYaniAuth.token() === token) expireSession(error);
                return !sessionRejected(error);
            }, function () {
                // Offline or unreachable: nothing is known about the token.
                verifyPromise = null;
                return true;
            });
            return verifyPromise;
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
