/* ==========================================================
   NBN GAMES — shared UI behaviour (all pages)
   - The navbar hamburger menu is Bootstrap's collapse plugin.
   - showToast() uses the Bootstrap Toast component.
   - a small "back to top" button shows up after you scroll down.
   ========================================================== */

(function () {
  let toast, toastBody;

  window.showToast = function (text) {
    if (!toast) {
      const wrap = document.createElement('div');
      wrap.className = 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3';
      wrap.innerHTML =
        '<div class="toast align-items-center text-bg-dark border border-primary" role="status" aria-live="polite" aria-atomic="true">' +
        '  <div class="toast-body"></div>' +
        '</div>';
      document.body.appendChild(wrap);
      const el = wrap.querySelector('.toast');
      toastBody = el.querySelector('.toast-body');
      toast = bootstrap.Toast.getOrCreateInstance(el, { delay: 1800 });
    }
    toastBody.textContent = text;
    toast.show();
  };
})();

/* Back to top: appears after 400px of scrolling */
(function () {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-primary back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.textContent = '↑';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
})();
