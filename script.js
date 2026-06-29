/* ===== Product data ===== */
const PRODUCTS = [
  { id: 1, name: "Oak Lounge Chair", category: "furniture", price: 289, was: 340, emoji: "🪑", tag: "sale" },
  { id: 2, name: "Arc Floor Lamp", category: "lighting", price: 159, emoji: "💡", tag: "new" },
  { id: 3, name: "Ceramic Vase Set", category: "decor", price: 48, emoji: "🏺", tag: null },
  { id: 4, name: "Walnut Side Table", category: "furniture", price: 199, emoji: "🛋️", tag: null },
  { id: 5, name: "Linen Throw Pillow", category: "decor", price: 34, emoji: "🪡", tag: "new" },
  { id: 6, name: "Brass Pendant Light", category: "lighting", price: 129, was: 165, emoji: "🪔", tag: "sale" },
  { id: 7, name: "Stoneware Dinner Set", category: "kitchen", price: 89, emoji: "🍽️", tag: null },
  { id: 8, name: "Marble Cheese Board", category: "kitchen", price: 56, emoji: "🧀", tag: "new" },
  { id: 9, name: "Velvet Accent Chair", category: "furniture", price: 399, emoji: "💺", tag: null },
  { id: 10, name: "Framed Wall Art", category: "decor", price: 72, was: 95, emoji: "🖼️", tag: "sale" },
  { id: 11, name: "Copper Table Lamp", category: "lighting", price: 98, emoji: "🛎️", tag: null },
  { id: 12, name: "Bamboo Cutting Board", category: "kitchen", price: 28, emoji: "🪵", tag: "new" },
];

const TAG_LABEL = { sale: "Sale", new: "New" };

/* ===== State ===== */
let cart = [];
let activeCategory = "all";
const wishlist = new Set();

/* ===== DOM refs ===== */
const productGrid = document.getElementById("productGrid");
const filters = document.getElementById("filters");
const cartToggle = document.getElementById("cartToggle");
const cartClose = document.getElementById("cartClose");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartBody = document.getElementById("cartBody");
const cartFoot = document.getElementById("cartFoot");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const toast = document.getElementById("toast");
const newsletterForm = document.getElementById("newsletterForm");

/* ===== Render products ===== */
function renderProducts() {
  const list = activeCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  productGrid.innerHTML = list.map((p) => {
    const tagHtml = p.tag
      ? `<span class="product-card__tag tag--${p.tag}">${TAG_LABEL[p.tag]}</span>`
      : "";
    const wasHtml = p.was ? `<span class="was">$${p.was}</span>` : "";
    const wished = wishlist.has(p.id) ? "active" : "";
    return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-card__media">
          ${tagHtml}
          <button class="product-card__wish ${wished}" data-wish="${p.id}" aria-label="Wishlist">♥</button>
          <span>${p.emoji}</span>
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${p.category}</span>
          <h3 class="product-card__name">${p.name}</h3>
          <div class="product-card__bottom">
            <div class="product-card__price">
              <span class="now">$${p.price}</span>
              ${wasHtml}
            </div>
            <button class="add-btn" data-add="${p.id}" aria-label="Add to cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
      </article>`;
  }).join("");
}

/* ===== Filters ===== */
filters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  document.querySelector(".filter--active").classList.remove("filter--active");
  btn.classList.add("filter--active");
  activeCategory = btn.dataset.category;
  renderProducts();
});

/* ===== Add to cart / wishlist (delegated) ===== */
productGrid.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  const wishBtn = e.target.closest("[data-wish]");
  if (addBtn) {
    const id = Number(addBtn.dataset.add);
    addToCart(id);
    animateAdd(addBtn);
  }
  if (wishBtn) {
    const id = Number(wishBtn.dataset.wish);
    if (wishlist.has(id)) {
      wishlist.delete(id);
      wishBtn.classList.remove("active");
    } else {
      wishlist.add(id);
      wishBtn.classList.add("active");
      showToast("Added to wishlist ♥");
    }
  }
});

function animateAdd(btn) {
  btn.style.transform = "scale(0.85) rotate(90deg)";
  setTimeout(() => (btn.style.transform = ""), 200);
}

/* ===== Cart logic ===== */
function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  showToast(`${product.name} added to cart`);
  bumpCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
}

function cartTotalValue() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = count;
  cartCount.classList.toggle("show", count > 0);

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size:.85rem;margin-top:6px">Add something you love!</p>
      </div>`;
    cartFoot.style.display = "none";
    return;
  }

  cartFoot.style.display = "block";
  cartBody.innerHTML = cart.map((i) => `
    <div class="cart-item">
      <div class="cart-item__media">${i.emoji}</div>
      <div>
        <div class="cart-item__name">${i.name}</div>
        <div class="cart-item__price">$${i.price}</div>
        <div class="cart-item__qty">
          <button class="qty-btn" data-minus="${i.id}">−</button>
          <span class="qty-val">${i.qty}</span>
          <button class="qty-btn" data-plus="${i.id}">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-remove="${i.id}" aria-label="Remove">×</button>
    </div>
  `).join("");

  cartTotal.textContent = `$${cartTotalValue().toFixed(2)}`;
}

cartBody.addEventListener("click", (e) => {
  const plus = e.target.closest("[data-plus]");
  const minus = e.target.closest("[data-minus]");
  const remove = e.target.closest("[data-remove]");
  if (plus) changeQty(Number(plus.dataset.plus), 1);
  if (minus) changeQty(Number(minus.dataset.minus), -1);
  if (remove) removeItem(Number(remove.dataset.remove));
});

function bumpCart() {
  cartToggle.style.transform = "scale(1.2)";
  setTimeout(() => (cartToggle.style.transform = ""), 250);
}

/* ===== Drawer open/close ===== */
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

/* ===== Checkout ===== */
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  showToast(`✓ Order placed! Total $${cartTotalValue().toFixed(2)}`);
  cart = [];
  renderCart();
  setTimeout(closeCart, 800);
});

/* ===== Toast ===== */
let toastTimer;
function showToast(msg) {
  toast.innerHTML = `<span class="toast__check">✓</span> ${msg}`;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ===== Newsletter ===== */
newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = newsletterForm.querySelector("input").value;
  showToast(`Subscribed! Check ${email} for your 10% code`);
  newsletterForm.reset();
});

/* ===== Init ===== */
renderProducts();
renderCart();
