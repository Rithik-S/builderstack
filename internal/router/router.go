package router

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	httpSwagger "github.com/swaggo/http-swagger"

	"builderstack-backend/internal/handlers"
	customMiddleware "builderstack-backend/internal/middleware"
)

func Setup() *chi.Mux {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Swagger UI
	r.Get("/swagger/*", httpSwagger.WrapHandler)

	// Health check
	r.Get("/health", handlers.HomeHandler)

	// API routes
	r.Route("/api", func(r chi.Router) {

		// ===== PUBLIC ROUTES (No auth required) =====

		// Auth routes
		r.Post("/auth/register", handlers.RegisterHandler)
		r.Post("/auth/login", handlers.LoginHandler)

		// Public tool routes (anyone can view)
		r.Get("/tools", handlers.GetToolsHandler)
		r.Get("/tools/{id}", handlers.GetToolByIDHandler)

		// ===== PRIVATE ROUTES (Auth required) =====
		r.Group(func(r chi.Router) {
			r.Use(customMiddleware.AuthMiddleware)

			// User routes
			r.Get("/users/me", handlers.GetCurrentUserHandler)
			r.Post("/auth/logout", handlers.LogoutHandler)

			// ===== ADMIN ONLY ROUTES =====
			r.Group(func(r chi.Router) {
				r.Use(customMiddleware.AdminMiddleware)

				// Tool management (admin only)
				r.Post("/tools", handlers.CreateToolHandler)
				r.Put("/tools/{id}", handlers.UpdateToolHandler)
				r.Delete("/tools/{id}", handlers.DeleteToolHandler)

				// User management (admin only)
				r.Get("/users", handlers.GetUsersHandler)
			})
		})

	})

	return r
}
