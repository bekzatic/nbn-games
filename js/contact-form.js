/* ==========================================================
   Contact form validation (about.html → "Get in touch")
   Author: Nurkhan Nurzhau
   Same idea as Assignment #4 Task 1: the form has `novalidate`,
   every rule is checked in JavaScript, and the error text is written
   into Bootstrap's `.invalid-feedback` under the field.
   ========================================================== */

(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const RULES = {
    fullname: v => !v.trim() ? 'Please enter your name.'
                 : v.trim().length < 2 ? 'Name must be at least 2 characters.' : '',
    email:    v => !v.trim() ? 'Email is required.'
                 : !EMAIL_RE.test(v.trim()) ? 'Enter a valid email, e.g. name@example.com.' : '',
    message:  v => !v.trim() ? 'Please write a message.'
                 : v.trim().length < 10 ? `Message is too short (${v.trim().length}/10 characters).` : ''
  };
  let tried = false;

  function check(el) {
    const msg = RULES[el.id](el.value);
    el.classList.toggle('is-invalid', !!msg);
    el.classList.toggle('is-valid', !msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    // the feedback element sits right after the input (or after the input-group input)
    const fb = el.parentElement.querySelector('.invalid-feedback');
    if (fb) fb.textContent = msg;
    return !msg;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    tried = true;
    const success = document.getElementById('form-success');
    const bad = Object.keys(RULES).map(id => form.elements[id]).filter(el => !check(el));
    if (bad.length) { success.hidden = true; bad[0].focus(); return; }

    form.reset();
    tried = false;
    form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
    success.hidden = false;
  });

  form.addEventListener('input', e => {
    if (tried && RULES[e.target.id]) check(e.target);
  });
})();
