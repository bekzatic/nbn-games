/* ==========================================================
   index.html — home page behaviour
   Author: Nurkhan Nurzhau

   1. Greeting by time of day — a `switch` picks the text,
      textContent puts it on the page.
   2. "Load more games" — the games come from data/games.json
      (NBN.loadGames, async/await) and new Bootstrap cards are added
      to #more-games without a page reload. Uses an array, a for loop
      and higher-order functions (filter).
   3. Random gaming fact — fetch() loads data/facts.json, a while loop
      makes sure the next fact is different, text fades in (animation).
      The F key also shows a new fact (keyboard event).
   4. Newsletter form — no backend: a spinner, then a toast.
   ========================================================== */

(function () {
  const formatPrice = NBN.formatPrice;            // 0 → "Free", 14999 → "14 999 ₸"
  const escapeHtml = NBN.escapeHtml;              // game titles go into HTML attributes
  const SPINNER = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>';

  /* ---------- 1. Greeting by time of day (switch) ---------- */
  function partOfDay(hour) {
    switch (true) {                       // the first `case` that is true wins
      case hour >= 5 && hour < 12:  return 'morning';
      case hour >= 12 && hour < 18: return 'afternoon';
      case hour >= 18 && hour < 23: return 'evening';
      default:                      return 'night';
    }
  }

  function showGreeting() {
    const el = document.getElementById('greeting');
    if (!el) return;
    let text;
    switch (partOfDay(new Date().getHours())) {
      case 'morning':   text = '☀️ Good morning, player! Coffee and a quick match?'; break;
      case 'afternoon': text = '🎮 Good afternoon! Perfect time for a new game.'; break;
      case 'evening':   text = '🌆 Good evening! Your next level is waiting.'; break;
      default:          text = '🌙 Still awake? One more game won\'t hurt.';
    }
    el.textContent = text;
  }

  /* ---------- 2. Load more games ---------- */
  const moreRow = document.getElementById('more-games');
  const moreBtn = document.getElementById('load-more-btn');
  const moreInfo = document.getElementById('load-more-info');
  const PAGE_SIZE = 4;
  let allGames = null;   // filled after the first successful load
  let shown = 0;

  // ids of games that are already on the page as cards (they are not added again)
  const onPage = Array.from(document.querySelectorAll('main a[href^="game.html?id="]'))
    .map(a => new URL(a.href).searchParams.get('id'));

  function cardHtml(g) {
    const sale = g.oldPrice ? '<span class="sale-badge badge text-bg-primary position-absolute top-0 start-0 m-2">Sale</span>' : '';
    return `
      <div class="col fade-in-up">
        <article class="card game-card h-100">
          <a href="game.html?id=${g.id}" class="d-flex flex-column flex-grow-1 text-reset text-decoration-none">
            ${sale}<div class="ratio ratio-16x9"><img class="card-img-top object-fit-cover" src="${g.img}" alt="${escapeHtml(g.title)} cover" loading="lazy"></div>
            <div class="card-body d-flex flex-column gap-1 p-3">
              <h3 class="card-title h6 fw-bold mb-0">${escapeHtml(g.title)}</h3>
              <p class="card-text small text-body-secondary mb-0">${g.emoji} ${g.genreLabel} · ★ ${g.rating.toFixed(1)}</p>
              <div class="fw-semibold mt-auto pt-2">${formatPrice(g.price)}</div>
            </div>
          </a>
          <div class="card-footer border-0 px-3 pb-3 pt-0">
            <div class="btn-group btn-group-sm w-100" role="group" aria-label="${escapeHtml(g.title)} actions">
              <button type="button" class="btn btn-primary add-to-cart-btn" data-name="${escapeHtml(g.title)}" data-price="${g.price}" data-img="${g.img}">Add to cart</button>
              <a href="game.html?id=${g.id}" class="btn btn-outline-light">Details</a>
            </div>
          </div>
        </article>
      </div>`;
  }

  // adds the next 4 games that are not on the page yet
  function showNextPage() {
    const rest = allGames.filter(g => !onPage.includes(g.id));     // higher-order: filter
    const end = Math.min(shown + PAGE_SIZE, rest.length);
    let html = '';
    for (let i = shown; i < end; i++) {                            // for loop over the array
      html += cardHtml(rest[i]);
    }
    moreRow.insertAdjacentHTML('beforeend', html);
    shown = end;

    const left = rest.length - shown;
    moreInfo.textContent = left > 0 ? `${shown} more shown · ${left} left in the catalog` : 'That\'s all! See the full catalog for filters.';
    if (left <= 0) {
      moreBtn.textContent = 'Open full catalog →';
      moreBtn.dataset.done = '1';
    }
  }

  // first click: load the data (loading state → cards, or a clear error message)
  async function loadMore() {
    moreBtn.disabled = true;
    moreBtn.innerHTML = SPINNER + 'Loading…';
    moreInfo.textContent = '';
    try {
      allGames = await NBN.loadGames();
      moreBtn.textContent = 'Load more games';
      showNextPage();
    } catch (err) {
      moreBtn.textContent = 'Try again';
      moreInfo.textContent = '⚠️ Could not load more games. Check your connection and try again.';
      if (window.showToast) showToast('Could not load more games', 'error');
    } finally {
      moreBtn.disabled = false;          // `finally` runs after success AND after an error
    }
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      if (moreBtn.dataset.done) { location.href = 'catalog.html'; return; }
      if (window.SoundFX) SoundFX.play('whoosh');
      if (allGames) showNextPage();      // the data is already here → no new request
      else loadMore();
    });
  }

  /* ---------- 3. Random gaming fact ---------- */
  const factText = document.getElementById('fact-text');
  const factBtn = document.getElementById('fact-btn');
  const factCounter = document.getElementById('fact-counter');
  // used when data/facts.json can't be loaded, so the button still does something
  const FALLBACK_FACTS = ['Tetris was created in 1984 by Alexey Pajitnov.', 'Minecraft is the best-selling game of all time.'];
  let facts = null;
  let offline = false;
  let lastIndex = -1;
  let seen = 0;

  function showFact() {
    let i = Math.floor(Math.random() * facts.length);
    while (facts.length > 1 && i === lastIndex) {                 // never the same fact twice in a row
      i = Math.floor(Math.random() * facts.length);
    }
    lastIndex = i;
    seen++;
    factText.classList.add('is-changing');                        // fade out…
    setTimeout(() => {
      factText.textContent = facts[i];                           // …change the text…
      factText.classList.remove('is-changing');                   // …fade in
    }, 250);
    factCounter.textContent = offline
      ? '· offline facts (data/facts.json could not be loaded)'
      : `· fact #${i + 1} of ${facts.length} · you've read ${seen}`;
    if (window.SoundFX) SoundFX.play('star');
  }

  // loads data/facts.json once (async/await + try/catch), then shows a fact
  async function newFact() {
    if (facts) { showFact(); return; }
    const label = factBtn.innerHTML;
    factBtn.disabled = true;
    factBtn.innerHTML = SPINNER + 'Loading…';
    try {
      const response = await fetch('data/facts.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      facts = await response.json();
    } catch (err) {
      facts = FALLBACK_FACTS;
      offline = true;
    } finally {
      factBtn.disabled = false;
      factBtn.innerHTML = label;
    }
    showFact();
  }

  if (factBtn) {
    factBtn.addEventListener('click', newFact);
    document.addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      if (!typing && (e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !factBtn.disabled) newFact();
    });
  }

  /* ---------- 4. Newsletter: no backend, just say thanks ---------- */
  const newsForm = document.getElementById('news-form');
  if (newsForm) {
    newsForm.addEventListener('submit', e => {
      e.preventDefault();
      const done = () => {
        newsForm.reset();
        if (window.SoundFX) SoundFX.play('success');
        if (window.showToast) showToast('Form submitted successfully — you are subscribed!', 'success');
      };
      // the button shows a spinner + "Please wait…" first (NBN.withSpinner in js/script.js)
      if (window.NBN && NBN.withSpinner) NBN.withSpinner(newsForm.querySelector('[type="submit"]'), 1800, done);
      else done();
    });
  }

  showGreeting();
})();
