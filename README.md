# BuilderStack Backend

BuilderStack is an AI-powered platform that helps developers, founders, and builders discover the right software tools for their projects.

## The Problem

Traditional software directories organize tools using broad categories like marketing, design, or development. While this allows users to browse many tools, it often creates:

- **Information overload** — too many options to compare
- **Decision fatigue** — manually searching through long lists
- **Option paralysis** — difficulty choosing the right tool

## The Solution

BuilderStack takes a smarter approach:

1. **Conversational input** — Users describe their requirements naturally
2. **AI-powered analysis** — The system understands the user's needs
3. **Curated recommendations** — Personalized tool suggestions from our directory
4. **Explained choices** — AI-generated descriptions justify why each tool fits

> Transform a cluttered directory into a personalized AI business advisor.

## Tech Stack

- **Language:** Go 1.23
- **Database:** PostgreSQL 15
- **Containerization:** Docker & Docker Compose

## Prerequisites

Before you begin, make sure you have installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Go 1.23+](https://golang.org/dl/) (only needed for local development without Docker)

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Rithik-S/builderstack.git
cd builderstack-backend
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with these values (for local development):
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=builderstack_db
DB_SSLMODE=disable
```

### 3. Start the application
```bash
docker-compose up --build
```

This will:
- Build the Go application
- Start PostgreSQL database
- Start the API server

### 4. Verify it's running

Open your browser and go to:
```
http://localhost:8080
```

You should see: `Server is running`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/tools` | Get all tools |
| GET | `/api/tools/:id` | Get tool by ID |
| GET | `/api/users` | Get all users |

## Available Commands

| Command | Description |
|---------|-------------|
| `make setup` | Start database |
| `make dev` | Run Go server locally |
| `make db-start` | Start database container |
| `make db-stop` | Stop database container |
| `make db-logs` | View database logs |
| `make clean` | Remove all containers and data |

## Project Structure
```
builderstack-backend/
├── main.go              # Entry point & route definitions
├── db.go                # Database connection
├── handler.go           # API request handlers
├── Dockerfile           # Container build instructions
├── docker-compose.yml   # Multi-container orchestration
├── Makefile             # Developer shortcut commands
├── .env.example         # Environment variable template
└── README.md            # Documentation
```

## Running Without Docker

If you prefer to run without Docker:

1. Install PostgreSQL locally
2. Create a database called `builderstack_db`
3. Update `.env` with your database credentials
4. Run:
```bash
go run .
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of a learning exercise in backend development.

##this is a draft PR 
