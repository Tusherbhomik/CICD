# HealthSync

A full-stack digital healthcare management platform for doctors, patients, and administrators. Built as a 4th-year capstone project.

**Stack:** Spring Boot 3.2 · React 18 + TypeScript · PostgreSQL 15 · Docker

---

## Features

- **Patients** — book appointments, view prescriptions, manage profile
- **Doctors** — write digital prescriptions, manage patient records, schedule appointments
- **Admins** — manage hospitals, medicine database, admin accounts

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2+ |
| Git | any |

> No Java, Maven, or Node.js needed — everything runs inside Docker.

---

## Quick Start (Docker)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd HealthSync
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```dotenv
# Database
DB_USERNAME=prescription_user
DB_PASSWORD=your_strong_password

# JWT — generate with: openssl rand -hex 32
JWT_SECRET=your_generated_secret

# Gmail SMTP (use App Password, not your main password)
SPRING_MAIL_USERNAME=your_gmail@gmail.com
SPRING_MAIL_PASSWORD=your_16_char_app_password

# Cloudflare R2 (for profile image uploads)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET=healthsync-uploads
R2_PUBLIC_URL=https://pub-XXXX.r2.dev

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

### 3. Build and start

```bash
docker compose up --build
```

The first build takes 3–5 minutes (Maven downloads dependencies). Subsequent starts are fast.

### 4. Open in browser

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:8080/api |
| Database | localhost:5433 |

---

## Load Demo Data (Optional)

After the containers are running, seed the database with demo doctors, patients, admins, hospitals, appointments, and prescriptions:

```bash
docker exec -i prescription_db psql -U prescription_user -d prescription_system < seed_demo.sql
```

Demo credentials are listed in [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md).

---

## Useful Commands

### Start / Stop

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove all data (full reset)
docker compose down -v
```

### Rebuild after code changes

```bash
# Rebuild everything
docker compose up --build

# Rebuild only the frontend
docker compose build frontend && docker compose up -d frontend

# Rebuild only the backend
docker compose build backend && docker compose up -d backend
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database
```

### Database access

```bash
# Open psql shell inside the container
docker exec -it prescription_db psql -U prescription_user -d prescription_system

# Run a SQL file
docker exec -i prescription_db psql -U prescription_user -d prescription_system < your_file.sql
```

### Container status

```bash
docker compose ps
```

---

## Local Development (Without Docker)

### Backend

Requires Java 17 and Maven 3.9.

```bash
cd Backend

# Run with H2 in-memory database (no setup needed)
mvn spring-boot:run

# Run with PostgreSQL (set env vars first)
export JWT_SECRET=$(openssl rand -hex 32)
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/prescription_system
export SPRING_DATASOURCE_USERNAME=your_user
export SPRING_DATASOURCE_PASSWORD=your_password
mvn spring-boot:run
```

Backend starts at: http://localhost:8080/api

### Frontend

Requires Node.js 18+.

```bash
cd Frontend

# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
```

Frontend starts at: http://localhost:5173

### Build for production

```bash
cd Frontend
npm run build      # outputs to Frontend/dist/
```

---

## Project Structure

```
HealthSync/
├── Backend/                  # Spring Boot application
│   ├── src/main/java/
│   │   └── com/prescription/
│   │       ├── config/       # Security, CORS, R2 storage config
│   │       ├── controller/   # REST API controllers
│   │       ├── model/        # JPA entities
│   │       ├── repository/   # Spring Data JPA repositories
│   │       └── service/      # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── Dockerfile            # Multi-stage Maven build
│
├── Frontend/                 # React + TypeScript application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/
│   │   │   ├── admin/        # Admin dashboard & management
│   │   │   ├── auth/         # Login, signup pages
│   │   │   ├── doctor/       # Doctor portal
│   │   │   └── patient/      # Patient portal
│   │   └── index.css
│   ├── Dockerfile            # Nginx static build
│   └── nginx.conf
│
├── docker-compose.yml        # Service orchestration
├── .env.example              # Environment variable template
├── seed_demo.sql             # Demo data for all features
├── DEMO_CREDENTIALS.md       # Test login credentials
└── README.md
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_USERNAME` | Yes | PostgreSQL username |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `SPRING_MAIL_USERNAME` | Yes | Gmail address for email notifications |
| `SPRING_MAIL_PASSWORD` | Yes | Gmail App Password (16 chars) |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Yes | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Yes | Cloudflare R2 secret key |
| `R2_BUCKET` | Yes | R2 bucket name |
| `R2_PUBLIC_URL` | Yes | R2 public URL (e.g. `https://pub-xxx.r2.dev`) |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated allowed origins (default: localhost) |

### Generate a JWT secret

```bash
openssl rand -hex 32
```

### Get a Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → App Passwords
3. Create a password for "Mail" — copy the 16-character code

### Set up Cloudflare R2

1. [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → Create bucket
2. R2 → Manage R2 API Tokens → Create token with **Object Read & Write**
3. Enable **Public access** on the bucket to get `R2_PUBLIC_URL`

---

## Portals

| Portal | URL | Login with |
|--------|-----|------------|
| Patient / Doctor | http://localhost:3001/login | Email + password, select role |
| Admin | http://localhost:3001/admin/login | Admin email + password |

---

## Troubleshooting

**Backend won't start — "JWT_SECRET not set"**
Make sure `.env` exists and `JWT_SECRET` is filled in.

**Frontend shows blank page or API errors**
Check that the backend is healthy: `docker compose ps`. Backend takes ~60s to start.

**Database connection refused**
The database port is mapped to `5433` (not the default 5432) to avoid conflicts with a local PostgreSQL installation.

**Port already in use**
```bash
# Check what is using the port
sudo lsof -i :3001
sudo lsof -i :8080
```

**Full reset (delete all data)**
```bash
docker compose down -v
docker compose up --build
```
