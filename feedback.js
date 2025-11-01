// Feedback with image upload
let selectedImage = null;

document.addEventListener('DOMContentLoaded', function() {
    loadFeedback();
    setupImageUpload();
});

async function loadFeedback() {
    try {
        const { data: feedback, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        renderFeedback(feedback || []);
    } catch (error) {
        console.error('Error loading feedback:', error);
        // Show sample feedback for demo
        renderFeedback(getSampleFeedback());
    }
}

function getSampleFeedback() {
    return [
        {
            id: '1',
            customer_name: 'Juan Dela Cruz',
            message: 'Great service! Received my Netflix account instantly. Highly recommended! ⭐⭐⭐⭐⭐',
            rating: 5,
            proof_image_url: 'https://via.placeholder.com/300x200/ff6b9d/ffffff?text=Netflix+Login+Proof',
            created_at: new Date().toISOString()
        },
        {
            id: '2', 
            customer_name: 'Maria Santos',
            message: 'Spotify account working perfectly. Fast delivery and good support. 👍',
            rating: 4,
            proof_image_url: 'https://via.placeholder.com/300x200/a8e6cf/ffffff?text=Spotify+Premium',
            created_at: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

function renderFeedback(feedbackList) {
    const container = document.getElementById('feedbackList');
    if (!container) return;
    
    if (feedbackList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text); opacity: 0.7;">
                <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 20px; color: var(--secondary);"></i>
                <h3>No feedback yet</h3>
                <p>Be the first to leave a review!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    feedbackList.forEach(feedback => {
        const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
        const date = new Date(feedback.created_at).toLocaleDateString();
        
        html += `
            <div class="feedback-item">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: var(--primary);">${feedback.customer_name}</h4>
                        <div style="color: #ffd700; font-size: 1.1rem;">${stars}</div>
                    </div>
                    <small style="color: var(--text); opacity: 0.7;">${date}</small>
                </div>
                <p style="margin: 0 0 15px 0; line-height: 1.5;">${feedback.message}</p>
                ${feedback.proof_image_url ? `
                    <div style="margin-top: 10px;">
                        <p style="font-weight: 600; color: var(--primary); margin-bottom: 8px;">
                            <i class="fas fa-camera"></i> Proof of Login:
                        </p>
                        <img src="${feedback.proof_image_url}" 
                             alt="Proof of login" 
                             style="max-width: 200px; border-radius: 10px; border: 2px solid var(--secondary); cursor: pointer;"
                             onclick="openImage('${feedback.proof_image_url}')">
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function setupImageUpload() {
    const imageInput = document.getElementById('proofImage');
    if (!imageInput) return;
    
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size should be less than 5MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedImage = e.target.result;
                showImagePreview(selectedImage);
            };
            reader.readAsDataURL(file);
        }
    });
}

function showImagePreview(imageData) {
    let preview = document.getElementById('imagePreview');
    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'imagePreview';
        preview.style.marginTop = '10px';
        document.getElementById('proofImage').parentNode.appendChild(preview);
    }
    
    preview.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${imageData}" alt="Preview" style="max-width: 100px; border-radius: 5px; border: 2px solid var(--secondary);">
            <button type="button" onclick="removeImage()" class="btn-action btn-delete">
                <i class="fas fa-times"></i> Remove
            </button>
        </div>
    `;
}

function removeImage() {
    selectedImage = null;
    const preview = document.getElementById('imagePreview');
    if (preview) preview.remove();
    document.getElementById('proofImage').value = '';
}

function openImage(imageUrl) {
    window.open(imageUrl, '_blank');
}

async function submitFeedback(event) {
    event.preventDefault();
    
    const name = document.getElementById('fbName').value.trim();
    const message = document.getElementById('fbMessage').value.trim();
    const rating = document.getElementById('fbRating').value;
    
    if (!name || !message || !rating) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        let imageUrl = null;
        
        // In a real app, you would upload the image to Supabase Storage
        if (selectedImage) {
            // For demo, we'll use a placeholder
            imageUrl = 'https://via.placeholder.com/300x200/ff6b9d/ffffff?text=Login+Proof';
        }
        
        const { data, error } = await supabase
            .from('feedback')
            .insert({
                customer_name: name,
                message: message,
                rating: parseInt(rating),
                proof_image_url: imageUrl
            })
            .select();
            
        if (error) throw error;
        
        showNotification('Thank you for your feedback!', 'success');
        
        // Reset form
        event.target.reset();
        removeImage();
        
        // Reload feedback
        loadFeedback();
        
    } catch (error) {
        console.error('Feedback error:', error);
        showNotification('Failed to submit feedback: ' + error.message, 'error');
    }
}
