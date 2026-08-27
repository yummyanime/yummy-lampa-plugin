# YummyAnime for Lampa

An unofficial YummyAnime extension for Lampa. It adds an anime catalog, schedule, ratings, personal lists, and playback from available sources. The interface is designed for TV remotes.

Current version: `0.45.13`

[Changelog](CHANGELOG.md) · [Technical documentation](docs/README.en.md)

## Installation

Add one of these URLs in the Lampa extensions settings.

Stable version:

`https://yummyanime.github.io/yummy-lampa-plugin/stable/index.js`

Test version from `main`:

`https://yummyanime.github.io/yummy-lampa-plugin/dist/index.js`

Use the stable version for everyday use.

## Sign in

Open `Settings → YummyAnime → Sign in to YummyAnime`, then enter your username or email and password.

Signing in enables your profile, notifications, ratings, favorites, personal lists, and watch-progress sync. The password is not stored. The extension stores a Bearer token on the device and refreshes it automatically.

## Main sections

- **Catalog** — browse anime with sorting and filters for type, status, and year.
- **Genres** — genre descriptions and separate genre catalogs.
- **Search** — search by main and alternative titles.
- **Collections** — themed YummyAnime collections.
- **Top** — overall ranking, series, movies, and ONA.
- **Updates** — recent activity for subscriptions and personal lists.
- **Continue Watching** — unfinished titles from local and YummyAnime watch history.
- **My Lists** — quick access to your library.
- **Account** — profile, statistics, and synchronization.
- **Status** — availability of YummyAnime services.

Sections you do not use can be hidden in the extension settings.

## Schedule

The schedule opens on the current day and covers the previous week, the current week, and the next two weeks. Each release can show its episode number, local time, rating, and available dubbing or subtitle teams.

Disabled sources are hidden. The last successfully loaded schedule remains available during temporary API problems.

## Ratings

The extension can show ratings from YummyAnime, Kinopoisk, Shikimori, AniDB, MyAnimeList, and World-Art. Service logos keep the rating panel compact.

Signed-in users can give a YummyAnime rating from 1 to 10 or remove it. Ratings and the YummyAnime button on standard Lampa cards can be disabled separately.

## Lists

Available lists are **Watching**, **Planned**, **Completed**, **Dropped**, **Postponed**, and **Favorite**.

A title can have only one main status. **Favorite** is independent and can be enabled or disabled separately. List status can be changed from the title page.

**My Lists** shows recently added titles and opens each full list. **Continue Watching** combines local history with YummyAnime watch progress. Automatic synchronization can be enabled in settings or started manually from the account page.

## Playback and sources such as Alloha

Lampa's internal player and external Android players need a direct video stream, usually HLS (`.m3u8`), DASH, MP4, or WebM. Most sources can provide one. Sources such as Alloha may instead return a protected web player (an iframe), which is a web page rather than a playable video link. Sending that page to Lampa, VLC, Kodi, or another media player results in an error or a black screen.

For Alloha, the extension uses the following order:

1. **YummyAnime resolver server** — converts the selected episode and dubbing into a direct HLS stream.
2. **Lampac server** — tries to find a direct stream by the title's external IDs; matching is not guaranteed.
3. **Alloha embedded site player** — an optional fallback, disabled by default. It opens the original web player inside Lampa, so Lampa's timeline, progress tracking, and external-player handoff are unavailable.

If none of these options is configured, Alloha playback is blocked with an explanation instead of sending an iframe to an incompatible player. Other available sources remain usable and are placed higher in the dubbing list. Resolver and Lampac addresses, source visibility, the embedded Alloha fallback, and the preferred player are configured under `Settings → YummyAnime`.

The optional YummyTV integration only opens the title in the separately installed YummyTV application. It is not an Alloha resolver and is not required for the extension.


## Additional information

- Interface languages: Russian, English, and Ukrainian.
- Playback depends on the available sources and their formats.

Author: Andrew Codeman

<sub>[Русская версия](docs/README.ru.md)</sub>
