// Supabase Configuration
const SUPABASE_URL = 'https://rvwahejdkijdigsxnjzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2d2FoZWpka2lqZGlnc3huanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTEwMDQsImV4cCI6MjA3NzQ2NzAwNH0.sNl2rGAM_Ofx6kp7rNA3z_S_9uOWFd4r-yxJc0c4UHg
const supabase = window.supabase.createClient(SUPABASE_URL, // Supabase Configuration - PALITAN MO ITO!
let currentUser = null;
let currentProduct = null;

// Utility functions
function showNotification(message, type = 'info') {
    // Simple notification - papalitan natin ng better later
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
}

function formatPrice(price) {
    return '₱' + parseFloat(price).toFixed(2);
}

// Demo mode flag
const DEMO_MODE = true;
