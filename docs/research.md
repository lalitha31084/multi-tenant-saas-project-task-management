# Research Document: Multi-Tenancy Strategy

## 1. Multi-Tenancy Analysis

### Comparison of Approaches

| Approach | Pros | Cons |
| :--- | :--- | :--- |
| **Shared DB, Shared Schema** | Easiest to maintain; Lowest infrastructure cost; Easy to aggregate data for Super Admin. | Strict code-level security required to prevent data leaks; Backup/Restore of single tenant is hard. |
| **Shared DB, Separate Schema** | Good logical isolation; Easier custom fields per tenant. | High complexity in migrations; Database connection overhead increases with tenants. |
| **Separate Database** | Highest isolation (Physical); Best security; Easy backup/restore per tenant. | Highest cost; Difficult to maintain/update all DBs; Hard to aggregate data. |

### Justification
For this project, we have chosen **Shared Database with Shared Schema**.
* **Reason 1:** The requirements explicitly state every record must have a `tenant_id`.
* **Reason 2:** It is the most scalable approach for a SaaS with a "Free" tier (low resource cost per tenant).
* **Reason 3:** It simplifies the Docker setup as we only need one PostgreSQL container.

## 2. Technology Stack
* **Backend:** Node.js + Express (Non-blocking I/O is ideal for concurrent SaaS requests).
* **Frontend:** React (Component-based architecture fits the Dashboard UI requirements).
* **Database:** PostgreSQL (Robust relational integrity for complex tenant/user/project relationships).
* **Containerization:** Docker (Mandatory for isolation and reproducible builds).

## 3. Security Considerations
1.  **Row-Level Security:** Every SQL query must include `WHERE tenant_id = ?`.
2.  **JWT Isolation:** Tenant ID is embedded in the JWT token and verified on every request.
3.  **Password Hashing:** Using `bcrypt` with salt to hash passwords.
4.  **Input Validation:** Sanitize all inputs to prevent SQL Injection.
5.  **Rate Limiting:** Protect API endpoints from abuse.
