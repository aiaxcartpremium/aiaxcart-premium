// Checkout functionality
let currentProduct = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProductFromURL();
    setupPaymentMethods();
});

function loadProductFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (productId) {
        // Find product from our data
        currentProduct = allProducts.find(p => p.id === productId);
        updateOrderSummary();
    } else {
        showNotification('No product selected', 'error');
        setTimeout(() => window.location.href = 'shop.html', 2000);
    }
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    if (!currentProduct || !orderSummary) return;
    
    orderSummary.innerHTML = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid var(--primary);">
            <h4 style="margin: 0 0 10px 0; color: var(--primary);">${currentProduct.name}</h4>
            <p style="margin: 0 0 10px 0; color: var(--text);">${currentProduct.description}</p>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Type:</span>
                <span>${currentProduct.type}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Duration:</span>
                <span>${currentProduct.duration}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; font-weight: bold;">
                <span>Total Price:</span>
                <span style="color: var(--primary);">${formatPrice(currentProduct.price)}</span>
            </div>
        </div>
    `;
}

function setupPaymentMethods() {
    // Set GCash as default
    selectPaymentMethod('gcash');
}

function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-method').forEach(m => {
        m.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
}

async function processOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const paymentRef = document.getElementById('paymentRef').value.trim();
    const paymentMethod = document.querySelector('.payment-method.active').getAttribute('data-method');
    
    // Validation
    if (!customerName || !customerEmail || !paymentRef) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!currentProduct) {
        showNotification('No product selected', 'error');
        return;
    }
    
    try {
        showNotification('Processing your order...', 'info');
        
        // Create order in Supabase
        const { data: order, error } = await supabase
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
            
        if (error) throw error;
        
        // Auto-drop account
        await autoDropAccount(order.id, customerEmail);
        
        showNotification('Order successful! Account details sent to your email.', 'success');
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Order failed: ' + error.message, 'error');
    }
}

async function autoDropAccount(orderId, customerEmail) {
    try {
        // Find available account
        const { data: account, error } = await supabase
            .from('onhand_accounts')
            .select('*')
            .eq('product_id', currentProduct.id)
            .eq('status', 'available')
            .limit(1)
            .single();
            
        if (account) {
            // Mark as sold
            await supabase
                .from('onhand_accounts')
                .update({
                    status: 'sold',
                    assigned_email: customerEmail,
                    updated_at: new Date().toISOString()
                })
                .eq('id', account.id);
                
            // Update product stock
            await supabase
                .from('products')
                .update({
                    stock: currentProduct.stock - 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentProduct.id);
                
            // Update order status
            await supabase
                .from('orders')
                .update({
                    status: 'delivered',
                    delivered_at: new Date().toISOString()
                })
                .eq('id', orderId);
                
            console.log('Auto-drop completed for order:', orderId);
        }
    } catch (error) {
        console.error('Auto-drop error:', error);
    }
}
