# Architecture Document

## 1. Database Schema (ERD)
* **Tenants:** `id, name, subdomain, plan, max_users, max_projects`
* **Users:** `id, tenant_id, email, password, role` (Unique: tenant_id + email)
* **Projects:** `id, tenant_id, name, status`
* **Tasks:** `id, tenant_id, project_id, title, assigned_to`
* **AuditLogs:** `id, tenant_id, action, entity_id`

## 2. API Architecture
* **Auth Module:** `/api/auth/register-tenant`, `/login`, `/me`
* **Tenant Module:** `/api/tenants` (CRUD)
* **User Module:** `/api/users` (CRUD)
* **Project Module:** `/api/projects` (CRUD)
* **Task Module:** `/api/tasks` (CRUD)

All endpoints (except login/register) require `Authorization: Bearer <token>`.
