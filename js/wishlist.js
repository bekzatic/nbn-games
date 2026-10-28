/* ==========================================================
   NBN GAMES — Wishlist (shared by every page)
   Author: Nursultan Rassulov

   Wishlist is an OBJECT with METHODS; the games are kept in an
   ARRAY of objects { id, title, img, price } in localStorage, so
   the list survives page reloads.
   The ♥ counter in the navbar (.wish-badge) is updated everywhere.
   ========================================================== */

const Wishlist = {
  KEY: 'nbn_wishlist',

  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; }
  },

  save(list) {
    try { localStorage.setItem(this.KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
    this.paintBadge(true);
  },

  has(id) {
    return this.all().some(g => g.id === id);
  },

  // adds the game, or removes it when it is already there; returns true if it is now in the list
  toggle(game) {
    const list = this.all();
    const inList = list.some(g => g.id === game.id);
    this.save(inList ? list.filter(g => g.id !== game.id)
                     : list.concat({ id: game.id, title: game.title, img: game.img, price: game.price }));
    return !inList;
  },

  remove(id) {
    this.save(this.all().filter(g => g.id !== id));
  },

  paintBadge(animate) {
    const count = this.all().length;
    document.querySelectorAll('.wish-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
      badge.parentElement.setAttribute('aria-label', count ? `Wishlist, ${count} game${count === 1 ? '' : 's'}` : 'Wishlist, empty');
      badge.setAttribute('aria-hidden', 'true');
      if (animate) {
        badge.classList.remove('bump');
        void badge.offsetWidth;
        badge.classList.add('bump');
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Wishlist.paintBadge(false));
