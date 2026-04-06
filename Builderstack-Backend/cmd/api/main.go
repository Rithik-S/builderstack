package main

import (
	"fmt"
	"net/http"

	_ "builderstack-backend/docs" // This will be generated
	"builderstack-backend/internal/database"
	"builderstack-backend/internal/router"
)

// @title           BuilderStack API
// @version         1.0
// @description     AI-powered software discovery platform API

// @host      localhost:8080
// @BasePath  /api

func main() {
	// Connect to database
	database.Connect()

	// Setup router
	r := router.Setup()

	// Start server
	fmt.Println("Server running on http://localhost:8080")
	fmt.Println("Swagger UI: http://localhost:8080/swagger/")
	http.ListenAndServe(":8080", r)
}
