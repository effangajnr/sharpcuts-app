let editingId = null;
let dataTable = null;

// ─────────────────────────────
// INIT
// ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts();
});

// ─────────────────────────────
// IMAGE PREVIEW
// ─────────────────────────────
document.addEventListener('input', (e) => {
  if (e.target.id === 'image_url') {
    const wrap = document.getElementById('image-preview-wrap');
    const preview = document.getElementById('image-preview');

    if (e.target.value) {
      preview.src = e.target.value;
      wrap.style.display = 'block';
    } else {
      wrap.style.display = 'none';
    }
  }
});

// ─────────────────────────────
// LOAD CATEGORIES (FIXED ROUTE)
// ─────────────────────────────
async function loadCategories() {
  try {
    // FIXED: correct endpoint
    const res = await api('/api/products/categories');

    const select = document.getElementById('category_id');
    if (!select) return;

    select.innerHTML = `<option value="">-- Select Category --</option>`;

    if (!res?.data) return;

    res.data.forEach(cat => {
      select.innerHTML += `
        <option value="${cat.category_id}">
          ${cat.category_name}
        </option>
      `;
    });

  } catch (err) {
    console.error('Category load error:', err);
  }
}

// ─────────────────────────────
// LOAD PRODUCTS
// ─────────────────────────────
async function loadProducts() {
  try {
    const res = await api('/api/products');
    const list = res?.data || [];

    const rows = list.map(p => {

      const img = p.image_url
        ? `<img src="${p.image_url}" style="width:40px;height:40px;object-fit:cover;border-radius:6px">`
        : `<div style="width:40px;height:40px;background:#eee;border-radius:6px"></div>`;

      const status = p.is_active
        ? `<span class="badge bg-success">Active</span>`
        : `<span class="badge bg-secondary">Inactive</span>`;

      const actions = `
        <button class="btn btn-sm btn-warning" onclick="editProduct(${p.product_id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.product_id})">Delete</button>
      `;

      return [
        img,
        p.product_name,
        p.category_name || '—',
        `£${Number(p.price).toFixed(2)}`,
        status,
        actions
      ];
    });

    if (dataTable) {
      dataTable.destroy();
      document.querySelector('#productTable tbody').innerHTML = '';
    }

    dataTable = $('#productTable').DataTable({
      data: rows,
      columns: [
        { title: 'Image', orderable: false },
        { title: 'Name' },
        { title: 'Category' },
        { title: 'Price' },
        { title: 'Status' },
        { title: 'Actions', orderable: false }
      ],
      pageLength: 10
    });

  } catch (err) {
    console.error('Products load error:', err);
  }
}

// ─────────────────────────────
// OPEN MODAL
// ─────────────────────────────
function openAddModal() {
  editingId = null;

  document.getElementById('productForm').reset();
  document.getElementById('is_active').checked = true;

  document.getElementById('image-preview-wrap').style.display = 'none';

  new bootstrap.Modal(document.getElementById('productModal')).show();
}

// ─────────────────────────────
// EDIT
// ─────────────────────────────
async function editProduct(id) {
  const res = await api(`/api/products/${id}`);
  const p = res?.data;

  if (!p) return showToast('Product not found', 'error');

  editingId = id;

  document.getElementById('product_name').value = p.product_name;
  document.getElementById('price').value = p.price;
  document.getElementById('category_id').value = p.category_id || '';
  document.getElementById('stock').value = p.stock || 0;
  document.getElementById('description').value = p.description || '';
  document.getElementById('image_url').value = p.image_url || '';
  document.getElementById('is_active').checked = p.is_active;

  if (p.image_url) {
    document.getElementById('image-preview').src = p.image_url;
    document.getElementById('image-preview-wrap').style.display = 'block';
  }

  new bootstrap.Modal(document.getElementById('productModal')).show();
}

// ─────────────────────────────
// SAVE
// ─────────────────────────────
async function saveProduct() {
  const data = {
    product_name: document.getElementById('product_name').value,
    price: document.getElementById('price').value,
    category_id: document.getElementById('category_id').value || null,
    stock: document.getElementById('stock').value || 0,
    description: document.getElementById('description').value,
    image_url: document.getElementById('image_url').value,
    is_active: document.getElementById('is_active').checked
  };

  if (editingId) {
    await api(`/api/products/${editingId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    showToast('Product updated');
  } else {
    await api('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    showToast('Product added');
  }

  bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();

  loadProducts();
  editingId = null;
}

// ─────────────────────────────
// DELETE
// ─────────────────────────────
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;

  await api(`/api/products/${id}`, {
    method: 'DELETE'
  });

  showToast('Product deleted');
  loadProducts();
}