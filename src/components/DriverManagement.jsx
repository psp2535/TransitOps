import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, X, Calendar, AlertTriangle } from 'lucide-react';

export default function DriverManagement({ drivers, setDrivers, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverName, setSelectedDriverName] = useState(drivers[0]?.name || '');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingDriverName, setEditingDriverName] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [category, setCategory] = useState('LMV');
  const [expiry, setExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [tripCompl, setTripCompl] = useState('100%');
  const [safetyScore, setSafetyScore] = useState(100);
  const [status, setStatus] = useState('Available');

  const [validationError, setValidationError] = useState('');

  // Check RBAC permissions (Fleet Manager or Safety Officer can write/edit drivers)
  const isAuthorized = currentUser?.role === 'Safety Officer' || currentUser?.role === 'Fleet Manager';

  // Filter drivers
  const filteredDrivers = drivers.filter((d) => {
    return d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           d.licenseNo.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const checkLicenseExpired = (expiryDateStr) => {
    const today = new Date();
    const expiryDate = new Date(expiryDateStr);
    return expiryDate < today;
  };

  const openAddModal = () => {
    if (!isAuthorized) return;
    setModalMode('add');
    setValidationError('');
    setName('');
    setLicenseNo('');
    setCategory('LMV');
    setExpiry('');
    setContact('');
    setTripCompl('100%');
    setSafetyScore(100);
    setStatus('Available');
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    if (!isAuthorized) return;
    setModalMode('edit');
    setValidationError('');
    setEditingDriverName(driver.name);
    setName(driver.name);
    setLicenseNo(driver.licenseNo);
    setCategory(driver.category);
    setExpiry(driver.expiry);
    setContact(driver.contact);
    setTripCompl(driver.tripCompl);
    setSafetyScore(driver.safetyScore);
    setStatus(driver.status);
    setIsModalOpen(true);
  };

  const handleDelete = (nameToDelete) => {
    if (!isAuthorized) return;
    if (window.confirm(`Are you sure you want to delete driver ${nameToDelete}?`)) {
      setDrivers(drivers.filter((d) => d.name !== nameToDelete));
      if (selectedDriverName === nameToDelete) {
        setSelectedDriverName(drivers[0]?.name || '');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Check unique Name / License No
    if (modalMode === 'add') {
      const nameExists = drivers.some((d) => d.name.toLowerCase() === name.trim().toLowerCase());
      if (nameExists) {
        setValidationError(`Driver with name "${name}" already exists.`);
        return;
      }
      const licExists = drivers.some((d) => d.licenseNo.toLowerCase() === licenseNo.trim().toLowerCase());
      if (licExists) {
        setValidationError(`License number "${licenseNo}" already registered.`);
        return;
      }
    }

    const driverData = {
      name: name.trim(),
      licenseNo: licenseNo.trim().toUpperCase(),
      category,
      expiry,
      contact: contact.trim(),
      tripCompl,
      safetyScore: Number(safetyScore),
      status
    };

    if (modalMode === 'add') {
      setDrivers([...drivers, driverData]);
      setSelectedDriverName(driverData.name);
    } else {
      setDrivers(drivers.map((d) => (d.name === editingDriverName ? driverData : d)));
      setSelectedDriverName(driverData.name);
    }

    setIsModalOpen(false);
  };

  // Quick Status Toggle Handler for selected driver
  const handleQuickStatusToggle = (newStatus) => {
    if (!isAuthorized) return;
    if (!selectedDriverName) return;

    setDrivers(drivers.map((d) => {
      if (d.name === selectedDriverName) {
        return { ...d, status: newStatus };
      }
      return d;
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Drivers & Safety Profiles</h1>
          <p className="page-subtitle">Track credentials, safety scores, and compliance metrics</p>
        </div>
        {isAuthorized ? (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Driver</span>
          </button>
        ) : (
          <div className="role-read-only-badge">
            <ShieldAlert size={14} />
            <span>Read-Only (Requires Safety Officer / Fleet Manager)</span>
          </div>
        )}
      </div>

      {/* Search panel */}
      <div className="filters-panel card">
        <span className="filters-label">SEARCH DRIVER</span>
        <div className="filters-row">
          <div className="filter-item flex-1">
            <div className="input-with-icon" style={{ width: '100%' }}>
              <Plus size={16} className="input-icon" style={{ transform: 'rotate(45deg)' }} />
              <input
                type="text"
                placeholder="Search driver by name or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>DRIVER</th>
                <th>LICENSE NO.</th>
                <th>CATEGORY</th>
                <th>EXPIRY</th>
                <th>CONTACT</th>
                <th>TRIP COMPL.</th>
                <th>SAFETY SCORE</th>
                <th>STATUS</th>
                {isAuthorized && <th style={{ textAlign: 'right' }}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={isAuthorized ? 10 : 9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No drivers found.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const expired = checkLicenseExpired(driver.expiry);
                  const isSelected = selectedDriverName === driver.name;
                  return (
                    <tr 
                      key={driver.name} 
                      onClick={() => setSelectedDriverName(driver.name)}
                      className={`row-clickable ${isSelected ? 'row-selected' : ''}`}
                    >
                      <td>
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => setSelectedDriverName(driver.name)}
                          name="selectedDriver"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{driver.name}</td>
                      <td>{driver.licenseNo}</td>
                      <td>{driver.category}</td>
                      <td style={{ color: expired ? '#d97706' : 'inherit', fontWeight: expired ? 600 : 'normal' }}>
                        {driver.expiry} {expired && <span className="license-expired-flag">EXPIRED</span>}
                      </td>
                      <td>{driver.contact}</td>
                      <td>{driver.tripCompl}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="safety-bar-bg">
                            <div 
                              className={`safety-bar-fill ${driver.safetyScore >= 90 ? 'bg-green' : driver.safetyScore >= 80 ? 'bg-orange' : 'bg-red'}`}
                              style={{ width: `${driver.safetyScore}%` }}
                            ></div>
                          </div>
                          <span style={{ fontWeight: 600 }}>{driver.safetyScore}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${driver.status.replace(/\s+/g, '').toLowerCase()}`}>
                          {driver.status}
                        </span>
                      </td>
                      {isAuthorized && (
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => openEditModal(driver)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Driver"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(driver.name)}
                              className="btn btn-danger btn-sm"
                              title="Delete Driver"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Driver Action Panel matching mockup */}
        <div className="driver-action-footer">
          <div className="quick-toggle-panel">
            <span className="quick-toggle-label">
              TOGGLE STATUS {selectedDriverName ? `FOR "${selectedDriverName}":` : ''}
            </span>
            <div className="quick-toggle-buttons">
              <button
                disabled={!isAuthorized || !selectedDriverName}
                onClick={() => handleQuickStatusToggle('Available')}
                className="btn btn-sm btn-status-toggle badge-available"
              >
                Available
              </button>
              <button
                disabled={!isAuthorized || !selectedDriverName}
                onClick={() => handleQuickStatusToggle('On Trip')}
                className="btn btn-sm btn-status-toggle badge-ontrip"
              >
                On Trip
              </button>
              <button
                disabled={!isAuthorized || !selectedDriverName}
                onClick={() => handleQuickStatusToggle('Off Duty')}
                className="btn btn-sm btn-status-toggle badge-offduty"
              >
                Off Duty
              </button>
              <button
                disabled={!isAuthorized || !selectedDriverName}
                onClick={() => handleQuickStatusToggle('Suspended')}
                className="btn btn-sm btn-status-toggle badge-suspended"
              >
                Suspended
              </button>
            </div>
          </div>
          
          <div className="table-rules-footer" style={{ marginTop: '1rem' }}>
            <p>Rules: Expired license or Suspended status &rarr; blocked from trip assignment</p>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Driver Profile' : 'Edit Driver Profile'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {validationError && (
                  <div className="validation-alert" style={{ marginBottom: '1.25rem' }}>
                    <ShieldAlert size={16} />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">FULL NAME</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      required
                      disabled={modalMode === 'edit'}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">LICENSE NUMBER</label>
                    <input
                      type="text"
                      className="form-control"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      placeholder="e.g. DL-88213"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">LICENSE CATEGORY</label>
                    <select
                      className="form-control select-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="LMV">LMV (Light Motor Vehicle)</option>
                      <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                      <option value="MCWG">MCWG (Motorcycle With Gear)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">LICENSE EXPIRY DATE</label>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <input
                        type="date"
                        className="form-control"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">CONTACT NUMBER</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="e.g. 98765xxxxx"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SAFETY SCORE (0 - 100)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(e.target.value)}
                      placeholder="100"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">TRIP COMPLETION RATE (%)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tripCompl}
                      onChange={(e) => setTripCompl(e.target.value)}
                      placeholder="e.g. 96%"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">STATUS</label>
                    <select
                      className="form-control select-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={modalMode === 'add'}
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Driver' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
