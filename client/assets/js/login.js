document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login_email').value.trim();
    const password = document.getElementById('login_password').value;

    // ✅ Validation
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please enter your email and password.',
        confirmButtonColor: '#c59d5f'
      });
      return;
    }

    try {
      // 🔄 Loading alert
      Swal.fire({
        title: 'Logging in...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // ✅ Save user data
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // ✅ Success alert
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Redirecting...',
        confirmButtonColor: '#c59d5f',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // ✅ Redirect
      window.location.href = '/booking.html';

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message,
        confirmButtonColor: '#c59d5f'
      });
    }
  });
});