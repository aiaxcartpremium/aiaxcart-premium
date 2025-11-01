// Admin panel functionality
async function loadAdminData() {
    if (!currentUser || !currentUser.profile || currentUser.profile.role !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }
    
    try {
        await loadAdminProducts();
        await loadAdminAccounts();
        await loadAdminOrders();
        await loadSalesSummary();
        showNotification('Admin data loaded', 'success');
    } catch (error) {
        console.error('Admin data load error:', error);
        showNotification('Failed to load admin data', 'error');
    }
}

async function loadAdminProducts() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
    
    if (error) throw error;
    
    const productsTable = document.getElementById('adminProductsTable');
    if (!productsTable) return;
    
    productsTable.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td><span class="category-badge">${product.category}</span></td>
            <td>${formatPrice(product.price)}</td>
            <td>
                <span class="stock-badge ${product.stock > 10 ? 'high' : product.stock > 0 ? 'low' : 'out'}">
                    ${product.stock}
                </span>
            </td>
            <td>
                <button class="btn-action btn-edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-action btn-delete" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        productsTable.appendChild(row);
    });
}

async function loadAdminAccounts() {
    const { data: accounts, error } = await supabase
        .from('onhand_accounts')
        .select(`
            *,
            products (name, category)
        `)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const accountsTable = document.getElementById('adminAccountsTable');
    if (!accountsTable) return;
    
    accountsTable.innerHTML = '';
    
    accounts.forEach(account => {
        const statusClass = account.status === 'available' ? 'status-available' : 'status-sold';
        const product = account.products;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><code>${account.id.slice(0, 8)}...</code></td>
            <td>${product?.name || 'Unknown'}</td>
            <td>${account.username}</td>
            <td>
                <span class="password-field" onclick="togglePassword(this)">
                    ${'•'.repeat(8)}
                    <span class="actual-password" style="display: none;">${account.password}</span>
                </span>
            </td>
            <td><span class="status-badge ${statusClass}">${account.status}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editAccount('${account.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteAccount('${account.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        accountsTable.appendChild(row);
    });
}

async function loadAdminOrders() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            products (name)
        `)
        .order('order_date', { ascending: false });
    
    if (error) throw error;
    
    const ordersTable = document.getElementById('adminOrdersTable');
    if (!ordersTable) return;
    
    ordersTable.innerHTML = '';
    
    orders.forEach(order => {
        const statusClass = order.status === 'delivered' ? 'status-available' : 
                          order.status === 'pending' ? 'status-pending' : 'status-cancelled';
        const product = order.products;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><code>${order.id.slice(0, 8)}...</code></td>
            <td>${product?.name || 'Unknown'}</td>
            <td>
                <div>${order.customer_name}</div>
                <small>${order.customer_email}</small>
            </td>
            <td>${formatPrice(order.price)}</td>
            <td>
                <span class="status-badge ${statusClass}">${order.status}</span>
            </td>
            <td>${formatDate(order.order_date)}</td>
            <td>
                <button class="btn-action btn-edit" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-delete" onclick="cancelOrder('${order.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        ordersTable.appendChild(row);
    });
}

async function loadSalesSummary() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*');
    
    if (error) throw error;
    
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.price), 0);
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const totalOrders = orders.length;
    
    const salesSummary = document.getElementById('salesSummary');
    if (!salesSummary) return;
    
    salesSummary.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #a8e6cf, #a8d8ea); padding: 25px; border-radius: 15px; text-align: center; color: white;">
                <h3 style="margin: 0 0 10px 0; font-size: 2rem;">${totalOrders}</h3>
                <p style="margin: 0; opacity: 0.9;">Total Orders</p>
            </div>
            <div style="background: linear-gradient(135deg, #a8e6cf, #a8d8ea); padding: 25px; border-radius: 15px; text-align: center; color: white;">
                <h3 style="margin: 0 0 10px 0; font-size: 2rem;">${deliveredOrders}</h3>
                <p style="margin: 0; opacity: 0.9;">Delivered</p>
            </div>
            <div style="background: linear-gradient(135deg, #ffd3b6, #ff8ba7); padding: 25px; border-radius: 15px; text-align: center; color: white;">
                <h3 style="margin: 0 0 10px 0; font-size: 2rem;">${pendingOrders}</h3>
                <p style="margin: 0; opacity: 0.9;">Pending</p>
            </div>
            <div style="background: linear-gradient(135deg, #ff6b9d, #ffa8c8); padding: 25px; border-radius: 15px; text-align: center; color: white;">
                <h3 style="margin: 0 0 10px 0; font-size: 2rem;">${formatPrice(totalSales)}</h3>
                <p style="margin: 0; opacity: 0.9;">Total Revenue</p>
            </div>
        </div>
    `;
}

// Admin CRUD functions
function togglePassword(element) {
    const actualPassword = element.querySelector('.actual-password');
    const isVisible = actualPassword.style.display !== 'none';
    
    if (isVisible) {
        actualPassword.style.display = 'none';
        element.innerHTML = '•'.repeat(8) + '<span class="actual-password" style="display: none;">' + actualPassword.textContent + '</span>';
    } else {
        actualPassword.style.display = 'inline';
        element.innerHTML = actualPassword.textContent + ' <i class="fas fa-eye-slash"></i>';
    }
}

async function editProduct(productId) {
    showNotification('Edit product: ' + productId, 'info');
    // Implementation would open edit modal
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);
                
            if (error) throw error;
            
            await loadAdminProducts();
            showNotification('Product deleted successfully!', 'success');
        } catch (error) {
            showNotification('Error deleting product: ' + error.message, 'error');
        }
    }
}

async function addNewProduct() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Add New Product</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" class="form-control" id="newProductName" placeholder="e.g., Netflix Premium">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select class="form-control" id="newProductCategory">
                        <option value="streaming">Streaming</option>
                        <option value="gaming">Gaming</option>
                        <option value="software">Software</option>
                        <option value="music">Music</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <input type="number" class="form-control" id="newProductPrice" placeholder="0.00" step="0.01">
                </div>
                <div class="form-group">
                    <label>Stock</label>
                    <input type="number" class="form-control" id="newProductStock" placeholder="0">
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select class="form-control" id="newProductType">
                        <option value="solo account">Solo Account</option>
                        <option value="shared account">Shared Account</option>
                        <option value="code">Code</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control" id="newProductDescription" rows="3" placeholder="Product description..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="saveNewProduct()">Save Product</button>
            </div>
        </div>
    `;
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
}

async function saveNewProduct() {
    // Implementation for saving new product
    showNotification('New product functionality coming soon!', 'info');
}
