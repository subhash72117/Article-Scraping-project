package com.web.scrape.scraping_data.Repository;

import com.web.scrape.scraping_data.Model.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {
    List<NewsArticle> findByTitle(String title);
    List<NewsArticle> findAllByOrderByCreatedAtDesc();
}
