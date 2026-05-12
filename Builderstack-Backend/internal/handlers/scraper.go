package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	scraperRepo "builderstack-backend/internal/scraper/repository"
	scraperSvc "builderstack-backend/internal/scraper/service"
	pkgUtils "builderstack-backend/pkg/utils"
)

// RunFullScrapeHandler triggers a full scrape across all tools in the DB
// POST /api/admin/scraper/run
func RunFullScrapeHandler(w http.ResponseWriter, r *http.Request) {
	svc, err := scraperSvc.NewScraperService()
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "SCRAPER_INIT_FAILED", err.Error())
		return
	}

	results, err := svc.RunFullScrape("manual")
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "SCRAPE_FAILED", err.Error())
		return
	}

	// Build a summary response
	type summary struct {
		Tool       string   `json:"tool"`
		Found      int      `json:"items_found"`
		Saved      int      `json:"items_saved"`
		Errors     []string `json:"errors,omitempty"`
		DurationMs int64    `json:"duration_ms"`
	}

	var summaries []summary
	for _, r := range results {
		summaries = append(summaries, summary{
			Tool:       r.Source,
			Found:      r.ItemsFound,
			Saved:      r.ItemsNew,
			Errors:     r.Errors,
			DurationMs: r.Duration.Milliseconds(),
		})
	}

	pkgUtils.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "Full scrape complete",
		"results": summaries,
	})
}

// RunToolScrapeHandler triggers a scrape for a specific tool by name
// POST /api/admin/scraper/tool/{name}
func RunToolScrapeHandler(w http.ResponseWriter, r *http.Request) {
	toolName := chi.URLParam(r, "name")
	if toolName == "" {
		pkgUtils.Error(w, http.StatusBadRequest, "MISSING_TOOL_NAME", "Tool name is required")
		return
	}

	svc, err := scraperSvc.NewScraperService()
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "SCRAPER_INIT_FAILED", err.Error())
		return
	}

	result, err := svc.RunToolScrape(toolName, "manual")
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "SCRAPE_FAILED", err.Error())
		return
	}

	pkgUtils.JSON(w, http.StatusOK, map[string]interface{}{
		"tool":        toolName,
		"items_found": result.ItemsFound,
		"items_saved": result.ItemsNew,
		"errors":      result.Errors,
		"duration_ms": result.Duration.Milliseconds(),
	})
}

// GetScrapeLogsHandler returns recent scrape logs
// GET /api/admin/scraper/logs?limit=50
func GetScrapeLogsHandler(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	logs, err := scraperRepo.GetRecentScrapeLogs(limit)
	if err != nil {
		pkgUtils.Error(w, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch scrape logs")
		return
	}

	// Return empty array instead of null when no logs exist
	if logs == nil {
		logs = []scraperRepo.ScrapeLog{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}
