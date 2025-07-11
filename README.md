# 📰 News Scraper Application

A Spring Boot application that scrapes news articles from Nature.com and stores them in a MySQL database. The application provides a REST API and a web interface for managing scraped articles with support for multi-page scraping.

## 🚀 Features

- **Multi-Page Web Scraping**: Scrapes articles from multiple pages of Nature.com using JSoup
- **Database Storage**: Stores articles in MySQL database with JPA/Hibernate
- **REST API**: Provides endpoints for scraping, viewing, and managing articles
- **Web Interface**: Beautiful HTML interface for easy interaction
- **Duplicate Prevention**: Prevents saving duplicate articles
- **Error Handling**: Comprehensive error handling and logging
- **Pagination Support**: Scrape specific pages or all available pages
- **Real-time Statistics**: Track scraping progress and article counts

## 🛠️ Technologies Used

- **Backend**: Spring Boot 3.5.3, Java 21
- **Database**: MySQL 8.0
- **Web Scraping**: JSoup 1.17.2
- **ORM**: Spring Data JPA with Hibernate
- **Frontend**: HTML, CSS, JavaScript

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Java 21** installed
2. **MySQL 8.0** installed and running
3. **Maven** installed (or use the included Maven wrapper)

## 🗄️ Database Setup

1. Create a MySQL database named `jobdb`:
   ```sql
   CREATE DATABASE jobdb;
   ```

2. Create a MySQL user (optional, you can use root):
   ```sql
   CREATE USER 'scraper'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON jobdb.* TO 'scraper'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Update the database configuration in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

## 🚀 Running the Application

### Option 1: Using Maven Wrapper (Recommended)
```bash
# On Windows
./mvnw.cmd spring-boot:run

# On Linux/Mac
./mvnw spring-boot:run
```

### Option 2: Using Maven
```bash
mvn spring-boot:run
```

### Option 3: Building and Running JAR
```bash
mvn clean package
java -jar target/scraping_data-0.0.1-SNAPSHOT.jar
```

## 🌐 Accessing the Application

Once the application is running, you can access:

- **Web Interface**: http://localhost:8080
- **REST API**: http://localhost:8080/api/news

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | Get all scraped articles |
| GET | `/api/news/page/{pageNumber}` | Get articles with pagination |
| POST | `/api/news/scrape` | Scrape articles from page 1 |
| POST | `/api/news/scrape/all` | Scrape articles from all pages (up to 10) |
| POST | `/api/news/scrape/page/{pageNumber}` | Scrape articles from specific page |
| DELETE | `/api/news` | Delete all articles |
| GET | `/api/news/count` | Get total article count |
| GET | `/api/news/stats` | Get scraping statistics |

### Example API Usage

```bash
# Get all articles
curl http://localhost:8080/api/news

# Scrape page 1 only
curl -X POST http://localhost:8080/api/news/scrape

# Scrape all pages (up to 10 pages)
curl -X POST http://localhost:8080/api/news/scrape/all

# Scrape specific page (e.g., page 3)
curl -X POST http://localhost:8080/api/news/scrape/page/3

# Get article count
curl http://localhost:8080/api/news/count

# Get statistics
curl http://localhost:8080/api/news/stats

# Delete all articles
curl -X DELETE http://localhost:8080/api/news
```

## 🎯 Scraping Options

### Single Page Scraping
- Scrapes articles from the first page only
- Fast execution
- Good for testing or getting recent articles

### Multi-Page Scraping
- Scrapes articles from up to 10 pages
- Includes 2-second delay between pages to be respectful
- Automatically stops when no more articles are found
- Best for comprehensive data collection

### Specific Page Scraping
- Scrape articles from any specific page (1-10)
- Useful for targeted data collection
- Allows manual control over which pages to scrape

## 🗂️ Project Structure

```
src/
├── main/
│   ├── java/com/web/scrape/scraping_data/
│   │   ├── Controller/
│   │   │   └── NewsController.java          # REST API endpoints
│   │   ├── Model/
│   │   │   └── NewsArticle.java             # JPA entity
│   │   ├── Repository/
│   │   │   └── NewsArticleRepository.java   # Data access layer
│   │   ├── ServiceLogic/
│   │   │   └── NewsScraperService.java      # Business logic & scraping
│   │   └── ScrapingDataApplication.java     # Main application class
│   └── resources/
│       ├── application.properties           # Configuration
│       └── static/
│           └── index.html                   # Web interface
```

## 🔧 Configuration

The application can be configured through `src/main/resources/application.properties`:

- **Database settings**: URL, username, password
- **Server settings**: Port, logging levels
- **JPA settings**: DDL auto, SQL logging
- **Connection pool**: HikariCP settings

### Scraping Configuration

The scraping behavior can be modified in `NewsScraperService.java`:

- `MAX_PAGES`: Maximum number of pages to scrape (default: 10)
- `BASE_URL`: Base URL for Nature.com articles
- Request timeout and user agent settings
- Delay between page requests

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `application.properties`
   - Verify database `jobdb` exists

2. **Port Already in Use**
   - Change the port in `application.properties`: `server.port=8081`

3. **Scraping Fails**
   - Check internet connection
   - Verify the target website is accessible
   - Check logs for detailed error messages

4. **Multi-Page Scraping Takes Too Long**
   - The application includes 2-second delays between pages
   - Reduce `MAX_PAGES` in the service if needed
   - Use single page scraping for faster results

### Logs

The application provides detailed logging. Check the console output for:
- Database connection status
- Scraping progress for each page
- Error messages
- SQL queries (when debug logging is enabled)

## 📝 Database Schema

The application automatically creates the following table:

```sql
CREATE TABLE news_articles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500),
    link VARCHAR(1000),
    description VARCHAR(2000),
    authors VARCHAR(500),
    created_at DATETIME
);
```

## ⚡ Performance Tips

1. **For Testing**: Use single page scraping
2. **For Production**: Use multi-page scraping with appropriate delays
3. **Database**: Ensure MySQL is properly configured for your workload
4. **Memory**: Monitor memory usage during large scraping operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This application is for educational purposes. Please respect the terms of service of the websites you scrape and ensure you have permission to access their content. The application includes delays between requests to be respectful to the target website. 