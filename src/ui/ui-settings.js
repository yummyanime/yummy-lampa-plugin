(function (window) {
    'use strict';

    // The YummyAnime section of the Lampa settings, and the account sign-in
    // and sign-out actions it shares with the account screens.

    function create(deps) {
        deps = deps || {};
        var t = deps.t || function (name) { return name; };
        var PLAYBACK_SOURCE_IDS = deps.playbackSourceIds || [];
        var EXPERIMENTAL_PLAYBACK_SOURCE_IDS = deps.experimentalPlaybackSourceIds || [];
        var showUsagePolicy = deps.showUsagePolicy;
        var acknowledgeAllohaWebNotice = deps.acknowledgeAllohaWebNotice;
        var isAndroidTvPlatform = deps.isAndroidTvPlatform;
        var isWebOsPlatform = deps.isWebOsPlatform;
        var playbackSourceDefaultEnabled = deps.playbackSourceDefaultEnabled;
        var playbackSourceLabel = deps.playbackSourceLabel;
        var triggerSettingEnabled = deps.triggerSettingEnabled;
        var migrateLegacyPlayerPreference = deps.migrateLegacyPlayerPreference;
        var externalPlayerAvailable = deps.externalPlayerAvailable;
        var showYummyInput = deps.showYummyInput;

        var authSettingsParamDefinition = null;

        function addSettings() {
            if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;
            migrateLegacyPlayerPreference();

            Lampa.SettingsApi.addComponent({
                component: 'yani',
                icon: '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M18.45 0H1.55A1.55 1.55 0 000 1.55v16.9A1.54 1.54 0 001.55 20h16.9A1.55 1.55 0 0020 18.45V1.55A1.54 1.54 0 0018.45 0Zm-2.83 5.93-2.1 2.66-2.3-5.43a6.95 6.95 0 014.4 2.77Zm-2.9 6.57h-4l2.03-4.8 1.98 4.8Zm-2.37-9.34L7.8 9.06 4.87 5.33c.64-.7 1.4-1.26 2.27-1.65a8.18 8.18 0 013.2-.52ZM3.57 7.39l3.2 4.06-1.56 3.58A6.96 6.96 0 013.57 7.39Zm6.57 9.56c-1.05.01-2.1-.2-3.05-.65l.76-1.8h5.7l.49 1.15a6.93 6.93 0 01-3.9 1.3Zm6.8-7.07a7.8 7.8 0 01-1.17 4L14.55 11l2.17-2.77c.14.54.21 1.1.23 1.65Z"/></svg>',
                name: 'YummyAnime'
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_account_title', type: 'title'},
                field: {name: t('settings_account_section')}
            });

            // Keep this row stable: the account page reads the token on every render,
            // so sign-in and sign-out never leave stale conditional settings behind.
            authSettingsParamDefinition = {
                component: 'yani',
                param: {name: 'yani_account_state', type: 'button'},
                field: {name: t('auth_title'), description: settingsAuthDescription()},
                onRender: function (item) {
                    syncSettingsAuthStatus(item);
                },
                onChange: openSettingsLogin
            };
            Lampa.SettingsApi.addParam(authSettingsParamDefinition);
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_auto_sync_progress', type: 'trigger', default: true},
                field: {name: t('auto_sync_progress'), description: t('auto_sync_progress_description')}
            });
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_auto_manage_lists', type: 'trigger', default: false},
                field: {name: t('auto_manage_lists'), description: t('auto_manage_lists_description')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_interface_title', type: 'title'},
                field: {name: t('settings_interface_section')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_language', type: 'select', values: {ru: 'Русский', uk: 'Українська', en: 'English'}, default: 'ru'},
                field: {name: t('language_name'), description: t('language_description')},
                onChange: function (value) {
                    if (value && typeof value === 'object') value = value.value;
                    LampaYaniI18n.setLanguage(value);
                    Lampa.Noty.show(t('language_changed'));
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_episode_flags', type: 'trigger', default: true},
                field: {name: t('episode_flags'), description: t('episode_flags_description')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_playback_title', type: 'title'},
                field: {name: t('settings_playback_section')}
            });

            if (externalPlayerAvailable()) {
                var webOsTarget = isWebOsPlatform();
                Lampa.SettingsApi.addParam({
                    component: 'yani',
                    param: {
                        name: 'yani_playback_target',
                        type: 'select',
                        values: {
                            ask: t('playback_target_ask'),
                            internal: t('playback_target_internal'),
                            external: t(webOsTarget ? 'playback_target_webos' : 'playback_target_external')
                        },
                        default: 'ask'
                    },
                    field: {
                        name: t('player_preference'),
                        description: t(webOsTarget ? 'player_preference_webos_description' : 'player_preference_description')
                    }
                });
            } else {
                if (Lampa.Storage) Lampa.Storage.set('yani_playback_target', 'internal');
                Lampa.SettingsApi.addParam({
                    component: 'yani',
                    param: {name: 'yani_playback_target_locked', type: 'button'},
                    field: {
                        name: t('player_preference') + ': ' + t('playback_target_internal'),
                        description: t('player_preference_non_android_description')
                    },
                    onChange: function () {
                        Lampa.Noty.show(t('player_preference_non_android'));
                    }
                });
            }

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {
                    name: 'yani_aniskip',
                    type: 'select',
                    values: {off: t('aniskip_off'), op: t('aniskip_openings'), ed: t('aniskip_endings'), op_ed: t('aniskip_openings_endings'), suggest: t('aniskip_suggest')},
                    default: 'off'
                },
                field: {name: t('aniskip'), description: t('aniskip_description')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_auto_next', type: 'trigger', default: false},
                field: {name: t('auto_next'), description: t('auto_next_description')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_add_to_lampa_history', type: 'trigger', default: true},
                field: {name: t('add_to_lampa_history'), description: t('add_to_lampa_history_description')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_clear_playback_history', type: 'button'},
                field: {name: t('clear_history'), description: t('clear_history_description')},
                onChange: function () {
                    if (Lampa.Storage) Lampa.Storage.set('yani_playback_history', '{}');
                    Lampa.Noty.show(t('history_cleared'));
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_display_sources_title', type: 'title'},
                field: {name: t('display_sources'), description: t('display_sources_description')}
            });
            PLAYBACK_SOURCE_IDS.forEach(function (sourceId) {
                var label = playbackSourceLabel(sourceId);
                var storageKey = 'yani_source_' + sourceId;
                var experimental = EXPERIMENTAL_PLAYBACK_SOURCE_IDS.indexOf(sourceId) >= 0;
                Lampa.SettingsApi.addParam({
                    component: 'yani',
                    param: {name: storageKey, type: 'trigger', default: playbackSourceDefaultEnabled(sourceId)},
                    field: {
                        name: label,
                        description: sourceId === 'cvh' ? t('cvh_source_description') : sourceId === 'sibnet' ? t('sibnet_source_description') : experimental ? t('source_external_support_description') : t('source_visibility_description')
                    },
                    onChange: function (value) {
                        if (experimental && triggerSettingEnabled(value, storageKey, false)) {
                            var warning = sourceId === 'cvh' ? t('cvh_source_warning') : t('source_external_support_warning');
                            Lampa.Noty.show(String(warning).replace(/\{source\}/g, label));
                        }
                    }
                });
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_playback_services_title', type: 'title'},
                field: {name: t('settings_integrations_section')}
            });

            if (isAndroidTvPlatform()) {
                Lampa.SettingsApi.addParam({
                    component: 'yani',
                    param: {name: 'yani_yummytv_enabled', type: 'trigger', default: false},
                    field: {name: t('yummytv_integration'), description: t('yummytv_integration_description')}
                });
            }

            var resolverUrl = window.LampaYaniResolver ? LampaYaniResolver.baseUrl() : '';
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_resolver_server', type: 'button'},
                field: {
                    name: t('resolver_server'),
                    description: t('resolver_server_description') + ': ' + (resolverUrl || t('not_configured'))
                },
                onChange: editResolverServer
            });

            if (resolverUrl) {
                Lampa.SettingsApi.addParam({
                    component: 'yani',
                    param: {name: 'yani_resolver_check', type: 'button'},
                    field: {name: t('resolver_check'), description: t('resolver_check_description')},
                    onChange: function () {
                        LampaYaniResolver.health().then(function (payload) {
                            Lampa.Noty.show(t('resolver_ok') + (payload && payload.version ? ' · v' + payload.version : ''));
                        }).catch(function (error) {
                            console.error('[YummyAnime]', error);
                            Lampa.Noty.show(t('resolver_error'));
                        });
                    }
                });
            }

            var lampacUrl = window.LampaYaniLampacResolver ? LampaYaniLampacResolver.baseUrl() : '';
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_lampac_server', type: 'button'},
                field: {
                    name: t('lampac_server'),
                    description: t('lampac_server_description') + ': ' + (lampacUrl || t('not_configured'))
                },
                onChange: editLampacServer
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_alloha_iframe', type: 'trigger', default: false},
                field: {name: t('alloha_iframe'), description: t('alloha_iframe_description')},
                onChange: function (value) {
                    if (value === true || value === 'true') acknowledgeAllohaWebNotice();
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_lampa_card_title', type: 'title'},
                field: {name: t('lampa_card_integration')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_lampa_card_rating', type: 'trigger', default: true},
                field: {name: t('lampa_card_rating'), description: t('lampa_card_rating_description')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_lampa_card_button', type: 'trigger', default: true},
                field: {name: t('lampa_card_button'), description: t('lampa_card_button_description')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_home_sections_title', type: 'title'},
                field: {name: t('home_sections')}
            });

            [
                ['catalog', 'catalog'],
                ['genres', 'genres'],
                ['search', 'search'],
                ['schedule', 'schedule'],
                ['new_translations', 'new_translations'],
                ['continue_watching', 'continue_watching'],
                ['user_lists', 'user_lists'],
                ['new_releases', 'new_releases'],
                ['top_rated', 'top_rated'],
                ['personal_feed', 'personal_feed'],
                ['collections', 'collections'],
                ['account', 'account']
            ].forEach(function (section) {
                Lampa.SettingsApi.addParam({
                    component: 'yani',
                    param: {name: 'yani_section_' + section[0], type: 'trigger', default: true},
                    field: {name: t(section[1]), description: t('section_visibility_description')}
                });
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_about_title', type: 'title'},
                field: {name: t('settings_about_section')}
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_about', type: 'button'},
                field: {
                    name: t('version_name'),
                    description: t('official_plugin') + ' · ' + t('version_label') + ' ' + LampaYaniConfig.version + ' · ' + t('website_description') + ': ' + yummyWebsiteUrl()
                },
                onChange: openYummyWebsite
            });

            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_usage_policy', type: 'button'},
                field: {name: t('usage_policy_title'), description: t('usage_policy_settings_description')},
                onChange: showUsagePolicy
            });

            // A title row is deliberately non-interactive: the repository URL is
            // reference text, not another settings action or external link.
            Lampa.SettingsApi.addParam({
                component: 'yani',
                param: {name: 'yani_repo_notice', type: 'title'},
                field: {name: t('repo_notice')}
            });
        }

        function yummyWebsiteUrl() {
            var language = LampaYaniI18n.getLanguage();
            return language === 'en' || language === 'uk' ? 'https://en.yummyani.me/' : 'https://ru.yummyani.me/';
        }

        function localizedAuthText(key) {
            return String(t(key) || '').replace(/\{site\}/g, yummyWebsiteUrl());
        }

        function settingsAuthDescription() {
            var status = LampaYaniAuth.token() ? t('auth_authorized')
                : LampaYaniAuth.sessionExpired && LampaYaniAuth.sessionExpired() ? t('auth_session_expired')
                : t('auth_not_authorized');
            return t('settings_auth_status') + ': ' + status + ' · ' + localizedAuthText('auth_manage_description');
        }

        function syncSettingsAuthStatus(renderedItem) {
            var description = settingsAuthDescription();
            var authorized = Boolean(LampaYaniAuth.token());
            if (authSettingsParamDefinition) authSettingsParamDefinition.field.description = description;
            var rows = renderedItem && renderedItem.length ? renderedItem : $('.settings-param[data-name="yani_account_state"]');
            rows.each(function () {
                var row = $(this);
                var target = row.find('.settings-param__descr');
                if (target.length) target.text(description);
                else row.append($('<div class="settings-param__descr"></div>').text(description));
                row.toggleClass('yani-settings-auth--authorized', authorized);
            });
        }
        function yummyTitleUrl(card) {
            var slug = card && card.yani_url;
            if (!slug || typeof slug !== 'string') return '';
            if (/^https?:\/\//i.test(slug)) return slug;
            slug = slug.replace(/^\/+/, '').replace(/^catalog\/item\//i, '');
            return yummyWebsiteUrl().replace(/\/$/, '') + '/catalog/item/' + encodeURIComponent(slug);
        }

        function openYummyWebsite() {
            var url = yummyWebsiteUrl();
            if (Lampa.Browser && Lampa.Browser.open) return Lampa.Browser.open(url);
            if (Lampa.External && Lampa.External.open) return Lampa.External.open(url);
            if (Lampa.Utils && Lampa.Utils.open) return Lampa.Utils.open(url);
            if (window.open) return window.open(url, '_blank');
            Lampa.Noty.show(url);
        }

        function openSettingsLogin() {
            Lampa.Activity.push({
                url: 'yani/auth',
                title: 'YummyAnime · ' + t('auth_title'),
                component: 'yani_auth'
            });
        }

        function openAccountLogin() {
            Lampa.Activity.push({
                url: 'yani/auth',
                title: 'YummyAnime · ' + t('auth_title'),
                component: 'yani_auth',
                refresh_account_on_authorized: true
            });
        }

        var accountLogoutPending = false;
        function logoutFromAccount() {
            if (accountLogoutPending) return;
            accountLogoutPending = true;
            LampaYaniAuth.logout().then(function () {
                Lampa.Noty.show(t('logged_out'));
            }).catch(function (error) {
                console.error('[YummyAnime]', error);
                Lampa.Noty.show(t('token_removed'));
            }).then(function () {
                accountLogoutPending = false;
                syncSettingsAuthStatus();
                Lampa.Activity.replace({url: 'yani/account', title: 'YummyAnime ' + t('account'), component: 'yani_account'});
            });
        }

        function editLampacServer() {
            if (!window.LampaYaniLampacResolver) return Lampa.Noty.show(t('lampac_unavailable'));
            showYummyInput({
                title: t('lampac_server_prompt'),
                value: LampaYaniLampacResolver.baseUrl(),
                nosave: true
            }, function (value) {
                value = String(value || '').trim();
                var saved = LampaYaniLampacResolver.setBaseUrl(value);
                if (value && !saved) return Lampa.Noty.show(t('lampac_server_invalid'));
                Lampa.Noty.show(saved ? t('lampac_server_saved') : t('lampac_server_disabled'));
            });
        }

        function editResolverServer() {
            if (!window.LampaYaniResolver) return Lampa.Noty.show(t('resolver_unavailable'));
            showYummyInput({
                title: t('resolver_server_prompt'),
                value: LampaYaniResolver.baseUrl(),
                nosave: true
            }, function (value) {
                value = String(value || '').trim();
                var saved = LampaYaniResolver.setBaseUrl(value);
                if (value && !saved) return Lampa.Noty.show(t('resolver_server_invalid'));
                Lampa.Noty.show(saved ? t('resolver_server_saved') : t('resolver_server_disabled'));
            });
        }

        return {
            addSettings: addSettings,
            localizedAuthText: localizedAuthText,
            syncSettingsAuthStatus: syncSettingsAuthStatus,
            openSettingsLogin: openSettingsLogin,
            openAccountLogin: openAccountLogin,
            logoutFromAccount: logoutFromAccount
        };
    }

    window.LampaYani = window.LampaYani || {};
    window.LampaYani.Settings = window.LampaYaniSettings = {create: create};
}(window));
