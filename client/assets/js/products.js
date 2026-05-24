async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();

    const products = data.data;

    const container = document.getElementById("productTabsContent");

    container.innerHTML = products.map(p => `
      <div class="col-md-3 mb-4">
        <div class="card h-100 shadow-sm">

          <img src="${p.image_url || 'assets/img/no-image.png'}" 
               class="card-img-top" 
               style="height:200px;object-fit:cover;">

          <div class="card-body text-center">
            <h5 class="card-title">${p.name}</h5>
            <p class="text-muted">${p.description || ''}</p>
            <h6 class="text-gold">£${p.price}</h6>

            <button class="btn btn-dark mt-2" onclick="addToCart(${p.product_id})">
              Add to Cart
            </button>
          </div>

        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error("Error loading products:", err);
  }
}

loadProducts();