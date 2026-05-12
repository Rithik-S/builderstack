package grading

import "time"

// GradeComponent is one scored dimension that feeds into the final grade.
// Stored for transparency so users can see exactly why a tool got its score.
type GradeComponent struct {
	Name     string  `json:"name"`      // "sentiment", "user_comments", etc.
	Score    float64 `json:"score"`     // 0–100 scaled score for this component
	Weight   float64 `json:"weight"`    // its weight in the final formula (0.0–1.0)
	RawValue float64 `json:"raw_value"` // pre-scaled value (e.g. avg sentiment -1 to +1)
	IsDefault bool   `json:"is_default"` // true when no real data, using placeholder
}

// GradeResult is the full output of a grade calculation for one tool.
type GradeResult struct {
	ToolID   int    `json:"tool_id"`
	ToolName string `json:"tool_name"`

	// Final outputs
	TotalScore  float64 `json:"total_score"`  // 0–100, or -1 if ungraded
	LetterGrade string  `json:"letter_grade"` // "A+", "B-", "—", etc.
	IsUngraded  bool    `json:"is_ungraded"`  // true when no mention data exists

	// Component breakdown (for transparency)
	Components []GradeComponent `json:"components"`

	// Data volume
	MentionCount int    `json:"mention_count"`
	CommentCount int    `json:"comment_count"`
	DataQuality  string `json:"data_quality"` // "none", "low", "medium", "high"

	// Trend vs. previous grade (populated by repository on save)
	PreviousScore float64 `json:"previous_score,omitempty"`
	PreviousGrade string  `json:"previous_grade,omitempty"`
	Trend         string  `json:"trend,omitempty"`  // "up", "down", "stable", "new"
	ScoreChange   float64 `json:"score_change,omitempty"`

	CalculatedAt time.Time `json:"calculated_at"`
}
