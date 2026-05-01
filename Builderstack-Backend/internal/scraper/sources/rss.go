package sources

import (
	"encoding/xml"
	"net/http"
	"strings"
	"time"
)

// RSSClient - RSS feed fetcher
type RSSClient struct {
	httpClient *http.Client
}

// RSSFeed - Root RSS structure
type RSSFeed struct {
	Channel RSSChannel `xml:"channel"`
}

// RSSChannel - RSS channel containing items
type RSSChannel struct {
	Title       string    `xml:"title"`
	Description string    `xml:"description"`
	Items       []RSSItem `xml:"item"`
}

// RSSItem - A single RSS item (article)
type RSSItem struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	Description string `xml:"description"`
	PubDate     string `xml:"pubDate"`
	Creator     string `xml:"creator"`
}

// NewsFeeds - Tech news RSS feeds we monitor
var NewsFeeds = map[string]string{
	"techcrunch":  "https://techcrunch.com/feed/",
	"theverge":    "https://www.theverge.com/rss/index.xml",
	"wired":       "https://www.wired.com/feed/rss",
	"venturebeat": "https://venturebeat.com/feed/",
}

// NewRSSClient creates a new RSS client
func NewRSSClient() *RSSClient {
	return &RSSClient{
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// FetchFeed fetches and parses an RSS feed
func (c *RSSClient) FetchFeed(url string) (*RSSFeed, error) {
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var feed RSSFeed
	if err := xml.NewDecoder(resp.Body).Decode(&feed); err != nil {
		return nil, err
	}

	return &feed, nil
}

// FetchAllNews fetches all configured news feeds
func (c *RSSClient) FetchAllNews() (map[string][]RSSItem, error) {
	results := make(map[string][]RSSItem)

	for name, url := range NewsFeeds {
		feed, err := c.FetchFeed(url)
		if err != nil {
			// Log but continue
			continue
		}
		results[name] = feed.Channel.Items

		// Be nice - small delay
		time.Sleep(1 * time.Second)
	}

	return results, nil
}

// FilterByKeywords filters RSS items containing specific keywords
func FilterByKeywords(items []RSSItem, keywords []string) []RSSItem {
	var filtered []RSSItem

	for _, item := range items {
		content := strings.ToLower(item.Title + " " + item.Description)
		for _, kw := range keywords {
			if strings.Contains(content, strings.ToLower(kw)) {
				filtered = append(filtered, item)
				break
			}
		}
	}

	return filtered
}
