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

function updateCartBadge() {
  const count = cartItemCount();
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Wire up "Add to cart" buttons wherever they exist on the page
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-name');
      addToCart(name, btn.getAttribute('data-price'), btn.getAttribute('data-img'));

      const original = btn.textContent;
      btn.textContent = 'Added ✓';
      btn.disabled = true;
      if (window.showToast) window.showToast(`${name} added to cart`);
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1000);
    });
  });
});
