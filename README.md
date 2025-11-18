# Hostio Backend

**Hostio** is a smart job-matching platform tailored for the hospitality industry. This repository contains the backend services that power core functionalities such as user authentication, job management, company onboarding, application tracking, real-time scheduling, and premium plan integration.

---

## 📌 Project Overview

The backend is built with **Node.js** and **Express**, using **PostgreSQL** as the database and **Sequelize** as the ORM. It provides a RESTful API with role-based access for job seekers, companies, and admins. The system also integrates with external services including Google Calendar, Cloudinary, Stripe, and email services.

---

## ✅ Core Features

- OTP-secured user and company registration
- Role-based authentication and session management (Job Seeker, Company, Admin)
- Job creation, listing, and filtering
- CV and document upload via Cloudinary
- Company profile and media management
- Demo scheduling via Google Calendar API
- Stripe integration for premium plan purchases
- Admin verification and controls

---

## 🧱 Technology Stack

| Layer         | Tools                                      |
|--------------|--------------------------------------------|
| Runtime       | Node.js, Express.js                        |
| Database      | PostgreSQL + Sequelize ORM                |
| Auth          | JWT, OTP via Email                         |
| File Uploads  | Cloudinary API                             |
| Scheduling    | Google Calendar API                        |
| Payments      | Stripe API                                 |
| Utilities     | dotenv, bcrypt, nodemailer, axios          |

---

## 🚀 Getting Started

Follow these steps to set up and run the Hostio backend locally.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/NourHamdach/hostio_project.git
cd hostio_project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

1. **Start PostgreSQL** service on your machine
2. **Create a new database**:

```sql
CREATE DATABASE hostio;
```

3. **Create a database user** (optional but recommended):

```sql
CREATE USER hostio_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hostio TO hostio_user;
```

### 4. Configure Environment Variables

1. **Copy the example environment file**:

```bash
cp .env.example .env
```

2. **Edit the `.env` file** and configure the following variables:

#### Required Configuration

```env
# Database
DB_NAME=hostio
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=127.0.0.1
DB_DIALECT=postgres

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
PORT=3001

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

#### Optional Services (Required for Full Functionality)

**Cloudinary** (for file uploads):
```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```
Sign up at [cloudinary.com](https://cloudinary.com/)

**Stripe** (for payments):
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```
Get keys at [stripe.com/dashboard](https://dashboard.stripe.com/)

**Google OAuth** (for Google login and Calendar):
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```
Set up at [Google Cloud Console](https://console.cloud.google.com/)

**Email Service** (for OTP and notifications):
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@hostio.com
```

### 5. Run Database Migrations

The migrations will create all necessary tables in your PostgreSQL database:

```bash
npx sequelize-cli db:migrate
```

### 6. Seed the Database (Optional)

Populate the database with initial data:

```bash
npx sequelize-cli db:seed:all
```

### 7. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the PORT specified in your `.env` file).

You should see output similar to:
```
🚀 Starting Hostio Backend Server...
📊 Environment: development
🔧 Port: 3001
✅ Database connection established successfully
✅ Server running successfully on port 3001
🌐 Backend URL: http://localhost:3001
🎯 Frontend URL: http://localhost:3000
```

---

## 📁 Project Structure

```
hostio_project/
├── config/              # Configuration files (database, cloudinary, etc.)
├── controllers/         # Route controllers (business logic)
├── middleware/          # Express middleware (auth, uploads, etc.)
├── migrations/          # Database migration files
├── models/              # Sequelize models (database schemas)
├── routes/              # API route definitions
├── seeders/             # Database seed files
├── services/            # External service integrations (email, calendar)
├── utils/               # Utility functions and helpers
├── app.js               # Express app configuration
├── server.js            # Server entry point
├── package.json         # Dependencies and scripts
└── .env.example         # Environment variables template
```

---

## 🔌 API Endpoints

Once the server is running, you can access the API at `http://localhost:3001/api`

### Main API Routes

| Route                  | Description                        |
|------------------------|------------------------------------|
| `/api/auth`            | Authentication & registration      |
| `/api/users`           | User management                    |
| `/api/jobseekers`      | Job seeker profiles                |
| `/api/companies`       | Company profiles                   |
| `/api/jobs`            | Job listings                       |
| `/api/applications`    | Job applications                   |
| `/api/posts`           | Social posts                       |
| `/api/stripe`          | Payment processing                 |
| `/api/admin`           | Admin operations                   |

### Testing the API

You can test the API using tools like:
- [Postman](https://www.postman.com/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)
- [curl](https://curl.se/)

Example health check:
```bash
curl http://localhost:3001/api/health
```

---

## 🐳 Docker Setup (Alternative)

If you prefer using Docker:

1. **Build and start the containers**:
```bash
docker-compose up --build
```

2. **Run migrations inside the container**:
```bash
docker-compose exec app npx sequelize-cli db:migrate
```

3. **Access the application**:
- Backend: `http://localhost:3001`

---

## 🛠️ Available Scripts

| Command              | Description                           |
|----------------------|---------------------------------------|
| `npm run dev`        | Start development server with nodemon |
| `npm test`           | Run tests (not yet configured)        |

### Sequelize CLI Commands

| Command                              | Description                    |
|--------------------------------------|--------------------------------|
| `npx sequelize-cli db:migrate`       | Run all pending migrations     |
| `npx sequelize-cli db:migrate:undo`  | Undo last migration            |
| `npx sequelize-cli db:seed:all`      | Run all seeders                |
| `npx sequelize-cli db:seed:undo:all`| Undo all seeders               |

---

## 🔐 Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files** to version control
2. **Change default secrets** in production environments
3. **Use strong passwords** for database and JWT secrets
4. **Rotate API keys regularly** for external services
5. **Enable HTTPS** in production
6. **Keep dependencies updated**: Run `npm audit` regularly

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running: `sudo service postgresql start` (Linux) or check Services (Windows)
- Verify database credentials in `.env` file
- Check if the database exists: `psql -U postgres -l`

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3001
```
- Change the PORT in `.env` file
- Or kill the process using the port: `lsof -ti:3001 | xargs kill` (Mac/Linux)

**Migration Errors**
```
ERROR: relation "Users" does not exist
```
- Ensure migrations have been run: `npx sequelize-cli db:migrate`
- Check database connection and credentials

**Missing Environment Variables**
```
Error: JWT_SECRET is not defined
```
- Copy `.env.example` to `.env`
- Fill in all required environment variables

---





