// Package models defines the data structures used throughout the application.
//
// This file defines the Tool model which represents a software tool
// in the BuilderStack directory.
//
// Tools have attributes like:
// - Name, description, category
// - Pricing model (free, freemium, paid)
// - Ratings and user counts
// - AI-generated recommendations
package models

// Tool represents a software tool in the directory
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

// ToolFilter contains filtering options for tool search
type ToolFilter struct {
	Category     string
	PricingModel string
	BudgetLevel  string
	MinRating    float64
}
