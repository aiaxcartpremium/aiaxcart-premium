// Checkout functionality
let currentProduct = null;
let selectedPaymentMethod = 'gcash';

document.addEventListener('DOMContentLoaded', function() {
    loadProductFromURL();
});

function loadProductFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (productId) {
        // In real implementation, fetch product from Supabase
        // For now, use sample data
        const sampleProducts = [
            {
                id: 'prod-1',
                name: "Netflix Premium",
                category: "streaming",
                price: 299,
                stock: 15,
                description: "Premium Netflix account with 4K streaming and multiple profiles.",
                type: "solo account"
            },
            {
                id: 'prod-2', 
                name: "Disney+ Premium",
                category: "streaming",
                price: 249,
                stock: 12,
                description: "Full access to Disney+ content including Marvel, Star Wars, and more.",
                type: "shared account"
            },
            {
                id: 'prod-3',
                name: "Spotify Premium",
                category: "music", 
                price: 199,
                stock: 20,
                description: "Ad-free music streaming with offline downloads.",
                type: "solo account"
            }
        ];
        
        currentProduct = sampleProducts.find(p => p.id === productId) || sampleProducts[0];
        updateOrderSummary();
    }
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    if (!currentProduct || !orderSummary) return;
    
    orderSummary.innerHTML = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h4>${currentProduct.name}</h4>
            <p>${currentProduct.description}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span>Price:</span>
                <strong>₱${currentProduct.price}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span>Type:</span>
                <span>${currentProduct.type}</span>
            </div>
        </div>
    `;
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-method').forEach(m => {
        m.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
}

async function processOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const paymentRef = document.getElementById('paymentRef').value.trim();
    
    if (!customerName || !customerEmail || !paymentRef) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!currentProduct) {
        alert('No product selected');
        return;
    }
    
    try {
        // Create order in Supabase
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                product_id: currentProduct.id,
                customer_name: customerName,
                customer_email: customerEmail,
                price: currentProduct.price,
                payment_method: selectedPaymentMethod,
                payment_reference: paymentRef,
                status: 'pending'
            })
            .select()
            .single();
            
        if (error) throw error;
        
        // Auto-drop account
        await autoDropAccount(order.id, customerEmail);
        
        alert('Order placed successfully! You will receive account details soon.');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Order error:', error);
        alert('Error processing order: ' + error.message);
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
                    assigned_email: customerEmail
                })
                .eq('id', account.id);
                
            // Update product stock
            await supabase
                .from('products')
                .update({
                    stock: currentProduct.stock - 1
                })
                .eq('id', currentProduct.id);
                
            // Update order status
            await supabase
                .from('orders')
                .update({
                    status: 'delivered'
                })
                .eq('id', orderId);
        }
    } catch (error) {
        console.error('Auto-drop error:', error);
    }
}
