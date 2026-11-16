/* ==========================================================
   Vercel Serverless Function — POST /api/contact
   Receives the contact form from about.html (sent with fetch),
   checks the fields again on the server and answers with JSON.
   Nothing is stored: it is a student project, the message is only
   written to the Vercel function log.
   ========================================================== */

// the SAME checks as in the browser — so a request sent around the page (curl, DevTools) is checked too
const V = require('../js/validators.js');
const TOPICS = ['support', 'partnership', 'feedback'];
const PLATFORMS = ['pc', 'playstation', 'xbox', 'switch'];

// The GitHub Pages copy of the site (bekzatic.github.io) may call this function too
const ALLOWED_ORIGINS = ['https://bekzatic.github.io'];

module.exports = (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();   // CORS preflight

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Use POST' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  const name = V.clean(body.fullname);
  const email = V.clean(body.email).toLowerCase();
  const message = V.clean(body.message);
  const topic = String(body.topic || '');
  const platform = String(body.platform || '');

  // the first problem found → 400 with the same text the form shows under the field
  const error = V.nameError(name) || V.emailError(email) || V.messageError(message, 10, 1000)
    || (TOPICS.includes(topic) ? '' : 'Please choose the purpose of contact.')
    || (PLATFORMS.includes(platform) ? '' : 'Please choose one of the options.');
  if (error) return res.status(400).json({ ok: false, error });

  const ticket = 'NBN-' + Date.now().toString(36).toUpperCase().slice(-6);
  console.log('Contact form', ticket, { name, topic, platform });
  return res.status(200).json({ ok: true, ticket, name, receivedAt: new Date().toISOString() });
};

function safeParse(text) {
  try { return JSON.parse(text); } catch (e) { return {}; }
}
