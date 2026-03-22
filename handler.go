package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Tool struct {
	ID               int     `json:"id"`
	Name             string  `json:"name"`
	Slug             string  `json:"slug"`
	ShortDescription string  `json:"short_description"`
	Category         string  `json:"category"`
	PricingModel     string  `json:"pricing_model"`
	BudgetLevel      string  `json:"budget_level"`
	Rating           float64 `json:"rating"`
	ActiveUsersCount int     `json:"active_users_count"`
	SupportedOS      string  `json:"supported_os"`
	WebsiteLink      string  `json:"website_link"`
	AffiliateLink    string  `json:"affiliate_link"`
	IsSponsored      bool    `json:"is_sponsored"`
	LaunchedYear     int     `json:"launched_year"`
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Server is running")
}

func getToolsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query(`
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

	var tools []Tool

	for rows.Next() {
		var tool Tool

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
