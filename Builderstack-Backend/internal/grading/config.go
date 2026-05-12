package grading

// GradeConfig holds the weights and thresholds for grade calculation.
// Weights must sum to 1.0. Swap DefaultConfig() for a different config
// to change the formula without touching any calculation logic.
type GradeConfig struct {
	// Component weights (must sum to 1.0)
	WeightSentiment    float64
	WeightUserComments float64
	WeightFeatureMatch float64
	WeightPricing      float64

	// Default scores used when a data source has no data yet
	DefaultUserCommentsScore float64 // neutral baseline
	DefaultFeatureMatchScore float64 // manual placeholder until AI analysis
	DefaultPricingScore      float64 // manual placeholder until pricing parser

	// Minimum mentions before we consider sentiment data meaningful
	MinMentionsForGrade int
}

// DefaultConfig returns the v1 grade weights.
// Adjust weights here when the formula evolves — nothing else needs to change.
func DefaultConfig() GradeConfig {
	return GradeConfig{
		WeightSentiment:    0.50,
		WeightUserComments: 0.20,
		WeightFeatureMatch: 0.15,
		WeightPricing:      0.15,

		DefaultUserCommentsScore: 50.0,
		DefaultFeatureMatchScore: 70.0,
		DefaultPricingScore:      70.0,

		MinMentionsForGrade: 1,
	}
}

// LetterGrade converts a 0–100 score to a letter grade.
// Returns "—" when score is -1 (ungraded / no data).
func LetterGrade(score float64) string {
	switch {
	case score < 0:
		return "—"
	case score >= 95:
		return "A+"
	case score >= 90:
		return "A"
	case score >= 85:
		return "A-"
	case score >= 80:
		return "B+"
	case score >= 75:
		return "B"
	case score >= 70:
		return "B-"
	case score >= 65:
		return "C+"
	case score >= 60:
		return "C"
	default:
		return "C-"
	}
}

// DataQuality describes how trustworthy a grade is based on mention volume.
func DataQuality(mentionCount int) string {
	switch {
	case mentionCount == 0:
		return "none"
	case mentionCount <= 10:
		return "low"
	case mentionCount <= 30:
		return "medium"
	default:
		return "high"
	}
}

// SentimentToScore converts a sentiment score (-1 to +1) to a 0–100 scale.
// Formula: ((s + 1) / 2) * 100
// Examples: -1.0 → 0, 0.0 → 50, 0.5 → 75, 1.0 → 100
func SentimentToScore(sentimentScore float64) float64 {
	return ((sentimentScore + 1.0) / 2.0) * 100.0
}
