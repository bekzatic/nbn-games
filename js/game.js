/* ==========================================================
   game.html — one template page for every game (?id=...)
   Author: Nursultan Rassulov
   Data: js/games-data.js (array GAMES of game objects)

   Assignment #5 features on this page:
   - Rating stars: querySelectorAll selects the stars, click / hover /
     arrow keys change their colour; the message is updated with
     textContent; the rating is saved per game in localStorage.
   - "Read more": extra content shown / hidden with style.display.
   - Sounds (SoundFX) and animations (star "pop", fade-in).
   ========================================================== */

const $ = id => document.getElementById(id);
const formatPrice = n => n === 0 ? 'Free' : n.toLocaleString('en-US').replace(/,/g, ' ') + ' ₸';
const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// Short texts for every genre — an object used like a dictionary
const GENRE_INFO = {
  action: 'Fast fights, quick reactions and big set-piece moments — perfect when you want pure adrenaline.',
  adventure: 'Story first: explore the world, solve puzzles and follow characters you will remember.',
  rpg: 'Build your hero, make choices that matter and lose yourself in a huge world for dozens of hours.',
  strategy: 'Think before you act: plan, build and outsmart your opponents turn by turn or in real time.',
  simulation: 'Relaxing and detailed — run your own farm, city, truck company or airplane.',
  sport: 'Real teams, real leagues and online matches with friends.',
  racing: 'Feel the speed: licensed cars, real tracks and photo-finish races.'
};

// Which game? ?id=elden-ring  (default — Cyberpunk 2077, as before)
const params = new URLSearchParams(location.search);
const id = params.get('id') || 'cyberpunk-2077';
const game = GAMES.find(g => g.id === id);

if (!game) {
  $('game-page').hidden = true;
  $('not-found').hidden = false;
  document.title = 'NBN Games — Game not found';
} else {
  document.title = 'NBN Games — ' + game.title;

  $('crumb-genre').innerHTML = `<a class="crumb-link" href="catalog.html">${game.genreLabel}</a>`;
  $('crumb-title').textContent = game.title;
  $('game-cover').src = game.img;
  $('game-cover').alt = game.title + ' cover';
  $('game-genre').textContent = game.emoji + ' ' + game.genreLabel;
  $('game-title').textContent = game.title;

  const full = Math.round(game.rating);
  $('game-stars').textContent = '★'.repeat(full) + '☆'.repeat(5 - full);
  $('game-rating').textContent = `${game.rating.toFixed(1)} · ${game.reviews} reviews · ${game.developer}`;

  $('game-platforms').innerHTML = game.platforms
    .map(p => `<span class="badge rounded-pill border border-secondary-subtle text-body-secondary fw-normal px-3 py-2">${p}</span>`).join('');

  let priceHtml = `<span class="fs-2 fw-bold text-white">${formatPrice(game.price)}</span>`;
  if (game.oldPrice) {
    const pct = Math.round((1 - game.price / game.oldPrice) * 100);
    priceHtml = `<span class="badge text-bg-primary fs-6">-${pct}%</span>` + priceHtml +
                `<span class="text-decoration-line-through text-body-tertiary small fw-normal">${formatPrice(game.oldPrice)}</span>`;
  }
  $('game-price').innerHTML = priceHtml;

  const buy = $('game-buy');
  buy.dataset.name = game.title;
  buy.dataset.price = game.price;
  buy.dataset.img = game.img;
  if (game.price === 0) buy.textContent = 'Get for free';

  $('fact-dev').textContent = game.developer;
  $('fact-year').textContent = game.year;
  $('fact-genre').textContent = game.genreLabel;
  $('game-desc').textContent = game.description;

  // System requirements — Bootstrap table (console-only games get an alert instead)
  if (game.req) {
    const rows = [['Operating system', 'os'], ['Processor', 'cpu'], ['Memory', 'ram'], ['Graphics', 'gpu'], ['Storage', 'storage']];
    $('req-box').innerHTML = `
      <div class="table-responsive rounded-3 border">
        <table class="table table-striped table-hover align-middle mb-0 spec-table">
          <thead><tr><th scope="col" class="px-3 py-3">Parameter</th><th scope="col" class="px-3 py-3">Minimum</th><th scope="col" class="px-3 py-3">Recommended</th></tr></thead>
          <tbody>${rows.map(([label, key]) => `
            <tr><th scope="row" class="fw-normal text-body-secondary px-3">${label}</th><td class="px-3">${game.req.min[key]}</td><td class="px-3">${game.req.rec[key]}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } else {
    $('req-box').innerHTML = `<div class="alert alert-secondary d-flex align-items-center gap-2 mb-0" role="note">🎮 <span>${escapeHtml(game.title)} is a console game (${game.platforms.join(', ')}) — no PC requirements.</span></div>`;
  }

  // Similar games: 3 other games from the same genre (Bootstrap cards)
  const similar = GAMES.filter(g => g.genre === game.genre && g.id !== game.id).slice(0, 3);
  $('similar-genre').textContent = game.genreLabel + ' games';
  $('similar-row').innerHTML = similar.map(g => `
    <div class="col">
      <article class="card game-card h-100">
        <a href="game.html?id=${g.id}" class="d-flex flex-column flex-grow-1 text-reset text-decoration-none">
          <div class="ratio ratio-16x9"><img class="card-img-top object-fit-cover" src="${g.img}" alt="${escapeHtml(g.title)} cover"></div>
          <div class="card-body d-flex flex-column gap-1 p-3">
            <h3 class="card-title h6 fw-bold mb-0">${g.title}</h3>
            <p class="card-text small text-body-secondary mb-0">${g.developer} · ${g.year}</p>
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
    </div>`).join('');

  // Wishlist toggle + share (button states)
  // Wishlist button — saved in localStorage through the Wishlist object (js/wishlist.js)
  const wishBtn = $('wish-btn');
  const paintWish = on => {
    wishBtn.classList.toggle('active', on);
    wishBtn.setAttribute('aria-pressed', on);
    wishBtn.textContent = on ? '♥ In wishlist' : '♡ Wishlist';
  };
  paintWish(Wishlist.has(game.id));
  wishBtn.addEventListener('click', () => {
    const on = Wishlist.toggle(game);
    paintWish(on);
    if (window.SoundFX) SoundFX.play(on ? 'star' : 'click');
    showToast(on ? `${game.title} added to wishlist ♥` : 'Removed from wishlist');
  });
  initReadMore(game);
  initRating(game);

  $('share-btn').addEventListener('click', () => {
    try { navigator.clipboard.writeText(location.href); } catch {}
    showToast('Link copied');
  });
}


/* ---------- Read more ---------- */

function initReadMore(game) {
  const box = $('read-more-box');
  const btn = $('read-more-btn');
  box.innerHTML = `
    <p class="mb-2">${GENRE_INFO[game.genre] || ''}</p>
    <ul class="small mb-0 ps-3">
      <li>Developer: <strong>${escapeHtml(game.developer)}</strong>, released in ${game.year}</li>
      <li>Available on: ${game.platforms.join(', ')}</li>
      <li>Player score: ${game.rating.toFixed(1)} / 5 from ${game.reviews} reviews</li>
      <li>${game.price === 0 ? 'Free to play — no payment needed' : 'Price on NBN Games: ' + formatPrice(game.price)}</li>
    </ul>`;
  box.style.display = 'none';                       // hidden by default

  btn.addEventListener('click', () => {
    const isHidden = box.style.display === 'none';
    box.style.display = isHidden ? 'block' : 'none';
    btn.textContent = isHidden ? 'Read less ↑' : 'Read more ↓';
    btn.setAttribute('aria-expanded', String(isHidden));
    if (window.SoundFX) SoundFX.play('click');
  });
}

/* ---------- Rating stars ---------- */
function initRating(game) {
  const stars = document.querySelectorAll('.star-btn');   // NodeList of 5 buttons
  const msg = $('rate-msg');
  const KEY = 'nbn-rating-' + game.id;
  const LABELS = ['', 'Not for me 😕', 'It\'s okay 🙂', 'Good game 👍', 'Great game 🔥', 'Masterpiece! 🏆'];
  let rating = 0;
  try { rating = Number(localStorage.getItem(KEY)) || 0; } catch (e) { /* ignore */ }

  // paint stars 1..n in yellow (class), others grey
  function paint(n, cls) {
    stars.forEach(star => star.classList.toggle(cls, Number(star.dataset.value) <= n));
  }

  function setRating(n, withEffects) {
    rating = n;
    paint(rating, 'is-on');
    stars.forEach(star => {
      const on = Number(star.dataset.value) === rating;
      star.setAttribute('aria-checked', String(on));
      star.tabIndex = on || (rating === 0 && star.dataset.value === '1') ? 0 : -1;
    });
    if (rating) {
      msg.textContent = `Your rating: ${rating}/5 — ${LABELS[rating]}`;
      msg.className = 'small mb-0 fw-semibold text-warning';
    }
    if (withEffects) {
      const star = stars[rating - 1];
      star.classList.remove('pop');
      void star.offsetWidth;                         // restart animation
      star.classList.add('pop');
      if (window.SoundFX) SoundFX.play('star');
      try { localStorage.setItem(KEY, String(rating)); } catch (e) { /* ignore */ }
      if (window.showToast) showToast(`Thanks! You rated ${game.title} ${rating}/5`);
    }
  }

  stars.forEach(star => {
    const value = Number(star.dataset.value);
    star.addEventListener('mouseenter', () => paint(value, 'is-hover'));
    star.addEventListener('mouseleave', () => paint(0, 'is-hover'));
    star.addEventListener('click', () => setRating(value, true));
    star.addEventListener('keydown', e => {
      let next = rating || 1;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowUp': next = Math.min(5, (rating || 0) + 1); break;
        case 'ArrowLeft': case 'ArrowDown': next = Math.max(1, (rating || 2) - 1); break;
        default: return;
      }
      e.preventDefault();
      setRating(next, true);
      stars[next - 1].focus();
    });
  });

  setRating(rating, false);
}
