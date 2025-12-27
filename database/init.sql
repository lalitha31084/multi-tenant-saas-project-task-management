-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    status tenant_status DEFAULT 'active',
    subscription_plan subscription_plan DEFAULT 'free',
    max_users INTEGER NOT NULL,
    max_projects INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE
CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'user');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- 3. PROJECTS TABLE
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);

-- 4. TASKS TABLE
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tasks_tenant_project ON tasks(tenant_id, project_id);

-- 5. AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA
-- Insert Super Admin (Password: Admin@123 hashed)
INSERT INTO users (email, password_hash, full_name, role, tenant_id)
VALUES ('superadmin@system.com', '$2a$10$K.lPUDpiqyctW2mfEkwRVO3YPVr0l61ZZGJ0TxkxB8aVwQNMjNdna', 'System Admin', 'super_admin', NULL);

WITH demo AS (
    INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
    VALUES ('Demo Company', 'demo', 'active', 'pro', 25, 15)
    ON CONFLICT (subdomain) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
)
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
SELECT id, 'admin@demo.com', '$2a$10$OnZIit9Pfl7Yf4FoF5OAW.ii9HNGmfTHl48DaTVJ.7diqgGVRK/EW', 'Demo Admin', 'tenant_admin'
FROM demo
ON CONFLICT (tenant_id, email) DO NOTHING;
