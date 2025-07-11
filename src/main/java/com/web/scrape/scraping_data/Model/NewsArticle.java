package com.web.scrape.scraping_data.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "news_articles")
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String title;
    
    @Column(length = 1000)
    private String link;
    
    @Column(length = 2000)
    private String description;
    
    @Column(length = 500)
    private String authors;
    
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    // Default constructor
    public NewsArticle() {
        this.createdAt = java.time.LocalDateTime.now();
    }

    // Constructor with fields
    public NewsArticle(String title, String link, String description, String authors) {
        this.title = title;
        this.link = link;
        this.description = description;
        this.authors = authors;
        this.createdAt = java.time.LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAuthors() {
        return authors;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "NewsArticle{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", link='" + link + '\'' +
                ", description='" + description + '\'' +
                ", authors='" + authors + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
