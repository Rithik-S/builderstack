package main

import (
	"fmt"
	"net/http"

	"builderstack-backend/internal/database"
	"builderstack-backend/internal/router"
)

func main() {
	// Connect to database
	database.Connect()

	// Setup routes
	r := router.Setup()

	// Start server
	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", r)
}
