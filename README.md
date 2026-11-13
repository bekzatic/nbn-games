# NBN Games — online game store

A front-end student project for **Web Technologies 1 (Front End)** by **Team Next Step**
(group SE-2503): Bekzat Amanbek · Nurkhan Nurzhau · Nursultan Rassulov.

NBN Games is a small digital game store: a catalog of 42 games with filters and search,
a page for every game, a cart with a 3-step checkout, a profile with demo accounts, and
an About page with an FAQ and a contact form. Everything is plain **HTML, CSS, Bootstrap 5,
JavaScript and jQuery** — no frameworks, no build tools, no TypeScript.

**Target audience:** students and young gamers in Kazakhstan (prices in ₸, interface in
English / Russian / Kazakh) who want a quick way to find a game, compare its price with other
stores and buy a digital key.

**External public API:** [CheapShark](https://www.cheapshark.com/api/1.0/) (free, no key) —
"Live deals" on the home page and "Prices in other stores" on every game page (`js/deals-api.js`).

**Accounts:** sign up and log in work in the browser only — users are saved in
`localStorage` (`nbn-users`, `nbn-current-user`). ⚠️ Storing passwords like this is unsafe;
it is done only to demonstrate the idea in a learning project (see the comment in `js/auth.js`).

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
├── deals.html            live deals from 30+ stores (CheapShark API): store / price / sort filters
├── media-queries.html    old study page (plain CSS, no Bootstrap) — not in the navigation any more
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
│   ├── deals-api.js          CheapShark public API: live deals + prices in other stores (cache 10 min)
│   ├── deals-page.js         deals.html: filters + "Show more deals"
│   ├── validators.js         isEmail, isStrongPassword, isPhone, isRequired + errors under the fields
│   ├── auth.js               sign up / log in / log out in localStorage, user name in the navbar
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
├── vendor/bootstrap-icons/   Bootstrap Icons 1.11.3 (local) — the ONE icon set of the site
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
| Cart badge + "+1" animation | cart array in localStorage; one delegated click handler for every "Add to cart" button; max 10 keys per game (`MAX_QTY`) | `js/cart.js` | Nursultan Rassulov |
| Wishlist ♥ counter | `Wishlist` object (`all`, `has`, `toggle`, `remove`) in localStorage | `js/wishlist.js` | Nursultan Rassulov |
| Keyboard menu | ← → ↑ ↓ Home End move focus in the main menu (`keydown` + `switch`) | `js/keyboard-nav.js` | Nurkhan Nurzhau |
| Konami code ↑↑↓↓←→←→BA | turns Retro mode on / off | `js/keyboard-nav.js`, `css/features.css` | Nurkhan Nurzhau |
| **?** = shortcut list | a toast lists all keyboard shortcuts (not while typing in a field) | `js/keyboard-nav.js` | Team |
| Subscribe popup | Bootstrap modal markup, our own open / close (×, outside click, Esc), focus trap, spinner on submit | `js/popup.js` | Nurkhan Nurzhau |
| Change background 🎨 | cycles predefined colours (dark list at night, light list by day), smooth transition | `js/bg-color.js` | Nursultan Rassulov |
| Live date & time | `Date` object, updated every second | `js/datetime.js` | Bekzat Amanbek |
| Scroll reveal | sections slide in when they appear (`IntersectionObserver`), off for "reduce motion" | `js/main.js` | Nurkhan Nurzhau |
| Back-to-top button | appears after 400 px of scrolling | `js/main.js` | Nurkhan Nurzhau |

### Forms — the same rules everywhere (`js/validators.js`)

Every `<form>` has `novalidate` and **no** HTML validation attributes (`required`, `pattern`,
`minlength`, `maxlength`, `min`, `max`, `type="email"` — emails are `type="text" inputmode="email"`).
JavaScript checks the fields; the error text appears under the field (Bootstrap `.is-invalid` +
`.invalid-feedback`, never `alert`), the first wrong field gets the focus, and after the first
submit every field is re-checked while typing. Forms: newsletter, subscribe popup, sign up, log in,
settings, change password, wallet top-up, contact, promo code, checkout (with phone).

### Home — `index.html` (page author: Nurkhan Nurzhau)

| Feature | How it works | File |
|---|---|---|
| Greeting by time of day | a `switch` picks the text | `js/home.js` |
| Featured carousel, popular games | Bootstrap carousel and cards | `index.html` |
| **Load more games** | `NBN.loadGames()` (async/await), loading spinner, 4 new cards per click, error message + "Try again" | `js/home.js`, `js/games-api.js` |
| Random gaming fact (button or **F** key) | `fetch('data/facts.json')` with async/await + try/catch; a `while` loop never repeats the last fact; offline facts if the file can't be loaded | `js/home.js` |
| Animated counters ("NBN Games in numbers") | jQuery `.animate()` on `{ value: 0 }` with a `step` callback, starts when the number scrolls into view | `js/script.js` |
| Recently viewed | array of game ids in localStorage, newest first, max 4 | `js/recently-viewed.js` |
| **Live deals** (public API) | `GET /deals?pageSize=8&sortBy=Savings` from CheapShark with async/await; skeleton while loading, error + "Retry", "no deals" state; cached 10 min in localStorage | `js/deals-api.js` |
| Newsletter | spinner + "Please wait…", then a toast | `js/home.js`, `js/script.js` |

### Catalog — `catalog.html` (page author: Bekzat Amanbek)

| Feature | How it works | File |
|---|---|---|
| Cards built from data | `renderCard(game)` turns each object of `data/games.json` into a Bootstrap card (a game with `oldPrice` gets a "Sale" badge and the old price crossed out; every card shows its rating ★); `renderCatalog()` groups them by genre; loading state + error message with "Try again" | `js/catalog.js` |
| Filters: genre, platform, price | one `state` object; jQuery `.filter()` keeps the matching cards, `.not()` hides the rest; `switch` for the price range; a "Reset filters" link appears next to the counter while a filter is on | `js/catalog.js` |
| Live search | searches titles, platforms and developers (`data-developer`); filters on every key (`.on('keyup input')`); **/** focuses the box, **Esc** or the **×** button clears it | `js/catalog.js` |
| Sort | price ↑ ↓, A → Z, rating (a `switch` returns the compare function) | `js/catalog.js` |
| Shareable + remembered filters | filters are saved in the address (`?genre=rpg&q=witcher`) with `URLSearchParams` and in localStorage ("nbn-catalog-filters") — coming back to the catalog restores the last search and filters; the tab title follows them ("NBN Games — Catalog: RPG") | `js/catalog.js` |
| Autocomplete | up to 6 suggestions (by title or developer) with cover, genre and price; ↑ ↓ Enter Esc or mouse; ARIA combobox | `js/jq-search.js` |
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
| System requirements, similar games | Bootstrap table; the 3 best-rated games of the same genre (`filter` → `sort` → `slice`) | `js/game.js` |
| **Prices in other stores** (public API) | CheapShark `GET /games?title=…` → `GET /games?id=…` + `/stores`: price in every store, best price first; loading / error + "Retry" / "not found" states | `js/deals-api.js` |
| Developer and platform links | the developer opens the catalog with all their games (`catalog.html?q=…`), a platform badge with that platform filter (`?platform=xbox`) | `js/game.js` |

### Cart — `cart.html` (page author: Nursultan Rassulov)

| Feature | How it works | File |
|---|---|---|
| Quantity − / +, Remove | event delegation + `switch` on the button's action; max 10 keys per game | `js/cart-page.js` |
| Promo code **NEXTSTEP** | −10 %, kept in `sessionStorage` (survives a reload); copy button and `.on('copy')` for Ctrl+C | `js/cart-page.js`, `js/script.js` |
| 3-step checkout | Contacts → Delivery & payment → Confirm; `showStep()` callback; the `order` object keeps every value; confetti at the end (demo, no real payment) | `js/cart-page.js` |

### Profile — `profile.html` (page author: Bekzat Amanbek)

| Feature | How it works | File |
|---|---|---|
| Sign up | name, email, phone (+7 7XX XXX XX XX), password (8+ characters with a letter, a digit and a special character) + strength meter; the user is saved in `localStorage` "nbn-users"; an email can be used only once; logged in right away | `js/form-validation.js`, `js/auth.js` |
| Log in / log out | checks "nbn-users" (the 3 demo accounts still work); the user is kept in "nbn-current-user" until "Log out"; the navbar shows the name on every page; 👁 shows / hides the password. ⚠️ client-side demo only | `js/profile.js`, `js/auth.js` |
| Profile data | name, email, phone and registration date of the logged-in user | `js/profile.js` |
| My games + ▶ Play | progress bar 0 → 100 %, play counter text from a `switch` | `js/profile.js` |
| Wishlist, wallet top-up, settings, password change, notifications | render functions with `map()`, data saved per user in localStorage | `js/profile.js` |

### About — `about.html` (page author: Nurkhan Nurzhau)

| Feature | How it works | File |
|---|---|---|
| FAQ accordion | Bootstrap markup, our own jQuery: delegated click, `.slideDown()` / `.slideUp()`, one open at a time | `js/accordion.js` |
| FAQ search | highlights matches in questions + answers, opens the matching answers, counts matches | `js/jq-search.js` |
| Contact form | JS validation (+ live "8 / 10 characters" counter) → `fetch` POST (async/await, try/catch, 10 s timeout) to `api/contact.js`; spinner; clear message for every error | `js/contact-form.js`, `api/contact.js` |
| Show current time | `new Date().toLocaleTimeString()`; a `switch` tells whether the office is open | `js/about.js` |
| Copy buttons | address, email, promo code → ✓ + tooltip + toast | `js/script.js` |

### Deals — `deals.html` (Team Next Step)

| Feature | How it works | File |
|---|---|---|
| Live deals (public API) | CheapShark `GET /deals` with store (`/stores`), max price and sort filters; 12 per page + "Show more deals"; skeleton / error + "Retry" / "no deals" states | `js/deals-page.js`, `js/deals-api.js` |

### Media queries demo — `media-queries.html` (page author: Bekzat Amanbek)

Plain CSS without Bootstrap: responsive typography and a 3 → 2 → 1 card group built only with `@media`
rules (`css/media-queries.css`). An old study page: it is kept in the project, but it is no longer linked
from the shop (the Deals page took its place in the navigation).

---

## Design system

- **Tokens** in `css/theme.css` for both themes: colours (bg, surface, text, muted, accent, accent-hover,
  border, success, danger), shadows, radii, the spacing scale 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px,
  section spacing (40 px on phones, 64 px from 768 px) and animation timings (150 / 200 / 300 ms, ease-out).
  The other CSS files use only these variables.
- **Fonts:** Space Grotesk (headings) + Inter (text); paragraphs are at most ~70 characters wide.
- **Header:** sticky, with a blur that gets stronger after scrolling; Day / Night switch (sun / moon);
  ⚙ Settings menu with language, sound and music; wishlist, cart and profile with counters; the current
  page is highlighted.
- **Icons:** Bootstrap Icons everywhere (genres, platforms, menus, empty states, toasts) — no emoji icons.
- **Light theme:** its own warm grey page with white cards, soft shadows and a darker orange (WCAG AA).
- **Micro-interactions:** buttons lift on hover and press in on click, cards lift and zoom the cover,
  the gear turns, the cart badge and the wishlist heart pop, sections slide in (20 px) when they appear.
  Nothing loops forever, and everything is off with "reduce motion".

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
