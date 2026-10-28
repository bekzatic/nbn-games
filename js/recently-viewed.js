/* ==========================================================
   NBN GAMES — "Recently viewed" games
   Author: Nurkhan Nurzhau

   - game.html calls RecentlyViewed.add(game) when a game is opened.
   - index.html shows the last games in #recent-row (newest first).
   Data: an ARRAY of game ids in localStorage, max 4, no duplicates.
   ========================================================== */

const RecentlyViewed = {
  KEY: 'nbn_recent',
  MAX: 4,

  ids() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; }
  },

  add(game) {
    // put this game first, remove an older copy, keep only MAX items
    const list = [game.id].concat(this.ids().filter(id => id !== game.id)).slice(0, this.MAX);
    try { localStorage.setItem(this.KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  },

  clear() {
    try { localStorage.removeItem(this.KEY); } catch (e) { /* ignore */ }
  },

  // draws the cards on the home page (needs the GAMES array from js/games-data.js)
  render() {
    const section = document.getElementById('recent-section');
    const row = document.getElementById('recent-row');
    if (!section || !row || typeof GAMES === 'undefined') return;

    const games = this.ids()
      .map(id => GAMES.find(g => g.id === id))   // id → game object
      .filter(Boolean);                          // skip ids that no longer exist

    section.hidden = games.length === 0;
    row.innerHTML = games.map(g => `
      <div class="col fade-in-up">
        <a href="game.html?id=${g.id}" class="card game-card h-100 flex-row align-items-center gap-3 p-2 text-reset text-decoration-none">
          <img src="${g.img}" alt="" class="rounded-2 object-fit-cover flex-shrink-0" width="72" height="72" loading="lazy">
          <span class="d-flex flex-column">
            <strong class="small">${g.title}</strong>
            <span class="small text-body-secondary">${g.genreLabel} · ${g.price === 0 ? 'Free' : g.price.toLocaleString('en-US').replace(/,/g, ' ') + ' ₸'}</span>
          </span>
        </a>
      </div>`).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  RecentlyViewed.render();
  const clearBtn = document.getElementById('recent-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      RecentlyViewed.clear();
      RecentlyViewed.render();
      if (window.SoundFX) SoundFX.play('click');
      if (window.showToast) showToast('History cleared');
    });
  }
});
