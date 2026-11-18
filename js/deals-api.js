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
  // a picture address from the API is used only if it is a plain https address (no quotes, spaces or brackets)
  const safeUrl = url => (/^https:\/\/[^\s'"()<>\\]+$/.test(String(url)) ? String(url) : '');
  // the grid of deal cards: 2 per row on phones, 3 on tablets, 4 on desktop
  const GRID = 'row row-cols-2 row-cols-md-3 row-cols-xl-4 g-2 g-sm-3 deals-row';

  /* ---------- the stores (name + logo), loaded once ---------- */
  const storeInfo = {};                             // storeID → { name, logo }
  let storesPromise = null;
  function loadStores() {
    if (!storesPromise) {
      storesPromise = getJSON('/stores').then(list => {
        list.forEach(st => {
          storeInfo[st.storeID] = { name: st.storeName, logo: safeUrl('https://www.cheapshark.com' + ((st.images && st.images.logo) || '')) };
        });
        return list;
      });
      storesPromise.catch(() => { storesPromise = null; });   // failed → try again next time
    }
    return storesPromise;
  }

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
                    `<div class="${GRID}">${cards}</div>`;
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

  // one deal card: cover (blurred copy of it behind, so there are no empty bars), −% badge,
  // store logo, title, Steam reviews, price, "You save" and a link that makes the whole card clickable
  function dealCard(d) {
    const savings = Math.round(Number(d.savings));
    const free = Number(d.salePrice) === 0;
    const saved = Number(d.normalPrice) - Number(d.salePrice);
    const store = storeInfo[d.storeID];
    const thumb = safeUrl(d.thumb);
    const reviews = d.steamRatingText
      ? `<p class="deal-meta mb-0"><i class="bi bi-hand-thumbs-up" aria-hidden="true"></i> ${esc(d.steamRatingText)} · ${Number(d.steamRatingPercent)}%</p>` : '';
    return `
      <div class="col">
        <article class="card deal-card h-100">
          <div class="deal-media">
            <div class="deal-thumb ratio ratio-16x9">
              <span class="deal-thumb-bg" aria-hidden="true"${thumb ? ` style="background-image: url('${thumb}')"` : ''}></span>
              <img class="object-fit-contain" src="${esc(thumb)}" alt="" loading="lazy">
            </div>
            ${savings > 0 ? `<span class="deal-badge">−${savings}%</span>` : ''}
          </div>
          <div class="card-body d-flex flex-column gap-1">
            ${store ? `<p class="deal-store mb-0">${store.logo ? `<img src="${esc(store.logo)}" alt="" width="16" height="16" loading="lazy">` : ''}<span>${esc(store.name)}</span></p>` : ''}
            <h3 class="deal-title h6 mb-0">${esc(d.title)}</h3>
            ${reviews}
            <div class="deal-price mt-auto pt-2">
              <span class="deal-now${free ? ' is-free' : ''}">${free ? 'Free' : usd(d.salePrice)}</span>
              ${savings > 0 ? `<s class="deal-was">${usd(d.normalPrice)}</s>` : ''}
            </div>
            ${saved >= 1 ? `<p class="deal-save mb-0">You save ${usd(saved)}</p>` : ''}
          </div>
          <div class="card-footer">
            <a class="btn btn-outline-primary btn-sm w-100 stretched-link" href="https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}" target="_blank" rel="noopener" aria-label="View deal: ${esc(d.title)} (new tab)">View deal <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>
          </div>
        </article>
      </div>`;
  }

  // the big "Deal of the moment" card in the hero of deals.html
  function spotlightCard(d) {
    const savings = Math.round(Number(d.savings));
    const free = Number(d.salePrice) === 0;
    const store = storeInfo[d.storeID];
    const thumb = safeUrl(d.thumb);
    return `
      <article class="deal-spotlight card">
        <div class="deal-thumb ratio ratio-21x9">
          <span class="deal-thumb-bg" aria-hidden="true"${thumb ? ` style="background-image: url('${thumb}')"` : ''}></span>
          <img class="object-fit-contain" src="${esc(thumb)}" alt="">
        </div>
        <span class="deal-badge deal-badge--lg">−${savings}%</span>
        <div class="card-body">
          <p class="eyebrow mb-1"><i class="bi bi-stars" aria-hidden="true"></i> Deal of the moment</p>
          <h2 class="h4 mb-2">${esc(d.title)}</h2>
          <p class="deal-meta mb-3">
            ${store ? `<span class="deal-store d-inline-flex">${store.logo ? `<img src="${esc(store.logo)}" alt="" width="16" height="16">` : ''}<span>${esc(store.name)}</span></span>` : ''}
            ${d.steamRatingText ? `<span><i class="bi bi-hand-thumbs-up" aria-hidden="true"></i> ${esc(d.steamRatingText)} · ${Number(d.steamRatingPercent)}%</span>` : ''}
          </p>
          <div class="d-flex flex-wrap align-items-center gap-3">
            <div class="deal-price">
              <span class="deal-now deal-now--lg${free ? ' is-free' : ''}">${free ? 'Free' : usd(d.salePrice)}</span>
              <s class="deal-was">${usd(d.normalPrice)}</s>
            </div>
            <a class="btn btn-primary ms-auto stretched-link" href="https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}" target="_blank" rel="noopener" aria-label="View deal: ${esc(d.title)} (new tab)">View deal <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </article>`;
  }

  async function renderDeals(box) {
    showLoading(box, 8, 'Loading deals…');
    try {
      await loadStores().catch(() => []);           // store logos on the cards (if the list can't load: no logos)
      const deals = await getJSON('/deals?pageSize=8&sortBy=Savings');
      if (!deals.length) { showEmpty(box, 'No deals right now — try again later.'); return; }
      box.setAttribute('aria-busy', 'false');
      box.innerHTML = `<div class="${GRID}">${deals.map(dealCard).join('')}</div>`;
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
  return { GRID, getJSON, loadStores, storePrices, renderDeals, renderStorePrices, dealCard, spotlightCard, showLoading, showError, showEmpty };
})();
