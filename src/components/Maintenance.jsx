import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

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

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const isManager = currentUser?.role === 'Fleet Manager';

  // Filter vehicles: can log maintenance for any vehicle except retired ones
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

  // Compute KPI values
  const vehiclesInShopCount = vehicles.filter(v => v.status === 'In Shop').length;
  
  const totalSpend = maintenanceLogs.reduce((sum, log) => sum + Number(log.cost || 0), 0);
  
  const completedCount = maintenanceLogs.filter(log => log.status === 'Completed').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedVehicleReg) {
      setFormError('Please select a vehicle.');
      return;
    }

    const vehicleObj = vehicles.find(v => v.regNo === selectedVehicleReg);
    if (!vehicleObj) return;

    if (Number(cost) < 0) {
      setFormError('Service cost cannot be negative.');
      return;
    }

    if (description.trim().length < 5) {
      setFormError('Please provide a brief description (at least 5 characters).');
      return;
    }

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
      // Find matching vehicle by name or registration
      if (v.name === log.vehicle || v.regNo === log.vehicleRegNo) {
        const targetStatus = v.status === 'Retired' ? 'Retired' : 'Available';
        return { ...v, status: targetStatus };
      }
      return v;
    }));
  };

  // Delete maintenance log
  const handleDeleteLog = (log) => {
    if (!isManager) return;
    if (!window.confirm(`Are you sure you want to delete maintenance record ${log.id}?`)) return;

    // If the deleted record was active in shop, release the vehicle
    if (log.status === 'In Shop') {
      setVehicles(vehicles.map(v => {
        if (v.name === log.vehicle || v.regNo === log.vehicleRegNo) {
          return { ...v, status: 'Available' };
        }
        return v;
      }));
    }

    setMaintenanceLogs(maintenanceLogs.filter(l => l.id !== log.id));
  };

  // Toggle notes drawer
  const toggleRowNotes = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Apply Search and Filters to logs
  const filteredLogs = maintenanceLogs.filter(log => {
    const matchesSearch = log.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (log.vehicleRegNo && log.vehicleRegNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
    
    const matchesType = filterType === 'All' || log.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance & Workshop</h1>
          <p className="page-subtitle">Schedule repairs, track workshop statuses, and evaluate service histories</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card border-orange">
          <div className="kpi-icon-wrapper text-orange">
            <Wrench size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">VEHICLES IN SHOP</span>
            <h2 className="kpi-value">{vehiclesInShopCount}</h2>
          </div>
        </div>

        <div className="kpi-card border-blue">
          <div className="kpi-icon-wrapper text-blue">
            <DollarSign size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">TOTAL SPENT</span>
            <h2 className="kpi-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(totalSpend)}</h2>
          </div>
        </div>

        <div className="kpi-card border-green">
          <div className="kpi-icon-wrapper text-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">COMPLETED SERVICES</span>
            <h2 className="kpi-value">{completedCount}</h2>
          </div>
        </div>
      </div>

      <div className="split-layout">
        {/* Left Form Panel */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
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
                <AlertTriangle size={16} />
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
              Rule: Creating an active maintenance record automatically changes vehicle status to 
              <strong> In Shop</strong>. Closing maintenance restores the vehicle to 
              <strong> Available</strong> (unless retired).
            </p>
          </div>
        </div>

        {/* Right Searchable Table Panel */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 className="card-section-title" style={{ margin: 0 }}>SERVICE HISTORY LOG</h3>
            
            {/* Search and Filters Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="input-with-icon" style={{ flex: 1, minWidth: '200px' }}>
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search vehicle name or reg number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="input-with-icon" style={{ width: '130px' }}>
                <Filter size={14} className="input-icon" />
                <select
                  className="form-control select-control"
                  style={{ paddingLeft: '2rem' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="input-with-icon" style={{ width: '150px' }}>
                <Filter size={14} className="input-icon" />
                <select
                  className="form-control select-control"
                  style={{ paddingLeft: '2rem' }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Services</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                  <option value="Tire Rotation">Tire Rotation</option>
                  <option value="Engine Tuning">Engine Tuning</option>
                  <option value="Body Work">Body Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>VEHICLE</th>
                  <th>SERVICE TYPE</th>
                  <th>COST</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No service records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        {/* Main row */}
                        <tr style={{ cursor: 'pointer' }} onClick={() => toggleRowNotes(log.id)}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {isExpanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                              <span>{log.vehicle}</span>
                            </div>
                          </td>
                          <td>{log.type}</td>
                          <td>{formatCurrency(log.cost)}</td>
                          <td>{log.date}</td>
                          <td>
                            <span className={`badge badge-${log.status.replace(/\s+/g, '').toLowerCase()}`}>
                              {log.status === 'In Shop' ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={10} className="spin" />
                                  In Shop
                                </span>
                              ) : log.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                              {log.status === 'In Shop' && isManager && (
                                <button
                                  onClick={() => handleCloseService(log)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#16a34a', borderColor: '#86efac', background: 'rgba(34, 197, 94, 0.05)' }}
                                  title="Complete and release vehicle"
                                >
                                  <CheckCircle2 size={12} />
                                  <span style={{ marginLeft: '0.25rem' }}>Resolve</span>
                                </button>
                              )}
                              {isManager && (
                                <button
                                  onClick={() => handleDeleteLog(log)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                                  title="Delete record"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                              {!isManager && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {log.status === 'Completed' ? 'Closed' : 'Active'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible notes row */}
                        {isExpanded && (
                          <tr className="expanded-detail-row">
                            <td colSpan={6} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem 1.5rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                                  Service Notes / Log Details ({log.id})
                                </span>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                                  {log.description || 'No notes provided for this service record.'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
