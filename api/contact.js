/* ==========================================================
   Vercel Serverless Function — POST /api/contact
   Receives the contact form from about.html (sent with fetch),
   checks the fields again on the server and answers with JSON.
   Nothing is stored: it is a student project, the message is only
   written to the Vercel function log.
   ========================================================== */

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Use POST' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  const name = String(body.fullname || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 10) {
    return res.status(400).json({ ok: false, error: 'Please check the form fields.' });
  }

  const ticket = 'NBN-' + Date.now().toString(36).toUpperCase().slice(-6);
  console.log('Contact form', ticket, { name, topic: body.topic, platform: body.platform });
  return res.status(200).json({ ok: true, ticket, name, receivedAt: new Date().toISOString() });
};

function safeParse(text) {
  try { return JSON.parse(text); } catch (e) { return {}; }
}
