# Lampa Yani — Documentation

A new Lampa extension powered by the official YummyAnime (Yani) API.

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
- dubbing and episode selection with direct-stream playback in Lampa or an external player;
- blocking Alloha in media players when no direct stream is available, with a clear Lampac warning;
- optional self-hosted Lampac resolution of Alloha sources into direct HLS;
- self-hosted resolver service in `server/` that serves Alloha as a plain HLS stream;
- opening and ending skipping from AniSkip timestamps in the internal player;
- automatic next-episode playback with its stream resolved in advance;
- optional, disabled-by-default YummyTV app integration;
- YummyAnime button on standard Lampa cards and Online registration when that module is available;
- all players and dubbings returned by the YummyAnime API;
- preferred-player setting with the last selected source remembered;
- local playback history, one-click resume, episode duration and view counts;
- optional automatic internal-player progress synchronization for authorized YummyAnime users, with manual account-page sync when disabled;
- standard Lampa detail cards for matched YummyAnime catalog and schedule entries;
- a Continue Watching catalog built from local playback history;
- YummyAnime actions and correctly normalized read-only comments on standard Lampa cards;
- paginated comments and nested read-only reply threads;
- YummyAnime service status with availability, latency and per-service history;
- Russian, English and Ukrainian extension interface;
- a compact Available translations panel on title details, with separate voice-team and subtitle lists and no player-name or duplicate clutter;
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

## Playback and Alloha

Direct HLS/DASH/MP4/WebM URLs can be played in Lampa or handed to an external Android player. Choose the behavior under `Settings → YummyAnime → Playback target`.

Alloha never exposes a direct stream: its player page refuses to run outside an iframe, the manifest requires `authorizations` and `accepts-controls` headers where the latter rotates over a WebSocket every couple of minutes, and the token inside the `master.m3u8` path is single-use. A browser cannot attach those headers to a cross-origin request, which is why the extension cannot solve this on its own and defers to an external service.

Direct-stream providers are tried in order:

1. **Resolver server** (`Settings → YummyAnime → YummyAnime resolver server`) — the service in [`server/`](../server/README.md), which keeps a live Alloha session in a headless browser and proxies the manifest with current headers. It matches the exact episode and dubbing.
2. **Lampac server** (`Settings → YummyAnime → Lampac server`) — looks the title up again by its external ids, so it does not always find anime.
3. **Embedded site player** — the `Alloha: embedded site player` switch, disabled by default. It opens the original Alloha player inside Lampa: no infrastructure required, but also no Lampa timeline and no external player.

With none of them configured, selecting Alloha shows a warning and playback is blocked. An empty address disables the matching adapter. The extension contains no Alloha or Lampac credentials.

The private YummyTV application integration is disabled by default and can be enabled separately in the playback sources settings block.

## Implemented

- detailed anime view;
- recommendations and trailers;
- favorites and user lists;
- Bearer token refresh through `/profile/token`;
- read-only comments.

Lampa settings include a `YummyAnime` section with a YummyAnime resource and API availability check.

YummyAnime GET requests are cached locally for a short time and may still be shown during temporary API outages.

GitHub Actions automatically checks JavaScript syntax on every push and pull request.

The authenticated token is automatically refreshed through `GET /profile/token`.

The detailed view uses Yani data, while trailers and recommendations are loaded through `/anime/{id}/trailers` and `/anime/{id}/recommendations`.
