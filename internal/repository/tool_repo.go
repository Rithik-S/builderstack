package repository

import (
	"database/sql"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/models"
)

// GetAllTools returns all tools from database
func GetAllTools() ([]models.Tool, error) {
	query := `
		SELECT id, name, slug, short_description, category,
		       pricing_model, budget_level, rating, active_users_count,
		       supported_os, website_link, affiliate_link,
		       is_sponsored, launched_year
		FROM tools
	`

	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
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
			return nil, err
		}
		tools = append(tools, tool)
	}

	return tools, nil
}

// GetToolByID returns a single tool by ID
func GetToolByID(id int) (*models.Tool, error) {
	query := `
		SELECT id, name, slug, short_description, category,
		       pricing_model, budget_level, rating, active_users_count,
		       supported_os, website_link, affiliate_link,
		       is_sponsored, launched_year
		FROM tools
		WHERE id = $1
	`

	var tool models.Tool
	err := database.DB.QueryRow(query, id).Scan(
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
		return nil, nil // Not found
	}
	if err != nil {
		return nil, err
	}

	return &tool, nil
}

// CreateTool inserts a new tool and returns the ID
func CreateTool(tool *models.Tool) error {
	query := `
		INSERT INTO tools (
			name, slug, short_description, category,
			pricing_model, budget_level, rating, active_users_count,
			supported_os, website_link, affiliate_link,
			is_sponsored, launched_year
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id
	`

	err := database.DB.QueryRow(
		query,
		tool.Name,
		tool.Slug,
		tool.ShortDescription,
		tool.Category,
		tool.PricingModel,
		tool.BudgetLevel,
		tool.Rating,
		tool.ActiveUsersCount,
		tool.SupportedOS,
		tool.WebsiteLink,
		tool.AffiliateLink,
		tool.IsSponsored,
		tool.LaunchedYear,
	).Scan(&tool.ID)

	return err
}

// UpdateTool updates an existing tool
func UpdateTool(id int, tool *models.Tool) error {
	query := `
		UPDATE tools
		SET name = $1,
		    slug = $2,
		    short_description = $3,
		    category = $4,
		    pricing_model = $5,
		    budget_level = $6,
		    rating = $7,
		    active_users_count = $8,
		    supported_os = $9,
		    website_link = $10,
		    affiliate_link = $11,
		    is_sponsored = $12,
		    launched_year = $13
		WHERE id = $14
		RETURNING id
	`

	err := database.DB.QueryRow(
		query,
		tool.Name,
		tool.Slug,
		tool.ShortDescription,
		tool.Category,
		tool.PricingModel,
		tool.BudgetLevel,
		tool.Rating,
		tool.ActiveUsersCount,
		tool.SupportedOS,
		tool.WebsiteLink,
		tool.AffiliateLink,
		tool.IsSponsored,
		tool.LaunchedYear,
		id,
	).Scan(&tool.ID)

	return err
}

// DeleteTool removes a tool by ID
func DeleteTool(id int) (bool, error) {
	result, err := database.DB.Exec("DELETE FROM tools WHERE id = $1", id)
	if err != nil {
		return false, err
	}

	rowsAffected, _ := result.RowsAffected()
	return rowsAffected > 0, nil
}
