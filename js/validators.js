/* ==========================================================
   validators.js — one set of checks for EVERY form on the site
   Team Next Step

   Course rule: the browser must NOT validate our forms. Every <form>
   has `novalidate`, and there are no required / pattern / minlength /
   maxlength / min / max / type="email" attributes. All checks are
   done here in JavaScript, and the errors are written under the
   field with Bootstrap's .is-invalid + .invalid-feedback.

   Validators.clean(v)             trims and turns many spaces into one ("  Ann   Lee " → "Ann Lee")
   Validators.isRequired(v)        not empty (spaces don't count)
   Validators.isName(v)            2–50 letters (any alphabet); one space, - or ' between parts
   Validators.isEmail(v)           name@domain.zone (no "..", no spaces, at most 254 characters)
   Validators.isStrongPassword(v)  8–64 characters, a letter, a digit, a special character, no spaces
   Validators.isPhone(v)           Kazakhstan: +7 7XX XXX XX XX (spaces / dashes allowed)
   Validators.isMessage(v)         10–1000 characters of real text (not "..........", not "aaaaaaaaaa")
   Validators.isChoice(el)         a <select> value that really is one of its options

   Ready-made error texts ('' = OK), used by every form, so the same
   field is checked the same way everywhere (no "easy" form to bypass):
   nameError, emailError, phoneError, passwordError, messageError, choiceError
   Validators.passwordStrength(v)  0–4 points for the strength meter
   Validators.setError(el, text)   shows ('' = hides) the error under one field
   Validators.validateForm(rules)  checks many fields, returns the first wrong one
   Validators.liveCheck(form, rules)  after the first submit: re-check while typing
   ========================================================== */

const Validators = (function () {
  'use strict';

  // letters/digits (also . _ % + - inside) @ domain parts separated by dots, a zone of 2+ letters
  const EMAIL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
  // \p{L} = a letter of ANY alphabet (Latin, Russian, Kazakh ә ғ қ ң ө ұ ү һ і …); parts joined by one space, - or '
  const NAME_RE = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;
  const LETTER_RE = /\p{L}/gu;
  // +7 or 8, then 7XX (mobile operator code), then 7 more digits; spaces and dashes are allowed
  const PHONE_RE = /^(\+7|8)[\s-]?\(?7\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

  const clean = value => String(value == null ? '' : value).trim().replace(/\s+/g, ' ');
  const isRequired = value => clean(value) !== '';
  const isPhone = value => PHONE_RE.test(clean(value));

  function isEmail(value) {
    const v = clean(value);
    return v.length <= 254 && !v.includes('..') && EMAIL_RE.test(v);
  }

  function isName(value) {
    const v = clean(value);
    return v.length >= 2 && v.length <= 50 && NAME_RE.test(v);
  }

  // 8–64 characters, no spaces, a letter, a digit and a special character (anything that is not a letter or digit)
  function isStrongPassword(value) {
    const v = String(value || '');
    return v.length >= 8 && v.length <= 64 && !/\s/.test(v) && /\p{L}/u.test(v) && /\d/.test(v) && /[^\p{L}\d\s]/u.test(v);
  }

  // a real message: length in [min, max], at least 5 letters and at least 3 different characters
  function isMessage(value, min = 10, max = 1000) {
    const v = clean(value);
    const letters = (v.match(LETTER_RE) || []).length;
    const different = new Set(v.toLowerCase().replace(/\s/g, '')).size;
    return v.length >= min && v.length <= max && letters >= 5 && different >= 3;
  }

  /* a <select>: the value must be one of the options the page CAME with.
     The values are remembered when the page loads, so an option or a value
     changed later in DevTools does not count. */
  const ORIGINAL_CHOICES = new WeakMap();      // <select> → Set of its values at page load
  const rememberChoices = () => {
    if (typeof document === 'undefined') return;   // Node (api/contact.js) has no page
    document.querySelectorAll('select').forEach(sel => {
      if (!ORIGINAL_CHOICES.has(sel)) ORIGINAL_CHOICES.set(sel, new Set([...sel.options].map(o => o.value)));
    });
  };
  rememberChoices();                           // this file is loaded with defer → the HTML is already there
  function isChoice(el) {
    if (!el) return false;
    const allowed = ORIGINAL_CHOICES.get(el) || new Set([...el.options].map(o => o.value));
    return allowed.has(el.value) && [...el.options].some(o => !o.disabled && o.value === el.value);
  }

  /* ---------- ready-made error texts ('' = the value is fine) ---------- */
  function nameError(value) {
    const v = clean(value);
    if (!v) return 'Please enter your name.';
    if (v.length < 2) return 'Name must be at least 2 characters.';
    if (v.length > 50) return 'Name must be at most 50 characters.';
    if (!NAME_RE.test(v)) return "Use letters only — a space, - or ' may join two parts.";
    return '';
  }
  function emailError(value) {
    const v = clean(value);
    if (!v) return 'Email is required.';
    if (v.length > 254) return 'The email is too long.';
    if (!isEmail(v)) return 'Enter a valid email, e.g. name@example.com.';
    return '';
  }
  function phoneError(value) {
    if (!isRequired(value)) return 'Phone number is required.';
    return isPhone(value) ? '' : 'Enter a Kazakhstan number: +7 7XX XXX XX XX.';
  }
  function passwordError(value) {
    const v = String(value || '');
    if (!v) return 'Password is required.';
    if (/\s/.test(v)) return 'The password must not contain spaces.';
    if (v.length > 64) return 'The password must be at most 64 characters.';
    return isStrongPassword(v) ? '' : 'Use 8+ characters with a letter, a digit and a special character.';
  }
  function messageError(value, min = 10, max = 1000) {
    const v = clean(value);
    if (!v) return 'Please write a message.';
    if (v.length < min) return `The message is too short — at least ${min} characters.`;
    if (v.length > max) return `The message is too long — at most ${max} characters.`;
    if (!isMessage(v, min, max)) return 'Please write a real message with words.';
    return '';
  }
  function choiceError(el) {
    return isChoice(el) ? '' : 'Please choose one of the options.';
  }

  // 1 point for each rule that is met (length, letter, digit, special) → 0 … 4
  function passwordStrength(value) {
    const v = String(value || '');
    let score = 0;
    if (v.length >= 8) score++;
    if (/\p{L}/u.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^\p{L}\d\s]/u.test(v)) score++;
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

  return {
    clean, isRequired, isName, isEmail, isPhone, isStrongPassword, isMessage, isChoice, passwordStrength,
    nameError, emailError, phoneError, passwordError, messageError, choiceError,
    setError, validateForm, liveCheck
  };
})();

// the browser: window.Validators — Node (our Vercel function api/contact.js): require('../js/validators.js')
if (typeof window !== 'undefined') window.Validators = Validators;
if (typeof module !== 'undefined' && module.exports) module.exports = Validators;
