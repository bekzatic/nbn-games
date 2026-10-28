/* ==========================================================
   Assignment #5 — Keyboard Event Handling
   Author: Nurkhan Nurzhau
   Pages: every page — the main navigation menu.

   Focus any menu link (Tab) and use the keys:
     → / ↓   next item        ← / ↑   previous item
     Home    first item       End     last item
   The list "wraps around": after the last item comes the first one.

   A `switch` statement decides what every key does.
   ========================================================== */

(function () {
  const menu = document.querySelector('#main-nav .navbar-nav');
  if (!menu) return;

  const links = Array.from(menu.querySelectorAll('.nav-link'));   // array of menu items

  menu.addEventListener('keydown', e => {
    const index = links.indexOf(document.activeElement);
    if (index === -1) return;            // focus is not on a menu link

    let next;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % links.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + links.length) % links.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = links.length - 1;
        break;
      default:
        return;                          // any other key: let the browser handle it
    }

    e.preventDefault();                  // arrows must not scroll the page
    links[next].focus();
    if (window.SoundFX) SoundFX.play('click');
  });
})();

/* ==========================================================
   Easter egg — the Konami code:  ↑ ↑ ↓ ↓ ← → ← → B A
   Author: Nurkhan Nurzhau
   An ARRAY holds the secret sequence; every keydown is compared
   with the next expected key. When the whole code is typed, the
   site switches to "Retro mode" (8-bit look + sound). Typing the
   code again switches it off.
   ========================================================== */
(function () {
  const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let position = 0;                     // how many keys of CODE are already correct

  document.addEventListener('keydown', e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === CODE[position]) {
      position++;
      if (position === CODE.length) {
        position = 0;
        toggleRetro();
      }
    } else {
      // a wrong key starts the check again — but an extra ↑ may still be the start of the code
      if (key === 'ArrowUp') position = position === 2 ? 2 : 1;
      else position = 0;
    }
  });

  function toggleRetro() {
    const on = document.documentElement.classList.toggle('retro');
    if (window.SoundFX) SoundFX.play(on ? 'success' : 'toggle');
    if (window.showToast) showToast(on ? '👾 Retro mode ON — type the code again to turn it off' : 'Retro mode OFF');
  }
})();
