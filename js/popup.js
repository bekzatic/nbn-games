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
    }, 200);
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-open-popup]').forEach(btn => btn.addEventListener('click', open));
  popup.querySelector('.popup-close').addEventListener('click', close);

  // click outside the white box = close
  popup.addEventListener('click', e => { if (!box.contains(e.target)) close(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !popup.hidden) close();
  });

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
