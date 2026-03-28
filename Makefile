# Database commands
db-start:
	docker-compose up -d

db-stop:
	docker-compose down

db-restart:
	docker-compose down && docker-compose up -d

db-logs:
	docker-compose logs -f

# Development
dev:
	go run .

# Setup (first time)
setup:
	docker-compose up -d
	@echo "Waiting for database to be ready..."
	@sleep 3
	@echo "Database is ready! Run 'make dev' to start the server."

# Clean everything (removes all data!)
clean:
	docker-compose down -v

# Help
help:
	@echo "Available commands:"
	@echo "  make setup      - Start database (first time)"
	@echo "  make dev        - Run the Go server"
	@echo "  make db-start   - Start database"
	@echo "  make db-stop    - Stop database"
	@echo "  make db-restart - Restart database"
	@echo "  make db-logs    - View database logs"
	@echo "  make clean      - Remove everything (including data)"