package com.web.scrape.scraping_data.Controller;

import com.web.scrape.scraping_data.Model.NewsArticle;
import com.web.scrape.scraping_data.Repository.NewsArticleRepository;
import com.web.scrape.scraping_data.ServiceLogic.NewsScraperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsArticleRepository repository;

    @Autowired
    private NewsScraperService scraperService;

    @GetMapping
    public ResponseEntity<List<NewsArticle>> getAllNews() {
        try {
            List<NewsArticle> articles = scraperService.getAllArticles();
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/page/{pageNumber}")
    public ResponseEntity<List<NewsArticle>> getArticlesByPage(@PathVariable int pageNumber) {
        try {
            List<NewsArticle> articles = scraperService.getArticlesByPage(pageNumber, 20);
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<NewsArticle>> getRecentArticles() {
        try {
            List<NewsArticle> articles = scraperService.getRecentArticles(5);
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/scrape")
    public ResponseEntity<String> scrapeManually() {
        try {
            List<NewsArticle> savedArticles = scraperService.fetchAndSaveArticles();
            return ResponseEntity.ok("Scraping completed! Saved " + savedArticles.size() + " new articles from page 1.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error during scraping: " + e.getMessage());
        }
    }

    @PostMapping("/scrape/all")
    public ResponseEntity<String> scrapeAllPages() {
        try {
            List<NewsArticle> savedArticles = scraperService.fetchAndSaveAllPages();
            return ResponseEntity.ok("All pages scraping completed! Saved " + savedArticles.size() + " new articles from multiple pages.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error during all pages scraping: " + e.getMessage());
        }
    }

    @PostMapping("/scrape/page/{pageNumber}")
    public ResponseEntity<String> scrapeSpecificPage(@PathVariable int pageNumber) {
        try {
            List<NewsArticle> savedArticles = scraperService.fetchAndSaveArticles(pageNumber);
            return ResponseEntity.ok("Page " + pageNumber + " scraping completed! Saved " + savedArticles.size() + " new articles.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error during page " + pageNumber + " scraping: " + e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<String> deleteAllArticles() {
        try {
            scraperService.deleteAllArticles();
            return ResponseEntity.ok("All articles deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error deleting articles: " + e.getMessage());
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getArticleCount() {
        try {
            long count = repository.count();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<String> getStats() {
        try {
            long totalCount = repository.count();
            return ResponseEntity.ok("Total articles in database: " + totalCount);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error getting stats: " + e.getMessage());
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<String> getDebugInfo() {
        try {
            List<NewsArticle> articles = repository.findAll();
            StringBuilder debugInfo = new StringBuilder();
            debugInfo.append("Total articles: ").append(articles.size()).append("\n\n");
            
            for (int i = 0; i < Math.min(5, articles.size()); i++) {
                NewsArticle article = articles.get(i);
                debugInfo.append("Article ").append(i + 1).append(":\n");
                debugInfo.append("  ID: ").append(article.getId()).append("\n");
                debugInfo.append("  Title: ").append(article.getTitle()).append("\n");
                debugInfo.append("  Link: ").append(article.getLink()).append("\n");
                debugInfo.append("  Authors: '").append(article.getAuthors()).append("'\n");
                debugInfo.append("  Description: '").append(article.getDescription()).append("'\n");
                debugInfo.append("  Created: ").append(article.getCreatedAt()).append("\n\n");
            }
            
            return ResponseEntity.ok(debugInfo.toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error getting debug info: " + e.getMessage());
        }
    }
}

