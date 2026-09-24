/* ==========================================================
   NBN GAMES — shared UI behaviour (all pages)
   - burger menu for the Flexbox navigation on small screens
   - lightbox for the Grid image gallery
   - small toast helper
   ========================================================== */

(function () {
  /* ---------- Burger menu ---------- */
  const header = document.getElementById('main-header');
  const toggle = document.querySelector('.nav-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close the menu when a link is chosen or the screen gets wider
    header.querySelectorAll('.nav-menu a').forEach(a =>
      a.addEventListener('click', () => header.classList.remove('nav-open'))
    );
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) header.classList.remove('nav-open');
    });
  }

  /* ---------- Toast ---------- */
  let toastEl;
  window.showToast = function (text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(window.showToast._t);
    window.showToast._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
  };

  /* ---------- Gallery lightbox ---------- */
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<button class="lightbox-close" aria-label="Close">×</button><img alt=""><p></p>';
  document.body.appendChild(box);

  const boxImg = box.querySelector('img');
  const boxText = box.querySelector('p');

  function open(item) {
    const img = item.querySelector('img');
    const title = item.querySelector('figcaption h3');
    boxImg.src = img.src;
    boxImg.alt = img.alt;
    boxText.textContent = title ? title.textContent : img.alt;
    box.classList.add('open');
  }

  function close() { box.classList.remove('open'); }

  items.forEach(item => {
    item.setAttribute('tabindex', '0');
    item.addEventListener('click', () => open(item));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(item); }
    });
  });

  box.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
