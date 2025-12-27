# Multi-Tenant SaaS Project & Task Management System

A production-ready Full-Stack SaaS application featuring data isolation, subscription management, and role-based access control.

## 🚀 Quick Start
To launch the entire platform (Database, Backend, Frontend), run:
```bash
docker-compose up -d
```
## 🏗 System Architecture
The application uses a Shared Database, Shared Schema architecture. Every record is isolated using a mandatory tenant_id.

Frontend: React (Port 3000)

Backend: Express.js (Port 5000)

Database: PostgreSQL 15 (Port 5432)

## 🔑 Key Features
Multi-Tenancy: Each organization has its own subdomain and isolated data.

RBAC: Roles for Super Admin, Tenant Admin, and Users.

Subscription Limits: - Free: 5 Users / 3 Projects

Pro: 25 Users / 15 Projects

Enterprise: 100 Users / 50 Projects

Automatic Initialization: Database migrations and seed data load automatically via Docker.

## 🛠 API Documentation
Health Check: GET /api/health

Auth: POST /api/auth/register-tenant, POST /api/auth/login, GET /api/auth/me

Projects: GET /api/projects, POST /api/projects

Tasks: POST /api/projects/:projectId/tasks, PATCH /api/tasks/:taskId/status

## 🧪 Testing the Multi-Tenancy
Log in as Demo Tenant:

Subdomain: demo

Email: admin@demo.com

Password: Demo@123

Attempt Data Leak: Try accessing a project ID belonging to another tenant; the system will return a 403 Forbidden.

Plan Limits: Try creating more than 15 projects on the 'Pro' plan to see the limit enforcement.

Submission Date: Dec 27, 2025 Difficulty: Hard

---

### Final Summary Checklist
Before you hit "Submit" on your challenge portal, double-check these mandatory items:
1.  **Ports:** Backend is on `5000`, Frontend is on `3000`, DB is on `5432`.
2.  **Docker Names:** Services are named `backend`, `frontend`, and `database`.
3.  **Environment:** Your `.env` or environment variables are inside the `docker-compose.yml` so the evaluator's script can read them.
4.  **Health Check:** `http://localhost:5000/api/health` works.
5.  **Docs Folder:** Contains all 4 markdown files we created in Step 1.

---

**You have successfully completed the challenge!**
