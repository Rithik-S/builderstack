// Package models defines the data structures used throughout the application.
//
// This file defines the User model which represents a user
// of the BuilderStack platform.
//
// Users can:
// - Browse and search for tools
// - Get AI-powered recommendations
// - Save favorite tools
// - Leave reviews
package models

import "time"

// User represents a platform user
type User struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Never expose in JSON
	Location     string    `json:"location,omitempty"`
	AgeGroup     string    `json:"age_group,omitempty"`
	Profession   string    `json:"profession,omitempty"`
	Gender       string    `json:"gender,omitempty"`
	Role         string    `json:"role"` // "user", "admin"
	CreatedAt    time.Time `json:"created_at"`
}

// UserRegistration contains data needed to register a new user
type UserRegistration struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
