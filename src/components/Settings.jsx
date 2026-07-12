import React, { useState } from 'react';
import { Database, ShieldAlert, Plus, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Settings({ users, setUsers, onResetData, currentUser }) {
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Dispatcher');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isManager = currentUser?.role === 'Fleet Manager';

  const handleCreateUser = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!isManager) {
      setErrorMsg('Only Fleet Managers are authorized to add new platform users.');
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase());
    if (emailExists) {
      setErrorMsg(`User with email "${newUserEmail}" already exists.`);
      return;
    }

    const newUser = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword,
      role: newUserRole
    };

    setUsers([...users, newUser]);
    setSuccessMsg(`User "${newUserName}" successfully added with role "${newUserRole}".`);

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Dispatcher');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & RBAC</h1>
          <p className="page-subtitle">Configure system credentials, access controls, and restore seed logs</p>
        </div>
      </div>

      <div className="split-layout">
        {/* Left: RBAC Matrix */}
        <div className="card">
          <h3 className="card-section-title">RBAC ROLE PERMISSIONS MATRIX</h3>
          
          <div className="table-responsive">
            <table className="table" style={{ fontSize: '0.825rem' }}>
              <thead>
                <tr>
                  <th>ROLE</th>
                  <th>VEHICLE REGISTRY</th>
                  <th>TRIP DISPATCHER</th>
                  <th>DRIVERS & SAFETY</th>
                  <th>FUEL & COSTS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700 }}>Fleet Manager</td>
                  <td><span className="badge badge-completed">Full CRUD</span></td>
                  <td><span className="badge badge-completed">Full CRUD</span></td>
                  <td><span className="badge badge-completed">Full CRUD</span></td>
                  <td><span className="badge badge-completed">Full CRUD</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Dispatcher</td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                  <td><span className="badge badge-completed">Full CRUD</span></td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Safety Officer</td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                  <td><span className="badge badge-completed">Full CRUD</span></td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Financial Analyst</td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                  <td><span className="badge badge-draft">Read Only</span></td>
                  <td><span className="badge badge-completed">Full CRUD</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Developer Controls: Seed Data Reset */}
          <div className="developer-controls-panel">
            <h4 className="developer-panel-title">DEVELOPER & DEMO CONTROLS</h4>
            <p className="developer-panel-desc">
              Restore the mock database to its default high-fidelity records. This will reset all local changes in vehicles, trips, maintenance logs, and fuel expenses.
            </p>
            <button 
              type="button" 
              onClick={onResetData} 
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <RefreshCw size={16} />
              <span>Seed Demo Data</span>
            </button>
          </div>
        </div>

        {/* Right: Create User Form */}
        <div className="card">
          <h3 className="card-section-title">CREATE PLATFORM USER</h3>
          
          {!isManager && (
            <div className="role-read-only-badge" style={{ width: '100%', marginBottom: '1.25rem', justifyContent: 'center' }}>
              <ShieldAlert size={14} />
              <span>User Creation Restricted (Requires Fleet Manager)</span>
            </div>
          )}

          <form onSubmit={handleCreateUser}>
            {successMsg && (
              <div className="validation-alert" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#16a34a', marginBottom: '1.25rem' }}>
                <ShieldCheck size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="validation-alert" style={{ marginBottom: '1.25rem' }}>
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Sarah Connor"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
                disabled={!isManager}
              />
            </div>

            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. sarahc@transitops.in"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                disabled={!isManager}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ROLE ASSIGNMENT</label>
                <select
                  className="form-control select-control"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  disabled={!isManager}
                >
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">TEMPORARY PASSWORD</label>
                <input
                  type="password"
                  className="form-control"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={!isManager}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={!isManager}
            >
              <Plus size={16} />
              <span>Create User Account</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
