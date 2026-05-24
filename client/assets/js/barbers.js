document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('barbersContainer');

  if (!container) return;

  try {
    const response = await fetch('/api/barbers');
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load barbers');
    }

    if (!result.data || result.data.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-white">
          No barbers available right now.
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    result.data.forEach((barber) => {
      const imagePath =
        barber.image_url && barber.image_url.trim() !== ''
          ? barber.image_url
          : 'assets/img/barber-placeholder.jpg';

      const card = `
        <div class="col-md-6 col-lg-3">
          <div class="team-card h-100">
            <div class="team-placeholder"><i class="fas fa-user"></i></div>

            <img
              src="${imagePath}"
              alt="${barber.full_name}"
              class="team-photo"
              onerror="this.style.display='none'"
            >

            <div class="team-overlay">
              <div class="team-name">${barber.full_name}</div>
              <div class="team-role">${barber.specialty || 'Professional Barber'}</div>
              <div class="team-bio">
                ${barber.bio || 'Experienced barber dedicated to premium grooming and sharp finishes.'}
              </div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML += card;
    });
  } catch (error) {
    console.error('Error loading barbers:', error);

    container.innerHTML = `
      <div class="col-12 text-center text-danger">
        Failed to load barbers.
      </div>
    `;
  }
});