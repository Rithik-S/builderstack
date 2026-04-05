package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"builderstack-backend/internal/constants"
	"builderstack-backend/internal/models"
	"builderstack-backend/internal/repository"
	"builderstack-backend/internal/utils"
)

// RegisterHandler creates a new user account
// Route: POST /api/auth/register
// @Summary      Register a new user
// @Description  Create a new user account
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        user  body      models.UserRegistration  true  "Registration data"
// @Success      201   {object}  models.User
// @Failure      400   {string}  string  "Invalid input"
// @Failure      409   {string}  string  "Email already exists"
// @Failure      500   {string}  string  "Failed to create user"
// @Router       /auth/register [post]
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// ===== STEP 1: Decode JSON body =====
	var registration models.UserRegistration
	err := json.NewDecoder(r.Body).Decode(&registration)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// ===== STEP 2: Validate input =====
	if registration.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if registration.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}
	if registration.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}
	if len(registration.Password) < 8 {
		http.Error(w, "Password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	// ===== STEP 3: Check if email already exists =====
	existingUser, err := repository.GetUserByEmail(registration.Email)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if existingUser != nil {
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	}

	// ===== STEP 4: Hash the password =====
	hashedPassword, err := utils.HashPassword(registration.Password)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// ===== STEP 5: Create user object =====
	user := &models.User{
		Name:         registration.Name,
		Email:        registration.Email,
		PasswordHash: hashedPassword,
		Role:         constants.RoleUser, // Default role
	}

	// ===== STEP 6: Save to database =====
	err = repository.CreateUser(user)
	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			http.Error(w, "Email already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// ===== STEP 7: Return success =====
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Registration successful",
		"user":    user,
	})
}

// LoginHandler authenticates a user and returns a JWT token
// Route: POST /api/auth/login
// @Summary      Login user
// @Description  Authenticate user and return JWT token in cookie
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        credentials  body      object{email=string,password=string}  true  "Login credentials"
// @Success      200          {object}  object{message=string,user=models.User}
// @Failure      400          {string}  string  "Invalid input"
// @Failure      401          {string}  string  "Invalid credentials"
// @Failure      500          {string}  string  "Server error"
// @Router       /auth/login [post]
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// ===== STEP 1: Decode JSON body =====
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// ===== STEP 2: Validate input =====
	if credentials.Email == "" {
		http.Error(w, "Email is required", http.StatusBadRequest)
		return
	}
	if credentials.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}

	// ===== STEP 3: Find user by email =====
	user, err := repository.GetUserByEmail(credentials.Email)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// ===== STEP 4: Check password =====
	if !utils.CheckPassword(credentials.Password, user.PasswordHash) {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// ===== STEP 5: Generate JWT token =====
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// ===== STEP 6: Set token in HttpOnly cookie =====
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   60 * 60 * 24,
	})

	// ===== STEP 7: Return success =====
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Login successful",
		"user":    user,
	})
}

// LogoutHandler logs out the user by clearing the cookie
// Route: POST /api/auth/logout
// @Summary      Logout user
// @Description  Clear the JWT token cookie
// @Tags         auth
// @Produce      json
// @Success      200  {object}  object{message=string}
// @Router       /auth/logout [post]
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logout successful",
	})
}
