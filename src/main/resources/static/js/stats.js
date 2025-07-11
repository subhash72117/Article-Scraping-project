// Statistics page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    
    // Auto-refresh stats every 60 seconds
    setInterval(loadStatistics, 60000);
});

async function loadStatistics() {
    try {
        await Promise.all([
            loadOverviewStats(),
            loadDetailedStats(),
            loadSystemInfo()
        ]);
    } catch (error) {
        console.error('Error loading statistics:', error);
        showStatus('Error loading statistics', 'error');
    }
}

async function loadOverviewStats() {
    try {
        // Get total articles count
        const countResponse = await apiRequest('/count');
        const totalArticles = await countResponse.json();
        
        // Update total articles
        const totalArticlesElement = document.getElementById('totalArticles');
        if (totalArticlesElement) {
            totalArticlesElement.textContent = totalArticles;
        }
        
        // Calculate pages scraped (assuming ~20 articles per page)
        const pagesScraped = Math.ceil(totalArticles / 20);
        const pagesScrapedElement = document.getElementById('pagesScraped');
        if (pagesScrapedElement) {
            pagesScrapedElement.textContent = pagesScraped;
        }
        
        // Calculate average articles per page
        const avgPerPage = totalArticles > 0 ? Math.round(totalArticles / pagesScraped) : 0;
        const avgPerPageElement = document.getElementById('avgPerPage');
        if (avgPerPageElement) {
            avgPerPageElement.textContent = avgPerPage;
        }
        
        // Get last scraped time from storage
        const lastScraped = storage.get('lastScraped', '-');
        const lastScrapedElement = document.getElementById('lastScraped');
        if (lastScrapedElement) {
            lastScrapedElement.textContent = lastScraped;
        }
        
    } catch (error) {
        console.error('Error loading overview stats:', error);
    }
}

async function loadDetailedStats() {
    try {
        // Get all articles for detailed analysis
        const response = await apiRequest('');
        const articles = await response.json();
        
        // Calculate distribution statistics
        const withDescription = articles.filter(article => 
            article.description && article.description.trim() !== ''
        ).length;
        
        const withAuthors = articles.filter(article => 
            article.authors && article.authors.trim() !== ''
        ).length;
        
        const withLinks = articles.filter(article => 
            article.link && article.link.trim() !== ''
        ).length;
        
        // Update distribution stats
        const withDescriptionElement = document.getElementById('withDescription');
        if (withDescriptionElement) {
            withDescriptionElement.textContent = withDescription;
        }
        
        const withAuthorsElement = document.getElementById('withAuthors');
        if (withAuthorsElement) {
            withAuthorsElement.textContent = withAuthors;
        }
        
        const withLinksElement = document.getElementById('withLinks');
        if (withLinksElement) {
            withLinksElement.textContent = withLinks;
        }
        
        // Create activity chart
        createActivityChart(articles);
        
    } catch (error) {
        console.error('Error loading detailed stats:', error);
    }
}

function createActivityChart(articles) {
    const activityChart = document.getElementById('activityChart');
    if (!activityChart) return;
    
    if (articles.length === 0) {
        activityChart.innerHTML = `
            <div class="chart-placeholder">
                <p>No articles found. Start scraping to see activity data!</p>
            </div>
        `;
        return;
    }
    
    // Group articles by date
    const articlesByDate = {};
    articles.forEach(article => {
        const date = new Date(article.createdAt).toLocaleDateString();
        articlesByDate[date] = (articlesByDate[date] || 0) + 1;
    });
    
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString());
    }
    
    // Create chart HTML
    const chartHTML = `
        <div class="activity-chart-container">
            <div class="chart-bars">
                ${last7Days.map(date => {
                    const count = articlesByDate[date] || 0;
                    const height = count > 0 ? Math.max(20, (count / Math.max(...Object.values(articlesByDate))) * 100) : 20;
                    return `
                        <div class="chart-bar">
                            <div class="bar-fill" style="height: ${height}%"></div>
                            <div class="bar-label">${count}</div>
                            <div class="bar-date">${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    activityChart.innerHTML = chartHTML;
}

async function loadSystemInfo() {
    try {
        // Check database status
        const countResponse = await apiRequest('/count');
        const dbStatusElement = document.getElementById('dbStatus');
        if (dbStatusElement) {
            if (countResponse.ok) {
                dbStatusElement.textContent = 'Connected';
                dbStatusElement.className = 'info-value status-ok';
            } else {
                dbStatusElement.textContent = 'Error';
                dbStatusElement.className = 'info-value status-error';
            }
        }
        
        // Check API status
        const apiStatusElement = document.getElementById('apiStatus');
        if (apiStatusElement) {
            apiStatusElement.textContent = 'Online';
            apiStatusElement.className = 'info-value status-ok';
        }
        
        // Update last database update
        const lastDbUpdateElement = document.getElementById('lastDbUpdate');
        if (lastDbUpdateElement) {
            lastDbUpdateElement.textContent = new Date().toLocaleString();
        }
        
        // Calculate uptime (simplified)
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            const startTime = storage.get('appStartTime', Date.now());
            const uptime = Date.now() - startTime;
            const hours = Math.floor(uptime / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            uptimeElement.textContent = `${hours}h ${minutes}m`;
        }
        
    } catch (error) {
        console.error('Error loading system info:', error);
        
        const dbStatusElement = document.getElementById('dbStatus');
        if (dbStatusElement) {
            dbStatusElement.textContent = 'Error';
            dbStatusElement.className = 'info-value status-error';
        }
        
        const apiStatusElement = document.getElementById('apiStatus');
        if (apiStatusElement) {
            apiStatusElement.textContent = 'Offline';
            apiStatusElement.className = 'info-value status-error';
        }
    }
}

async function refreshStats() {
    showLoading(true);
    try {
        await loadStatistics();
        showStatus('Statistics refreshed successfully!', 'success');
    } catch (error) {
        showStatus('Error refreshing statistics: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function getDebugInfo() {
    try {
        const response = await apiRequest('/debug');
        const debugInfo = await response.text();
        
        // Display in status area with better formatting
        const status = document.getElementById('status');
        status.innerHTML = debugInfo.replace(/\n/g, '<br>');
        status.className = 'status info';
        status.style.display = 'block';
        status.style.textAlign = 'left';
        status.style.whiteSpace = 'pre-line';
        status.style.fontFamily = 'monospace';
        status.style.fontSize = '12px';
        status.style.maxHeight = '400px';
        status.style.overflow = 'auto';
        
        // Auto-hide after 15 seconds
        setTimeout(() => {
            status.style.display = 'none';
        }, 15000);
        
    } catch (error) {
        showStatus('Error getting debug info: ' + error.message, 'error');
    }
}

function exportStats() {
    try {
        // Get current statistics
        const stats = {
            totalArticles: document.getElementById('totalArticles')?.textContent || 0,
            pagesScraped: document.getElementById('pagesScraped')?.textContent || 0,
            lastScraped: document.getElementById('lastScraped')?.textContent || '-',
            avgPerPage: document.getElementById('avgPerPage')?.textContent || 0,
            withDescription: document.getElementById('withDescription')?.textContent || 0,
            withAuthors: document.getElementById('withAuthors')?.textContent || 0,
            withLinks: document.getElementById('withLinks')?.textContent || 0,
            exportDate: new Date().toLocaleString()
        };
        
        // Create and download JSON file
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `news-scraper-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showStatus('Statistics exported successfully!', 'success');
        
    } catch (error) {
        showStatus('Error exporting statistics: ' + error.message, 'error');
    }
}

// Initialize app start time
if (!storage.get('appStartTime')) {
    storage.set('appStartTime', Date.now());
}

// Add CSS for stats page
const statsStyles = `
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
        
        .stats-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stats-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .stats-section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .stats-section h3 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .activity-chart {
            min-height: 200px;
        }
        
        .chart-placeholder {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .activity-chart-container {
            height: 200px;
        }
        
        .chart-bars {
            display: flex;
            justify-content: space-around;
            align-items: end;
            height: 100%;
            gap: 10px;
        }
        
        .chart-bar {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            height: 100%;
        }
        
        .bar-fill {
            background: linear-gradient(to top, #007bff, #0056b3);
            width: 30px;
            border-radius: 3px 3px 0 0;
            transition: height 0.3s ease;
        }
        
        .bar-label {
            margin-top: 5px;
            font-size: 12px;
            font-weight: bold;
            color: #333;
        }
        
        .bar-date {
            margin-top: 2px;
            font-size: 10px;
            color: #666;
        }
        
        .distribution-stats {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .distribution-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .distribution-item .label {
            color: #333;
            font-weight: 500;
        }
        
        .distribution-item .value {
            color: #007bff;
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .system-info {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 40px;
        }
        
        .system-info h3 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .info-label {
            color: #333;
            font-weight: 500;
        }
        
        .info-value {
            font-weight: bold;
        }
        
        .status-ok {
            color: #28a745;
        }
        
        .status-error {
            color: #dc3545;
        }
        
        .stats-actions {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
            .stats-details {
                grid-template-columns: 1fr;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .chart-bars {
                gap: 5px;
            }
            
            .bar-fill {
                width: 20px;
            }
            
            .page-header h1 {
                font-size: 2rem;
            }
            
            .stats-actions {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
`;

// Inject the styles
document.head.insertAdjacentHTML('beforeend', statsStyles); 