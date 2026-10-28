/* ==========================================================
   Assignment #4 — Task 4: Change Background Color
   Author: Nursultan Rassulov
   Pages: every page — "🎨 Change background" button in the footer.

   How it works:
   1. COLORS has two lists of predefined colours: dark ones for the
      Night theme and light ones for the Day theme (Assignment #5),
      so the text always stays readable.
   2. Every click moves to the next colour and changes the CSS property
      document.body.style.backgroundColor. CSS `transition` makes the
      change smooth. After the last colour it starts again (cycle).
   3. The chosen colour number is remembered in localStorage.
   4. When the Day/Night theme changes (event "nbn:themechange"),
      the same colour number is re-applied from the other list.
   ========================================================== */

(function () {
  const COLORS = {
    dark: [
      { name: 'Default', value: '#0b0d10' },
      { name: 'Midnight blue', value: '#0d1b2a' },
      { name: 'Deep purple', value: '#1e1033' },
      { name: 'Forest', value: '#0f2419' },
      { name: 'Wine', value: '#2a0f16' },
      { name: 'Graphite', value: '#24272e' }
    ],
    light: [
      { name: 'Default', value: '#f6f4ef' },
      { name: 'Sky', value: '#e6f0fb' },
      { name: 'Lavender', value: '#efe9fb' },
      { name: 'Mint', value: '#e5f5ea' },
      { name: 'Peach', value: '#fbebe4' },
      { name: 'Cloud', value: '#eceef1' }
    ]
  };
  const KEY = 'nbn-bg-index';

  let index = 0;
  try { index = Number(localStorage.getItem(KEY)) || 0; } catch (e) { /* storage blocked */ }
  if (index >= COLORS.dark.length) index = 0;

  const currentList = () =>
    document.documentElement.getAttribute('data-bs-theme') === 'light' ? COLORS.light : COLORS.dark;

  function apply() {
    const c = currentList()[index];
    document.body.style.backgroundColor = c.value;
    document.querySelectorAll('.bg-color-name').forEach(el => { el.textContent = c.name; });
    document.querySelectorAll('.bg-color-swatch').forEach(el => { el.style.backgroundColor = c.value; });
  }

  document.querySelectorAll('[data-change-bg]').forEach(btn => {
    btn.addEventListener('click', () => {
      index = (index + 1) % COLORS.dark.length;
      apply();
      if (window.SoundFX) SoundFX.play('click');
      try { localStorage.setItem(KEY, String(index)); } catch (e) { /* ignore */ }
    });
  });

  document.addEventListener('nbn:themechange', apply);
  apply();
})();
