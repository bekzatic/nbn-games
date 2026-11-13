/* ==========================================================
   validators.js — one set of checks for EVERY form on the site
   Team Next Step

   Course rule: the browser must NOT validate our forms. Every <form>
   has `novalidate`, and there are no required / pattern / minlength /
   maxlength / min / max / type="email" attributes. All checks are
   done here in JavaScript, and the errors are written under the
   field with Bootstrap's .is-invalid + .invalid-feedback.

   Validators.isRequired(v)        not empty (spaces don't count)
   Validators.isEmail(v)           name@domain.zone
   Validators.isStrongPassword(v)  8+ characters, a letter, a digit, a special character
   Validators.isPhone(v)           Kazakhstan: +7 7XX XXX XX XX (spaces / dashes allowed)
   Validators.passwordStrength(v)  0–4 points for the strength meter
   Validators.setError(el, text)   shows ('' = hides) the error under one field
   Validators.validateForm(rules)  checks many fields, returns the first wrong one
   Validators.liveCheck(form, rules)  after the first submit: re-check while typing
   ========================================================== */

window.Validators = (function () {
  'use strict';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // +7 or 8, then 7XX (mobile operator code), then 7 more digits; spaces and dashes are allowed
  const PHONE_RE = /^(\+7|8)[\s-]?\(?7\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

  const isRequired = value => String(value || '').trim() !== '';
  const isEmail = value => EMAIL_RE.test(String(value || '').trim());
  const isPhone = value => PHONE_RE.test(String(value || '').trim());

  // at least 8 characters, a letter, a digit and a special character (anything that is not a letter or digit)
  function isStrongPassword(value) {
    const v = String(value || '');
    return v.length >= 8 && /[A-Za-zА-Яа-яЁё]/.test(v) && /\d/.test(v) && /[^A-Za-zА-Яа-яЁё\d\s]/.test(v);
  }

  // 1 point for each rule that is met (length, letter, digit, special) → 0 … 4
  function passwordStrength(value) {
    const v = String(value || '');
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Za-zА-Яа-яЁё]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-zА-Яа-яЁё\d\s]/.test(v)) score++;
    return score;
  }

  /* Finds the error box of a field, or creates one:
     <div class="invalid-feedback" id="<field id>-error">.
     Inside an .input-group the box goes AFTER the group, so the
     rounded corners of the group stay correct. */
  function feedbackFor(el) {
    let box = document.getElementById(el.id + '-error');
    if (!box) {
      box = document.createElement('div');
      box.className = 'invalid-feedback';
      box.id = el.id + '-error';
      const anchor = el.closest('.input-group') || el.closest('.form-check') || el;
      anchor.insertAdjacentElement(anchor === el.closest('.form-check') ? 'beforeend' : 'afterend', box);
    }
    // screen readers read the error together with the field
    const ids = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (!ids.includes(box.id)) el.setAttribute('aria-describedby', ids.concat(box.id).join(' '));
    return box;
  }

  // message → red field + text under it; '' → the error disappears
  function setError(el, message) {
    const box = feedbackFor(el);
    el.classList.toggle('is-invalid', !!message);
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
    box.textContent = message;
    box.classList.toggle('d-block', !!message);   // visible even when the box is not right after the input
    return !message;
  }

  /* rules: { 'field-id': value => 'error text' or '' }
     Checks every field, shows / hides the errors and returns the
     FIRST wrong field (so the form can focus it), or null if all is OK. */
  function validateForm(rules) {
    let firstBad = null;
    Object.keys(rules).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const value = el.type === 'checkbox' ? el.checked : el.value;
      const ok = setError(el, rules[id](value, el));
      if (!ok && !firstBad) firstBad = el;
    });
    return firstBad;
  }

  /* After the first "Submit", every field is checked again while the
     user types, so the error disappears as soon as the value is right.
     Call it once; markSubmitted() switches the live check on. */
  function liveCheck(form, rules) {
    let submitted = false;
    const recheck = e => {
      if (!submitted || !rules[e.target.id]) return;
      const el = e.target;
      setError(el, rules[el.id](el.type === 'checkbox' ? el.checked : el.value, el));
    };
    form.addEventListener('input', recheck);
    form.addEventListener('change', recheck);
    return {
      markSubmitted() { submitted = true; },
      reset() {                                    // after a successful submit: clean form, no live check
        submitted = false;
        Object.keys(rules).forEach(id => { const el = document.getElementById(id); if (el) setError(el, ''); });
      }
    };
  }

  return { isRequired, isEmail, isPhone, isStrongPassword, passwordStrength, setError, validateForm, liveCheck };
})();
