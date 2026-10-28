/* ==========================================================
   index.html — home page behaviour
   Author: Nurkhan Nurzhau

   Assignment #5 features:
   1. Greeting by time of day — a `switch` picks the text,
      textContent puts it on the page.
   2. "Load more games" — fetch() loads data/games.json and appends
      new Bootstrap cards to #more-games without a page reload.
      Uses an array, a for loop and higher-order functions (filter, map).
   3. Random gaming fact — fetch() loads data/facts.json, a while loop
      makes sure the next fact is different, text fades in (animation).
      The F key also shows a new fact (keyboard event).
   4. Newsletter form — no backend, shows a toast.
   ========================================================== */

(function () {
  const formatPrice = n => n === 0 ? 'Free' : n.toLocaleString('en-US').replace(/,/g, ' ') + ' ₸';
  const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  /* ---------- 1. Greeting by time of day (switch) ---------- */
  function partOfDay(hour) {
    switch (true) {
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

  /* ---------- 2. Load more games (fetch) ---------- */
  const moreRow = document.getElementById('more-games');
  const moreBtn = document.getElementById('load-more-btn');
  const moreInfo = document.getElementById('load-more-info');
  const PAGE_SIZE = 4;
  let allGames = null;   // filled after the first fetch
  let shown = 0;

  // ids of games that are already on the page as cards
  const onPage = Array.from(document.querySelectorAll('main a[href^="game.html?id="]'))
    .map(a => new URL(a.href).searchParams.get('id'));

  // fetch the JSON file; if fetch is not possible (page opened from disk) use the GAMES array
  function loadGames(callback) {
    fetch('data/games.json')
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => callback(data))
      .catch(() => callback(typeof GAMES !== 'undefined' ? GAMES : []));
  }

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

  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      if (moreBtn.dataset.done) { location.href = 'catalog.html'; return; }
      if (window.SoundFX) SoundFX.play('whoosh');
      if (allGames) { showNextPage(); return; }

      moreBtn.disabled = true;
      moreBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading…';
      loadGames(data => {                                         // callback after fetch
        allGames = data;
        moreBtn.disabled = false;
        moreBtn.textContent = 'Load more games';
        showNextPage();
      });
    });
  }

  /* ---------- 3. Random gaming fact (fetch) ---------- */
  const factText = document.getElementById('fact-text');
  const factBtn = document.getElementById('fact-btn');
  const factCounter = document.getElementById('fact-counter');
  const FALLBACK_FACTS = ['Tetris was created in 1984 by Alexey Pajitnov.', 'Minecraft is the best-selling game of all time.'];
  let facts = null;
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
    factCounter.textContent = `· fact #${i + 1} of ${facts.length} · you've read ${seen}`;
    if (window.SoundFX) SoundFX.play('star');
  }

  function newFact() {
    if (facts) { showFact(); return; }
    fetch('data/facts.json')
      .then(res => res.json())
      .then(data => { facts = data; showFact(); })
      .catch(() => { facts = FALLBACK_FACTS; showFact(); });
  }

  if (factBtn) {
    factBtn.addEventListener('click', newFact);
    document.addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      if (!typing && (e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) newFact();
    });
  }

  /* ---------- 4. Newsletter: no backend, just say thanks ---------- */
  const newsForm = document.getElementById('news-form');
  if (newsForm) {
    newsForm.addEventListener('submit', e => {
      e.preventDefault();
      e.target.reset();
      if (window.SoundFX) SoundFX.play('success');
      showToast('Thanks! You are subscribed.');
    });
  }

  showGreeting();
})();
