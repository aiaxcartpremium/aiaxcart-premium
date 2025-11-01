// Complete products data based on your categories
const allProducts = [
    // ENTERTAINMENT - NETFLIX
    {
        id: 'netflix-premium',
        name: "Netflix Premium",
        category: "entertainment",
        subcategory: "netflix",
        price: 299,
        stock: 15,
        description: "Premium Netflix account with 4K streaming and multiple profiles. 1 month warranty.",
        type: "solo account",
        duration: "1 month"
    },
    {
        id: 'netflix-shared',
        name: "Netflix Shared",
        category: "entertainment", 
        subcategory: "netflix",
        price: 199,
        stock: 25,
        description: "Shared Netflix account with HD streaming. Profile-based access.",
        type: "shared account",
        duration: "1 month"
    },

    // ENTERTAINMENT - DISNEY+
    {
        id: 'disney-plus',
        name: "Disney+ Premium",
        category: "entertainment",
        subcategory: "disney+",
        price: 249,
        stock: 12,
        description: "Full access to Disney+ including Marvel, Star Wars, and National Geographic.",
        type: "solo account",
        duration: "1 month"
    },

    // ENTERTAINMENT - HBO MAX
    {
        id: 'hbo-max',
        name: "HBO Max",
        category: "entertainment",
        subcategory: "hbo max", 
        price: 349,
        stock: 8,
        description: "Access to HBO Max with all Warner Bros content and exclusive series.",
        type: "solo account",
        duration: "1 month"
    },

    // ENTERTAINMENT - VIU
    {
        id: 'viu-premium',
        name: "VIU Premium",
        category: "entertainment",
        subcategory: "viu",
        price: 149,
        stock: 20,
        description: "Korean dramas and Asian content with premium access.",
        type: "solo account",
        duration: "1 month"
    },

    // ENTERTAINMENT - VIVAMAX
    {
        id: 'vivamax',
        name: "Vivamax",
        category: "entertainment",
        subcategory: "vivamax",
        price: 199,
        stock: 18,
        description: "Local Filipino movies and exclusive content.",
        type: "solo account",
        duration: "1 month"
    },

    // STREAMING - SPOTIFY
    {
        id: 'spotify-premium',
        name: "Spotify Premium",
        category: "streaming", 
        subcategory: "spotify",
        price: 199,
        stock: 30,
        description: "Ad-free music streaming with offline downloads and high quality audio.",
        type: "solo account",
        duration: "1 month"
    },

    // STREAMING - YOUTUBE
    {
        id: 'youtube-premium',
        name: "YouTube Premium",
        category: "streaming",
        subcategory: "youtube",
        price: 349,
        stock: 15,
        description: "Ad-free YouTube, background play, and YouTube Music included.",
        type: "solo account", 
        duration: "1 month"
    },

    // EDUCATIONAL - GRAMMARLY
    {
        id: 'grammarly-premium',
        name: "Grammarly Premium",
        category: "educational",
        subcategory: "grammarly",
        price: 299,
        stock: 22,
        description: "Advanced grammar checking and writing suggestions.",
        type: "solo account",
        duration: "1 month"
    },

    // EDUCATIONAL - QUILLBOT
    {
        id: 'quillbot-premium',
        name: "Quillbot Premium",
        category: "educational",
        subcategory: "quillbot",
        price: 249,
        stock: 18,
        description: "AI-powered paraphrasing tool with multiple modes.",
        type: "solo account",
        duration: "1 month"
    },

    // EDUCATIONAL - MS365
    {
        id: 'ms365',
        name: "Microsoft 365",
        category: "educational",
        subcategory: "ms365",
        price: 399,
        stock: 10,
        description: "Full Office suite with Word, Excel, PowerPoint and 1TB cloud storage.",
        type: "solo account",
        duration: "1 month"
    },

    // EDITING - CANVA
    {
        id: 'canva-pro',
        name: "Canva Pro",
        category: "editing",
        subcategory: "canva",
        price: 299,
        stock: 25,
        description: "Premium design tools, templates, and stock assets.",
        type: "solo account",
        duration: "1 month"
    },

    // EDITING - CAPCUT
    {
        id: 'capcut-pro',
        name: "CapCut Pro",
        category: "editing",
        subcategory: "capcut",
        price: 199,
        stock: 20,
        description: "Professional video editing with premium effects and features.",
        type: "solo account",
        duration: "1 month"
    },

    // AI - CHATGPT
    {
        id: 'chatgpt-plus',
        name: "ChatGPT Plus",
        category: "ai",
        subcategory: "chatgpt",
        price: 599,
        stock: 15,
        description: "GPT-4 access, faster response times, and priority access.",
        type: "solo account",
        duration: "1 month"
    },

    // AI - GEMINI
    {
        id: 'gemini-advanced',
        name: "Gemini Advanced",
        category: "ai", 
        subcategory: "gemini ai",
        price: 499,
        stock: 12,
        description: "Google's most advanced AI with enhanced capabilities.",
        type: "solo account",
        duration: "1 month"
    },

    // Add more products based on your list...
    {
        id: 'bilibili',
        name: "Bilibili Premium",
        category: "entertainment",
        subcategory: "bilibili",
        price: 179,
        stock: 15,
        description: "Chinese streaming platform with anime and gaming content.",
        type: "solo account",
        duration: "1 month"
    },

    {
        id: 'crunchyroll',
        name: "Crunchyroll Premium",
        category: "entertainment",
        subcategory: "crunchyroll",
        price: 229,
        stock: 14,
        description: "Anime streaming with simulcast episodes and ad-free viewing.",
        type: "solo account",
        duration: "1 month"
    },

    {
        id: 'apple-music',
        name: "Apple Music",
        category: "streaming",
        subcategory: "apple music",
        price: 199,
        stock: 18,
        description: "70+ million songs, spatial audio, and lyrics.",
        type: "solo account",
        duration: "1 month"
    }
];

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupCategoryFilters();
});

function loadProducts() {
    renderProducts(allProducts);
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    const featuredContainer = document.getElementById('featuredProducts');
    
    if (container) {
        container.innerHTML = '';
        products.forEach(product => {
            container.appendChild(createProductCard(product));
        });
    }
    
    if (featuredContainer) {
        // Show only 6 featured products on homepage
        const featured = products.slice(0, 6);
        featuredContainer.innerHTML = '';
        featured.forEach(product => {
            featuredContainer.appendChild(createProductCard(product));
        });
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    card.setAttribute('data-subcategory', product.subcategory);
    
    const stockClass = product.stock > 10 ? 'product-stock' : 
                      product.stock > 0 ? 'product-stock low' : 'product-stock out';
    const stockText = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
    
    card.innerHTML = `
        <div class="product-image">
            <i class="fab fa-${getProductIcon(product.subcategory)}"></i>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-meta">
                <span>${product.type} • ${product.duration}</span>
                <span class="${stockClass}">${stockText}</span>
            </div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <button class="btn-buy" ${product.stock === 0 ? 'disabled' : ''} 
                    onclick="buyProduct('${product.id}')">
                ${product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
        </div>
    `;
    
    return card;
}

function getProductIcon(subcategory) {
    const icons = {
        'netflix': 'netflix',
        'disney+': 'disney',
        'hbo max': 'hbo',
        'viu': 'youtube',
        'vivamax': 'video',
        'spotify': 'spotify',
        'youtube': 'youtube',
        'apple music': 'apple',
        'grammarly': 'keyboard',
        'quillbot': 'pen',
        'ms365': 'microsoft',
        'canva': 'paint-brush',
        'capcut': 'video',
        'chatgpt': 'robot',
        'gemini ai': 'google',
        'bilibili': 'play-circle',
        'crunchyroll': 'play'
    };
    return icons[subcategory.toLowerCase()] || 'shopping-bag';
}

function setupCategoryFilters() {
    // Add category filter buttons dynamically
    const categories = [...new Set(allProducts.map(p => p.category))];
    const filterContainer = document.querySelector('.products-filter');
    
    if (filterContainer) {
        let filterHTML = '<button class="filter-btn active" onclick="filterProducts(\'all\')">All</button>';
        
        categories.forEach(category => {
            filterHTML += `<button class="filter-btn" onclick="filterProducts('${category}')">${capitalizeFirst(category)}</button>`;
        });
        
        filterContainer.innerHTML = filterHTML;
    }
}

function filterProducts(category) {
    // Update active button
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
        product.subcategory.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
}

function buyProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        if (product.stock > 0) {
            // Redirect to checkout with product ID
            window.location.href = `checkout.html?product=${productId}`;
        } else {
            showNotification('This product is out of stock', 'error');
        }
    }
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
