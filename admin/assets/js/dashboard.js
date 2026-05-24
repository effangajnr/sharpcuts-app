// dashboard.js

document.addEventListener('DOMContentLoaded', async () => {

  // ── Date ──
  const dateEl = document.getElementById('topbarDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // ── Admin info ──
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  setText('adminName', user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Admin');
  setText('adminEmail', user.email || '');

  // ── Sidebar toggle ──
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuBtn = document.getElementById('menuBtn');

  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('show');
  }

  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
  }

  menuBtn?.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  overlay?.addEventListener('click', closeSidebar);

  // ── Logout ──
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login.html';
  });

  // ── Fetch data ──
  try {
    const [usersRes, bookingsRes, productsRes, ordersRes, reviewsRes] = await Promise.all([
      api('/api/auth/users'),
      api('/api/bookings'),
      api('/api/products'),
      api('/api/orders'),
      api('/api/reviews/admin/all')
    ]);

    setText('totalUsers', usersRes?.data?.length ?? '—');
    setText('totalBookings', bookingsRes?.data?.length ?? '—');
    setText('totalProducts', productsRes?.data?.length ?? '—');
    setText('totalOrders', ordersRes?.data?.length ?? '—');
    setText('totalReviews', reviewsRes?.data?.length ?? '—');

    if (bookingsRes?.data) {
      const pending = bookingsRes.data.filter(b => b.status === 'pending').length;
      setText('pendingCount', pending);
      setText('pendingBadge', pending);

      renderChart(bookingsRes.data);
      renderTable(bookingsRes.data.slice(0, 6));
    }

  } catch (err) {
    console.error('Dashboard error:', err);
  }

});


// ── Helpers ──
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';
}

function statusIcon(status) {
  const icons = {
    pending: 'bi-clock-fill',
    confirmed: 'bi-check-circle-fill',
    completed: 'bi-check-all',
    cancelled: 'bi-x-circle-fill'
  };
  return icons[status] || 'bi-circle';
}


// ── Recent bookings table ──
function renderTable(bookings) {
  const tbody = document.getElementById('recentBookings');
  if (!tbody) return;

  if (!bookings.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="table-empty">No bookings yet</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.first_name || '—'} ${b.last_name || ''}</td>
      <td>${b.service_name || '—'}</td>
      <td>${formatDate(b.booking_date)}</td>
      <td>
        <span class="badge badge-${b.status}">
          <i class="bi ${statusIcon(b.status)}"></i>
          ${cap(b.status)}
        </span>
      </td>
    </tr>
  `).join('');
}