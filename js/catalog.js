/* ==========================================================
   catalog.html — game cards, filters, search and sorting
   Author: Bekzat Amanbek

   How it works (the file goes in this order):
   1. Building the cards — the cards are NOT written in the HTML:
      start() loads data/games.json (NBN.loadGames in js/games-api.js),
      renderCard(game) turns one game object into one Bootstrap card
      (Sale badge + old price, ★ rating, data-* attributes for the
      filters), renderCatalog() groups the cards by genre.
   2. Filtering and sorting — `state` (one object) keeps the filters.
      refresh() shows the matching cards with jQuery .filter(), hides
      the rest with .not(), sorts them (a `switch` picks the compare
      function: price, name, rating) and updates the counter, the
      "Reset filters" link, the × button and the tab title.
      The search looks at the title, platforms and developer.
   3. Filters <-> address bar — ?genre=rpg&price=low&q=witcher&sort=rating
      is saved after every change and read on load, so a filtered
      catalog can be shared as a link. The same string is kept in
      localStorage ("nbn-catalog-filters"): coming back to catalog.html
      without filters in the address restores the last search + filters.
   4. Events — filter buttons (one delegated handler), live search
      (.on('keyup input')), sort, keyboard ("/" focuses the search,
      Escape clears it), reset buttons.
   5. Start — loading message → cards, or an error with "Try again".
   Autocomplete and highlighting are in js/jq-search.js.
   ========================================================== */

(function () {
  'use strict';

  const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';   // 1×1 empty gif until lazy loading swaps it
  const esc = NBN.escapeHtml;    // text from the data goes into HTML → escape <, >, ", &

  const $content = $('#catalog-content');
  const $count = $('#results-count');
  const $empty = $('#empty-state');
  const $search = $('#catalog-search');
  const $clear = $('#search-clear');        // the × button next to the search box
  const $sort = $('#catalog-sort');
  const $filterLists = $('#genre-filter, #platform-filter, #price-filter');

  let $cols = $();               // all cards — filled after the data is loaded
  let $sections = $();           // one <section> per genre

  // the current filters — one object instead of many variables
  const state = { genre: 'all', price: 'all', platform: 'all', search: '', sort: 'default' };
  const DEFAULTS = Object.assign({}, state);

  /* ---------- building the cards ---------- */

  // the same three ranges as the "Price" filter buttons
  function priceBand(price) {
    if (price < 5000) return 'low';
    if (price <= 10000) return 'mid';
    return 'high';
  }

  // one game object → the HTML of one catalog card
  function renderCard(game) {
    const title = esc(game.title);
    const band = priceBand(game.price);
    // a game with oldPrice is on sale: the same "Sale" badge as on the home page + the old price crossed out
    const sale = game.oldPrice ? '<span class="sale-badge badge text-bg-primary position-absolute top-0 start-0 m-2">Sale</span>' : '';
    // "★ 4.9" on the right of the price row (the star is decoration, screen readers hear the words)
    const rating = `<span class="small fw-normal text-body-secondary text-nowrap"><span class="card-rating-star" aria-hidden="true">★</span> <span aria-hidden="true">${game.rating.toFixed(1)}</span><span class="visually-hidden">Rating ${game.rating.toFixed(1)} out of 5</span></span>`;
    const buyLabel = game.price === 0 ? 'Get for free' : 'Add to cart';   // same words as on the game page
    const oldPrice = game.oldPrice ? `<span class="text-decoration-line-through text-body-tertiary small fw-normal">${NBN.formatPrice(game.oldPrice)}</span>` : '';
    return `
      <div class="col game-col" data-genre="${game.genre}" data-platform="${game.platforms.join(' ').toLowerCase()}" data-price="${band}" data-rating="${game.rating}" data-developer="${esc(game.developer)}">
        <article class="card game-card h-100">
          <a href="game.html?id=${game.id}" class="d-flex flex-column flex-grow-1 text-reset text-decoration-none">
            ${sale}<div class="ratio ratio-16x9"><img class="card-img-top object-fit-cover lazy" src="${PLACEHOLDER}" data-src="${game.img}" alt="${title} cover"></div>
            <div class="card-body d-flex flex-column gap-1 p-3">
              <h3 class="card-title h6 fw-bold mb-0">${title}</h3>
              <!-- title → genre + platforms (icons) → rating → price -->
              <div class="card-text small text-body-secondary d-flex align-items-center justify-content-between gap-2">
                <span class="d-inline-flex align-items-center gap-1">${NBN.genreIcon(game.genre)} ${game.genreLabel}</span>${NBN.platformIcons(game.platforms)}
              </div>
              ${rating}
              <div class="d-flex align-items-center flex-wrap gap-2 fw-semibold mt-auto pt-2"><span class="price-dot price-dot--${band}" aria-hidden="true"></span>${NBN.formatPrice(game.price)}${oldPrice}${sale ? `<span class="badge text-bg-primary">−${Math.round((1 - game.price / game.oldPrice) * 100)}%</span>` : ''}</div>
            </div>
          </a>
          <div class="card-footer border-0 px-3 pb-3 pt-0">
            <div class="btn-group btn-group-sm w-100" role="group" aria-label="${title} actions">
              <button type="button" class="btn btn-primary add-to-cart-btn" data-name="${title}" data-price="${game.price}" data-img="${game.img}">${buyLabel}</button>
              <a href="game.html?id=${game.id}" class="btn btn-outline-light">Details</a>
            </div>
          </div>
        </article>
      </div>`;
  }

  // groups the games by genre (in the order they come in the data) → one <section> per genre
  function renderCatalog(games) {
    const genres = [];
    games.forEach(game => {
      if (!genres.some(g => g.genre === game.genre)) genres.push(game);
    });
    return genres.map(first => `
      <section class="mb-5" data-genre-section="${first.genre}" aria-label="${first.genreLabel} games">
        <h2 class="h4 d-flex align-items-center gap-2 mb-3"><span class="text-primary">${NBN.genreIcon(first.genre)}</span><span>${first.genreLabel}</span></h2>
        <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3 g-md-4">
          ${games.filter(g => g.genre === first.genre).map(renderCard).join('')}
        </div>
      </section>`).join('');
  }

  /* ---------- filtering and sorting ---------- */

  const priceOf = col => Number($(col).find('.add-to-cart-btn').attr('data-price'));
  const titleOf = col => $(col).find('.card-title').text();

  // price range filter with a switch
  function matchesPrice(col) {
    const price = priceOf(col);
    switch (state.price) {
      case 'low':  return price < 5000;
      case 'mid':  return price >= 5000 && price <= 10000;
      case 'high': return price > 10000;
      default:     return true;               // 'all'
    }
  }

  // sort order with a switch — returns a compare function for Array.sort
  function compareBy(sort) {
    switch (sort) {
      case 'price-asc':  return (a, b) => priceOf(a) - priceOf(b);
      case 'price-desc': return (a, b) => priceOf(b) - priceOf(a);
      case 'name':       return (a, b) => titleOf(a).localeCompare(titleOf(b));
      case 'rating':     return (a, b) => b.dataset.rating - a.dataset.rating;   // the best rated first (data-rating on the card)
      default:           return (a, b) => a.dataset.order - b.dataset.order;   // the order from the data
    }
  }

  // does this card pass all four filters?
  function isVisible(col) {
    const okGenre = state.genre === 'all' || col.dataset.genre === state.genre;
    const okPlatform = state.platform === 'all' || col.dataset.platform.split(' ').includes(state.platform);
    // the search looks at the card text (title, platforms) AND the developer, which is not shown on the card
    const searchable = (col.textContent + ' ' + col.dataset.developer).toLowerCase();
    const okSearch = !state.search || searchable.includes(state.search);
    return okGenre && okPlatform && okSearch && matchesPrice(col);
  }

  // shows / hides / sorts the cards for the current `state` and updates the counter
  function refresh() {
    $clear.prop('hidden', !$search.val());         // × only when there is something to clear
    // "Reset filters" next to the counter only while a filter or a search is on
    const filtered = state.genre !== 'all' || state.platform !== 'all' || state.price !== 'all' || state.search !== '';
    $('#clear-filters').prop('hidden', !filtered);
    if (!$cols.length) return;                     // the data is not loaded yet

    // 1) jQuery .filter() keeps only the cards that match, .not() gives the rest
    const $match = $cols.filter(function () { return isVisible(this); });
    $match.filter('[hidden]').each(function () {   // a card comes back → small fade-in animation
      this.classList.remove('fade-in-up');
      void this.offsetWidth;                       // restart the CSS animation
      this.classList.add('fade-in-up');
    });
    $match.prop('hidden', false);
    $cols.not($match).prop('hidden', true);

    // 2) sort the cards inside each genre row; hide a genre with no visible cards
    $sections.each(function () {
      const $row = $(this).find('.row');
      $row.children().get().sort(compareBy(state.sort)).forEach(col => $row.append(col));
      this.hidden = !$(this).find('.game-col:not([hidden])').length;
    });

    // 3) count the visible cards with a for...of loop
    let visible = 0;
    for (const col of $cols.get()) {
      if (!col.hidden) visible++;
    }
    $count.text(visible + (visible === 1 ? ' game' : ' games'));
    $empty.prop('hidden', visible !== 0);
    // the "nothing found" title repeats the search text, so the user sees why the list is empty
    const typed = $search.val().trim();
    $('#empty-title').text(typed ? 'No games match “' + typed + '”' : 'No games match these filters');
    // the tab title says what is shown, e.g. "NBN Games — Catalog: RPG" (clearer tabs and browser history)
    const parts = [];
    if (state.genre !== 'all') parts.push($('#genre-filter button').filter((i, b) => b.dataset.genre === state.genre).text());
    if (typed) parts.push('“' + typed + '”');
    document.title = 'NBN Games — Catalog' + (parts.length ? ': ' + parts.join(' · ') : '');
    saveToUrl();
    // tell the other jQuery features (highlighting, lazy images) that the list changed
    $(document).trigger('catalog:refresh', [visible, state.search]);
  }

  /* ---------- filters <-> address bar ---------- */
  const SAVED_KEY = 'nbn-catalog-filters';   // last search + filters (localStorage)
  const URL_KEYS = { genre: 'genre', price: 'price', platform: 'platform', search: 'q', sort: 'sort' };

  function saveToUrl() {
    const params = new URLSearchParams();
    Object.keys(URL_KEYS).forEach(key => {
      if (state[key] !== DEFAULTS[key]) params.set(URL_KEYS[key], state[key]);
    });
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : ''));
    // the same filters are remembered in localStorage → restored when the user comes back to the catalog
    try { localStorage.setItem(SAVED_KEY, query); } catch (e) { /* storage blocked */ }
  }

  // came to catalog.html without filters in the address? → put the last saved ones there
  // (a link with its own filters, e.g. ?genre=rpg from a game page, always wins)
  function restoreSavedFilters() {
    let saved = '';
    try { saved = localStorage.getItem(SAVED_KEY) || ''; } catch (e) { /* storage blocked */ }
    if (!location.search && saved) history.replaceState(null, '', location.pathname + '?' + saved);
  }

  // marks one filter button as active (and the others in its list as not active)
  function setActive($list, $btn) {
    $list.find('button').each(function () {
      $(this).toggleClass('active', this === $btn[0]).attr('aria-pressed', this === $btn[0]);
    });
  }

  // read the filters from the address; only values that exist on the page are accepted
  function loadFromUrl() {
    const params = new URLSearchParams(location.search);
    ['genre', 'price', 'platform'].forEach(key => {
      const value = params.get(key);
      const $list = $('#' + key + '-filter');
      const $btn = value ? $list.find('button').filter((i, b) => b.dataset[key] === value) : $();
      if ($btn.length) {
        state[key] = value;
        setActive($list, $btn);
      }
    });
    const q = (params.get('q') || '').trim();
    if (q) { $search.val(q); state.search = q.toLowerCase(); }
    const sort = params.get('sort');
    if (sort && $sort.find('option').filter((i, o) => o.value === sort).length) { $sort.val(sort); state.sort = sort; }
  }

  /* ---------- events ---------- */

  // one delegated handler for the three filter lists (genre / platform / price)
  $filterLists.on('click', 'button', function () {
    const $btn = $(this);
    const $list = $btn.closest('ul');
    const key = $list.attr('id').replace('-filter', '');   // "genre-filter" → "genre"
    state[key] = $btn.attr('data-' + key);
    setActive($list, $btn);
    if (window.SoundFX) SoundFX.play('click');
    refresh();
  });

  // real-time search: the list changes with every key the user types
  $search.on('keyup input', function () {
    const q = $(this).val().trim().toLowerCase();
    if (q === state.search) return;           // arrow keys etc. — nothing changed
    state.search = q;
    refresh();
  });

  // × button: empties the box; 'keyup' lets the filter and the autocomplete react as if the user typed
  $clear.on('click', function () {
    $search.val('').trigger('keyup').trigger('focus');
  });

  $sort.on('change', function () {
    state.sort = $(this).val();
    if (window.SoundFX) SoundFX.play('whoosh');
    refresh();
  });

  // keyboard: "/" jumps to search, Escape clears it
  $(document).on('keydown', function (e) {
    switch (e.key) {
      case '/':
        if (!$(document.activeElement).is('input, textarea, select')) {
          e.preventDefault();
          $search.trigger('focus');
        }
        break;
      case 'Escape':
        if (document.activeElement === $search[0] && $search.val()) {
          $search.val('');
          state.search = '';
          refresh();
        }
        break;
    }
  });

  // the small button next to the counter does the same as the big one in the "nothing found" box
  $('#clear-filters').on('click', function () { $('#reset-filters').trigger('click'); });

  $('#reset-filters').on('click', function () {
    $search.val('');
    state.search = '';
    $filterLists.each(function () { $(this).find('button').first().trigger('click'); });
  });

  // used by the autocomplete (js/jq-search.js) when a suggestion is chosen
  window.Catalog = {
    search(text) {
      $search.val(text);
      state.search = text.trim().toLowerCase();
      refresh();
    }
  };

  /* ---------- start: load the data, build the cards, apply the filters ---------- */
  async function start() {
    // skeleton: grey card shapes in the real grid while the data is on its way
    let skeleton = '';
    for (let i = 0; i < 6; i++) {
      skeleton += '<div class="col"><div class="card h-100 placeholder-glow" aria-hidden="true"><span class="placeholder ratio ratio-16x9 rounded-top"></span>' +
                  '<div class="card-body d-grid gap-2"><span class="placeholder col-8"></span><span class="placeholder col-5"></span><span class="placeholder col-4"></span></div></div></div>';
    }
    $content.attr('aria-busy', 'true').html(
      '<p class="visually-hidden" role="status">Loading games…</p>' +
      `<div class="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3 g-md-4">${skeleton}</div>`);
    $count.text('');

    let games;
    try {
      games = await NBN.loadGames();
    } catch (err) {
      // no internet / file opened from disk / server error → a clear message + a way to try again
      $content.attr('aria-busy', 'false').html(
        '<div class="alert alert-warning d-flex flex-wrap align-items-center gap-3" role="alert">' +
          '<i class="bi bi-exclamation-triangle" aria-hidden="true"></i><span>Could not load the games. Check your connection and try again.</span>' +
          '<button type="button" class="btn btn-sm btn-outline-primary" id="catalog-retry">Try again</button>' +
        '</div>');
      return;
    }

    $content.html(renderCatalog(games)).attr('aria-busy', 'false');
    $cols = $content.find('.game-col');
    $sections = $content.find('[data-genre-section]');
    $cols.each(function (i) { this.dataset.order = i; });     // remember the original order (for "default" sorting)
    if (window.revealOnScroll) revealOnScroll($sections.get());   // sections slide in like on other pages (js/main.js)

    restoreSavedFilters();
    loadFromUrl();
    refresh();
  }

  $content.on('click', '#catalog-retry', start);
  start();
})();
