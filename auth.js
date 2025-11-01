// Authentication functions
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        alert('Login failed: ' + error.message);
    } else {
        currentUser = data.user;
        updateAuthUI();
        closeLoginModal();
        alert('Login successful!');
    }
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                display_name: name
            }
        }
    });
    
    if (error) {
        alert('Signup failed: ' + error.message);
    } else {
        closeLoginModal();
        alert('Signup successful! Please check your email for verification.');
    }
}

async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    updateAuthUI();
    window.location.href = 'index.html';
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openAdminPanel() {
    window.location.href = 'admin.html';
}

function openAccountPage() {
    window.location.href = 'account.html';
}
