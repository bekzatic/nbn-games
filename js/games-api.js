/* ==========================================================
   Game data — the ONE place that loads data/games.json.
   Data: Nursultan Rassulov

   data/games.json is the only list of games on the site (42 objects:
   { id, title, genre, genreLabel, emoji, img, price, oldPrice,
     platforms[], developer, year, rating, reviews, description, req }).
   The catalog, the game page, "Load more" and "Recently viewed" all
   get it through NBN.loadGames(), so there is nothing to keep in sync.

   Note: fetch() needs a web server (Live Server, python -m http.server,
   Vercel, GitHub Pages). Opened from disk (file://) the request fails
   and every page shows its "could not load" message.
   ========================================================== */

window.NBN = window.NBN || {};

(function () {
  'use strict';

  let request = null;   // one Promise per page → the file is downloaded only once

  /* Returns a Promise with the array of games.
     async/await: we wait for fetch() without freezing the page.
     A 404 / 500 answer is turned into an error, so the caller's
     try/catch handles it the same way as "no internet". */
  NBN.loadGames = function () {
    if (!request) {
      request = (async function () {
        const response = await fetch('data/games.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })();
      request.catch(function () { request = null; });   // after an error the next call tries again
    }
    return request;
  };

  // one icon per genre (Bootstrap Icons) — the same on every page instead of emoji
  const GENRE_ICONS = { action: 'crosshair', adventure: 'compass', rpg: 'shield-shaded', strategy: 'grid-3x3-gap',
                        simulation: 'buildings', sport: 'dribbble', racing: 'speedometer2' };
  NBN.genreIcon = function (genre) {
    return `<i class="bi bi-${GENRE_ICONS[genre] || 'controller'}" aria-hidden="true"></i>`;
  };

  // platform → icon; the name is kept for screen readers (and for the catalog search)
  const PLATFORM_ICONS = { Windows: 'windows', macOS: 'apple', PlayStation: 'playstation', Xbox: 'xbox' };
  NBN.platformIcons = function (platforms) {
    return '<span class="platform-icons">' + platforms.map(p =>
      `<i class="bi bi-${PLATFORM_ICONS[p] || 'display'}" title="${p}" aria-hidden="true"></i><span class="visually-hidden">${p}</span>`
    ).join('') + '</span>';
  };

  // 0 → "Free", 14999 → "14 999 ₸" (the same format on every page)
  NBN.formatPrice = function (price) {
    return price === 0 ? 'Free' : price.toLocaleString('en-US').replace(/,/g, ' ') + ' ₸';
  };
})();
