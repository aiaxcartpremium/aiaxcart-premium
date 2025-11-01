// Shop page functionality
let allProducts = [];

// Sample products data
const sampleProducts = [
    {
        id: 'prod-1',
        name: "Netflix Premium",
        category: "streaming",
        price: 299,
        stock: 15,
        description: "Premium Netflix account with 4K streaming and multiple profiles.",
        type: "solo account",
        expires_at: "2025-11-07"
    },
    {
        id: 'prod-2',
        name: "Disney+ Premium",
        category: "streaming",
        price: 249,
        stock: 12,
        description: "Full access to Disney+ content including Marvel, Star Wars, and more.",
        type: "shared account",
        expires_at: "2025-10-15"
    },
    {
        id: 'prod-3',
        name: "Spotify Premium",
        category: "music",
        price: 199,
        stock: 20,
        description: "Ad-free music streaming with offline downloads.",
        type: "solo account",
        expires_at: "2025-12-01"
    }
];

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    checkAuthState();
});

async function loadProducts() {
    try {
        // Try to load from Supabase
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        
        if (error || !products || products.length === 0) {
            // Use sample data if Supabase fails
            allProducts = sampleProducts;
        } else {
            allProducts = products;
        }
        
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        allProducts = sampleProducts;
        renderProducts(allProducts);
    }
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text); opacity: 0.7; grid-column: 1 / -1;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 20px; color: var(--secondary);"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stockClass = product.stock > 10 ? 'product-stock' : 
                      product.stock > 0 ? 'product-stock low' : 'product-stock out';
    const stockText = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
    
    card.innerHTML = `
        <div class="product-image">
            <i class="fab fa-${getProductIcon(product.category)}"></i>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-meta">
                <span>${product.type}</span>
                <span class="${stockClass}">${stockText}</span>
            </div>
            <div class="product-price">₱${product.price}</div>
            <button class="btn-buy" ${product.stock === 0 ? 'disabled' : ''} onclick="buyProduct('${product.id}')">
                ${product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
        </div>
    `;
    
    return card;
}

function getProductIcon(category) {
    const icons = {
        streaming: 'netflix',
        gaming: 'steam',
        software: 'microsoft',
        music: 'spotify'
    };
    return icons[category] || 'shopping-bag';
}

function filterProducts(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const filtered = category === 'all' ? allProducts : 
                   allProducts.filter(p => p.category === category);
    renderProducts(filtered);
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
}

function buyProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        // Redirect to checkout page with product ID
        window.location.href = `checkout.html?product=${productId}`;
    }
}

// Global functions for navigation
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function switchLoginTab(tab) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
    } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
    }
}
