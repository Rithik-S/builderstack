package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func connectDB() {
	connStr := "user=postgres password=12345 dbname=builderstack_db sslmode=disable"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error opening database:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	fmt.Println(DB)
	DB = db
	fmt.Println(DB)
	fmt.Println("Connected to PostgreSQL successfully ")
}
