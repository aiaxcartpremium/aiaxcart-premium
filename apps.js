// Main application initialization
async function init() {
    console.log('Initializing Aiaxcart Premium Shop...');
    
    try {
        await checkAuthState();
        await loadProducts();
        await loadFeedback();
        setupEventListeners();
        setupClickEvents();
        setupPaymentMethods();
        
        console.log('Application initialized successfully');
        showNotification('Welcome to Aiaxcart Premium Shop! 🎀', 'success');
        
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Application loaded with demo data', 'info');
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            console.log('Navigation clicked:', sectionId);
            showSection(sectionId);
            
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            console.log('Filter clicked:', filter);
            
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            filterProducts(filter);
        });
    });

    // Category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            console.log('Category clicked:', category);
            
            showSection('accounts');
            
            // Update navigation
            navLinks.forEach(nav => nav.classList.remove('active'));
            const accountsLink = document.querySelector('[data-section="accounts"]');
            if (accountsLink) accountsLink.classList.add('active');
            
            // Update filter
            filterBtns.forEach(b => b.classList.remove('active'));
            const categoryFilter = document.querySelector(`[data-filter="${category}"]`);
            if (categoryFilter) categoryFilter.classList.add('active');
            
            filterProducts(category);
        });
    });

    // User actions
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('Login button clicked');
            document.getElementById('loginModal').style.display = 'flex';
        });
    }

    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            console.log('Admin button clicked');
            if (currentUser?.profile?.role === 'admin') {
                showSection('adminPanel');
                loadAdminData();
            } else {
                showNotification('Admin access required', 'error');
            }
        });
    }

    const myAccountBtn = document.getElementById('myAccountBtn');
    if (myAccountBtn) {
        myAccountBtn.addEventListener('click', () => {
            console.log('My Account button clicked');
            if (currentUser) {
                showSection('myAccount');
                loadUserAccount();
            } else {
                showNotification('Please login first', 'error');
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    const browseProductsBtn = document.getElementById('browseProductsBtn');
    if (browseProductsBtn) {
        browseProductsBtn.addEventListener('click', () => {
            console.log('Browse Products button clicked');
            showSection('accounts');
            navLinks.forEach(nav => nav.classList.remove('active'));
            const accountsLink = document.querySelector('[data-section="accounts"]');
            if (accountsLink) accountsLink.classList.add('active');
        });
    }

    // Modal controls
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    const cancelCheckoutBtn = document.getElementById('cancelCheckout');
    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', () => {
            document.getElementById('checkoutModal').style.display = 'none';
        });
    }

    const confirmCheckoutBtn = document.getElementById('confirmCheckout');
    if (confirmCheckoutBtn) {
        confirmCheckoutBtn.addEventListener('click', processCheckout);
    }

    // Login tabs
    const loginTabs = document.querySelectorAll('.login-tab');
    loginTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log('Login tab clicked:', tabName);
            
            loginTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            if (tabName === 'login') {
                document.getElementById('loginForm').style.display = 'block';
                document.getElementById('signupForm').style.display = 'none';
            } else {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('signupForm').style.display = 'block';
            }
        });
    });

    // Login form submission
    const submitLoginBtn = document.getElementById('submitLogin');
    if (submitLoginBtn) {
        submitLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            console.log('Login form submitted:', email);
            await login(email, password);
        });
    }

    // Signup form submission
    const submitSignupBtn = document.getElementById('submitSignup');
    if (submitSignupBtn) {
        submitSignupBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            console.log('Signup form submitted:', email);
            await signup(email, password, name);
        });
    }

    // Admin tabs
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log('Admin tab clicked:', tabName);
            
            adminTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            const targetTab = document.getElementById(`${tabName}Tab`);
            if (targetTab) {
                targetTab.style.display = 'block';
            }
        });
    });

    // Admin buttons
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            console.log('Add product button clicked');
            showNotification('Add product functionality coming soon!', 'info');
        });
    }

    const addAccountBtn = document.getElementById('addAccountBtn');
    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', () => {
            console.log('Add account button clicked');
            showNotification('Add account functionality coming soon!', 'info');
        });
    }

    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Feedback form submitted');
            submitFeedback();
        });
    }

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
    
    console.log('Event listeners setup complete');
}

function setupClickEvents() {
    console.log('Setting up click events...');
    
    // Logo click - go to home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            console.log('Logo clicked');
            showSection('home');
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            const homeLink = document.querySelector('[data-section="home"]');
            if (homeLink) homeLink.classList.add('active');
        });
    }

    // Social media links
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Social media clicked:', link.querySelector('i').className);
            showNotification('Social media link clicked!', 'info');
        });
    });

    // Footer links (non-navigation)
    const footerLinks = document.querySelectorAll('.footer-column a:not(.nav-link)');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Footer link clicked:', link.textContent);
            showNotification('Link: ' + link.textContent, 'info');
        });
    });
}

function setupPaymentMethods() {
    console.log('Setting up payment methods...');
    
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            console.log('Payment method selected:', this.getAttribute('data-method'));
            
            paymentMethods.forEach(m => {
                m.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Scroll to top when switching sections
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('Section activated:', sectionId);
    } else {
        console.error('Section not found:', sectionId);
    }
}

// Add additional CSS styles
const additionalStyles = `
    .category-badge {
        padding: 4px 12px;
        background: rgba(255,107,157,0.1);
        color: var(--primary);
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .stock-badge {
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 600;
        color: white;
    }
    
    .stock-badge.high { background: #a8e6cf; }
    .stock-badge.low { background: #ffd3b6; color: #333; }
    .stock-badge.out { background: #ff8ba7; }
    
    .status-pending {
        background: rgba(255,211,182,0.2);
        color: #ff8b28;
    }
    
    .status-cancelled {
        background: rgba(255,139,167,0.2);
        color: #d63384;
    }
    
    .password-field {
        cursor: pointer;
        padding: 4px 8px;
        background: #f8f9fa;
        border-radius: 5px;
        font-family: monospace;
        user-select: none;
    }
    
    .login-form {
        transition: all 0.3s ease;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, starting initialization...');
    init();
});

// Export functions for global access
window.showSection = showSection;
window.filterProducts = filterProducts;
window.openCheckoutModal = openCheckoutModal;
window.processCheckout = processCheckout;
window.copyAccountDetails = copyAccountDetails;
window.login = login;
window.logout = logout;
window.signup = signup;
window.loadProducts = loadProducts;
window.loadFeedback = loadFeedback;
window.submitFeedback = submitFeedback;
window.loadAdminData = loadAdminData;
window.loadUserAccount = loadUserAccount;
