package grading

import (
	"database/sql"
	"fmt"
	"math"
	"time"

	"builderstack-backend/internal/database"
)

// GradeCalculator computes grades for tools using sentiment and other signals.
// Inject a custom GradeConfig to change formula weights without touching this code.
type GradeCalculator struct {
	cfg GradeConfig
}

// NewCalculator returns a GradeCalculator with the given config.
// Use DefaultConfig() for the standard v1 formula.
func NewCalculator(cfg GradeConfig) *GradeCalculator {
	return &GradeCalculator{cfg: cfg}
}

// CalculateForTool computes a GradeResult for a single tool by ID.
// If the tool has no mentions it returns an ungraded result — not an error.
func (c *GradeCalculator) CalculateForTool(toolID int) (GradeResult, error) {
	// --- Fetch tool name ---
	var toolName string
	err := database.DB.QueryRow("SELECT name FROM tools WHERE id = $1", toolID).Scan(&toolName)
	if err == sql.ErrNoRows {
		return GradeResult{}, fmt.Errorf("tool %d not found", toolID)
	}
	if err != nil {
		return GradeResult{}, fmt.Errorf("fetch tool: %w", err)
	}

	result := GradeResult{
		ToolID:       toolID,
		ToolName:     toolName,
		CalculatedAt: time.Now(),
	}

	// --- Sentiment component (from tool_mentions) ---
	sentimentComp, mentionCount, err := c.sentimentComponent(toolID)
	if err != nil {
		return GradeResult{}, fmt.Errorf("sentiment component: %w", err)
	}
	result.MentionCount = mentionCount

	// Tools with no mentions get an ungraded status — no score assigned
	if mentionCount < c.cfg.MinMentionsForGrade {
		result.IsUngraded = true
		result.TotalScore = -1
		result.LetterGrade = "—"
		result.DataQuality = DataQuality(0)
		return result, nil
	}

	// --- User comments component (from tool_user_comments) ---
	commentComp, commentCount, err := c.userCommentsComponent(toolID)
	if err != nil {
		return GradeResult{}, fmt.Errorf("user comments component: %w", err)
	}
	result.CommentCount = commentCount

	// --- Feature match component (manual/default until AI analysis) ---
	featureComp := GradeComponent{
		Name:      "feature_match",
		Score:     c.cfg.DefaultFeatureMatchScore,
		Weight:    c.cfg.WeightFeatureMatch,
		RawValue:  c.cfg.DefaultFeatureMatchScore,
		IsDefault: true,
	}

	// --- Pricing component (manual/default until pricing parser) ---
	pricingComp := GradeComponent{
		Name:      "pricing",
		Score:     c.cfg.DefaultPricingScore,
		Weight:    c.cfg.WeightPricing,
		RawValue:  c.cfg.DefaultPricingScore,
		IsDefault: true,
	}

	result.Components = []GradeComponent{sentimentComp, commentComp, featureComp, pricingComp}

	// --- Weighted total ---
	total := sentimentComp.Score*c.cfg.WeightSentiment +
		commentComp.Score*c.cfg.WeightUserComments +
		featureComp.Score*c.cfg.WeightFeatureMatch +
		pricingComp.Score*c.cfg.WeightPricing

	// Round to 2 decimal places
	result.TotalScore = math.Round(total*100) / 100
	result.LetterGrade = LetterGrade(result.TotalScore)
	result.DataQuality = DataQuality(mentionCount)

	return result, nil
}

// CalculateForAllTools computes grades for every tool in the DB.
// Tools with no mention data will have IsUngraded=true in their result.
func (c *GradeCalculator) CalculateForAllTools() ([]GradeResult, error) {
	rows, err := database.DB.Query("SELECT id FROM tools ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("fetch tool IDs: %w", err)
	}
	defer rows.Close()

	var ids []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}

	var results []GradeResult
	for _, id := range ids {
		result, err := c.CalculateForTool(id)
		if err != nil {
			// Non-fatal: log and continue
			fmt.Printf("Warning: grading tool %d: %v\n", id, err)
			continue
		}
		results = append(results, result)
	}

	return results, nil
}

// sentimentComponent fetches average sentiment from tool_mentions and returns
// a scored GradeComponent plus the raw mention count.
func (c *GradeCalculator) sentimentComponent(toolID int) (GradeComponent, int, error) {
	query := `
		SELECT
			COUNT(*)           AS mention_count,
			AVG(sentiment_score::float8) AS avg_sentiment
		FROM tool_mentions
		WHERE tool_id = $1
	`

	var mentionCount int
	var avgSentiment sql.NullFloat64
	err := database.DB.QueryRow(query, toolID).Scan(&mentionCount, &avgSentiment)
	if err != nil {
		return GradeComponent{}, 0, err
	}

	if mentionCount == 0 || !avgSentiment.Valid {
		return GradeComponent{
			Name:      "sentiment",
			Score:     0,
			Weight:    c.cfg.WeightSentiment,
			RawValue:  0,
			IsDefault: false,
		}, 0, nil
	}

	score := SentimentToScore(avgSentiment.Float64)
	score = math.Round(score*100) / 100

	return GradeComponent{
		Name:      "sentiment",
		Score:     score,
		Weight:    c.cfg.WeightSentiment,
		RawValue:  math.Round(avgSentiment.Float64*1000) / 1000, // 3dp
		IsDefault: false,
	}, mentionCount, nil
}

// userCommentsComponent fetches average rating from tool_user_comments.
// Falls back to the configured default if no comments exist yet.
func (c *GradeCalculator) userCommentsComponent(toolID int) (GradeComponent, int, error) {
	query := `
		SELECT
			COUNT(*)        AS comment_count,
			AVG(rating::float8) AS avg_rating
		FROM tool_user_comments
		WHERE tool_id = $1 AND is_approved = true
	`

	var commentCount int
	var avgRating sql.NullFloat64
	err := database.DB.QueryRow(query, toolID).Scan(&commentCount, &avgRating)
	if err != nil {
		return GradeComponent{}, 0, err
	}

	// No comments yet — use neutral default
	if commentCount == 0 || !avgRating.Valid {
		return GradeComponent{
			Name:      "user_comments",
			Score:     c.cfg.DefaultUserCommentsScore,
			Weight:    c.cfg.WeightUserComments,
			RawValue:  0,
			IsDefault: true,
		}, 0, nil
	}

	// Convert 1–5 star rating to 0–100 scale: ((rating - 1) / 4) * 100
	score := ((avgRating.Float64 - 1.0) / 4.0) * 100.0
	score = math.Round(score*100) / 100

	return GradeComponent{
		Name:      "user_comments",
		Score:     score,
		Weight:    c.cfg.WeightUserComments,
		RawValue:  math.Round(avgRating.Float64*100) / 100,
		IsDefault: false,
	}, commentCount, nil
}
