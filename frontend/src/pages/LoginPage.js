import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '', subdomain: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: form.email,
        password: form.password,
        tenantSubdomain: form.subdomain,
      });
      login(res.data.data);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="page-shell gradient-bg">
      <div className="auth-card">
        <div className="auth-hero">
          <p className="eyebrow">Multi-tenant SaaS</p>
          <h1>Secure, tenant-aware access.</h1>
          <p className="subhead">
            Log in with your tenant subdomain to work inside your own isolated workspace.
            Data never crosses tenant boundaries.
          </p>
          <ul className="pill-list">
            <li>JWT-secured sessions</li>
            <li>Project & task visibility by tenant</li>
            <li>Role-aware UI controls</li>
          </ul>
        </div>

        <div className="auth-form">
          <div className="form-header">
            <div>
              <p className="eyebrow">Welcome back</p>
              <h2>Tenant Login</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <label className="field">
              <span>Subdomain</span>
              <input
                type="text"
                placeholder="e.g., demo"
                onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@company.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            <button type="submit" className="btn primary">Sign in</button>
          </form>

          <div className="hint">
            <p className="muted">
              Need an account? <Link to="/register">Create a tenant</Link>
            </p>
          </div>

          <div className="hint">
            <p className="eyebrow">Demo credentials</p>
            <p>Subdomain: demo · Email: admin@demo.com · Password: Demo@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
