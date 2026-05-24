/* ═══════════════════════════════════════
   CART SYSTEM - COMPLETE WITH BACKEND
   ═══════════════════════════════════════ */

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("cartContainer");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");


/* ═══════════════════════════════════════
   SAVE CART TO LOCALSTORAGE
   ═══════════════════════════════════════ */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}


/* ═══════════════════════════════════════
   UPDATE CART BADGE (Item Count)
   ═══════════════════════════════════════ */
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  badge.textContent = totalItems;
}


/* ═══════════════════════════════════════
   ADD TO CART (Called from products.html)
   ═══════════════════════════════════════ */
async function addToCart(productId) {
  try {
    // Fetch product details
    const res = await fetch(`/api/products/${productId}`);
    const data = await res.json();

    if (!data.success) {
      throw new Error('Product not found');
    }

    const product = data.data;

    // Check if product already in cart
    const existing = cart.find(item => item.product_id === productId);

    if (existing) {
      // Increase quantity
      existing.quantity += 1;
    } else {
      // Add new item
      cart.push({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        image: product.image_url || 'assets/img/no-image.png',
        quantity: 1
      });
    }

    saveCart();
    updateCartBadge();

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Added to Cart!",
      text: `${product.name} has been added to your cart.`,
      timer: 1500,
      showConfirmButton: false,
      background: "#111",
      color: "#fff",
      iconColor: "#c59d5f"
    });

  } catch (err) {
    console.error('Add to cart error:', err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to add product to cart",
      confirmButtonColor: "#c59d5f",
      background: "#111",
      color: "#fff"
    });
  }
}


/* ═══════════════════════════════════════
   RENDER CART (Display Items)
   ═══════════════════════════════════════ */
function renderCart() {
  if (!cartContainer) return;

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light text-center py-4 rounded-4 shadow-sm">
          Your cart is empty.
        </div>
      </div>
    `;

    if (cartSubtotal) cartSubtotal.textContent = "0.00";
    if (cartTotal) cartTotal.textContent = "0.00";
    return;
  }

  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += Number(item.price) * Number(item.quantity);

    const col = document.createElement("div");
    col.className = "col-12";

    col.innerHTML = `
      <div class="cart-card d-flex align-items-center p-3 rounded-4 shadow-sm bg-white">
        <img src="${item.image}" alt="${item.name}" class="cart-img me-3" width="80">

        <div class="flex-grow-1">
          <h5 class="fw-bold mb-1">${item.name}</h5>
          <p class="mb-2 text-muted">Price: £${Number(item.price).toFixed(2)}</p>

          <div class="d-flex align-items-center gap-2 flex-wrap">
            <label class="mb-0">Qty:</label>

            <input
              type="number"
              min="1"
              value="${item.quantity}"
              data-index="${index}"
              class="form-control quantity-input"
              style="width: 80px;"
            >

            <button
              class="btn btn-danger btn-sm remove-btn"
              data-index="${index}">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;

    cartContainer.appendChild(col);
  });

  if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2);
  if (cartTotal) cartTotal.textContent = subtotal.toFixed(2);
}


/* ═══════════════════════════════════════
   CHANGE QUANTITY
   ═══════════════════════════════════════ */
if (cartContainer) {
  cartContainer.addEventListener("input", function (e) {
    if (!e.target.classList.contains("quantity-input")) return;

    const index = parseInt(e.target.dataset.index);
    const value = parseInt(e.target.value);

    if (isNaN(value) || value < 1) return;

    cart[index].quantity = value;
    saveCart();
    updateCartBadge();
    renderCart();
  });
}


/* ═══════════════════════════════════════
   REMOVE ITEM
   ═══════════════════════════════════════ */
if (cartContainer) {
  cartContainer.addEventListener("click", function (e) {
    if (!e.target.classList.contains("remove-btn")) return;

    const index = parseInt(e.target.dataset.index);
    const itemName = cart[index]?.name || "Item";

    cart.splice(index, 1);
    saveCart();
    updateCartBadge();
    renderCart();

    Swal.fire({
      icon: "info",
      title: "Removed",
      text: `${itemName} has been removed from your cart.`,
      timer: 1500,
      showConfirmButton: false,
      background: "#111",
      color: "#fff",
      iconColor: "#c59d5f"
    });
  });
}


/* ═══════════════════════════════════════
   CHECKOUT - CREATES REAL ORDER!
   ═══════════════════════════════════════ */
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async function () {
    
    // Check if cart is empty
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Your cart is empty",
        text: "Add some products before proceeding to checkout.",
        confirmButtonColor: "#c59d5f",
        background: "#111",
        color: "#fff"
      });
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Please Login",
        text: "You need to be logged in to place an order.",
        confirmButtonColor: "#c59d5f",
        background: "#111",
        color: "#fff"
      }).then(() => {
        window.location.href = "login.html";
      });
      return;
    }

    // Calculate total
    const total = cart.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    // Confirm order
    const result = await Swal.fire({
      title: "Place Order?",
      html: `
        <p>Your total is <strong>£${total.toFixed(2)}</strong></p>
        <p class="text-muted small">Order will be sent to admin for confirmation.</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, place order",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#c59d5f",
      cancelButtonColor: "#6c757d",
      background: "#111",
      color: "#fff"
    });

    if (!result.isConfirmed) {
      return;
    }

    // Show loading
    Swal.fire({
      title: 'Processing Order...',
      text: 'Please wait',
      allowOutsideClick: false,
      background: "#111",
      color: "#fff",
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
        // Backend gets cart from database, no need to send it
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Clear cart AFTER successful order
      cart = [];
      saveCart();
      updateCartBadge();
      renderCart();

      // Show success
      await Swal.fire({
        icon: "success",
        title: "Order Placed!",
        html: `
          <p>Thank you! Your order has been placed successfully.</p>
          <p class="text-muted small">Order ID: #${data.data.order_id}</p>
          <p class="text-muted small">Status: Pending (Admin will confirm)</p>
        `,
        confirmButtonColor: "#c59d5f",
        background: "#111",
        color: "#fff"
      });

      // Redirect to my orders page
      window.location.href = "my-orders.html";

    } catch (err) {
      console.error('Checkout error:', err);
      Swal.fire({
        icon: "error",
        title: "Checkout Failed",
        text: err.message || "Failed to place order. Please try again.",
        confirmButtonColor: "#c59d5f",
        background: "#111",
        color: "#fff"
      });
    }
  });
}


/* ═══════════════════════════════════════
   SYNC CART WITH DATABASE (Optional)
   For logged-in users
   ═══════════════════════════════════════ */
async function syncCartWithDatabase() {
  const token = localStorage.getItem("token");
  if (!token) return; // Not logged in, skip sync

  try {
    // Add each cart item to database
    for (const item of cart) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: item.quantity
        })
      });
    }
  } catch (err) {
    console.error('Cart sync error:', err);
    // Don't show error to user, silent sync
  }
}


/* ═══════════════════════════════════════
   INIT - Run on page load
   ═══════════════════════════════════════ */
updateCartBadge();
renderCart();

// Sync cart with database if logged in
const token = localStorage.getItem("token");
if (token && cart.length > 0) {
  syncCartWithDatabase();
}
