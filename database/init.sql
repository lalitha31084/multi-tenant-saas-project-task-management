-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TYPES & ENUMS
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'user');

-- 2. TENANTS TABLE
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

-- 3. USERS TABLE
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

-- 4. PROJECTS TABLE
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

-- 5. TASKS TABLE
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

-- SEED DATA
-- Create the 'demo' tenant
INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES ('Demo Company', 'demo', 'active', 'pro', 25, 15)
ON CONFLICT (subdomain) DO NOTHING;

-- Create the 'admin@demo.com' user linked to the 'demo' tenant
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
SELECT id, 'admin@demo.com', '$2a$10$OnZIit9Pfl7Yf4FoF5OAW.ii9HNGmfTHl48DaTVJ.7diqgGVRK/EW', 'Demo Admin', 'tenant_admin'
FROM tenants WHERE subdomain = 'demo'
ON CONFLICT DO NOTHING;

-- 1. Ensure tasks are deleted when a project is deleted
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_project_id_fkey,
ADD CONSTRAINT tasks_project_id_fkey 
    FOREIGN KEY (project_id) 
    REFERENCES projects(id) 
    ON DELETE CASCADE;

-- 2. Ensure audit logs remain but are cleaned up if necessary
ALTER TABLE audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_tenant_id_fkey,
ADD CONSTRAINT audit_logs_tenant_id_fkey 
    FOREIGN KEY (tenant_id) 
    REFERENCES tenants(id) 
    ON DELETE CASCADE;