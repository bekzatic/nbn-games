/* ==========================================================
   NBN GAMES — shared cart logic (localStorage)
   Used by: index, catalog, game, cart, about, profile
   Cart item shape: { name, price (number, no spaces), img, qty }
   ========================================================== */

const CART_KEY = 'nbn_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch { /* storage unavailable (private mode) — ignore */ }
  updateCartBadge();
}

function addToCart(name, price, img) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price: Number(price), img, qty: 1 });
  }
  saveCart(cart);
  return cart;
}

function removeFromCart(name) {
  const cart = getCart().filter(item => item.name !== name);
  saveCart(cart);
  return cart;
}

function cartItemCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge(animate = false) {
  const count = cartItemCount();
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';   // dynamic style (Assignment #5)
    // screen readers read the link label, so it says how many items are inside
    badge.parentElement.setAttribute('aria-label', count ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart, empty');
    badge.setAttribute('aria-hidden', 'true');
    if (animate) {
      badge.classList.remove('bump');
      void badge.offsetWidth;            // restart the CSS animation
      badge.classList.add('bump');
    }
  });
}

/* Assignment #5 — animation: a "+1" flies from the button to the cart icon */
function flyToCart(fromEl) {
  const cartIcon = document.querySelector('.cart-badge');
  if (!fromEl || !cartIcon) return;
  const start = fromEl.getBoundingClientRect();
  const end = cartIcon.parentElement.getBoundingClientRect();
  const plus = document.createElement('span');
  plus.className = 'fly-plus';
  plus.textContent = '+1';
  plus.style.left = (start.left + start.width / 2) + 'px';
  plus.style.top = start.top + 'px';
  document.body.appendChild(plus);
  requestAnimationFrame(() => {
    plus.style.transform = `translate(${end.left - start.left - start.width / 2 + 10}px, ${end.top - start.top}px) scale(.6)`;
    plus.style.opacity = '0';
  });
  setTimeout(() => plus.remove(), 750);
}

/* One handler for every "Add to cart" button — also for cards that are
   added to the page later (event delegation on document). */
function handleAddToCart(btn) {
  const name = btn.getAttribute('data-name');
  addToCart(name, btn.getAttribute('data-price'), btn.getAttribute('data-img'));
  updateCartBadge(true);
  flyToCart(btn);
  if (window.SoundFX) SoundFX.play('add');

  const original = btn.textContent;
  btn.textContent = 'Added ✓';
  btn.disabled = true;
  if (window.showToast) window.showToast(`${name} added to cart`);
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // "Add to cart" buttons anywhere on the page, including ones created later by JS
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn || btn.disabled) return;
    e.preventDefault();
    handleAddToCart(btn);
  });
});
