package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/scraper/ai"
	scraperSvc "builderstack-backend/internal/scraper/service"
	"builderstack-backend/internal/scraper/sources"
)

func main() {
	fmt.Println("BuilderStack Scraper — Full Pipeline Test")
	fmt.Println("==========================================")

	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println(".env not found, relying on system environment variables")
	}

	// -------------------------------------------------------
	// Phase 1: Sources (no DB or AI needed)
	// -------------------------------------------------------
	fmt.Println("\n[1/3] Testing raw sources...")

	reddit := sources.NewRedditClient()
	redditPosts, err := reddit.SearchSubreddit("nocode", "notion", 3)
	if err != nil {
		log.Printf("  Reddit error: %v", err)
	} else {
		fmt.Printf("  Reddit: %d posts found\n", len(redditPosts))
		for i, p := range redditPosts {
			if i >= 2 {
				break
			}
			fmt.Printf("    [%d up] %s\n", p.Score, p.Title)
		}
	}

	hn := sources.NewHNClient()
	hnHits, err := hn.SearchStories("Notion", 3)
	if err != nil {
		log.Printf("  HN error: %v", err)
	} else {
		fmt.Printf("  HN: %d stories found\n", len(hnHits))
		for i, h := range hnHits {
			if i >= 2 {
				break
			}
			fmt.Printf("    [%d pts] %s\n", h.Points, h.Title)
		}
	}

	rss := sources.NewRSSClient()
	feed, err := rss.FetchFeed(sources.NewsFeeds["techcrunch"])
	if err != nil {
		log.Printf("  RSS error: %v", err)
	} else {
		fmt.Printf("  TechCrunch RSS: %d items\n", len(feed.Channel.Items))
	}

	// -------------------------------------------------------
	// Phase 2: Groq AI analysis on a sample post
	// -------------------------------------------------------
	fmt.Println("\n[2/3] Testing Groq AI analysis...")

	groqClient, err := ai.NewGroqClient()
	if err != nil {
		log.Printf("  Groq init error: %v (is GROQ_API_KEY set?)", err)
	} else {
		sampleTitle := "Notion vs Airtable: Which is better for small teams?"
		sampleContent := "I've been using Notion for 6 months. The flexibility is amazing but it can get complex. Airtable is more structured which helps with databases. Notion wins for docs, Airtable wins for data. Highly recommend Notion for most teams."

		analysis, err := groqClient.AnalyzePost(sampleTitle, sampleContent, "reddit")
		if err != nil {
			log.Printf("  Groq analysis error: %v", err)
		} else {
			fmt.Printf("  Tools mentioned: %v\n", analysis.ToolNames)
			fmt.Printf("  Sentiment: %s (score: %.2f)\n", analysis.Sentiment, analysis.SentimentScore)
			fmt.Printf("  Pros: %v\n", analysis.Pros)
			fmt.Printf("  Cons: %v\n", analysis.Cons)
			fmt.Printf("  Use case: %s\n", analysis.UseCase)
			fmt.Printf("  Recommended: %v\n", analysis.IsRecommended)
		}
	}

	// -------------------------------------------------------
	// Phase 3: Full pipeline via ScraperService (requires DB)
	// -------------------------------------------------------
	fmt.Println("\n[3/3] Testing full pipeline (Reddit -> Groq -> DB)...")

	// Check if DB env vars are set before connecting
	if os.Getenv("DB_USER") == "" {
		fmt.Println("  Skipping DB test: DB_USER not set. Set DB_* env vars to enable.")
		fmt.Println("\nScraper pipeline test complete!")
		return
	}

	database.Connect()

	svc, err := scraperSvc.NewScraperService()
	if err != nil {
		log.Fatalf("  Failed to init ScraperService: %v", err)
	}

	// Scrape mentions for "Notion" specifically
	result, err := svc.RunToolScrape("Notion", "test-harness")
	if err != nil {
		log.Printf("  RunToolScrape error: %v", err)
	} else {
		fmt.Printf("  Items found across sources: %d\n", result.ItemsFound)
		fmt.Printf("  Items analyzed and saved:   %d\n", result.ItemsNew)
		fmt.Printf("  Duration: %s\n", result.Duration)
		if len(result.Errors) > 0 {
			fmt.Printf("  Errors (%d):\n", len(result.Errors))
			for _, e := range result.Errors {
				fmt.Printf("    - %s\n", e)
			}
		}
	}

	fmt.Println("\nScraper pipeline test complete!")
}
