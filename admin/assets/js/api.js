// api.js — shared fetch wrapper for all admin pages
const BASE = '';

async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(BASE + endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/index.html';
    return;
  }

  return res.json();
}
