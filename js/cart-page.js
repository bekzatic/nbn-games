/* ==========================================================
   cart.html — cart page + multi-step checkout
   Author: Nursultan Rassulov
   Cart data helpers (getCart, saveCart...) are in js/cart.js.

   Assignment #5 features:
   - Quantity buttons − / + and Remove (event delegation, switch on the action).
   - Multi-step checkout: "Next" / "Back" call showStep() — a CALLBACK
     that shows the right step. The `order` object keeps every value
     the user typed, so going Back never loses the data.
   - Sounds and animations: confetti when the order is placed.
   ========================================================== */

// messages go through main.js; if that file did not load, the page keeps working without them
const toast = text => { if (window.showToast) window.showToast(text); };

// if js/cart.js did not load, use an empty read-only cart so the page still opens
const CART_MISSING = typeof getCart !== 'function';
if (CART_MISSING) {
  window.getCart = () => [];
  window.saveCart = () => {};
  window.removeFromCart = () => [];
}

const cartItemsEl = document.getElementById('cart-items');
const headingEl = document.getElementById('cart-heading');
const sumItemsEl = document.getElementById('sum-items');
const sumTotalEl = document.getElementById('sum-total');
const discountRow = document.getElementById('discount-row');
const sumDiscountEl = document.getElementById('sum-discount');
let promo = 0; // discount rate

function formatTenge(n) {
  return n.toLocaleString('en-US').replace(/,/g, ' ') + ' ₸';
}

function cartTotals() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = Math.round(total * promo);
  return { count: cart.reduce((s, i) => s + i.qty, 0), total, discount, toPay: total - discount };
}

function renderCart() {
  const cart = getCart();
  const totals = cartTotals();
  headingEl.textContent = `Your cart (${totals.count})`;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <li class="empty-state rounded-3 text-center p-5">
        <span class="fs-1 d-block mb-2" aria-hidden="true">🛒</span>
        <h2 class="h5">Your cart is empty</h2>
        <p class="text-body-secondary">Head to the catalog to find your next game.</p>
        <a href="catalog.html" class="btn btn-primary">Browse catalog</a>
      </li>`;
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <li class="card cart-item fade-in-up" data-name="${item.name.replace(/"/g, '&quot;')}">
        <div class="card-body d-flex flex-wrap flex-sm-nowrap align-items-center gap-3 p-3">
          <img src="${item.img}" alt="${item.name} cover" class="rounded-2 flex-shrink-0 object-fit-cover" width="84" height="56">
          <div class="flex-grow-1">
            <h3 class="h6 fw-bold mb-1">${item.name}</h3>
            <p class="small text-body-secondary mb-0">Digital key · ${formatTenge(item.price)} each</p>
          </div>
          <div class="btn-group btn-group-sm" role="group" aria-label="Quantity of ${item.name.replace(/"/g, '&quot;')}">
            <button class="btn btn-outline-light" type="button" data-action="minus" aria-label="One less">−</button>
            <span class="btn btn-outline-light disabled fw-semibold" aria-live="polite">${item.qty}</span>
            <button class="btn btn-outline-light" type="button" data-action="plus" aria-label="One more">+</button>
          </div>
          <div class="d-flex flex-sm-column align-items-center align-items-sm-end gap-2 ms-auto">
            <span class="fw-semibold">${formatTenge(item.price * item.qty)}</span>
            <button class="btn btn-outline-danger btn-sm" type="button" data-action="remove">Remove</button>
          </div>
        </div>
      </li>
    `).join('');
  }

  sumItemsEl.textContent = formatTenge(totals.total);
  discountRow.hidden = !totals.discount;
  sumDiscountEl.textContent = '−' + formatTenge(totals.discount);
  sumTotalEl.textContent = formatTenge(totals.toPay);
}

/* change the quantity of one item */
function changeQty(name, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  saveCart(item.qty > 0 ? cart : cart.filter(i => i.name !== name));
}

cartItemsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const name = btn.closest('.cart-item').dataset.name;
  switch (btn.dataset.action) {
    case 'plus':
      changeQty(name, +1);
      if (window.SoundFX) SoundFX.play('add');
      break;
    case 'minus':
      changeQty(name, -1);
      if (window.SoundFX) SoundFX.play('click');
      break;
    case 'remove':
      removeFromCart(name);
      if (window.SoundFX) SoundFX.play('error');
      toast(`${name} removed`);
      break;
  }
  renderCart();
if (CART_MISSING) {
  cartItemsEl.innerHTML = '<li class="alert alert-warning mb-0" role="alert">The cart could not load right now. Please refresh the page.</li>';
  document.getElementById('checkout-btn').disabled = true;
}
});

document.getElementById('promo-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('promo-input');
  const code = input.value.trim().toUpperCase();
  if (code === 'NEXTSTEP') {
    promo = 0.1;
    toast('Promo code applied: −10%');
    if (window.SoundFX) SoundFX.play('success');
  } else {
    promo = 0;
    toast('Unknown promo code');
    if (window.SoundFX) SoundFX.play('error');
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
  }
  renderCart();
if (CART_MISSING) {
  cartItemsEl.innerHTML = '<li class="alert alert-warning mb-0" role="alert">The cart could not load right now. Please refresh the page.</li>';
  document.getElementById('checkout-btn').disabled = true;
}
});

/* ==========================================================
   Multi-step checkout
   ========================================================== */
const Checkout = {
  step: 1,
  LAST: 3,
  // the data typed by the user — kept between the steps
  order: { name: '', email: '', platform: 'Steam (PC)', method: 'NBN Wallet', gift: false },

  el: {
    section: document.getElementById('checkout'),
    form: document.getElementById('checkout-form'),
    steps: document.querySelectorAll('.checkout-step'),
    dots: document.querySelectorAll('[data-step-dot]'),
    progress: document.getElementById('checkout-progress'),
    back: document.getElementById('co-back'),
    next: document.getElementById('co-next'),
    review: document.getElementById('checkout-review'),
    done: document.getElementById('order-done')
  },

  EMAIL_RE: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,

  // read the inputs of the form into this.order
  saveInputs() {
    const f = this.el.form.elements;
    this.order.name = f.name.value.trim();
    this.order.email = f.email.value.trim();
    this.order.platform = f.platform.value;
    this.order.method = f.method.value;
    this.order.gift = f.gift.checked;
  },

  // check the current step; returns true when it is OK
  validate(step) {
    const f = this.el.form.elements;
    const mark = (el, ok) => { el.classList.toggle('is-invalid', !ok); return ok; };
    switch (step) {
      case 1: {
        const okName = mark(f.name, this.order.name.length >= 2);
        const okEmail = mark(f.email, this.EMAIL_RE.test(this.order.email));
        return okName && okEmail;
      }
      case 3:
        return mark(document.getElementById('co-agree'), document.getElementById('co-agree').checked);
      default:
        return true;                         // step 2 has defaults for everything
    }
  },

  // the callback used by Next / Back: shows exactly one step
  showStep(n) {
    this.step = n;
    this.el.steps.forEach(stepEl => { stepEl.hidden = Number(stepEl.dataset.step) !== n; });
    this.el.dots.forEach(dot => {
      const d = Number(dot.dataset.stepDot);
      dot.classList.toggle('is-active', d === n);
      dot.classList.toggle('is-done', d < n);
    });
    const pct = Math.round((n / this.LAST) * 100);
    this.el.progress.style.width = pct + '%';
    this.el.progress.parentElement.setAttribute('aria-valuenow', pct);
    this.el.back.style.visibility = n === 1 ? 'hidden' : 'visible';
    this.el.next.textContent = n === this.LAST ? `Place order · ${formatTenge(cartTotals().toPay)}` : 'Next →';
    if (n === this.LAST) this.renderReview();
    const firstInput = this.el.steps[n - 1].querySelector('input, select');
    if (firstInput) firstInput.focus();
  },

  renderReview() {
    const t = cartTotals();
    const rows = [
      ['Name', this.order.name],
      ['Email', this.order.email],
      ['Keys for', this.order.platform],
      ['Payment', this.order.method],
      ['Gift', this.order.gift ? 'Yes 🎁' : 'No'],
      ['Games', getCart().map(i => `${i.name} × ${i.qty}`).join(', ')],
      ['To pay', formatTenge(t.toPay) + (t.discount ? ` (−${formatTenge(t.discount)} promo)` : '')]
    ];
    this.el.review.innerHTML = '';
    for (const [label, value] of rows) {      // build the list with a loop
      const dt = document.createElement('dt');
      dt.className = 'col-4 col-md-3 fw-normal text-body-tertiary';
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.className = 'col-8 col-md-9';
      dd.textContent = value;
      this.el.review.append(dt, dd);
    }
  },

  open() {
    if (!getCart().length) {
      toast('Your cart is empty');
      if (window.SoundFX) SoundFX.play('error');
      return;
    }
    this.el.section.hidden = false;
    this.el.form.hidden = false;
    this.el.done.hidden = true;
    this.showStep(1);
    this.el.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.SoundFX) SoundFX.play('whoosh');
  },

  close() {
    this.el.section.hidden = true;
  },

  next() {
    this.saveInputs();
    if (!this.validate(this.step)) {
      if (window.SoundFX) SoundFX.play('error');
      return;
    }
    if (window.SoundFX) SoundFX.play('click');
    if (this.step < this.LAST) this.showStep(this.step + 1);
    else this.placeOrder();
  },

  back() {
    this.saveInputs();                        // keep what was typed
    if (this.step > 1) this.showStep(this.step - 1);
  },

  placeOrder() {
    const t = cartTotals();
    const orderNo = 'NBN-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('order-done-text').textContent =
      `Order ${orderNo} for ${formatTenge(t.toPay)}. ${this.order.gift ? 'Gift keys' : 'Your keys'} for ${this.order.platform} ` +
      `will be sent to ${this.order.email}. Thank you, ${this.order.name}! (Demo — no real payment.)`;
    this.el.form.hidden = true;
    this.el.done.hidden = false;
    this.el.dots.forEach(dot => dot.classList.add('is-done'));
    saveCart([]);
    promo = 0;
    renderCart();
if (CART_MISSING) {
  cartItemsEl.innerHTML = '<li class="alert alert-warning mb-0" role="alert">The cart could not load right now. Please refresh the page.</li>';
  document.getElementById('checkout-btn').disabled = true;
}
    if (window.SoundFX) SoundFX.play('success');
    launchConfetti();
  }
};

/* the buttons pass Checkout methods as callbacks */
document.getElementById('checkout-btn').addEventListener('click', () => Checkout.open());
Checkout.el.next.addEventListener('click', () => Checkout.next());
Checkout.el.back.addEventListener('click', () => Checkout.back());
document.getElementById('co-cancel').addEventListener('click', () => Checkout.close());
// Enter inside the form = Next
Checkout.el.form.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') {
    e.preventDefault();
    Checkout.next();
  }
});

/* ---------- Confetti animation ---------- */
function launchConfetti() {
  const colors = ['#ff5a1f', '#f2c94c', '#3ecf6e', '#4dabf7', '#e64980'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDuration = (1.8 + Math.random() * 1.8) + 's';
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

renderCart();
if (CART_MISSING) {
  cartItemsEl.innerHTML = '<li class="alert alert-warning mb-0" role="alert">The cart could not load right now. Please refresh the page.</li>';
  document.getElementById('checkout-btn').disabled = true;
}
