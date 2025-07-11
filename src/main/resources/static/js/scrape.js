// Scraping page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadActivityLog();
});

// Scraping functions
async function scrapeArticles() {
    showLoading(true);
    updateProgress(0, 'Starting to scrape page 1...');
    
    try {
        const response = await apiRequest('/scrape', { method: 'POST' });
        const result = await response.text();
        
        if (response.ok) {
            showStatus(result, 'success');
            updateProgress(100, 'Scraping completed successfully!');
            addActivityLog('Scraped page 1', 'success');
            storage.set('lastScraped', new Date().toLocaleString());
        } else {
            showStatus(result, 'error');
            updateProgress(0, 'Scraping failed');
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
        updateProgress(0, 'Scraping failed');
    } finally {
        showLoading(false);
        setTimeout(() => hideProgress(), 3000);
    }
}

async function scrapeAllPages() {
    if (!confirm('This will scrape up to 10 pages from Nature.com. This may take several minutes. Continue?')) {
        return;
    }
    
    showLoading(true);
    updateProgress(0, 'Starting to scrape all pages...');
    showProgress();
    
    try {
        const response = await apiRequest('/scrape/all', { method: 'POST' });
        const result = await response.text();
        
        if (response.ok) {
            showStatus(result, 'success');
            updateProgress(100, 'All pages scraped successfully!');
            addActivityLog('Scraped all pages', 'success');
            storage.set('lastScraped', new Date().toLocaleString());
        } else {
            showStatus(result, 'error');
            updateProgress(0, 'Scraping failed');
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
        updateProgress(0, 'Scraping failed');
    } finally {
        showLoading(false);
        setTimeout(() => hideProgress(), 3000);
    }
}

async function scrapeSpecificPage() {
    const pageNumber = document.getElementById('pageNumber').value;
    if (!pageNumber || pageNumber < 1 || pageNumber > 10) {
        showStatus('Please enter a valid page number (1-10)', 'error');
        return;
    }
    
    showLoading(true);
    updateProgress(0, `Starting to scrape page ${pageNumber}...`);
    showProgress();
    
    try {
        const response = await apiRequest(`/scrape/page/${pageNumber}`, { method: 'POST' });
        const result = await response.text();
        
        if (response.ok) {
            showStatus(result, 'success');
            updateProgress(100, `Page ${pageNumber} scraped successfully!`);
            addActivityLog(`Scraped page ${pageNumber}`, 'success');
            storage.set('lastScraped', new Date().toLocaleString());
        } else {
            showStatus(result, 'error');
            updateProgress(0, 'Scraping failed');
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
        updateProgress(0, 'Scraping failed');
    } finally {
        showLoading(false);
        setTimeout(() => hideProgress(), 3000);
    }
}

async function scrapePageRange() {
    const startPage = parseInt(document.getElementById('startPage').value);
    const endPage = parseInt(document.getElementById('endPage').value);
    
    if (!startPage || !endPage || startPage < 1 || endPage > 10 || startPage > endPage) {
        showStatus('Please enter valid page numbers (1-10, start ≤ end)', 'error');
        return;
    }
    
    if (!confirm(`This will scrape pages ${startPage} to ${endPage}. Continue?`)) {
        return;
    }
    
    showLoading(true);
    showProgress();
    
    const totalPages = endPage - startPage + 1;
    let completedPages = 0;
    
    try {
        for (let page = startPage; page <= endPage; page++) {
            updateProgress(
                (completedPages / totalPages) * 100,
                `Scraping page ${page} of ${endPage}...`
            );
            
            const response = await apiRequest(`/scrape/page/${page}`, { method: 'POST' });
            
            if (response.ok) {
                completedPages++;
                updateProgress(
                    (completedPages / totalPages) * 100,
                    `Completed page ${page} of ${endPage}`
                );
            } else {
                showStatus(`Failed to scrape page ${page}`, 'error');
                break;
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (completedPages === totalPages) {
            showStatus(`Successfully scraped pages ${startPage} to ${endPage}`, 'success');
            updateProgress(100, 'Range scraping completed!');
            addActivityLog(`Scraped pages ${startPage}-${endPage}`, 'success');
            storage.set('lastScraped', new Date().toLocaleString());
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
        updateProgress(0, 'Scraping failed');
    } finally {
        showLoading(false);
        setTimeout(() => hideProgress(), 3000);
    }
}

async function scrapeLatest() {
    showLoading(true);
    updateProgress(0, 'Scraping latest articles...');
    showProgress();
    
    try {
        const response = await apiRequest('/scrape', { method: 'POST' });
        const result = await response.text();
        
        if (response.ok) {
            showStatus('Latest articles scraped successfully!', 'success');
            updateProgress(100, 'Latest scraping completed!');
            addActivityLog('Scraped latest articles', 'success');
            storage.set('lastScraped', new Date().toLocaleString());
        } else {
            showStatus(result, 'error');
            updateProgress(0, 'Scraping failed');
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
        updateProgress(0, 'Scraping failed');
    } finally {
        showLoading(false);
        setTimeout(() => hideProgress(), 3000);
    }
}

// Progress bar functions
function showProgress() {
    const progress = document.getElementById('scrapingProgress');
    if (progress) {
        progress.style.display = 'block';
    }
}

function hideProgress() {
    const progress = document.getElementById('scrapingProgress');
    if (progress) {
        progress.style.display = 'none';
    }
}

function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = text;
    }
}

// Activity log functions
function addActivityLog(message, type = 'info') {
    const activities = storage.get('activities', []);
    const activity = {
        message,
        type,
        timestamp: new Date().toLocaleString()
    };
    
    activities.unshift(activity);
    
    // Keep only last 20 activities
    if (activities.length > 20) {
        activities.splice(20);
    }
    
    storage.set('activities', activities);
    loadActivityLog();
}

function loadActivityLog() {
    const activities = storage.get('activities', []);
    const activityLog = document.getElementById('activityLog');
    
    if (!activityLog) return;
    
    if (activities.length === 0) {
        activityLog.innerHTML = '<p class="no-activity">No recent activity. Start scraping to see activity here!</p>';
        return;
    }
    
    activityLog.innerHTML = activities.map(activity => `
        <div class="activity-item ${activity.type}">
            <div class="activity-content">
                <span class="activity-message">${activity.message}</span>
                <span class="activity-time">${activity.timestamp}</span>
            </div>
        </div>
    `).join('');
}

// Add CSS for scraping page
const scrapeStyles = `
    <style>
        .page-header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .page-header h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5rem;
        }
        
        .page-header p {
            color: #666;
            font-size: 1.1rem;
        }
        
        .scraping-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .option-card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .option-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        
        .option-header {
            margin-bottom: 20px;
            text-align: center;
        }
        
        .option-header h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .option-header p {
            color: #666;
        }
        
        .option-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .form-group label {
            font-weight: 500;
            color: #333;
        }
        
        .scraping-progress {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 40px;
        }
        
        .scraping-progress h3 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #007bff, #0056b3);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            text-align: center;
            color: #666;
            font-weight: 500;
            margin-bottom: 10px;
        }
        
        .progress-details {
            text-align: center;
            color: #888;
            font-size: 14px;
        }
        
        .recent-activity {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .recent-activity h3 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .activity-log {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .activity-item {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
            background: #f8f9fa;
        }
        
        .activity-item.success {
            border-left-color: #28a745;
            background: #d4edda;
        }
        
        .activity-item.error {
            border-left-color: #dc3545;
            background: #f8d7da;
        }
        
        .activity-item.warning {
            border-left-color: #ffc107;
            background: #fff3cd;
        }
        
        .activity-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .activity-message {
            font-weight: 500;
            color: #333;
        }
        
        .activity-time {
            font-size: 12px;
            color: #666;
        }
        
        .no-activity {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 40px 20px;
        }
        
        @media (max-width: 768px) {
            .scraping-options {
                grid-template-columns: 1fr;
            }
            
            .activity-content {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .page-header h1 {
                font-size: 2rem;
            }
        }
    </style>
`;

// Inject the styles
document.head.insertAdjacentHTML('beforeend', scrapeStyles); 