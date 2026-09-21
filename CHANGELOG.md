# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries use [Keep a Changelog](https://keepachangelog.com/) categories: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**. The commit hook folds every `###` section under `[Unreleased]` (unknown headings are kept after the standard six).

## [Unreleased]

## [0.47.1] - 2026-09-21

### Added

- Color remote shortcuts on title pages: red for Watching, green for Planned, blue for Completed, and yellow for Favorites
- A persistent mutation queue that retries progress, list, favorite, and rating changes after connectivity returns

### Changed

- User-list controls on title pages moved into a separate dock below the poster to keep them out of the primary Watch-button focus path
- Voice choices to show the number of unique available episodes

### Fixed

- CVH selection for movies without episode fields and for dubbing labels that do not exactly match `dubbing_code`
- Playback position being lost when the same episode is opened through another voice or source

## [0.47.0] - 2026-09-21

### Changed

- Changelog entries to Keep a Changelog categories
- Signed-stream caching to respect URL expiration

### Fixed

- Interrupted signed streams in the internal Lampa player by refreshing their URL once and resuming playback

## [0.46.43] - 2026-09-21

### Fixed

- Playback progress after current Lampa player lifecycle changes
- Continue Watching refreshing after local progress changes

## [0.46.42] - 2026-09-11

### Added

- A pointer-revealed exit control for platforms with a cursor

### Fixed

- Back not leaving the embedded player on webOS by handing the keys to the page only on Android

## [0.46.41] - 2026-09-10

### Fixed

- Sibnet on Android by opening its embedded page again, since no Lampa engine sends the referrer its file requires

## [0.46.40] - 2026-09-10

### Fixed

- CVH and VK breaking in the internal player after a header check that treated any header as a requirement
- The internal player warning to fire only for streams the resolver marks as unplayable without their headers

## [0.46.39] - 2026-09-07

### Added

- A warning when a stream that needs request headers is opened in the internal player, which cannot send them

## [0.46.38] - 2026-09-07

### Fixed

- Sibnet on Android opening a web page no remote can operate by playing its stream in the platform player instead

## [0.46.37] - 2026-09-07

### Added

- Focus handover into the embedded player so a real remote press reaches its own controls

## [0.46.36] - 2026-09-07

### Removed

- The embedded player back control so the remote reaches the page's own buttons instead of a focus holder that took every press

## [0.46.35] - 2026-09-06

### Fixed

- The embedded Alloha page reporting missing content by opening it through a referrer bridge published with the plugin

## [0.46.34] - 2026-09-06

### Added

- Autoplay to the embedded Alloha page so it starts without a pointer on a remote

## [0.46.33] - 2026-09-06

### Fixed

- Continue Watching waiting on a request per title before drawing by building the list from known history and filling the card badges in afterwards

## [0.46.32] - 2026-09-06

### Fixed

- The wait before Continue Watching appears by fetching history pages together and remembering episode counts between openings

## [0.46.31] - 2026-09-06

### Changed

- The embedded player back control into a small arrow so it stops covering the picture

## [0.46.30] - 2026-09-06

### Removed

- The back button covering the embedded player picture, closing it with the remote Back key alone

## [0.46.29] - 2026-09-06

### Fixed

- Sibnet failing in the internal player by letting a stream that needs request headers use the platform player instead of the built-in engine

## [0.46.28] - 2026-09-06

### Fixed

- Lampa header drawing over the embedded player video

## [0.46.27] - 2026-09-06

### Fixed

- The embedded player showing an empty list instead of the video because a missing translator threw while the component was built

## [0.46.26] - 2026-09-06

### Fixed

- VK streams failing in the internal Android player by signing the link for the agent that plays it
- Sibnet by resolving its redirect to the file that needs no headers

## [0.46.25] - 2026-09-06

### Removed

- The internal player quality cap

### Fixed

- VK playback for the current OK CDN response
- Sibnet playback through its required web player

## [0.46.24] - 2026-09-03

### Added

- README screenshots of the home, title, schedule, and genre screens

## [0.46.23] - 2026-09-03

### Fixed

- Official YummyAnime plugin wording and publish the stable install URL

## [0.46.22] - 2026-08-30

### Fixed

- CVH streams failing in the internal Android player by signing the CDN link for the agent that plays it

## [0.46.21] - 2026-08-30

### Fixed

- Android TV CVH internal playback CORS
- Complete episode and dubbing grouping

## [0.46.20] - 2026-08-30

### Removed

- Expected TMDB fallback warnings

### Fixed

- Android TV CVH player routing

## [0.46.19] - 2026-08-30

### Fixed

- Android TV CVH playback fallback
- Episode list ordering

## [0.46.18] - 2026-08-30

### Changed

- Android TV CVH media metadata

### Fixed

- Episode grouping and numeric ordering

## [0.46.17] - 2026-08-30

### Changed

- CVH platform defaults for LG WebOS

### Fixed

- CVH settings guidance

## [0.46.16] - 2026-08-30

### Added

- Extension hints for CVH quality streams

### Fixed

- CVH detection in the internal Android player

## [0.46.15] - 2026-08-30

### Fixed

- Repeated episode player teardown
- Stale player callbacks restoring focus

## [0.46.14] - 2026-08-30

### Changed

- CVH default for Android

### Fixed

- CVH direct MP4 playback

## [0.46.13] - 2026-08-30

### Changed

- Alloha web playback

### Fixed

- Iframe return focus

## [0.46.12] - 2026-08-30

### Added

- Live authorization status to settings

## [0.46.11] - 2026-08-30

### Added

- VK source visibility setting

### Fixed

- VK playback for wrapper and video_ext pages

## [0.46.10] - 2026-08-28

### Fixed

- YummyTV availability to Android TV only

## [0.46.9] - 2026-08-28

### Added

- Compatibility warnings for experimental sources

### Changed

- Settings into clear sections
- Authorization placement to the top

### Fixed

- Alloha and CVH safe defaults

## [0.46.8] - 2026-08-28

### Added

- Registration guidance to authorization screens

## [0.46.7] - 2026-08-28

### Fixed

- Internal player focus restoration after closing playback

## [0.46.6] - 2026-08-27

### Fixed

- Focus restoration after returning from external players

## [0.46.5] - 2026-08-27

### Fixed

- Focus restoration after returning from YummyTV

## [0.46.4] - 2026-08-27

### Fixed

- Immediate dashboard refresh after account sign-in and sign-out

## [0.46.3] - 2026-08-27

### Added

- Sign-out action to the bottom of dashboard Account

## [0.46.2] - 2026-08-27

### Added

- Dashboard Account authorization with immediate profile refresh

## [0.46.1] - 2026-08-27

### Fixed

- Account authorization state in settings after sign-out

## [0.46.0] - 2026-08-27

### Added

- Related titles from recent viewing-order connections

### Changed

- For You into a personal event feed built from lists, watch history, subscriptions, schedule, new videos, and notifications

## [0.45.13] - 2026-08-27

### Changed

- Collection tiles with prominent two-line titles, a deeper readability gradient and TV-focus accent

## [0.45.12] - 2026-08-27

### Changed

- Account history loading into 30-record pages with partial-result fallback

### Fixed

- Continue Watching appearing empty because a 300-record history request was sent as one unsupported API page

## [0.45.11] - 2026-08-27

### Changed

- Live dashboard refreshes into a coalesced render queue

### Fixed

- Dashboard focus stalls by deferring background DOM updates until remote navigation becomes idle

## [0.45.10] - 2026-08-27

### Added

- A clear playback guide for iframe sources such as Alloha, direct-stream resolvers, Lampac, the embedded fallback, and optional YummyTV integration

## [0.45.9] - 2026-08-25

### Added

- A notice and return to the title card when auto-next reaches the last episode
- Ratings and the last watched episode to Continue Watching cards
- An optional Russian translation as a separate document

### Changed

- The main README into concise English documentation

### Removed

- Premature MIT license references until the project license is chosen

### Fixed

- Continue Watching for YummyAnime history records without video IDs when the episode number is provided in ep_title
- Continue Watching by loading up to 300 recent YummyAnime history records and invalidating the smaller dashboard cache

## [0.45.8] - 2026-08-25

### Fixed

- Counting an episode as watched after 30 seconds of playback

## [0.45.7] - 2026-08-25

### Fixed

- Watch progress staying stale on plugin cards, the title page, and Continue Watching

## [0.45.6] - 2026-08-23

### Added

- Colour bands to the YummyAnime score so it reads at a glance

## [0.45.5] - 2026-08-23

### Added

- Coverage proving account watch history alone fills Continue Watching

### Removed

- The debug breakdown from the viewer's screen

## [0.45.4] - 2026-08-23

### Removed

- The user-list filter from Continue Watching so only a watched last episode ends a title

## [0.45.3] - 2026-08-23

### Added

- A Continue Watching breakdown reporting how many records came from the account and which filter removed each title

## [0.45.2] - 2026-08-23

### Added

- Episode counts resolved from the title so the queue knows when a title is actually over

### Fixed

- A finished episode dropping its whole title from Continue Watching instead of advancing to the next one

## [0.45.1] - 2026-08-23

### Fixed

- One shared 95 percent rule for a finished episode across the detail summary, watched reach and Continue Watching

## [0.45.0] - 2026-08-23

### Added

- The furthest watched episode to history entries and cards
- An account history pull at startup so devices share progress
- Account reporting for the embedded site player

### Fixed

- Continue Watching dropping a title after an episode finishes instead of offering the next one

## [0.44.20] - 2026-08-23

### Removed

- The temporary player resource probe now that the decoder leak is fixed

## [0.44.19] - 2026-08-23

### Fixed

- The automatic episode switch stranding a video decoder per advance by closing the running player first

## [0.44.18] - 2026-08-23

### Added

- A temporary player resource probe to the test build for diagnosing the repeated-playback renderer crash

## [0.44.17] - 2026-08-21

### Added

- Silent background refresh for fresh offline caches

### Fixed

- Live schedule updates while preserving focus and scroll

## [0.44.16] - 2026-08-21

### Fixed

- Collections to render from the first available cached source

## [0.44.15] - 2026-08-21

### Added

- Offline-first cache for collections, genres and schedule

### Fixed

- Focus and scroll restoration after returning from nested pages

## [0.44.14] - 2026-08-20

### Fixed

- Episode numbers normalized across playback, resume history and stream resolvers

## [0.44.13] - 2026-08-19

### Fixed

- Schedule posters increased by 20 percent

## [0.44.12] - 2026-08-19

### Fixed

- Schedule YA ratings loaded from title details when schedule data omits them

## [0.44.11] - 2026-08-19

### Fixed

- Release-order YA ratings aligned to the right edge

## [0.44.10] - 2026-08-19

### Fixed

- Auto-next player cascade by binding each watcher to one video and ignoring stale callbacks

## [0.44.9] - 2026-08-19

### Fixed

- YummyAnime Lampa button to retain native height while remaining 20 percent wider

## [0.44.8] - 2026-08-19

### Added

- YA rating to release order and schedule day lists

### Removed

- Japan labels from dashboard copy

### Fixed

- Auto-next skipping one extra episode because Lampa playlist and plugin both advanced
- Native Lampa YummyAnime rating to YA text in brand color
- YummyAnime Lampa button height and increase width by 20 percent

## [0.44.7] - 2026-08-18

### Removed

- The duplicate YummyAnime API check from Settings

### Fixed

- Schedule dubbing labels to respect enabled playback sources

## [0.44.6] - 2026-08-17

### Fixed

- Dashboard library preview contract after section-rail focus navigation change

## [0.44.5] - 2026-08-17

### Fixed

- Android dashboard focus vanishing for one step on the section rail

## [0.44.4] - 2026-08-17

### Fixed

- Schedule title poster size increased by about 50 percent

## [0.44.3] - 2026-08-17

### Fixed

- Release cut past already published 0.44.1 with schedule crash and translation list fixes

## [0.44.2] - 2026-08-17

### Fixed

- Schedule page crash from a leftover createAvailability call after translation list rewrite

## [0.44.1] - 2026-08-17

### Added

- Per-episode voice and subtitle team lists on the schedule page

### Fixed

- Schedule day focus navigation jumping between chips and titles

## [0.44.0] - 2026-08-17

### Added

- Per-source visibility toggles for Kodik, Alloha, CVH, Sibnet and Aksor

### Changed

- Preferred player to ask / internal Lampa / external Android chooser

### Fixed

- Confusing shared “player” wording by splitting sources and playback players in settings and voice selection
- Preferred-player selection being inactive outside Android and locked to the internal Lampa player

## [0.43.4] - 2026-08-17

### Fixed

- AniSkip suggest-skip buttons being visible but unreachable with a TV remote

## [0.43.3] - 2026-08-17

### Fixed

- Title detail opening with focus on Watch instead of the title name

## [0.43.2] - 2026-08-17

### Fixed

- TV focus not returning to the title page after closing rating or comment-reply Select windows

## [0.43.1] - 2026-08-17

### Fixed

- External Android player options being offered on Tizen, WebOS, and other non-Android platforms

## [0.43.0] - 2026-08-16

### Fixed

- Genre and collection Enter navigation on legacy Lampa Card onEnter
- Native TMDB near-miss matches for similar live-action titles
- Lampa global Search crash from a missing YummyAnime source params object

## [0.42.49] - 2026-08-16

### Fixed

- Lampa global Search crash caused by a YummyAnime source without params

## [0.42.48] - 2026-08-16

### Fixed

- Opening YummyAnime titles in Lampa when a similar live-action TMDB title shares the year
- Native TMDB matching to prefer animation and reject near-miss localized titles

## [0.42.47] - 2026-08-16

### Fixed

- Genre and collection Enter by replacing Lampa Card `onEnter` instead of adding a second DOM handler
- Duplicate Activity entries that required two Back presses and hung after a few opens

## [0.42.46] - 2026-08-16

### Fixed

- Genre and collection opening on Lampa builds that mutate card `params`
- Duplicate navigation without relying on a native click event

## [0.42.45] - 2026-08-16

### Fixed

- Duplicate genre and collection activity entries by using one Lampa-native enter handler per tile
- The tile hub loader after rebuilding a screen evicted from Lampa's activity history

## [0.42.44] - 2026-08-16

### Fixed

- Tile hub return navigation by removing duplicate enter handlers and ignoring late responses after a screen closes
- Loading indicators persisting after genre and collection pages finish or fail

## [0.42.43] - 2026-08-16

### Fixed

- Duplicate genre and collection navigation entries that caused loading screens when returning to tile hubs
- Recommended title focus leaving the visible horizontal row when navigating left

## [0.42.42] - 2026-08-16

### Fixed

- Genre and collection tile clicks to open a separate catalog page with the old working loader

## [0.42.41] - 2026-08-16

### Fixed

- Genre and collection pages hanging on load by isolating catalog query params from Lampa InteractionCategory and always clearing the activity loader

## [0.42.40] - 2026-08-16

### Added

- Readable collection titles directly to catalog tiles

### Fixed

- Genre and collection pages getting stuck when the YummyAnime API is unavailable

## [0.42.39] - 2026-08-16

### Added

- Adaptive TV navigation and responsive tile layouts

### Changed

- Genres and Collections into focused tile catalogs

## [0.42.38] - 2026-08-16

### Fixed

- Search input showing duplicate fields on some devices by preferring Input.edit API and adding double-show guard

## [0.42.37] - 2026-08-16

### Fixed

- Genre and collection tile cards showing portrait — mark items-line row container after build so CSS can style all cards reliably

## [0.42.36] - 2026-08-16

### Fixed

- Genre and collection shortcut cards using Lampa's node-only render callback

## [0.42.35] - 2026-08-16

### Added

- A TV-native collection shortcut row above collection rails

## [0.42.34] - 2026-08-16

### Changed

- Genre shortcuts into a TV-native horizontal card row

## [0.42.33] - 2026-08-16

### Fixed

- Catalog rendering after adding genre shortcut tiles

## [0.42.32] - 2026-08-16

### Added

- Genre shortcut tiles above the Genres hub rows

## [0.42.31] - 2026-08-16

### Added

- Faster parallel genre hub loading and a 15-minute row cache

## [0.42.30] - 2026-08-16

### Fixed

- Genres and Collections hubs by loading all rail rows before render

## [0.42.29] - 2026-08-16

### Fixed

- Rail pagination using the focused DOM row instead of stale Lampa state

## [0.42.28] - 2026-08-16

### Fixed

- Repeated four-row loading without relying on Lampa scroll events

## [0.42.27] - 2026-08-16

### Fixed

- Genres and Collections stopping after the eighth hub row

## [0.42.26] - 2026-08-16

### Fixed

- Genres and Collections hub rows not loading after the first four

## [0.42.25] - 2026-08-16

### Added

- Internal Lampa player to the preferred player setting

## [0.42.24] - 2026-08-16

### Added

- Endings-only and suggest-skip AniSkip modes

## [0.42.23] - 2026-08-16

### Fixed

- Keep YummyTV integration disabled by default

## [0.42.22] - 2026-08-16

### Fixed

- YummyTV integration being disabled by default

## [0.42.21] - 2026-08-16

### Fixed

- Usage policy Close button asking Lampa to exit the app

## [0.42.20] - 2026-08-16

### Fixed

- Watch flow reopening playback choice and killing the player

## [0.42.19] - 2026-08-16

### Fixed

- Refusing a parent TMDB series when YummyAnime is a later season

## [0.42.18] - 2026-08-16

### Fixed

- TMDB card lookup for YummyAnime season sequels like Grand Blue 2

## [0.42.17] - 2026-08-16

### Fixed

- Lampa card lookup from the title page missing English aliases

## [0.42.16] - 2026-08-16

### Fixed

- TV card posters looking pixelated after downscale

## [0.42.15] - 2026-08-15

### Added

- Lazy batch loading to collection rows

## [0.42.14] - 2026-08-15

### Added

- Account-list icons on posters from catalog data

### Fixed

- Focused catalog year overlapping the poster

## [0.42.13] - 2026-08-15

### Fixed

- Continue watching list emptying while the dashboard still shows the last title

## [0.42.12] - 2026-08-15

### Added

- Focusable fullscreen poster viewing on title cards

## [0.42.11] - 2026-08-15

### Added

- Lazy batch loading to genre rows

## [0.42.10] - 2026-08-15

### Fixed

- My lists, collection, and genre cards to render as horizontal Lampa rows

## [0.42.9] - 2026-08-15

### Added

- Collection card rows like my lists
- Genre card rows like my lists

## [0.42.8] - 2026-08-15

### Fixed

- My lists rails to use Lampa card size
- Collections to show collection cards again
- Genres to open the picker again

## [0.42.7] - 2026-08-15

### Fixed

- YummyAnime sidebar item disappearing and not keeping its saved menu place

## [0.42.6] - 2026-08-15

### Fixed

- Trailer playback

## [0.42.5] - 2026-08-15

### Added

- Collection card rows
- Genre card rows

### Fixed

- My lists card rows

## [0.42.4] - 2026-08-14

### Fixed

- Catalog card row spacing

## [0.42.3] - 2026-08-14

### Fixed

- Catalog card size
- Title card grid centering

## [0.42.2] - 2026-08-14

### Fixed

- Catalog poster sharpness

## [0.42.1] - 2026-08-14

### Removed

- Public application key setting
- Official extension wording

## [0.42.0] - 2026-08-14

### Added

- Official YummyAnime extension label

### Removed

- Russian documentation

### Fixed

- Dist bundle newlines
- Linux CI CRLF mismatch

## [0.41.46] - 2026-08-13

### Changed

- Show unread notifications on the home tile even when the counts API returns 0, by checking the notification list and keeping the cache in sync

## [0.41.45] - 2026-08-13

### Changed

- Pull YummyAnime watch progress into local history so title cards, resume and Continue Watching use the account, not only Lampa playback

## [0.41.44] - 2026-08-13

### Changed

- Keep a permanent test install URL at dist/index.js, without a version query that pins Lampa to an old build

## [0.41.43] - 2026-08-13

### Changed

- Stop a sidebar menu error from aborting plugin registration, so settings and YummyAnime screens still load

## [0.41.42] - 2026-08-13

### Changed

- Keep the YummyAnime sidebar item visible and in its saved place on devices where Lampa's menu editor drops plugin buttons

## [0.41.41] - 2026-08-13

### Changed

- Keep a production install URL separate from the experimental dist URL, tag verified releases, and roll production back by promoting an earlier git tag

## [0.41.40] - 2026-08-13

### Added

- A single script that updates the plugin version in src/config.js, README, docs, changelog, the install URL, and the built dist bundle

## [0.41.39] - 2026-08-13

### Changed

- Synchronized Russian and English documentation with the current installation URL
- Documented Ukrainian localization and the title-detail voice-team and subtitle panel
- Updated the documented project structure after extracting the title-detail module

## [0.41.38] - 2026-08-13

### Changed

- Focus the last-watched dubbing in the voice picker when opening Watch, using the previous episode's saved voice when that group is still available

## [0.41.37] - 2026-08-13

### Changed

- Share one cached `/videos` request across catalog cards, title-card episode stats, translation chips, and the Watch menu, with TTL, a bounded cache, and abort when the title card closes

## [0.41.36] - 2026-08-13

### Changed

- Show watched episode numbers on the title card (`10, 13` or `1–100`) instead of a count that looks like the first N episodes; collapse long lists into ranges and truncate sparse ones

## [0.41.35] - 2026-08-13

### Changed

- Open the voice and episode pickers without waiting on Jikan episode titles; reuse the title-page videos request from memory so Watch does not refetch before the dubbing list

## [0.41.34] - 2026-08-13

### Removed

- The remote-focus pause on the dashboard: keep D-pad movement instant, and stop scaling tiles, ambient layers, and intro art on every focus change

## [0.41.33] - 2026-08-13

### Changed

- Extract the YummyAnime title Detail page into `src/ui-detail.js` (`LampaYaniDetail.create`) so the main UI shell delegates detail rendering through injected dependencies

## [0.41.32] - 2026-08-13

### Changed

- Extract shared title-card mapping (`toCard`, ratings, media meta, watched-episode progress) into `src/ui-card-model.js` so catalog, detail, and Lampa card integration share one model

## [0.41.31] - 2026-08-13

### Added

- Portrait / short-height / ultra-wide CSS breakpoints for vertical emulator windows, 720p-class viewports, and 4K reading width

### Changed

- Scale card overlay density by font-relative `em` size so Lampa interface scale, 720p, and 4K do not change when badges collapse

## [0.41.30] - 2026-08-13

### Added

- Shared section states for skeleton loading, API offline, cached data, truly empty lists, and retry across schedule, notifications, status, releases, translations, updates, recommendations, and collections

### Changed

- Mark stale API fallback payloads so screens can show a cached-data banner instead of looking like a live empty failure

## [0.41.29] - 2026-08-13

### Changed

- Unify small-poster card overlays by priority: list status and playback progress stay first, then fresh episode, quality/voices, genre top, and ratings
- When the poster is crowded, secondary badges hide in that order instead of overlapping; top-start media and top-end fresh/history badges keep separate lanes

## [0.41.28] - 2026-08-13

### Changed

- Classify detail-page translations by dubbing labels from real Yani names: voice prefixes like `Озвучка Kazoku Sub` / `Озвучка SubVost` stay in voice teams, while `Субтитры …`, SoftSub/HardSub/сабы variants still go to subtitles

## [0.41.27] - 2026-08-12

### Added

- Anonymized YummyAnime API response fixtures for catalog/detail, videos, schedule, lists, comments, notifications, and history/progress under `tests/fixtures/yani-api/`

### Changed

- Guard those envelopes with a contract test that runs the real normalizers so API shape drift fails CI before a broken release

## [0.41.26] - 2026-08-12

### Changed

- Speed up catalog/dashboard card paints: keep existing rating chips instead of rebuilding them on every Lampa `cardRender`, sync overlay classes once per decorate, and cache local playback history briefly while many cards resolve progress
- Drop per-chip focus shadows that were expensive on weak TV WebViews

## [0.41.25] - 2026-08-12

### Changed

- Gate GitHub Pages deploy on JavaScript syntax checks, the full contract-test suite, a fresh `node build.js`, and a `dist/index.js` freshness check against sources
- Keep the YummyStatus snapshot refresh best-effort (`continue-on-error`) so a status API outage cannot block plugin publishing

## [0.41.24] - 2026-08-12

### Changed

- Unified catalog and title-detail ratings into one compact logo+score chip panel with consistent logo size and clearer card focus
- Keep at most three positive ratings on cards (YummyAnime first) and lift the panel above list, playback, and progress overlays so it no longer collides with quality badges or footer chrome

## [0.41.23] - 2026-08-12

### Changed

- Extracted native Lampa card resolve, reverse Yummy match, and full-detail rating/button decoration into `src/ui-standard-card.js`
- Kept `openYummyDetail` and online-source registration in `ui.js`

## [0.41.22] - 2026-08-12

### Changed

- Extracted playback select menus, return-focus helpers, and video URL/player-key utils into `src/ui-playback-menu.js`
- Left stream launch, Alloha policy, and player watchers in `ui.js` for the next standard-card extraction

## [0.41.21] - 2026-08-12

### Changed

- Extracted local playback history storage and Continue Watching progress UI into `src/ui-playback-history.js`
- Kept player progress watchers and flush callbacks in `ui.js` for the next playback-menu extraction

## [0.41.20] - 2026-08-12

### Changed

- Extracted YummyAnime catalog card bind/open helpers into `src/ui-card-bind.js`
- Left Continue Watching history-card overrides in `ui.js` for the next progress/history extraction

## [0.41.19] - 2026-08-12

### Changed

- Extracted shared YummyAnime card decoration helpers into `src/ui-card-renderers.js`
- Kept catalog card open/bind lifecycle in `ui.js` and wired decoration through `LampaYaniCardRenderers.create`

## [0.41.18] - 2026-08-12

### Changed

- Show only the dubbing or subtitle team name on title-detail translation chips when a team is present
- Keep the generic “Озвучка” / “Субтитры” label only for entries without a team name

## [0.41.17] - 2026-08-12

### Changed

- Show the full genre description in the catalog header instead of clamping it to two lines
- Keep catalog TV-remote focus on title cards only: the sort/filter command deck is no longer a D-pad target and remains reachable via color/number shortcuts and mouse clicks

## [0.41.16] - 2026-08-12

### Added

- A dedicated title-detail panel listing unique voice teams and subtitle releases

### Changed

- Shared the video request with episode statistics and added lightweight reduced-motion-aware presentation

### Removed

- Player names and duplicate translation entries from this informational panel

## [0.41.15] - 2026-08-12

### Added

- Lightweight reveal motion with automatic reduced-motion and weak-device fallbacks

### Changed

- Redesigned video quality and dubbing availability as one compact glass-style card indicator

## [0.41.14] - 2026-08-12

### Added

- Compact episode and playback percentage indicators to YummyAnime cards
- A slim progress bar that updates on visible cards after playback progress changes

## [0.41.13] - 2026-08-12

### Added

- Compact freshness labels to updated title cards: Today, Yesterday, or a localized date

### Changed

- Highlighted recently updated cards without making extra API requests

## [0.41.12] - 2026-08-12

### Added

- Distinct compact colors for ongoing, released and announced title states

### Changed

- Included watched/available episode progress in the card metadata line using account-list data or reliable local playback history without extra API requests

## [0.41.11] - 2026-08-12

### Added

- A compact metadata line below title cards with media type, release status, available episode counts and year when supplied by YummyAnime

### Removed

- The duplicate media-type badge from poster artwork and retained quality, dubbing and genre-top badges

## [0.41.10] - 2026-08-12

### Changed

- Load the full localized genre description from the YummyAnime genre endpoint and keep the bundled description as an offline fallback
- Cache genre details for 24 hours and decode API HTML entities before displaying plain text in the TV catalog header

## [0.41.9] - 2026-08-12

### Added

- A compact trophy badge with the actual top-100 position to cards in a genre catalog

### Changed

- Corrected the Popular sort direction so genre positions are derived from the API's real best-first order; the badge remains self-contained with an embedded SVG

## [0.41.8] - 2026-08-12

### Added

- Localized textual genre descriptions when the YummyAnime API only provides a genre title and identifier

### Changed

- Expanded the genre catalog header to show a readable two-line description instead of truncating it to one line

## [0.41.7] - 2026-08-12

### Changed

- Embedded remote color and number hints into Schedule day/release controls and the actionable More cards in My Lists, removing the separate shortcut legends

## [0.41.6] - 2026-08-12

### Changed

- Replaced the separate catalog remote legend with compact color and number badges embedded directly into the corresponding filter and sorting buttons

## [0.41.5] - 2026-08-12

### Added

- Compact remote-control legends and color-key shortcuts to Schedule and My Lists: day navigation and release focus in Schedule; direct account-list and watch-history access in My Lists

## [0.41.4] - 2026-08-12

### Added

- A compact TV remote legend to catalog controls and color/number shortcuts for catalog modes, sorting, filters and returning to the first row

## [0.41.3] - 2026-08-12

### Fixed

- Catalog remote handlers on Android/TV Lampa builds, where `Controller.enabled()` returns the active controller directly instead of a nested `controller` field

## [0.41.2] - 2026-08-12

### Fixed

- Vertical catalog navigation for Lampa builds that do not expose Down links through `Navigator`: the remote now selects the closest poster in the next grid row and scrolls it into view

## [0.41.1] - 2026-08-12

### Changed

- Kept the last focused poster in sync and added a scroll fallback when the next catalog row is not yet available

### Fixed

- Catalog remote navigation after the new command deck: Down now rebuilds the poster collection before moving focus into it

## [0.41.0] - 2026-08-12

### Added

- One bounded focus-state manager for catalog, search results, account lists, My Lists, schedule and title details

### Changed

- Restored logical focus keys and scroll positions after a screen rerender instead of relying only on stale DOM nodes
- Routed temporary Select and Input returns through the same restoration mechanism
- Kept at most 32 screen states to avoid unbounded memory growth during long TV sessions

## [0.40.5] - 2026-08-12

### Added

- Inline expand, collapse and Back handling while preserving the last focused title

### Changed

- Replaced the permanently expanded account-list sorting row with a compact TV-friendly sorting capsule
- Kept list identity, item count and the active sorting mode visible without taking space from the poster grid

## [0.40.4] - 2026-08-12

### Added

- Predictable navigation from the first card row to sorting and filters, and back to the last focused title

### Changed

- Replaced the floating catalog toolbar with an integrated horizontal command deck designed for TV remotes
- Kept genre title and description above catalog controls and removed the unused right-side layout gap

## [0.40.3] - 2026-08-12

### Added

- A persistent selected-genre header with the genre name and API description, including a localized fallback

### Changed

- Replaced the sorting popup with an inline five-mode TV rail controlled directly by Up, Down, Left, Right and OK
- Kept list cards and sorting inside the same Lampa controller to make remote navigation predictable
- Preserved genre context after sorting and filtering the catalog

## [0.40.2] - 2026-08-12

### Added

- Distinct icons, colors and a clear current-sort marker for every sorting mode

### Changed

- Replaced the generic list sorting popup with a dedicated TV-friendly selector
- Restored focus to the sorting card after Back/Left and removed stale sorting overlays when leaving a list

## [0.40.1] - 2026-08-12

### Added

- Compact list badges and playback progress bars to title posters

### Changed

- Redesigned My Lists with a distinct color and icon for every account list and watch history
- Replaced the generic More poster with a list-specific card showing the list size and destination
- Reworked the single TV-friendly sorting control to show the current list, item count and active sort order

## [0.40.0] - 2026-08-12

### Added

- Regression coverage for dashboard request cancellation, refresh scheduling and responsive state indicators

### Changed

- Finalized the dashboard data lifecycle with chapter-level loading, ready, partial, cached, empty and offline states
- Staggered personal history, list and notification refreshes to reduce startup pressure on low-memory devices
- Cancelled pending dashboard requests and timers when leaving the screen
- Kept chapter state indicators compact on narrow layouts and motion-safe on reduced-motion devices

## [0.39.16] - 2026-08-12

### Added

- Chapter-specific focus contours to dashboard actions

### Changed

- Matched tile accents and navigation arrows to each section color
- Preserved the high-contrast light focus surface required for TV viewing

## [0.39.15] - 2026-08-12

### Changed

- Redesigned the dashboard section rail as a numbered chapter spine
- Expanded the active chapter into a color-coded capsule while keeping inactive chapters compact
- Preserved TV focus labels and added a matching service chapter accent

## [0.39.14] - 2026-08-12

### Added

- Compact color-coded chapter markers to every dashboard section

### Changed

- Structured the dashboard as five stable visual chapters
- Highlighted the current chapter without adding focusable controls or API work

## [0.39.13] - 2026-08-12

### Added

- A live section breadcrumb to the dashboard header

### Changed

- Synchronized header, active-panel and background accents with the focused dashboard group
- Kept the new context entirely local with no additional API requests

## [0.39.12] - 2026-08-12

### Changed

- Recolored the Catalog card-stack illustration to violet, coral, blue, and mint

### Removed

- The repeated white cards and avoided flag-like color associations

## [0.39.11] - 2026-08-12

### Added

- Lightweight section-aware dashboard atmosphere for clearer TV remote navigation context

### Changed

- Dashboard waves and color accents now follow Browse, Episode Flow, Library, Discover, and Service focus groups
- Kept the new visual transitions disabled in reduced-motion mode and covered the behavior with regression tests

## [0.39.10] - 2026-08-12

### Added

- A regression contract for Home lifecycle helper scope

### Changed

- Kept the section rail in the Home controller collection after lifecycle transitions

### Fixed

- The dashboard startup crash caused by the controller collection helper being scoped inside `create()`

## [0.39.9] - 2026-08-12

### Added

- A live library pulse summarizing resumable and tracked titles
- Focus-aware timeline nodes for Continue Watching, My Lists and Updates

### Changed

- Redesigned My Library as a connected activity stream rather than a plain card stack
- Reused existing personal snapshots without adding API traffic

## [0.39.8] - 2026-08-12

### Added

- A layered title portal, animated genre tags and a focused search beam
- Compact artwork scaling for narrow screens

### Changed

- Gave Catalog, Genres and Search distinct visual identities on the dashboard
- Improved the browse panel proportions while preserving all TV actions

## [0.39.7] - 2026-08-12

### Added

- A live service hub that reflects API, degraded, cached and unavailable states
- Responsive and reduced-motion behavior for the new service composition

### Changed

- Redesigned the dashboard service area as a connected profile-and-API constellation
- Kept account, notification and status actions fully focusable while reducing visual weight

## [0.39.6] - 2026-08-12

### Added

- Compact featured-release and featured-collection previews to the dashboard Discover block

### Changed

- Made both previews focusable and directly actionable from a TV remote
- Reused the existing dashboard feed snapshot without adding API requests
- Preserved responsive and low-memory behavior for preview artwork

## [0.39.5] - 2026-08-12

### Added

- Direct navigation from Japan broadcast and waiting stages to Schedule
- Direct navigation from the available translation stage to New Translations
- Focus styling and accessible labels for the flow actions

### Changed

- Made the episode-flow stages focusable from a TV remote

## [0.39.4] - 2026-08-12

### Added

- Direct jumps to the first action in each dashboard group
- An explicit rail focus state and included the rail in Lampa's focus collection

### Changed

- Made the dashboard section rail focusable and usable with a TV remote

## [0.39.3] - 2026-08-12

### Changed

- Used the last real card focus when a Lampa build places its focus class on another element
- Replaced fragile above-card detection with stable first-row geometry
- Passed the sorting button DOM node directly to Lampa's focus controller

### Fixed

- Up navigation from the first account-list card row to the sorting button

## [0.39.2] - 2026-08-12

### Added

- Clear focus, arrow and accessibility states while keeping the compact summary layout

### Changed

- Made the dashboard summary metrics focusable quick actions for a TV remote
- Linked broadcasts today, new translations and Continue Watching directly to their full sections
- Restored the corresponding main dashboard tile as the saved focus destination

## [0.39.1] - 2026-08-12

### Added

- A clear play affordance, progress state, focus styling and contextual header details

### Changed

- Turned the three dashboard Continue Watching previews into TV-focusable quick-resume actions
- Opened the saved episode and playback position directly while retaining the full Continue Watching section
- Reused the merged local and YummyAnime history snapshot without adding another API request

## [0.39.0] - 2026-08-12

### Added

- Local sorting to every YummyAnime account list: recently added, progress, rating, release year and title

### Changed

- Replaced a multi-button toolbar concept with one compact TV-friendly sorting panel
- Made the panel reachable with Up from the first card row and Down returns to the previously focused card
- Kept the selected mode separately for each user list and applied it without another API request
- Preserved pagination after sorting and added Russian, English and Ukrainian labels

## [0.38.2] - 2026-08-12

### Changed

- Cached successful YummyAnime-to-TMDB card matches for 30 days
- Cached unresolved titles briefly to prevent repeated request storms while retaining automatic retries
- Deduplicated concurrent native-card lookups triggered by repeated TV input or Lampa events
- Limited the persistent native-card cache and rejected invalid cached TMDB identifiers

## [0.38.1] - 2026-08-12

### Changed

- Grouped notifications into Today, Yesterday and Earlier sections
- Displayed navigation arrows only for notifications that can really open an anime title
- Kept informational and system notifications focusable for scrolling without implying a broken link
- Preserved date grouping while loading additional notification pages

## [0.38.0] - 2026-08-12

### Added

- A compact notification summary and grouped bulk actions in a dedicated toolbar

### Changed

- Rebuilt notifications as clear TV-friendly cards with type icons, hierarchy and unread state
- Correctly converted YummyAnime `title_html` and `text_html` fields into readable plain text
- Opened new-episode notifications through their catalog slug instead of treating `object_id` as an anime id
- Improved pagination, empty states, focus restoration and read-state feedback

## [0.37.9] - 2026-08-12

### Added

- A five-minute per-account playback snapshot to keep repeated dashboard visits fast

### Changed

- Merged local and YummyAnime server progress in the dashboard Continue Watching summary
- Updated the count, current title and visual preview after the lightweight background refresh
- Deduplicated local and remote records and excluded completed or dropped titles
- Reused fresh list exclusions instead of downloading the user library on every visit

## [0.37.8] - 2026-08-12

### Changed

- Distinguished real zero counts from unavailable dashboard data
- Displayed an em dash and a subdued dashed metric when its API source is unavailable
- Preserved valid zero values when the API successfully returns an empty schedule or feed
- Continued to display cached metrics during partial and complete outages

## [0.37.7] - 2026-08-12

### Changed

- Widened the dashboard summary area so all three metrics remain understandable on TV screens
- Allowed metric labels to wrap to two lines instead of truncating important words
- Rebalanced the contextual header and summary widths at desktop and medium breakpoints
- Preserved the compact icon-and-count layout on narrow screens

## [0.37.6] - 2026-08-12

### Added

- Matching Russian, English and Ukrainian labels

### Changed

- Renamed the ambiguous Today dashboard metric to Broadcasts today
- Clarified that the number represents scheduled Japanese anime broadcasts

## [0.37.5] - 2026-08-12

### Added

- A smart initial dashboard focus based on the existing priority signal
- Fallbacks for hidden or disabled dashboard sections

### Changed

- Preferred continue watching, unread notifications, fresh translations or recommendations on a fresh visit
- Preserved the user's last valid dashboard position ahead of the automatic choice
- Kept asynchronous data refreshes from moving focus after the dashboard is already active

## [0.37.4] - 2026-08-12

### Added

- The nearest broadcast time and title to the daily schedule metric
- The latest title and dubbing to the translation metric
- The current title, episode and progress to the continue-watching metric

### Changed

- Enriched the existing dashboard summary instead of adding duplicate navigation blocks
- Kept the summary non-focusable and hid secondary text on narrow screens

## [0.37.3] - 2026-08-12

### Added

- A regression contract for callback visibility from the Lampa controller `start()` handler

### Changed

- Kept contextual-header and broadcast-countdown callbacks in the full Home component lifecycle
- Cleared retained dashboard callbacks and release data when Home is destroyed

### Fixed

- The dashboard crash after returning from Collections and other child screens

## [0.37.2] - 2026-08-11

### Added

- A localized countdown to the nearest Japanese broadcast in the episode-flow header

### Changed

- Switched the indicator to an aired state when the cached or live release time has passed
- Recalculated the countdown whenever focus returns to the dashboard without a permanent timer
- Reused the existing schedule payload and dashboard snapshot without extra API requests

## [0.37.1] - 2026-08-11

### Added

- A non-focusable curved section rail for orientation on the long dashboard

### Changed

- Highlighted browse, episode flow, library, discovery and service as focus moves
- Restored the correct rail position together with the last dashboard focus
- Hid the rail on narrow screens and removed its transitions in reduced-motion mode

## [0.37.0] - 2026-08-11

### Added

- Focused-section titles, live preview metadata, poster backdrops and group color accents

### Changed

- Turned the dashboard header into a contextual view of the currently focused section
- Updated the header when asynchronous dashboard insights arrive while a tile remains focused
- Disabled contextual artwork on narrow, reduced-motion, low-memory and low-CPU devices

## [0.36.9] - 2026-08-11

### Added

- Current release and featured collection previews to the dashboard discovery panel
- Feed-derived titles, metadata, collection size and poster artwork without extra requests

### Changed

- Preserved discovery previews in the resilient dashboard snapshot during API outages
- Kept artwork disabled on reduced-motion, low-memory and low-CPU devices

## [0.36.8] - 2026-08-11

### Added

- A resilient 24-hour local snapshot for dashboard schedule and feed insights
- Clear live, partial, cached and offline freshness indicators to the dashboard header

### Changed

- Preserved cached schedule or translation data when only one YummyAnime endpoint responds
- Prevented stale counters, previews and artwork from surviving a successful empty refresh

## [0.36.7] - 2026-08-11

### Added

- An at-a-glance dashboard summary for today's releases, new translations and unfinished viewing

### Changed

- Reused existing schedule, feed and local-history data without adding network requests
- Hid summary metrics for dashboard sections disabled in settings
- Kept the summary non-focusable and compact on narrow screens

## [0.36.6] - 2026-08-11

### Added

- A compact three-title continue-watching preview to the personal dashboard panel
- Coverage for preview ordering, progress bounds, empty history and focus persistence

### Changed

- Restored the last focused dashboard tile and its visible scroll position after returning from a section
- Kept the preview non-focusable and disabled its poster artwork on constrained devices

## [0.36.5] - 2026-08-11

### Added

- Poster artwork to the active schedule, translation and continue-watching dashboard tiles
- A deterministic personal priority accent for resume, notifications, fresh translations and recommendations

### Changed

- Disabled dashboard artwork on reduced-motion, low-memory and low-CPU devices
- Reused existing schedule, feed and local-history payloads without adding API data requests

## [0.36.4] - 2026-08-11

### Added

- Cached unread-notification counts to the dashboard for signed-in users
- Live operational, degraded and unavailable states to the YummyAnime status tile

### Changed

- Reused feed and schedule requests for health signals instead of adding another API request
- Kept service indicators non-focusable and resilient to partial endpoint failures

## [0.36.3] - 2026-08-11

### Added

- A compact three-stage episode flow from Japanese broadcast through translation wait to an available dub
- Localized fallback states and a reduced-motion-safe visual timeline without adding TV focus stops

### Changed

- Matched recent broadcasts against translation feed events by YummyAnime title and episode identifiers

## [0.36.2] - 2026-08-11

### Added

- Local continue-watching counts and the latest resumable title to the dashboard
- Cached personal-list and tracked-title counters without loading the full user library
- The signed-in YummyAnime user name to the account dashboard tile

### Changed

- Kept the last successful personal statistics visible when the YummyAnime API is unavailable

## [0.36.1] - 2026-08-11

### Added

- Live dashboard previews for the nearest scheduled broadcast and latest available translation
- Today's schedule count alongside the existing feed counters

### Changed

- Kept dashboard rendering resilient when either the schedule or feed API is unavailable

## [0.36.0] - 2026-08-11

### Added

- A visual dashboard header, responsive panel hierarchy and active-panel focus feedback for TV remotes

### Changed

- Rebuilt the YummyAnime dashboard into clear browse, episode-flow, personal, discovery and service zones
- Combined the Japanese schedule and new translation entry points in one prominent release panel while preserving the full schedule screen
- Restored a deterministic first focus target and added mouse/touch activation to every dashboard tile

## [0.35.2] - 2026-08-11

### Changed

- Extracted trailer loading, rendering and TV navigation into a dedicated UI module
- Preserved external YouTube routing, offline icons and restorable selection dialogs
- Reduced the main UI monolith without changing detail-page trailer behavior

## [0.35.1] - 2026-08-11

### Changed

- Extracted catalog sorting, filtering and TV remote navigation into a dedicated UI module
- Preserved catalog API loading and pagination behavior while reducing the main UI monolith

## [0.35.0] - 2026-08-11

### Added

- TV-friendly catalog filters for anime type, release status and release period
- A compact active-filter counter to the existing catalog toolbar

### Changed

- Kept filter definitions and query transformations in a separate testable module

## [0.34.9] - 2026-08-11

### Changed

- Extracted YummyAnime search integration from the main UI module
- Debounced global Lampa search requests by 400 ms and ignored stale responses
- Ranked results against all known title aliases and added a bounded short-lived search cache
- Preserved dashboard focus when the search input is cancelled

## [0.34.8] - 2026-08-11

### Added

- Compact live counts to New Translations, New Releases and Collections dashboard tiles

### Changed

- Derive every count from the existing cached `/feed` request without blocking dashboard rendering
- Count unique anime and collections instead of raw duplicate feed events
- Keep the dashboard silent and fully interactive when feed insights are unavailable

## [0.34.7] - 2026-08-11

### Changed

- Deduplicate New Translations so each anime appears only once with its latest feed event
- Sort translation cards by event time and show episode, dubbing and player on the newest entry
- Display a compact additional-update count when the feed contains multiple events for one title
- Move translation feed logic out of the main UI module and add a localized empty state

## [0.34.6] - 2026-08-11

### Added

- Lightweight organic decoration without introducing image or animation overhead on low-power devices

### Changed

- Group New Releases, Top Rated, For You and Collections into one wide Discover block on the dashboard
- Keep every destination independently focusable by TV remote and independently configurable in settings
- Use a compact four-column layout on large screens and a two-column layout on narrow devices

## [0.34.5] - 2026-08-11

### Changed

- Rebuild Updates around Watching, Planned, Postponed and subscribed titles only
- Combine user lists, subscriptions, schedule and `/feed` `new_videos` into one latest-change timeline
- Exclude Completed and Dropped titles and keep only the newest video event per anime
- Show episode, dubbing and source details while reusing the cached account-list snapshot

## [0.34.4] - 2026-08-11

### Changed

- Personalize For You with both local playback and authorized YummyAnime watch history
- Deduplicate source titles and recommendations while limiting recommendation fan-out for low-power TV devices
- Explain recommendations with compact “Because you watched” poster badges
- Fall back to the official global top only when no personalized recommendations are available

## [0.34.3] - 2026-08-11

### Added

- A dedicated New Releases dashboard section backed by the official `/feed` `new` payload
- Release status/type badges, localized empty and error states, and a dedicated dashboard icon

### Changed

- Keep new anime separate from Japanese broadcasts and newly published translations or dubs
- Open release cards directly in YummyAnime details and preserve the established My Lists dashboard position

## [0.34.2] - 2026-08-11

### Added

- TV-focusable Overall, TV series, Movies and ONA categories
- Distinct category icons and Russian, English and Ukrainian labels

### Changed

- Turn the Best dashboard tile into a dedicated YummyAnime Top screen
- Keep each category lazily paginated and ranked through the official `/anime` top sorting parameters

## [0.34.1] - 2026-08-11

### Added

- A TV-focusable Collections tile to the YummyAnime dashboard while keeping Search as item 3
- Dedicated, lazily paginated collection pages whose anime cards open directly in YummyAnime details

### Changed

- Load initial collection previews from `/feed` and lazily extend the catalog through `/collection`
- Show compact poster mosaics, anime counts, views and likes on collection cards when available

## [0.34.0] - 2026-08-11

### Added

- A New Translations screen backed by the YummyAnime `/feed` `new_videos` data

### Changed

- Keep Search as dashboard item 3 and preserve the existing Schedule screen
- Visually pair Schedule and New Translations in a wide TV-focusable episode-flow block
- Show episode, dubbing and player information on new-translation cards when available

## [0.33.15] - 2026-08-11

### Added

- The existing Notifications screen as dashboard item 10 for signed-in users

### Changed

- Move My Lists to position 6 on the YummyAnime dashboard
- Place Account at position 11 and Status at position 12

## [0.33.14] - 2026-08-11

### Changed

- Replace the generic dashboard glow with layered curved YummyAnime wave artwork
- Animate wave drawing and small ambient pulses when the dashboard opens
- Give dashboard tiles a softer asymmetric shape and organic focus response
- Keep all decorative motion disabled on reduced-motion and low-power devices

## [0.33.13] - 2026-08-11

### Added

- Staggered tile entrance animations and subtle dashboard ambient highlights
- Focus shine, icon movement and smoother arrow feedback to YummyAnime Home

### Changed

- Disable dashboard motion on reduced-motion, low-memory and two-core devices

## [0.33.12] - 2026-08-11

### Added

- A focusable personal-rating action to the YummyAnime title page

### Changed

- Allow signed-in users to set a score from 1 to 10 or remove the current score
- Update the displayed personal score immediately after a successful API request

## [0.33.11] - 2026-08-11

### Added

- A contract check that prevents duplicate sorting SVG paths

### Changed

- Give every catalog sorting action a distinct icon
- Replace the duplicated popularity star with a trophy icon

## [0.33.10] - 2026-08-11

### Changed

- Show the YummyAnime media type as a compact badge on catalog cards
- Show the full media type separately from the title on the detail page
- Support series, films, short films, OVA, ONA, specials and music videos without modifying title text

## [0.33.9] - 2026-08-11

### Changed

- Remember the exact catalog card used to enter the sorting toolbar
- Return focus from the toolbar to that card with the TV remote left button
- Track toolbar focus independently of Lampa's inconsistent legacy CSS focus marker

## [0.33.8] - 2026-08-11

### Added

- Asynchronously loaded recommendations and comments to the active Lampa detail navigation collection

### Changed

- Restore TV-remote focus for detail sections regardless of whether the title was opened from Schedule, Top Rated, For You, Updates, or Continue Watching
- Route startup token maintenance through the automatic refresh cooldown

## [0.33.7] - 2026-08-10

### Changed

- Automatically refresh an authorized user's Bearer token every 48 hours as recommended by the YummyAnime API
- Deduplicate parallel refresh attempts before authenticated API requests
- Preserve the current token after transient refresh failures and retry after a 3-hour cooldown

## [0.33.6] - 2026-08-10

### Changed

- Install the catalog toolbar controller on Lampa's legacy `InteractionCategory` implementation
- Allow right-edge cards in every visible catalog row to enter the side toolbar with a TV remote
- Keep toolbar selectors attached after the legacy category rebuilds its limited navigation collection

## [0.33.5] - 2026-08-10

### Changed

- Initialize pagination when opening a full account list from the `More` card
- Restore lazy rendering after the first 30 titles in `My Lists`
- Keep the account-list pager compatible with both Lampa pagination method spellings

## [0.33.4] - 2026-08-10

### Changed

- Preserve Lampa's active catalog card when the category refreshes its navigation collection after vertical scrolling
- Append toolbar controls to the native category collection without resetting Navigator focus
- Restore toolbar entry from right-edge cards below the first catalog row

## [0.33.3] - 2026-08-10

### Changed

- When the embedded Alloha player is disabled, list direct and resolvable playback sources before iframe-only choices
- Prioritize Kodik and other supported stream resolvers while retaining unavailable Alloha variants at the bottom
- Apply the same capability-first ordering to both dubbing and episode selections

## [0.33.2] - 2026-08-10

### Changed

- Enter the catalog toolbar from the rightmost visible card of every grid row, including rows reached after vertical scrolling
- Ignore cards mostly hidden underneath the fixed toolbar when determining the visible right edge
- Focus the toolbar action nearest to the originating card instead of always jumping to the first action

## [0.33.1] - 2026-08-10

### Added

- A regression contract preventing legacy screens from returning to the release bundle

### Removed

- Ten unreferenced legacy screen implementations left behind after component extraction
- Obsolete status and schedule formatting helpers from the main UI bundle

## [0.33.0] - 2026-08-10

### Added

- A focusable Return to Lampa control to the legacy embedded player

### Changed

- Put catalog cards and the fixed sorting toolbar into one television navigation collection so a standard remote can enter the toolbar from the right edge
- Preserve focus after authentication, status-period and notification-list re-renders

## [0.32.3] - 2026-08-10

### Changed

- Make the television catalog side toolbar reachable with a standard directional remote from the rightmost visible card of every row
- Return from the toolbar to the exact card that was focused before entering it

## [0.32.2] - 2026-08-10

### Changed

- Keep the focused recommendation card inside its horizontal viewport while navigating both right and left with a television remote

## [0.32.1] - 2026-08-10

### Changed

- Open viewing-order entries directly in YummyAnime detail without showing a misleading failed-Lampa-card fallback notification

## [0.32.0] - 2026-08-10

### Changed

- Replace the television catalog header with a compact fixed right-side toolbar containing sorting actions and Back to top
- Enter the toolbar by pressing Right at the edge of any catalog row and return to the last focused card with Left
- Show icon labels only while focused on television screens, while retaining the horizontal toolbar on narrow touch screens

## [0.31.1] - 2026-08-10

### Changed

- Restore the title-detail controller and focused comment after closing an inline replies dialog
- Preserve the original card navigation context across comments, nested replies and paginated comment lists
- Reopen a parent comments list after its child dialog has fully closed to avoid a frozen Select controller

## [0.31.0] - 2026-08-10

### Added

- A compact fixed catalog toolbar with server-side sorting by popularity, year, rating, rating count, views, title and random order
- Remote-friendly navigation between the sorting toolbar, catalog cards and a floating Back to top control

### Changed

- Preserve active search, genre and filter parameters when changing catalog sorting

## [0.30.5] - 2026-08-10

### Changed

- Ignore temporary SSH known-hosts files, the smoke-test bundle and the removed duplicate detail-sections module

## [0.30.4] - 2026-08-10

### Removed

- An accidentally committed temporary SSH known-hosts file
- The public smoke-test plugin from the release directory
- An unused duplicate detail-sections module from source and the legacy loader

## [0.30.3] - 2026-08-10

### Changed

- Restore the originating controller, collection and focused item after closing temporary YummyAnime lists
- Apply the same return handling to genres, actions, reviews, collections, trailers and comments
- Restore the correct screen after cancelling text input from Home, account and settings screens

## [0.30.2] - 2026-08-10

### Changed

- Open preview titles from My Lists directly in the YummyAnime detail screen
- Prevent successful empty TMDB movie/TV searches from launching a duplicate aggregate lookup
- Give six alternative titles a bounded lookup window while retaining aggregate fallback for actual TMDB client failures

## [0.30.1] - 2026-08-10

### Changed

- Restore poster images in the My Lists watch-history row when local history stores the poster as a plain URL
- Support `large`, `huge` and `url` poster variants returned by YummyAnime history responses
- Merge the server watch-history metadata into local entries and recover missing legacy posters from list or detail data in small batches

## [0.30.0] - 2026-08-10

### Changed

- Restore the YummyAnime Home content controller after cancelling the search input
- Preserve the last focused Home tile so remote, mouse and touch navigation continue working after return

## [0.29.14] - 2026-08-10

### Added

- A final More card to every row which opens the complete list or watch history

### Changed

- Redesign My Lists as native Lampa-style horizontal rows instead of a shortcut grid
- Show up to 10 most recently added titles per account list and the 10 latest locally watched titles
- Keep list counts in row headings and load all previews from one cached YummyAnime list snapshot

## [0.29.13] - 2026-08-10

### Changed

- Open a selected account-list screen immediately and load its titles inside the destination Activity
- Reuse one five-minute user-list snapshot for shortcut counters and list contents instead of downloading the same large payload twice
- Keep cached list contents available when the YummyAnime API is temporarily unavailable

## [0.29.12] - 2026-08-10

### Changed

- Prevent duplicate enter/click events from opening the same user list twice
- Render large account lists in pages of 30 cards instead of constructing every card at once
- Reset the list-navigation lock when returning to Your Lists

## [0.29.11] - 2026-08-10

### Added

- Matching status icons to every Your Lists shortcut

### Changed

- Show the number of titles in each YummyAnime list without issuing a separate request per status
- Show the available local/server watch-history count and keep temporary API failures non-blocking

## [0.29.10] - 2026-08-10

### Added

- A regression contract that prevents modular components from silently returning `undefined`

### Fixed

- The Your Lists Activity factory so it returns a valid Lampa component with `create`, `start`, `render` and `destroy` methods

## [0.29.9] - 2026-08-10

### Changed

- Flush the final internal-player position locally and to YummyAnime when playback closes
- Update the already rendered Continue Watching card immediately after a progress change
- Keep the active card resume metadata synchronized with local playback storage
- Treat 75% playback as completed when no explicit completion state is available

## [0.29.8] - 2026-08-10

### Changed

- Build Continue Watching from merged local Lampa progress and YummyAnime server watch history
- Exclude titles currently placed in the user's Completed or Dropped YummyAnime lists
- Cache the exclusion set so the filter remains available during temporary API failures

## [0.29.7] - 2026-08-10

### Changed

- Separate Continue Watching from the complete YummyAnime watch history
- Keep only the latest unfinished episode for each title and hide completed episodes using duration-aware thresholds
- Persist local episode duration, dubbing and source information so resume cards remain useful after restarting Lampa
- Support nested screenshot URLs from the YummyAnime watch-history response

## [0.29.6] - 2026-08-10

### Changed

- Load every selected list, including Favorites, from its dedicated YummyAnime endpoint and use the complete list only as a network fallback
- Cache the resolved user ID and the six account lists, with stale list data available when both API requests fail
- Normalize direct and nested list response shapes before rendering cards

### Fixed

- Your Lists so a valid empty list no longer triggers a failing second request

## [0.29.5] - 2026-08-10

### Added

- A compact, focusable episode-information row to YummyAnime title details

### Changed

- Show explicit season count when available, total and aired episodes, watched episodes and average unique-episode duration
- Enrich ordinary titles in the background while deferring large video lists until focus to protect low-memory devices

## [0.29.4] - 2026-08-10

### Changed

- Load the authorized user's server-side viewing history and progress from YummyAnime
- Merge server records with local Lampa progress, deduplicate matching videos and keep local history available offline or without authorization
- Load long server histories page by page and resume the exact saved video, episode and position

## [0.29.3] - 2026-08-10

### Added

- Watch History to the Your Lists shortcut screen and reuse the existing Continue Watching component

## [0.29.2] - 2026-08-10

### Changed

- Replace the eager Your Lists API dashboard with a reliable shortcut menu for Watching, Planned, Completed, Dropped, Postponed and Favorites
- Load only the selected account list and fall back to filtering the complete account list when a dedicated endpoint is unavailable

## [0.29.1] - 2026-08-10

### Changed

- Preserve the title-detail controller and focused action throughout the playback selection chain
- Restore title interaction after cancelling source, dubbing, episode or playback-target selection and after returning from internal and external players or YummyTV
- Avoid capturing the temporary Select controller as the external-player return target

## [0.29.0] - 2026-08-09

### Added

- An authorized-only Your Lists section to the YummyAnime home screen

### Changed

- Show Watching, Planned, Completed, Dropped, On hold and Favorites with title counts and watched time
- Open each category through the existing account-list catalog and add a visibility switch for the new section
- Localize the new section in Russian, English and Ukrainian

## [0.28.0] - 2026-08-09

### Added

- Opt-out automatic viewing-progress synchronization for authorized YummyAnime users

### Changed

- Track the internal Lampa player's real position locally every ten seconds and synchronize it to YummyAnime at a bounded interval and on pause or completion
- Keep manual account-page synchronization available when automatic synchronization is disabled
- Clarify that external Android players cannot report their playback position back to Lampa

## [0.27.2] - 2026-08-09

### Changed

- Give a captured Alloha master an assumed lifetime, so the session is refreshed ahead of time even when the player never states one; a 12-minute test showed playback stalling after roughly eight minutes without it
- Stop a request from blocking on a full session refresh for longer than a client will wait, and let that refresh finish in the background

## [0.27.1] - 2026-08-09

### Added

- A test asserting that every key the UI asks for is translated and that all locales cover the Russian reference

### Changed

- Translate the detail-loading error, which used to render its own key name to the user

## [0.27.0] - 2026-08-09

### Changed

- Capture the Alloha session from the browser driver rather than from injected page code, so it is in place before the player issues its first request; this is what makes the resolver actually return a stream
- Offer the full Alloha quality ladder and default to the best rung instead of whatever the offscreen player settled on
- Keep the player's WebSocket alive from an init script so the session token keeps rotating

## [0.26.0] - 2026-08-09

### Added

- An opt-in automatic switch to the next episode at the end of the current one

### Changed

- Resolve the next episode's stream a minute and a half before it is needed, so the switch is not spent waiting on the source's player page
- Keep an automatic switch inside the running player instead of asking again where to play

## [0.25.0] - 2026-08-09

### Added

- A disabled-by-default setting choosing between openings only and openings with endings

### Changed

- Skip openings and endings in the internal player using AniSkip timestamps, resolved from the MyAnimeList id YummyAnime already reports

## [0.24.0] - 2026-08-09

### Changed

- Pass the season, episode and dubbing stated in the YummyAnime player URL into the Lampac Alloha request and its season/episode selection
- Ask Lampac to match by title whenever the title has no IMDb or Kinopoisk id, which is the common case for anime

## [0.23.0] - 2026-08-09

### Added

- A self-hosted resolver service in `server/` that opens a live Alloha session in a headless browser and proxies its HLS stream with the rotating headers the CDN requires
- A resolver client and settings entry, and try the resolver before Lampac when both are configured

### Changed

- Treat every resolved Alloha source as direct, whichever service produced it
- Run the whole test suite in CI instead of a single test file

## [0.22.0] - 2026-08-09

### Changed

- Allow unresolved Alloha sources to fall back to the original embedded site player behind a new opt-in setting
- Keep the embed disabled by default and keep the explicit warning when it is off, because it offers no Lampa timeline and no external player
- Record playback history when the embedded Alloha player actually opens

## [0.21.0] - 2026-08-09

### Changed

- Reduce poster memory pressure by removing duplicate hidden image decoding and preferring medium-size artwork
- Limit and deduplicate fallback-poster, YummyAnime and TMDB requests to avoid network bursts on low-memory devices
- Stop treating every native Lampa title without genre metadata as anime
- Inline and restore the YummyAnime logo on the native Lampa title-card button

### Removed

- An unused duplicate detail-sections module from the production bundle

## [0.20.23] - 2026-08-09

### Added

- An optional settings action for entering or clearing a custom public `X-Application` key

### Changed

- Keep the YummyAnime for Lampa public application key as the default API identity
- Use the selected public application key for login, token refresh, logout and all API requests while keeping the user Bearer token separate
- Do not create developer applications automatically

## [0.20.22] - 2026-08-09

### Changed

- Stop showing the usage policy automatically
- Keep the policy available as an explicit action in YummyAnime settings
- Explain that installing and enabling the extension constitutes agreement with the stated rules

## [0.20.21] - 2026-08-09

### Added

- A localized usage-policy window shown once on first launch
- A settings action for reopening the policy at any time

### Changed

- State that the extension is provided as is, is intended for informational purposes and must not be used for illegal activity

## [0.20.20] - 2026-08-09

### Changed

- Restore an open YummyAnime title after Lampa clears its plugin cache or reloads extensions
- Persist the YummyAnime title id outside the transient card object and recover legacy saved activities from their detail URL
- Return to YummyAnime Home instead of leaving a broken partial card when a restored activity can no longer be loaded

## [0.20.19] - 2026-08-09

### Changed

- Block unresolved Alloha sources from both internal and external media players
- Allow Alloha playback only after a configured Lampac server returns a direct stream
- Replace the iframe fallback with an explicit localized warning and avoid recording blocked attempts as watched

## [0.20.18] - 2026-08-09

### Changed

- Force the built-in Lampa engine with `Lampa.Player.runas('lampa')` when internal playback is selected
- Preserve online-stream, quality, header and poster metadata in the internal player playlist
- Stop silently falling back to an external Android player when internal playback cannot start

## [0.20.17] - 2026-08-09

### Changed

- Merge player and YummyTV actions into one "Watch" button on the YummyAnime title card
- Show the destination picker only when the optional YummyTV integration is enabled and a title ID is available

## [0.20.16] - 2026-08-09

### Changed

- Rename the title-card playback actions to "Watch in player" and "Watch in YummyTV"
- Keep the YummyTV action hidden unless its optional integration is enabled in settings

## [0.20.15] - 2026-08-09

### Added

- An optional self-hosted Lampac adapter for `/lite/alloha` and direct `/lite/alloha/video.m3u8` playback

### Changed

- Open unresolved Alloha sources in the official visible player instead of trying to send iframe URLs to a media player
- Keep direct HLS/DASH/MP4/WebM playback selectable between Lampa and external Android players
- Make the private YummyTV application integration disabled by default and configurable in settings
- Replace the YummyTV episode metadata dependency with Jikan episode data

## [0.20.14] - 2026-08-09

### Added

- A playback target setting and direct-stream picker for choosing between an external Android player and Lampa's internal player

## [0.20.13] - 2026-08-09

### Changed

- Restore Lampa controller focus after returning from external players, browsers, YouTube, or YummyTV deep links

## [0.20.12] - 2026-08-09

### Changed

- Replace unsupported-player fallback with a two-action playback picker: watch in player or watch in YummyTV when the app is installed

## [0.20.11] - 2026-08-09

### Changed

- Shorten Alloha playback handling by opening unsupported Alloha iframe players through Android's external browser bridge instead of first sending them through video-player resolution

## [0.20.10] - 2026-08-09

### Changed

- Reduce trailer navigation by opening a compact trailer picker over the detail card, and open the trailer directly when only one trailer is available

## [0.20.9] - 2026-08-09

### Changed

- Route YouTube trailer intents through the native Android browser bridge before Lampa external media handlers, so trailers open in YouTube or a browser instead of Kodi-like players

## [0.20.8] - 2026-08-09

### Changed

- Launch YummyTV deep links through Lampa's native Android bridge
- Prevent custom `yummytv://` links from opening inside Lampa's WebView

## [0.20.7] - 2026-08-09

### Added

- An Open in YummyTV action using the native `yummytv://details/{animeId}` deep link

### Changed

- Offer YummyTV when a selected source cannot be converted to a direct external-player stream

## [0.20.6] - 2026-08-09

### Added

- VK playback by resolving active embeds to direct MP4 or HLS streams with quality selection

### Changed

- Reject unavailable or deleted VK videos before opening an external player

## [0.20.5] - 2026-08-09

### Added

- Rutube HLS playback with master-playlist quality discovery

### Changed

- Forwarded resolved quality maps to Android players instead of keeping them only in the YummyAnime UI

## [0.20.4] - 2026-08-09

### Added

- Sibnet playback by resolving its player page to a direct MP4 stream

### Changed

- Forwarded source-specific HTTP headers to supported Android external players

## [0.20.3] - 2026-08-09

### Added

- Aksor player resolution and external DASH (`.mpd`) playback support

### Changed

- Show video quality, source host and episode count as a compact subtitle under each dubbing option
- Detect quality information embedded in player URLs

## [0.20.2] - 2026-08-08

### Changed

- Always open dubbing/source and episode selection from the detail-card Watch action
- Keep automatic episode resume exclusive to the dedicated Continue Watching section

## [0.20.1] - 2026-08-08

### Added

- CVH iframe resolution with direct signed MP4 qualities up to 1080p

### Changed

- Resolve player pages through Lampa's native Android request bridge to avoid WebView CORS failures
- Accept extensionless signed media URLs only after a trusted stream resolver has produced them

## [0.20.0] - 2026-08-08

### Changed

- Resolve Kodik iframe/player URLs into direct HLS streams before handing playback to an external Android player
- Keep non-direct unsupported player pages blocked from external playback instead of passing iframe URLs as media files

## [0.19.20] - 2026-08-08

### Changed

- Send episode playback to external players only when the selected source exposes a direct media stream URL
- Use Lampa's Android player bridge before raw Android bridge fallbacks and avoid sending iframe/player pages to VLC/MX-style players

## [0.19.19] - 2026-08-08

### Changed

- Route YummyAnime episode playback to external Android/Lampa player handlers instead of iframe or in-app browser pages
- Pass episode playlist, resume time and poster metadata to the external player handoff

## [0.19.18] - 2026-08-08

### Changed

- Open trailers through a dedicated YummyAnime trailer list with visible YouTube icons
- Route trailer playback to external Android/Lampa handlers instead of the internal iframe player

## [0.19.17] - 2026-08-08

### Changed

- Render the native-card YummyAnime action with a standalone logo image
- Show that action only for cards identified as animation/anime and with a high-confidence YummyAnime title match

## [0.19.16] - 2026-08-08

### Changed

- Render the YummyAnime mark in the native Lampa-card action with an embedded SVG fallback that is independent of Lampa's button typography

## [0.19.15] - 2026-08-08

### Fixed

- Schedule rendering: preserve release metadata while grouping items by day, preventing the page from failing during time sorting

## [0.18.17] - 2026-08-08

### Added

- The Lampa logo to the action that opens a title in the Lampa application

### Changed

- Open recommended titles directly in YummyAnime instead of showing a transient native Lampa-card lookup failure

## [0.18.16] - 2026-08-08

### Changed

- On an unresolved title with a MyAnimeList ID, retry TMDB matching using its English, Japanese and synonym titles

### Fixed

- TMDB resolution when the proxy-aware Lampa source exposes `get` but not `search`

## [0.18.15] - 2026-08-08

### Changed

- Prefer the TMDB source used by Lampa online plugins and Cub TMDB Proxy when resolving YummyAnime titles; retain the modern Lampa TMDB API as fallback

## [0.18.14] - 2026-08-08

### Added

- Concise console diagnostics for native Lampa TMDB resolution, so a failed proxy lookup and a failed card transition are distinguishable

### Removed

- The redundant More information action from the title page

## [0.18.13] - 2026-08-08

### Changed

- Place title actions directly after the synopsis and add a Trailers action that opens its list on demand
- Keep every focused detail selector visible while moving both down and up the page
- Resolve native Lampa cards through direct TV and movie TMDB searches before using Lampa's aggregate search fallback

### Removed

- The permanent trailers section from the title page

## [0.18.12] - 2026-08-08

### Changed

- Use the complete YummyAnime detail aliases, including `other_titles`, before resolving a title through Lampa's native TMDB search
- Keep the original catalog title as a fallback if the YummyAnime detail request is temporarily unavailable

## [0.18.11] - 2026-08-08

### Added

- `YummyAnime` as the YummyAnime extension author in Lampa metadata

## [0.18.10] - 2026-08-08

### Changed

- Reworked YummyAnime-to-TMDB matching to use `Lampa.TMDB.search`, the same resolver as Lampa's own search screen, before opening the shared card and its standard player sources

## [0.18.9] - 2026-08-08

### Added

- YummyAnime as a source in Lampa's global search, with opening through the known YummyAnime title id

### Changed

- Protected Alloha sources now open the official YummyAnime title page in Lampa Browser; this preserves the required referrer and signed-player session instead of failing in a raw iframe

## [0.18.8] - 2026-08-08

### Changed

- Restored safe YummyAnime-to-Lampa card matching through the current `Lampa.TMDB` API; all known title variants are checked and native detail is opened only with a valid TMDB id
- Fall back to the YummyAnime detail page if no reliable TMDB match is available, rather than requesting `movie/undefined`

## [0.18.7] - 2026-08-08

### Changed

- Restored immediate loading of trailers, recommendations and comments on title details; community statistics and collections remain optional

## [0.18.6] - 2026-08-08

### Changed

- Enabled the native Lampa scroll viewport on every custom YummyAnime page, so focus movement scrolls the visible area instead of escaping below it

## [0.18.5] - 2026-08-07

### Changed

- Kept the focused item visible on every YummyAnime page by scrolling to each selector root instead of an inner text or icon node

## [0.18.4] - 2026-08-07

### Added

- A final activity-level guard that redirects YummyAnime cards with a missing TMDB ID to the YummyAnime detail page before Lampa requests `movie/undefined`

## [0.18.3] - 2026-08-07

### Changed

- Prevented YummyAnime card clicks from also invoking Lampa's native TMDB handler with an undefined ID
- Open schedule items in the stable YummyAnime detail page; native Lampa search remains an explicit action
- Deferred optional detail sections until the user requests them, reducing memory and network pressure on Android devices

## [0.18.2] - 2026-08-07

### Changed

- Prevent opening a TMDB detail page when the matched card has no TMDB ID

## [0.18.1] - 2026-08-07

### Changed

- Restored the proven local detail-section renderer to fix card opening

## [0.18.0] - 2026-08-07

### Added

- A detail-page timeout guard to prevent infinite loading

### Changed

- Continued splitting UI pages into independent components

## [0.17.0] - 2026-08-07

### Added

- Collections, personalized updates, watch synchronization and account reviews

### Changed

- Unified the plugin version source in `src/config.js`

## [0.16.1] - 2026-08-07

### Changed

- Standard Lampa card matching now tries alternate YummyAnime titles one by one;
- Matching still validates title similarity and release year before opening the shared card

## [0.16.0] - 2026-08-07

### Changed

- Redesigned the YummyAnime home screen with responsive SVG icons, color accents, depth, arrows and clearer focus styling

## [0.15.2] - 2026-08-07

### Added

- An 8-second timeout for standard Lampa card matching;

### Changed

- Fall back to the YummyAnime detail page instead of leaving an endless loader

## [0.15.1] - 2026-08-07

### Changed

- Action settings to button rows without `Да/Нет` or `undefined` values;
- Moved home-section switches into a visually separated section at the bottom of settings

## [0.15.0] - 2026-08-07

### Added

- Rating-service logos for card and detail rating badges;
- AniList and Shikimori poster fallbacks after the primary/Jikan sources;

### Changed

- Synchronized the README, bilingual documentation and installation URL with the current release

## [0.14.9] - 2026-08-07

### Added

- Configurable visibility switches for YummyAnime home sections

### Changed

- Restored card focus, opening and action menus across supported Lampa card render signatures;

## [0.14.8] - 2026-08-07

### Added

- Home section visibility switches;
- Alternative-title search and poster fallback improvements

## [0.12.1] - 2026-08-06

### Changed

- Failed pagination requests now retry the same offset instead of skipping a page;
- Prevented duplicate requests for an offset already loaded by Lampa

### Fixed

- Premature catalog completion when a full API page contains duplicate titles;

## [0.12.0] - 2026-08-06

### Added

- Read-only nested comment replies through `/comments/{id}/children`;
- 20-item pagination for anime comments and reply threads;
- Comment markup cleanup and dislike counters

## [0.11.0] - 2026-08-06

### Added

- YummyAnime actions to standard Lampa detail cards;
- Comment authors, dates, likes and reply counts;

### Changed

- Comments are now available without account authorization and use the actual `response.comments` payload;
- Consolidated watch, details, comments, favorites, lists and ratings into one reusable action menu

## [0.10.0] - 2026-08-06

### Added

- A Continue Watching catalog for the 20 most recently opened anime;

### Changed

- History cards use standard Lampa detail pages when a safe match exists;
- Standard cards now retain their exact YummyAnime mapping without a second API search

## [0.9.0] - 2026-08-06

### Changed

- YummyAnime catalog and schedule entries now open standard Lampa detail cards;
- Matched titles are resolved through Lampa's built-in TMDB source by title and year;
- Unmatched or ambiguous titles safely fall back to the YummyAnime detail view

## [0.8.0] - 2026-08-06

### Added

- Local playback history for the last 100 anime;
- One-click resume from the last opened episode and player;
- Episode duration and view counts to the episode selector;
- A playback-history reset under YummyAnime settings

## [0.7.0] - 2026-08-06

### Added

- A preferred-player setting;

### Changed

- Remembered the last selected player and placed it first in the source list;
- Kept every available player and dubbing visible for manual selection

## [0.6.0] - 2026-08-06

### Added

- A YummyAnime playback button to matching standard Lampa cards;

### Changed

- Registered YummyAnime with Lampa Online when that module is available;
- Exposed every player, dubbing and episode returned by the YummyAnime API

## [0.5.0] - 2026-08-06

### Added

- YummyAnime dubbing and episode selection;
- Embedded playback for official iframe players;

### Changed

- Direct media URLs are handed to the native Lampa Player with a playlist

## [0.4.1] - 2026-08-06

### Changed

- Clarified that YummyAnime login accepts a nickname or email

## [0.4.0] - 2026-08-06

### Added

- A Russian/English language selector under YummyAnime settings;

### Changed

- Localized the plugin interface, notifications, dates and YummyAnime API language header

## [0.3.1] - 2026-08-06

### Added

- 3-hour, day, week and month switches to the YummyStatus dashboard

## [0.3.0] - 2026-08-06

### Added

- A TV-friendly YummyStatus dashboard with five-minute monitoring snapshots

## [0.2.0] - 2026-08-06

### Changed

- Account settings and read-only profile statistics;
- Verified YummyAnime API request contracts;
- Public catalog requests no longer send stale account Bearer tokens

### Fixed

- Genres, ratings, daily schedule and infinite catalog pagination;

## [0.1.0] - 2026-08-06

### Added

- Read-only YummyAnime account profile and list statistics page;

### Changed

- Initial YummyAnime Lampa extension;
- Anime catalog, search, genres and schedule;
- Seven-day schedule grouped by date with local release time and episode numbers;
- All YummyAnime rating sources on catalog cards and anime details;
- Infinite offset pagination for catalog, search, genres and top-rated lists;
- Audited API routes and fixed JSON login plus numeric user-list IDs;
- Moved YummyAnime login, token refresh and logout to settings;
- Isolated public catalog requests from stale or invalid account Bearer tokens;
- Ratings, favorites and user lists;
- YummyAnime account login and token refresh;
- Read-only comments;
- Anime details, trailers and recommendations;
- Local API cache and API health check;
- Bundled `dist/index.js` for Lampa installation;
- Russian and English documentation;

### Fixed

- YummyAnime genre response parsing and genre filter values;
