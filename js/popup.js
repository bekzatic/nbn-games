/* ==========================================================
   Assignment #4 — Task 3: Popup Subscription Form
   Author: Nurkhan Nurzhau
   Pages: every page — "Subscribe" button in the footer (and in the
          newsletter block on the home page) opens #subscribe-popup.

   How it works:
   1. The popup HTML is in every page, but has the `hidden` attribute,
      so it is invisible by default.
   2. Any element with [data-open-popup] removes `hidden` and adds the
      `.is-visible` class (fade + scale animation in CSS).
   3. The popup closes when the user:
        - clicks the × button,
        - clicks outside the white box (on the dark overlay),
        - presses Escape.
   4. The form inside checks the name and email before "subscribing".
   ========================================================== */

(function () {
  const popup = document.getElementById('subscribe-popup');
  if (!popup) return;

  const box = popup.querySelector('.popup-box');
  const form = popup.querySelector('form');
  const msg = popup.querySelector('.popup-msg');
  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    popup.hidden = false;
    requestAnimationFrame(() => popup.classList.add('is-visible'));
    document.body.style.overflow = 'hidden';
    popup.querySelector('input').focus();
  }

  function close() {
    popup.classList.remove('is-visible');
    document.body.style.overflow = '';
    setTimeout(() => {
      popup.hidden = true;
      form.reset();
      msg.textContent = '';
      msg.className = 'popup-msg small mb-0';
    }, 200);
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-open-popup]').forEach(btn => btn.addEventListener('click', open));
  popup.querySelector('.popup-close').addEventListener('click', close);

  // click outside the box = close
  popup.addEventListener('click', e => { if (!box.contains(e.target)) close(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !popup.hidden) close();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements['popup-name'].value.trim();
    const email = form.elements['popup-email'].value.trim();

    let error = '';
    if (!name) error = 'Please enter your name.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) error = 'Please enter a valid email.';

    if (error) {
      msg.textContent = error;
      msg.className = 'popup-msg small mb-0 text-danger';
      return;
    }
    msg.textContent = `Thanks, ${name}! Deals will be sent to ${email}.`;
    msg.className = 'popup-msg small mb-0 text-success';
    setTimeout(close, 1800);
  });
})();
