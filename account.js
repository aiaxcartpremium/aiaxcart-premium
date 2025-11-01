// Account page functionality
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    loadUserProfile();
    loadUserOrders();
});

async function loadUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    const userProfile = document.getElementById('userProfile');
    userProfile.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 8px 25px var(--shadow);">
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                    <i class="fas fa-user"></i>
                </div>
                <div>
                    <h3 style="margin: 0 0 5px 0; color: var(--primary);">${user.email}</h3>
                    <p style="margin: 0; color: var(--text);">Member since ${new Date(user.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `;
}

async function loadUserOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });
    
    const ordersContainer = document.getElementById('userOrders');
    if (!orders || orders.length === 0) {
        ordersContainer.innerHTML += `
            <div style="text-align: center; padding: 40px; color: var(--text); opacity: 0.7;">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 20px; color: var(--secondary);"></i>
                <h4>No orders yet</h4>
                <p>Start shopping to see your orders here!</p>
                <button class="btn btn-primary" onclick="window.location.href='shop.html'">Browse Products</button>
            </div>
        `;
        return;
    }
    
    let ordersHTML = '<div class="orders-list">';
    orders.forEach(order => {
        ordersHTML += `
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 4px 15px var(--shadow);">
                <div style="display: flex; justify-content: between; align-items: start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 10px 0; color: var(--primary);">Order #${order.id.slice(0, 8)}</h4>
                        <p style="margin: 0 0 5px 0;"><strong>Amount:</strong> ₱${order.price}</p>
                        <p style="margin: 0 0 5px 0;"><strong>Status:</strong> <span class="status-${order.status}">${order.status}</span></p>
                        <p style="margin: 0 0 5px 0;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge ${order.status === 'delivered' ? 'status-available' : 'status-pending'}">
                            ${order.status}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    ordersHTML += '</div>';
    ordersContainer.innerHTML += ordersHTML;
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}
