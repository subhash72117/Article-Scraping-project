// Articles page functionality
let allArticles = [];
let filteredArticles = [];
let currentPage = 1;
const articlesPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
});

async function loadArticles() {
    showLoading(true);
    try {
        const response = await apiRequest('');
        allArticles = await response.json();
        
        console.log('Loaded articles:', allArticles);
        
        filteredArticles = [...allArticles];
        currentPage = 1;
        
        updateArticleCount();
        displayArticles();
        updateLastUpdated();
        
    } catch (error) {
        console.error('Error loading articles:', error);
        showStatus('Error loading articles: ' + error.message, 'error');
        displayError();
    } finally {
        showLoading(false);
    }
}

function displayArticles() {
    const articlesDiv = document.getElementById('articles');
    if (!articlesDiv) return;
    
    if (filteredArticles.length === 0) {
        articlesDiv.innerHTML = `
            <div class="no-articles">
                <p>No articles found. Try scraping some articles first!</p>
                <button class="btn btn-primary" onclick="window.location.href='scrape.html'">
                    Start Scraping
                </button>
            </div>
        `;
        updatePagination();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const pageArticles = filteredArticles.slice(startIndex, endIndex);
    
    articlesDiv.innerHTML = pageArticles.map(article => {
        console.log('Processing article:', article);
        
        const description = article.description && article.description.trim() !== '' ? 
            `<p class="description">${article.description}</p>` : '';
        
        const authors = article.authors && article.authors.trim() !== '' ? 
            `<div class="meta"><strong>Authors:</strong> ${article.authors}</div>` : '';
        
        const createdAt = formatDate(article.createdAt);
        
        return `
            <div class="article">
                <div class="article-header">
                    <h3>
                        <a href="${article.link || '#'}" target="_blank" title="${article.title || 'No Title'}">
                            ${article.title || 'No Title'}
                        </a>
                    </h3>
                    <div class="article-actions">
                        <button class="btn btn-sm btn-outline" onclick="copyToClipboard('${article.link || ''}')" title="Copy link">
                            📋
                        </button>
                    </div>
                </div>
                ${description}
                ${authors}
                <div class="article-footer">
                    <div class="meta"><strong>Added:</strong> ${createdAt}</div>
                    <div class="meta"><strong>ID:</strong> ${article.id}</div>
                </div>
            </div>
        `;
    }).join('');
    
    updatePagination();
}

function displayError() {
    const articlesDiv = document.getElementById('articles');
    if (articlesDiv) {
        articlesDiv.innerHTML = `
            <div class="error-message">
                <p>Error loading articles. Please try again later.</p>
                <button class="btn btn-primary" onclick="loadArticles()">
                    Retry
                </button>
            </div>
        `;
    }
}

function updateArticleCount() {
    const articleCount = document.getElementById('articleCount');
    const showingCount = document.getElementById('showingCount');
    
    if (articleCount) {
        articleCount.textContent = allArticles.length;
    }
    
    if (showingCount) {
        const startIndex = (currentPage - 1) * articlesPerPage;
        const endIndex = Math.min(startIndex + articlesPerPage, filteredArticles.length);
        showingCount.textContent = `${startIndex + 1}-${endIndex} of ${filteredArticles.length}`;
    }
}

function updateLastUpdated() {
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        lastUpdated.textContent = new Date().toLocaleString();
    }
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!pagination || !pageInfo || !prevBtn || !nextBtn) return;
    
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayArticles();
        updateArticleCount();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayArticles();
        updateArticleCount();
    }
}

function filterArticles() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        filteredArticles = [...allArticles];
    } else {
        filteredArticles = allArticles.filter(article => {
            const title = (article.title || '').toLowerCase();
            const description = (article.description || '').toLowerCase();
            const authors = (article.authors || '').toLowerCase();
            
            return title.includes(searchTerm) || 
                   description.includes(searchTerm) || 
                   authors.includes(searchTerm);
        });
    }
    
    currentPage = 1;
    displayArticles();
    updateArticleCount();
}

function sortArticles() {
    const sortBy = document.getElementById('sortSelect').value;
    
    filteredArticles.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            case 'oldest':
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            case 'title':
                return (a.title || '').localeCompare(b.title || '');
            case 'title-desc':
                return (b.title || '').localeCompare(a.title || '');
            default:
                return 0;
        }
    });
    
    currentPage = 1;
    displayArticles();
    updateArticleCount();
}

async function getCount() {
    try {
        const response = await apiRequest('/count');
        const count = await response.json();
        showStatus(`Total articles in database: ${count}`, 'info');
    } catch (error) {
        showStatus('Error getting count: ' + error.message, 'error');
    }
}

async function deleteAll() {
    if (!confirm('Are you sure you want to delete all articles? This action cannot be undone.')) {
        return;
    }
    
    showLoading(true);
    try {
        const response = await apiRequest('', { method: 'DELETE' });
        const result = await response.text();
        
        if (response.ok) {
            showStatus(result, 'success');
            allArticles = [];
            filteredArticles = [];
            currentPage = 1;
            displayArticles();
            updateArticleCount();
        } else {
            showStatus(result, 'error');
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showStatus('Link copied to clipboard!', 'success');
        }).catch(() => {
            showStatus('Failed to copy link', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showStatus('Link copied to clipboard!', 'success');
        } catch (err) {
            showStatus('Failed to copy link', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Add CSS for articles page
const articlesStyles = `
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
        
        .articles-controls {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .controls-left, .controls-right {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .search-box input {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            min-width: 200px;
        }
        
        .articles-stats {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-label {
            display: block;
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .stat-value {
            display: block;
            color: #007bff;
            font-size: 18px;
            font-weight: bold;
        }
        
        .articles-list {
            margin-bottom: 30px;
        }
        
        .article {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #007bff;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .article:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        
        .article-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .article-header h3 {
            margin: 0;
            color: #333;
            flex: 1;
        }
        
        .article-header h3 a {
            color: #007bff;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .article-header h3 a:hover {
            color: #0056b3;
            text-decoration: underline;
        }
        
        .article-actions {
            display: flex;
            gap: 5px;
        }
        
        .btn-sm {
            padding: 5px 10px;
            font-size: 12px;
        }
        
        .description {
            color: #333;
            font-size: 16px;
            line-height: 1.6;
            margin: 15px 0;
            padding: 15px;
            background: #f8f9fa;
            border-left: 3px solid #007bff;
            border-radius: 4px;
        }
        
        .article-footer {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .meta {
            color: #666;
            font-size: 14px;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-top: 30px;
        }
        
        .page-info {
            color: #666;
            font-weight: 500;
        }
        
        .no-articles {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .no-articles p {
            margin-bottom: 20px;
            font-size: 1.1rem;
        }
        
        .loading-placeholder {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .error-message {
            text-align: center;
            padding: 40px;
            color: #dc3545;
            background: #f8d7da;
            border-radius: 10px;
            border: 1px solid #f5c6cb;
        }
        
        .error-message p {
            margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
            .articles-controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .controls-left, .controls-right {
                justify-content: center;
            }
            
            .search-box input {
                min-width: auto;
                width: 100%;
            }
            
            .articles-stats {
                flex-direction: column;
                text-align: center;
            }
            
            .article-header {
                flex-direction: column;
                gap: 10px;
            }
            
            .article-footer {
                flex-direction: column;
            }
            
            .pagination {
                flex-direction: column;
                gap: 10px;
            }
            
            .page-header h1 {
                font-size: 2rem;
            }
        }
    </style>
`;

// Inject the styles
document.head.insertAdjacentHTML('beforeend', articlesStyles); 