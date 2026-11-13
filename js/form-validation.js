/* ==========================================================
   "Create account" form — validation + registration
   Author: Bekzat Amanbek
   Page: profile.html → "Create account" form (#signup-form)

   How it works:
   1. The form has `novalidate` and no HTML validation attributes —
      every check is done here with the shared js/validators.js.
   2. On submit every rule from RULES runs; a wrong field gets
      .is-invalid and its error text under it; the first wrong field
      gets the focus. After the first submit, fields are re-checked
      while the user types (Validators.liveCheck).
   3. The strength meter under the password fills 0–4 parts while typing.
   4. If everything is valid, the user is saved in localStorage with
      Auth.register (js/auth.js). The same email can't be used twice.
   5. Then the "nbn:registered" event tells js/profile.js to log the
      new user in and show the profile.
   ========================================================== */

(function () {
  'use strict';

  const form = document.getElementById('signup-form');
  if (!form) return;
  const V = window.Validators;
  const value = id => document.getElementById(id).value;

  // Each rule returns an error message, or '' when the value is fine.
  const RULES = {
    'su-name': v => !V.isRequired(v) ? 'Please enter your name.'
                  : v.trim().length < 2 ? 'Name must be at least 2 characters.' : '',
    'su-email': v => !V.isRequired(v) ? 'Email is required.'
                   : !V.isEmail(v) ? 'Enter a valid email, e.g. name@example.com.'
                   : Auth.findUser(v) ? 'An account with this email already exists.' : '',
    'su-phone': v => !V.isRequired(v) ? 'Phone number is required.'
                   : !V.isPhone(v) ? 'Enter a Kazakhstan number: +7 7XX XXX XX XX.' : '',
    'su-password': v => !V.isRequired(v) ? 'Password is required.'
                      : !V.isStrongPassword(v) ? 'Use 8+ characters with a letter, a digit and a special character.' : '',
    'su-confirm': v => !V.isRequired(v) ? 'Please repeat your password.'
                     : v !== value('su-password') ? 'Passwords do not match.' : '',
    'su-terms': checked => (checked ? '' : 'You must accept the terms to continue.')
  };
  const live = V.liveCheck(form, RULES);

  /* ---------- password strength meter ---------- */
  const LEVELS = ['Password strength: —', 'Password strength: weak', 'Password strength: weak', 'Password strength: medium', 'Password strength: strong'];
  const bar = document.getElementById('pw-meter-bar');
  const meterText = document.getElementById('pw-meter-text');

  // 0–4 points → the bar is 0–100 % wide and changes colour (CSS classes is-1 … is-4)
  function paintMeter() {
    const score = V.passwordStrength(value('su-password'));
    bar.style.width = (score * 25) + '%';
    bar.className = 'pw-meter__bar is-' + score;
    meterText.textContent = LEVELS[score];
  }
  document.getElementById('su-password').addEventListener('input', () => {
    paintMeter();
    // changing the password must also re-check the confirmation (after the first submit)
    if (document.getElementById('su-confirm').getAttribute('aria-invalid') === 'true') {
      V.setError(document.getElementById('su-confirm'), RULES['su-confirm'](value('su-confirm')));
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    live.markSubmitted();
    const firstBad = V.validateForm(RULES);
    if (firstBad) { firstBad.focus(); return; }

    const data = { name: value('su-name'), email: value('su-email'), phone: value('su-phone'), password: value('su-password') };
    const result = Auth.register(data);
    if (!result.ok) {                       // e.g. registered in another tab a moment ago
      V.setError(document.getElementById('su-email'), 'An account with this email already exists.');
      document.getElementById('su-email').focus();
      return;
    }
    form.reset();
    live.reset();
    paintMeter();
    // js/profile.js logs the new user in and shows the profile
    document.dispatchEvent(new CustomEvent('nbn:registered', { detail: { email: data.email.trim().toLowerCase() } }));
  });

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
