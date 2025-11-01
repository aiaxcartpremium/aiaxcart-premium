// Checkout and order processing
function openCheckoutModal(product) {
    if (!product) return;
    
    currentProduct = product;
    
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = formatPrice(product.price);
    
    // Pre-fill customer info if logged in
    if (currentUser) {
        document.getElementById('customerName').value = currentUser.profile?.display_name || '';
        document.getElementById('customerEmail').value = currentUser.email || '';
    } else {
        document.getElementById('customerName').value = '';
        document.getElementById('customerEmail').value = '';
    }
    
    // Reset form
    document.getElementById('paymentRef').value = '';
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    document.querySelector('[data-method="gcash"]').classList.add('active');
    
    document.getElementById('checkoutModal').style.display = 'flex';
}

async function processCheckout() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const paymentMethod = document.querySelector('.payment-method.active')?.getAttribute('data-method');
    const paymentRef = document.getElementById('paymentRef').value.trim();
    
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
    
    try {
        showNotification('Processing your order...', 'info');
        
        // 1. Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                product_id: currentProduct.id,
                customer_name: customerName,
                customer_email: customerEmail,
                price: currentProduct.price,
                payment_method: paymentMethod,
                payment_reference: paymentRef,
                status: 'pending'
            })
            .select()
            .single();
            
        if (orderError) throw orderError;
        
        currentOrder = order;
        
        // 2. Auto-drop: Find available account
        const { data: availableAccount, error: accountError } = await supabase
            .from('onhand_accounts')
            .select('*')
            .eq('product_id', currentProduct.id)
            .eq('status', 'available')
            .limit(1)
            .single();
            
        if (availableAccount) {
            // 3. Mark account as sold and assign to customer
            const { error: updateError } = await supabase
                .from('onhand_accounts')
                .update({
                    status: 'sold',
                    assigned_email: customerEmail,
                    updated_at: new Date()
                })
                .eq('id', availableAccount.id);
                
            if (updateError) throw updateError;
            
            // 4. Update product stock
            const { error: stockError } = await supabase
                .from('products')
                .update({
                    stock: currentProduct.stock - 1,
                    updated_at: new Date()
                })
                .eq('id', currentProduct.id);
                
            if (stockError) throw stockError;
            
            // 5. Update order status to delivered
            const { error: orderUpdateError } = await supabase
                .from('orders')
                .update({
                    status: 'delivered',
                    delivered_at: new Date()
                })
                .eq('id', order.id);
                
            if (orderUpdateError) throw orderUpdateError;
            
            // 6. Send account details
            const accountDetails = `
                🎉 ORDER SUCCESSFUL! 🎉

                Product: ${currentProduct.name}
                Price: ${formatPrice(currentProduct.price)}
                Order ID: ${order.id}

                📧 ACCOUNT DETAILS:
                Username: ${availableAccount.username}
                Password: ${availableAccount.password}
                Expires: ${formatDate(availableAccount.expires_at)}

                💡 IMPORTANT:
                • Do not change the password
                • For personal use only
                • Contact support if you have issues

                Thank you for your purchase! ❤️
            `;
            
            showNotification('Order successful! Account details delivered.', 'success');
            
            // Show account details modal
            showAccountDetails(accountDetails, availableAccount);
            
        } else {
            // No available account, keep order as pending
            showNotification('Order received! We will process it shortly.', 'warning');
        }
        
        // Reload products to update stock
        await loadProducts();
        document.getElementById('checkoutModal').style.display = 'none';
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Error processing order: ' + error.message, 'error');
    }
}

function showAccountDetails(details, account) {
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
}

function copyAccountDetails(username, password) {
    const text = `Username: ${username}\nPassword: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Account details copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy details', 'error');
    });
}

// Payment method selection
function setupPaymentMethods() {
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(m => {
                m.classList.remove('active');
            });
            method.classList.add('active');
        });
    });
}
