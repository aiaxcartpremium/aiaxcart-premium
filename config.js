// Supabase Configuration
const SUPABASE_URL = 'https://rvwahejdkijdigsxnjzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2d2FoZWpka2lqZGlnc3huanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTEwMDQsImV4cCI6MjA3NzQ2NzAwNH0.sNl2rGAM_Ofx6kp7rNA3z_S_9uOWFd4r-yxJc0c4UHg
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let currentProduct = null;
let currentOrder = null;

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 5000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    const colors = {
        success: '#a8e6cf',
        error: '#ff8ba7',
        warning: '#ffd3b6',
        info: '#a8d8ea'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatPrice(price) {
    return '₱' + parseFloat(price).toFixed(2);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
