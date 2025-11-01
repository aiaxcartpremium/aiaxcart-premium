// Feedback functionality
document.addEventListener('DOMContentLoaded', function() {
    loadFeedback();
});

async function loadFeedback() {
    const { data: feedback, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
    
    const container = document.getElementById('feedbackList');
    if (!feedback || feedback.length === 0) {
        container.innerHTML = '<p>No feedback yet. Be the first to leave a review!</p>';
        return;
    }
    
    let html = '';
    feedback.forEach(item => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= item.rating ? '★' : '☆';
        }
        
        html += `
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 15px var(--shadow);">
                <div style="display: flex; justify-content: between; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: var(--primary);">${item.customer_name}</h4>
                    <div style="color: #ffd700;">${stars}</div>
                </div>
                <p style="margin: 0 0 10px 0;">${item.message}</p>
                <small style="color: var(--text); opacity: 0.7;">${new Date(item.created_at).toLocaleDateString()}</small>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

async function submitFeedback(event) {
    event.preventDefault();
    
    const name = document.getElementById('fbName').value;
    const message = document.getElementById('fbMessage').value;
    const rating = document.getElementById('fbRating').value;
    
    const { error } = await supabase
        .from('feedback')
        .insert({
            customer_name: name,
            message: message,
            rating: parseInt(rating)
        });
    
    if (error) {
        alert('Error submitting feedback: ' + error.message);
    } else {
        alert('Thank you for your feedback!');
        document.getElementById('fbName').value = '';
        document.getElementById('fbMessage').value = '';
        document.getElementById('fbRating').value = '';
        loadFeedback();
    }
}
