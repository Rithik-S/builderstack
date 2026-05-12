package grading

import (
	"database/sql"
	"fmt"
	"time"

	"builderstack-backend/internal/database"
)

// SaveGrade persists a GradeResult to tool_grades and updates tools.current_grade.
// It also computes trend by comparing against the most recent previous grade.
// Returns the result with Trend/PreviousScore/ScoreChange filled in.
func SaveGrade(result GradeResult) (GradeResult, error) {
	// Fetch the previous grade for trend tracking
	prev, err := latestGradeForTool(result.ToolID)
	if err != nil {
		return result, fmt.Errorf("fetch previous grade: %w", err)
	}

	// Compute trend
	if prev != nil {
		result.PreviousScore = prev.TotalScore
		result.PreviousGrade = prev.LetterGrade
		result.ScoreChange = result.TotalScore - prev.TotalScore

		switch {
		case result.ScoreChange > 0.5:
			result.Trend = "up"
		case result.ScoreChange < -0.5:
			result.Trend = "down"
		default:
			result.Trend = "stable"
		}
	} else {
		result.Trend = "new"
	}

	// Extract component scores (safe defaults if components slice is short)
	sentimentScore := componentScore(result.Components, "sentiment")
	userCommentsScore := componentScore(result.Components, "user_comments")
	featureMatchScore := componentScore(result.Components, "feature_match")
	pricingScore := componentScore(result.Components, "pricing")

	// For ungraded tools store NULLs for scores so queries can filter them out
	var totalScoreVal interface{} = result.TotalScore
	var gradeVal interface{} = result.LetterGrade
	if result.IsUngraded {
		totalScoreVal = nil
		gradeVal = nil
		sentimentScore = 0
		userCommentsScore = 0
		featureMatchScore = 0
		pricingScore = 0
	}

	insertQ := `
		INSERT INTO tool_grades (
			tool_id,
			sentiment_score, user_comments_score, feature_match_score, pricing_score,
			mention_count, comment_count,
			total_score, grade,
			previous_score, previous_grade, trend, score_change,
			calculated_at
		) VALUES (
			$1,
			$2, $3, $4, $5,
			$6, $7,
			$8, $9,
			$10, $11, $12, $13,
			$14
		)
	`

	var prevScore interface{}
	var prevGrade interface{}
	if prev != nil {
		prevScore = result.PreviousScore
		prevGrade = result.PreviousGrade
	}

	_, err = database.DB.Exec(
		insertQ,
		result.ToolID,
		sentimentScore, userCommentsScore, featureMatchScore, pricingScore,
		result.MentionCount, result.CommentCount,
		totalScoreVal, gradeVal,
		prevScore, prevGrade, result.Trend, result.ScoreChange,
		result.CalculatedAt,
	)
	if err != nil {
		return result, fmt.Errorf("insert tool_grades: %w", err)
	}

	// Update the denormalized columns on the tools table for fast lookups
	if err := UpdateToolGrade(result.ToolID, result.LetterGrade, result.TotalScore, result.IsUngraded); err != nil {
		return result, fmt.Errorf("update tools.current_grade: %w", err)
	}

	return result, nil
}

// UpdateToolGrade writes the current grade and score back to the tools table.
func UpdateToolGrade(toolID int, grade string, score float64, isUngraded bool) error {
	var scoreVal interface{} = score
	var gradeVal interface{} = grade
	if isUngraded {
		scoreVal = nil
		gradeVal = nil
	}

	_, err := database.DB.Exec(`
		UPDATE tools
		SET current_grade = $1, current_score = $2, grade_updated_at = $3
		WHERE id = $4
	`, gradeVal, scoreVal, time.Now(), toolID)

	return err
}

// GetGradeHistory returns all grade snapshots for a tool, newest first.
func GetGradeHistory(toolID int) ([]GradeResult, error) {
	query := `
		SELECT
			tool_id,
			COALESCE(total_score, -1),
			COALESCE(grade, '—'),
			COALESCE(sentiment_score, 0),
			COALESCE(user_comments_score, 0),
			COALESCE(feature_match_score, 0),
			COALESCE(pricing_score, 0),
			mention_count,
			comment_count,
			COALESCE(previous_score, 0),
			COALESCE(previous_grade, ''),
			COALESCE(trend, ''),
			COALESCE(score_change, 0),
			calculated_at
		FROM tool_grades
		WHERE tool_id = $1
		ORDER BY calculated_at DESC
	`

	rows, err := database.DB.Query(query, toolID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []GradeResult
	for rows.Next() {
		var r GradeResult
		var sentScore, commentScore, featureScore, pricingScore float64

		err := rows.Scan(
			&r.ToolID,
			&r.TotalScore,
			&r.LetterGrade,
			&sentScore,
			&commentScore,
			&featureScore,
			&pricingScore,
			&r.MentionCount,
			&r.CommentCount,
			&r.PreviousScore,
			&r.PreviousGrade,
			&r.Trend,
			&r.ScoreChange,
			&r.CalculatedAt,
		)
		if err != nil {
			return nil, err
		}

		r.IsUngraded = r.TotalScore < 0
		r.DataQuality = DataQuality(r.MentionCount)
		r.Components = []GradeComponent{
			{Name: "sentiment", Score: sentScore},
			{Name: "user_comments", Score: commentScore},
			{Name: "feature_match", Score: featureScore},
			{Name: "pricing", Score: pricingScore},
		}

		history = append(history, r)
	}

	return history, nil
}

// latestGradeForTool fetches the most recent tool_grades row for a tool, or nil if none.
func latestGradeForTool(toolID int) (*GradeResult, error) {
	query := `
		SELECT total_score, grade
		FROM tool_grades
		WHERE tool_id = $1
		ORDER BY calculated_at DESC
		LIMIT 1
	`

	var score sql.NullFloat64
	var grade sql.NullString
	err := database.DB.QueryRow(query, toolID).Scan(&score, &grade)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	prev := &GradeResult{}
	if score.Valid {
		prev.TotalScore = score.Float64
	} else {
		prev.TotalScore = -1
	}
	if grade.Valid {
		prev.LetterGrade = grade.String
	} else {
		prev.LetterGrade = "—"
	}

	return prev, nil
}

// componentScore looks up a named component in a slice, returns 0 if not found.
func componentScore(components []GradeComponent, name string) float64 {
	for _, c := range components {
		if c.Name == name {
			return c.Score
		}
	}
	return 0
}
