# Hostio Backend

**Hostio** is a smart job-matching platform tailored for the hospitality industry. This repository contains the backend services that power core functionalities such as user authentication, job management, company onboarding, application tracking, real-time scheduling, and premium plan integration.

---

## 📌 Project Overview

The backend is built with **Node.js** and **Express**, using **PostgreSQL** as the database and **Sequelize** as the ORM. It provides a RESTful API with role-based access for job seekers, companies, and admins. The system also integrates with external services including Google Calendar, Cloudinary, Stripe, and Mailtrap.

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
| Auth          | JWT, OTP via Email (Mailtrap SMTP)        |
| File Uploads  | Cloudinary API                             |
| Scheduling    | Google Calendar API                        |
| Payments      | Stripe API                                 |
| Utilities     | dotenv, bcrypt, nodemailer, axios          |


