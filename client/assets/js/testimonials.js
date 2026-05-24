document.addEventListener('DOMContentLoaded', async () => {

  const carouselInner = document.querySelector(
    '#testimonialCarousel .carousel-inner'
  );

  if (!carouselInner) return;

  try {

    const res = await fetch('/api/testimonials');

    const data = await res.json();

    console.log(data);

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load testimonials');
    }

    if (!data.data.length) {

      carouselInner.innerHTML = `
        <div class="carousel-item active">
          <div class="testimonial-content mx-auto">
            <p class="text-white">
              No testimonials available.
            </p>
          </div>
        </div>
      `;

      return;
    }

    carouselInner.innerHTML = '';

    data.data.forEach((t, index) => {

      carouselInner.innerHTML += `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">

          <div class="testimonial-content mx-auto">

            <img
              src="${t.image_url || '/assets/img/default-user.png'}"
              class="testimonial-img mb-4"
              alt="${t.reviewer_name}"
            >

            <p class="testimonial-text">
              "${t.comment}"
            </p>

            <h6 class="fw-bold mt-4 mb-0">
              ${t.reviewer_name}
            </h6>

            <small class="text-gold">
              ${t.customer_type || 'Client'}
            </small>

          </div>

        </div>
      `;
    });

  } catch (err) {

    console.error('Testimonials Error:', err);

    carouselInner.innerHTML = `
      <div class="carousel-item active">
        <div class="text-danger text-center">
          Failed to load testimonials
        </div>
      </div>
    `;
  }
});