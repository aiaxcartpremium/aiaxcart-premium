// Product management functions
let allProducts = [];

async function loadProducts() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        allProducts = products;
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

function renderProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    const accountsProductsContainer = document.getElementById('accountsProductsContainer');
    
    if (!productsContainer || !accountsProductsContainer) return;
    
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
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard.cloneNode(true));
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
            openCheckoutModal(product);
        });
    }
    
    // Make entire card clickable
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-buy')) {
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
    const productCards = document.querySelectorAll('.product-card');
    const filteredProducts = category === 'all' ? allProducts : 
                           allProducts.filter(p => p.category === category);
    
    renderProducts(filteredProducts);
}

function openProductDetails(product) {
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
                <button class="btn btn-primary" onclick="openCheckoutModal(${JSON.stringify(product).replace(/"/g, '&quot;')}); this.closest('.modal').remove()">
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

// Search functionality
function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search products...';
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
    `;
    
    const accountsSection = document.getElementById('accounts');
    if (accountsSection) {
        const filterContainer = accountsSection.querySelector('.products-filter');
        if (filterContainer) {
            filterContainer.parentNode.insertBefore(searchInput, filterContainer);
        }
    }
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filtered);
    });
}
