/* ==========================================================
   Assignment #5 — Dynamic Style Changes: Day / Night theme switch
   Author: Bekzat Amanbek
   Pages: every page — ☀️ / 🌙 button in the navbar.

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
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const isDay = theme === 'light';
      btn.textContent = isDay ? '🌙' : '☀️';
      btn.setAttribute('aria-label', isDay ? 'Switch to night theme' : 'Switch to day theme');
      btn.setAttribute('title', isDay ? 'Night theme' : 'Day theme');
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
        // a small spin animation on the button itself
        btn.style.transform = 'rotate(360deg) scale(1.15)';
        setTimeout(() => { btn.style.transform = ''; }, 400);
        setTimeout(() => root.classList.remove('theme-anim'), 700);
        if (window.showToast) showToast(next === 'light' ? 'Day theme ☀️' : 'Night theme 🌙');
      });
    });
  });
})();
