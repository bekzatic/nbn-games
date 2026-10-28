/* ==========================================================
   Assignment #4 — Task 3: Popup Subscription Form
   Author: Nurkhan Nurzhau
   Pages: every page — "Subscribe" button in the footer opens #subscribe-popup.

   The markup uses Bootstrap's modal classes (modal, modal-dialog,
   modal-content, modal-backdrop, fade/show) for the look, but the
   opening and closing logic is written by us — no data-bs-toggle.

   How it works:
   1. The popup has the `hidden` attribute → invisible by default.
   2. open(): remove `hidden`, show it (display:block), add a dark
      `.modal-backdrop` behind it and the `show` class (Bootstrap fades it in).
   3. The popup closes when the user:
        - clicks the × button,
        - clicks outside the white box (on the dark area),
        - presses Escape.
   4. The form inside checks the name and email before "subscribing".
   5. Accessibility: while the popup is open, Tab / Shift+Tab stay inside it
      (focus trap) and the rest of the page is marked `inert`.
   ========================================================== */

(function () {
  const popup = document.getElementById('subscribe-popup');
  if (!popup) return;

  const box = popup.querySelector('.modal-content');
  const form = popup.querySelector('form');
  const msg = popup.querySelector('.popup-msg');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let backdrop = null;
  let lastFocused = null;

  // everything on the page except the popup (made inert while it is open)
  const pageParts = () => Array.from(document.body.children).filter(el => el !== popup && el.tagName !== 'SCRIPT' && !el.classList.contains('modal-backdrop'));

  function open() {
    lastFocused = document.activeElement;
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade';
    document.body.appendChild(backdrop);
    document.body.classList.add('modal-open');   // Bootstrap: stops page scrolling

    popup.hidden = false;
    popup.style.display = 'block';
    void popup.offsetHeight;                      // reflow → fade animation works
    popup.classList.add('show');
    backdrop.classList.add('show');
    popup.querySelector('input').focus();
  }

  function close() {
    popup.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      popup.style.display = '';
      popup.hidden = true;
      if (backdrop) { backdrop.remove(); backdrop = null; }
      form.reset();
      form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      msg.textContent = '';
      msg.className = 'popup-msg small mt-3 mb-0';
      pageParts().forEach(el => { el.inert = false; });   // page is usable again…
      if (lastFocused) lastFocused.focus();                // …so focus can go back to the button
    }, 200);
  }

  document.querySelectorAll('[data-open-popup]').forEach(btn => btn.addEventListener('click', open));
  popup.querySelector('.popup-close').addEventListener('click', close);

  // click outside the white box = close
  popup.addEventListener('click', e => { if (!box.contains(e.target)) close(); });

  document.addEventListener('keydown', e => {
    if (popup.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {                       // focus trap: cycle inside the popup
      const items = Array.from(popup.querySelectorAll('button, input, [href], select, textarea'))
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // mark the page behind the popup as inert / give it back
  new MutationObserver(() => {
    const open = !popup.hidden;
    pageParts().forEach(el => { el.inert = open; });
  }).observe(popup, { attributes: true, attributeFilter: ['hidden'] });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nameEl = form.elements['popup-name'];
    const emailEl = form.elements['popup-email'];
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();

    nameEl.classList.toggle('is-invalid', !name);
    emailEl.classList.toggle('is-invalid', !EMAIL_RE.test(email));

    if (!name || !EMAIL_RE.test(email)) {
      msg.textContent = !name ? 'Please enter your name.' : 'Please enter a valid email.';
      msg.className = 'popup-msg small mt-3 mb-0 text-danger';
      return;
    }
    msg.textContent = `Thanks, ${name}! Deals will be sent to ${email}.`;
    msg.className = 'popup-msg small mt-3 mb-0 text-success';
    setTimeout(close, 1800);
  });
})();
