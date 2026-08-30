(function (window) {
    'use strict';

    var CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';
    var QUALITY_ORDER = [240, 360, 480, 720, 1080];
    var HLS_QUALITY_MANIFEST_PATTERN = /\/(\d+)\.mp4:hls:manifest\.m3u8(?=$|[?#])/i;
    var cache = {};
    var cacheKeys = [];
    var CACHE_LIMIT = 50;

    function normalizeUrl(url) {
        url = String(url || '').trim();
        if (!url) return '';
        if (url.indexOf('//') === 0) return 'https:' + url;
        if (/^https?:\/\//i.test(url)) return url;
        return 'https://' + url.replace(/^\/+/, '');
    }

    function isDirectVideoUrl(url) {
        return /\.(m3u8|mpd|mp4|webm)(?:[?#].*)?$/i.test(String(url || ''));
    }

    function isKodikUrl(url) {
        return /kodik/i.test(String(url || ''));
    }

    function isCvhUrl(url) {
        url = String(url || '');
        return /iframeCVH\.html/i.test(url) || /cdnvideohub/i.test(url);
    }

    function isAksorUrl(url) {
        return /(?:^|\.)aksor\.tv(?:[/:]|$)/i.test(String(url || '').replace(/^https?:\/\//i, ''));
    }

    function isSibnetUrl(url) {
        return /(?:^|\.)video\.sibnet\.ru(?:[/:]|$)/i.test(String(url || '').replace(/^https?:\/\//i, ''));
    }

    function isRutubeUrl(url) {
        return /(?:^|\.)rutube\.ru(?:[/:]|$)/i.test(String(url || '').replace(/^https?:\/\//i, '')) && /[a-f0-9]{32}/i.test(String(url || ''));
    }

    function isVkUrl(url) {
        url = String(url || '');
        return /iframeVK\.html/i.test(url) || /(?:^|\.)(?:vk\.com|vkvideo\.ru)(?:[/:]|$)/i.test(url.replace(/^https?:\/\//i, ''));
    }

    function originOf(url) {
        var match = String(url || '').match(/^(https?:\/\/[^/]+)/i);
        return match ? match[1] : '';
    }

    function sameOriginPath(origin, src) {
        if (!src) return '';
        if (src.indexOf('//') === 0) return 'https:' + src;
        if (/^https?:\/\//i.test(src)) return src;
        if (src.charAt(0) === '/') return origin.replace(/\/$/, '') + src;
        return origin.replace(/\/$/, '') + '/' + src;
    }

    function responseText(value) {
        if (typeof value === 'string') return value;
        if (value === undefined || value === null) return '';
        try { return JSON.stringify(value); } catch (ignore) { return String(value); }
    }

    function nativeRequestText(url, options) {
        options = options || {};
        return new Promise(function (resolve, reject) {
            if (!window.Lampa || !Lampa.Reguest) return reject(new Error('Lampa native request is unavailable'));
            var network = new Lampa.Reguest();
            var timeout = Number((window.LampaYaniConfig && LampaYaniConfig.requestTimeout) || 15000);
            if (network.timeout) network.timeout(timeout);
            network.native(url, function (value) {
                resolve(responseText(value));
            }, function (error, exception) {
                var message = error && (error.responseText || error.message || error.status) || exception || 'Native request failed';
                reject(new Error(String(message)));
            }, options.body, {
                dataType: 'text',
                type: options.method || 'GET',
                timeout: timeout,
                headers: options.headers || {}
            });
        });
    }

    function browserRequestText(url, options) {
        options = options || {};
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timeout = Number((window.LampaYaniConfig && LampaYaniConfig.requestTimeout) || 15000);
        var timer = setTimeout(function () { if (controller) controller.abort(); }, timeout);
        var headers = Object.assign({
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            'User-Agent': CHROME_UA
        }, options.headers || {});
        if (options.referer) headers.Referer = options.referer;
        var requestOptions = {
            method: options.method || 'GET',
            headers: headers,
            body: options.body,
            credentials: options.credentials || 'include'
        };
        if (controller) requestOptions.signal = controller.signal;
        return fetch(url, requestOptions).then(function (response) {
            clearTimeout(timer);
            if (!response.ok) {
                var error = new Error('HTTP ' + response.status);
                error.status = response.status;
                throw error;
            }
            return response.text();
        }).catch(function (error) {
            clearTimeout(timer);
            throw error;
        });
    }

    function requestText(url, options) {
        options = options || {};
        var isAndroid = !!(window.AndroidJS || window.Android) || !!(window.Lampa && Lampa.Platform && Lampa.Platform.is && Lampa.Platform.is('android'));
        if (isAndroid && window.Lampa && Lampa.Reguest) {
            return nativeRequestText(url, options).catch(function (nativeError) {
                console.warn('[YummyAnime] Native stream request failed, trying browser request', nativeError);
                return browserRequestText(url, options);
            });
        }
        return browserRequestText(url, options);
    }

    function requestJson(url, options) {
        return requestText(url, options).then(function (text) {
            try { return JSON.parse(text); } catch (error) { throw new Error('Invalid player API response'); }
        });
    }

    function atobSafe(value) {
        try {
            return window.atob(value);
        } catch (ignore) {
            return '';
        }
    }

    function decodeKodikSrc(src) {
        if (!src) return '';
        if (src.indexOf('//') >= 0) return src;
        try {
            var rotated = String(src).split('').map(function (char) {
                if (!/[a-z]/i.test(char)) return char;
                var code = char.charCodeAt(0) + 18;
                var limit = char <= 'Z' ? 90 : 122;
                return String.fromCharCode(code <= limit ? code : code - 26);
            }).join('');
            rotated += '='.repeat((4 - rotated.length % 4) % 4);
            return atobSafe(rotated);
        } catch (ignore) {
            return '';
        }
    }

    function fixProtocol(url) {
        url = String(url || '');
        if (url.indexOf('//') === 0) return 'https:' + url;
        if (/^https?:\/\//i.test(url)) return url;
        return url ? 'https://' + url : '';
    }

    function hlsManifestQuality(url) {
        var match = HLS_QUALITY_MANIFEST_PATTERN.exec(String(url || ''));
        return match ? Number(match[1]) : 0;
    }

    function replaceHlsManifestQuality(url, quality) {
        return String(url || '').replace(HLS_QUALITY_MANIFEST_PATTERN, '/' + quality + '.mp4:hls:manifest.m3u8');
    }

    function headOk(url) {
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = setTimeout(function () { if (controller) controller.abort(); }, 5000);
        var options = {
            method: 'HEAD',
            headers: {'User-Agent': CHROME_UA},
            credentials: 'omit'
        };
        if (controller) options.signal = controller.signal;
        return fetch(url, options).then(function (response) {
            clearTimeout(timer);
            return response.ok;
        }).catch(function () {
            clearTimeout(timer);
            return false;
        });
    }

    function resolveQualityStreamUrl(url, expectedQuality) {
        var actualQuality = hlsManifestQuality(url);
        if (!actualQuality || actualQuality === expectedQuality) {
            return Promise.resolve({label: expectedQuality + 'p', url: url});
        }
        if (expectedQuality <= actualQuality) {
            return Promise.resolve({label: actualQuality + 'p', url: url});
        }
        var repairedUrl = replaceHlsManifestQuality(url, expectedQuality);
        if (repairedUrl === url) return Promise.resolve({label: actualQuality + 'p', url: url});
        return headOk(repairedUrl).then(function (ok) {
            return ok ? {label: expectedQuality + 'p', url: repairedUrl} : {label: actualQuality + 'p', url: url};
        });
    }

    function parseQualityMap(responseText) {
        var json;
        try {
            json = JSON.parse(responseText);
        } catch (ignore) {
            return Promise.resolve(null);
        }
        var links = json && json.links;
        if (!links) return Promise.resolve(null);
        var qualities = {};
        var tasks = QUALITY_ORDER.map(function (quality) {
            var list = links[String(quality)];
            var src = Array.isArray(list) && list[0] && list[0].src;
            if (!src) return null;
            var decoded = fixProtocol(decodeKodikSrc(src));
            if (!decoded) return null;
            return resolveQualityStreamUrl(decoded, quality).then(function (result) {
                if (result && result.url && !qualities[result.label]) qualities[result.label] = result.url;
            });
        }).filter(Boolean);
        return Promise.all(tasks).then(function () {
            return Object.keys(qualities).length ? qualities : null;
        });
    }

    function extractFirst(regex, text) {
        var match = regex.exec(text);
        return match ? match[1] : '';
    }

    function extractEndpointPath(playerScript) {
        var regex = /atob\("([A-Za-z0-9+/=]+)"\)/g;
        var match;
        while ((match = regex.exec(playerScript))) {
            var decoded = atobSafe(match[1]);
            if (decoded && decoded.charAt(0) === '/' && decoded.indexOf('//') !== 0 && decoded.length <= 10) return decoded;
        }
        return '/ftor';
    }

    function cacheResult(key, result) {
        if (!key || !result) return result;
        delete cache[key];
        cache[key] = {time: Date.now(), result: result};
        cacheKeys = cacheKeys.filter(function (item) { return item !== key; });
        cacheKeys.push(key);
        while (cacheKeys.length > CACHE_LIMIT) delete cache[cacheKeys.shift()];
        return result;
    }

    function cached(key) {
        var item = cache[key];
        if (!item || Date.now() - item.time > 10 * 60 * 1000) return null;
        return item.result;
    }

    function resolveKodik(iframeUrl) {
        var fullUrl = normalizeUrl(iframeUrl);
        var hit = cached(fullUrl);
        if (hit) return Promise.resolve(hit);
        return requestText(fullUrl, {referer: 'https://yani.tv/'}).then(function (html) {
            var flat = String(html || '').replace(/[\n\r]/g, '');
            var urlParamsStr = extractFirst(/\burlParams\s*=\s*'([^']+)'/, flat);
            var type = extractFirst(/\b(?:videoInfo|vInfo)\.type\s*=\s*'([^']+)'/, flat);
            var hash = extractFirst(/\b(?:videoInfo|vInfo)\.hash\s*=\s*'([^']+)'/, flat);
            var id = extractFirst(/\b(?:videoInfo|vInfo)\.id\s*=\s*'([^']+)'/, flat);
            var playerSrc = extractFirst(/src="((?:(?:https?:)?\/\/[^"]+)?\/assets\/js\/app\.player_single[^"]+)"/, flat);
            if (!urlParamsStr || !type || !hash || !id || !playerSrc) throw new Error('Kodik player data not found');

            var iframeOrigin = originOf(fullUrl);
            var playerScriptUrl = sameOriginPath(iframeOrigin, playerSrc);
            var playerOrigin = playerScriptUrl.split('/assets/js/')[0] || iframeOrigin;
            var urlParams = JSON.parse(urlParamsStr);
            return requestText(playerScriptUrl, {referer: fullUrl}).then(function (playerScript) {
                var endpointUrl = playerOrigin + extractEndpointPath(playerScript);
                var body = [
                    ['d', urlParams.d],
                    ['d_sign', urlParams.d_sign],
                    ['pd', urlParams.pd],
                    ['pd_sign', urlParams.pd_sign],
                    ['ref', urlParams.ref],
                    ['ref_sign', urlParams.ref_sign],
                    ['bad_user', 'true'],
                    ['cdn_is_working', 'true'],
                    ['type', type],
                    ['hash', hash],
                    ['id', id],
                    ['info', '{}']
                ].map(function (pair) {
                    var value = pair[0] === 'ref' ? String(pair[1] || '') : encodeURIComponent(String(pair[1] || ''));
                    return pair[0] + '=' + value;
                }).join('&');
                return requestText(endpointUrl, {
                    method: 'POST',
                    body: body,
                    referer: fullUrl,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
            });
        }).then(parseQualityMap).then(function (qualities) {
            if (!qualities) throw new Error('Kodik stream links not found');
            var labels = Object.keys(qualities);
            var label = labels[labels.length - 1];
            return cacheResult(fullUrl, {url: qualities[label], quality: label, qualities: qualities, source: 'kodik'});
        });
    }

    function queryParams(url) {
        var result = {};
        var query = String(url || '').split('?')[1] || '';
        query.split('&').forEach(function (pair) {
            var split = pair.indexOf('=');
            if (split < 0) return;
            var key = pair.slice(0, split);
            var value = pair.slice(split + 1).replace(/\+/g, ' ');
            try { result[decodeURIComponent(key)] = decodeURIComponent(value); } catch (ignore) { result[key] = value; }
        });
        return result;
    }

    function replaceIpHost(url, failoverHost) {
        if (!url || !failoverHost) return url;
        try {
            var parsed = new URL(url);
            if (parsed.protocol === 'https:' && /^\d{1,3}(?:\.\d{1,3}){3}$/.test(parsed.hostname)) parsed.hostname = failoverHost;
            return parsed.toString();
        } catch (ignore) {
            return url;
        }
    }

    function cvhUserAgent() {
        var own = window.navigator && window.navigator.userAgent;
        return typeof own === 'string' && own ? own : CHROME_UA;
    }

    function resolveCvh(iframeUrl) {
        var fullUrl = normalizeUrl(iframeUrl);
        var hit = cached(fullUrl);
        if (hit) return Promise.resolve(hit);
        var params = queryParams(fullUrl);
        var animeId = params.anime_id;
        var episode = window.LampaYaniEpisode.normalize(params.episode || 1);
        var dubbingCode = String(params.dubbing_code || '').toLowerCase();
        if (!animeId) return Promise.reject(new Error('CVH anime id not found'));

        // CVH signs its CDN links for whichever agent asked for them - the
        // signed URL carries `srcAg=CHROME`, `srcAg=CHROME_ANDROID_TABLET` and
        // so on - and the CDN then answers 400 when playback comes from a
        // different agent. Asking with a desktop agent therefore produced a
        // link the device's own player could never fetch: the internal Android
        // player, which is a <video> in the WebView and cannot send custom
        // headers, always requests with the WebView's agent. Ask with the agent
        // that will actually play, so the signature matches either way.
        var playbackUserAgent = cvhUserAgent();
        var headers = {
            Referer: 'https://ru.yummyani.me/',
            'User-Agent': playbackUserAgent,
            Accept: 'application/json'
        };
        var playlistUrl = 'https://plapi.cdnvideohub.com/api/v1/player/sv/playlist?pub=745&id=' + encodeURIComponent(animeId) + '&aggr=mali';
        return requestJson(playlistUrl, {headers: headers}).then(function (playlist) {
            var candidates = (playlist && Array.isArray(playlist.items) ? playlist.items : []).filter(function (item) {
                return window.LampaYaniEpisode.same(item && item.episode, episode);
            });
            var selected = candidates.filter(function (item) {
                return String(item && item.voiceStudio || '').toLowerCase() === dubbingCode;
            })[0] || candidates[0];
            if (!selected || !selected.vkId) throw new Error('CVH episode not found');
            return requestJson('https://plapi.cdnvideohub.com/api/v1/player/sv/video/' + encodeURIComponent(selected.vkId), {headers: headers});
        }).then(function (video) {
            var sources = video && video.sources || {};
            var failoverHost = video && video.failoverHost || '';
            var qualities = {};
            [
                ['240p', 'mpegLowestUrl'],
                ['360p', 'mpegLowUrl'],
                ['480p', 'mpegMediumUrl'],
                ['720p', 'mpegHighUrl'],
                ['1080p', 'mpegFullHdUrl']
            ].forEach(function (item) {
                var streamUrl = replaceIpHost(String(sources[item[1]] || '').trim(), failoverHost);
                if (streamUrl) qualities[item[0]] = streamUrl;
            });
            var labels = Object.keys(qualities);
            if (!labels.length) throw new Error('CVH stream links not found');
            var label = labels[labels.length - 1];
            return cacheResult(fullUrl, {
                url: qualities[label],
                quality: label,
                qualities: qualities,
                // External players honour these headers; the internal one sends
                // the same agent by itself. Both then match the signature.
                headers: {'User-Agent': playbackUserAgent},
                source: 'cvh',
                direct: true
            });
        });
    }

    function resolveAksor(iframeUrl) {
        var fullUrl = normalizeUrl(iframeUrl);
        var hit = cached(fullUrl);
        if (hit) return Promise.resolve(hit);
        var hash = '';
        try {
            var parts = new URL(fullUrl).pathname.split('/').filter(Boolean);
            var videoIndex = parts.indexOf('video');
            hash = videoIndex >= 0 ? parts[videoIndex + 1] : parts[parts.length - 1];
        } catch (ignore) {}
        if (!hash) return Promise.reject(new Error('Aksor video hash not found'));

        var headers = {
            Referer: fullUrl,
            'User-Agent': CHROME_UA,
            Accept: 'application/json'
        };
        return requestJson('https://player.aksor.tv/api/video/' + encodeURIComponent(hash), {headers: headers}).then(function (payload) {
            var raw = payload && payload.qualities || {};
            var qualities = {};
            [
                ['360p', 'q360'],
                ['480p', 'q480'],
                ['720p', 'q720'],
                ['1080p', 'q1080'],
                ['2K', 'q2k'],
                ['4K', 'q4k']
            ].forEach(function (item) {
                var streamUrl = String(raw[item[1]] || '').trim().replace(/ /g, '%20');
                if (streamUrl && streamUrl.toLowerCase() !== 'null') qualities[item[0]] = streamUrl;
            });
            var labels = Object.keys(qualities);
            if (!labels.length) throw new Error('Aksor stream links not found');
            var label = labels[labels.length - 1];
            return cacheResult(fullUrl, {url: qualities[label], quality: label, qualities: qualities, source: 'aksor', direct: true});
        });
    }

    function decodeHtmlUrl(value) {
        return String(value || '')
            .replace(/\\\//g, '/')
            .replace(/\\u0026/gi, '&')
            .replace(/&amp;/gi, '&')
            .replace(/&#0*38;/gi, '&');
    }

    function resolveSibnet(iframeUrl) {
        var fullUrl = normalizeUrl(iframeUrl);
        var hit = cached(fullUrl);
        if (hit) return Promise.resolve(hit);
        var requestHeaders = {
            Referer: 'https://yani.tv/',
            'User-Agent': CHROME_UA,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        };
        return requestText(fullUrl, {headers: requestHeaders}).then(function (html) {
            var text = String(html || '');
            var streamUrl = extractFirst(/player\.src\s*\(\s*\[\s*\{\s*src\s*:\s*["']([^"']+)["']/i, text) ||
                extractFirst(/<source[^>]+src\s*=\s*["']([^"']+)["']/i, text);
            streamUrl = sameOriginPath(originOf(fullUrl), decodeHtmlUrl(streamUrl));
            if (!streamUrl || !/\.mp4(?:[?#]|$)/i.test(streamUrl)) throw new Error('Sibnet MP4 stream not found');
            var playbackHeaders = {
                Referer: fullUrl,
                Origin: 'https://video.sibnet.ru',
                'User-Agent': CHROME_UA
            };
            return cacheResult(fullUrl, {
                url: streamUrl,
                quality: 'auto',
                source: 'sibnet',
                direct: true,
                headers: playbackHeaders
            });
        });
    }

    function absoluteUrl(url, baseUrl) {
        url = String(url || '').trim();
        if (!url) return '';
        try { return new URL(url, baseUrl).toString(); } catch (ignore) { return sameOriginPath(originOf(baseUrl), url); }
    }

    function rutubeQualityMap(masterText, masterUrl) {
        var found = {};
        var pending = '';
        String(masterText || '').split(/\r?\n/).forEach(function (line) {
            line = line.trim();
            if (!line) return;
            if (/^#EXT-X-STREAM-INF/i.test(line)) {
                var resolution = /RESOLUTION=\d+x(\d+)/i.exec(line);
                pending = resolution ? resolution[1] + 'p' : '';
                return;
            }
            if (pending && line.charAt(0) !== '#') {
                found[pending] = absoluteUrl(line, masterUrl);
                pending = '';
            }
        });
        var ordered = {};
        [144, 240, 360, 480, 720, 1080, 1440, 2160].forEach(function (quality) {
            var label = quality + 'p';
            if (found[label]) ordered[label] = found[label];
        });
        return ordered;
    }

    function resolveRutube(iframeUrl) {
        var fullUrl = normalizeUrl(iframeUrl);
        var hit = cached(fullUrl);
        if (hit) return Promise.resolve(hit);
        var idMatch = /([a-f0-9]{32})/i.exec(fullUrl);
        if (!idMatch) return Promise.reject(new Error('Rutube video id not found'));
        var playbackHeaders = {
            Referer: fullUrl,
            Origin: 'https://rutube.ru',
            'User-Agent': CHROME_UA
        };
        var requestHeaders = Object.assign({Accept: '*/*'}, playbackHeaders);
        var optionsUrl = 'https://rutube.ru/api/play/options/' + idMatch[1] + '/?no_404=true';
        return requestJson(optionsUrl, {headers: requestHeaders}).then(function (payload) {
            var balancer = payload && payload.video_balancer || {};
            var streamUrl = String(balancer.m3u8 || balancer.default || '').trim();
            if (!streamUrl) throw new Error('Rutube HLS stream not found');
            return requestText(streamUrl, {headers: requestHeaders}).then(function (master) {
                var qualities = rutubeQualityMap(master, streamUrl);
                var labels = Object.keys(qualities);
                if (!labels.length) qualities.auto = streamUrl;
                labels = Object.keys(qualities);
                var label = labels[labels.length - 1];
                return cacheResult(fullUrl, {
                    url: qualities[label],
                    quality: label,
                    qualities: qualities,
                    source: 'rutube',
                    direct: true,
                    headers: playbackHeaders
                });
            }).catch(function () {
                return cacheResult(fullUrl, {
                    url: streamUrl,
                    quality: 'auto',
                    qualities: {auto: streamUrl},
                    source: 'rutube',
                    direct: true,
                    headers: playbackHeaders
                });
            });
        });
    }

    function vkVideoPair(url) {
        var params = queryParams(url);
        var combined = String(params.id || '');
        var combinedMatch = /^(-?\d+)_(\d+)$/.exec(combined);
        if (combinedMatch) return {owner: combinedMatch[1], video: combinedMatch[2]};
        if (/^-?\d+$/.test(String(params.oid || '')) && /^\d+$/.test(String(params.id || ''))) {
            return {owner: String(params.oid), video: String(params.id)};
        }
        var pathMatch = /(?:video|clip)(-?\d+)_(\d+)/i.exec(String(url || ''));
        return pathMatch ? {owner: pathMatch[1], video: pathMatch[2]} : null;
    }

    function decodeVkPayload(value) {
        return decodeHtmlUrl(value)
            .replace(/\\u003a/gi, ':')
            .replace(/\\u003d/gi, '=')
            .replace(/\\u002f/gi, '/')
            .replace(/\\u002d/gi, '-')
            .replace(/\\x26/gi, '&');
    }

    function addVkQuality(qualities, label, value, baseUrl) {
        var streamUrl = absoluteUrl(decodeVkPayload(value), baseUrl);
        var knownVkCdn = /(?:okcdn\.ru|vkuser|userapi\.com|vkvd)/i.test(streamUrl);
        if (!streamUrl || !/^https?:\/\//i.test(streamUrl) || (!/\.(?:m3u8|mp4)(?:[?#]|$)/i.test(streamUrl) && !(label !== 'auto' && knownVkCdn))) return;
        if (!qualities[label]) qualities[label] = streamUrl;
    }

    function vkQualityMap(html, baseUrl) {
        var text = decodeVkPayload(String(html || ''));
        var qualities = {};
        var match;
        var qualityPattern = /["']?(?:url|mp4_)(2160|1440|1080|720|480|360|240)["']?\s*[:=]\s*["']([^"']+)["']/gi;
        while ((match = qualityPattern.exec(text))) addVkQuality(qualities, match[1] + 'p', match[2], baseUrl);

        var hlsPattern = /["']?(?:hls_fmp4|hls|url_hls|url)["']?\s*[:=]\s*["']([^"']+)["']/gi;
        while ((match = hlsPattern.exec(text))) addVkQuality(qualities, 'auto', match[1], baseUrl);

        var attributePattern = /(?:data-video(?:-src|Src)|<source[^>]+src)\s*=\s*["']([^"']+)["']/gi;
        while ((match = attributePattern.exec(text))) addVkQuality(qualities, 'auto', match[1], baseUrl);

        if (!Object.keys(qualities).length) {
            var directPattern = /(https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/gi;
            while ((match = directPattern.exec(text))) addVkQuality(qualities, 'auto', match[1], baseUrl);
        }

        var ordered = {};
        [240, 360, 480, 720, 1080, 1440, 2160].forEach(function (quality) {
            var label = quality + 'p';
            if (qualities[label]) ordered[label] = qualities[label];
        });
        if (qualities.auto) ordered.auto = qualities.auto;
        return ordered;
    }

    function vkVideoExtUrl(pageHtml, iframeUrl) {
        var normalized = normalizeUrl(iframeUrl);
        if (/video_ext\.php/i.test(normalized)) return normalized;
        var pair = vkVideoPair(normalized) || vkVideoPair(decodeVkPayload(pageHtml));
        if (pair) return 'https://vk.com/video_ext.php?oid=' + encodeURIComponent(pair.owner) + '&id=' + encodeURIComponent(pair.video) + '&hd=1';
        var match = /(?:https?:)?\\?\/\\?\/(?:www\.)?vk\.com\/video_ext\.php[^"'<>\s]*?[?&]oid=([^&"'<>\s]+)(?:&|&amp;|\\u0026)id=([^&"'<>\s]+)/i.exec(String(pageHtml || ''));
        if (!match) match = /video_ext\.php[^"']*?[?&]oid=([^&"']+)(?:&|&amp;|\\u0026)id=([^&"']+)/i.exec(String(pageHtml || ''));
        if (!match) return '';
        return 'https://vk.com/video_ext.php?oid=' + encodeURIComponent(decodeVkPayload(match[1])) + '&id=' + encodeURIComponent(decodeVkPayload(match[2])) + '&hd=1';
    }

    function vkResolvedResult(cacheKey, html, sourceUrl) {
        if (/embedErrorCallback\s*\?\.?\s*\(\s*8\s*\)/i.test(String(html || ''))) throw new Error('VK video unavailable');
        var qualities = vkQualityMap(html, sourceUrl);
        var labels = Object.keys(qualities);
        if (!labels.length) throw new Error('VK stream links not found');
        var playableLabels = labels.filter(function (label) { return label !== 'auto'; });
        var label = playableLabels.length ? playableLabels[playableLabels.length - 1] : labels[labels.length - 1];
        return cacheResult(cacheKey, {
            url: qualities[label],
            quality: label,
            qualities: qualities,
            source: 'vk',
            direct: true,
            headers: {
                Referer: sourceUrl,
                Origin: 'https://vk.com',
                'User-Agent': CHROME_UA
            }
        });
    }

    function resolveVk(iframeUrl) {
        var fullUrl = normalizeUrl(iframeUrl);
        var hit = cached(fullUrl);
        if (hit) return Promise.resolve(hit);
        var pair = vkVideoPair(fullUrl);
        var playerUrl = pair ? 'https://vk.com/video_ext.php?oid=' + encodeURIComponent(pair.owner) + '&id=' + encodeURIComponent(pair.video) + '&hd=1' : '';
        function headers(referer) {
            return {
                Referer: referer || fullUrl,
                'User-Agent': CHROME_UA,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            };
        }
        if (playerUrl || /video_ext\.php/i.test(fullUrl)) {
            playerUrl = playerUrl || fullUrl;
            return requestText(playerUrl, {headers: headers(fullUrl)}).then(function (html) {
                return vkResolvedResult(fullUrl, html, playerUrl);
            });
        }
        return requestText(fullUrl, {headers: headers(fullUrl)}).then(function (iframeHtml) {
            var discoveredUrl = vkVideoExtUrl(iframeHtml, fullUrl);
            if (!discoveredUrl || discoveredUrl === fullUrl) return vkResolvedResult(fullUrl, iframeHtml, fullUrl);
            return requestText(discoveredUrl, {headers: headers(fullUrl)}).then(function (playerHtml) {
                return vkResolvedResult(fullUrl, playerHtml, discoveredUrl);
            }).catch(function () {
                return vkResolvedResult(fullUrl, iframeHtml, fullUrl);
            });
        });
    }

    function resolve(url) {
        url = normalizeUrl(url);
        if (!url) return Promise.reject(new Error('Empty stream URL'));
        if (isDirectVideoUrl(url)) return Promise.resolve({url: url, source: 'direct'});
        if (isKodikUrl(url)) return resolveKodik(url);
        if (isCvhUrl(url)) return resolveCvh(url);
        if (isAksorUrl(url)) return resolveAksor(url);
        if (isSibnetUrl(url)) return resolveSibnet(url);
        if (isRutubeUrl(url)) return resolveRutube(url);
        if (isVkUrl(url)) return resolveVk(url);
        return Promise.reject(new Error('Unsupported player URL'));
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.StreamResolver = window.LampaYaniStreamResolver = {
        canResolve: function (url) { return isDirectVideoUrl(url) || isKodikUrl(url) || isCvhUrl(url) || isAksorUrl(url) || isSibnetUrl(url) || isRutubeUrl(url) || isVkUrl(url); },
        resolve: resolve,
        isDirectVideoUrl: isDirectVideoUrl
    };
}(window));
