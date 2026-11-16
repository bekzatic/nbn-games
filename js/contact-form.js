/* ==========================================================
   Contact form (about.html → "Get in touch")
   Author: Nurkhan Nurzhau

   1. Every field is validated in JavaScript; the error text is
      written into Bootstrap's `.invalid-feedback` under the field.
   2. A valid form is sent ASYNCHRONOUSLY with fetch (POST, JSON) to
      our Vercel function api/contact.js — the page does NOT reload.
      sendForm() uses async/await; try/catch turns every problem
      (no internet, timeout, server error) into a clear message.
   3. While the request runs, the button shows a spinner and
      "Please wait…" and is disabled (no double sending).
   4. handleSuccess / handleError are CALLBACKS: they decide what the
      user sees after the server has answered.
   ========================================================== */

(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const success = document.getElementById('form-success');
  const failure = document.getElementById('form-error');
  const submitBtn = document.getElementById('contact-submit');
  const V = window.Validators;            // shared checks: js/validators.js
  const MSG_MIN = 10;
  const MSG_MAX = 1000;
  const TOPICS = ['support', 'partnership', 'feedback'];
  // the same checks as every other form (js/validators.js) — and api/contact.js checks them AGAIN on the server
  const RULES = {
    fullname: v => V.nameError(v),                     // letters only, 2–50
    email:    v => V.emailError(v),
    platform: (v, el) => V.choiceError(el),            // a value changed in DevTools is not accepted
    message:  v => V.messageError(v, MSG_MIN, MSG_MAX) // 10–1000 characters of real words
  };
  // GitHub Pages hosts only static files → there the form talks to our Vercel function
  const API = /\.github\.io$/.test(location.hostname) ? 'https://nbngames-store.vercel.app/api/contact' : '/api/contact';
  const TIMEOUT_MS = 10000;          // no answer after 10 s → stop waiting and say so
  let tried = false;
  let sending = false;               // true while fetch() runs → a second submit is ignored

  // live counter under the message: "3 / 10 characters minimum" → "✓ 24 characters"
  const counter = document.getElementById('message-count');
  function updateCounter() {
    const n = V.clean(form.elements.message.value).length;
    counter.textContent = n < MSG_MIN ? `${n} / ${MSG_MIN} characters minimum`
                        : n > MSG_MAX ? `${n} / ${MSG_MAX} characters — too long`
                        : `✓ ${n} / ${MSG_MAX} characters`;
  }

  // checks one field, shows / hides its error text; returns true when the value is OK
  function check(el) {
    return V.setError(el, RULES[el.id](el.value, el));
  }

  // the radio buttons "Purpose of contact": exactly one of OUR values must be chosen
  function checkTopic() {
    const chosen = form.querySelector('input[name="topic"]:checked');
    return V.setError(form.elements.topic[0], chosen && TOPICS.includes(chosen.value) ? '' : 'Please choose the purpose of contact.');
  }

  /* Sends the data and returns the server's answer, e.g. { ok: true, ticket: "NBN-…" }.
     Throws an Error with a text for the user if anything goes wrong. */
  async function sendForm(data) {
    const controller = new AbortController();                       // lets us cancel fetch()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    try {
      response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
    } catch (err) {
      // fetch() itself failed: no internet, server unreachable, or our timeout
      throw new Error(err.name === 'AbortError'
        ? 'The server did not answer in time. Please try again.'
        : 'No connection to the server. Please try again later.');
    } finally {
      clearTimeout(timer);
    }

    const answer = await response.json().catch(() => ({}));        // not JSON (e.g. a 404 page) → empty object
    if (!response.ok || !answer.ok) throw new Error(answer.error || `Server error (${response.status}).`);
    return answer;
  }

  // loading state of the button: spinner + "Please wait…" + disabled
  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.setAttribute('aria-busy', String(on));
    submitBtn.innerHTML = on
      ? '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait…'
      : 'Send message';
  }

  // callback #1 — the server accepted the message
  function handleSuccess(answer) {
    form.reset();
    updateCounter();                       // the empty form starts from 0 again
    tried = false;
    success.textContent = `Thanks, ${answer.name}! Your message has been sent. Ticket number: ${answer.ticket} — we'll reply within a working day.`;
    success.hidden = false;
    if (window.SoundFX) SoundFX.play('success');
    if (window.showToast) showToast('Form submitted successfully! Ticket ' + answer.ticket, 'success');
  }

  // callback #2 — something went wrong (the text says what)
  function handleError(text) {
    failure.textContent = text;
    failure.hidden = false;
    if (window.SoundFX) SoundFX.play('error');
    if (window.showToast) showToast('Message not sent — ' + text, 'error');
  }

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;                     // already sending — no double message
    tried = true;
    success.hidden = true;
    failure.hidden = true;
    const bad = Object.keys(RULES).map(id => form.elements[id]).filter(el => !check(el));
    if (!checkTopic()) bad.push(form.elements.topic[0]);
    if (bad.length) {
      bad[0].focus();
      form.classList.remove('shake');
      void form.offsetWidth;                 // restart the shake animation
      form.classList.add('shake');
      if (window.SoundFX) SoundFX.play('error');
      return;
    }

    // collect all fields into one object
    // only the fields we know, cleaned (no extra spaces) — exactly what was checked above
    const data = {
      fullname: V.clean(form.elements.fullname.value),
      email: V.clean(form.elements.email.value).toLowerCase(),
      platform: form.elements.platform.value,
      topic: form.querySelector('input[name="topic"]:checked').value,
      message: V.clean(form.elements.message.value),
      subscribe: form.elements.subscribe.checked
    };

    sending = true;
    setLoading(true);
    const started = Date.now();
    try {
      const answer = await sendForm(data);
      await wait(1200 - (Date.now() - started));   // keep the spinner ≥ 1.2 s, so the user sees it
      handleSuccess(answer);
    } catch (err) {
      await wait(1200 - (Date.now() - started));
      handleError(err.message);
    } finally {
      setLoading(false);                           // runs after success AND after an error
      sending = false;
    }
  });

  form.addEventListener('input', e => {
    if (e.target.id === 'message') updateCounter();
    if (tried && RULES[e.target.id]) check(e.target);
  });
  form.addEventListener('change', e => {
    if (!tried) return;
    if (e.target.name === 'topic') checkTopic();
    else if (RULES[e.target.id]) check(e.target);
  });
})();
