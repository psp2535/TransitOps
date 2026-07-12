import React, { useState } from 'react';
import { Wrench, ShieldAlert, CheckCircle2, Calendar, DollarSign, Text } from 'lucide-react';

export default function Maintenance({ 
  maintenanceLogs, 
  setMaintenanceLogs, 
  vehicles, 
  setVehicles, 
  currentUser 
}) {
  // Form states
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [serviceType, setServiceType] = useState('Oil Change');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('In Shop');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [formError, setFormError] = useState('');

  const isManager = currentUser?.role === 'Fleet Manager';

  // Filter vehicles: can log maintenance for any vehicle except retired ones
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedVehicleReg) {
      setFormError('Please select a vehicle.');
      return;
    }

    const vehicleObj = vehicles.find(v => v.regNo === selectedVehicleReg);
    if (!vehicleObj) return;

    // Create log
    const logId = `M0${maintenanceLogs.length + 1}`;
    const newLog = {
      id: logId,
      vehicle: vehicleObj.name,
      vehicleRegNo: selectedVehicleReg,
      type: serviceType,
      cost: Number(cost),
      description: description.trim(),
      status, // 'In Shop' or 'Completed'
      date
    };

    // Rule: If status is 'In Shop', change vehicle status to 'In Shop'
    if (status === 'In Shop') {
      setVehicles(vehicles.map(v => 
        v.regNo === selectedVehicleReg ? { ...v, status: 'In Shop' } : v
      ));
    }

    setMaintenanceLogs([newLog, ...maintenanceLogs]);

    // Reset Form
    setSelectedVehicleReg('');
    setServiceType('Oil Change');
    setCost('');
    setDescription('');
    setStatus('In Shop');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Close / Complete maintenance log
  const handleCloseService = (log) => {
    if (!isManager) return;
    
    // Update log status to Completed
    setMaintenanceLogs(maintenanceLogs.map(l => 
      l.id === log.id ? { ...l, status: 'Completed' } : l
    ));

    // Restore vehicle status to Available (unless retired)
    setVehicles(vehicles.map(v => {
      if (v.regNo === log.vehicleRegNo) {
        // If retired, keep retired, otherwise set to Available
        const targetStatus = v.status === 'Retired' ? 'Retired' : 'Available';
        return { ...v, status: targetStatus };
      }
      return v;
    }));
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Logs</h1>
          <p className="page-subtitle">Schedule repairs and track workshop logs</p>
        </div>
      </div>

      <div className="split-layout">
        {/* Left: Log Service Record */}
        <div className="card">
          <h3 className="card-section-title">LOG SERVICE RECORD</h3>
          
          {!isManager && (
            <div className="role-read-only-badge" style={{ width: '100%', marginBottom: '1.25rem', justifyContent: 'center' }}>
              <ShieldAlert size={14} />
              <span>Read-Only Mode (Requires Fleet Manager)</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="validation-alert" style={{ marginBottom: '1.25rem' }}>
                <ShieldAlert size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">SELECT VEHICLE</label>
              <div className="input-with-icon">
                <Wrench size={16} className="input-icon" />
                <select
                  className="form-control select-control"
                  value={selectedVehicleReg}
                  onChange={(e) => setSelectedVehicleReg(e.target.value)}
                  required
                  disabled={!isManager}
                >
                  <option value="">Choose Vehicle...</option>
                  {activeVehicles.map(v => (
                    <option key={v.regNo} value={v.regNo}>
                      {v.name} ({v.regNo} - Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SERVICE TYPE</label>
                <select
                  className="form-control select-control"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  disabled={!isManager}
                >
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                  <option value="Tire Rotation">Tire Rotation</option>
                  <option value="Engine Tuning">Engine Tuning</option>
                  <option value="Body Work">Body Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">SERVICE COST (INR)</label>
                <input
                  type="number"
                  className="form-control"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 5000"
                  min="0"
                  required
                  disabled={!isManager}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SERVICE STATUS</label>
                <select
                  className="form-control select-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={!isManager}
                >
                  <option value="In Shop">In Shop (Starts Maintenance)</option>
                  <option value="Completed">Completed (Instantly Logged)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">SERVICE DATE</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={!isManager}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">DESCRIPTION / NOTES</label>
              <textarea
                className="form-control"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe parts replaced, issues resolved..."
                required
                disabled={!isManager}
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={!isManager}
            >
              Log Service
            </button>
          </form>

          <div className="table-rules-footer" style={{ marginTop: '1.5rem' }}>
            <p>
              Rules: Creating an active maintenance record automatically changes vehicle status to 
              <strong> In Shop</strong>. Closing maintenance restores the vehicle to 
              <strong> Available</strong> (unless retired).
            </p>
          </div>
        </div>

        {/* Right: Service Log Table */}
        <div className="card">
          <h3 className="card-section-title">SERVICE LOG</h3>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>VEHICLE</th>
                  <th>SERVICE TYPE</th>
                  <th>COST</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  {isManager && <th style={{ textAlign: 'right' }}>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 6 : 5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No service records logged.
                    </td>
                  </tr>
                ) : (
                  maintenanceLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{log.vehicle}</td>
                      <td>{log.type}</td>
                      <td>{formatCurrency(log.cost)}</td>
                      <td>{log.date}</td>
                      <td>
                        <span className={`badge badge-${log.status.replace(/\s+/g, '').toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                      {isManager && (
                        <td style={{ textAlign: 'right' }}>
                          {log.status === 'In Shop' ? (
                            <button
                              onClick={() => handleCloseService(log)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#16a34a', borderColor: '#86efac', background: 'rgba(34, 197, 94, 0.05)' }}
                              title="Complete and release vehicle"
                            >
                              <CheckCircle2 size={12} />
                              <span style={{ marginLeft: '0.25rem' }}>Resolve</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                              Closed
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
