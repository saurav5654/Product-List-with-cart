// Cart state
let cart = [];
let products = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartContent = document.getElementById('cartContent');
const cartSummary = document.getElementById('cartSummary');
const totalPrice = document.getElementById('totalPrice');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const orderModal = document.getElementById('orderModal');
const newOrderBtn = document.getElementById('newOrderBtn');
const modalOrderItems = document.getElementById('modalOrderItems');
const modalTotalPrice = document.getElementById('modalTotalPrice');

// Fetch and load products
async function loadProducts() {
  try {
    const response = await fetch('./data.json');
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Render product cards
function renderProducts() {
  productsGrid.innerHTML = products.map((product, index) => {
    const cartItem = cart.find(item => item.id === index);
    const quantity = cartItem ? cartItem.quantity : 0;

    return `
      <div class="product-card">
        <div class="product-image-wrapper">
          <img 
            src="${product.image.mobile}" 
            srcset="${product.image.tablet} 768w, ${product.image.desktop} 1024w"
            alt="${product.name}" 
            class="product-image"
          >
          ${quantity === 0 
            ? `<button class="add-to-cart-btn" onclick="addToCart(${index})">
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline; margin-right: 8px;">
                  <g opacity="0.5">
                    <path d="M6.04545 10.2045L8.86364 13.2159L15.0682 6.89772" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20.5 4.40909V17.863C20.5 18.5412 20.0252 19.0909 19.3977 19.0909H2.10227C1.47477 19.0909 1 18.5412 1 17.863V4.40909" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.7273 4.40909V3.52273C14.7273 2.70455 14.0342 2 13.2159 2H8.25 C7.43182 2 6.73864 2.70455 6.73864 3.52273V4.40909" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4.22252 4.40909H17.3977" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>
                Add to Cart
              </button>`
            : `<div class="quantity-control">
                <button onclick="decrementQuantity(${index})">−</button>
                <span>${quantity}</span>
                <button onclick="incrementQuantity(${index})">+</button>
              </div>`
          }
        </div>
        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <p class="product-name">${product.name}</p>
          <p class="product-price">$${product.price.toFixed(2)}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Add to cart
function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }
  
  updateCart();
  renderProducts();
}

// Increment quantity
function incrementQuantity(productId) {
  const cartItem = cart.find(item => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
    updateCart();
    renderProducts();
  }
}

// Decrement quantity
function decrementQuantity(productId) {
  const cartItem = cart.find(item => item.id === productId);
  if (cartItem) {
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else {
      cart = cart.filter(item => item.id !== productId);
    }
    updateCart();
    renderProducts();
  }
}

// Update cart display
function updateCart() {
  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <img src="./assets/images/illustration-empty-cart.svg" alt="Empty cart">
        <p>Your added items will appear here</p>
      </div>
    `;
    cartSummary.style.display = 'none';
    return;
  }

  // Render cart items
  const cartItemsHTML = cart.map(item => {
    const product = products[item.id];
    const itemTotal = product.price * item.quantity;

    return `
      <div class="cart-item">
        <div style="flex: 1;">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">
            <span class="cart-item-quantity">${item.quantity}x</span>
            <span class="cart-item-unit-price">@ $${product.price.toFixed(2)}</span>
            <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
          </div>
        </div>
        <button class="remove-item-btn" onclick="removeFromCart(${item.id})" title="Remove item">
          ✕
        </button>
      </div>
    `;
  }).join('');

  cartContent.innerHTML = `<div class="cart-items-list">${cartItemsHTML}</div>`;
  cartSummary.style.display = 'block';

  // Calculate and display total
  const total = cart.reduce((sum, item) => {
    return sum + (products[item.id].price * item.quantity);
  }, 0);

  totalPrice.textContent = `$${total.toFixed(2)}`;
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
  renderProducts();
}

// Confirm order
confirmOrderBtn.addEventListener('click', () => {
  if (cart.length > 0) {
    showOrderConfirmationModal();
  }
});

// Show order confirmation modal
function showOrderConfirmationModal() {
  const modalItems = cart.map(item => {
    const product = products[item.id];
    const itemTotal = product.price * item.quantity;

    return `
      <div class="modal-item">
        <div class="modal-item-info">
          <h3>${product.name}</h3>
          <div>
            <span class="modal-item-qty">${item.quantity}x</span>
            <span class="modal-item-unit">@ $${product.price.toFixed(2)}</span>
          </div>
        </div>
        <div class="modal-item-price">
          <div class="modal-item-total">$${itemTotal.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join('');

  modalOrderItems.innerHTML = modalItems;

  const total = cart.reduce((sum, item) => {
    return sum + (products[item.id].price * item.quantity);
  }, 0);

  modalTotalPrice.textContent = `$${total.toFixed(2)}`;
  orderModal.style.display = 'flex';
}

// Start new order
newOrderBtn.addEventListener('click', () => {
  cart = [];
  orderModal.style.display = 'none';
  updateCart();
  renderProducts();
});

// Close modal when clicking outside
orderModal.addEventListener('click', (e) => {
  if (e.target === orderModal) {
    orderModal.style.display = 'none';
  }
});

// Initialize app
loadProducts();
