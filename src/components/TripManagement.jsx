import React, { useState } from 'react';
import { 
  Play, 
  Check, 
  X, 
  ShieldAlert, 
  MapPin, 
  Scale, 
  UserCheck, 
  Truck,
  ArrowRight,
  TrendingUp,
  Fuel
} from 'lucide-react';

export default function TripManagement({ 
  trips, 
  setTrips, 
  vehicles, 
  setVehicles, 
  drivers, 
  setDrivers, 
  fuelLogs, 
  setFuelLogs, 
  currentUser 
}) {
  // Form states
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoWeightUnit, setCargoWeightUnit] = useState('kg');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [selectedDriverName, setSelectedDriverName] = useState('');
  
  // Trip actions state
  const [activeTripActionId, setActiveTripActionId] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  
  const [formError, setFormError] = useState('');

  const isDispatcherOrManager = currentUser?.role === 'Dispatcher' || currentUser?.role === 'Fleet Manager';

  // Filter vehicles: only Available ones for dispatch selection
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  
  // Filter drivers: only Available, not suspended, and license not expired
  const availableDrivers = drivers.filter(d => {
    const notSuspended = d.status === 'Available';
    const notExpired = new Date(d.expiry) >= new Date();
    return notSuspended && notExpired;
  });

  // Calculate weight in kg
  const getWeightInKg = (weight, unit) => {
    const w = Number(weight) || 0;
    if (unit === 'Ton') return w * 1000;
    return w;
  };

  const selectedVehicleObj = vehicles.find(v => v.regNo === selectedVehicleReg);
  const selectedDriverObj = drivers.find(d => d.name === selectedDriverName);

  // Validate Capacity
  let capacityExceeded = false;
  let vehicleCapInKg = 0;
  let cargoWeightInKg = getWeightInKg(cargoWeight, cargoWeightUnit);

  if (selectedVehicleObj) {
    vehicleCapInKg = getWeightInKg(selectedVehicleObj.capacity, selectedVehicleObj.capacityUnit);
    if (cargoWeightInKg > vehicleCapInKg) {
      capacityExceeded = true;
    }
  }

  // Create Trip (Draft or Dispatched)
  const handleCreateTrip = (e, immediateDispatch = false) => {
    e.preventDefault();
    setFormError('');

    if (capacityExceeded) {
      setFormError('Cargo weight exceeds the maximum load capacity of the selected vehicle.');
      return;
    }

    if (immediateDispatch && (!selectedVehicleReg || !selectedDriverName)) {
      setFormError('Please select both a vehicle and driver for immediate dispatch.');
      return;
    }

    const tripId = `TR0${trips.length + 1}`;
    const newTrip = {
      id: tripId,
      source: source.trim(),
      destination: destination.trim(),
      cargoWeight: Number(cargoWeight),
      cargoWeightUnit,
      plannedDistance: Number(plannedDistance),
      vehicle: selectedVehicleObj ? selectedVehicleObj.name : '',
      vehicleRegNo: selectedVehicleReg,
      driver: selectedDriverName,
      status: immediateDispatch ? 'Dispatched' : 'Draft',
      eta: immediateDispatch ? 'Calculating...' : 'Awaiting vehicle'
    };

    // If immediate dispatch, toggle vehicle & driver to On Trip
    if (immediateDispatch) {
      setVehicles(vehicles.map(v => v.regNo === selectedVehicleReg ? { ...v, status: 'On Trip' } : v));
      setDrivers(drivers.map(d => d.name === selectedDriverName ? { ...d, status: 'On Trip' } : d));
    }

    setTrips([newTrip, ...trips]);

    // Reset Form
    setSource('');
    setDestination('');
    setCargoWeight('');
    setCargoWeightUnit('kg');
    setPlannedDistance('');
    setSelectedVehicleReg('');
    setSelectedDriverName('');
  };

  // Dispatch Draft Trip
  const handleDispatchDraft = (trip) => {
    if (!isDispatcherOrManager) return;
    if (!trip.vehicleRegNo || !trip.driver) {
      alert('Edit this draft trip to assign an available vehicle and driver before dispatching.');
      return;
    }

    setTrips(trips.map(t => t.id === trip.id ? { ...t, status: 'Dispatched', eta: '1h 30m' } : t));
    setVehicles(vehicles.map(v => v.regNo === trip.vehicleRegNo ? { ...v, status: 'On Trip' } : v));
    setDrivers(drivers.map(d => d.name === trip.driver ? { ...d, status: 'On Trip' } : d));
  };

  // Cancel Dispatched Trip
  const handleCancelTrip = (trip) => {
    if (!isDispatcherOrManager) return;
    if (window.confirm(`Are you sure you want to cancel trip ${trip.id}?`)) {
      setTrips(trips.map(t => t.id === trip.id ? { ...t, status: 'Cancelled', eta: '-' } : t));
      
      // Restore Vehicle & Driver
      if (trip.vehicleRegNo) {
        setVehicles(vehicles.map(v => v.regNo === trip.vehicleRegNo ? { ...v, status: 'Available' } : v));
      }
      if (trip.driver) {
        setDrivers(drivers.map(d => d.name === trip.driver ? { ...d, status: 'Available' } : d));
      }
    }
  };

  // Trigger Complete Dialog Open
  const triggerCompleteTrip = (trip) => {
    if (!isDispatcherOrManager) return;
    setActiveTripActionId(trip.id);
    
    // Find selected vehicle odometer to pre-fill
    const vehicleReg = trip.vehicleRegNo;
    const vehicle = vehicles.find(v => v.regNo === vehicleReg);
    setFinalOdometer(vehicle ? String(vehicle.odometer + trip.plannedDistance) : '');
    setFuelConsumed('30');
    setFuelCost('2700');
  };

  // Submit Completion
  const submitCompleteTrip = (e, trip) => {
    e.preventDefault();

    const finalOdNum = Number(finalOdometer);
    const fuelConsNum = Number(fuelConsumed);
    const fuelCostNum = Number(fuelCost);

    // Update vehicle odometer
    const vehicleReg = trip.vehicleRegNo;
    const vehicle = vehicles.find(v => v.regNo === vehicleReg);

    if (vehicle && finalOdNum <= vehicle.odometer) {
      alert(`Final odometer must be greater than current odometer (${vehicle.odometer} km)`);
      return;
    }

    // Complete Trip
    setTrips(trips.map(t => t.id === trip.id ? { ...t, status: 'Completed', eta: '-' } : t));

    // Restore vehicle status and update odometer
    setVehicles(vehicles.map(v => {
      if (v.regNo === vehicleReg) {
        return { ...v, status: 'Available', odometer: finalOdNum };
      }
      return v;
    }));

    // Restore driver status
    setDrivers(drivers.map(d => d.name === trip.driver ? { ...d, status: 'Available' } : d));

    // Create Fuel Log entry
    if (fuelConsNum > 0 && fuelCostNum > 0) {
      const newFuelLog = {
        id: `F0${fuelLogs.length + 1}`,
        vehicle: vehicle ? vehicle.name : 'Unknown',
        cost: fuelCostNum,
        liters: fuelConsNum,
        date: new Date().toISOString().split('T')[0]
      };
      setFuelLogs([newFuelLog, ...fuelLogs]);
    }

    setActiveTripActionId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trip Dispatcher</h1>
          <p className="page-subtitle">Schedule, assign, and complete transport runs</p>
        </div>
        
        {/* Lifecycle Tracker banner */}
        <div className="lifecycle-tracker">
          <div className="step active">Draft</div>
          <div className="connector active"></div>
          <div className="step active">Dispatched</div>
          <div className="connector"></div>
          <div className="step">Completed</div>
          <div className="connector"></div>
          <div className="step">Cancelled</div>
        </div>
      </div>

      <div className="split-layout">
        {/* Left Form Panel: Create Trip */}
        <div className="card">
          <h3 className="card-section-title">CREATE TRIP</h3>
          
          {!isDispatcherOrManager ? (
            <div className="role-read-only-badge" style={{ width: '100%', marginBottom: '1rem', justifyContent: 'center' }}>
              <ShieldAlert size={14} />
              <span>Dispatch Restricted (Requires Dispatcher or Fleet Manager)</span>
            </div>
          ) : null}

          <form onSubmit={(e) => handleCreateTrip(e, true)}>
            {formError && (
              <div className="validation-alert" style={{ marginBottom: '1.25rem' }}>
                <ShieldAlert size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SOURCE LOCATION</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. San Francisco Depot"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    required
                    disabled={!isDispatcherOrManager}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DESTINATION LOCATION</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. LA Neighborhood Hub"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    disabled={!isDispatcherOrManager}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CARGO WEIGHT</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Cargo weight"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    min="1"
                    required
                    disabled={!isDispatcherOrManager}
                    style={{ flex: 2 }}
                  />
                  <select
                    className="form-control select-control"
                    value={cargoWeightUnit}
                    onChange={(e) => setCargoWeightUnit(e.target.value)}
                    disabled={!isDispatcherOrManager}
                    style={{ flex: 1 }}
                  >
                    <option value="kg">kg</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PLANNED DISTANCE (KM)</label>
                <div className="input-with-icon">
                  <TrendingUp size={16} className="input-icon" />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 380"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    min="1"
                    required
                    disabled={!isDispatcherOrManager}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ASSIGN VEHICLE</label>
                <div className="input-with-icon">
                  <Truck size={16} className="input-icon" />
                  <select
                    className="form-control select-control"
                    value={selectedVehicleReg}
                    onChange={(e) => setSelectedVehicleReg(e.target.value)}
                    required
                    disabled={!isDispatcherOrManager}
                  >
                    <option value="">Select Available Vehicle</option>
                    {availableVehicles.map(v => (
                      <option key={v.regNo} value={v.regNo}>
                        {v.name} ({v.type} - Max: {v.capacity} {v.capacityUnit})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedVehicleObj && (
                  <div className="field-info-text">
                    Selected vehicle max capacity: {selectedVehicleObj.capacity} {selectedVehicleObj.capacityUnit}
                  </div>
                )}
                
                {/* Weight validation error */}
                {capacityExceeded && (
                  <div className="validation-alert">
                    <ShieldAlert size={14} />
                    <span>
                      Selected capacity: {selectedVehicleObj.capacity} {selectedVehicleObj.capacityUnit} / Cargo weight: {cargoWeight} {cargoWeightUnit}. Capacity exceeded!
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">ASSIGN DRIVER</label>
                <div className="input-with-icon">
                  <UserCheck size={16} className="input-icon" />
                  <select
                    className="form-control select-control"
                    value={selectedDriverName}
                    onChange={(e) => setSelectedDriverName(e.target.value)}
                    required
                    disabled={!isDispatcherOrManager}
                  >
                    <option value="">Select Available Driver</option>
                    {availableDrivers.map(d => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.category} - Safety: {d.safetyScore})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary flex-1"
                disabled={!isDispatcherOrManager || capacityExceeded}
              >
                <Play size={16} />
                <span>Dispatch Scheduled</span>
              </button>
              <button 
                type="button" 
                onClick={(e) => handleCreateTrip(e, false)} 
                className="btn btn-secondary"
                disabled={!isDispatcherOrManager || capacityExceeded}
              >
                Save Draft
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Live Trips list */}
        <div className="card">
          <h3 className="card-section-title">LIVE & PENDING TRIPS</h3>
          
          <div className="trips-list-container">
            {trips.length === 0 ? (
              <p className="no-trips-text">No trips loaded. Use the form to start.</p>
            ) : (
              trips.map((trip) => {
                const isActiveAction = activeTripActionId === trip.id;
                const associatedVehicle = vehicles.find(v => v.name === trip.vehicle);
                
                return (
                  <div key={trip.id} className={`trip-card-item border-${trip.status.toLowerCase()}`}>
                    <div className="trip-card-header-row">
                      <div className="trip-id-badge">{trip.id}</div>
                      <span className={`badge badge-${trip.status.replace(/\s+/g, '').toLowerCase()}`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="trip-locations">
                      <span>{trip.source}</span>
                      <ArrowRight size={14} className="location-arrow" />
                      <span>{trip.destination}</span>
                    </div>

                    <div className="trip-meta-details">
                      <div><strong>Vehicle:</strong> {trip.vehicle || 'Not assigned'}</div>
                      <div><strong>Driver:</strong> {trip.driver || 'Not assigned'}</div>
                      <div><strong>Weight:</strong> {trip.cargoWeight} {trip.cargoWeightUnit}</div>
                      <div><strong>ETA:</strong> {trip.eta}</div>
                    </div>

                    {/* Operational Action Controls */}
                    {isDispatcherOrManager && (
                      <div className="trip-actions-row">
                        {trip.status === 'Draft' && (
                          <button
                            onClick={() => handleDispatchDraft(trip)}
                            className="btn btn-primary btn-sm"
                            disabled={!trip.vehicle || !trip.driver}
                          >
                            <Play size={12} />
                            <span>Dispatch Now</span>
                          </button>
                        )}

                        {(trip.status === 'Dispatched' || trip.status === 'On Trip') && (
                          <>
                            <button
                              onClick={() => triggerCompleteTrip(trip)}
                              className="btn btn-primary btn-sm"
                              style={{ backgroundColor: '#22c55e' }}
                            >
                              <Check size={12} />
                              <span>Complete Trip</span>
                            </button>
                            
                            <button
                              onClick={() => handleCancelTrip(trip)}
                              className="btn btn-danger btn-sm"
                            >
                              <X size={12} />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Complete Trip Sub-Form (inline form overlay) */}
                    {isActiveAction && (
                      <form 
                        onSubmit={(e) => submitCompleteTrip(e, trip)}
                        className="inline-completion-form card"
                      >
                        <h4 className="completion-form-title">Complete Operations Log</h4>
                        
                        <div className="form-group">
                          <label className="form-label">
                            FINAL ODOMETER READING (Current: {associatedVehicle?.odometer} km)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={finalOdometer}
                            onChange={(e) => setFinalOdometer(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">FUEL CONSUMED (LITERS)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={fuelConsumed}
                              onChange={(e) => setFuelConsumed(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">FUEL COST (INR)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={fuelCost}
                              onChange={(e) => setFuelCost(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setActiveTripActionId(null)}
                            className="btn btn-secondary btn-sm"
                          >
                            Close
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#22c55e' }}
                          >
                            Submit Log
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
