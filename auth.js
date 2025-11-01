// Simple authentication system
async function checkAuthState() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.log('No user logged in');
            currentUser = null;
        } else if (user) {
            console.log('User logged in:', user.email);
            currentUser = user;
        }
        
        updateAuthUI();
    } catch (error) {
        console.log('Auth check failed, using demo mode');
        currentUser = null;
        updateAuthUI();
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const myAccountBtn = document.getElementById('myAccountBtn');
    
    if (!loginBtn) return;
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (myAccountBtn) myAccountBtn.style.display = 'block';
        
        // Check if admin (simple check for demo)
        if (currentUser.email === 'admin@aiaxcart.com' || currentUser.email.includes('admin')) {
            if (adminBtn) adminBtn.style.display = 'block';
        }
    } else {
        loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (myAccountBtn) myAccountBtn.style.display = 'none';
        if (adminBtn) adminBtn.style.display = 'none';
    }
}

// SIMPLE LOGIN - No Supabase Auth needed for demo
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    // Demo login - simple check
    if (email === 'admin@aiaxcart.com' && password === 'admin123') {
        currentUser = {
            id: 'demo-admin-1',
            email: 'admin@aiaxcart.com',
            role: 'admin'
        };
        showNotification('Admin login successful!', 'success');
    } else if (email === 'user@demo.com' && password === 'user123') {
        currentUser = {
            id: 'demo-user-1',
            email: 'user@demo.com',
            role: 'user'
        };
        showNotification('Login successful!', 'success');
    } else {
        // Auto-create demo user
        currentUser = {
            id: 'demo-' + Date.now(),
            email: email,
            role: 'user'
        };
        showNotification('Demo login successful!', 'success');
    }
    
    updateAuthUI();
    closeLoginModal();
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    // Auto-create user for demo
    currentUser = {
        id: 'demo-' + Date.now(),
        email: email,
        name: name,
        role: 'user'
    };
    
    showNotification('Account created successfully!', 'success');
    updateAuthUI();
    closeLoginModal();
}

async function logout() {
    currentUser = null;
    showNotification('Logged out successfully!', 'info');
    updateAuthUI();
}

// Modal functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function switchLoginTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.querySelector('[data-tab="login"]');
    const signupTab = document.querySelector('[data-tab="signup"]');
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
    }
}

// Navigation
function openAdminPanel() {
    if (currentUser && currentUser.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        showNotification('Admin access required', 'error');
    }
}

function openAccountPage() {
    if (currentUser) {
        window.location.href = 'account.html';
    } else {
        showNotification('Please login first', 'error');
    }
}
