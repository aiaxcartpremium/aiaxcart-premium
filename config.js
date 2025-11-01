// Supabase Configuration
const SUPABASE_URL = 'https://rvwahejdkijdigsxnjzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2d2FoZWpka2lqZGlnc3huanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTEwMDQsImV4cCI6MjA3NzQ2NzAwNH0.sNl2rGAM_Ofx6kp7rNA3z_S_9uOWFd4r-yxJc0c4UHg
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;

// Utility functions
function showNotification(message, type = 'info') {
    // Simple notification implementation
    alert(message);
}

function formatPrice(price) {
    return '₱' + parseFloat(price).toFixed(2);
}

// Auth state check
async function checkAuthState() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    updateAuthUI();
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const myAccountBtn = document.getElementById('myAccountBtn');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (myAccountBtn) myAccountBtn.style.display = 'block';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (myAccountBtn) myAccountBtn.style.display = 'none';
    }
}
