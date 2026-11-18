/* ==========================================================
   deals.html — live game deals (public CheapShark API)
   Team Next Step

   1. The store list for the filter comes from GET /stores
      (DealsAPI.loadStores — the cards show the store logo too).
   2. "Deal of the moment" in the hero: from GET /deals?sortBy=Deal Rating
      the first big discount with good Steam reviews.
   3. The deals: GET /deals?sortBy=…&storeID=…&upperPrice=…&pageSize=12&pageNumber=…
      (js/deals-api.js does the fetch + the 10-minute cache).
   4. Any filter change → the list starts again from page 0;
      "Show more deals" asks for the next page and adds the cards.
      Quick filters (chips) only set the three selects.
   5. States: skeleton cards while loading, an error with "Retry",
      and "No deals match these filters".
   ========================================================== */

(function () {
  'use strict';

  const PAGE_SIZE = 12;
  const STEAM_ID = '1';
  const $grid = $('#deals-grid');
  const $store = $('#deal-store');
  const $price = $('#deal-price');
  const $sort = $('#deal-sort');
  const $more = $('#deals-more');
  const $count = $('#deals-count');
  const $reset = $('#deals-reset');
  if (!$grid.length) return;

  let page = 0;
  let shown = 0;                       // how many cards are in the list now

  // the address of the next request, built from the three filters
  function query() {
    const params = new URLSearchParams({ pageSize: PAGE_SIZE, pageNumber: page, sortBy: $sort.val() });
    if ($store.val()) params.set('storeID', $store.val());
    if ($price.val() !== '') params.set('upperPrice', $price.val());
    return '/deals?' + params.toString();
  }

  // store filter: only the stores that are still active, A → Z
  async function loadStores() {
    try {
      const stores = await DealsAPI.loadStores();
      stores.filter(s => s.isActive).sort((a, b) => a.storeName.localeCompare(b.storeName)).forEach(s => {
        $('<option>').val(s.storeID).text(s.storeName).appendTo($store);
      });
    } catch (err) {
      $store.prop('disabled', true);                // no store list → "All stores" only
    }
  }

  /* ---------- quick filters (chips) ---------- */
  const QUICK = {
    free:  { is: () => $price.val() === '0',            on: () => $price.val('0'),   off: () => $price.val('') },
    5:     { is: () => $price.val() === '5',            on: () => $price.val('5'),   off: () => $price.val('') },
    steam: { is: () => $store.val() === STEAM_ID,       on: () => $store.val(STEAM_ID), off: () => $store.val('') },
    rated: { is: () => $sort.val() === 'Deal Rating',   on: () => $sort.val('Deal Rating'), off: () => $sort.val('Savings') }
  };

  // the chips and the "Reset filters" link always show the state of the selects
  function syncChips() {
    $('.deal-chip').each(function () {
      const on = QUICK[this.dataset.quick].is();
      $(this).toggleClass('is-on', on).attr('aria-pressed', String(on));
    });
    $reset.prop('hidden', !$store.val() && $price.val() === '' && $sort.val() === 'Savings');
  }

  function updateCount() {
    $count.text(shown ? `Showing ${shown} ${shown === 1 ? 'deal' : 'deals'}` : '');
  }

  // reset = true → a new list (filters changed); false → the next page under the current cards
  async function load(reset) {
    syncChips();
    if (reset) {
      page = 0;
      shown = 0;
      updateCount();
      $more.prop('hidden', true);
      DealsAPI.showLoading($grid[0], 8, 'Loading deals…');
    } else {
      $more.prop('disabled', true).text('Loading…');
    }
    try {
      await DealsAPI.loadStores().catch(() => []);   // the store logos on the cards (cached)
      const deals = await DealsAPI.getJSON(query());
      if (reset && !deals.length) { DealsAPI.showEmpty($grid[0], 'No deals match these filters — try another store or price.'); return; }
      if (reset) $grid.attr('aria-busy', 'false').html(`<div class="${DealsAPI.GRID}" id="deals-row"></div>`);
      $('#deals-row').append(deals.map(DealsAPI.dealCard).join(''));
      shown += deals.length;
      updateCount();
      $more.prop('hidden', deals.length < PAGE_SIZE);   // a short page = there is nothing more
    } catch (err) {
      if (reset) DealsAPI.showError($grid[0], 'Could not load the deals. Check your internet connection.', () => load(true));
      else {
        page--;                                       // the same page will be asked again next time
        if (window.showToast) showToast('Could not load more deals', 'error');
      }
    } finally {
      $more.prop('disabled', false).text('Show more deals');
    }
  }

  /* ---------- "Deal of the moment" ---------- */
  async function loadSpotlight() {
    const box = document.getElementById('deal-spotlight');
    if (!box) return;
    try {
      await DealsAPI.loadStores().catch(() => []);
      const deals = await DealsAPI.getJSON('/deals?pageSize=20&sortBy=Deal%20Rating');
      // a big discount with good reviews; if there is none — simply the best rated deal
      const best = deals.find(d => Number(d.savings) >= 50 && Number(d.steamRatingPercent) >= 80) || deals[0];
      if (best) box.innerHTML = DealsAPI.spotlightCard(best);
      else box.closest('.col-lg-5').hidden = true;
    } catch (err) {
      box.closest('.col-lg-5').hidden = true;        // the hero still works without it
    }
  }

  $('#deals-filters').on('change', 'select', () => load(true));
  $('.deal-chip').on('click', function () {
    const q = QUICK[this.dataset.quick];
    if (q.is()) q.off(); else q.on();
    load(true);
  });
  $reset.on('click', () => {
    $store.val(''); $price.val(''); $sort.val('Savings');
    load(true);
  });
  $more.on('click', () => { page++; load(false); });

  loadStores();
  loadSpotlight();
  load(true);
})();
