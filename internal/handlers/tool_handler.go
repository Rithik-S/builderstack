package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"builderstack-backend/internal/models"
	"builderstack-backend/internal/repository"
)

// HomeHandler returns server status
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Server is running")
}

// GetToolsHandler returns all tools
func GetToolsHandler(w http.ResponseWriter, r *http.Request) {
	tools, err := repository.GetAllTools()
	if err != nil {
		http.Error(w, "Failed to fetch tools", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tools)
}

// GetToolByIDHandler returns a single tool by ID
func GetToolByIDHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid tool ID", http.StatusBadRequest)
		return
	}

	tool, err := repository.GetToolByID(id)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if tool == nil {
		http.Error(w, "Tool not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tool)
}

// CreateToolHandler creates a new tool
func CreateToolHandler(w http.ResponseWriter, r *http.Request) {
	var tool models.Tool

	err := json.NewDecoder(r.Body).Decode(&tool)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Validation
	if tool.Name == "" || tool.Slug == "" || tool.Category == "" {
		http.Error(w, "Name, slug, and category are required", http.StatusBadRequest)
		return
	}

	err = repository.CreateTool(&tool)
	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			http.Error(w, "Tool with this slug already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to create tool", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(tool)
}

// UpdateToolHandler updates an existing tool
func UpdateToolHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid tool ID", http.StatusBadRequest)
		return
	}

	var tool models.Tool
	err = json.NewDecoder(r.Body).Decode(&tool)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Validation
	if tool.Name == "" || tool.Slug == "" || tool.Category == "" {
		http.Error(w, "Name, slug, and category are required", http.StatusBadRequest)
		return
	}

	err = repository.UpdateTool(id, &tool)
	if err == sql.ErrNoRows {
		http.Error(w, "Tool not found", http.StatusNotFound)
		return
	}
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			http.Error(w, "Tool with this slug already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to update tool", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tool)
}

// DeleteToolHandler deletes a tool by ID
func DeleteToolHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid tool ID", http.StatusBadRequest)
		return
	}

	rowsAffected, err := repository.DeleteTool(id)
	if err != nil {
		http.Error(w, "Failed to delete tool", http.StatusInternalServerError)
		return
	}
	if rowsAffected == 0 {
		http.Error(w, "Tool not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Tool deleted successfully",
	})
}
