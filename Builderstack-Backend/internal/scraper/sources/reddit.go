package sources

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// RedditClient - Our messenger to Reddit
type RedditClient struct {
	httpClient *http.Client
	userAgent  string
}

// Reddit's JSON response structure
type RedditResponse struct {
	Data struct {
		Children []struct {
			Data RedditPost `json:"data"`
		} `json:"children"`
	} `json:"data"`
}

// RedditPost - A single Reddit post
type RedditPost struct {
	Title       string  `json:"title"`
	Selftext    string  `json:"selftext"`
	URL         string  `json:"url"`
	Permalink   string  `json:"permalink"`
	Score       int     `json:"score"`
	NumComments int     `json:"num_comments"`
	Author      string  `json:"author"`
	Subreddit   string  `json:"subreddit"`
	CreatedUTC  float64 `json:"created_utc"`
}

// NewRedditClient creates a client (no auth needed for public posts!)
func NewRedditClient() *RedditClient {
	return &RedditClient{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		userAgent:  "BuilderStack/1.0 (by /u/BuilderStackApp)",
	}
}

// SearchSubreddit searches a subreddit for posts
func (c *RedditClient) SearchSubreddit(subreddit string, query string, limit int) ([]RedditPost, error) {
	// Build URL - using public JSON API (no auth needed!)
	baseURL := fmt.Sprintf("https://www.reddit.com/r/%s/search.json", subreddit)

	params := url.Values{}
	params.Set("q", query)
	params.Set("restrict_sr", "true")
	params.Set("sort", "relevance")
	params.Set("limit", fmt.Sprintf("%d", limit))
	params.Set("t", "month")

	fullURL := baseURL + "?" + params.Encode()

	// Make request
	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", c.userAgent)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("reddit returned status %d", resp.StatusCode)
	}

	// Parse response
	var redditResp RedditResponse
	if err := json.NewDecoder(resp.Body).Decode(&redditResp); err != nil {
		return nil, err
	}

	// Extract posts
	var posts []RedditPost
	for _, child := range redditResp.Data.Children {
		posts = append(posts, child.Data)
	}

	return posts, nil
}

// GetHotPosts gets hot posts from a subreddit
func (c *RedditClient) GetHotPosts(subreddit string, limit int) ([]RedditPost, error) {
	fullURL := fmt.Sprintf("https://www.reddit.com/r/%s/hot.json?limit=%d", subreddit, limit)

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", c.userAgent)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("reddit returned status %d", resp.StatusCode)
	}

	var redditResp RedditResponse
	if err := json.NewDecoder(resp.Body).Decode(&redditResp); err != nil {
		return nil, err
	}

	var posts []RedditPost
	for _, child := range redditResp.Data.Children {
		posts = append(posts, child.Data)
	}

	return posts, nil
}

// SearchForTools searches multiple subreddits for tool mentions
func (c *RedditClient) SearchForTools(toolName string) ([]RedditPost, error) {
	subreddits := []string{"nocode", "SaaS", "smallbusiness", "Entrepreneur", "startups"}

	var allPosts []RedditPost

	for _, sub := range subreddits {
		posts, err := c.SearchSubreddit(sub, toolName, 10)
		if err != nil {
			fmt.Printf("Error searching r/%s: %v\n", sub, err)
			continue
		}
		allPosts = append(allPosts, posts...)

		// Rate limiting - be nice to Reddit!
		time.Sleep(2 * time.Second)
	}

	return allPosts, nil
}

// FilterToolMentions filters posts that likely mention tools
func FilterToolMentions(posts []RedditPost) []RedditPost {
	keywords := []string{
		"tool", "software", "app", "platform", "service",
		"recommend", "best", "alternative", "vs", "compared",
		"review", "thoughts on", "experience with", "using",
	}

	var filtered []RedditPost
	for _, post := range posts {
		content := strings.ToLower(post.Title + " " + post.Selftext)
		for _, keyword := range keywords {
			if strings.Contains(content, keyword) {
				filtered = append(filtered, post)
				break
			}
		}
	}

	return filtered
}
