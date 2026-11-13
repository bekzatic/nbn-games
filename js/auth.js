/* ==========================================================
   auth.js — demo registration and login in localStorage (every page)
   Author: Bekzat Amanbek

   ⚠️  FOR LEARNING ONLY — UNSAFE ON A REAL SITE  ⚠️
   The site has no server, so the users (WITH their passwords, as
   plain text) are kept in this browser's localStorage. Anyone who
   opens DevTools → Application → Local Storage can read them.
   A real site sends the data to a server over HTTPS; the server
   stores only a password HASH (bcrypt / argon2) and gives the
   browser a session cookie or token instead.

   localStorage keys:
     "nbn-users"         array of { name, email, phone, password, createdAt }
     "nbn-current-user"  { email, name } of the person who is logged in

   Auth.register(data)   → { ok: true } or { ok: false, error: 'exists' }
   Auth.findUser(email)  → the saved user or null
   Auth.current()        → { email, name } or null
   Auth.login(email, name) / Auth.logout() / Auth.rename(name)
   On every page the navbar shows the user's first name instead of "Profile".
   ========================================================== */

window.Auth = (function () {
  'use strict';

  const USERS_KEY = 'nbn-users';
  const CURRENT_KEY = 'nbn-current-user';

  // storage can be blocked (private mode) → the site keeps working without it
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  const users = () => read(USERS_KEY, []);
  const findUser = email => users().find(u => u.email === String(email).trim().toLowerCase()) || null;

  // saves a new user; the same email can be registered only once
  function register(data) {
    const email = data.email.trim().toLowerCase();
    if (findUser(email)) return { ok: false, error: 'exists' };
    const list = users();
    list.push({ name: data.name.trim(), email, phone: data.phone.trim(), password: data.password, createdAt: new Date().toISOString() });
    write(USERS_KEY, list);
    return { ok: true };
  }

  const current = () => read(CURRENT_KEY, null);

  function login(email, name) {
    write(CURRENT_KEY, { email, name });
    paintNavbar();
  }

  function logout() {
    try { localStorage.removeItem(CURRENT_KEY); } catch (e) { /* ignore */ }
    paintNavbar();
  }

  // the display name was changed in Settings → keep the navbar in sync
  function rename(name) {
    const me = current();
    if (me) login(me.email, name);
  }

  /* Navbar: "👤 Profile" → "👤 Bekzat" while somebody is logged in.
     The label is the small <span> inside the profile button of every page. */
  function paintNavbar() {
    const me = current();
    document.querySelectorAll('a[href="profile.html"].btn').forEach(link => {
      const label = link.querySelector('span');
      if (!label) return;
      label.textContent = me ? me.name.split(/\s+/)[0] : 'Profile';
      link.title = me ? 'Profile: ' + me.name : '';
    });
  }

  document.addEventListener('DOMContentLoaded', paintNavbar);

  return { register, findUser, current, login, logout, rename };
})();
