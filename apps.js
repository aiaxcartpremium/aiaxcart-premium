// Main app functionality for index.html
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    loadFeaturedProducts();
});

function loadFeaturedProducts() {
    const sampleProducts = [
        {
            id: 'prod-1',
            name: "Netflix Premium",
            category: "streaming", 
            price: 299,
            stock: 15,
            description: "Premium Netflix account with 4K streaming.",
            type: "solo account"
        },
        {
            id: 'prod-2',
            name: "Spotify Premium", 
            category: "music",
            price: 199,
            stock: 20,
            description: "Ad-free music streaming with offline downloads.",
            type: "solo account"
        },
        {
            id: 'prod-3',
            name: "Steam Wallet Code",
            category: "gaming",
            price: 500, 
            stock: 8,
            description: "$10 Steam Wallet code for game purchases.",
            type: "code"
        }
    ];
    
    const container = document.getElementById('featuredProducts');
    let html = '';
    
    sampleProducts.forEach(product => {
        html += `
            <div class="product-card">
                <div class="product-image">
                    <i class="fab fa-${getProductIcon(product.category)}"></i>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span>${product.type}</span>
                        <span class="product-stock">${product.stock} in stock</span>
                    </div>
                    <div class="product-price">₱${product.price}</div>
                    <button class="btn-buy" onclick="window.location.href='shop.html'">
                        Buy Now
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
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

function filterCategory(category) {
    window.location.href = `shop.html#filter-${category}`;
}
