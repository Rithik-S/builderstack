package sources

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// HNClient - Hacker News API client
type HNClient struct {
	httpClient *http.Client
	baseURL    string
}

// HNItem - A single HN item (story, comment, etc.)
type HNItem struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	URL         string `json:"url"`
	Text        string `json:"text"`
	By          string `json:"by"`
	Score       int    `json:"score"`
	Descendants int    `json:"descendants"`
	Time        int64  `json:"time"`
	Type        string `json:"type"`
}

// HNSearchResponse - Algolia search response
type HNSearchResponse struct {
	Hits []HNSearchHit `json:"hits"`
}

// HNSearchHit - A single search result
type HNSearchHit struct {
	ObjectID    string `json:"objectID"`
	Title       string `json:"title"`
	URL         string `json:"url"`
	StoryText   string `json:"story_text"`
	Author      string `json:"author"`
	Points      int    `json:"points"`
	NumComments int    `json:"num_comments"`
	CreatedAt   string `json:"created_at"`
}

// NewHNClient creates a new Hacker News client
func NewHNClient() *HNClient {
	return &HNClient{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		baseURL:    "https://hn.algolia.com/api/v1",
	}
}

// SearchStories searches HN for stories mentioning a tool
func (c *HNClient) SearchStories(query string, limit int) ([]HNSearchHit, error) {
	url := fmt.Sprintf("%s/search?query=%s&tags=story&hitsPerPage=%d",
		c.baseURL, query, limit)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var searchResp HNSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResp); err != nil {
		return nil, err
	}

	return searchResp.Hits, nil
}

// SearchRecent searches HN for recent stories (sorted by date)
func (c *HNClient) SearchRecent(query string, limit int) ([]HNSearchHit, error) {
	url := fmt.Sprintf("%s/search_by_date?query=%s&tags=story&hitsPerPage=%d",
		c.baseURL, query, limit)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var searchResp HNSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResp); err != nil {
		return nil, err
	}

	return searchResp.Hits, nil
}

// GetTopStories gets current top stories from HN
func (c *HNClient) GetTopStories(limit int) ([]HNItem, error) {
	// Get top story IDs
	resp, err := c.httpClient.Get("https://hacker-news.firebaseio.com/v0/topstories.json")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var ids []int
	if err := json.NewDecoder(resp.Body).Decode(&ids); err != nil {
		return nil, err
	}

	// Limit the number of stories
	if len(ids) > limit {
		ids = ids[:limit]
	}

	// Fetch each story
	var stories []HNItem
	for _, id := range ids {
		item, err := c.GetItem(id)
		if err != nil {
			continue
		}
		stories = append(stories, *item)
	}

	return stories, nil
}

// GetItem gets a single HN item by ID
func (c *HNClient) GetItem(id int) (*HNItem, error) {
	url := fmt.Sprintf("https://hacker-news.firebaseio.com/v0/item/%d.json", id)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var item HNItem
	if err := json.NewDecoder(resp.Body).Decode(&item); err != nil {
		return nil, err
	}

	return &item, nil
}
