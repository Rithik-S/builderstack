package repository

import (
	"database/sql"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/models"
)

// CreateUser inserts a new user into the database
func CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (name, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	err := database.DB.QueryRow(
		query,
		user.Name,
		user.Email,
		user.PasswordHash,
		user.Role,
	).Scan(&user.ID, &user.CreatedAt)

	return err
}

// GetUserByEmail finds a user by email
func GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	var location, ageGroup, profession, gender sql.NullString

	query := `
		SELECT id, name, email, password_hash, location, age_group,
		       profession, gender, role, created_at
		FROM users
		WHERE email = $1
	`

	err := database.DB.QueryRow(query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&location,
		&ageGroup,
		&profession,
		&gender,
		&user.Role,
		&user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Convert NullString to string
	user.Location = location.String
	user.AgeGroup = ageGroup.String
	user.Profession = profession.String
	user.Gender = gender.String

	return &user, nil
}

// GetUserByID finds a user by ID
func GetUserByID(id int) (*models.User, error) {
	var user models.User
	var location, ageGroup, profession, gender sql.NullString

	query := `
		SELECT id, name, email, password_hash, location, age_group,
		       profession, gender, role, created_at
		FROM users
		WHERE id = $1
	`

	err := database.DB.QueryRow(query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&location,
		&ageGroup,
		&profession,
		&gender,
		&user.Role,
		&user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Convert NullString to string
	user.Location = location.String
	user.AgeGroup = ageGroup.String
	user.Profession = profession.String
	user.Gender = gender.String

	return &user, nil
}
