document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const first_name = document.getElementById('first_name').value.trim();
    const last_name = document.getElementById('last_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const terms = document.getElementById('terms')?.checked;

    if (!first_name || !last_name || !email || !password || !confirm_password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        confirmButtonColor: '#c59d5f'
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Weak Password',
        text: 'Password must be at least 6 characters.',
        confirmButtonColor: '#c59d5f'
      });
      return;
    }

    if (password !== confirm_password) {
      Swal.fire({
        icon: 'error',
        title: 'Password Error',
        text: 'Passwords do not match.',
        confirmButtonColor: '#c59d5f'
      });
      return;
    }

    if (typeof terms !== 'undefined' && !terms) {
      Swal.fire({
        icon: 'warning',
        title: 'Terms Required',
        text: 'Please agree to the terms before registering.',
        confirmButtonColor: '#c59d5f'
      });
      return;
    }

    const payload = {
      first_name,
      last_name,
      email,
      phone,
      password,
    };

    try {
      Swal.fire({
        title: 'Creating account...',
        text: 'Please wait a moment',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Account Created',
        text: 'Redirecting to login...',
        confirmButtonColor: '#c59d5f',
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false
      });

      form.reset();
      window.location.href = '/login.html';

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message,
        confirmButtonColor: '#c59d5f'
      });
    }
  });
});