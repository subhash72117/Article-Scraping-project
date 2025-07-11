// Dashboard specific functionality
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    
    // Auto-refresh dashboard data every 30 seconds
    setInterval(loadDashboardData, 30000);
});

async function loadDashboardData() {
    try {
        await Promise.all([
            loadStats(),
            loadRecentArticles()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showStatus('Error loading dashboard data', 'error');
    }
}

async function loadStats() {
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
        
        // Get last scraped time from storage or set default
        const lastScraped = storage.get('lastScraped', '-');
        const lastScrapedElement = document.getElementById('lastScraped');
        if (lastScrapedElement) {
            lastScrapedElement.textContent = lastScraped;
        }
        
        // Update system status
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = totalArticles > 0 ? 'Active' : 'Ready';
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showStatus('Error loading statistics', 'error');
    }
}

async function loadRecentArticles() {
    try {
        const response = await apiRequest('');
        const articles = await response.json();
        

        
        const recentArticlesList = document.getElementById('recentArticlesList');
        if (!recentArticlesList) return;
        
        if (articles.length === 0) {
            recentArticlesList.innerHTML = `
                <div class="no-articles">
                    <p>No articles found. Start scraping to see articles here!</p>
                    <button class="btn btn-primary" onclick="window.location.href='scrape.html'">
                        Start Scraping
                    </button>
                </div>
            `;
            return;
        }
        
        // Show only the 5 most recent articles
        const recentArticles = articles.slice(0, 5);
        
        recentArticlesList.innerHTML = recentArticles.map(article => {
            // Handle description - check multiple possible fields
            let description = 'No description available';
            if (article.description && article.description.trim() !== '') {
                description = truncateText(article.description, 100);
            } else if (article.summary && article.summary.trim() !== '') {
                description = truncateText(article.summary, 100);
            } else if (article.content && article.content.trim() !== '') {
                description = truncateText(article.content, 100);
            }
            
            // Handle authors - check multiple possible fields
            let authors = 'Unknown';
            if (article.authors && article.authors.trim() !== '') {
                authors = article.authors;
            } else if (article.author && article.author.trim() !== '') {
                authors = article.author;
            } else if (article.writer && article.writer.trim() !== '') {
                authors = article.writer;
            }
            
            const createdAt = formatDate(article.createdAt);
            
            return `
                <div class="article-preview">
                    <h4>
                        <a href="${article.link || '#'}" target="_blank" title="${article.title || 'No Title'}">
                            ${truncateText(article.title || 'No Title', 60)}
                        </a>
                    </h4>
                    <p class="article-description">${description}</p>
                    <div class="article-meta">
                        <span class="authors">👥 ${authors}</span>
                        <span class="date">📅 ${createdAt}</span>
                    </div>

                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading recent articles:', error);
        const recentArticlesList = document.getElementById('recentArticlesList');
        if (recentArticlesList) {
            recentArticlesList.innerHTML = `
                <div class="error-message">
                    <p>Error loading recent articles. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Add some CSS for the dashboard-specific elements
const dashboardStyles = `
    <style>
        .no-articles {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .no-articles p {
            margin-bottom: 20px;
            font-size: 1.1rem;
        }
        
        .article-preview {
            background: #f8f9fa;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .article-preview:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .article-preview h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .article-preview h4 a {
            color: #007bff;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .article-preview h4 a:hover {
            color: #0056b3;
            text-decoration: underline;
        }
        
        .article-description {
            color: #555;
            font-size: 14px;
            line-height: 1.6;
            margin: 12px 0;
            padding: 8px 12px;
            background: #ffffff;
            border-left: 3px solid #007bff;
            border-radius: 4px;
            font-style: italic;
        }
        
        .article-meta {
            display: flex;
            gap: 20px;
            font-size: 13px;
            color: #666;
            margin-top: 12px;
            padding: 8px 0;
            border-top: 1px solid #e9ecef;
        }
        
        .article-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .error-message {
            text-align: center;
            padding: 20px;
            color: #dc3545;
            background: #f8d7da;
            border-radius: 5px;
            border: 1px solid #f5c6cb;
        }
        
        @media (max-width: 768px) {
            .article-meta {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
`;

// Inject the styles
document.head.insertAdjacentHTML('beforeend', dashboardStyles); 