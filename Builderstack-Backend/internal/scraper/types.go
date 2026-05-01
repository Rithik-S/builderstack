package scraper

import "time"

// RawMention - Data BEFORE AI processing
// This is what we get directly from Reddit/HN/News
type RawMention struct {
	Platform     string    // Where it came from: "reddit", "hackernews", "news"
	SourceName   string    // More specific: "r/nocode", "techcrunch"
	PostTitle    string    // The post title
	PostURL      string    // Link to the post
	PostContent  string    // The actual text/body
	PostAuthor   string    // Who wrote it
	PostScore    int       // Upvotes (popularity signal)
	CommentCount int       // How many comments (engagement signal)
	PostDate     time.Time // When it was posted
}

// ProcessedMention - Data AFTER AI processing
// AI has analyzed the raw data and extracted insights
type ProcessedMention struct {
	RawMention // Includes all RawMention fields (Go embedding)

	// AI Analysis Results
	ToolName       string   // Which tool is mentioned: "Notion", "Airtable"
	Sentiment      string   // AI's analysis: "positive", "negative", "neutral"
	SentimentScore float64  // Number: -1.0 (hate) to +1.0 (love)
	Pros           []string // Good things mentioned: ["easy to use", "fast"]
	Cons           []string // Bad things mentioned: ["expensive", "complex"]
	UseCase        string   // How they use it: "project management"
	IsRecommended  bool     // Did they recommend it?
}

// ScrapeResult - Summary of a scrape job
// Used for logging and monitoring
type ScrapeResult struct {
	Source     string        // Which source we scraped
	ItemsFound int           // How many items we found
	ItemsNew   int           // How many were new (not duplicates)
	Errors     []string      // Any errors that happened
	Duration   time.Duration // How long it took
}
