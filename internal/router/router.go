package router

import (
	"net/http"

	"builderstack-backend/internal/handlers"
)

// Setup creates and configures the router with all API routes
//
// Route structure:
//
//	/api
//	├── /tools
//	│   ├── GET  /           - List all tools
//	│   └── GET  /:id        - Get tool by ID
//	└── /users
//	    └── GET  /           - List all users
func Setup() *http.ServeMux {
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/", handlers.HomeHandler)

	// Tool routes
	mux.HandleFunc("/api/tools", handlers.GetToolsHandler)
	mux.HandleFunc("/api/tools/", handlers.GetToolByIDHandler)

	// User routes
	mux.HandleFunc("/api/users", handlers.GetUsersHandler)

	return mux
}
