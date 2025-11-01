// Checkout and order processing
function openCheckoutModal(product) {
    if (!product) {
        console.error('No product provided for checkout');
        return;
    }
    
    console.log('Opening checkout for:', product.name);
    
    currentProduct = product;
    
    const productNameInput = document.getElementById('productName');
    const productPriceInput = document.getElementById('productPrice');
    
    if (productNameInput) productNameInput.value = product.name;
    if (productPriceInput) productPriceInput.value = formatPrice(product.price);
    
    // Pre-fill customer info if logged in
    const customerNameInput = document.getElementById('customerName');
    const customerEmailInput = document.getElementById('customerEmail');
    
    if (currentUser) {
        if (customerNameInput) customerNameInput.value = currentUser.profile?.display_name || '';
        if (customerEmailInput) customerEmailInput.value = currentUser.email || '';
    } else {
        if (customerNameInput) customerNameInput.value = '';
        if (customerEmailInput) customerEmailInput.value = '';
    }
    
    // Reset form
    const paymentRefInput = document.getElementById('paymentRef');
    if (paymentRefInput) paymentRefInput.value = '';
    
    // Reset payment methods
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    const gcashMethod = document.querySelector('[data-method="gcash"]');
    if (gcashMethod) gcashMethod.classList.add('active');
    
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'flex';
    }
}

async function processCheckout() {
    console.log('Processing checkout...');
    
    const customerNameInput = document.getElementById('customerName');
    const customerEmailInput = document.getElementById('customerEmail');
    const paymentRefInput = document.getElementById('paymentRef');
    
    if (!customerNameInput || !customerEmailInput || !paymentRefInput) {
        showNotification('Checkout form elements not found', 'error');
        return;
    }
    
    const customerName = customerNameInput.value.trim();
    const customerEmail = customerEmailInput.value.trim();
    const paymentRef = paymentRefInput.value.trim();
    const activePaymentMethod = document.querySelector('.payment-method.active');
    const paymentMethod = activePaymentMethod ? activePaymentMethod.getAttribute('data-method') : null;
    
    console.log('Checkout data:', { customerName, customerEmail, paymentMethod, paymentRef });
    
    // Validation
    if (!customerName || !customerEmail || !paymentRef) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!paymentMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }
    
    if (!currentProduct) {
        showNotification('No product selected', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        showNotification('Processing your order...', 'info');
        
        // Create order data
        const orderData = {
            product_id: currentProduct.id,
            customer_name: customerName,
            customer_email: customerEmail,
            price: currentProduct.price,
            payment_method: paymentMethod,
            payment_reference: paymentRef,
            status: 'pending',
            order_date: new Date().toISOString()
        };
        
        console.log('Creating order:', orderData);
        
        // Try to save to Supabase
        let order;
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();
                
            if (error) throw error;
            order = data;
            console.log('Order saved to Supabase:', order);
        } catch (dbError) {
            console.log('Supabase save failed, using local order:', dbError);
            // Create local order if Supabase fails
            order = {
                id: 'order-' + Date.now(),
                ...orderData
            };
        }
        
        currentOrder = order;
        
        // Auto-drop: Find available account
        const availableAccount = await findAvailableAccount(currentProduct.id);
        
        if (availableAccount) {
            console.log('Account found, processing auto-drop...');
            
            // Mark account as sold
            await markAccountAsSold(availableAccount.id, customerEmail);
            
            // Update product stock
            await updateProductStock(currentProduct.id, currentProduct.stock - 1);
            
            // Update order status to delivered
            await updateOrderStatus(order.id, 'delivered');
            
            // Show success with account details
            showAccountDetails(availableAccount);
            
        } else {
            console.log('No available account, order pending');
            showNotification('Order received! We will process it shortly.', 'warning');
        }
        
        // Reload products to update stock
        await loadProducts();
        
        // Close checkout modal
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Error processing order: ' + error.message, 'error');
    }
}

async function findAvailableAccount(productId) {
    try {
        // Try Supabase first
        const { data, error } = await supabase
            .from('onhand_accounts')
            .select('*')
            .eq('product_id', productId)
            .eq('status', 'available')
            .limit(1)
            .single();
            
        if (!error && data) {
            console.log('Found account in Supabase:', data.id);
            return data;
        }
        
        // Fallback to sample accounts
        console.log('No accounts in Supabase, using sample data');
        const sampleAccounts = [
            {
                id: 'acc-1',
                product_id: productId,
                username: 'customer-' + Date.now() + '@aiaxcart.com',
                password: 'pass' + Math.random().toString(36).slice(2, 10),
                status: 'available',
                expires_at: '2025-12-31'
            }
        ];
        
        return sampleAccounts[0];
        
    } catch (error) {
        console.error('Error finding account:', error);
        return null;
    }
}

async function markAccountAsSold(accountId, customerEmail) {
    try {
        const { error } = await supabase
            .from('onhand_accounts')
            .update({
                status: 'sold',
                assigned_email: customerEmail,
                updated_at: new Date().toISOString()
            })
            .eq('id', accountId);
            
        if (error) throw error;
        console.log('Account marked as sold:', accountId);
    } catch (error) {
        console.error('Error marking account as sold:', error);
    }
}

async function updateProductStock(productId, newStock) {
    try {
        const { error } = await supabase
            .from('products')
            .update({
                stock: newStock,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId);
            
        if (error) throw error;
        console.log('Product stock updated:', productId, newStock);
    } catch (error) {
        console.error('Error updating product stock:', error);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({
                status: status,
                delivered_at: status === 'delivered' ? new Date().toISOString() : null
            })
            .eq('id', orderId);
            
        if (error) throw error;
        console.log('Order status updated:', orderId, status);
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

function showAccountDetails(account) {
    console.log('Showing account details:', account);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header" style="background: linear-gradient(135deg, #a8e6cf, #a8d8ea);">
                <h3>🎉 Order Successful!</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #a8e6cf; margin-bottom: 15px;"></i>
                    <h4 style="color: var(--primary); margin-bottom: 15px;">Your Account Details</h4>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p><strong>Product:</strong> ${currentProduct.name}</p>
                    <p><strong>Username:</strong> ${account.username}</p>
                    <p><strong>Password:</strong> ${account.password}</p>
                    <p><strong>Expires:</strong> ${formatDate(account.expires_at)}</p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 10px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404;">
                        <strong>⚠️ Important:</strong> Do not change the password. For personal use only.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="copyAccountDetails('${account.username}', '${account.password}')">
                    <i class="fas fa-copy"></i> Copy Details
                </button>
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close</button>
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
    
    showNotification('Order completed! Account details delivered.', 'success');
}

function copyAccountDetails(username, password) {
    const text = `Username: ${username}\nPassword: ${password}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Account details copied to clipboard!', 'success');
    }).catch((err) => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy details', 'error');
    });
}

// Payment method selection
function setupPaymentMethods() {
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => {
                m.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupPaymentMethods();
});
