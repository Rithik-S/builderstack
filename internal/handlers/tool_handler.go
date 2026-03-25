//Handles all /api/tools endpoints (list, get by ID) and returns JSON responses

package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/models"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Server is running")
}

func GetToolsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT id, name, slug, short_description, category,
		       pricing_model, budget_level, rating, active_users_count,
		       supported_os, website_link, affiliate_link,
		       is_sponsored, launched_year
		FROM tools
	`)
	if err != nil {
		http.Error(w, "Failed to fetch tools", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tools []models.Tool

	for rows.Next() {
		var tool models.Tool

		err := rows.Scan(
			&tool.ID,
			&tool.Name,
			&tool.Slug,
			&tool.ShortDescription,
			&tool.Category,
			&tool.PricingModel,
			&tool.BudgetLevel,
			&tool.Rating,
			&tool.ActiveUsersCount,
			&tool.SupportedOS,
			&tool.WebsiteLink,
			&tool.AffiliateLink,
			&tool.IsSponsored,
			&tool.LaunchedYear,
		)
		if err != nil {
			http.Error(w, "Error reading data", http.StatusInternalServerError)
			return
		}

		tools = append(tools, tool)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tools)
}

func GetToolByIDHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	prefix := "/api/tools/"

	if !strings.HasPrefix(path, prefix) {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	idStr := strings.TrimPrefix(path, prefix)
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid tool ID", http.StatusBadRequest)
		return
	}

	var tool models.Tool

	err = database.DB.QueryRow(`
		SELECT id, name, slug, short_description, category,
		       pricing_model, budget_level, rating, active_users_count,
		       supported_os, website_link, affiliate_link,
		       is_sponsored, launched_year
		FROM tools
		WHERE id = $1
	`, id).Scan(
		&tool.ID,
		&tool.Name,
		&tool.Slug,
		&tool.ShortDescription,
		&tool.Category,
		&tool.PricingModel,
		&tool.BudgetLevel,
		&tool.Rating,
		&tool.ActiveUsersCount,
		&tool.SupportedOS,
		&tool.WebsiteLink,
		&tool.AffiliateLink,
		&tool.IsSponsored,
		&tool.LaunchedYear,
	)

	if err == sql.ErrNoRows {
		http.Error(w, "Tool not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tool)
}
