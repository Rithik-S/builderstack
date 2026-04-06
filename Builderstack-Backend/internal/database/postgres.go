// Establishes PostgreSQL connection using environment variables from .env file or system environment variables. It uses the "github.com/joho/godotenv" package to load the .env file and the "github.com/lib/pq" package as the PostgreSQL driver. The connection string is constructed using the environment variables, and the connection is tested with db.Ping(). If successful, the DB variable is set to the established connection.
package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	err := godotenv.Load()
	if err != nil {
		log.Println(".env file not found, using system environment variables")
	}

	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbSSLMode := os.Getenv("DB_SSLMODE")

	if dbHost == "" {
		dbHost = "localhost"
	}

	connStr := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost,
		dbUser,
		dbPassword,
		dbName,
		dbSSLMode,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error opening database:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	DB = db
	fmt.Println("Connected to PostgreSQL successfully")
}
