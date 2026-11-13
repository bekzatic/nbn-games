/* ==========================================================
   deals.html — live game deals (public CheapShark API)
   Team Next Step

   1. The store list for the filter comes from GET /stores.
   2. The deals: GET /deals?sortBy=…&storeID=…&upperPrice=…&pageSize=12&pageNumber=…
      (js/deals-api.js does the fetch + the 10-minute cache).
   3. Any filter change → the list starts again from page 0;
      "Show more deals" asks for the next page and adds the cards.
   4. States: skeleton cards while loading, an error with "Retry",
      and "No deals match these filters".
   ========================================================== */

(function () {
  'use strict';

  const PAGE_SIZE = 12;
  const $grid = $('#deals-grid');
  const $store = $('#deal-store');
  const $price = $('#deal-price');
  const $sort = $('#deal-sort');
  const $more = $('#deals-more');
  if (!$grid.length) return;

  let page = 0;

  // the address of the next request, built from the three filters
  function query() {
    const params = new URLSearchParams({ pageSize: PAGE_SIZE, pageNumber: page, sortBy: $sort.val() });
    if ($store.val()) params.set('storeID', $store.val());
    if ($price.val()) params.set('upperPrice', $price.val());
    return '/deals?' + params.toString();
  }

  // store filter: only the stores that are still active, A → Z
  async function loadStores() {
    try {
      const stores = await DealsAPI.getJSON('/stores');
      stores.filter(s => s.isActive).sort((a, b) => a.storeName.localeCompare(b.storeName)).forEach(s => {
        $('<option>').val(s.storeID).text(s.storeName).appendTo($store);
      });
    } catch (err) {
      $store.prop('disabled', true);                // no store list → "All stores" only
    }
  }

  // reset = true → a new list (filters changed); false → the next page under the current cards
  async function load(reset) {
    if (reset) {
      page = 0;
      $more.prop('hidden', true);
      DealsAPI.showLoading($grid[0], 8, 'Loading deals…');
    } else {
      $more.prop('disabled', true).text('Loading…');
    }
    try {
      const deals = await DealsAPI.getJSON(query());
      if (reset && !deals.length) { DealsAPI.showEmpty($grid[0], 'No deals match these filters — try another store or price.'); return; }
      if (reset) $grid.attr('aria-busy', 'false').html('<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3" id="deals-row"></div>');
      $('#deals-row').append(deals.map(DealsAPI.dealCard).join(''));
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

  $('#deals-filters').on('change', 'select', () => load(true));
  $more.on('click', () => { page++; load(false); });

  loadStores();
  load(true);
})();
