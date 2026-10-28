/* ==========================================================
   catalog.html — filters, search and sorting
   Author: Bekzat Amanbek

   Assignment #5:
   - Switch statements: matchesPrice() checks the price range and
     sortCards() picks the sort order — both with `switch`.
   - Objects: `state` keeps the current filters.
   - Arrays + loops + higher-order functions: the cards are an array
     that we filter / sort / forEach; a for...of loop counts results.
   - Keyboard: "/" focuses the search box, Escape clears it.
   - Animation: cards that appear again fade in (CSS class).
   - The filters are kept in the address (?genre=rpg&price=low&q=witcher),
     so a filtered catalog can be shared as a link and survives reload.
   ========================================================== */

const genreList = document.getElementById('genre-filter');
const priceList = document.getElementById('price-filter');
const platformList = document.getElementById('platform-filter');
const genreSections = document.querySelectorAll('[data-genre-section]');
const cols = Array.from(document.querySelectorAll('#catalog-content .game-col'));
const countEl = document.getElementById('results-count');
const emptyEl = document.getElementById('empty-state');
const searchEl = document.getElementById('catalog-search');
const sortEl = document.getElementById('catalog-sort');

// remember the original order of every card (for "default" sorting)
cols.forEach((col, i) => { col.dataset.order = i; });

// the current filters — one object instead of many variables
const state = { genre: 'all', price: 'all', platform: 'all', search: '', sort: 'default' };

// numeric price of a card, read from its "Add to cart" button
const priceOf = col => Number(col.querySelector('.add-to-cart-btn').dataset.price);
const titleOf = col => col.querySelector('.card-title').textContent;

/* price range filter with a switch */
function matchesPrice(col) {
  const price = priceOf(col);
  switch (state.price) {
    case 'low':  return price < 5000;
    case 'mid':  return price >= 5000 && price <= 10000;
    case 'high': return price > 10000;
    default:     return true;               // 'all'
  }
}

/* sort order with a switch — returns a compare function for Array.sort */
function compareBy(sort) {
  switch (sort) {
    case 'price-asc':  return (a, b) => priceOf(a) - priceOf(b);
    case 'price-desc': return (a, b) => priceOf(b) - priceOf(a);
    case 'name':       return (a, b) => titleOf(a).localeCompare(titleOf(b));
    default:           return (a, b) => a.dataset.order - b.dataset.order;
  }
}

function isVisible(col) {
  const okGenre = state.genre === 'all' || col.dataset.genre === state.genre;
  const okPlatform = state.platform === 'all' || col.dataset.platform.split(' ').includes(state.platform);
  const okSearch = !state.search || col.textContent.toLowerCase().includes(state.search);
  return okGenre && okPlatform && okSearch && matchesPrice(col);
}

function refresh() {
  // 1) show / hide every card
  cols.forEach(col => {
    const show = isVisible(col);
    if (show && col.hidden) {                 // card comes back → small animation
      col.classList.remove('fade-in-up');
      void col.offsetWidth;
      col.classList.add('fade-in-up');
    }
    col.hidden = !show;
  });

  // 2) sort the cards inside each genre row
  genreSections.forEach(sec => {
    const row = sec.querySelector('.row');
    Array.from(row.children).sort(compareBy(state.sort)).forEach(col => row.appendChild(col));
    // hide a genre section when none of its cards are visible
    sec.hidden = !sec.querySelector('.game-col:not([hidden])');
  });

  // 3) count with a for...of loop
  let visible = 0;
  for (const col of cols) {
    if (!col.hidden) visible++;
  }
  countEl.textContent = visible + (visible === 1 ? ' game' : ' games');
  emptyEl.hidden = visible !== 0;
  saveToUrl();
}

/* ---------- filters <-> address bar ---------- */
const URL_KEYS = { genre: 'genre', price: 'price', platform: 'platform', search: 'q', sort: 'sort' };
const DEFAULTS = { genre: 'all', price: 'all', platform: 'all', search: '', sort: 'default' };

function saveToUrl() {
  const params = new URLSearchParams();
  Object.keys(URL_KEYS).forEach(key => {
    if (state[key] !== DEFAULTS[key]) params.set(URL_KEYS[key], state[key]);
  });
  const query = params.toString();
  history.replaceState(null, '', location.pathname + (query ? '?' + query : ''));
}

// read the filters from the address; only values that exist on the page are accepted
function loadFromUrl() {
  const params = new URLSearchParams(location.search);
  const pick = (list, attr, value) => value && list.querySelector(`button[data-${attr}="${CSS.escape(value)}"]`);
  [[genreList, 'genre'], [priceList, 'price'], [platformList, 'platform']].forEach(([list, key]) => {
    const btn = pick(list, key, params.get(key));
    if (btn) {
      state[key] = btn.dataset[key];
      list.querySelectorAll('button').forEach(el => {
        el.classList.toggle('active', el === btn);
        el.setAttribute('aria-pressed', el === btn);
      });
    }
  });
  const q = (params.get('q') || '').trim();
  if (q) { searchEl.value = q; state.search = q.toLowerCase(); }
  const sort = params.get('sort');
  if (sort && sortEl.querySelector(`option[value="${CSS.escape(sort)}"]`)) { sortEl.value = sort; state.sort = sort; }
}

function bind(list, key) {
  list.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    state[key] = btn.dataset[key];
    list.querySelectorAll('button').forEach(el => {
      el.classList.toggle('active', el === btn);
      el.setAttribute('aria-pressed', el === btn);
    });
    if (window.SoundFX) SoundFX.play('click');
    refresh();
  });
}

bind(genreList, 'genre');
bind(priceList, 'price');
bind(platformList, 'platform');

searchEl.addEventListener('input', () => {
  state.search = searchEl.value.trim().toLowerCase();
  refresh();
});

sortEl.addEventListener('change', () => {
  state.sort = sortEl.value;
  if (window.SoundFX) SoundFX.play('whoosh');
  refresh();
});

// keyboard: "/" jumps to search, Escape clears it
document.addEventListener('keydown', e => {
  switch (e.key) {
    case '/':
      if (document.activeElement !== searchEl && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault();
        searchEl.focus();
      }
      break;
    case 'Escape':
      if (document.activeElement === searchEl && searchEl.value) {
        searchEl.value = '';
        state.search = '';
        refresh();
      }
      break;
  }
});

document.getElementById('reset-filters').addEventListener('click', () => {
  searchEl.value = '';
  state.search = '';
  [genreList, priceList, platformList].forEach(list => list.querySelector('button').click());
});

// start: apply filters from the link (if any)
loadFromUrl();
refresh();
