# NBN Games — online game store

A front-end student project for **Web Technologies 1 (Front End)** by **Team Next Step**
(group SE-2503): Bekzat Amanbek · Nurkhan Nurzhau · Nursultan Rassulov.

NBN Games is a small digital game store: a catalog of 42 games with filters and search,
a page for every game, a cart with a 3-step checkout, a profile with demo accounts, and
an About page with an FAQ and a contact form. Everything is plain **HTML, CSS, Bootstrap 5,
JavaScript and jQuery** — no frameworks, no build tools, no TypeScript.

**Live site**

| Where | URL | Notes |
|---|---|---|
| GitHub Pages | https://bekzatic.github.io/nbn-games/ | static hosting; the contact form talks to the Vercel function |
| Vercel | https://nbngames-store.vercel.app | also runs the serverless function `api/contact.js` |
| Source | https://github.com/bekzatic/nbn-games | every push to `main` re-deploys both sites |

---

## Run it locally

The pages load their data with `fetch()` (`data/games.json`, `data/facts.json`), and
browsers don't allow that for files opened straight from disk (`file://`). So start a
small local web server in the project folder — any of these works:

```bash
python -m http.server 8000          # then open http://localhost:8000
```
```bash
npx serve .                         # Node.js
```
or the **Live Server** extension in VS Code (right-click `index.html` → *Open with Live Server*).

The contact form needs the serverless function, so locally it shows a clear error
message ("Server error…") unless you run it with the Vercel CLI: `npx vercel dev`.

Demo accounts for the profile page (they exist only in `js/profile.js` — see the warning there):
`bekzat@nbngames.kz / bekzat123` · `nurkhan@nbngames.kz / nurkhan123` · `nursultan@nbngames.kz / nursultan123`.
Promo code in the cart: **NEXTSTEP** (−10 %).

---

## Quick demo (about 2 minutes, e.g. for the defense)

1. **Home:** scroll down — the progress bar fills and the numbers count up; press **Load more games** and **New fact** (or the **F** key).
2. Switch **☀️ / 🌙** (Day / Night) and **EN → RU** in the navbar.
3. **Catalog:** choose *Гонки / Racing*, then type `for` in the search: the cards filter while you type, the matches are highlighted, and the dropdown suggests games (↓ + Enter chooses one). Copy the address — it keeps the filters.
4. Open a game → rate it ★, press **♡ Wishlist**, **🔗 Copy link** (✓ + "Copied to clipboard!"), click the cover (lightbox, **Esc** closes) and **Add to cart**.
5. **Cart:** copy and apply the promo code `NEXTSTEP`, then **Proceed to checkout** → 3 steps → confetti 🎉.
6. **About:** search the FAQ for `platform`; send the contact form (spinner, then a toast).
7. **Profile:** log in as `bekzat@nbngames.kz / bekzat123` → My games → ▶ Play.
8. Anywhere: type the **Konami code** ↑ ↑ ↓ ↓ ← → ← → B A for Retro mode; **M** mutes the sound.
9. Offline trick: in DevTools → Network block `code.jquery.com` and reload — the local jQuery copy loads and everything still works.

---

## Folder structure

```
nbn-games/
├── index.html            home: hero, carousel, popular games, "Load more", facts, stats, newsletter
├── catalog.html          42 games (cards built by JS) + filters, sort, search, autocomplete
├── game.html             one template for every game: game.html?id=elden-ring
├── cart.html             cart + 3-step checkout
├── profile.html          demo login, my games, wishlist, wallet, settings, security, notifications
├── about.html            team, FAQ with search, contact form
├── media-queries.html    media-queries demo page in plain CSS (no Bootstrap)
├── 404.html              "page not found" — GitHub Pages and Vercel show it for unknown addresses
│
├── css/
│   ├── theme.css             NBN colours + fonts on Bootstrap's CSS variables; Day theme; contrast fixes
│   ├── typography.css        responsive font sizes (media queries)
│   ├── components.css        our named classes: header, footer, hero, cards, carousel…
│   ├── features.css          UI of the JS features: toasts, stars, lightbox, checkout, confetti, retro mode
│   ├── jquery-features.css   UI of the jQuery features: search marks, autocomplete, progress bar, counters, copy, lazy images
│   └── media-queries.css     styles of media-queries.html only
│
├── js/
│   ├── theme-toggle.js       Day / Night theme (loaded first, so the page never flashes)
│   ├── jquery-fallback.js    loads js/vendor/jquery if the CDN is offline
│   ├── script.js             site-wide jQuery features + helpers (NBN.notify, NBN.highlight, NBN.withSpinner…)
│   ├── games-api.js          NBN.loadGames() — the one place that loads data/games.json
│   ├── catalog.js            catalog cards (renderCard), filters, sort, live search, URL
│   ├── jq-search.js          autocomplete, highlighting in the catalog, FAQ search
│   ├── game.js · home.js · cart-page.js · profile.js · about.js     one file per page
│   ├── cart.js · wishlist.js · recently-viewed.js                    shared data in localStorage
│   ├── main.js · popup.js · bg-color.js · datetime.js · keyboard-nav.js · i18n.js · sound.js · music.js
│   ├── accordion.js · contact-form.js · form-validation.js
│   └── vendor/jquery-4.0.0.min.js   local copy of jQuery
│
├── data/
│   ├── games.json            the ONLY list of games (42 objects) — used by every page
│   └── facts.json            "Did you know?" facts for the home page
├── api/contact.js            Vercel serverless function for the contact form (POST, JSON)
├── images/                   covers, logo (logo-full.png, logo-mark.png), favicon, team photos
├── vendor/bootstrap/         Bootstrap 5.3.3 (local)
└── vercel.json               clean URLs on Vercel
```

**How the scripts are loaded.** In every `<head>`: `theme-toggle.js` (no `defer` — the theme must be
set before the page is drawn), then jQuery 4.0.0 from the CDN with an SRI hash + `jquery-fallback.js`
(no `defer` — jQuery must exist first), then all our scripts with `defer`: the browser downloads them
right away and runs them **in the written order** after the HTML is parsed. Every page loads only the
scripts it uses (for example `accordion.js` and `contact-form.js` only on `about.html`).

---

## Features

### Site-wide (every page)

| Feature | How it works | File | Author |
|---|---|---|---|
| Day / Night theme ☀️ 🌙 | switches `data-bs-theme` on `<html>`, saved in localStorage, sends the `nbn:themechange` event | `js/theme-toggle.js`, `css/theme.css` | Bekzat Amanbek |
| Language EN / RU / KZ | walks all text nodes (`TreeWalker`) and replaces known texts; a `MutationObserver` translates cards added later; Russian plurals (1 игра / 2 игры / 5 игр) | `js/i18n.js` | Bekzat Amanbek |
| Sound effects 🔊 + **M** key | Web Audio API, no audio files; a new sound stops the previous one (no overlapping) | `js/sound.js` | Nursultan Rassulov |
| 8-bit background music 🎵 | our own chiptune written as arrays of notes (A minor, 96 BPM), off by default, follows the mute | `js/music.js` | Nursultan Rassulov |
| Toast notifications | `NBN.notify(text, type)` — `.fadeIn()`, timer line, `.fadeOut()`, hover pauses, max 4 | `js/script.js` | Team |
| Scroll progress bar | width = `scrollTop / (page − window) × 100`, gradient + glow, % bubble | `js/script.js` | Team |
| Cart badge + "+1" animation | cart array in localStorage; one delegated click handler for every "Add to cart" button | `js/cart.js` | Nursultan Rassulov |
| Wishlist ♥ counter | `Wishlist` object (`all`, `has`, `toggle`, `remove`) in localStorage | `js/wishlist.js` | Nursultan Rassulov |
| Keyboard menu | ← → ↑ ↓ Home End move focus in the main menu (`keydown` + `switch`) | `js/keyboard-nav.js` | Nurkhan Nurzhau |
| Konami code ↑↑↓↓←→←→BA | turns Retro mode on / off | `js/keyboard-nav.js`, `css/features.css` | Nurkhan Nurzhau |
| Subscribe popup | Bootstrap modal markup, our own open / close (×, outside click, Esc), focus trap, spinner on submit | `js/popup.js` | Nurkhan Nurzhau |
| Change background 🎨 | cycles predefined colours (dark list at night, light list by day), smooth transition | `js/bg-color.js` | Nursultan Rassulov |
| Live date & time | `Date` object, updated every second | `js/datetime.js` | Bekzat Amanbek |
| Scroll reveal | sections slide in when they appear (`IntersectionObserver`), off for "reduce motion" | `js/main.js` | Nurkhan Nurzhau |
| Back-to-top button | appears after 400 px of scrolling | `js/main.js` | Nurkhan Nurzhau |

### Home — `index.html` (page author: Nurkhan Nurzhau)

| Feature | How it works | File |
|---|---|---|
| Greeting by time of day | a `switch` picks the text | `js/home.js` |
| Featured carousel, popular games | Bootstrap carousel and cards | `index.html` |
| **Load more games** | `NBN.loadGames()` (async/await), loading spinner, 4 new cards per click, error message + "Try again" | `js/home.js`, `js/games-api.js` |
| Random gaming fact (button or **F** key) | `fetch('data/facts.json')` with async/await + try/catch; a `while` loop never repeats the last fact; offline facts if the file can't be loaded | `js/home.js` |
| Animated counters ("NBN Games in numbers") | jQuery `.animate()` on `{ value: 0 }` with a `step` callback, starts when the number scrolls into view | `js/script.js` |
| Recently viewed | array of game ids in localStorage, newest first, max 4 | `js/recently-viewed.js` |
| Newsletter | spinner + "Please wait…", then a toast | `js/home.js`, `js/script.js` |

### Catalog — `catalog.html` (page author: Bekzat Amanbek)

| Feature | How it works | File |
|---|---|---|
| Cards built from data | `renderCard(game)` turns each object of `data/games.json` into a Bootstrap card (a game with `oldPrice` gets a "Sale" badge and the old price crossed out); `renderCatalog()` groups them by genre; loading state + error message with "Try again" | `js/catalog.js` |
| Filters: genre, platform, price | one `state` object; jQuery `.filter()` keeps the matching cards, `.not()` hides the rest; `switch` for the price range; a "Reset filters" link appears next to the counter while a filter is on | `js/catalog.js` |
| Live search | filters on every key (`.on('keyup input')`); **/** focuses the box, **Esc** or the **×** button clears it | `js/catalog.js` |
| Sort | price ↑ ↓, A → Z (a `switch` returns the compare function) | `js/catalog.js` |
| Shareable filters | filters are saved in the address (`?genre=rpg&q=witcher`) with `URLSearchParams`; the tab title follows them ("NBN Games — Catalog: RPG") | `js/catalog.js` |
| Autocomplete | up to 6 suggestions with cover, genre and price; ↑ ↓ Enter Esc or mouse; ARIA combobox | `js/jq-search.js` |
| Search highlighting | `NBN.highlight()`: `.html()` resets the text, a RegExp splits it, every match is `.wrap()`-ped in `<mark>` | `js/script.js`, `js/jq-search.js` |
| Lazy loading of covers | `data-src` → `.attr('src')` when `.offset().top` comes near the window (on `.scroll()`); "🖼 9 / 42 covers loaded" | `js/script.js` |

### Game page — `game.html?id=…` (page author: Nursultan Rassulov)

| Feature | How it works | File |
|---|---|---|
| One template for 42 games | reads `?id=` and fills the page from `data/games.json`; "Game not found" / "Could not load" messages | `js/game.js` |
| Rating ★★★★★ | click / hover / arrow keys, saved per game in localStorage | `js/game.js` |
| Read more | extra info shown / hidden with `style.display` | `js/game.js` |
| Cover lightbox | overlay made with `createElement`; opens on click / Enter, closes with ×, outside click, Esc | `js/game.js` |
| Wishlist ♡ and Copy link | `Wishlist.toggle()`; the copy button shows ✓ + "Copied to clipboard!" | `js/game.js`, `js/script.js` |
| System requirements, similar games | Bootstrap table; 3 games of the same genre | `js/game.js` |

### Cart — `cart.html` (page author: Nursultan Rassulov)

| Feature | How it works | File |
|---|---|---|
| Quantity − / +, Remove | event delegation + `switch` on the button's action | `js/cart-page.js` |
| Promo code **NEXTSTEP** | −10 %, with a copy button and `.on('copy')` for Ctrl+C | `js/cart-page.js`, `js/script.js` |
| 3-step checkout | Contacts → Delivery & payment → Confirm; `showStep()` callback; the `order` object keeps every value; confetti at the end (demo, no real payment) | `js/cart-page.js` |

### Profile — `profile.html` (page author: Bekzat Amanbek)

| Feature | How it works | File |
|---|---|---|
| Demo login | ⚠️ client-side demo only (see the comment in the file); spinner while "checking", toast after | `js/profile.js` |
| Sign-up form validation | every rule in JavaScript, error text under each field, re-checked while typing | `js/form-validation.js` |
| My games + ▶ Play | progress bar 0 → 100 %, play counter text from a `switch` | `js/profile.js` |
| Wishlist, wallet top-up, settings, password change, notifications | render functions with `map()`, data saved per user in localStorage | `js/profile.js` |

### About — `about.html` (page author: Nurkhan Nurzhau)

| Feature | How it works | File |
|---|---|---|
| FAQ accordion | Bootstrap markup, our own jQuery: delegated click, `.slideDown()` / `.slideUp()`, one open at a time | `js/accordion.js` |
| FAQ search | highlights matches in questions + answers, opens the matching answers, counts matches | `js/jq-search.js` |
| Contact form | JS validation → `fetch` POST (async/await, try/catch, 10 s timeout) to `api/contact.js`; spinner; clear message for every error | `js/contact-form.js`, `api/contact.js` |
| Show current time | `new Date().toLocaleTimeString()`; a `switch` tells whether the office is open | `js/about.js` |
| Copy buttons | address, email, promo code → ✓ + tooltip + toast | `js/script.js` |

### Media queries demo — `media-queries.html` (page author: Bekzat Amanbek)

Plain CSS without Bootstrap: responsive typography and a 3 → 2 → 1 card group built only with `@media`
rules (`css/media-queries.css`). Linked from the footer ("Media queries demo").

---

## Quality checks

- **HTML:** W3C Nu validator — 0 errors, 0 warnings on all 7 pages and on the pages after JavaScript has built them.
- **Accessibility:** axe-core (WCAG 2.1 AA) — 0 issues in both themes, including the logged-in profile, the checkout, the popup and the autocomplete. Every image has `alt`, every field a label, icon buttons have `aria-label`, current page = `aria-current`.
- **Responsive:** no horizontal scrolling at 360 px, 768 px and 1280 px (all pages and states).
- **Console:** only `jQuery is ready!`, no errors.
- **Offline:** if the jQuery CDN is unreachable, the local copy loads and everything still works.

---

## Team — who did what

| Member | Pages | Main features |
|---|---|---|
| **Bekzat Amanbek** | `catalog.html`, `profile.html`, `media-queries.html` | catalog filters / search / sort / URL, Day–Night theme, language selector, sign-up validation, date & time, profile (login, play counter) |
| **Nurkhan Nurzhau** | `index.html`, `about.html` | home page (greeting, Load more, facts, recently viewed), FAQ accordion, contact form, subscribe popup, keyboard menu + Konami code, scroll reveal, back to top |
| **Nursultan Rassulov** | `game.html`, `cart.html` | game page (rating, read more, lightbox), cart + checkout, wishlist, sound effects, background music, change background, game data |
| **Together** | — | jQuery features in `js/script.js` / `js/jq-search.js` (toasts, progress bar, counters, spinner, copy buttons, lazy loading, autocomplete, highlighting), design, testing |

Bootstrap components on the pages: Bekzat — grid with sidebar, nav-pills filters, cards grid, profile forms,
switches, list groups; Nurkhan — navbar, carousel, card-group, contact form; Nursultan — breadcrumb, buttons
and button groups, table, input-group promo form.
