package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	groqAPIURL = "https://api.groq.com/openai/v1/chat/completions"
	groqModel  = "llama-3.3-70b-versatile"
)

// ToolAnalysis is the structured result from Groq AI analysis
type ToolAnalysis struct {
	ToolNames     []string `json:"tool_names"`     // Tools mentioned in the post
	Sentiment     string   `json:"sentiment"`      // "positive", "negative", "neutral", "mixed"
	SentimentScore float64 `json:"sentiment_score"` // -1.0 to +1.0
	Pros          []string `json:"pros"`           // Positive aspects mentioned
	Cons          []string `json:"cons"`           // Negative aspects mentioned
	UseCase       string   `json:"use_case"`       // How the tool is being used
	IsRecommended bool     `json:"is_recommended"` // Did the author recommend it?
}

// GroqClient handles communication with the Groq AI API
type GroqClient struct {
	httpClient *http.Client
	apiKey     string
}

// groqRequest is the request body sent to Groq API (OpenAI-compatible format)
type groqRequest struct {
	Model       string        `json:"model"`
	Messages    []groqMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
}

type groqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// groqResponse is the response from Groq API
type groqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

// NewGroqClient creates a new Groq client using GROQ_API_KEY from env
func NewGroqClient() (*GroqClient, error) {
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GROQ_API_KEY environment variable not set")
	}

	return &GroqClient{
		httpClient: &http.Client{Timeout: 30 * time.Second},
		apiKey:     apiKey,
	}, nil
}

// AnalyzePost sends a post to Groq and returns structured tool analysis
func (c *GroqClient) AnalyzePost(title, content, source string) (*ToolAnalysis, error) {
	prompt := buildAnalysisPrompt(title, content, source)

	reqBody := groqRequest{
		Model: groqModel,
		Messages: []groqMessage{
			{
				Role: "system",
				Content: `You are an expert at analyzing social media posts and articles about software tools.
Extract structured information about tool mentions, sentiment, pros/cons, and use cases.
Always respond with valid JSON only — no markdown, no explanation, just the JSON object.`,
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Temperature: 0.1, // Low temperature for consistent structured output
		MaxTokens:   500,
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", groqAPIURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("groq API request failed: %w", err)
	}
	defer resp.Body.Close()

	var groqResp groqResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return nil, fmt.Errorf("failed to decode groq response: %w", err)
	}

	if groqResp.Error != nil {
		return nil, fmt.Errorf("groq API error: %s", groqResp.Error.Message)
	}

	if len(groqResp.Choices) == 0 {
		return nil, fmt.Errorf("groq returned no choices")
	}

	// Rate limiting — be nice to the API
	time.Sleep(2 * time.Second)

	return parseAnalysis(groqResp.Choices[0].Message.Content)
}

// buildAnalysisPrompt constructs the prompt for the AI
func buildAnalysisPrompt(title, content, source string) string {
	// Truncate content to avoid token limits
	if len(content) > 1000 {
		content = content[:1000] + "..."
	}

	return fmt.Sprintf(`Analyze this %s post about software tools and return a JSON object with exactly these fields:

Title: %s
Content: %s

Return ONLY this JSON structure (no markdown, no code blocks):
{
  "tool_names": ["list of software tool names mentioned"],
  "sentiment": "positive|negative|neutral|mixed",
  "sentiment_score": <float from -1.0 to 1.0>,
  "pros": ["positive aspects mentioned"],
  "cons": ["negative aspects mentioned"],
  "use_case": "brief description of how the tool is being used",
  "is_recommended": <true|false>
}

Rules:
- tool_names: only real software product names (not generic words like "tool" or "software")
- sentiment_score: -1.0 = extremely negative, 0 = neutral, +1.0 = extremely positive
- is_recommended: true if the author recommends the tool(s)
- If a field has no data, use [] for arrays, "" for strings, 0.0 for the score`, source, title, strings.TrimSpace(content))
}

// parseAnalysis parses the raw JSON string from Groq into a ToolAnalysis struct
func parseAnalysis(raw string) (*ToolAnalysis, error) {
	// Strip any accidental markdown code fences
	raw = strings.TrimSpace(raw)
	raw = strings.TrimPrefix(raw, "```json")
	raw = strings.TrimPrefix(raw, "```")
	raw = strings.TrimSuffix(raw, "```")
	raw = strings.TrimSpace(raw)

	var analysis ToolAnalysis
	if err := json.Unmarshal([]byte(raw), &analysis); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as JSON: %w (raw: %s)", err, raw)
	}

	// Clamp sentiment score to valid range
	if analysis.SentimentScore > 1.0 {
		analysis.SentimentScore = 1.0
	}
	if analysis.SentimentScore < -1.0 {
		analysis.SentimentScore = -1.0
	}

	return &analysis, nil
}
