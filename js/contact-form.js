/* ==========================================================
   Contact form (about.html → "Get in touch")
   Author: Nurkhan Nurzhau

   Assignment #4: every field is validated in JavaScript, the error
   text is written into Bootstrap's `.invalid-feedback` under the field.

   Assignment #5 — "Responding to Events with Callbacks":
   the valid form is sent ASYNCHRONOUSLY with fetch (POST, JSON) to
   our Vercel function /api/contact — the page does NOT reload.
   sendForm(data, onSuccess, onError) takes two CALLBACK functions:
   one is called when the server answers OK, the other on an error.
   ========================================================== */

(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const success = document.getElementById('form-success');
  const failure = document.getElementById('form-error');
  const submitBtn = document.getElementById('contact-submit');
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
    const fb = el.parentElement.querySelector('.invalid-feedback');
    if (fb) fb.textContent = msg;
    return !msg;
  }

  /* Send the data with fetch and call back onSuccess / onError */
  function sendForm(data, onSuccess, onError) {
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json().then(json => ({ ok: res.ok, json })))
      .then(({ ok, json }) => (ok && json.ok ? onSuccess(json) : onError(json.error || 'Server error')))
      .catch(() => onError('No connection to the server. Please try again later.'));
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.innerHTML = on
      ? '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Sending…'
      : 'Send message';
  }

  // callback #1 — the server accepted the message
  function handleSuccess(answer) {
    setLoading(false);
    form.reset();
    tried = false;
    form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
    success.textContent = `Thanks, ${answer.name}! Your message has been sent. Ticket number: ${answer.ticket} — we'll reply within a working day.`;
    success.hidden = false;
    if (window.SoundFX) SoundFX.play('success');
  }

  // callback #2 — something went wrong
  function handleError(text) {
    setLoading(false);
    failure.textContent = '⚠️ ' + text;
    failure.hidden = false;
    if (window.SoundFX) SoundFX.play('error');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    tried = true;
    success.hidden = true;
    failure.hidden = true;
    const bad = Object.keys(RULES).map(id => form.elements[id]).filter(el => !check(el));
    if (bad.length) {
      bad[0].focus();
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      if (window.SoundFX) SoundFX.play('error');
      return;
    }

    // collect all fields into one object
    const data = Object.fromEntries(new FormData(form).entries());
    data.subscribe = form.elements.subscribe.checked;

    setLoading(true);
    sendForm(data, handleSuccess, handleError);
  });

  form.addEventListener('input', e => {
    if (tried && RULES[e.target.id]) check(e.target);
  });
})();
