// DOM Elements
const form = document.getElementById('summarize-form');
const videoUrlInput = document.getElementById('video-url');
const customPromptInput = document.getElementById('custom-prompt');
const submitBtn = document.getElementById('submit-btn');
const resultsSection = document.getElementById('results-section');
const loadingElement = document.getElementById('loading');
const resultsContainer = document.getElementById('results-container');
const videoContainer = document.getElementById('video-container');
const summaryText = document.getElementById('summary-text');

// Event Listeners
form.addEventListener('submit', handleSubmit);

// Functions
async function handleSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const videoURL = videoUrlInput.value.trim();
    const customPrompt = customPromptInput.value.trim();
    
    // Validate URL (basic validation)
    if (!isValidYouTubeUrl(videoURL)) {
        showError('Please enter a valid YouTube URL');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Call API to summarize video
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                videoURL,
                prompt: customPrompt || undefined
            })
        });
        
        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to summarize video');
        }
        
        // Parse response data
        const data = await response.json();
        
        // Display results
        displayResults(data);
    } catch (error) {
        showError(error.message || 'An error occurred while summarizing the video');
    }
}

function isValidYouTubeUrl(url) {
    // Basic validation for YouTube URLs
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
    return youtubeRegex.test(url);
}

function showLoading() {
    // Show results section and loading spinner
    resultsSection.style.display = 'block';
    loadingElement.style.display = 'block';
    resultsContainer.style.display = 'none';
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Scroll to results section
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function displayResults(data) {
    // Hide loading spinner
    loadingElement.style.display = 'none';
    
    // Show results container
    resultsContainer.style.display = 'block';
    
    // Display video thumbnail
    videoContainer.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${data.videoId}" target="_blank" rel="noopener noreferrer">
            <img src="${data.thumbnailUrl}" alt="Video Thumbnail" />
            <div class="play-button">
                <i class="fas fa-play"></i>
            </div>
        </a>
    `;
    
    // Display summary text
    summaryText.innerHTML = formatSummary(data.summary);
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Summary';
}

function formatSummary(text) {
    // Convert plain text to HTML with paragraphs
    return text
        .split('\n\n')
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('');
}

function showError(message) {
    // Create error alert
    const errorAlert = document.createElement('div');
    errorAlert.className = 'error-alert';
    errorAlert.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button class="close-btn"><i class="fas fa-times"></i></button>
    `;
    
    // Add error alert to the page
    document.querySelector('.input-section').appendChild(errorAlert);
    
    // Add event listener to close button
    errorAlert.querySelector('.close-btn').addEventListener('click', () => {
        errorAlert.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorAlert.parentNode) {
            errorAlert.remove();
        }
    }, 5000);
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Summary';
}

// Add CSS for error alerts and play button
const style = document.createElement('style');
style.textContent = `
    .error-alert {
        background-color: #f8d7da;
        color: #721c24;
        padding: 12px 16px;
        border-radius: var(--border-radius);
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        animation: slideIn 0.3s ease;
    }
    
    .error-alert i {
        margin-right: 10px;
        font-size: 1.2rem;
    }
    
    .error-alert .close-btn {
        margin-left: auto;
        background: none;
        border: none;
        color: #721c24;
        cursor: pointer;
        padding: 0;
    }
    
    .play-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .video-container {
        position: relative;
    }
    
    .video-container a:hover .play-button {
        opacity: 1;
    }
    
    @keyframes slideIn {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);