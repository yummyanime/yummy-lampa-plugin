# Lampa YummyAnime Extension — Documentation

The official YummyAnime plugin for Lampa, powered by the YummyAnime (Yani) API.

Official website: [yummyani.me](https://yummyani.me)

## MVP features

- anime catalog;
- genre catalog;
- title search;
- ongoing schedule;
- Yani ratings and a top-rated section;
- Yani account login;
- rating anime from 1 to 10;
- favorites and user lists;
- a dedicated My Lists section with recent horizontal rows for signed-in users;
- viewing comments;
- dubbing and source selection, then playback in the internal Lampa player or an external Android player;
- per-source visibility toggles so Kodik, VK, Alloha, CVH, Sibnet and Aksor can be hidden from the dubbing list; CVH is enabled by default on Android, Android TV and LG WebOS, while Alloha remains disabled by default;
- preferred-player setting on Android: ask every time, internal Lampa player, or external Android player (system app chooser); locked to internal Lampa outside Android;
- blocking Alloha in media players when no direct stream is available, with a clear Lampac warning;
- optional self-hosted Lampac resolution of Alloha sources into direct HLS;
- self-hosted resolver service in `server/` that serves Alloha as a plain HLS stream;
- opening and ending skipping from AniSkip timestamps in the internal player;
- automatic next-episode playback with its stream resolved in advance;
- optional, disabled-by-default YummyTV app integration;
- YummyAnime button on standard Lampa cards and Online registration when that module is available;
- all video sources and dubbings returned by the YummyAnime API (filtered by the Show sources settings);
- local playback history, one-click resume, episode duration and view counts;
- optional automatic internal-player progress synchronization for authorized YummyAnime users, with manual account-page sync when disabled;
- standard Lampa detail cards for matched YummyAnime catalog and schedule entries;
- a Continue Watching catalog built from local playback history;
- YummyAnime actions and correctly normalized read-only comments on standard Lampa cards;
- paginated comments and nested read-only reply threads;
- YummyAnime service status with availability, latency and per-service history;
- Russian, English and Ukrainian extension interface;
- a compact Available translations panel on title details, with separate voice-team and subtitle lists and no source-name or duplicate clutter;
- posters, titles, year, rating and description;
- rating-service logos on cards and detail pages;
- alternative poster sources through Jikan, Shikimori and AniList;
- opening the selected anime in Lampa search;
- modular structure for future development.

## Installation

1. Add the URL of `index.js` to the Lampa extensions section.
2. The extension uses the built-in public application key for YummyAnime for Lampa.

Install the bundled file from GitHub Pages. There are two URLs:

Production — a verified release. The URL stays the same; a serious bug is rolled back by promoting an earlier git tag.

`https://yummyanime.github.io/yummy-lampa-plugin/stable/index.js`

Test — the latest `main` build, including changes that are not a production release yet. The URL stays the same.

`https://yummyanime.github.io/yummy-lampa-plugin/dist/index.js`

Verified versions are tagged `vX.Y.Z`. Release and rollback:

```
node scripts/release.js
node scripts/release.js --promote 0.41.38
```

The `YummyAnime → Status` screen shows YummyStatus history for three hours, one day, one week or one month. GitHub Actions refreshes the monitoring snapshot every five minutes.

## Authorization

Create a YummyAnime account at `https://en.yummyani.me/`. To sign in to the plugin, use your YummyAnime login or email and password under `Settings → YummyAnime → Sign in to YummyAnime`.

The password is used only for sign-in and is not stored by the plugin. After successful authorization, the plugin stores and automatically refreshes the personal Bearer token.

## API

The extension uses:

- `GET /anime` — catalog and filters;
- `GET /anime/genres` — genres.
- `GET /anime/{id}/videos` — available dubbings, episodes and iframe players.

Search is passed through the `q` parameter. The public application key is sent in the `X-Application` header. After login, the user's personal Bearer token is sent separately for authorized requests. The extension does not create YummyAnime applications automatically.

## Project structure

- `index.js` — entry point;
- `src/api.js` — Yani API client;
- `src/catalog.js` — catalog module;
- `src/config.js` — configuration;
- `src/i18n.js` — Russian, English and Ukrainian localization;
- `src/ui-detail.js` — title details, translations, ratings, lists, recommendations and comments;
- `src/ui.js` — Lampa integration;
- `src/stream-resolver.js` — direct Kodik, CVH, Aksor, Sibnet, Rutube and VK stream resolution;
- `src/yani-resolver.js` — client for the self-hosted resolver service in `server/`;
- `src/lampac-resolver.js` — optional self-hosted Lampac adapter for Alloha;
- `server/` — service that turns an Alloha player page into a plain HLS stream;
- `style.css` — styles.

## Sources vs players

The extension treats two different things separately:

| Concept | Meaning | Examples |
| --- | --- | --- |
| **Source** | Video service / aggregator that provides the stream or embed | Kodik, VK, Alloha, CVH, Sibnet, Aksor |
| **Player** | Where the direct stream is actually played | Internal Lampa player, external Android player |

In settings:

1. **Show sources** — toggles for Kodik, VK, Alloha, CVH, Sibnet and Aksor. VK is enabled by default and supported wrapper pages are resolved into direct MP4/HLS streams. CVH is resolved into direct MP4 qualities and defaults to enabled on Android, Android TV and LG WebOS; other platforms keep it opt-in because its API has no CORS access. Alloha remains disabled by default. Disabled sources are omitted from the dubbing list when you press Watch.
2. **Preferred player** — ask every time, internal Lampa player, or external Android player.

On Android, the preferred-player setting is fully editable. On every other platform the setting is inactive, locked to the internal Lampa player, and external playback is never offered.

The external option opens Android’s installed-app chooser. Lampa does not expose a list of installed packages to the extension, so individual apps such as MX Player or VLC cannot be enumerated in settings.

When watching, the voice menu is titled **Choose dubbing and source**. Each row shows the dubbing team and the source name.

## Playback and Alloha

Direct HLS/DASH/MP4/WebM URLs can be played in Lampa or handed to an external Android player. Choose the behavior under `Settings → YummyAnime → Preferred player`.

Alloha is different from an ordinary direct-stream source. Its API may return a protected player page (iframe) instead of a reusable media URL. The page and its manifest depend on short-lived tokens, request headers, and an active player session. An iframe URL is therefore not a video link and cannot be handed directly to Lampa, Kodi, VLC, or another media player. Doing so normally produces an unsupported-source error or a black screen.

The extension handles Alloha in this order:

1. **Resolver server** (`Settings → YummyAnime → YummyAnime resolver server`) — the service in [`server/`](../server/README.md) keeps the required player session and proxies the selected episode and dubbing as a direct HLS stream.
2. **Lampac server** (`Settings → YummyAnime → Lampac server`) — looks the title up again by its external IDs and returns a direct stream when a match exists. Anime matching is not guaranteed.
3. **Source web player** — the `Alloha: source web player` switch, disabled by default. It opens the original Alloha web player inside Lampa without a companion app. This mode does not provide Lampa's native timeline, reliable progress tracking, or external-player handoff.

When a direct-stream adapter and the source web player are both available, a TV-friendly menu lets the viewer choose between the Lampa player and the Alloha web player. Auto-next keeps using the direct stream without opening another dialog. If neither direct-stream adapter is configured and the web fallback is disabled, selecting Alloha shows a warning and playback is blocked. This prevents an iframe from being sent to an incompatible media player. Playable direct-stream sources are sorted above unresolved Alloha entries. An empty server address disables the corresponding adapter, and the extension contains no Alloha or Lampac credentials.

The optional YummyTV integration is available only on Android TV, is disabled by default, and can be enabled separately under `Settings → YummyAnime → Additional integrations`. It only opens the title in the separately installed YummyTV application; it is not an Alloha resolver and is not required for normal extension use.

## Implemented

- detailed anime view;
- a personal event feed, related titles, and trailers;
- favorites and user lists;
- Bearer token refresh through `/profile/token`;
- read-only comments.

Lampa settings include a `YummyAnime` section with a YummyAnime resource and API availability check.

YummyAnime GET requests are cached locally for a short time and may still be shown during temporary API outages.

GitHub Actions automatically checks JavaScript syntax on every push and pull request.

The authenticated token is automatically refreshed through `GET /profile/token`.

The detailed view uses Yani data. The For You feed combines lists, watch history, schedule, new videos, and notifications. Related titles come from the viewing order of up to four recent titles, while trailers are loaded through `/anime/{id}/trailers`.
