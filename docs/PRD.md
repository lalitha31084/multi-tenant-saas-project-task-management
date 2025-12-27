# Product Requirements Document (PRD)

## 1. User Personas
1.  **Super Admin:** System owner. Manages tenants and subscription plans.
2.  **Tenant Admin:** CEO/Manager of a company. Manages their users and projects.
3.  **End User:** Employee. Can view projects and complete tasks.

## 2. Functional Requirements
* **FR-001 (Auth):** The system shall allow tenants to register with a unique subdomain.
* **FR-002 (Auth):** The system shall authenticate users via JWT with 24h expiry.
* **FR-003 (Tenant):** The system shall limit users/projects based on Subscription Plan.
* **FR-004 (Tenant):** The system shall isolate data so Tenant A cannot see Tenant B's data.
* **FR-005 (User):** Tenant Admins shall be able to add/delete users.
* **FR-006 (Project):** Users shall be able to create projects.
* **FR-007 (Task):** Users shall be able to assign tasks to team members.
* **FR-008 (Task):** Users shall be able to update task status (Todo/In Progress/Done).
* **FR-009 (Audit):** The system shall log critical actions (Login, Delete) to Audit Logs.
* **FR-010 (Admin):** Super Admin shall be able to view all tenants.
* **FR-011 (API):** APIs must return standard JSON response format.
* **FR-012 (UI):** Frontend must hide "Admin" buttons for regular users.
* **FR-013 (UI):** Dashboard must show stats (Total Users, Total Projects).
* **FR-014 (System):** System must support "Soft Delete" or Cascade Delete.
* **FR-015 (Search):** Users shall be able to search for tasks by title.

## 3. Non-Functional Requirements
1.  **Security:** All passwords must be hashed using bcrypt.
2.  **Performance:** API response time under 200ms.
3.  **Scalability:** Support 100+ concurrent users via Node.js async architecture.
4.  **Availability:** Dockerized services must restart automatically on failure.
5.  **Portability:** Entire stack must run with `docker-compose up`.
