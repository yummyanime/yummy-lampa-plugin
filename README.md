# YummyAnime for Lampa

An unofficial YummyAnime extension for Lampa. It adds an anime catalog, schedule, ratings, personal lists, and playback from available sources. The interface is designed for TV remotes.

Current version: `0.45.9`

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

## Additional information

- Interface languages: Russian, English, and Ukrainian.
- Playback depends on the available sources and their formats.

Author: Andrew Codeman

<sub>[Русская версия](docs/README.ru.md)</sub>
