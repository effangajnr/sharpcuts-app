document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('pricingContainer');
  if (!container) return;

  try {
    const response = await fetch('/api/pricing');
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to load pricing');
    }

    container.innerHTML = '';

    data.categories.forEach(category => {

      const itemsHtml = category.items.map(item => `
        <div class="pricing-item d-flex justify-content-between align-items-start mb-3">

          <div>
            <span class="fw-semibold">${item.name}</span>

            ${item.description ? `
              <div class="small text-muted">${item.description}</div>
            ` : ''}

            <div class="small text-muted">
              ${item.duration_minutes} mins
            </div>
          </div>

          <span class="fw-bold text-gold">
            £${item.price}
          </span>

        </div>
      `).join('');

      container.innerHTML += `
        <div class="col-md-6 col-lg-4">
          <div class="card pricing-card h-100 rounded-4">

            <div class="card-body p-4">

              <h5 class="pricing-title text-center fw-bold mb-4">
                ${category.name}
              </h5>

              <div class="pricing-list">
                ${itemsHtml}
              </div>

            </div>

          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error('Error loading pricing:', err);

    container.innerHTML = `
      <div class="col-12 text-center text-danger">
        Failed to load pricing.
      </div>
    `;
  }
});