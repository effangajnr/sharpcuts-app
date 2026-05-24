document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('servicesContainer');

  if (!container) return;

  try {
    const response = await fetch('/api/service-categories');
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load categories');
    }

    container.innerHTML = '';

    result.data.forEach(category => {

      container.innerHTML += `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="service-card h-100 p-4 rounded-4 text-center">

            <h5 class="text-gold mb-2">
              ${category.name}
            </h5>

            <p class="text-muted small mb-0">
              Premium grooming category
            </p>

          </div>
        </div>
      `;
    });

  } catch (error) {
    console.error('Error loading categories:', error);

    container.innerHTML = `
      <div class="col-12 text-center text-danger">
        Failed to load service categories.
      </div>
    `;
  }
});