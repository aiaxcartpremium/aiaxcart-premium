// Admin functionality
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadProductsTab();
});

async function checkAdminAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
    if (!profile || profile.role !== 'admin') {
        alert('Admin access required');
        window.location.href = 'index.html';
    }
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'products') loadProductsTab();
    else if (tab === 'accounts') loadAccountsTab();
    else if (tab === 'orders') loadOrdersTab();
    else if (tab === 'sales') loadSalesTab();
}

async function loadProductsTab() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
    
    let html = '<h3>Products Management</h3>';
    html += '<button class="btn btn-primary" onclick="addProduct()" style="margin-bottom: 20px;">Add Product</button>';
    html += '<table class="admin-table"><thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>';
    
    products.forEach(product => {
        html += `
            <tr>
                <td>${product.name}</td>
                <td>₱${product.price}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn-action btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    document.getElementById('adminContent').innerHTML = html;
}

// Similar functions for other tabs...

async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}
