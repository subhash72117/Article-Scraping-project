package com.web.scrape.scraping_data.ServiceLogic;

import com.web.scrape.scraping_data.Model.NewsArticle;
import com.web.scrape.scraping_data.Repository.NewsArticleRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class NewsScraperService {

    private static final Logger logger = LoggerFactory.getLogger(NewsScraperService.class);
    private static final String BASE_URL = "https://www.nature.com/nature/articles";
    private static final int MAX_PAGES = 10; // Limit to prevent excessive requests

    @Autowired
    private NewsArticleRepository repository;

    public List<NewsArticle> fetchAndSaveArticles() {
        return fetchAndSaveArticles(1); // Default to first page only
    }

    public List<NewsArticle> fetchAndSaveAllPages() {
        List<NewsArticle> allSavedArticles = new ArrayList<>();
        
        for (int page = 1; page <= MAX_PAGES; page++) {
            try {
                logger.info("Scraping page {} of {}", page, MAX_PAGES);
                List<NewsArticle> pageArticles = fetchAndSaveArticles(page);
                
                if (pageArticles.isEmpty()) {
                    logger.info("No more articles found on page {}. Stopping pagination.", page);
                    break;
                }
                
                allSavedArticles.addAll(pageArticles);
                
                // Add a small delay between requests to be respectful
                Thread.sleep(2000);
                
            } catch (Exception e) {
                logger.error("Error scraping page {}: {}", page, e.getMessage());
                break;
            }
        }
        
        logger.info("Completed scraping all pages. Total articles saved: {}", allSavedArticles.size());
        return allSavedArticles;
    }

    public List<NewsArticle> fetchAndSaveArticles(int pageNumber) {
        List<NewsArticle> savedArticles = new ArrayList<>();
        
        try {
            String url = pageNumber == 1 ? 
                BASE_URL + "?type=article" : 
                BASE_URL + "?type=article&page=" + pageNumber;
                
            logger.info("Starting to scrape articles from page {}: {}", pageNumber, url);
            
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .timeout(15000)
                    .get();

            Elements articles = doc.select("li.app-article-list-row__item");

            logger.info("Found {} articles on page {}", articles.size(), pageNumber);

            for (Element article : articles) {
                try {
                    Element titleElement = article.selectFirst("a.c-card__link");
                    if (titleElement == null) {
                        logger.warn("Skipping article - no title element found");
                        continue;
                    }

                    String title = titleElement.text().trim();
                    String link = "https://www.nature.com" + titleElement.attr("href");
                    
                    // Try multiple selectors for authors
                    String authors = "";
                    Element authorsElement = article.selectFirst("ul.c-author-list");
                    if (authorsElement == null) {
                        authorsElement = article.selectFirst(".c-author-list");
                    }
                    if (authorsElement == null) {
                        authorsElement = article.selectFirst("[data-testid='author-list']");
                    }
                    if (authorsElement == null) {
                        authorsElement = article.selectFirst(".c-meta__item.c-meta__item--authors");
                    }
                    if (authorsElement == null) {
                        authorsElement = article.selectFirst(".c-meta__authors");
                    }
                    if (authorsElement == null) {
                        authorsElement = article.selectFirst("span[data-testid='author']");
                    }
                    if (authorsElement == null) {
                        authorsElement = article.selectFirst(".author");
                    }
                    if (authorsElement != null) {
                        authors = authorsElement.text().trim();
                    }
                    
                    // Try multiple selectors for description
                    String description = "";
                    Element descriptionElement = article.selectFirst("p.c-card__summary");
                    if (descriptionElement == null) {
                        descriptionElement = article.selectFirst(".c-card__summary");
                    }
                    if (descriptionElement == null) {
                        descriptionElement = article.selectFirst("[data-testid='article-summary']");
                    }
                    if (descriptionElement == null) {
                        descriptionElement = article.selectFirst(".article-summary");
                    }
                    if (descriptionElement == null) {
                        descriptionElement = article.selectFirst(".c-meta__item.c-meta__item--summary");
                    }
                    if (descriptionElement == null) {
                        descriptionElement = article.selectFirst(".c-meta__summary");
                    }
                    if (descriptionElement == null) {
                        descriptionElement = article.selectFirst("p[data-testid='summary']");
                    }
                    if (descriptionElement == null) {
                        descriptionElement = article.selectFirst(".summary");
                    }
                    if (descriptionElement == null) {
                        descriptionElement = article.selectFirst("p");
                    }
                    if (descriptionElement != null) {
                        description = descriptionElement.text().trim();
                    }

                    // Log the extracted data for debugging
                    logger.info("Extracted article - Title: '{}', Authors: '{}', Description: '{}'", 
                              title, authors, description);
                    
                    // Additional detailed logging for debugging
                    if (authors.isEmpty()) {
                        logger.warn("No authors found for article: {}", title);
                    }
                    if (description.isEmpty()) {
                        logger.warn("No description found for article: {}", title);
                    }

                    // Check if article already exists
                    if (repository.findByTitle(title).isEmpty()) {
                        NewsArticle news = new NewsArticle(title, link, description, authors);
                        NewsArticle saved = repository.save(news);
                        savedArticles.add(saved);
                        logger.info("Saved article: {}", title);
                    } else {
                        logger.info("Article already exists: {}", title);
                    }

                } catch (Exception e) {
                    logger.error("Error processing individual article: {}", e.getMessage());
                }
            }

            logger.info("Page {} scraping completed. Saved {} new articles", pageNumber, savedArticles.size());

        } catch (IOException e) {
            logger.error("Error connecting to Nature.com page {}: {}", pageNumber, e.getMessage());
            throw new RuntimeException("Failed to scrape articles from page " + pageNumber, e);
        } catch (Exception e) {
            logger.error("Unexpected error during scraping page {}: {}", pageNumber, e.getMessage());
            throw new RuntimeException("Unexpected error during scraping page " + pageNumber, e);
        }
        
        return savedArticles;
    }

    public List<NewsArticle> getAllArticles() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public void deleteAllArticles() {
        repository.deleteAll();
        logger.info("All articles deleted from database");
    }

    public long getTotalArticleCount() {
        return repository.count();
    }

    public List<NewsArticle> getArticlesByPage(int page, int size) {
        // This would require implementing pagination in the repository
        // For now, return all articles
        return repository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<NewsArticle> getRecentArticles(int limit) {
        List<NewsArticle> allArticles = repository.findAllByOrderByCreatedAtDesc();
        if (allArticles.size() <= limit) {
            return allArticles;
        }
        return allArticles.subList(0, limit);
    }
}
