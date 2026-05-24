// auth.js — guards every admin page
// Include this on every admin HTML page

(function () {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  // If no token or not admin → redirect to login
  if (!token || user.role !== 'admin') {
    window.location.href = '/admin/index.html';
  }
})();
