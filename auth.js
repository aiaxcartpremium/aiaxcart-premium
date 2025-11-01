// Authentication functions
async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
            currentUser = session.user;
            await loadUserProfile();
            updateAuthUI();
            showNotification('Welcome back!', 'success');
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
            
        if (error) throw error;
        
        if (profile) {
            currentUser.profile = profile;
        } else {
            // Create profile if doesn't exist
            await createUserProfile();
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
                display_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0],
                email: currentUser.email,
                role: 'user'
            })
            .select()
            .single();
            
        if (error) throw error;
        
        currentUser.profile = data;
    } catch (error) {
        console.error('Profile creation error:', error);
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const myAccountBtn = document.getElementById('myAccountBtn');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        myAccountBtn.style.display = 'block';
        
        if (currentUser.profile && currentUser.profile.role === 'admin') {
            adminBtn.style.display = 'block';
        } else {
            adminBtn.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        myAccountBtn.style.display = 'none';
        adminBtn.style.display = 'none';
    }
}

async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        await loadUserProfile();
        updateAuthUI();
        
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        showNotification('Login successful!', 'success');
        return true;
    } catch (error) {
        showNotification('Login failed: ' + error.message, 'error');
        return false;
    }
}

async function signup(email, password, name) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: {
                    display_name: name.trim()
                }
            }
        });
        
        if (error) throw error;
        
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
        
        showNotification('Signup successful! Please check your email for verification.', 'success');
        return true;
    } catch (error) {
        showNotification('Signup failed: ' + error.message, 'error');
        return false;
    }
}

async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        updateAuthUI();
        showSection('home');
        
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-section="home"]').classList.add('active');
        
        showNotification('Logged out successfully!', 'info');
    } catch (error) {
        showNotification('Logout failed: ' + error.message, 'error');
    }
}

// Auth event listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        loadUserProfile().then(updateAuthUI);
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        updateAuthUI();
    }
});
