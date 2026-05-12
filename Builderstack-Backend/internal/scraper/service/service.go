// Package service orchestrates the scraper pipeline:
// fetch from sources → analyze with Groq AI → persist to DB
package service

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/scraper"
	"builderstack-backend/internal/scraper/ai"
	scraperRepo "builderstack-backend/internal/scraper/repository"
	"builderstack-backend/internal/scraper/sources"
)

// ScraperService orchestrates scraping from all sources, AI analysis, and DB persistence
type ScraperService struct {
	reddit *sources.RedditClient
	hn     *sources.HNClient
	rss    *sources.RSSClient
	groq   *ai.GroqClient
}

// NewScraperService initializes the service and all its dependencies
func NewScraperService() (*ScraperService, error) {
	groqClient, err := ai.NewGroqClient()
	if err != nil {
		return nil, fmt.Errorf("failed to init Groq client: %w", err)
	}

	return &ScraperService{
		reddit: sources.NewRedditClient(),
		hn:     sources.NewHNClient(),
		rss:    sources.NewRSSClient(),
		groq:   groqClient,
	}, nil
}

// RunFullScrape fetches all tools from the DB and scrapes mentions for each one
func (s *ScraperService) RunFullScrape(triggeredBy string) ([]scraper.ScrapeResult, error) {
	rows, err := database.DB.Query("SELECT id, name FROM tools ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("failed to load tools: %w", err)
	}
	defer rows.Close()

	type toolRow struct {
		ID   int
		Name string
	}
	var tools []toolRow
	for rows.Next() {
		var t toolRow
		if err := rows.Scan(&t.ID, &t.Name); err != nil {
			return nil, err
		}
		tools = append(tools, t)
	}

	var results []scraper.ScrapeResult
	for _, tool := range tools {
		result, err := s.scrapeAndSave(tool.ID, tool.Name, triggeredBy)
		if err != nil {
			fmt.Printf("Error scraping %s: %v\n", tool.Name, err)
			result = scraper.ScrapeResult{
				Source: tool.Name,
				Errors: []string{err.Error()},
			}
		}
		results = append(results, result)
	}

	return results, nil
}

// RunToolScrape scrapes mentions for a single named tool
func (s *ScraperService) RunToolScrape(toolName string, triggeredBy string) (scraper.ScrapeResult, error) {
	// Look up the tool ID by name (case-insensitive)
	var toolID int
	err := database.DB.QueryRow(
		"SELECT id FROM tools WHERE LOWER(name) = LOWER($1)", toolName,
	).Scan(&toolID)

	if err == sql.ErrNoRows {
		return scraper.ScrapeResult{}, fmt.Errorf("tool %q not found in database", toolName)
	}
	if err != nil {
		return scraper.ScrapeResult{}, fmt.Errorf("database error: %w", err)
	}

	return s.scrapeAndSave(toolID, toolName, triggeredBy)
}

// scrapeAndSave fetches raw posts, analyzes with Groq, and saves to DB.
// It logs the result to scrape_logs and returns a ScrapeResult summary.
func (s *ScraperService) scrapeAndSave(toolID int, toolName string, triggeredBy string) (scraper.ScrapeResult, error) {
	startedAt := time.Now()
	result := scraper.ScrapeResult{Source: toolName}
	var errs []string

	// --- 1. Reddit ---
	redditPosts, err := s.reddit.SearchForTools(toolName)
	if err != nil {
		errs = append(errs, fmt.Sprintf("reddit: %v", err))
	}

	// --- 2. Hacker News ---
	hnHits, err := s.hn.SearchStories(toolName, 10)
	if err != nil {
		errs = append(errs, fmt.Sprintf("hackernews: %v", err))
	}

	// --- 3. RSS feeds ---
	rssItems, err := s.fetchRSSMentions(toolName)
	if err != nil {
		errs = append(errs, fmt.Sprintf("rss: %v", err))
	}

	// Convert all raw posts to RawMentions
	var rawMentions []scraper.RawMention

	for _, post := range redditPosts {
		rawMentions = append(rawMentions, scraper.RawMention{
			Platform:     "reddit",
			SourceName:   "r/" + post.Subreddit,
			PostTitle:    post.Title,
			PostURL:      "https://reddit.com" + post.Permalink,
			PostContent:  post.Selftext,
			PostAuthor:   post.Author,
			PostScore:    post.Score,
			CommentCount: post.NumComments,
			PostDate:     time.Unix(int64(post.CreatedUTC), 0),
		})
	}

	for _, hit := range hnHits {
		postDate, _ := time.Parse(time.RFC3339, hit.CreatedAt)
		rawMentions = append(rawMentions, scraper.RawMention{
			Platform:     "hackernews",
			SourceName:   "news.ycombinator.com",
			PostTitle:    hit.Title,
			PostURL:      hit.URL,
			PostContent:  hit.StoryText,
			PostAuthor:   hit.Author,
			PostScore:    hit.Points,
			CommentCount: hit.NumComments,
			PostDate:     postDate,
		})
	}

	rawMentions = append(rawMentions, rssItems...)
	result.ItemsFound = len(rawMentions)

	// --- 4. AI analysis + DB save ---
	savedCount := 0
	for _, raw := range rawMentions {
		analysis, err := s.groq.AnalyzePost(raw.PostTitle, raw.PostContent, raw.Platform)
		if err != nil {
			errs = append(errs, fmt.Sprintf("groq analysis for %q: %v", raw.PostTitle, err))
			continue
		}

		processed := scraper.ProcessedMention{
			RawMention:     raw,
			ToolName:       toolName,
			Sentiment:      analysis.Sentiment,
			SentimentScore: analysis.SentimentScore,
			Pros:           analysis.Pros,
			Cons:           analysis.Cons,
			UseCase:        analysis.UseCase,
			IsRecommended:  analysis.IsRecommended,
		}

		if err := scraperRepo.SaveMention(processed, toolID); err != nil {
			errs = append(errs, fmt.Sprintf("save mention: %v", err))
			continue
		}
		savedCount++
	}

	result.ItemsNew = savedCount
	result.Errors = errs
	result.Duration = time.Since(startedAt)

	// --- 5. Log to scrape_logs ---
	status := "success"
	errorMsg := ""
	if len(errs) > 0 {
		if savedCount == 0 {
			status = "failed"
		} else {
			status = "partial"
		}
		errorMsg = strings.Join(errs, "; ")
	}

	logEntry := scraperRepo.ScrapeLog{
		Front:           "sentiment",
		Source:          toolName,
		JobType:         "manual",
		Status:          status,
		ItemsFound:      result.ItemsFound,
		ItemsNew:        result.ItemsNew,
		ErrorMessage:    errorMsg,
		ErrorCount:      len(errs),
		StartedAt:       startedAt,
		CompletedAt:     time.Now(),
		DurationSeconds: int(result.Duration.Seconds()),
		TriggeredBy:     triggeredBy,
	}
	if err := scraperRepo.SaveScrapeLog(logEntry); err != nil {
		fmt.Printf("Warning: failed to save scrape log: %v\n", err)
	}

	return result, nil
}

// fetchRSSMentions searches all configured RSS feeds for mentions of toolName
func (s *ScraperService) fetchRSSMentions(toolName string) ([]scraper.RawMention, error) {
	var mentions []scraper.RawMention
	toolLower := strings.ToLower(toolName)

	for feedName, feedURL := range sources.NewsFeeds {
		feed, err := s.rss.FetchFeed(feedURL)
		if err != nil {
			continue // Non-fatal: skip this feed
		}

		for _, item := range feed.Channel.Items {
			if !strings.Contains(strings.ToLower(item.Title+item.Description), toolLower) {
				continue
			}

			pubDate, _ := time.Parse(time.RFC1123Z, item.PubDate)
			mentions = append(mentions, scraper.RawMention{
				Platform:    "news",
				SourceName:  feedName,
				PostTitle:   item.Title,
				PostURL:     item.Link,
				PostContent: item.Description,
				PostDate:    pubDate,
			})
		}
	}

	return mentions, nil
}
