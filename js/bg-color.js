/* ==========================================================
   Assignment #4 — Task 4: Change Background Color
   Author: Nursultan Rassulov
   Pages: every page — "🎨 Change background" button in the footer.

   How it works:
   1. COLORS is a list of predefined dark colours (the site is dark,
      so light text stays readable on all of them).
   2. Every click moves to the next colour and changes the CSS property
      document.body.style.backgroundColor. CSS `transition` makes the
      change smooth. After the last colour it starts again (cycle).
   3. The chosen colour is remembered in localStorage, so it stays the
      same when you open another page.
   ========================================================== */

(function () {
  const COLORS = [
    { name: 'Default', value: '#0b0d10' },
    { name: 'Midnight blue', value: '#0d1b2a' },
    { name: 'Deep purple', value: '#1e1033' },
    { name: 'Forest', value: '#0f2419' },
    { name: 'Wine', value: '#2a0f16' },
    { name: 'Graphite', value: '#24272e' }
  ];
  const KEY = 'nbn-bg-index';

  let index = 0;
  try { index = Number(localStorage.getItem(KEY)) || 0; } catch (e) { /* storage blocked */ }
  if (index >= COLORS.length) index = 0;

  function apply() {
    const c = COLORS[index];
    document.body.style.backgroundColor = c.value;
    document.querySelectorAll('.bg-color-name').forEach(el => { el.textContent = c.name; });
    document.querySelectorAll('.bg-color-swatch').forEach(el => { el.style.backgroundColor = c.value; });
  }

  document.querySelectorAll('[data-change-bg]').forEach(btn => {
    btn.addEventListener('click', () => {
      index = (index + 1) % COLORS.length;
      apply();
      try { localStorage.setItem(KEY, String(index)); } catch (e) { /* ignore */ }
    });
  });

  apply();
})();
