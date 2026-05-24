 document.addEventListener('DOMContentLoaded', () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please login to access your profile.',
          confirmButtonColor: '#c59d5f',
          background: '#111',
          color: '#fff'
        }).then(() => {
          window.location.href = '/login.html';
        });
        return;
      }

      // Fill profile details
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

      document.getElementById('sidebarName').textContent = fullName || 'User';
      document.getElementById('sidebarEmail').textContent = user.email || '-';
      document.getElementById('sidebarPhone').textContent = user.phone || 'Not provided';
      document.getElementById('sidebarRole').textContent = user.role || 'customer';

      document.getElementById('profileFirstName').textContent = user.first_name || '-';
      document.getElementById('profileLastName').textContent = user.last_name || '-';
      document.getElementById('profileEmail').textContent = user.email || '-';
      document.getElementById('profilePhone').textContent = user.phone || 'Not provided';
      document.getElementById('profileRole').textContent = user.role || 'customer';

      // Logout
      document.getElementById('logoutBtn').addEventListener('click', () => {
        Swal.fire({
          title: 'Logout?',
          text: 'You will be logged out of your account.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#c59d5f',
          cancelButtonColor: '#555',
          confirmButtonText: 'Yes, logout',
          background: '#111',
          color: '#fff'
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
          }
        });
      });

      
    });