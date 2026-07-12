import React, { useState } from 'react';
import { Coins, Plus, ShieldAlert, X, Fuel, Landmark, ArrowUpRight } from 'lucide-react';

export default function FuelExpense({ 
  vehicles, 
  fuelLogs, 
  setFuelLogs, 
  expenses, 
  setExpenses, 
  maintenanceLogs, 
  currentUser 
}) {
  // Modal states
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Fuel form fields
  const [fuelVehicleReg, setFuelVehicleReg] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);

  // Expense form fields
  const [expVehicleReg, setExpVehicleReg] = useState('');
  const [expType, setExpType] = useState('Tolls');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  const [validationError, setValidationError] = useState('');

  const isAuthorized = currentUser?.role === 'Financial Analyst' || currentUser?.role === 'Fleet Manager';

  // Calculations for summary per vehicle
  const calculateTotalCosts = () => {
    return vehicles.map(vehicle => {
      // Fuel total for this vehicle (mapping by name)
      const fuelTotal = fuelLogs
        .filter(f => f.vehicle.toLowerCase() === vehicle.name.toLowerCase())
        .reduce((sum, f) => sum + f.cost, 0);

      // Maintenance total for this vehicle
      const maintTotal = maintenanceLogs
        .filter(m => m.vehicle.toLowerCase() === vehicle.name.toLowerCase())
        .reduce((sum, m) => sum + m.cost, 0);

      // Expenses total for this vehicle
      const expTotal = expenses
        .filter(e => e.vehicle.toLowerCase() === vehicle.name.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);

      const totalOpCost = fuelTotal + maintTotal + expTotal;

      return {
        regNo: vehicle.regNo,
        name: vehicle.name,
        fuel: fuelTotal,
        maintenance: maintTotal,
        other: expTotal,
        total: totalOpCost
      };
    });
  };

  const operationalCostsSummary = calculateTotalCosts();

  // Submit Fuel Log
  const handleFuelSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const vehicleObj = vehicles.find(v => v.regNo === fuelVehicleReg);
    if (!vehicleObj) {
      setValidationError('Please select a valid vehicle.');
      return;
    }

    const newLog = {
      id: `F0${fuelLogs.length + 1}`,
      vehicle: vehicleObj.name,
      cost: Number(fuelCost),
      liters: Number(fuelLiters),
      date: fuelDate
    };

    setFuelLogs([newLog, ...fuelLogs]);
    setIsFuelModalOpen(false);
    setFuelVehicleReg('');
    setFuelLiters('');
    setFuelCost('');
  };

  // Submit Expense Log
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const vehicleObj = vehicles.find(v => v.regNo === expVehicleReg);
    if (!vehicleObj) {
      setValidationError('Please select a valid vehicle.');
      return;
    }

    const newExpense = {
      id: `E0${expenses.length + 1}`,
      vehicle: vehicleObj.name,
      type: expType,
      amount: Number(expAmount),
      date: expDate,
      description: expDesc.trim()
    };

    setExpenses([newExpense, ...expenses]);
    setIsExpenseModalOpen(false);
    setExpVehicleReg('');
    setExpAmount('');
    setExpDesc('');
  };

  // Format Currency (INR)
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
          <h1 className="page-title">Fuel & Expense Management</h1>
          <p className="page-subtitle">Track operational costs, fuel efficiency logs, and logistics tolls</p>
        </div>
        
        {isAuthorized ? (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => { setValidationError(''); setIsFuelModalOpen(true); }} className="btn btn-primary" style={{ backgroundColor: '#22c55e' }}>
              <Fuel size={18} />
              <span>Log Fuel</span>
            </button>
            <button onClick={() => { setValidationError(''); setIsExpenseModalOpen(true); }} className="btn btn-primary">
              <Coins size={18} />
              <span>Add Expense</span>
            </button>
          </div>
        ) : (
          <div className="role-read-only-badge">
            <ShieldAlert size={14} />
            <span>Read-Only (Requires Financial Analyst / Fleet Manager)</span>
          </div>
        )}
      </div>

      <div className="split-layout">
        {/* Fuel Logs Table */}
        <div className="card">
          <h3 className="card-section-title">FUEL LOGS</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>VEHICLE</th>
                  <th>LITERS</th>
                  <th>COST</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No fuel logs recorded.
                    </td>
                  </tr>
                ) : (
                  fuelLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{log.vehicle}</td>
                      <td>{log.liters} L</td>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(log.cost)}</td>
                      <td>{log.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Other Expenses Table */}
        <div className="card">
          <h3 className="card-section-title">OTHER EXPENSES (TOLLS / FEES)</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>VEHICLE</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>DESCRIPTION</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No other expenses recorded.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: 600 }}>{exp.vehicle}</td>
                      <td>
                        <span className={`badge ${exp.type === 'Tolls' ? 'badge-ontrip' : 'badge-draft'}`}>
                          {exp.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount)}</td>
                      <td>{exp.description}</td>
                      <td>{exp.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Operational Cost summary section */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 className="card-section-title">TOTAL VEHICLE OPERATIONAL COST</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>VEHICLE</th>
                <th>REG. NO</th>
                <th>FUEL COSTS</th>
                <th>MAINTENANCE COSTS</th>
                <th>TOLLS & OTHER</th>
                <th style={{ color: 'var(--accent-color)', fontWeight: 700 }}>TOTAL OPERATIONAL COST</th>
              </tr>
            </thead>
            <tbody>
              {operationalCostsSummary.map(row => (
                <tr key={row.regNo}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td style={{ letterSpacing: '0.5px' }}>{row.regNo}</td>
                  <td>{formatCurrency(row.fuel)}</td>
                  <td>{formatCurrency(row.maintenance)}</td>
                  <td>{formatCurrency(row.other)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>
                    {formatCurrency(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuel Log Modal */}
      {isFuelModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Log Fuel Purchase</h3>
              <button onClick={() => setIsFuelModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFuelSubmit}>
              <div className="modal-body">
                {validationError && (
                  <div className="validation-alert" style={{ marginBottom: '1.25rem' }}>
                    <ShieldAlert size={16} />
                    <span>{validationError}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">SELECT VEHICLE</label>
                  <select
                    className="form-control select-control"
                    value={fuelVehicleReg}
                    onChange={(e) => setFuelVehicleReg(e.target.value)}
                    required
                  >
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.regNo} value={v.regNo}>{v.name} ({v.regNo})</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">FUEL QUANTITY (LITERS)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                      placeholder="e.g. 50"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">TOTAL COST (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                      placeholder="e.g. 4500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">DATE</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsFuelModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#22c55e' }}>
                  Log Fuel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add Other Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="modal-body">
                {validationError && (
                  <div className="validation-alert" style={{ marginBottom: '1.25rem' }}>
                    <ShieldAlert size={16} />
                    <span>{validationError}</span>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">SELECT VEHICLE</label>
                    <select
                      className="form-control select-control"
                      value={expVehicleReg}
                      onChange={(e) => setExpVehicleReg(e.target.value)}
                      required
                    >
                      <option value="">Select vehicle...</option>
                      {vehicles.map(v => (
                        <option key={v.regNo} value={v.regNo}>{v.name} ({v.regNo})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">EXPENSE TYPE</label>
                    <select
                      className="form-control select-control"
                      value={expType}
                      onChange={(e) => setExpType(e.target.value)}
                      required
                    >
                      <option value="Tolls">Tolls</option>
                      <option value="Parking">Parking</option>
                      <option value="Repairs">Extra Repairs</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">AMOUNT (INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="e.g. 800"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">DATE</label>
                    <input
                      type="date"
                      className="form-control"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">DESCRIPTION</label>
                  <input
                    type="text"
                    className="form-control"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. Tolls for Express Highway crossing"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
