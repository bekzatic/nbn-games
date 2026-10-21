/* ==========================================================
   Assignment #4 — Task 1: Form Validation
   Author: Bekzat Amanbek
   Page: profile.html → "Create account" form (#signup-form)

   How it works:
   1. The form has the `novalidate` attribute, so the browser does NOT
      show its own bubbles — all checks are done here in JavaScript.
   2. On submit we run every rule from RULES. If a field fails, we add
      Bootstrap's `.is-invalid` class and write the error text into the
      `.invalid-feedback` element under the field.
   3. After the first submit, fields are re-checked while the user types,
      so the error disappears as soon as the value becomes correct.
   4. If every field is valid, we show a success message.
   ========================================================== */

(function () {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MIN_PASSWORD = 8;

  // Each rule returns an error message, or '' when the value is fine.
  const RULES = {
    'su-name': v => {
      if (!v.trim()) return 'Please enter your name.';
      if (v.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    'su-email': v => {
      if (!v.trim()) return 'Email is required.';
      if (!EMAIL_RE.test(v.trim())) return 'Enter a valid email, e.g. name@example.com.';
      return '';
    },
    'su-password': v => {
      if (!v) return 'Password is required.';
      if (v.length < MIN_PASSWORD) return `Password must be at least ${MIN_PASSWORD} characters (now ${v.length}).`;
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Password must contain at least one letter and one number.';
      return '';
    },
    'su-confirm': v => {
      if (!v) return 'Please repeat your password.';
      if (v !== form.elements['su-password'].value) return 'Passwords do not match.';
      return '';
    },
    'su-terms': (v, el) => (el.checked ? '' : 'You must accept the terms to continue.')
  };

  let submittedOnce = false;

  function checkField(el) {
    const rule = RULES[el.id];
    if (!rule) return true;
    const message = rule(el.value, el);
    const feedback = document.getElementById(el.id + '-error');
    el.classList.toggle('is-invalid', !!message);
    el.classList.toggle('is-valid', !message && el.type !== 'checkbox');
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (feedback) feedback.textContent = message;
    return !message;
  }

  function checkAll() {
    let firstBad = null;
    Object.keys(RULES).forEach(id => {
      const el = form.elements[id];
      if (!checkField(el) && !firstBad) firstBad = el;
    });
    return firstBad;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    submittedOnce = true;
    const success = document.getElementById('signup-success');
    const firstBad = checkAll();

    if (firstBad) {
      success.hidden = true;
      firstBad.focus();
      return;
    }

    const name = form.elements['su-name'].value.trim();
    success.textContent = `Welcome, ${name}! Your account has been created (demo — no data is sent anywhere).`;
    success.hidden = false;
    form.reset();
    submittedOnce = false;
    form.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
  });

  // live re-check after the first attempt
  form.addEventListener('input', e => {
    if (!submittedOnce) return;
    checkField(e.target);
    // changing the password must also re-check the confirmation field
    if (e.target.id === 'su-password') checkField(form.elements['su-confirm']);
  });
  form.addEventListener('change', e => { if (submittedOnce) checkField(e.target); });

  // switch between "Log in" and "Create account"
  document.querySelectorAll('[data-auth-switch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const showSignup = btn.dataset.authSwitch === 'signup';
      document.getElementById('login-card').hidden = showSignup;
      document.getElementById('signup-card').hidden = !showSignup;
      (showSignup ? form.elements['su-name'] : document.getElementById('login-email')).focus();
    });
  });
})();
