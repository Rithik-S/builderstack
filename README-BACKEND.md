# BuilderStack - No-Code Adviser

An AI-powered platform that helps users discover the right no-code tools for their projects. Describe what you want to build, and we'll recommend the best tools.

---

## 🎯 Problem → Solution

**Problem:** Traditional directories create information overload and decision fatigue.

**Solution:** Conversational AI that understands your needs and recommends curated tools.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go 1.23, Chi Router |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Database | PostgreSQL 15 |
| Auth | JWT (HttpOnly cookies) |
| DevOps | Docker & Docker Compose |

---

## 🚀 Quick Start
```bash
# Clone
git clone https://github.com/Rithik-S/builderstack.git
cd builderstack-project

# Start everything
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Database | localhost:5432 |

---

## 📁 Project Structure
builderstack-project/
├── docker-compose.yml          # Runs everything
├── .env                        # Environment variables
├── builderstack-backend/       # Go API
│   ├── cmd/api/main.go
│   ├── internal/
│   └── Dockerfile
└── builderstack-frontend/      # Next.js app
├── src/app/
├── src/components/
└── Dockerfile

---

## 📡 API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/auth/logout` | Yes |
| GET | `/api/users/me` | Yes |
| GET | `/api/tools` | No |
| POST | `/api/tools` | Admin |

---

## ⚙️ Commands

| Command | Description |
|---------|-------------|
| `docker-compose up --build` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View logs |

---

## 👤 Author

**Rithik S** - [@Rithik-S](https://github.com/Rithik-S)