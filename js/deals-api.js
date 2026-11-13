/* ==========================================================
   deals-api.js — live prices from a PUBLIC API: CheapShark
   Team Next Step
   API: https://www.cheapshark.com/api/1.0/ (free, no key needed)

   1. getJSON(path) — fetch() with async/await. A 404 / 500 answer
      becomes an error. Every answer is cached in localStorage for
      10 minutes, so reloading the page does not ask the API again.
   2. Home page, "Live deals" (#live-deals):
        GET /deals?pageSize=8&sortBy=Savings  → the 8 biggest discounts.
   3. Game page, "Prices in other stores" (#store-prices):
        GET /games?title=<game>  → find the game in CheapShark,
        GET /games?id=<id>       → its price in every store,
        GET /stores              → store id → store name.
   4. Every block has three states besides the result:
        loading (skeleton cards), error (message + "Retry" button,
        no alert) and "nothing found".
   All prices from CheapShark are in US dollars.
   ========================================================== */

window.DealsAPI = (function () {
  'use strict';

  const BASE = 'https://www.cheapshark.com/api/1.0';
  const CACHE_MS = 10 * 60 * 1000;                 // 10 minutes
  const esc = s => NBN.escapeHtml(s);              // text from the API goes into HTML → escape it
  const usd = n => '$' + Number(n).toFixed(2);

  /* ---------- 1. fetch + cache ---------- */

  // returns the data of one API address; throws an Error when the request fails
  async function getJSON(path) {
    const key = 'nbn-api:' + path;
    try {
      const cached = JSON.parse(localStorage.getItem(key));
      if (cached && Date.now() - cached.time < CACHE_MS) return cached.data;   // fresh enough → no request
    } catch (e) { /* no cache → ask the API */ }

    const response = await fetch(BASE + path);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    try { localStorage.setItem(key, JSON.stringify({ time: Date.now(), data })); } catch (e) { /* storage full / blocked */ }
    return data;
  }

  /* ---------- shared states: loading / error / nothing found ---------- */

  // grey "skeleton" cards that pulse while the data is on its way
  function showLoading(box, count, text) {
    box.setAttribute('aria-busy', 'true');
    let cards = '';
    for (let i = 0; i < count; i++) {
      cards += '<div class="col"><div class="card h-100 p-3 placeholder-glow" aria-hidden="true">' +
               '<span class="placeholder col-12 rounded-2 mb-3 deal-skeleton-img"></span>' +
               '<span class="placeholder col-9 mb-2"></span><span class="placeholder col-5"></span></div></div>';
    }
    box.innerHTML = `<p class="visually-hidden" role="status">${text}</p>` +
                    `<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">${cards}</div>`;
  }

  // the error message with a "Retry" button that runs the same request again
  function showError(box, text, retry) {
    box.setAttribute('aria-busy', 'false');
    box.innerHTML = '<div class="alert alert-warning d-flex flex-wrap align-items-center gap-3 mb-0" role="alert">' +
                    `<i class="bi bi-exclamation-triangle" aria-hidden="true"></i><span>${text}</span>` +
                    '<button type="button" class="btn btn-sm btn-outline-primary js-retry">Retry</button></div>';
    box.querySelector('.js-retry').addEventListener('click', retry);
  }

  function showEmpty(box, text) {
    box.setAttribute('aria-busy', 'false');
    box.innerHTML = '<div class="empty-state rounded-3 text-center p-4"><span class="empty-icon" aria-hidden="true"><i class="bi bi-tag"></i></span>' +
                    `<p class="text-body-secondary mx-auto mb-0">${text}</p></div>`;
  }

  /* ---------- 2. Home: Live deals ---------- */

  function dealCard(d) {
    const savings = Math.round(Number(d.savings));
    return `
      <div class="col">
        <article class="card game-card deal-card h-100">
          <div class="deal-thumb"><img src="${esc(d.thumb)}" alt="${esc(d.title)}" loading="lazy"></div>
          <div class="card-body d-flex flex-column gap-1 p-3">
            <h3 class="card-title h6 fw-bold mb-0">${esc(d.title)}</h3>
            <div class="d-flex align-items-center flex-wrap gap-2 mt-auto pt-2">
              <span class="badge text-bg-primary">−${savings}%</span>
              <span class="fw-semibold">${Number(d.salePrice) === 0 ? 'Free' : usd(d.salePrice)}</span>
              <span class="text-decoration-line-through text-body-tertiary small">${usd(d.normalPrice)}</span>
            </div>
          </div>
          <div class="card-footer border-0 px-3 pb-3 pt-0">
            <a class="btn btn-outline-light btn-sm w-100" href="https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}" target="_blank" rel="noopener">View deal ↗</a>
          </div>
        </article>
      </div>`;
  }

  async function renderDeals(box) {
    showLoading(box, 8, 'Loading deals…');
    try {
      const deals = await getJSON('/deals?pageSize=8&sortBy=Savings');
      if (!deals.length) { showEmpty(box, 'No deals right now — try again later.'); return; }
      box.setAttribute('aria-busy', 'false');
      box.innerHTML = `<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">${deals.map(dealCard).join('')}</div>`;
    } catch (err) {
      showError(box, 'Could not load the deals. Check your internet connection.', () => renderDeals(box));
    }
  }

  /* ---------- 3. Game page: prices in other stores ---------- */

  // finds the game by its title and returns its deals sorted by price, or null if CheapShark doesn't know it
  async function storePrices(title) {
    const found = await getJSON('/games?title=' + encodeURIComponent(title) + '&limit=10');
    if (!found.length) return null;
    // the same title (any letter case) if it is there, otherwise the first result
    const match = found.find(g => g.external.toLowerCase() === title.toLowerCase()) || found[0];
    // two requests at the same time: the prices of the game + the names of the stores
    const [details, stores] = await Promise.all([getJSON('/games?id=' + match.gameID), getJSON('/stores')]);
    const storeName = {};
    stores.forEach(s => { storeName[s.storeID] = s.storeName; });
    return {
      title: match.external,
      deals: details.deals
        .map(d => ({ store: storeName[d.storeID] || 'Store #' + d.storeID, price: Number(d.price), retail: Number(d.retailPrice), savings: Math.round(Number(d.savings)), dealID: d.dealID }))
        .sort((a, b) => a.price - b.price)
    };
  }

  async function renderStorePrices(box, title) {
    showLoading(box, 4, 'Looking for prices in other stores…');
    try {
      const result = await storePrices(title);
      if (!result || !result.deals.length) { showEmpty(box, 'This game was not found in other stores.'); return; }
      const rows = result.deals.slice(0, 8).map((d, i) => `
        <li class="list-group-item d-flex flex-wrap align-items-center gap-2 gap-sm-3 py-3">
          <strong class="me-auto">${esc(d.store)}${i === 0 ? ' <span class="badge text-bg-primary ms-1">Best price</span>' : ''}</strong>
          ${d.savings > 0 ? `<span class="text-decoration-line-through text-body-tertiary small">${usd(d.retail)}</span>` : ''}
          <span class="fw-semibold">${usd(d.price)}</span>
          <a class="btn btn-outline-light btn-sm" href="https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}" target="_blank" rel="noopener" aria-label="Open ${esc(d.store)} (new tab)">Go to store ↗</a>
        </li>`).join('');
      box.setAttribute('aria-busy', 'false');
      box.innerHTML = `<p class="small text-body-secondary mb-2">Found as “${esc(result.title)}” · ${result.deals.length} ${result.deals.length === 1 ? 'store' : 'stores'}</p>` +
                      `<ul class="list-group">${rows}</ul>`;
    } catch (err) {
      showError(box, 'Could not load prices from other stores.', () => renderStorePrices(box, title));
    }
  }

  // the home page starts by itself; the game page calls renderStorePrices() from js/game.js
  document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('live-deals');
    if (box) renderDeals(box);
  });

  // the cards and the states are also used by the Deals page (js/deals-page.js)
  return { getJSON, storePrices, renderDeals, renderStorePrices, dealCard, showLoading, showError, showEmpty };
})();
