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
