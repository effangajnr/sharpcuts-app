document.addEventListener('DOMContentLoaded', () => {
  const appointmentForm = document.getElementById('appointmentForm');
  const serviceSelect = document.getElementById('service_id');
  const barberSelect = document.getElementById('barber_id');
  const bookingDateInput = document.getElementById('booking_date');
  const locationTypeSelect = document.getElementById('location_type');
  const addressWrapper = document.getElementById('addressWrapper');
  const serviceAddressInput = document.getElementById('service_address');

  if (!appointmentForm || !serviceSelect || !barberSelect || !bookingDateInput) {
    console.error('Required booking form elements are missing.');
    return;
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  bookingDateInput.setAttribute('min', today);

  // Show/hide address field for home service
  if (locationTypeSelect && addressWrapper && serviceAddressInput) {
    locationTypeSelect.addEventListener('change', () => {
      if (locationTypeSelect.value === 'home_service') {
        addressWrapper.classList.remove('d-none');
        serviceAddressInput.setAttribute('required', 'true');
      } else {
        addressWrapper.classList.add('d-none');
        serviceAddressInput.removeAttribute('required');
        serviceAddressInput.value = '';
      }
    });
  }

  // Load services into dropdown
  const loadServices = async () => {
    try {
      const response = await fetch('/api/services');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load services');
      }

      serviceSelect.innerHTML = '<option value="" selected disabled>Select Service</option>';

      result.data.forEach((service) => {
        const option = document.createElement('option');
        option.value = service.service_id;
        option.textContent = `${service.service_name} - £${service.price}`;
        serviceSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Service load error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load services.',
        confirmButtonColor: '#c59d5f',
        background: '#111',
        color: '#fff'
      });
    }
  };

  // Load barbers into dropdown
  const loadBarbers = async () => {
    try {
      const response = await fetch('/api/barbers');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load barbers');
      }

      barberSelect.innerHTML = '<option value="" selected disabled>Select Barber</option>';

      result.data.forEach((barber) => {
        const option = document.createElement('option');
        option.value = barber.barber_id;
        option.textContent = barber.specialty
          ? `${barber.full_name} - ${barber.specialty}`
          : barber.full_name;
        barberSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Barber load error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not load barbers.',
        confirmButtonColor: '#c59d5f',
        background: '#111',
        color: '#fff'
      });
    }
  };

  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to book an appointment.',
        confirmButtonColor: '#c59d5f',
        confirmButtonText: 'Go to Login',
        background: '#111',
        color: '#fff'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login.html';
        }
      });
      return;
    }

    const payload = {
      service_id: serviceSelect.value,
      barber_id: barberSelect.value,
      location_type: locationTypeSelect ? locationTypeSelect.value : 'in_salon',
      service_address: serviceAddressInput ? serviceAddressInput.value.trim() : '',
      booking_date: bookingDateInput.value,
      booking_time: document.getElementById('booking_time')?.value || '',
      notes: document.getElementById('notes')?.value.trim() || ''
    };

    if (
      !payload.service_id ||
      !payload.barber_id ||
      !payload.booking_date ||
      !payload.booking_time
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required booking fields.',
        confirmButtonColor: '#c59d5f',
        background: '#111',
        color: '#fff'
      });
      return;
    }

    if (payload.location_type === 'home_service' && !payload.service_address) {
      Swal.fire({
        icon: 'error',
        title: 'Address Required',
        text: 'Please enter your address for home service.',
        confirmButtonColor: '#c59d5f',
        background: '#111',
        color: '#fff'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Submitting Booking...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: '#111',
        color: '#fff',
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Booking failed');
      }

      await Swal.fire({
        title: 'Booking Confirmed!',
        html: '<strong style="color:#c59d5f;">Sharp Cuts Barber</strong><br>Your appointment has been received.',
        icon: 'success',
        confirmButtonText: 'Done',
        confirmButtonColor: '#c59d5f',
        background: '#111',
        color: '#fff',
        iconColor: '#c59d5f',
        width: window.innerWidth < 500 ? '90%' : '400px'
      });

      appointmentForm.reset();
      bookingDateInput.setAttribute('min', today);

      if (addressWrapper && serviceAddressInput) {
        addressWrapper.classList.add('d-none');
        serviceAddressInput.removeAttribute('required');
        serviceAddressInput.value = '';
      }
    } catch (error) {
      console.error('Booking error:', error);

      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.message,
        confirmButtonColor: '#c59d5f',
        background: '#111',
        color: '#fff'
      });
    }
  });

  loadServices();
  loadBarbers();
});