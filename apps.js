// Main application initialization
async function init() {
    try {
        await checkAuthState();
        await loadProducts();
        await loadFeedback();
        setupEventListeners();
        setupClickEvents();
        setupPaymentMethods();
        showNotification('Welcome to Aiaxcart Premium Shop!', 'success');
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
            
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            filterProducts(filter);
        });
    });

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            showSection('accounts');
            
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            document.querySelector('[data-section="accounts"]').classList.add('active');
            
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-filter="${category}"]`).classList.add('active');
            
            filterProducts(category);
        });
    });

    // User actions
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'flex';
    });

    document.getElementById('adminBtn').addEventListener('click', () => {
        if (currentUser?.profile?.role === 'admin') {
            showSection('adminPanel');
            loadAdminData();
        } else {
            showNotification('Admin access required', 'error');
        }
    });

    document.getElementById('myAccountBtn').addEventListener('click', () => {
        if (currentUser) {
            showSection('myAccount');
            loadUserAccount();
        } else {
            showNotification('Please login first', 'error');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.getElementById('browseProductsBtn').addEventListener('click', () => {
        showSection('accounts');
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-section="accounts"]').classList.add('active');
    });

    // Modal controls
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    document.getElementById('cancelCheckout').addEventListener('click', () => {
        document.getElementById('checkoutModal').style.display = 'none';
    });

    document.getElementById('confirmCheckout').addEventListener('click', processCheckout);

    // Login tabs
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
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
    document.getElementById('submitLogin').addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await login(email, password);
    });

    // Signup form submission
    document.getElementById('submitSignup').addEventListener('click', async () => {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        await signup(email, password, name);
    });

    // Admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(`${tabName}Tab`).style.display = 'block';
        });
    });

    // Admin buttons
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addNewProduct);
    }

    const addAccountBtn = document.getElementById('addAccountBtn');
    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', () => {
            showNotification('Add account functionality coming soon!', 'info');
        });
    }

    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
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
}

function setupClickEvents() {
    // Logo click - go to home
    document.querySelector('.logo').addEventListener('click', () => {
        showSection('home');
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-section="home"]').classList.add('active');
    });

    // Social media links
    document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Social media link clicked!', 'info');
        });
    });

    // Footer links (non-navigation)
    document.querySelectorAll('.footer-column a').forEach(link => {
        if (!link.classList.contains('nav-link')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('Link: ' + link.textContent, 'info');
            });
        }
    });
}

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

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Scroll to top when switching sections
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Add CSS for new elements
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
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
