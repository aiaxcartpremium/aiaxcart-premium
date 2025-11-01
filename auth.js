// Authentication functions
async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Session error:', error);
            return;
        }
        
        if (session) {
            currentUser = session.user;
            console.log('User logged in:', currentUser.email);
            await loadUserProfile();
            updateAuthUI();
        } else {
            console.log('No user session');
            currentUser = null;
            updateAuthUI();
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
        if (error) {
            // If profile doesn't exist, create one
            if (error.code === 'PGRST116') {
                await createUserProfile();
            } else {
                throw error;
            }
        } else if (profile) {
            currentUser.profile = profile;
        }
    } catch (error) {
        console.error('Profile load error:', error);
    }
}

async function createUserProfile() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: currentUser.id,
                display_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || 'User',
                email: currentUser.email,
                role: 'user'
            })
            .select()
            .single();
            
        if (error) throw error;
        
        currentUser.profile = data;
        console.log('Profile created:', data);
    } catch (error) {
        console.error('Profile creation error:', error);
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const myAccountBtn = document.getElementById('myAccountBtn');
    
    if (!loginBtn || !adminBtn || !logoutBtn || !myAccountBtn) {
        console.log('Auth UI elements not found');
        return;
    }
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        myAccountBtn.style.display = 'block';
        
        // Check if user is admin
        if (currentUser.profile && currentUser.profile.role === 'admin') {
            adminBtn.style.display = 'block';
            console.log('Admin user detected');
        } else {
            adminBtn.style.display = 'none';
        }
        
        console.log('Auth UI updated: User logged in');
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        myAccountBtn.style.display = 'none';
        adminBtn.style.display = 'none';
        console.log('Auth UI updated: User logged out');
    }
}

async function login(email, password) {
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return false;
    }
    
    try {
        console.log('Attempting login for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });
        
        if (error) {
            console.error('Login error:', error);
            throw error;
        }
        
        currentUser = data.user;
        console.log('Login successful:', currentUser.email);
        
        await loadUserProfile();
        updateAuthUI();
        
        // Close modal and reset form
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        if (loginEmail) loginEmail.value = '';
        if (loginPassword) loginPassword.value = '';
        
        showNotification('Login successful! Welcome back!', 'success');
        return true;
        
    } catch (error) {
        console.error('Login failed:', error);
        let errorMessage = 'Login failed';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email first';
        } else {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
        return false;
    }
}

async function signup(email, password, name) {
    if (!email || !password || !name) {
        showNotification('Please fill in all fields', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return false;
    }
    
    try {
        console.log('Attempting signup for:', email);
        
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: {
                    display_name: name.trim()
                }
            }
        });
        
        if (error) {
            console.error('Signup error:', error);
            throw error;
        }
        
        console.log('Signup successful:', data);
        
        // Close modal and reset form
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        const signupName = document.getElementById('signupName');
        const signupEmail = document.getElementById('signupEmail');
        const signupPassword = document.getElementById('signupPassword');
        if (signupName) signupName.value = '';
        if (signupEmail) signupEmail.value = '';
        if (signupPassword) signupPassword.value = '';
        
        showNotification('Signup successful! Please check your email for verification.', 'success');
        return true;
        
    } catch (error) {
        console.error('Signup failed:', error);
        let errorMessage = 'Signup failed';
        
        if (error.message.includes('User already registered')) {
            errorMessage = 'Email already registered';
        } else if (error.message.includes('Password should be at least')) {
            errorMessage = 'Password too weak';
        } else {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
        return false;
    }
}

async function logout() {
    try {
        console.log('Attempting logout');
        
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        updateAuthUI();
        
        // Go to home section
        showSection('home');
        
        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(nav => nav.classList.remove('active'));
        const homeLink = document.querySelector('[data-section="home"]');
        if (homeLink) homeLink.classList.add('active');
        
        showNotification('Logged out successfully!', 'info');
        console.log('Logout successful');
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed: ' + error.message, 'error');
    }
}

// Demo login function for testing (remove in production)
function setupDemoLogin() {
    // Add demo login button for testing
    const demoLoginBtn = document.createElement('button');
    demoLoginBtn.textContent = 'Demo Login';
    demoLoginBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 10px 15px;
        background: #ff6b9d;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
        font-size: 12px;
    `;
    
    demoLoginBtn.addEventListener('click', async () => {
        // Try to login with demo credentials
        await login('demo@aiaxcart.com', 'demo123');
    });
    
    document.body.appendChild(demoLoginBtn);
}

// Auth event listener
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        loadUserProfile().then(() => {
            updateAuthUI();
            showNotification('Welcome back!', 'success');
        });
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        updateAuthUI();
    }
});

// Initialize demo login for testing
document.addEventListener('DOMContentLoaded', () => {
    setupDemoLogin();
});
