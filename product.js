// Product management functions
let allProducts = [];

// Sample products data for demo
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
    },
    {
        id: 'prod-4',
        name: "Steam Wallet Code",
        category: "gaming",
        price: 500,
        stock: 8,
        description: "$10 Steam Wallet code for game purchases.",
        type: "code",
        expires_at: "2026-01-01"
    },
    {
        id: 'prod-5',
        name: "YouTube Premium",
        category: "streaming",
        price: 349,
        stock: 10,
        description: "Ad-free YouTube with background play and downloads.",
        type: "solo account",
        expires_at: "2025-11-20"
    },
    {
        id: 'prod-6',
        name: "Adobe Creative Cloud",
        category: "software",
        price: 899,
        stock: 5,
        description: "Full access to Adobe Creative Cloud applications.",
        type: "shared account",
        expires_at: "2025-09-30"
    }
];

async function loadProducts() {
    try {
        console.log('Loading products...');
        
        // Try to load from Supabase first
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        
        if (error) {
            console.log('Supabase error, using sample data:', error);
            // Use sample data if Supabase fails
            allProducts = sampleProducts;
        } else if (products && products.length > 0) {
            console.log('Products loaded from Supabase:', products.length);
            allProducts = products;
        } else {
            console.log('No products in Supabase, using sample data');
            allProducts = sampleProducts;
        }
        
        renderProducts(allProducts);
        showNotification('Products loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample data
        allProducts = sampleProducts;
        renderProducts(allProducts);
        showNotification('Using demo products data', 'info');
    }
}

function renderProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    const accountsProductsContainer = document.getElementById('accountsProductsContainer');
    
    if (!productsContainer || !accountsProductsContainer) {
        console.log('Product containers not found');
        return;
    }
    
    productsContainer.innerHTML = '';
    accountsProductsContainer.innerHTML = '';
    
    if (products.length === 0) {
        const emptyMessage = `
            <div style="text-align: center; padding: 40px; color: var(--text); opacity: 0.7;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 20px; color: var(--secondary);"></i>
                <h3>No products available</h3>
                <p>Check back later for new premium accounts!</p>
            </div>
        `;
        productsContainer.innerHTML = emptyMessage;
        accountsProductsContainer.innerHTML = emptyMessage;
        return;
    }
    
    console.log('Rendering products:', products.length);
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        const productCardClone = productCard.cloneNode(true);
        
        productsContainer.appendChild(productCardClone);
        accountsProductsContainer.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    card.setAttribute('data-product-id', product.id);
    
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
            <div class="product-price">${formatPrice(product.price)}</div>
            <button class="btn-buy" ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
        </div>
    `;
    
    const buyBtn = card.querySelector('.btn-buy');
    if (product.stock > 0) {
        buyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Buy button clicked for:', product.name);
            openCheckoutModal(product);
        });
    }
    
    // Make entire card clickable for details
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-buy')) {
            console.log('Product card clicked:', product.name);
            openProductDetails(product);
        }
    });
    
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
    console.log('Filtering products by:', category);
    
    const filteredProducts = category === 'all' ? allProducts : 
                           allProducts.filter(p => p.category === category);
    
    console.log('Filtered products:', filteredProducts.length);
    renderProducts(filteredProducts);
}

function openProductDetails(product) {
    console.log('Opening product details:', product.name);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>${product.name}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start;">
                    <div class="product-image" style="height: 200px; border-radius: 15px;">
                        <i class="fab fa-${getProductIcon(product.category)}" style="font-size: 4rem;"></i>
                    </div>
                    <div>
                        <h4 style="color: var(--primary); margin-bottom: 15px;">Product Details</h4>
                        <p><strong>Category:</strong> ${product.category}</p>
                        <p><strong>Type:</strong> ${product.type}</p>
                        <p><strong>Price:</strong> ${formatPrice(product.price)}</p>
                        <p><strong>Stock:</strong> ${product.stock} available</p>
                        <p><strong>Description:</strong> ${product.description}</p>
                        ${product.expires_at ? `<p><strong>Expires:</strong> ${formatDate(product.expires_at)}</p>` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn btn-primary" onclick="openCheckoutModalFromDetails('${product.id}')">
                    Buy Now
                </button>
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

function openCheckoutModalFromDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        // Close details modal
        const modal = document.querySelector('.modal');
        if (modal) modal.remove();
        
        // Open checkout modal
        openCheckoutModal(product);
    }
}

// Initialize search functionality
function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '🔍 Search products...';
    searchInput.style.cssText = `
        padding: 12px 20px;
        border: 2px solid var(--secondary);
        border-radius: 25px;
        font-size: 1rem;
        width: 100%;
        max-width: 400px;
        margin: 0 auto 30px;
        display: block;
        background: white;
        outline: none;
    `;
    
    const accountsSection = document.getElementById('accounts');
    if (accountsSection) {
        const filterContainer = accountsSection.querySelector('.products-filter');
        if (filterContainer) {
            filterContainer.parentNode.insertBefore(searchInput, filterContainer);
            
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                console.log('Searching for:', searchTerm);
                
                const filtered = allProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );
                
                renderProducts(filtered);
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
});
