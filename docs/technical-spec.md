# Technical Specification

## Folder Structure
```text
/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/ (Auth, TenantIsolation)
│   │   ├── models/ (PostgreSQL Queries)
│   │   ├── routes/
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/ (AuthContext)
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql (Migrations & Seeds)
└── docker-compose.yml
```
