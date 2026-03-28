package main

import (
	"fmt"
	"net/http"
)

func main() {
	connectDB()

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/api/tools", getToolsHandler)
	http.HandleFunc("/api/users", getUserHandler)
	http.HandleFunc("/api/tools/", getToolByIDHandler)

	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
