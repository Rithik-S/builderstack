package main

import (
	"fmt"
	"log"

	"builderstack-backend/internal/scraper/sources"
)

func main() {
	fmt.Println("🔍 BuilderStack Scraper Test")
	fmt.Println("============================")

	// Test 1: Reddit
	fmt.Println("\n📱 Testing Reddit API...")
	reddit := sources.NewRedditClient()

	posts, err := reddit.SearchSubreddit("nocode", "notion", 5)
	if err != nil {
		log.Printf("Reddit error: %v", err)
	} else {
		fmt.Printf("Found %d posts about 'notion' in r/nocode:\n", len(posts))
		for i, post := range posts {
			if i >= 3 {
				break
			}
			fmt.Printf("  - [%d⬆] %s\n", post.Score, post.Title)
		}
	}

	// Test 2: Hacker News
	fmt.Println("\n🔶 Testing Hacker News API...")
	hn := sources.NewHNClient()

	hits, err := hn.SearchStories("Notion", 5)
	if err != nil {
		log.Printf("HN error: %v", err)
	} else {
		fmt.Printf("Found %d stories about 'Notion' on HN:\n", len(hits))
		for i, hit := range hits {
			if i >= 3 {
				break
			}
			fmt.Printf("  - [%d⬆] %s\n", hit.Points, hit.Title)
		}
	}

	// Test 3: RSS
	fmt.Println("\n📰 Testing RSS Feeds...")
	rss := sources.NewRSSClient()

	feed, err := rss.FetchFeed(sources.NewsFeeds["techcrunch"])
	if err != nil {
		log.Printf("RSS error: %v", err)
	} else {
		fmt.Printf("Latest from TechCrunch (%d items):\n", len(feed.Channel.Items))
		for i, item := range feed.Channel.Items {
			if i >= 3 {
				break
			}
			fmt.Printf("  - %s\n", item.Title)
		}
	}

	fmt.Println("\n✅ Scraper test complete!")
}
