/* ==========================================================
   NBN GAMES — shared UI behaviour (all pages)
   - The navbar hamburger menu is handled by Bootstrap's
     collapse plugin (bootstrap.bundle.min.js), no custom JS.
   - Small toast helper used by the cart / profile pages.
   ========================================================== */

(function () {
  let toastEl;
  window.showToast = function (text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'nbn-toast px-3 py-2 small';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(window.showToast._t);
    window.showToast._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
  };
})();
