import React, { useState } from 'react';
import { login } from '../services/authService';
import toast from 'react-hot-toast';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const fillCredential = (username, password) => {
    setForm({ username, password });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const response = await login(form.username, form.password);
      if (response.success && response.data) {
        const { token, username, fullName, role } = response.data;
        onLogin({ username, fullName, role }, token);
        toast.success(`Welcome back, ${fullName || username}!`);
      } else {
        setErrors({ general: response.error || 'Login failed. Please try again.' });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid username or password';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-outer-frame">
      <div className="login-bento-shell">
        {/* Left Bento Showcase Panel */}
        <div className="login-showcase-panel">
          <div className="login-brand-row">
            <div className="fin-brand-logo">№</div>
            <div className="fin-brand-text">
              <span className="fin-brand-title">Financial</span>
              <span className="fin-brand-sub">SWIFT MT Workspace</span>
            </div>
          </div>

          <div className="login-hero-copy">
            <h1>
              Hey, Welcome back<span className="wave-hand">👋</span>
            </h1>
            <p className="login-hero-sub">
              <span className="coral-caret">|</span>Create, validate &amp; manage MT103 transfers.
            </p>
          </div>

          {/* Decorative Bento Mini Widgets */}
          <div className="login-bento-widgets">
            <div className="login-mini-card">
              <span className="muted-caption">Supported Format</span>
              <div className="login-mini-val">
                <span className="currency-symbol">№</span> MT103 FIN
              </div>
              <span className="badge badge-coral">Blocks 1–4</span>
            </div>

            <div className="login-mini-gauge">
              <div className="login-gauge-ring">
                <span>100%</span>
                <small>BCrypt + JWT</small>
              </div>
            </div>
          </div>

          <p className="login-disclaimer">
            Educational SWIFT MT103 Message Generator &amp; Management System
          </p>
        </div>

        {/* Right Sign-In Card */}
        <div className="login-form-panel">
          <div className="login-card">
            <div className="login-header">
              <span className="badge badge-coral">Authenticated Access</span>
              <h2>Sign in to Financial</h2>
              <p>Enter your operator or administrator credentials</p>
            </div>

            {errors.general && (
              <div className="alert alert-error">
                <span>⚠️</span> {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label required" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className={`form-control ${errors.username ? 'error' : ''}`}
                  placeholder="Enter username (e.g. admin)"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={loading}
                />
                {errors.username && <span className="form-error">⚠️ {errors.username}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required" htmlFor="password">
                  Password
                </label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'error' : ''}`}
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <span className="form-error">⚠️ {errors.password}</span>}
              </div>

              <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-demo">
              <p>Quick-fill Demo Accounts (click to populate):</p>
              <div className="demo-credentials">
                <button
                  type="button"
                  className="demo-chip-btn"
                  onClick={() => fillCredential('admin', 'Admin@123')}
                >
                  <span className="demo-dot" />
                  <strong>admin</strong>
                  <span>Admin@123</span>
                </button>
                <button
                  type="button"
                  className="demo-chip-btn"
                  onClick={() => fillCredential('operator', 'Operator@123')}
                >
                  <span className="demo-dot" />
                  <strong>operator</strong>
                  <span>Operator@123</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
