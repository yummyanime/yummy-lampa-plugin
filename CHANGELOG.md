# Changelog

## 0.45.9 — 2026-08-25

- Add a notice and return to the title card when auto-next reaches the last episode
- Fix Continue Watching for YummyAnime history records without video IDs when the episode number is provided in ep_title
- Refactor the main README into concise English documentation 
- Add an optional Russian translation as a separate document 
- Remove premature MIT license references until the project license is chosen

## 0.45.8 — 2026-08-25

- Fix counting an episode as watched after 30 seconds of playback

## 0.45.7 — 2026-08-25

- Fix watch progress staying stale on plugin cards, the title page, and Continue Watching

## 0.45.6 — 2026-08-23

- Add colour bands to the YummyAnime score so it reads at a glance

## 0.45.5 — 2026-08-23

- Add coverage proving account watch history alone fills Continue Watching 
- Remove the debug breakdown from the viewer's screen

## 0.45.4 — 2026-08-23

- Remove the user-list filter from Continue Watching so only a watched last episode ends a title

## 0.45.3 — 2026-08-23

- Add a Continue Watching breakdown reporting how many records came from the account and which filter removed each title

## 0.45.2 — 2026-08-23

- Fix a finished episode dropping its whole title from Continue Watching instead of advancing to the next one | Add episode counts resolved from the title so the queue knows when a title is actually over

## 0.45.1 — 2026-08-23

- Fix one shared 95 percent rule for a finished episode across the detail summary, watched reach and Continue Watching

## 0.45.0 — 2026-08-23

- Fix Continue Watching dropping a title after an episode finishes instead of offering the next one 
- Add the furthest watched episode to history entries and cards 
- Add an account history pull at startup so devices share progress 
- Add account reporting for the embedded site player

## 0.44.20 — 2026-08-23

- Remove the temporary player resource probe now that the decoder leak is fixed

## 0.44.19 — 2026-08-23

- Fix the automatic episode switch stranding a video decoder per advance by closing the running player first

## 0.44.18 — 2026-08-23

- Add a temporary player resource probe to the test build for diagnosing the repeated-playback renderer crash

## 0.44.17 — 2026-08-21

- Add silent background refresh for fresh offline caches
- Fix live schedule updates while preserving focus and scroll

## 0.44.16 — 2026-08-21

- Fix collections to render from the first available cached source

## 0.44.15 — 2026-08-21

- Add offline-first cache for collections, genres and schedule
- Fix focus and scroll restoration after returning from nested pages

## 0.44.14 — 2026-08-20

- Fix episode numbers normalized across playback, resume history and stream resolvers

## 0.44.13 — 2026-08-19

- Fix schedule posters increased by 20 percent

## 0.44.12 — 2026-08-19

- Fix schedule YA ratings loaded from title details when schedule data omits them

## 0.44.11 — 2026-08-19

- Fix release-order YA ratings aligned to the right edge

## 0.44.10 — 2026-08-19

- Fix auto-next player cascade by binding each watcher to one video and ignoring stale callbacks

## 0.44.9 — 2026-08-19

- Fix YummyAnime Lampa button to retain native height while remaining 20 percent wider

## 0.44.8 — 2026-08-19

- Fix auto-next skipping one extra episode because Lampa playlist and plugin both advanced
- Fix native Lampa YummyAnime rating to YA text in brand color
- Fix YummyAnime Lampa button height and increase width by 20 percent
- Add YA rating to release order and schedule day lists
- Remove Japan labels from dashboard copy

## 0.44.7 — 2026-08-18

- Fix schedule dubbing labels to respect enabled playback sources
- Remove the duplicate YummyAnime API check from Settings

## 0.44.6 — 2026-08-17

- Fix dashboard library preview contract after section-rail focus navigation change

## 0.44.5 — 2026-08-17

- Fix Android dashboard focus vanishing for one step on the section rail

## 0.44.4 — 2026-08-17

- Fix schedule title poster size increased by about 50 percent

## 0.44.3 — 2026-08-17

- Fix release cut past already published 0.44.1 with schedule crash and translation list fixes

## 0.44.2 — 2026-08-17

- Fix schedule page crash from a leftover createAvailability call after translation list rewrite

## 0.44.1 — 2026-08-17

- Fix schedule day focus navigation jumping between chips and titles
- Add per-episode voice and subtitle team lists on the schedule page

## 0.44.0 — 2026-08-17

- Fix confusing shared “player” wording by splitting sources and playback players in settings and voice selection
- Add per-source visibility toggles for Kodik, Alloha, CVH, Sibnet and Aksor
- Refactor preferred player to ask / internal Lampa / external Android chooser
- Fix preferred-player selection being inactive outside Android and locked to the internal Lampa player

## 0.43.4 — 2026-08-17

- Fix AniSkip suggest-skip buttons being visible but unreachable with a TV remote

## 0.43.3 — 2026-08-17

- Fix title detail opening with focus on Watch instead of the title name

## 0.43.2 — 2026-08-17

- Fix TV focus not returning to the title page after closing rating or comment-reply Select windows

## 0.43.1 — 2026-08-17

- Fix external Android player options being offered on Tizen, WebOS, and other non-Android platforms

## 0.43.0 — 2026-08-16

- Fix genre and collection Enter navigation on legacy Lampa Card onEnter
- Fix native TMDB near-miss matches for similar live-action titles
- Fix Lampa global Search crash from a missing YummyAnime source params object

## 0.42.49 — 2026-08-16

- Fix Lampa global Search crash caused by a YummyAnime source without params

## 0.42.48 — 2026-08-16

- Fix opening YummyAnime titles in Lampa when a similar live-action TMDB title shares the year
- Fix native TMDB matching to prefer animation and reject near-miss localized titles

## 0.42.47 — 2026-08-16

- Fix genre and collection Enter by replacing Lampa Card `onEnter` instead of adding a second DOM handler
- Fix duplicate Activity entries that required two Back presses and hung after a few opens

## 0.42.46 — 2026-08-16

- Fix genre and collection opening on Lampa builds that mutate card `params`
- Fix duplicate navigation without relying on a native click event

## 0.42.45 — 2026-08-16

- Fix duplicate genre and collection activity entries by using one Lampa-native enter handler per tile
- Fix the tile hub loader after rebuilding a screen evicted from Lampa's activity history

## 0.42.44 — 2026-08-16

- Fix tile hub return navigation by removing duplicate enter handlers and ignoring late responses after a screen closes
- Fix loading indicators persisting after genre and collection pages finish or fail

## 0.42.43 — 2026-08-16

- Fix duplicate genre and collection navigation entries that caused loading screens when returning to tile hubs
- Fix recommended title focus leaving the visible horizontal row when navigating left

## 0.42.42 — 2026-08-16

- Fix genre and collection tile clicks to open a separate catalog page with the old working loader

## 0.42.41 — 2026-08-16

- Fix genre and collection pages hanging on load by isolating catalog query params from Lampa InteractionCategory and always clearing the activity loader

## 0.42.40 — 2026-08-16

- Fix genre and collection pages getting stuck when the YummyAnime API is unavailable
- Add readable collection titles directly to catalog tiles

## 0.42.39 — 2026-08-16

- Refactor Genres and Collections into focused tile catalogs
- Add adaptive TV navigation and responsive tile layouts

## 0.42.38 — 2026-08-16

- Fix search input showing duplicate fields on some devices by preferring Input.edit API and adding double-show guard

## 0.42.37 — 2026-08-16

- Fix genre and collection tile cards showing portrait — mark items-line row container after build so CSS can style all cards reliably

## 0.42.36 — 2026-08-16

- Fix genre and collection shortcut cards using Lampa's node-only render callback

## 0.42.35 — 2026-08-16

- Add a TV-native collection shortcut row above collection rails

## 0.42.34 — 2026-08-16

- Refactor genre shortcuts into a TV-native horizontal card row

## 0.42.33 — 2026-08-16

- Fix catalog rendering after adding genre shortcut tiles

## 0.42.32 — 2026-08-16

- Add genre shortcut tiles above the Genres hub rows

## 0.42.31 — 2026-08-16

- Add faster parallel genre hub loading and a 15-minute row cache

## 0.42.30 — 2026-08-16

- Fix Genres and Collections hubs by loading all rail rows before render

## 0.42.29 — 2026-08-16

- Fix rail pagination using the focused DOM row instead of stale Lampa state

## 0.42.28 — 2026-08-16

- Fix repeated four-row loading without relying on Lampa scroll events

## 0.42.27 — 2026-08-16

- Fix Genres and Collections stopping after the eighth hub row

## 0.42.26 — 2026-08-16

- Fix Genres and Collections hub rows not loading after the first four

## 0.42.25 — 2026-08-16

- Add internal Lampa player to the preferred player setting

## 0.42.24 — 2026-08-16

- Add endings-only and suggest-skip AniSkip modes

## 0.42.23 — 2026-08-16

- Fix keep YummyTV integration disabled by default

## 0.42.22 — 2026-08-16

- Fix YummyTV integration being disabled by default

## 0.42.21 — 2026-08-16

- Fix usage policy Close button asking Lampa to exit the app

## 0.42.20 — 2026-08-16

- Fix Watch flow reopening playback choice and killing the player

## 0.42.19 — 2026-08-16

- Fix refusing a parent TMDB series when YummyAnime is a later season

## 0.42.18 — 2026-08-16

- Fix TMDB card lookup for YummyAnime season sequels like Grand Blue 2

## 0.42.17 — 2026-08-16

- Fix Lampa card lookup from the title page missing English aliases

## 0.42.16 — 2026-08-16

- Fix TV card posters looking pixelated after downscale

## 0.42.15 — 2026-08-15

- Add lazy batch loading to collection rows

## 0.42.14 — 2026-08-15

- Fix focused catalog year overlapping the poster 
- Add account-list icons on posters from catalog data

## 0.42.13 — 2026-08-15

- Fix continue watching list emptying while the dashboard still shows the last title

## 0.42.12 — 2026-08-15

- Add focusable fullscreen poster viewing on title cards

## 0.42.11 — 2026-08-15

- Add lazy batch loading to genre rows

## 0.42.10 — 2026-08-15

- Fix my lists, collection, and genre cards to render as horizontal Lampa rows

## 0.42.9 — 2026-08-15

- Add collection card rows like my lists
- Add genre card rows like my lists

## 0.42.8 — 2026-08-15

- Fix my lists rails to use Lampa card size
- Fix collections to show collection cards again
- Fix genres to open the picker again

## 0.42.7 — 2026-08-15

- Fix YummyAnime sidebar item disappearing and not keeping its saved menu place

## 0.42.6 — 2026-08-15

- Fix trailer playback

## 0.42.5 — 2026-08-15

- Fix my lists card rows
- Add collection card rows
- Add genre card rows

## 0.42.4 — 2026-08-14

- Fix catalog card row spacing

## 0.42.3 — 2026-08-14

- Fix catalog card size
- Fix title card grid centering

## 0.42.2 — 2026-08-14

- Fix catalog poster sharpness

## 0.42.1 — 2026-08-14

- Remove public application key setting
- Remove official extension wording

## 0.42.0 — 2026-08-14

- Add official YummyAnime extension label
- Fix dist bundle newlines | Fix Linux CI CRLF mismatch
- Remove Russian documentation

## 0.41.46 — 2026-08-13

- Show unread notifications on the home tile even when the counts API returns 0, by checking the notification list and keeping the cache in sync.

## 0.41.45 — 2026-08-13

- Pull YummyAnime watch progress into local history so title cards, resume and Continue Watching use the account, not only Lampa playback.

## 0.41.44 — 2026-08-13

- Keep a permanent test install URL at dist/index.js, without a version query that pins Lampa to an old build.

## 0.41.43 — 2026-08-13

- Stop a sidebar menu error from aborting plugin registration, so settings and YummyAnime screens still load.

## 0.41.42 — 2026-08-13

- Keep the YummyAnime sidebar item visible and in its saved place on devices where Lampa's menu editor drops plugin buttons.

## 0.41.41 — 2026-08-13

- Keep a production install URL separate from the experimental dist URL, tag verified releases, and roll production back by promoting an earlier git tag.

## 0.41.40 — 2026-08-13

- Add a single script that updates the plugin version in src/config.js, README, docs, changelog, the install URL, and the built dist bundle.

## 0.41.39 — 2026-08-13

- Synchronized Russian and English documentation with the current installation URL.
- Documented Ukrainian localization and the title-detail voice-team and subtitle panel.
- Updated the documented project structure after extracting the title-detail module.

## 0.41.38 — 2026-08-13

- Focus the last-watched dubbing in the voice picker when opening Watch, using the previous episode's saved voice when that group is still available.

## 0.41.37 — 2026-08-13

- Share one cached `/videos` request across catalog cards, title-card episode stats, translation chips, and the Watch menu, with TTL, a bounded cache, and abort when the title card closes.

## 0.41.36 — 2026-08-13

- Show watched episode numbers on the title card (`10, 13` or `1–100`) instead of a count that looks like the first N episodes; collapse long lists into ranges and truncate sparse ones.

## 0.41.35 — 2026-08-13

- Open the voice and episode pickers without waiting on Jikan episode titles; reuse the title-page videos request from memory so Watch does not refetch before the dubbing list.

## 0.41.34 — 2026-08-13

- Remove the remote-focus pause on the dashboard: keep D-pad movement instant, and stop scaling tiles, ambient layers, and intro art on every focus change.

## 0.41.33 — 2026-08-13

- Extract the YummyAnime title Detail page into `src/ui-detail.js` (`LampaYaniDetail.create`) so the main UI shell delegates detail rendering through injected dependencies.

## 0.41.32 — 2026-08-13

- Extract shared title-card mapping (`toCard`, ratings, media meta, watched-episode progress) into `src/ui-card-model.js` so catalog, detail, and Lampa card integration share one model.

## 0.41.31 — 2026-08-13

- Scale card overlay density by font-relative `em` size so Lampa interface scale, 720p, and 4K do not change when badges collapse.
- Add portrait / short-height / ultra-wide CSS breakpoints for vertical emulator windows, 720p-class viewports, and 4K reading width.

## 0.41.30 — 2026-08-13

- Add shared section states for skeleton loading, API offline, cached data, truly empty lists, and retry across schedule, notifications, status, releases, translations, updates, recommendations, and collections.
- Mark stale API fallback payloads so screens can show a cached-data banner instead of looking like a live empty failure.

## 0.41.29 — 2026-08-13

- Unify small-poster card overlays by priority: list status and playback progress stay first, then fresh episode, quality/voices, genre top, and ratings.
- When the poster is crowded, secondary badges hide in that order instead of overlapping; top-start media and top-end fresh/history badges keep separate lanes.

## 0.41.28 — 2026-08-13

- Classify detail-page translations by dubbing labels from real Yani names: voice prefixes like `Озвучка Kazoku Sub` / `Озвучка SubVost` stay in voice teams, while `Субтитры …`, SoftSub/HardSub/сабы variants still go to subtitles.

## 0.41.27 — 2026-08-12

- Add anonymized YummyAnime API response fixtures for catalog/detail, videos, schedule, lists, comments, notifications, and history/progress under `tests/fixtures/yani-api/`.
- Guard those envelopes with a contract test that runs the real normalizers so API shape drift fails CI before a broken release.

## 0.41.26 — 2026-08-12

- Speed up catalog/dashboard card paints: keep existing rating chips instead of rebuilding them on every Lampa `cardRender`, sync overlay classes once per decorate, and cache local playback history briefly while many cards resolve progress.
- Drop per-chip focus shadows that were expensive on weak TV WebViews.

## 0.41.25 — 2026-08-12

- Gate GitHub Pages deploy on JavaScript syntax checks, the full contract-test suite, a fresh `node build.js`, and a `dist/index.js` freshness check against sources.
- Keep the YummyStatus snapshot refresh best-effort (`continue-on-error`) so a status API outage cannot block plugin publishing.

## 0.41.24 — 2026-08-12

- Unified catalog and title-detail ratings into one compact logo+score chip panel with consistent logo size and clearer card focus.
- Keep at most three positive ratings on cards (YummyAnime first) and lift the panel above list, playback, and progress overlays so it no longer collides with quality badges or footer chrome.

## 0.41.23 — 2026-08-12

- Extracted native Lampa card resolve, reverse Yummy match, and full-detail rating/button decoration into `src/ui-standard-card.js`.
- Kept `openYummyDetail` and online-source registration in `ui.js`.

## 0.41.22 — 2026-08-12

- Extracted playback select menus, return-focus helpers, and video URL/player-key utils into `src/ui-playback-menu.js`.
- Left stream launch, Alloha policy, and player watchers in `ui.js` for the next standard-card extraction.

## 0.41.21 — 2026-08-12

- Extracted local playback history storage and Continue Watching progress UI into `src/ui-playback-history.js`.
- Kept player progress watchers and flush callbacks in `ui.js` for the next playback-menu extraction.

## 0.41.20 — 2026-08-12

- Extracted YummyAnime catalog card bind/open helpers into `src/ui-card-bind.js`.
- Left Continue Watching history-card overrides in `ui.js` for the next progress/history extraction.

## 0.41.19 — 2026-08-12

- Extracted shared YummyAnime card decoration helpers into `src/ui-card-renderers.js`.
- Kept catalog card open/bind lifecycle in `ui.js` and wired decoration through `LampaYaniCardRenderers.create`.

## 0.41.18 — 2026-08-12

- Show only the dubbing or subtitle team name on title-detail translation chips when a team is present.
- Keep the generic “Озвучка” / “Субтитры” label only for entries without a team name.

## 0.41.17 — 2026-08-12

- Show the full genre description in the catalog header instead of clamping it to two lines.
- Keep catalog TV-remote focus on title cards only: the sort/filter command deck is no longer a D-pad target and remains reachable via color/number shortcuts and mouse clicks.

## 0.41.16 — 2026-08-12

- Added a dedicated title-detail panel listing unique voice teams and subtitle releases.
- Removed player names and duplicate translation entries from this informational panel.
- Shared the video request with episode statistics and added lightweight reduced-motion-aware presentation.

## 0.41.15 — 2026-08-12

- Redesigned video quality and dubbing availability as one compact glass-style card indicator.
- Added lightweight reveal motion with automatic reduced-motion and weak-device fallbacks.

## 0.41.14 — 2026-08-12

- Added compact episode and playback percentage indicators to YummyAnime cards.
- Added a slim progress bar that updates on visible cards after playback progress changes.

## 0.41.13 — 2026-08-12

- Added compact freshness labels to updated title cards: Today, Yesterday, or a localized date.
- Highlighted recently updated cards without making extra API requests.

## 0.41.12 — 2026-08-12

- Added distinct compact colors for ongoing, released and announced title states.
- Included watched/available episode progress in the card metadata line using account-list data or reliable local playback history without extra API requests.

## 0.41.11 — 2026-08-12

- Added a compact metadata line below title cards with media type, release status, available episode counts and year when supplied by YummyAnime.
- Removed the duplicate media-type badge from poster artwork and retained quality, dubbing and genre-top badges.

## 0.41.10 — 2026-08-12

- Load the full localized genre description from the YummyAnime genre endpoint and keep the bundled description as an offline fallback.
- Cache genre details for 24 hours and decode API HTML entities before displaying plain text in the TV catalog header.

## 0.41.9 — 2026-08-12

- Added a compact trophy badge with the actual top-100 position to cards in a genre catalog.
- Corrected the Popular sort direction so genre positions are derived from the API's real best-first order; the badge remains self-contained with an embedded SVG.

## 0.41.8 — 2026-08-12

- Added localized textual genre descriptions when the YummyAnime API only provides a genre title and identifier.
- Expanded the genre catalog header to show a readable two-line description instead of truncating it to one line.

## 0.41.7 — 2026-08-12

- Embedded remote color and number hints into Schedule day/release controls and the actionable More cards in My Lists, removing the separate shortcut legends.

## 0.41.6 — 2026-08-12

- Replaced the separate catalog remote legend with compact color and number badges embedded directly into the corresponding filter and sorting buttons.

## 0.41.5 — 2026-08-12

- Added compact remote-control legends and color-key shortcuts to Schedule and My Lists: day navigation and release focus in Schedule; direct account-list and watch-history access in My Lists.

## 0.41.4 — 2026-08-12

- Added a compact TV remote legend to catalog controls and color/number shortcuts for catalog modes, sorting, filters and returning to the first row.

## 0.41.3 — 2026-08-12

- Fixed catalog remote handlers on Android/TV Lampa builds, where `Controller.enabled()` returns the active controller directly instead of a nested `controller` field.

## 0.41.2 — 2026-08-12

- Fixed vertical catalog navigation for Lampa builds that do not expose Down links through `Navigator`: the remote now selects the closest poster in the next grid row and scrolls it into view.

## 0.41.1 — 2026-08-12

- Fixed catalog remote navigation after the new command deck: Down now rebuilds the poster collection before moving focus into it.
- Kept the last focused poster in sync and added a scroll fallback when the next catalog row is not yet available.

## 0.41.0 — 2026-08-12

- Added one bounded focus-state manager for catalog, search results, account lists, My Lists, schedule and title details.
- Restored logical focus keys and scroll positions after a screen rerender instead of relying only on stale DOM nodes.
- Routed temporary Select and Input returns through the same restoration mechanism.
- Kept at most 32 screen states to avoid unbounded memory growth during long TV sessions.

## 0.40.5 — 2026-08-12

- Replaced the permanently expanded account-list sorting row with a compact TV-friendly sorting capsule.
- Added inline expand, collapse and Back handling while preserving the last focused title.
- Kept list identity, item count and the active sorting mode visible without taking space from the poster grid.

## 0.40.4 — 2026-08-12

- Replaced the floating catalog toolbar with an integrated horizontal command deck designed for TV remotes.
- Added predictable navigation from the first card row to sorting and filters, and back to the last focused title.
- Kept genre title and description above catalog controls and removed the unused right-side layout gap.

## 0.40.3 — 2026-08-12

- Replaced the sorting popup with an inline five-mode TV rail controlled directly by Up, Down, Left, Right and OK.
- Kept list cards and sorting inside the same Lampa controller to make remote navigation predictable.
- Added a persistent selected-genre header with the genre name and API description, including a localized fallback.
- Preserved genre context after sorting and filtering the catalog.

## 0.40.2 — 2026-08-12

- Replaced the generic list sorting popup with a dedicated TV-friendly selector.
- Added distinct icons, colors and a clear current-sort marker for every sorting mode.
- Restored focus to the sorting card after Back/Left and removed stale sorting overlays when leaving a list.

## 0.40.1 — 2026-08-12

- Redesigned My Lists with a distinct color and icon for every account list and watch history.
- Replaced the generic More poster with a list-specific card showing the list size and destination.
- Added compact list badges and playback progress bars to title posters.
- Reworked the single TV-friendly sorting control to show the current list, item count and active sort order.

## 0.40.0 — 2026-08-12

- Finalized the dashboard data lifecycle with chapter-level loading, ready, partial, cached, empty and offline states.
- Staggered personal history, list and notification refreshes to reduce startup pressure on low-memory devices.
- Cancelled pending dashboard requests and timers when leaving the screen.
- Kept chapter state indicators compact on narrow layouts and motion-safe on reduced-motion devices.
- Added regression coverage for dashboard request cancellation, refresh scheduling and responsive state indicators.

## 0.39.16 — 2026-08-12

- Added chapter-specific focus contours to dashboard actions.
- Matched tile accents and navigation arrows to each section color.
- Preserved the high-contrast light focus surface required for TV viewing.

## 0.39.15 — 2026-08-12

- Redesigned the dashboard section rail as a numbered chapter spine.
- Expanded the active chapter into a color-coded capsule while keeping inactive chapters compact.
- Preserved TV focus labels and added a matching service chapter accent.

## 0.39.14 — 2026-08-12

- Structured the dashboard as five stable visual chapters.
- Added compact color-coded chapter markers to every dashboard section.
- Highlighted the current chapter without adding focusable controls or API work.

## 0.39.13 — 2026-08-12

- Added a live section breadcrumb to the dashboard header.
- Synchronized header, active-panel and background accents with the focused dashboard group.
- Kept the new context entirely local with no additional API requests.

## 0.39.12 — 2026-08-12

- Recolored the Catalog card-stack illustration to violet, coral, blue, and mint.
- Removed the repeated white cards and avoided flag-like color associations.

## 0.39.11 — 2026-08-12

- Added lightweight section-aware dashboard atmosphere for clearer TV remote navigation context.
- Dashboard waves and color accents now follow Browse, Episode Flow, Library, Discover, and Service focus groups.
- Kept the new visual transitions disabled in reduced-motion mode and covered the behavior with regression tests.

## 0.39.10 — 2026-08-12

- Fixed the dashboard startup crash caused by the controller collection helper being scoped inside `create()`.
- Kept the section rail in the Home controller collection after lifecycle transitions.
- Added a regression contract for Home lifecycle helper scope.

## 0.39.9 — 2026-08-12

- Redesigned My Library as a connected activity stream rather than a plain card stack.
- Added a live library pulse summarizing resumable and tracked titles.
- Added focus-aware timeline nodes for Continue Watching, My Lists and Updates.
- Reused existing personal snapshots without adding API traffic.

## 0.39.8 — 2026-08-12

- Gave Catalog, Genres and Search distinct visual identities on the dashboard.
- Added a layered title portal, animated genre tags and a focused search beam.
- Improved the browse panel proportions while preserving all TV actions.
- Added compact artwork scaling for narrow screens.

## 0.39.7 — 2026-08-12

- Redesigned the dashboard service area as a connected profile-and-API constellation.
- Added a live service hub that reflects API, degraded, cached and unavailable states.
- Kept account, notification and status actions fully focusable while reducing visual weight.
- Added responsive and reduced-motion behavior for the new service composition.

## 0.39.6 — 2026-08-12

- Added compact featured-release and featured-collection previews to the dashboard Discover block.
- Made both previews focusable and directly actionable from a TV remote.
- Reused the existing dashboard feed snapshot without adding API requests.
- Preserved responsive and low-memory behavior for preview artwork.

## 0.39.5 — 2026-08-12

- Made the episode-flow stages focusable from a TV remote.
- Added direct navigation from Japan broadcast and waiting stages to Schedule.
- Added direct navigation from the available translation stage to New Translations.
- Added focus styling and accessible labels for the flow actions.

## 0.39.4 — 2026-08-12

- Made the dashboard section rail focusable and usable with a TV remote.
- Added direct jumps to the first action in each dashboard group.
- Added an explicit rail focus state and included the rail in Lampa's focus collection.

## 0.39.3 — 2026-08-12

- Fixed Up navigation from the first account-list card row to the sorting button.
- Used the last real card focus when a Lampa build places its focus class on another element.
- Replaced fragile above-card detection with stable first-row geometry.
- Passed the sorting button DOM node directly to Lampa's focus controller.

## 0.39.2 — 2026-08-12

- Made the dashboard summary metrics focusable quick actions for a TV remote.
- Linked broadcasts today, new translations and Continue Watching directly to their full sections.
- Added clear focus, arrow and accessibility states while keeping the compact summary layout.
- Restored the corresponding main dashboard tile as the saved focus destination.

## 0.39.1 — 2026-08-12

- Turned the three dashboard Continue Watching previews into TV-focusable quick-resume actions.
- Opened the saved episode and playback position directly while retaining the full Continue Watching section.
- Added a clear play affordance, progress state, focus styling and contextual header details.
- Reused the merged local and YummyAnime history snapshot without adding another API request.

## 0.39.0 — 2026-08-12

- Added local sorting to every YummyAnime account list: recently added, progress, rating, release year and title.
- Replaced a multi-button toolbar concept with one compact TV-friendly sorting panel.
- Made the panel reachable with Up from the first card row and Down returns to the previously focused card.
- Kept the selected mode separately for each user list and applied it without another API request.
- Preserved pagination after sorting and added Russian, English and Ukrainian labels.

## 0.38.2 — 2026-08-12

- Cached successful YummyAnime-to-TMDB card matches for 30 days.
- Cached unresolved titles briefly to prevent repeated request storms while retaining automatic retries.
- Deduplicated concurrent native-card lookups triggered by repeated TV input or Lampa events.
- Limited the persistent native-card cache and rejected invalid cached TMDB identifiers.

## 0.38.1 — 2026-08-12

- Grouped notifications into Today, Yesterday and Earlier sections.
- Displayed navigation arrows only for notifications that can really open an anime title.
- Kept informational and system notifications focusable for scrolling without implying a broken link.
- Preserved date grouping while loading additional notification pages.

## 0.38.0 — 2026-08-12

- Rebuilt notifications as clear TV-friendly cards with type icons, hierarchy and unread state.
- Correctly converted YummyAnime `title_html` and `text_html` fields into readable plain text.
- Added a compact notification summary and grouped bulk actions in a dedicated toolbar.
- Opened new-episode notifications through their catalog slug instead of treating `object_id` as an anime id.
- Improved pagination, empty states, focus restoration and read-state feedback.

## 0.37.9 — 2026-08-12

- Merged local and YummyAnime server progress in the dashboard Continue Watching summary.
- Updated the count, current title and visual preview after the lightweight background refresh.
- Deduplicated local and remote records and excluded completed or dropped titles.
- Added a five-minute per-account playback snapshot to keep repeated dashboard visits fast.
- Reused fresh list exclusions instead of downloading the user library on every visit.

## 0.37.8 — 2026-08-12

- Distinguished real zero counts from unavailable dashboard data.
- Displayed an em dash and a subdued dashed metric when its API source is unavailable.
- Preserved valid zero values when the API successfully returns an empty schedule or feed.
- Continued to display cached metrics during partial and complete outages.

## 0.37.7 — 2026-08-12

- Widened the dashboard summary area so all three metrics remain understandable on TV screens.
- Allowed metric labels to wrap to two lines instead of truncating important words.
- Rebalanced the contextual header and summary widths at desktop and medium breakpoints.
- Preserved the compact icon-and-count layout on narrow screens.

## 0.37.6 — 2026-08-12

- Renamed the ambiguous Today dashboard metric to Broadcasts today.
- Clarified that the number represents scheduled Japanese anime broadcasts.
- Added matching Russian, English and Ukrainian labels.

## 0.37.5 — 2026-08-12

- Added a smart initial dashboard focus based on the existing priority signal.
- Preferred continue watching, unread notifications, fresh translations or recommendations on a fresh visit.
- Preserved the user's last valid dashboard position ahead of the automatic choice.
- Kept asynchronous data refreshes from moving focus after the dashboard is already active.
- Added fallbacks for hidden or disabled dashboard sections.

## 0.37.4 — 2026-08-12

- Enriched the existing dashboard summary instead of adding duplicate navigation blocks.
- Added the nearest broadcast time and title to the daily schedule metric.
- Added the latest title and dubbing to the translation metric.
- Added the current title, episode and progress to the continue-watching metric.
- Kept the summary non-focusable and hid secondary text on narrow screens.

## 0.37.3 — 2026-08-12

- Fixed the dashboard crash after returning from Collections and other child screens.
- Kept contextual-header and broadcast-countdown callbacks in the full Home component lifecycle.
- Cleared retained dashboard callbacks and release data when Home is destroyed.
- Added a regression contract for callback visibility from the Lampa controller `start()` handler.

## 0.37.2 — 2026-08-11

- Added a localized countdown to the nearest Japanese broadcast in the episode-flow header.
- Switched the indicator to an aired state when the cached or live release time has passed.
- Recalculated the countdown whenever focus returns to the dashboard without a permanent timer.
- Reused the existing schedule payload and dashboard snapshot without extra API requests.

## 0.37.1 — 2026-08-11

- Added a non-focusable curved section rail for orientation on the long dashboard.
- Highlighted browse, episode flow, library, discovery and service as focus moves.
- Restored the correct rail position together with the last dashboard focus.
- Hid the rail on narrow screens and removed its transitions in reduced-motion mode.

## 0.37.0 — 2026-08-11

- Turned the dashboard header into a contextual view of the currently focused section.
- Added focused-section titles, live preview metadata, poster backdrops and group color accents.
- Updated the header when asynchronous dashboard insights arrive while a tile remains focused.
- Disabled contextual artwork on narrow, reduced-motion, low-memory and low-CPU devices.

## 0.36.9 — 2026-08-11

- Added current release and featured collection previews to the dashboard discovery panel.
- Added feed-derived titles, metadata, collection size and poster artwork without extra requests.
- Preserved discovery previews in the resilient dashboard snapshot during API outages.
- Kept artwork disabled on reduced-motion, low-memory and low-CPU devices.

## 0.36.8 — 2026-08-11

- Added a resilient 24-hour local snapshot for dashboard schedule and feed insights.
- Preserved cached schedule or translation data when only one YummyAnime endpoint responds.
- Added clear live, partial, cached and offline freshness indicators to the dashboard header.
- Prevented stale counters, previews and artwork from surviving a successful empty refresh.

## 0.36.7 — 2026-08-11

- Added an at-a-glance dashboard summary for today's releases, new translations and unfinished viewing.
- Reused existing schedule, feed and local-history data without adding network requests.
- Hid summary metrics for dashboard sections disabled in settings.
- Kept the summary non-focusable and compact on narrow screens.

## 0.36.6 — 2026-08-11

- Added a compact three-title continue-watching preview to the personal dashboard panel.
- Restored the last focused dashboard tile and its visible scroll position after returning from a section.
- Kept the preview non-focusable and disabled its poster artwork on constrained devices.
- Added coverage for preview ordering, progress bounds, empty history and focus persistence.

## 0.36.5 — 2026-08-11

- Added poster artwork to the active schedule, translation and continue-watching dashboard tiles.
- Added a deterministic personal priority accent for resume, notifications, fresh translations and recommendations.
- Disabled dashboard artwork on reduced-motion, low-memory and low-CPU devices.
- Reused existing schedule, feed and local-history payloads without adding API data requests.

## 0.36.4 — 2026-08-11

- Added cached unread-notification counts to the dashboard for signed-in users.
- Added live operational, degraded and unavailable states to the YummyAnime status tile.
- Reused feed and schedule requests for health signals instead of adding another API request.
- Kept service indicators non-focusable and resilient to partial endpoint failures.

## 0.36.3 — 2026-08-11

- Added a compact three-stage episode flow from Japanese broadcast through translation wait to an available dub.
- Matched recent broadcasts against translation feed events by YummyAnime title and episode identifiers.
- Added localized fallback states and a reduced-motion-safe visual timeline without adding TV focus stops.

## 0.36.2 — 2026-08-11

- Added local continue-watching counts and the latest resumable title to the dashboard.
- Added cached personal-list and tracked-title counters without loading the full user library.
- Added the signed-in YummyAnime user name to the account dashboard tile.
- Kept the last successful personal statistics visible when the YummyAnime API is unavailable.

## 0.36.1 — 2026-08-11

- Added live dashboard previews for the nearest scheduled broadcast and latest available translation.
- Added today's schedule count alongside the existing feed counters.
- Kept dashboard rendering resilient when either the schedule or feed API is unavailable.

## 0.36.0 — 2026-08-11

- Rebuilt the YummyAnime dashboard into clear browse, episode-flow, personal, discovery and service zones.
- Combined the Japanese schedule and new translation entry points in one prominent release panel while preserving the full schedule screen.
- Added a visual dashboard header, responsive panel hierarchy and active-panel focus feedback for TV remotes.
- Restored a deterministic first focus target and added mouse/touch activation to every dashboard tile.

## 0.35.2 — 2026-08-11

- Extracted trailer loading, rendering and TV navigation into a dedicated UI module.
- Preserved external YouTube routing, offline icons and restorable selection dialogs.
- Reduced the main UI monolith without changing detail-page trailer behavior.

## 0.35.1 — 2026-08-11

- Extracted catalog sorting, filtering and TV remote navigation into a dedicated UI module.
- Preserved catalog API loading and pagination behavior while reducing the main UI monolith.

## 0.35.0 — 2026-08-11

- Added TV-friendly catalog filters for anime type, release status and release period.
- Added a compact active-filter counter to the existing catalog toolbar.
- Kept filter definitions and query transformations in a separate testable module.

## 0.34.9 — 2026-08-11

- Extracted YummyAnime search integration from the main UI module.
- Debounced global Lampa search requests by 400 ms and ignored stale responses.
- Ranked results against all known title aliases and added a bounded short-lived search cache.
- Preserved dashboard focus when the search input is cancelled.

## 0.34.8 — 2026-08-11

- Add compact live counts to New Translations, New Releases and Collections dashboard tiles.
- Derive every count from the existing cached `/feed` request without blocking dashboard rendering.
- Count unique anime and collections instead of raw duplicate feed events.
- Keep the dashboard silent and fully interactive when feed insights are unavailable.

## 0.34.7 — 2026-08-11

- Deduplicate New Translations so each anime appears only once with its latest feed event.
- Sort translation cards by event time and show episode, dubbing and player on the newest entry.
- Display a compact additional-update count when the feed contains multiple events for one title.
- Move translation feed logic out of the main UI module and add a localized empty state.

## 0.34.6 — 2026-08-11

- Group New Releases, Top Rated, For You and Collections into one wide Discover block on the dashboard.
- Keep every destination independently focusable by TV remote and independently configurable in settings.
- Use a compact four-column layout on large screens and a two-column layout on narrow devices.
- Add lightweight organic decoration without introducing image or animation overhead on low-power devices.

## 0.34.5 — 2026-08-11

- Rebuild Updates around Watching, Planned, Postponed and subscribed titles only.
- Combine user lists, subscriptions, schedule and `/feed` `new_videos` into one latest-change timeline.
- Exclude Completed and Dropped titles and keep only the newest video event per anime.
- Show episode, dubbing and source details while reusing the cached account-list snapshot.

## 0.34.4 — 2026-08-11

- Personalize For You with both local playback and authorized YummyAnime watch history.
- Deduplicate source titles and recommendations while limiting recommendation fan-out for low-power TV devices.
- Explain recommendations with compact “Because you watched” poster badges.
- Fall back to the official global top only when no personalized recommendations are available.

## 0.34.3 — 2026-08-11

- Add a dedicated New Releases dashboard section backed by the official `/feed` `new` payload.
- Keep new anime separate from Japanese broadcasts and newly published translations or dubs.
- Open release cards directly in YummyAnime details and preserve the established My Lists dashboard position.
- Add release status/type badges, localized empty and error states, and a dedicated dashboard icon.

## 0.34.2 — 2026-08-11

- Turn the Best dashboard tile into a dedicated YummyAnime Top screen.
- Add TV-focusable Overall, TV series, Movies and ONA categories.
- Keep each category lazily paginated and ranked through the official `/anime` top sorting parameters.
- Add distinct category icons and Russian, English and Ukrainian labels.

## 0.34.1 — 2026-08-11

- Add a TV-focusable Collections tile to the YummyAnime dashboard while keeping Search as item 3.
- Load initial collection previews from `/feed` and lazily extend the catalog through `/collection`.
- Add dedicated, lazily paginated collection pages whose anime cards open directly in YummyAnime details.
- Show compact poster mosaics, anime counts, views and likes on collection cards when available.

## 0.34.0 — 2026-08-11

- Keep Search as dashboard item 3 and preserve the existing Schedule screen.
- Visually pair Schedule and New Translations in a wide TV-focusable episode-flow block.
- Add a New Translations screen backed by the YummyAnime `/feed` `new_videos` data.
- Show episode, dubbing and player information on new-translation cards when available.

## 0.33.15 — 2026-08-11

- Move My Lists to position 6 on the YummyAnime dashboard.
- Add the existing Notifications screen as dashboard item 10 for signed-in users.
- Place Account at position 11 and Status at position 12.

## 0.33.14 — 2026-08-11

- Replace the generic dashboard glow with layered curved YummyAnime wave artwork.
- Animate wave drawing and small ambient pulses when the dashboard opens.
- Give dashboard tiles a softer asymmetric shape and organic focus response.
- Keep all decorative motion disabled on reduced-motion and low-power devices.

## 0.33.13 — 2026-08-11

- Add staggered tile entrance animations and subtle dashboard ambient highlights.
- Add focus shine, icon movement and smoother arrow feedback to YummyAnime Home.
- Disable dashboard motion on reduced-motion, low-memory and two-core devices.

## 0.33.12 — 2026-08-11

- Add a focusable personal-rating action to the YummyAnime title page.
- Allow signed-in users to set a score from 1 to 10 or remove the current score.
- Update the displayed personal score immediately after a successful API request.

## 0.33.11 — 2026-08-11

- Give every catalog sorting action a distinct icon.
- Replace the duplicated popularity star with a trophy icon.
- Add a contract check that prevents duplicate sorting SVG paths.

## 0.33.10 — 2026-08-11

- Show the YummyAnime media type as a compact badge on catalog cards.
- Show the full media type separately from the title on the detail page.
- Support series, films, short films, OVA, ONA, specials and music videos without modifying title text.

## 0.33.9 — 2026-08-11

- Remember the exact catalog card used to enter the sorting toolbar.
- Return focus from the toolbar to that card with the TV remote left button.
- Track toolbar focus independently of Lampa's inconsistent legacy CSS focus marker.

## 0.33.8 — 2026-08-11

- Add asynchronously loaded recommendations and comments to the active Lampa detail navigation collection.
- Restore TV-remote focus for detail sections regardless of whether the title was opened from Schedule, Top Rated, For You, Updates, or Continue Watching.
- Route startup token maintenance through the automatic refresh cooldown.

## 0.33.7 — 2026-08-10

- Automatically refresh an authorized user's Bearer token every 48 hours as recommended by the YummyAnime API.
- Deduplicate parallel refresh attempts before authenticated API requests.
- Preserve the current token after transient refresh failures and retry after a 3-hour cooldown.

## 0.33.6 — 2026-08-10

- Install the catalog toolbar controller on Lampa's legacy `InteractionCategory` implementation.
- Allow right-edge cards in every visible catalog row to enter the side toolbar with a TV remote.
- Keep toolbar selectors attached after the legacy category rebuilds its limited navigation collection.

## 0.33.5 — 2026-08-10

- Initialize pagination when opening a full account list from the `More` card.
- Restore lazy rendering after the first 30 titles in `My Lists`.
- Keep the account-list pager compatible with both Lampa pagination method spellings.

## 0.33.4 — 2026-08-10

- Preserve Lampa's active catalog card when the category refreshes its navigation collection after vertical scrolling.
- Append toolbar controls to the native category collection without resetting Navigator focus.
- Restore toolbar entry from right-edge cards below the first catalog row.

## 0.33.3 — 2026-08-10

- When the embedded Alloha player is disabled, list direct and resolvable playback sources before iframe-only choices.
- Prioritize Kodik and other supported stream resolvers while retaining unavailable Alloha variants at the bottom.
- Apply the same capability-first ordering to both dubbing and episode selections.

## 0.33.2 — 2026-08-10

- Enter the catalog toolbar from the rightmost visible card of every grid row, including rows reached after vertical scrolling.
- Ignore cards mostly hidden underneath the fixed toolbar when determining the visible right edge.
- Focus the toolbar action nearest to the originating card instead of always jumping to the first action.

## 0.33.1 — 2026-08-10

- Remove ten unreferenced legacy screen implementations left behind after component extraction.
- Remove obsolete status and schedule formatting helpers from the main UI bundle.
- Add a regression contract preventing legacy screens from returning to the release bundle.

## 0.33.0 — 2026-08-10

- Put catalog cards and the fixed sorting toolbar into one television navigation collection so a standard remote can enter the toolbar from the right edge.
- Preserve focus after authentication, status-period and notification-list re-renders.
- Add a focusable Return to Lampa control to the legacy embedded player.

## 0.32.3 — 2026-08-10

- Make the television catalog side toolbar reachable with a standard directional remote from the rightmost visible card of every row.
- Return from the toolbar to the exact card that was focused before entering it.

## 0.32.2 — 2026-08-10

- Keep the focused recommendation card inside its horizontal viewport while navigating both right and left with a television remote.

## 0.32.1 — 2026-08-10

- Open viewing-order entries directly in YummyAnime detail without showing a misleading failed-Lampa-card fallback notification.

## 0.32.0 — 2026-08-10

- Replace the television catalog header with a compact fixed right-side toolbar containing sorting actions and Back to top.
- Enter the toolbar by pressing Right at the edge of any catalog row and return to the last focused card with Left.
- Show icon labels only while focused on television screens, while retaining the horizontal toolbar on narrow touch screens.

## 0.31.1 — 2026-08-10

- Restore the title-detail controller and focused comment after closing an inline replies dialog.
- Preserve the original card navigation context across comments, nested replies and paginated comment lists.
- Reopen a parent comments list after its child dialog has fully closed to avoid a frozen Select controller.

## 0.31.0 — 2026-08-10

- Add a compact fixed catalog toolbar with server-side sorting by popularity, year, rating, rating count, views, title and random order.
- Preserve active search, genre and filter parameters when changing catalog sorting.
- Add remote-friendly navigation between the sorting toolbar, catalog cards and a floating Back to top control.

## 0.30.5 — 2026-08-10

- Ignore temporary SSH known-hosts files, the smoke-test bundle and the removed duplicate detail-sections module.

## 0.30.4 — 2026-08-10

- Remove an accidentally committed temporary SSH known-hosts file.
- Remove the public smoke-test plugin from the release directory.
- Remove an unused duplicate detail-sections module from source and the legacy loader.

## 0.30.3 — 2026-08-10

- Restore the originating controller, collection and focused item after closing temporary YummyAnime lists.
- Apply the same return handling to genres, actions, reviews, collections, trailers and comments.
- Restore the correct screen after cancelling text input from Home, account and settings screens.

## 0.30.2 — 2026-08-10

- Open preview titles from My Lists directly in the YummyAnime detail screen.
- Prevent successful empty TMDB movie/TV searches from launching a duplicate aggregate lookup.
- Give six alternative titles a bounded lookup window while retaining aggregate fallback for actual TMDB client failures.

## 0.30.1 — 2026-08-10

- Restore poster images in the My Lists watch-history row when local history stores the poster as a plain URL.
- Support `large`, `huge` and `url` poster variants returned by YummyAnime history responses.
- Merge the server watch-history metadata into local entries and recover missing legacy posters from list or detail data in small batches.

## 0.30.0 — 2026-08-10

- Restore the YummyAnime Home content controller after cancelling the search input.
- Preserve the last focused Home tile so remote, mouse and touch navigation continue working after return.

## 0.29.14 — 2026-08-10

- Redesign My Lists as native Lampa-style horizontal rows instead of a shortcut grid.
- Show up to 10 most recently added titles per account list and the 10 latest locally watched titles.
- Add a final More card to every row which opens the complete list or watch history.
- Keep list counts in row headings and load all previews from one cached YummyAnime list snapshot.

## 0.29.13 — 2026-08-10

- Open a selected account-list screen immediately and load its titles inside the destination Activity.
- Reuse one five-minute user-list snapshot for shortcut counters and list contents instead of downloading the same large payload twice.
- Keep cached list contents available when the YummyAnime API is temporarily unavailable.

## 0.29.12 — 2026-08-10

- Prevent duplicate enter/click events from opening the same user list twice.
- Render large account lists in pages of 30 cards instead of constructing every card at once.
- Reset the list-navigation lock when returning to Your Lists.

## 0.29.11 — 2026-08-10

- Add matching status icons to every Your Lists shortcut.
- Show the number of titles in each YummyAnime list without issuing a separate request per status.
- Show the available local/server watch-history count and keep temporary API failures non-blocking.

## 0.29.10 — 2026-08-10

- Fix the Your Lists Activity factory so it returns a valid Lampa component with `create`, `start`, `render` and `destroy` methods.
- Add a regression contract that prevents modular components from silently returning `undefined`.

## 0.29.9 — 2026-08-10

- Flush the final internal-player position locally and to YummyAnime when playback closes.
- Update the already rendered Continue Watching card immediately after a progress change.
- Keep the active card resume metadata synchronized with local playback storage.
- Treat 75% playback as completed when no explicit completion state is available.

## 0.29.8 — 2026-08-10

- Build Continue Watching from merged local Lampa progress and YummyAnime server watch history.
- Exclude titles currently placed in the user's Completed or Dropped YummyAnime lists.
- Cache the exclusion set so the filter remains available during temporary API failures.

## 0.29.7 — 2026-08-10

- Separate Continue Watching from the complete YummyAnime watch history.
- Keep only the latest unfinished episode for each title and hide completed episodes using duration-aware thresholds.
- Persist local episode duration, dubbing and source information so resume cards remain useful after restarting Lampa.
- Support nested screenshot URLs from the YummyAnime watch-history response.

## 0.29.6 — 2026-08-10

- Fix Your Lists so a valid empty list no longer triggers a failing second request.
- Load every selected list, including Favorites, from its dedicated YummyAnime endpoint and use the complete list only as a network fallback.
- Cache the resolved user ID and the six account lists, with stale list data available when both API requests fail.
- Normalize direct and nested list response shapes before rendering cards.

## 0.29.5 — 2026-08-10

- Add a compact, focusable episode-information row to YummyAnime title details.
- Show explicit season count when available, total and aired episodes, watched episodes and average unique-episode duration.
- Enrich ordinary titles in the background while deferring large video lists until focus to protect low-memory devices.

## 0.29.4 — 2026-08-10

- Load the authorized user's server-side viewing history and progress from YummyAnime.
- Merge server records with local Lampa progress, deduplicate matching videos and keep local history available offline or without authorization.
- Load long server histories page by page and resume the exact saved video, episode and position.

## 0.29.3 — 2026-08-10

- Add Watch History to the Your Lists shortcut screen and reuse the existing Continue Watching component.

## 0.29.2 — 2026-08-10

- Replace the eager Your Lists API dashboard with a reliable shortcut menu for Watching, Planned, Completed, Dropped, Postponed and Favorites.
- Load only the selected account list and fall back to filtering the complete account list when a dedicated endpoint is unavailable.

## 0.29.1 — 2026-08-10

- Preserve the title-detail controller and focused action throughout the playback selection chain.
- Restore title interaction after cancelling source, dubbing, episode or playback-target selection and after returning from internal and external players or YummyTV.
- Avoid capturing the temporary Select controller as the external-player return target.

## 0.29.0 — 2026-08-09

- Add an authorized-only Your Lists section to the YummyAnime home screen.
- Show Watching, Planned, Completed, Dropped, On hold and Favorites with title counts and watched time.
- Open each category through the existing account-list catalog and add a visibility switch for the new section.
- Localize the new section in Russian, English and Ukrainian.

## 0.28.0 — 2026-08-09

- Add opt-out automatic viewing-progress synchronization for authorized YummyAnime users.
- Track the internal Lampa player's real position locally every ten seconds and synchronize it to YummyAnime at a bounded interval and on pause or completion.
- Keep manual account-page synchronization available when automatic synchronization is disabled.
- Clarify that external Android players cannot report their playback position back to Lampa.

## 0.27.2 — 2026-08-09

- Give a captured Alloha master an assumed lifetime, so the session is refreshed ahead of time even when the player never states one; a 12-minute test showed playback stalling after roughly eight minutes without it.
- Stop a request from blocking on a full session refresh for longer than a client will wait, and let that refresh finish in the background.

## 0.27.1 — 2026-08-09

- Translate the detail-loading error, which used to render its own key name to the user.
- Add a test asserting that every key the UI asks for is translated and that all locales cover the Russian reference.

## 0.27.0 — 2026-08-09

- Capture the Alloha session from the browser driver rather than from injected page code, so it is in place before the player issues its first request; this is what makes the resolver actually return a stream.
- Offer the full Alloha quality ladder and default to the best rung instead of whatever the offscreen player settled on.
- Keep the player's WebSocket alive from an init script so the session token keeps rotating.

## 0.26.0 — 2026-08-09

- Add an opt-in automatic switch to the next episode at the end of the current one.
- Resolve the next episode's stream a minute and a half before it is needed, so the switch is not spent waiting on the source's player page.
- Keep an automatic switch inside the running player instead of asking again where to play.

## 0.25.0 — 2026-08-09

- Skip openings and endings in the internal player using AniSkip timestamps, resolved from the MyAnimeList id YummyAnime already reports.
- Add a disabled-by-default setting choosing between openings only and openings with endings.

## 0.24.0 — 2026-08-09

- Pass the season, episode and dubbing stated in the YummyAnime player URL into the Lampac Alloha request and its season/episode selection.
- Ask Lampac to match by title whenever the title has no IMDb or Kinopoisk id, which is the common case for anime.

## 0.23.0 — 2026-08-09

- Add a self-hosted resolver service in `server/` that opens a live Alloha session in a headless browser and proxies its HLS stream with the rotating headers the CDN requires.
- Add a resolver client and settings entry, and try the resolver before Lampac when both are configured.
- Treat every resolved Alloha source as direct, whichever service produced it.
- Run the whole test suite in CI instead of a single test file.

## 0.22.0 — 2026-08-09

- Allow unresolved Alloha sources to fall back to the original embedded site player behind a new opt-in setting.
- Keep the embed disabled by default and keep the explicit warning when it is off, because it offers no Lampa timeline and no external player.
- Record playback history when the embedded Alloha player actually opens.

## 0.21.0 — 2026-08-09

- Reduce poster memory pressure by removing duplicate hidden image decoding and preferring medium-size artwork.
- Limit and deduplicate fallback-poster, YummyAnime and TMDB requests to avoid network bursts on low-memory devices.
- Stop treating every native Lampa title without genre metadata as anime.
- Remove an unused duplicate detail-sections module from the production bundle.
- Inline and restore the YummyAnime logo on the native Lampa title-card button.

## 0.20.23 — 2026-08-09

- Keep the YummyAnime for Lampa public application key as the default API identity.
- Add an optional settings action for entering or clearing a custom public `X-Application` key.
- Use the selected public application key for login, token refresh, logout and all API requests while keeping the user Bearer token separate.
- Do not create developer applications automatically.

## 0.20.22 — 2026-08-09

- Stop showing the usage policy automatically.
- Keep the policy available as an explicit action in YummyAnime settings.
- Explain that installing and enabling the extension constitutes agreement with the stated rules.

## 0.20.21 — 2026-08-09

- Add a localized usage-policy window shown once on first launch.
- State that the extension is provided as is, is intended for informational purposes and must not be used for illegal activity.
- Add a settings action for reopening the policy at any time.

## 0.20.20 — 2026-08-09

- Restore an open YummyAnime title after Lampa clears its plugin cache or reloads extensions.
- Persist the YummyAnime title id outside the transient card object and recover legacy saved activities from their detail URL.
- Return to YummyAnime Home instead of leaving a broken partial card when a restored activity can no longer be loaded.

## 0.20.19 — 2026-08-09

- Block unresolved Alloha sources from both internal and external media players.
- Allow Alloha playback only after a configured Lampac server returns a direct stream.
- Replace the iframe fallback with an explicit localized warning and avoid recording blocked attempts as watched.

## 0.20.18 — 2026-08-09

- Force the built-in Lampa engine with `Lampa.Player.runas('lampa')` when internal playback is selected.
- Preserve online-stream, quality, header and poster metadata in the internal player playlist.
- Stop silently falling back to an external Android player when internal playback cannot start.

## 0.20.17 — 2026-08-09

- Merge player and YummyTV actions into one "Watch" button on the YummyAnime title card.
- Show the destination picker only when the optional YummyTV integration is enabled and a title ID is available.

## 0.20.16 — 2026-08-09

- Rename the title-card playback actions to "Watch in player" and "Watch in YummyTV".
- Keep the YummyTV action hidden unless its optional integration is enabled in settings.

## 0.20.15 — 2026-08-09

- Open unresolved Alloha sources in the official visible player instead of trying to send iframe URLs to a media player.
- Add an optional self-hosted Lampac adapter for `/lite/alloha` and direct `/lite/alloha/video.m3u8` playback.
- Keep direct HLS/DASH/MP4/WebM playback selectable between Lampa and external Android players.
- Make the private YummyTV application integration disabled by default and configurable in settings.
- Replace the YummyTV episode metadata dependency with Jikan episode data.

## 0.20.14 — 2026-08-09

- Add a playback target setting and direct-stream picker for choosing between an external Android player and Lampa's internal player.

## 0.20.13 — 2026-08-09

- Restore Lampa controller focus after returning from external players, browsers, YouTube, or YummyTV deep links.

## 0.20.12 — 2026-08-09

- Replace unsupported-player fallback with a two-action playback picker: watch in player or watch in YummyTV when the app is installed.

## 0.20.11 — 2026-08-09

- Shorten Alloha playback handling by opening unsupported Alloha iframe players through Android's external browser bridge instead of first sending them through video-player resolution.

## 0.20.10 — 2026-08-09

- Reduce trailer navigation by opening a compact trailer picker over the detail card, and open the trailer directly when only one trailer is available.

## 0.20.9 — 2026-08-09

- Route YouTube trailer intents through the native Android browser bridge before Lampa external media handlers, so trailers open in YouTube or a browser instead of Kodi-like players.

## 0.20.8 — 2026-08-09

- Launch YummyTV deep links through Lampa's native Android bridge.
- Prevent custom `yummytv://` links from opening inside Lampa's WebView.

## 0.20.7 — 2026-08-09

- Added an Open in YummyTV action using the native `yummytv://details/{animeId}` deep link.
- Offer YummyTV when a selected source cannot be converted to a direct external-player stream.

## 0.20.6 — 2026-08-09

- Added VK playback by resolving active embeds to direct MP4 or HLS streams with quality selection.
- Reject unavailable or deleted VK videos before opening an external player.

## 0.20.5 — 2026-08-09

- Added Rutube HLS playback with master-playlist quality discovery.
- Forwarded resolved quality maps to Android players instead of keeping them only in the YummyAnime UI.

## 0.20.4 — 2026-08-09

- Added Sibnet playback by resolving its player page to a direct MP4 stream.
- Forwarded source-specific HTTP headers to supported Android external players.

## 0.20.3 — 2026-08-09

- Show video quality, source host and episode count as a compact subtitle under each dubbing option.
- Detect quality information embedded in player URLs.
- Add Aksor player resolution and external DASH (`.mpd`) playback support.

## 0.20.2 — 2026-08-08

- Always open dubbing/source and episode selection from the detail-card Watch action.
- Keep automatic episode resume exclusive to the dedicated Continue Watching section.

## 0.20.1 — 2026-08-08

- Resolve player pages through Lampa's native Android request bridge to avoid WebView CORS failures.
- Add CVH iframe resolution with direct signed MP4 qualities up to 1080p.
- Accept extensionless signed media URLs only after a trusted stream resolver has produced them.

## 0.20.0 — 2026-08-08

- Resolve Kodik iframe/player URLs into direct HLS streams before handing playback to an external Android player.
- Keep non-direct unsupported player pages blocked from external playback instead of passing iframe URLs as media files.

## 0.19.20 — 2026-08-08

- Send episode playback to external players only when the selected source exposes a direct media stream URL.
- Use Lampa's Android player bridge before raw Android bridge fallbacks and avoid sending iframe/player pages to VLC/MX-style players.

## 0.19.19 — 2026-08-08

- Route YummyAnime episode playback to external Android/Lampa player handlers instead of iframe or in-app browser pages.
- Pass episode playlist, resume time and poster metadata to the external player handoff.

## 0.19.18 — 2026-08-08

- Open trailers through a dedicated YummyAnime trailer list with visible YouTube icons.
- Route trailer playback to external Android/Lampa handlers instead of the internal iframe player.

## 0.19.17 — 2026-08-08

- Render the native-card YummyAnime action with a standalone logo image.
- Show that action only for cards identified as animation/anime and with a high-confidence YummyAnime title match.

## 0.19.16 — 2026-08-08

- Render the YummyAnime mark in the native Lampa-card action with an embedded SVG fallback that is independent of Lampa's button typography.

## 0.19.15 — 2026-08-08

- Fix schedule rendering: preserve release metadata while grouping items by day, preventing the page from failing during time sorting.

## 0.18.17 — 2026-08-08

- Open recommended titles directly in YummyAnime instead of showing a transient native Lampa-card lookup failure.
- Add the Lampa logo to the action that opens a title in the Lampa application.

## 0.18.16 — 2026-08-08

- Fix TMDB resolution when the proxy-aware Lampa source exposes `get` but not `search`.
- On an unresolved title with a MyAnimeList ID, retry TMDB matching using its English, Japanese and synonym titles.

## 0.18.15 — 2026-08-08

- Prefer the TMDB source used by Lampa online plugins and Cub TMDB Proxy when resolving YummyAnime titles; retain the modern Lampa TMDB API as fallback.

## 0.18.14 — 2026-08-08

- Remove the redundant More information action from the title page.
- Add concise console diagnostics for native Lampa TMDB resolution, so a failed proxy lookup and a failed card transition are distinguishable.

## 0.18.13 — 2026-08-08

- Place title actions directly after the synopsis and add a Trailers action that opens its list on demand.
- Remove the permanent trailers section from the title page.
- Keep every focused detail selector visible while moving both down and up the page.
- Resolve native Lampa cards through direct TV and movie TMDB searches before using Lampa's aggregate search fallback.

## 0.18.12 — 2026-08-08

- Use the complete YummyAnime detail aliases, including `other_titles`, before resolving a title through Lampa's native TMDB search.
- Keep the original catalog title as a fallback if the YummyAnime detail request is temporarily unavailable.

## 0.18.11 — 2026-08-08

- Added `YummyAnime` as the YummyAnime extension author in Lampa metadata.

## 0.18.10 — 2026-08-08

- Reworked YummyAnime-to-TMDB matching to use `Lampa.TMDB.search`, the same resolver as Lampa's own search screen, before opening the shared card and its standard player sources.

## 0.18.9 — 2026-08-08

- Added YummyAnime as a source in Lampa's global search, with opening through the known YummyAnime title id.
- Protected Alloha sources now open the official YummyAnime title page in Lampa Browser; this preserves the required referrer and signed-player session instead of failing in a raw iframe.

## 0.18.8 — 2026-08-08

- Restored safe YummyAnime-to-Lampa card matching through the current `Lampa.TMDB` API; all known title variants are checked and native detail is opened only with a valid TMDB id.
- Fall back to the YummyAnime detail page if no reliable TMDB match is available, rather than requesting `movie/undefined`.

## 0.18.7 — 2026-08-08

- Restored immediate loading of trailers, recommendations and comments on title details; community statistics and collections remain optional.

## 0.18.6 — 2026-08-08

- Enabled the native Lampa scroll viewport on every custom YummyAnime page, so focus movement scrolls the visible area instead of escaping below it.

## 0.18.5 — 2026-08-07

- Kept the focused item visible on every YummyAnime page by scrolling to each selector root instead of an inner text or icon node.

## 0.18.4 — 2026-08-07

- Added a final activity-level guard that redirects YummyAnime cards with a missing TMDB ID to the YummyAnime detail page before Lampa requests `movie/undefined`.

## 0.18.3 — 2026-08-07

- Prevented YummyAnime card clicks from also invoking Lampa's native TMDB handler with an undefined ID.
- Open schedule items in the stable YummyAnime detail page; native Lampa search remains an explicit action.
- Deferred optional detail sections until the user requests them, reducing memory and network pressure on Android devices.

## 0.18.2 — 2026-08-07

- Prevent opening a TMDB detail page when the matched card has no TMDB ID.

## 0.18.1 — 2026-08-07

- Restored the proven local detail-section renderer to fix card opening.

## 0.18.0 — 2026-08-07

- Added a detail-page timeout guard to prevent infinite loading.
- Continued splitting UI pages into independent components.

## 0.17.0 — 2026-08-07

- Added collections, personalized updates, watch synchronization and account reviews.
- Unified the plugin version source in `src/config.js`.

## 0.16.1 — 2026-08-07

- standard Lampa card matching now tries alternate YummyAnime titles one by one;
- matching still validates title similarity and release year before opening the shared card.

## 0.16.0 — 2026-08-07

- redesigned the YummyAnime home screen with responsive SVG icons, color accents, depth, arrows and clearer focus styling.

## 0.15.2 — 2026-08-07

- added an 8-second timeout for standard Lampa card matching;
- fall back to the YummyAnime detail page instead of leaving an endless loader.

## 0.15.1 — 2026-08-07

- changed action settings to button rows without `Да/Нет` or `undefined` values;
- moved home-section switches into a visually separated section at the bottom of settings.

## 0.15.0 — 2026-08-07

- added rating-service logos for card and detail rating badges;
- added AniList and Shikimori poster fallbacks after the primary/Jikan sources;
- synchronized the README, bilingual documentation and installation URL with the current release.

## 0.14.9 — 2026-08-07

- restored card focus, opening and action menus across supported Lampa card render signatures;
- added configurable visibility switches for YummyAnime home sections.

## 0.14.8 — 2026-08-07

- added home section visibility switches;
- added alternative-title search and poster fallback improvements.

## 0.12.1 — 2026-08-06

- fixed premature catalog completion when a full API page contains duplicate titles;
- failed pagination requests now retry the same offset instead of skipping a page;
- prevented duplicate requests for an offset already loaded by Lampa.

## 0.12.0 — 2026-08-06

- added read-only nested comment replies through `/comments/{id}/children`;
- added 20-item pagination for anime comments and reply threads;
- added comment markup cleanup and dislike counters.

## 0.11.0 — 2026-08-06

- added YummyAnime actions to standard Lampa detail cards;
- comments are now available without account authorization and use the actual `response.comments` payload;
- added comment authors, dates, likes and reply counts;
- consolidated watch, details, comments, favorites, lists and ratings into one reusable action menu.

## 0.10.0 — 2026-08-06

- added a Continue Watching catalog for the 20 most recently opened anime;
- history cards use standard Lampa detail pages when a safe match exists;
- standard cards now retain their exact YummyAnime mapping without a second API search.

## 0.9.0 — 2026-08-06

- YummyAnime catalog and schedule entries now open standard Lampa detail cards;
- matched titles are resolved through Lampa's built-in TMDB source by title and year;
- unmatched or ambiguous titles safely fall back to the YummyAnime detail view.

## 0.8.0 — 2026-08-06

- added local playback history for the last 100 anime;
- added one-click resume from the last opened episode and player;
- added episode duration and view counts to the episode selector;
- added a playback-history reset under YummyAnime settings.

## 0.7.0 — 2026-08-06

- added a preferred-player setting;
- remembered the last selected player and placed it first in the source list;
- kept every available player and dubbing visible for manual selection.

## 0.6.0 — 2026-08-06

- registered YummyAnime with Lampa Online when that module is available;
- added a YummyAnime playback button to matching standard Lampa cards;
- exposed every player, dubbing and episode returned by the YummyAnime API.

## 0.5.0 — 2026-08-06

- added YummyAnime dubbing and episode selection;
- added embedded playback for official iframe players;
- direct media URLs are handed to the native Lampa Player with a playlist.

## 0.4.1 — 2026-08-06

- clarified that YummyAnime login accepts a nickname or email.

## 0.4.0 — 2026-08-06

- added a Russian/English language selector under YummyAnime settings;
- localized the plugin interface, notifications, dates and YummyAnime API language header.

## 0.3.1 — 2026-08-06

- added 3-hour, day, week and month switches to the YummyStatus dashboard.

## 0.3.0 — 2026-08-06

- added a TV-friendly YummyStatus dashboard with five-minute monitoring snapshots.

## 0.2.0 — 2026-08-06

- account settings and read-only profile statistics;
- verified YummyAnime API request contracts;
- fixed genres, ratings, daily schedule and infinite catalog pagination;
- public catalog requests no longer send stale account Bearer tokens.

## 0.1.0 — 2026-08-06

- initial YummyAnime Lampa extension;
- anime catalog, search, genres and schedule;
- seven-day schedule grouped by date with local release time and episode numbers;
- all YummyAnime rating sources on catalog cards and anime details;
- infinite offset pagination for catalog, search, genres and top-rated lists;
- fixed YummyAnime genre response parsing and genre filter values;
- audited API routes and fixed JSON login plus numeric user-list IDs;
- moved YummyAnime login, token refresh and logout to settings;
- added read-only YummyAnime account profile and list statistics page;
- isolated public catalog requests from stale or invalid account Bearer tokens;
- ratings, favorites and user lists;
- YummyAnime account login and token refresh;
- read-only comments;
- anime details, trailers and recommendations;
- local API cache and API health check;
- bundled `dist/index.js` for Lampa installation;
- Russian and English documentation;
