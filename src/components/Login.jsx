import React, { useState } from 'react';
import { Truck, ShieldAlert, Key, Mail, ShieldCheck } from 'lucide-react';
import { INITIAL_USERS } from '../initialData';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('RavenK@transitops.in');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Dispatcher');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check against INITIAL_USERS
    const user = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      // Login successful, override role if changed (for easy role testing in hackathon)
      const loggedUser = { ...user, role };
      onLogin(loggedUser);
    } else {
      setError('Invalid credentials. Account locked after 5 failed attempts.');
    }
  };

  const fillCredentials = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setRole(user.role);
  };

  return (
    <div className="login-screen">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-brand-container">
          <div className="brand-logo-large">
            <Truck size={36} className="logo-icon" />
          </div>
          <h1 className="login-title">TransitOps</h1>
          <p className="login-subtitle">Smart Transport Operations Platform</p>
        </div>

        <div className="login-bullet-info">
          <h2>One login, four roles:</h2>
          <ul>
            <li><span className="dot fleet"></span> Fleet Manager</li>
            <li><span className="dot dispatcher"></span> Dispatcher</li>
            <li><span className="dot safety"></span> Safety Officer</li>
            <li><span className="dot finance"></span> Financial Analyst</li>
          </ul>
        </div>
        
        <div className="login-footer-text">
          TransitOps &copy; 2026 • RBAC Enabled
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card-wrapper">
          <div className="login-card-header">
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">EMAIL</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. RavenK@transitops.in"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">PASSWORD</label>
              <div className="input-with-icon">
                <Key size={16} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">ROLE (RBAC)</label>
              <div className="input-with-icon">
                <ShieldCheck size={16} className="input-icon" />
                <select
                  id="role"
                  className="form-control select-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
              </div>
            </div>

            <div className="form-remember-forgot">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary btn-block login-btn">
              Sign In
            </button>
          </form>

          {/* Quick Demo Login Seeder */}
          <div className="quick-logins">
            <p className="quick-login-title">Quick Demo Login (Click to Autofill):</p>
            <div className="quick-login-grid">
              {INITIAL_USERS.map((u) => (
                <button
                  key={u.role}
                  type="button"
                  className="quick-login-btn"
                  onClick={() => fillCredentials(u)}
                >
                  <span className="role-btn-name">{u.role}</span>
                  <span className="role-btn-email">{u.email}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="login-scopes-info">
            <p className="scopes-title">Access is scoped by role after login:</p>
            <ul>
              <li><strong>Fleet Manager</strong> &rarr; Fleet, Maintenance</li>
              <li><strong>Dispatcher</strong> &rarr; Dashboard, Trips</li>
              <li><strong>Safety Officer</strong> &rarr; Drivers, Compliance</li>
              <li><strong>Financial Analyst</strong> &rarr; Fuel & Expenses, Analytics</li>
            </ul>
          </div>
        </div>

        {/* Error notification box (Absolute placed on right matching mockup error bubble) */}
        {error && (
          <div className="login-error-bubble">
            <div className="error-bubble-title">Error state</div>
            <div className="error-bubble-content">
              <ShieldAlert size={16} className="error-icon" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
