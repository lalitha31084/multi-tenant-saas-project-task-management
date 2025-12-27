import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const RegisterPage = () => {
  const [form, setForm] = useState({
    tenantName: '',
    subdomain: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    plan: 'free',
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register-tenant`, form);
      login(res.data.data);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="page-shell gradient-bg">
      <div className="auth-card">
        <div className="auth-hero">
          <p className="eyebrow">Start your workspace</p>
          <h1>Create a tenant</h1>
          <p className="subhead">Spin up an isolated tenant with plan-based limits and an admin user.</p>
          <ul className="pill-list">
            <li>Tenant-scoped data</li>
            <li>Role-based access</li>
            <li>Audit logging</li>
          </ul>
        </div>

        <div className="auth-form">
          <div className="form-header">
            <div>
              <p className="eyebrow">New organization</p>
              <h2>Register tenant</h2>
            </div>
            <Link to="/login" className="muted">Back to login</Link>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <label className="field">
              <span>Tenant name</span>
              <input
                type="text"
                placeholder="Acme Inc"
                value={form.tenantName}
                onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Subdomain</span>
              <input
                type="text"
                placeholder="acme"
                value={form.subdomain}
                onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Admin name</span>
              <input
                type="text"
                placeholder="Jane Doe"
                value={form.adminName}
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Admin email</span>
              <input
                type="email"
                placeholder="admin@acme.com"
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                placeholder="Create a strong password"
                value={form.adminPassword}
                onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Plan</span>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
              >
                <option value="free">Free (3 projects)</option>
                <option value="pro">Pro (15 projects)</option>
                <option value="enterprise">Enterprise (100 projects)</option>
              </select>
            </label>
            <button type="submit" className="btn primary">Create tenant</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
