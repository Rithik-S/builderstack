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
// @Summary      Health check
// @Description  Returns server running status
// @Tags         health
// @Produce      plain
// @Success      200  {string}  string  "Server is running"
// @Router       / [get]
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Server is running")
}

// GetToolsHandler returns all tools
// @Summary      List all tools
// @Description  Get all tools from the database
// @Tags         tools
// @Produce      json
// @Success      200  {array}   models.Tool
// @Failure      500  {string}  string  "Failed to fetch tools"
// @Router       /tools [get]
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
// @Summary      Get tool by ID
// @Description  Get a single tool by its ID
// @Tags         tools
// @Produce      json
// @Param        id   path      int  true  "Tool ID"
// @Success      200  {object}  models.Tool
// @Failure      400  {string}  string  "Invalid tool ID"
// @Failure      404  {string}  string  "Tool not found"
// @Failure      500  {string}  string  "Database error"
// @Router       /tools/{id} [get]
func GetToolByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
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
// @Summary      Create a tool
// @Description  Create a new tool in the database
// @Tags         tools
// @Accept       json
// @Produce      json
// @Param        tool  body      models.Tool  true  "Tool to create"
// @Success      201   {object}  models.Tool
// @Failure      400   {string}  string  "Invalid JSON or missing required fields"
// @Failure      500   {string}  string  "Failed to create tool"
// @Router       /tools [post]
func CreateToolHandler(w http.ResponseWriter, r *http.Request) {
	var tool models.Tool

	err := json.NewDecoder(r.Body).Decode(&tool)
	if err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if tool.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if tool.Slug == "" {
		http.Error(w, "Slug is required", http.StatusBadRequest)
		return
	}
	if tool.Category == "" {
		http.Error(w, "Category is required", http.StatusBadRequest)
		return
	}

	err = repository.CreateTool(&tool)
	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			http.Error(w, "Tool with this slug already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to create tool: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(tool)
}

// UpdateToolHandler updates an existing tool
// @Summary      Update a tool
// @Description  Update a tool by its ID
// @Tags         tools
// @Accept       json
// @Produce      json
// @Param        id    path      int          true  "Tool ID"
// @Param        tool  body      models.Tool  true  "Updated tool data"
// @Success      200   {object}  models.Tool
// @Failure      400   {string}  string  "Invalid ID or JSON"
// @Failure      404   {string}  string  "Tool not found"
// @Failure      409   {string}  string  "Slug already exists"
// @Failure      500   {string}  string  "Failed to update tool"
// @Router       /tools/{id} [put]
func UpdateToolHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
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

	if tool.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if tool.Slug == "" {
		http.Error(w, "Slug is required", http.StatusBadRequest)
		return
	}
	if tool.Category == "" {
		http.Error(w, "Category is required", http.StatusBadRequest)
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
		http.Error(w, "Failed to update tool: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tool)
}

// DeleteToolHandler deletes a tool by ID
// @Summary      Delete a tool
// @Description  Delete a tool by its ID
// @Tags         tools
// @Produce      json
// @Param        id   path      int     true  "Tool ID"
// @Success      200  {object}  object  "Tool deleted successfully"
// @Failure      400  {string}  string  "Invalid tool ID"
// @Failure      404  {string}  string  "Tool not found"
// @Failure      500  {string}  string  "Failed to delete tool"
// @Router       /tools/{id} [delete]
func DeleteToolHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid tool ID", http.StatusBadRequest)
		return
	}

	deleted, err := repository.DeleteTool(id)
	if err != nil {
		http.Error(w, "Failed to delete tool", http.StatusInternalServerError)
		return
	}
	if !deleted {
		http.Error(w, "Tool not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Tool deleted successfully",
	})
}
