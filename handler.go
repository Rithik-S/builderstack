package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
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

type User struct {
	ID           int            `json:"id"`
	Name         string         `json:"name"`
	Email        string         `json:"email"`
	PasswordHash string         `json:"password_hash"`
	Location     sql.NullString `json:"location"`
	AgeGroup     sql.NullString `json:"age_group"`
	Profession   sql.NullString `json:"profession"`
	Gender       sql.NullString `json:"gender"`
	Role         string         `json:"role"`
	CreatedAt    string         `json:"created_at"`
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

func getUserHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query(`
		SELECT id, name, email, password_hash, location,
		       age_group, profession, gender, role, created_at
		FROM users
	`)
	if err != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User

	for rows.Next() {
		var user User

		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.PasswordHash,
			&user.Location,
			&user.AgeGroup,
			&user.Profession,
			&user.Gender,
			&user.Role,
			&user.CreatedAt,
		)

		if err != nil {
			fmt.Println(err)
			http.Error(w, "Error reading data", http.StatusInternalServerError)
			return
		}

		users = append(users, user)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func getToolByIDHandler(w http.ResponseWriter, r *http.Request) {
	// Step 1: Extract the ID from the URL
	// URL looks like: /api/tools/42
	// We need to get "42" out of it

	path := r.URL.Path      // "/api/tools/42"
	prefix := "/api/tools/" // The part we know

	if !strings.HasPrefix(path, prefix) { // Safety check
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	idStr := strings.TrimPrefix(path, prefix) // "42" (as a string)

	// Step 2: Convert string "42" to integer 42
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid tool ID", http.StatusBadRequest)
		return
	}

	// Step 3: Query the database for ONE tool
	var tool Tool

	err = DB.QueryRow(`
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

	// Step 4: Handle "not found" case
	if err == sql.ErrNoRows {
		http.Error(w, "Tool not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Step 5: Return the tool as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tool)
}
