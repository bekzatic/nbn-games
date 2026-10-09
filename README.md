# NBN Games — online game store

Student project by **Team Next Step**: Bekzat Amanbek · Nurkhan Nurzhau · Nursultan Rassulov.

**Live site:** https://nbngames-store.vercel.app

## Assignment #3 — Media Queries + Bootstrap Grid

Bootstrap 5.3.3 is included locally (`vendor/bootstrap/`). Layout, spacing and all components
(navbar, grid, cards, carousel, forms, accordion, toast) are Bootstrap. Our own styles are split
into three small files:

| File | What's inside |
|---|---|
| `css/theme.css` | NBN colours and fonts, set through Bootstrap's CSS variables |
| `css/typography.css` | Task 1 — responsive font sizes with media queries |
| `css/components.css` | named classes for the NBN look: `.hero`, `.game-card`, `.value-card`, `.wallet-card`, `.site-footer`, `.featured-carousel`... (no margins/paddings — spacing is Bootstrap `m-*`/`p-*`) |

### Part 1 — Media Queries (no Bootstrap)

| Task | Where |
|---|---|
| 1. Responsive typography (mobile / tablet / desktop) | `media-queries.html` + `css/media-queries.css`; also site-wide in `css/typography.css` |
| 2. Card group: 3 in a row → 2 → stacked | `media-queries.html` → "Deals of the week", `css/media-queries.css` |

### Part 2 — Bootstrap

| Task | Where |
|---|---|
| 3. Grid layout (`container`, `col-lg-6`, `col-lg-4`, `col-sm/md/lg`) | `index.html` hero (2 × `col-lg-6`), "Why NBN Games" (3 × `col-lg-4`); `about.html`; `catalog.html` / `profile.html` sidebar `col-lg-3` + `col-lg-9` |
| 4. Spacing utilities (`m-*`, `p-*`, `mt-lg-4`, `px-sm-2`, `py-lg-5`…) | every page |
| 5. Navbar with 4+ links and `navbar-toggler` | header on every Bootstrap page |
| 6. Buttons (`btn-primary`, `btn-outline-*`, `btn-lg`, `btn-sm`) and `btn-group` | cards on every page, `game.html`, `profile.html` wallet, `about.html` |
| 7. Carousel — 9 games, indicators + controls | `index.html` → Featured games |
| 8. Cards with image, title, text in `.card-group` | `index.html` → Popular games; grid of cards in `catalog.html` |
| 9. Forms (`form-control`, `form-select`, `input-group`, `form-check`) | `about.html` contact form, `profile.html`, `cart.html` promo code |
| 10. Accessibility | semantic `<header> <nav> <main> <footer> <button>`, `aria-*` labels, alt texts, contrast-checked colours |

### Who did what (Bootstrap components on two pages each)

- **Bekzat Amanbek** — `catalog.html`, `profile.html`, `media-queries.html`: grid with sidebar, nav-pills filters, cards grid, profile forms, switches, list groups.
- **Nurkhan Nurzhau** — `index.html`, `about.html`: navbar, carousel, card-group, contact form with validation.
- **Nursultan Rassulov** — `game.html`, `cart.html`: breadcrumb, buttons and button groups, table, input-group promo form.

## Extras

- FAQ accordion on the About page
- Newsletter block on the home page (input-group + toast)
- "Sale" badge on discounted games, hover effects on cards
- Back-to-top button

## Pages

- `index.html` — home: hero, featured carousel, popular games, why NBN
- `catalog.html` — 42 games with genre / platform / price filters
- `game.html?id=...` — one template page for every game
- `cart.html` — cart (localStorage), promo code NEXTSTEP
- `profile.html` — login, library, wallet, settings, security, notifications
- `about.html` — team and contact form
- `media-queries.html` — Part 1 of Assignment #3 (pure CSS)

Demo accounts: bekzat@nbngames.kz / bekzat123 · nurkhan@nbngames.kz / nurkhan123 · nursultan@nbngames.kz / nursultan123
