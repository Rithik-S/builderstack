package main

import (
	"fmt"
	"net/http"
)

func main() {
	connectDB()

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/api/tools", getToolsHandler)

	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
