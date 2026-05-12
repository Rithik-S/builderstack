package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"builderstack-backend/internal/grading"
	pkgUtils "builderstack-backend/pkg/utils"
)

// CalculateToolGradeHandler calculates and saves a grade for one tool.
// POST /api/admin/grades/calculate/{toolID}
func CalculateToolGradeHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "toolID")
	toolID, err := strconv.Atoi(idStr)
	if err != nil {
		pkgUtils.Error(w, http.StatusBadRequest, "INVALID_ID", "Tool ID must be an integer")
		return
	}

	calc := grading.NewCalculator(grading.DefaultConfig())

	result, err := calc.CalculateForTool(toolID)
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "GRADE_CALC_FAILED", err.Error())
		return
	}

	result, err = grading.SaveGrade(result)
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "GRADE_SAVE_FAILED", err.Error())
		return
	}

	pkgUtils.JSON(w, http.StatusOK, result)
}

// CalculateAllGradesHandler calculates and saves grades for every tool.
// POST /api/admin/grades/calculate-all
func CalculateAllGradesHandler(w http.ResponseWriter, r *http.Request) {
	calc := grading.NewCalculator(grading.DefaultConfig())

	results, err := calc.CalculateForAllTools()
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "GRADE_CALC_FAILED", err.Error())
		return
	}

	// Save each result and collect a summary
	type summary struct {
		ToolID      int     `json:"tool_id"`
		ToolName    string  `json:"tool_name"`
		Grade       string  `json:"grade"`
		Score       float64 `json:"score"`
		Trend       string  `json:"trend"`
		MentionCount int    `json:"mention_count"`
		DataQuality string  `json:"data_quality"`
		IsUngraded  bool    `json:"is_ungraded"`
		Error       string  `json:"error,omitempty"`
	}

	var summaries []summary
	graded, ungraded := 0, 0

	for _, res := range results {
		saved, err := grading.SaveGrade(res)
		s := summary{
			ToolID:       res.ToolID,
			ToolName:     res.ToolName,
			Grade:        res.LetterGrade,
			Score:        res.TotalScore,
			MentionCount: res.MentionCount,
			DataQuality:  res.DataQuality,
			IsUngraded:   res.IsUngraded,
		}
		if err != nil {
			s.Error = err.Error()
		} else {
			s.Trend = saved.Trend
		}
		if res.IsUngraded {
			ungraded++
		} else {
			graded++
		}
		summaries = append(summaries, s)
	}

	pkgUtils.JSON(w, http.StatusOK, map[string]interface{}{
		"total":    len(summaries),
		"graded":   graded,
		"ungraded": ungraded,
		"results":  summaries,
	})
}

// GetToolGradeHandler returns a tool's current grade — public endpoint.
// GET /api/tools/{id}/grade
func GetToolGradeHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	toolID, err := strconv.Atoi(idStr)
	if err != nil {
		pkgUtils.Error(w, http.StatusBadRequest, "INVALID_ID", "Tool ID must be an integer")
		return
	}

	history, err := grading.GetGradeHistory(toolID)
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch grade")
		return
	}

	if len(history) == 0 {
		pkgUtils.JSON(w, http.StatusOK, map[string]interface{}{
			"tool_id":    toolID,
			"grade":      "—",
			"is_ungraded": true,
			"message":    "No grade calculated yet",
		})
		return
	}

	// Return the most recent grade + full history
	pkgUtils.JSON(w, http.StatusOK, map[string]interface{}{
		"current": history[0],
		"history": history,
	})
}
