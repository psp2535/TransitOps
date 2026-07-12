import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, X } from 'lucide-react';

export default function VehicleRegistry({ vehicles, setVehicles, currentUser }) {
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingRegNo, setEditingRegNo] = useState('');
  
  // Form fields
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState('');
  const [capacityUnit, setCapacityUnit] = useState('kg');
  const [odometer, setOdometer] = useState('');
  const [acqCost, setAcqCost] = useState('');
  const [status, setStatus] = useState('Available');
  const [region, setRegion] = useState('North');
  
  const [validationError, setValidationError] = useState('');

  // Check RBAC permissions
  const isManager = currentUser?.role === 'Fleet Manager';

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchType = filterType === 'All' || v.type === filterType;
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchSearch = v.regNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const openAddModal = () => {
    if (!isManager) return;
    setModalMode('add');
    setValidationError('');
    setRegNo('');
    setName('');
    setType('Van');
    setCapacity('');
    setCapacityUnit('kg');
    setOdometer('');
    setAcqCost('');
    setStatus('Available');
    setRegion('North');
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    if (!isManager) return;
    setModalMode('edit');
    setValidationError('');
    setEditingRegNo(vehicle.regNo);
    setRegNo(vehicle.regNo);
    setName(vehicle.name);
    setType(vehicle.type);
    setCapacity(vehicle.capacity);
    setCapacityUnit(vehicle.capacityUnit);
    setOdometer(vehicle.odometer);
    setAcqCost(vehicle.acqCost);
    setStatus(vehicle.status);
    setRegion(vehicle.region || 'North');
    setIsModalOpen(true);
  };

  const handleDelete = (regToDelete) => {
    if (!isManager) return;
    if (window.confirm(`Are you sure you want to delete vehicle ${regToDelete}?`)) {
      setVehicles(vehicles.filter((v) => v.regNo !== regToDelete));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Check unique Reg No
    if (modalMode === 'add') {
      const exists = vehicles.some((v) => v.regNo.toLowerCase() === regNo.trim().toLowerCase());
      if (exists) {
        setValidationError(`Registration Number "${regNo}" must be unique.`);
        return;
      }
    } else if (modalMode === 'edit') {
      const exists = vehicles.some(
        (v) => v.regNo.toLowerCase() === regNo.trim().toLowerCase() && v.regNo !== editingRegNo
      );
      if (exists) {
        setValidationError(`Registration Number "${regNo}" must be unique.`);
        return;
      }
    }

    const vehicleData = {
      regNo: regNo.trim().toUpperCase(),
      name: name.trim(),
      type,
      capacity: Number(capacity),
      capacityUnit,
      odometer: Number(odometer),
      acqCost: Number(acqCost),
      status,
      region
    };

    if (modalMode === 'add') {
      setVehicles([...vehicles, vehicleData]);
    } else {
      setVehicles(vehicles.map((v) => (v.regNo === editingRegNo ? vehicleData : v)));
    }

    setIsModalOpen(false);
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper to format number
  const formatNumber = (val) => {
    return new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Registry</h1>
          <p className="page-subtitle">Manage company fleet inventory and specifications</p>
        </div>
        {isManager ? (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Vehicle</span>
          </button>
        ) : (
          <div className="role-read-only-badge">
            <ShieldAlert size={14} />
            <span>Read-Only (Requires Fleet Manager)</span>
          </div>
        )}
      </div>

      {/* Search & Filter controls */}
      <div className="filters-panel card">
        <span className="filters-label">SEARCH & FILTER</span>
        <div className="filters-row">
          <div className="filter-item">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-control select-control"
            >
              <option value="All">Type: All</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Mini">Mini</option>
            </select>
          </div>
          <div className="filter-item">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-control select-control"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div className="filter-item flex-1">
            <div className="input-with-icon" style={{ width: '100%' }}>
              <Plus size={16} className="input-icon" style={{ transform: 'rotate(45deg)' }} />
              <input
                type="text"
                placeholder="Search reg. no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ width: '100%', minWidth: '240px' }}
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
                <th>REG. NO. (UNIQUE)</th>
                <th>NAME/MODEL</th>
                <th>TYPE</th>
                <th>CAPACITY</th>
                <th>ODOMETER</th>
                <th>ACQ. COST</th>
                <th>STATUS</th>
                {isManager && <th style={{ textAlign: 'right' }}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 8 : 7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No vehicles found matching filters.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.regNo}>
                    <td style={{ fontWeight: 600, letterSpacing: '0.5px' }}>{vehicle.regNo}</td>
                    <td>{vehicle.name}</td>
                    <td>{vehicle.type}</td>
                    <td>{formatNumber(vehicle.capacity)} {vehicle.capacityUnit}</td>
                    <td>{formatNumber(vehicle.odometer)} km</td>
                    <td>{formatCurrency(vehicle.acqCost)}</td>
                    <td>
                      <span className={`badge badge-${vehicle.status.replace(/\s+/g, '').toLowerCase()}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    {isManager && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEditModal(vehicle)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Vehicle"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.regNo)}
                            className="btn btn-danger btn-sm"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="table-rules-footer">
          <p>Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher</p>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle Details'}</h3>
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
                    <label className="form-label">REGISTRATION NUMBER (UNIQUE)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder="e.g. GJ01AB4521"
                      required
                      disabled={modalMode === 'edit'} // Don't let change PK during edit
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">NAME/MODEL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. VAN-05"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">VEHICLE TYPE</label>
                    <select
                      className="form-control select-control"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Mini">Mini</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">LOAD CAPACITY</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        className="form-control"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="e.g. 500"
                        min="1"
                        required
                        style={{ flex: 2 }}
                      />
                      <select
                        className="form-control select-control"
                        value={capacityUnit}
                        onChange={(e) => setCapacityUnit(e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="kg">kg</option>
                        <option value="Ton">Ton</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ODOMETER (KM)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                      placeholder="e.g. 74000"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ACQUISITION COST (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={acqCost}
                      onChange={(e) => setAcqCost(e.target.value)}
                      placeholder="e.g. 620000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">STATUS</label>
                    <select
                      className="form-control select-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={modalMode === 'add'} // Status defaults to Available on addition
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="In Shop">In Shop</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">OPERATIONAL REGION</label>
                    <select
                      className="form-control select-control"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="North">North</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="South">South</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Vehicle' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
