package router

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	httpSwagger "github.com/swaggo/http-swagger"

	"builderstack-backend/internal/handlers"
)

func Setup() *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Swagger UI - MUST be before other routes
	r.Get("/swagger/*", httpSwagger.WrapHandler)

	// Health check - use exact path, not catch-all
	r.Get("/health", handlers.HomeHandler)

	// API routes
	r.Route("/api", func(r chi.Router) {

		// Tool routes
		r.Route("/tools", func(r chi.Router) {
			r.Get("/", handlers.GetToolsHandler)
			r.Get("/{id}", handlers.GetToolByIDHandler)
			r.Post("/", handlers.CreateToolHandler)
			r.Put("/{id}", handlers.UpdateToolHandler)
			r.Delete("/{id}", handlers.DeleteToolHandler)
		})

		// User routes
		r.Route("/users", func(r chi.Router) {
			r.Get("/", handlers.GetUsersHandler)
		})

	})

	return r
}
