/* =========================================================
   Profile page — demo accounts + per-user data.
   Changes (balance, settings, password…) are kept in this
   browser's localStorage, so they survive a page reload.
   NOTE: a real site would do all of this on a server.
   ========================================================= */
const ACCOUNTS = {
  'bekzat@nbngames.kz': {
    password: 'bekzat123', name: 'Bekzat Amanbek', balance: 18200, joined: 'September 2, 2025',
    library: ['Cyberpunk 2077', 'Elden Ring', 'Forza Horizon 5']
  },
  'nurkhan@nbngames.kz': {
    password: 'nurkhan123', name: 'Nurkhan Nurzhau', balance: 9450, joined: 'September 5, 2025',
    library: ['Grand Theft Auto V', 'The Witcher 3']
  },
  'nursultan@nbngames.kz': {
    password: 'nursultan123', name: 'Nursultan Rassulov', balance: 25000, joined: 'September 10, 2025',
    library: ["Baldur's Gate 3", 'God of War', 'Gran Turismo 7', 'DOOM Eternal']
  }
};

const COVERS = {
  'Cyberpunk 2077': 'Cyberpunk_2077.jpg', 'Elden Ring': 'Elden_Ring.jpg',
  'Forza Horizon 5': 'Forza_Horizon_5.jpg', 'Grand Theft Auto V': 'Grand_Theft_Auto_V.png',
  'The Witcher 3': 'Witcher_3_cover_art.jpg', "Baldur's Gate 3": 'Baldurs_Gate_3.jpg',
  'God of War': 'God_of_War_Ragnarok_cover.jpg', 'Gran Turismo 7': 'Gran_Turismo_7_cover_art.jpg',
  'DOOM Eternal': 'Doom_Eternal.png'
};

const NOTIFICATIONS = [
  { id: 'n1', icon: '🔥', title: 'Weekend sale: up to −40%', text: 'Cyberpunk 2077 and other RPGs are on sale until Sunday.', time: '2 hours ago' },
  { id: 'n2', icon: '🎁', title: 'Promo code for you', text: 'Use NEXTSTEP in the cart to get −10% on your next order.', time: 'Yesterday' },
  { id: 'n3', icon: '🎮', title: 'New in catalog', text: 'Farming Simulator 25 and F1 25 are now available.', time: '3 days ago' },
  { id: 'n4', icon: '🔒', title: 'New login', text: 'Your account was accessed from Chrome on Windows.', time: 'Last week' }
];

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const slugify = t => t.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const tenge = n => n.toLocaleString('en-US').replace(/,/g, ' ') + ' ₸';
const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/* ---------- storage helpers (wrapped: storage can be blocked) ---------- */
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function session(action, value) {
  try {
    if (action === 'get') return sessionStorage.getItem('nbn_logged_in');
    if (action === 'set') sessionStorage.setItem('nbn_logged_in', value);
    if (action === 'del') sessionStorage.removeItem('nbn_logged_in');
  } catch { return null; }
}

/* The user's saved data = defaults from ACCOUNTS + whatever they changed */
let email = null;
let user = null;

function loadUser(mail) {
  const acc = ACCOUNTS[mail];
  const defaults = {
    name: acc.name, country: 'Kazakhstan', platform: 'PC', currency: '₸ Tenge', visibility: 'public',
    balance: acc.balance, password: acc.password,
    transactions: [{ label: 'Welcome bonus', amount: acc.balance, date: acc.joined }],
    twoFA: false, alerts: true,
    prefs: { deals: true, releases: true, receipts: true, newsletter: false },
    read: [], sessionsCleared: false,
    plays: {}                       // { 'Elden Ring': 3, ... } — how many times each game was launched
  };
  return Object.assign(defaults, load('nbn_user_' + mail, {}));
}
function saveUser() { save('nbn_user_' + email, user); }

/* ---------- Login / logout ---------- */
const body = document.body;
const loginGate = $('login-gate');
const profileContent = $('profile-content');
const loginForm = $('login-form');
const loginError = $('login-error');

function passwordFor(mail) {
  const saved = load('nbn_user_' + mail, {});
  return saved.password || ACCOUNTS[mail].password;
}

function showProfile(mail) {
  email = mail;
  user = loadUser(mail);
  loginGate.hidden = true;
  profileContent.hidden = false;
  $('profile-aside').classList.remove('d-none');  // sidebar column appears (col-lg-3)
  session('set', mail);
  renderAll();
  openSection((location.hash || '#profile').slice(1));
}

function showLogin() {
  email = null; user = null;
  loginGate.hidden = false;
  profileContent.hidden = true;
  $('profile-aside').classList.add('d-none');     // main column is centred alone
  session('del');
  loginForm.reset();
  loginError.hidden = true;
  history.replaceState(null, '', location.pathname);
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const mail = $('login-email').value.trim().toLowerCase();
  if (ACCOUNTS[mail] && passwordFor(mail) === $('login-password').value) {
    loginError.hidden = true;
    showProfile(mail);
  } else {
    loginError.hidden = false;
  }
});

$('logout-link').addEventListener('click', e => { e.preventDefault(); showLogin(); });

/* ---------- Sidebar: switch between panels ---------- */
const SECTIONS = ['profile', 'games', 'wishlist', 'wallet', 'settings', 'security', 'notifications'];

function openSection(name) {
  if (!SECTIONS.includes(name)) name = 'profile';
  $$('.panel').forEach(p => p.hidden = p.dataset.panel !== name);
  $$('#profile-sidebar a[data-section]').forEach(a => a.classList.toggle('active', a.dataset.section === name));
  history.replaceState(null, '', '#' + name);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', e => {
  const link = e.target.closest('[data-section], [data-goto]');
  if (!link || !email) return;
  e.preventDefault();
  openSection(link.dataset.section || link.dataset.goto);
});

/* ---------- Render everything that depends on the user ---------- */
function renderAll() {
  const acc = ACCOUNTS[email];
  $$('.js-name').forEach(el => el.textContent = user.name);
  $$('.js-initials').forEach(el => el.textContent = user.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
  $$('.js-email').forEach(el => el.textContent = email);
  $$('.js-balance').forEach(el => el.textContent = tenge(user.balance));
  $$('.js-library-count').forEach(el => el.textContent = acc.library.length);
  $('profile-joined').textContent = acc.joined;
  $('profile-joined-short').textContent = acc.joined.split(' ').slice(-1)[0];
  $('info-country').textContent = user.country;
  $('info-platform').textContent = user.platform;
  renderLibrary();
  renderWishlist();
  renderTransactions();
  fillSettings();
  renderSecurity();
  renderNotifications();
}

/* ---------- My games ---------- */
function renderLibrary() {
  const q = $('library-search').value.trim().toLowerCase();
  const games = ACCOUNTS[email].library.filter(t => t.toLowerCase().includes(q));
  $('library-grid').innerHTML = games.map(title => `
    <div class="col">
      <article class="card game-card h-100">
        <a href="game.html?id=${slugify(title)}" class="d-flex flex-column flex-grow-1 text-reset text-decoration-none">
          <div class="ratio ratio-16x9"><img class="card-img-top object-fit-cover" src="images/${COVERS[title] || ''}" alt="${title} cover"></div>
          <div class="card-body p-3">
            <h3 class="card-title h6 fw-bold mb-1">${title}</h3>
            <p class="card-text small text-body-secondary mb-0 js-plays">${playsText(title)}</p>
          </div>
        </a>
        <div class="card-footer border-0 px-3 pb-3 pt-0">
          <button type="button" class="btn btn-primary btn-sm w-100 play-btn position-relative overflow-hidden" data-title="${title.replace(/"/g, '&quot;')}"><span class="play-progress" aria-hidden="true"></span><span class="play-label position-relative">▶ Play</span></button>
        </div>
      </article>
    </div>`).join('');
  $('library-empty').hidden = games.length !== 0;
}

$('library-search').addEventListener('input', renderLibrary);

// "Played 3 times" / "Not played yet" — text from the user's plays object
function playsText(title) {
  const n = (user.plays || {})[title] || 0;
  switch (n) {
    case 0:  return 'In your library · not played yet';
    case 1:  return 'Played once';
    default: return `Played ${n} times`;
  }
}

/* ▶ Play: a progress bar fills the button (animation), a sound plays,
   then the launch counter for this game is saved for the user. */
$('library-grid').addEventListener('click', e => {
  const btn = e.target.closest('.play-btn');
  if (!btn || btn.disabled) return;
  const title = btn.dataset.title;
  const label = btn.querySelector('.play-label');
  const bar = btn.querySelector('.play-progress');
  btn.disabled = true;
  label.textContent = 'Launching… 0%';
  if (window.SoundFX) SoundFX.play('whoosh');

  let percent = 0;
  const timer = setInterval(() => {
    percent = Math.min(100, percent + 10);
    bar.style.width = percent + '%';                 // dynamic style
    label.textContent = `Launching… ${percent}%`;
    if (percent === 100) {
      clearInterval(timer);
      user.plays = user.plays || {};
      user.plays[title] = (user.plays[title] || 0) + 1;
      saveUser();
      label.textContent = '🎮 Have fun!';
      btn.closest('.card').querySelector('.js-plays').textContent = playsText(title);
      if (window.SoundFX) SoundFX.play('success');
      showToast(`${title} is running — have fun!`);
      setTimeout(() => {
        bar.style.width = '0';
        label.textContent = '▶ Play';
        btn.disabled = false;
      }, 1500);
    }
  }, 120);
});

/* ---------- Wishlist (data from js/wishlist.js) ---------- */
function renderWishlist() {
  const list = Wishlist.all();
  $$('.js-wish-count').forEach(el => el.textContent = list.length);
  $('wish-grid').innerHTML = list.map(g => `
    <div class="col">
      <article class="card game-card h-100" data-id="${g.id}">
        <a href="game.html?id=${g.id}" class="d-flex flex-column flex-grow-1 text-reset text-decoration-none">
          <div class="ratio ratio-16x9"><img class="card-img-top object-fit-cover" src="${g.img}" alt="${g.title.replace(/"/g, '&quot;')} cover"></div>
          <div class="card-body p-3">
            <h3 class="card-title h6 fw-bold mb-1">${g.title}</h3>
            <p class="card-text small fw-semibold mb-0">${g.price === 0 ? 'Free' : tenge(g.price)}</p>
          </div>
        </a>
        <div class="card-footer border-0 px-3 pb-3 pt-0">
          <div class="btn-group btn-group-sm w-100" role="group" aria-label="${g.title.replace(/"/g, '&quot;')} actions">
            <button type="button" class="btn btn-primary add-to-cart-btn" data-name="${g.title.replace(/"/g, '&quot;')}" data-price="${g.price}" data-img="${g.img}">Add to cart</button>
            <button type="button" class="btn btn-outline-light wish-remove">Remove ♥</button>
          </div>
        </div>
      </article>
    </div>`).join('');
  $('wish-empty').hidden = list.length !== 0;
}

$('wish-grid').addEventListener('click', e => {
  const btn = e.target.closest('.wish-remove');
  if (!btn) return;
  Wishlist.remove(btn.closest('[data-id]').dataset.id);
  if (window.SoundFX) SoundFX.play('click');
  renderWishlist();
});

/* ---------- Wallet ---------- */
function renderTransactions() {
  $('tx-list').innerHTML = user.transactions.slice().reverse().map(t => `
    <li class="list-group-item d-flex align-items-center gap-3 py-3">
      <span aria-hidden="true">${t.amount >= 0 ? '➕' : '➖'}</span>
      <span class="d-flex flex-column flex-grow-1"><strong>${t.label}</strong><small class="text-body-tertiary">${t.date}</small></span>
      <span class="fw-bold ${t.amount >= 0 ? 'text-success' : 'text-primary'}">${t.amount >= 0 ? '+' : '−'}${tenge(Math.abs(t.amount))}</span>
    </li>`).join('');
}

$('amount-chips').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  $$('#amount-chips .chip').forEach(c => c.classList.toggle('active', c === chip));
  $('topup-amount').value = chip.dataset.amount;
});

$('topup-form').addEventListener('submit', e => {
  e.preventDefault();
  const amount = parseInt($('topup-amount').value.replace(/\s/g, ''), 10);
  const msg = $('topup-msg');
  if (!amount || amount < 100 || amount > 500000) {
    msg.textContent = 'Enter an amount between 100 and 500 000 ₸.';
    msg.className = 'small mb-3 text-danger';
    return;
  }
  user.balance += amount;
  user.transactions.push({ label: 'Top up · ' + $('topup-method').value, amount, date: today() });
  saveUser();
  renderAll();
  $('topup-form').reset();
  $$('#amount-chips .chip').forEach(c => c.classList.remove('active'));
  msg.textContent = `Done! ${tenge(amount)} added to your wallet.`;
  msg.className = 'small mb-3 text-success';
  showToast('Balance topped up');
});

/* ---------- Settings ---------- */
function fillSettings() {
  $('set-name').value = user.name;
  $('set-country').value = user.country;
  $('set-platform').value = user.platform;
  $('set-currency').value = user.currency;
  $$('input[name="visibility"]').forEach(r => r.checked = r.value === user.visibility);
}

$('settings-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('set-name').value.trim();
  if (!name) return;
  user.name = name;
  user.country = $('set-country').value;
  user.platform = $('set-platform').value;
  user.currency = $('set-currency').value;
  user.visibility = document.querySelector('input[name="visibility"]:checked').value;
  saveUser();
  renderAll();
  showToast('Settings saved');
});

$('settings-reset').addEventListener('click', () => { fillSettings(); showToast('Changes discarded'); });

/* ---------- Security ---------- */
function renderSecurity() {
  $('sec-2fa').checked = user.twoFA;
  $('sec-alerts').checked = user.alerts;
  const sessions = [{ device: '💻 This browser', place: 'Astana, Kazakhstan · now', current: true }];
  if (!user.sessionsCleared) {
    sessions.push({ device: '📱 iPhone · NBN app', place: 'Astana, Kazakhstan · 2 days ago' });
    sessions.push({ device: '🖥️ Windows · Chrome', place: 'Almaty, Kazakhstan · last week' });
  }
  $('session-list').innerHTML = sessions.map(s => `
    <li class="list-group-item d-flex justify-content-between align-items-center gap-2 px-0">
      <span class="d-flex flex-column">${s.device}<small class="text-body-tertiary">${s.place}</small></span>${s.current ? '<span class="badge rounded-pill border border-success text-success">Current</span>' : ''}</li>`).join('');
  $('sessions-out').disabled = !!user.sessionsCleared;
}

$('password-form').addEventListener('submit', e => {
  e.preventDefault();
  const msg = $('pw-msg');
  const current = $('pw-current').value, next = $('pw-new').value, again = $('pw-confirm').value;
  let error = '';
  if (current !== user.password) error = 'Current password is incorrect.';
  else if (next.length < 6) error = 'New password must be at least 6 characters.';
  else if (next !== again) error = 'The new passwords do not match.';
  else if (next === current) error = 'The new password must be different.';
  if (error) { msg.textContent = error; msg.className = 'small mb-3 text-danger'; return; }
  user.password = next;
  saveUser();
  $('password-form').reset();
  msg.textContent = 'Password updated. Use it the next time you log in.';
  msg.className = 'small mb-3 text-success';
  showToast('Password changed');
});

$('sec-2fa').addEventListener('change', e => {
  user.twoFA = e.target.checked; saveUser();
  showToast(user.twoFA ? 'Two-factor authentication on' : 'Two-factor authentication off');
});
$('sec-alerts').addEventListener('change', e => {
  user.alerts = e.target.checked; saveUser();
  showToast(user.alerts ? 'Login alerts on' : 'Login alerts off');
});
$('sessions-out').addEventListener('click', () => {
  user.sessionsCleared = true; saveUser(); renderSecurity();
  showToast('Other devices logged out');
});

/* ---------- Notifications ---------- */
function renderNotifications() {
  const unread = NOTIFICATIONS.filter(n => !user.read.includes(n.id)).length;
  const badge = $('notif-badge');
  badge.textContent = unread;
  badge.hidden = unread === 0;
  $('notif-read-all').disabled = unread === 0;
  $('notif-list').innerHTML = NOTIFICATIONS.map(n => `
    <li class="list-group-item d-flex align-items-start gap-3 py-3 ${user.read.includes(n.id) ? '' : 'border-start border-3 border-primary'}" role="button" data-id="${n.id}">
      <span class="fs-5" aria-hidden="true">${n.icon}</span>
      <span class="d-flex flex-column flex-grow-1 gap-1"><strong>${n.title}</strong><span class="small text-body-secondary">${n.text}</span><small class="text-body-tertiary">${n.time}</small></span>
      ${user.read.includes(n.id) ? '' : '<button type="button" class="btn btn-link btn-sm text-nowrap p-0">Mark read</button>'}
    </li>`).join('');
  $$('[data-pref]').forEach(input => input.checked = !!user.prefs[input.dataset.pref]);
}

$('notif-list').addEventListener('click', e => {
  const li = e.target.closest('li[data-id]');
  if (!li || user.read.includes(li.dataset.id)) return;
  user.read.push(li.dataset.id);
  saveUser();
  renderNotifications();
});

$('notif-read-all').addEventListener('click', () => {
  user.read = NOTIFICATIONS.map(n => n.id);
  saveUser();
  renderNotifications();
  showToast('All notifications marked as read');
});

$$('[data-pref]').forEach(input => input.addEventListener('change', () => {
  user.prefs[input.dataset.pref] = input.checked;
  saveUser();
  showToast('Email preferences saved');
}));

/* ---------- Start ---------- */
const savedEmail = session('get');
if (savedEmail && ACCOUNTS[savedEmail]) showProfile(savedEmail);
