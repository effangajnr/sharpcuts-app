document.addEventListener('DOMContentLoaded', () => {
  const accountMenu = document.getElementById('accountMenu');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!accountMenu) return;

  if (!token) {
    accountMenu.innerHTML = `
      <li><a class="dropdown-item" href="login.html">Login</a></li>
      <li><a class="dropdown-item" href="register.html">Register</a></li>
    `;
  } else {
    accountMenu.innerHTML = `
      <li><h6 class="dropdown-header">Hi ${user?.first_name || 'My Account'}</h6></li>
      <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
      <li><a class="dropdown-item" href="my-bookings.html">My Bookings</a></li>
      <li><a class="dropdown-item" href="my-orders.html">My Orders</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Logout</a></li>
    `;

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }
});