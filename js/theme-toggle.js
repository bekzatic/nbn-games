/* ==========================================================
   Day / Night theme switch
   Author: Bekzat Amanbek
   Pages: every page — the sun / moon switch in the navbar.

   This file is loaded in <head> (not at the bottom), so the saved
   theme is applied BEFORE the page is drawn — no white/black flash.

   How it works:
   1. Bootstrap 5.3 reads the `data-bs-theme` attribute on <html>.
      We switch it between "dark" (Night) and "light" (Day).
   2. css/theme.css has NBN colours for both themes, so every
      Bootstrap component changes colour by itself.
   3. The choice is saved in localStorage and a custom event
      "nbn:themechange" is sent, so other scripts (bg-color.js)
      can react to the new theme.
   ========================================================== */

(function () {
  const KEY = 'nbn-theme';
  const root = document.documentElement;

  function savedTheme() {
    try { return localStorage.getItem(KEY) || 'dark'; } catch (e) { return 'dark'; }
  }

  function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme);
    // the browser bar on phones gets the same colour as the page background (--nbn-bg in css/theme.css)
    const bar = document.querySelector('meta[name="theme-color"]');
    if (bar) bar.setAttribute('content', theme === 'light' ? '#f6f4ef' : '#0b0d10');
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const isDay = theme === 'light';
      // the switch is a toggle button: "Day theme" pressed = Day, not pressed = Night (CSS moves the knob)
      btn.setAttribute('aria-pressed', String(isDay));
      btn.setAttribute('title', isDay ? 'Switch to night theme' : 'Switch to day theme');
    });
    document.dispatchEvent(new CustomEvent('nbn:themechange', { detail: { theme } }));
  }

  // 1) right away, before the body is painted
  root.setAttribute('data-bs-theme', savedTheme());

  // 2) when the page is ready — paint the buttons and listen for clicks
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(savedTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = root.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
        root.classList.add('theme-anim');                 // smooth colour change (CSS transition)
        applyTheme(next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
        if (window.SoundFX) SoundFX.play('toggle');
        setTimeout(() => root.classList.remove('theme-anim'), 700);
        if (window.showToast) showToast(next === 'light' ? 'Day theme' : 'Night theme', 'info');
      });
    });
  });
})();
