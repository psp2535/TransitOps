import React, { useState } from 'react';
import { Play, Check, X, ShieldAlert, MapPin, UserCheck, Truck, ArrowRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TripManagement({ trips, setTrips, vehicles, setVehicles, drivers, setDrivers, fuelLogs, setFuelLogs, currentUser }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoWeightUnit, setCargoWeightUnit] = useState('kg');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [selectedDriverName, setSelectedDriverName] = useState('');
  
  const [formError, setFormError] = useState('');
  const [capacityError, setCapacityError] = useState('');

  const [selectedTripId, setSelectedTripId] = useState(() => {
    return trips.length > 0 ? trips[trips.length - 1].id : '';
  });
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (!selectedTripId && trips.length > 0) {
      setSelectedTripId(trips[trips.length - 1].id);
    }
  }, [trips, selectedTripId]);

  const filteredTrips = trips.filter(t => {
    const query = searchQuery.toLowerCase();
    return t.id.toLowerCase().includes(query) ||
           (t.vehicle || '').toLowerCase().includes(query) ||
           (t.driver || '').toLowerCase().includes(query) ||
           t.source.toLowerCase().includes(query) ||
           t.destination.toLowerCase().includes(query) ||
           t.status.toLowerCase().includes(query);
  });

  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const currentStatus = selectedTrip ? selectedTrip.status : 'Draft';

  const isAuthorized = currentUser?.role === 'Dispatcher' || currentUser?.role === 'Fleet Manager';

  // Real-time capacity check
  React.useEffect(() => {
    if (selectedVehicleReg && cargoWeight) {
      const v = vehicles.find(veh => veh.regNo === selectedVehicleReg);
      if (v) {
        let vCapKg = v.capacityUnit === 'Ton' ? v.capacity * 1000 : v.capacity;
        let cWeightKg = cargoWeightUnit === 'Ton' ? cargoWeight * 1000 : cargoWeight;
        if (cWeightKg > vCapKg) {
          setCapacityError(`Capacity exceeded by ${cWeightKg - vCapKg} kg - dispatch blocked`);
        } else {
          setCapacityError('');
        }
      }
    } else {
      setCapacityError('');
    }
  }, [selectedVehicleReg, cargoWeight, cargoWeightUnit, vehicles]);

  const handleCreateTrip = (e) => {
    e.preventDefault();
    if (!isAuthorized) return;
    setFormError('');
    
    if (capacityError) {
      setFormError('Cannot dispatch. Capacity exceeded.');
      return;
    }

    if (!source || !destination || !cargoWeight || !plannedDistance || !selectedVehicleReg || !selectedDriverName) {
      setFormError('All fields are required.');
      return;
    }

    // Dynamic ETA calculation based on average driving speed of 50 km/h
    const speed = 50;
    const hours = Number(plannedDistance) / speed;
    let computedEta = 'TBD';
    if (hours > 0) {
      if (hours < 1) {
        computedEta = `${Math.round(hours * 60)} min`;
      } else {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        computedEta = m > 0 ? `${h}h ${m}m` : `${h}h`;
      }
    }

    const newTripId = 'TR' + String(Math.floor(Math.random() * 900) + 100);

    const newTrip = {
      id: newTripId,
      source,
      destination,
      vehicle: selectedVehicleReg,
      driver: selectedDriverName,
      cargoWeight: Number(cargoWeight),
      cargoWeightUnit,
      plannedDistance: Number(plannedDistance),
      status: 'Dispatched',
      eta: computedEta
    };

    setTrips([...trips, newTrip]);
    setSelectedTripId(newTripId);

    // Update vehicle and driver status
    setVehicles(vehicles.map(v => v.regNo === selectedVehicleReg ? { ...v, status: 'On Trip' } : v));
    setDrivers(drivers.map(d => d.name === selectedDriverName ? { ...d, status: 'On Trip' } : d));

    // Reset
    setSource('');
    setDestination('');
    setCargoWeight('');
    setPlannedDistance('');
    setSelectedVehicleReg('');
    setSelectedDriverName('');
  };

  const handleCompleteTrip = (tripId, vehicleReg, driverName) => {
    if (!isAuthorized) return;
    setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'Completed', eta: '-' } : t));
    // Release resources
    setVehicles(vehicles.map(v => v.regNo === vehicleReg ? { ...v, status: 'Available' } : v));
    setDrivers(drivers.map(d => d.name === driverName ? { ...d, status: 'Available' } : d));
  };

  const handleCancelTrip = (tripId, vehicleReg, driverName) => {
    if (!isAuthorized) return;
    setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'Cancelled', eta: '-' } : t));
    if (vehicleReg) setVehicles(vehicles.map(v => v.regNo === vehicleReg ? { ...v, status: 'Available' } : v));
    if (driverName) setDrivers(drivers.map(d => d.name === driverName ? { ...d, status: 'Available' } : d));
  };

  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK';
  const userName = currentUser?.name || 'Raven K.';
  const userRole = currentUser?.role || 'Dispatcher';

  const isLicenseExpired = (expiryStr) => {
    if (!expiryStr) return true;
    if (expiryStr.toUpperCase().includes('EXPIRED')) return true;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryStr.includes('-')) {
        return new Date(expiryStr) < today;
      }
      if (expiryStr.includes('/')) {
        const [month, year] = expiryStr.split('/').map(Number);
        const expiryDate = new Date(year, month, 0);
        return expiryDate < today;
      }
      const fallback = new Date(expiryStr);
      return isNaN(fallback.getTime()) ? false : fallback < today;
    } catch (e) {
      return false;
    }
  };

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available' && !isLicenseExpired(d.expiry));

  return (
    <div className="w-full h-full flex flex-col bg-primary text-primary overflow-hidden font-sans">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-border/50 bg-card">
        <div className="relative w-80">
          <input 
            type="text" 
            placeholder="Search trips by ID, route, status..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-1.5 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border transition-colors placeholder-muted text-primary shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-secondary">{userName}</span>
          <div className="flex items-center gap-2 pl-3 pr-1 py-1 border border-border/80 rounded-full shadow-sm bg-card">
            <span className="text-xs font-semibold text-accent">{userRole}</span>
            <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-[1600px] mx-auto">
          
          {/* Left Column: Create Trip */}
          <div className="flex flex-col gap-6">
            
            {/* Trip Lifecycle */}
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">
                Trip Lifecycle {selectedTrip ? `(${selectedTrip.id})` : ''}
              </h3>
              <div className="flex items-center justify-between relative px-4 py-2.5 bg-card/50 border border-border/40 rounded-xl">
                {/* Node 1: Draft */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-4 h-4 rounded-full transition-all duration-300 bg-green-500 ${currentStatus !== 'Cancelled' ? 'ring-2 ring-green-500/30' : ''}`}></div>
                  <span className="text-[10px] font-bold text-green-500">Draft</span>
                </div>

                {/* Line 1 */}
                <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                  (currentStatus === 'Dispatched' || currentStatus === 'Completed') ? 'bg-blue-500' : 'bg-border'
                }`}></div>

                {/* Node 2: Dispatched */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    (currentStatus === 'Dispatched' || currentStatus === 'Completed') 
                      ? 'bg-blue-500 border-2 border-primary ring-2 ring-blue-500' 
                      : 'bg-border'
                  }`}></div>
                  <span className={`text-[10px] font-bold transition-colors duration-300 ${
                    (currentStatus === 'Dispatched' || currentStatus === 'Completed') ? 'text-blue-500' : 'text-muted'
                  }`}>Dispatched</span>
                </div>

                {/* Line 2 */}
                <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                  currentStatus === 'Completed' ? 'bg-green-500' : 'bg-border'
                }`}></div>

                {/* Node 3: Completed */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    currentStatus === 'Completed' 
                      ? 'bg-green-500 border-2 border-primary ring-2 ring-green-500' 
                      : 'bg-border'
                  }`}></div>
                  <span className={`text-[10px] font-bold transition-colors duration-300 ${
                    currentStatus === 'Completed' ? 'text-green-500' : 'text-muted'
                  }`}>Completed</span>
                </div>

                {/* Line 3 */}
                <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                  currentStatus === 'Cancelled' ? 'bg-red-500' : 'bg-border'
                }`}></div>

                {/* Node 4: Cancelled */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    currentStatus === 'Cancelled' 
                      ? 'bg-red-500 border-2 border-primary ring-2 ring-red-500' 
                      : 'bg-border'
                  }`}></div>
                  <span className={`text-[10px] font-bold transition-colors duration-300 ${
                    currentStatus === 'Cancelled' ? 'text-red-500' : 'text-muted'
                  }`}>Cancelled</span>
                </div>
              </div>
            </div>

            {/* Create Trip Form */}
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Create Trip</h3>
              <form onSubmit={handleCreateTrip} className="space-y-4">
                
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Source</label>
                  <input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={source} onChange={e => setSource(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Destination</label>
                  <input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={destination} onChange={e => setDestination(e.target.value)} required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Vehicle (Available Only)</label>
                  <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm appearance-none cursor-pointer" value={selectedVehicleReg} onChange={e => setSelectedVehicleReg(e.target.value)} required>
                    <option value="">Select Vehicle...</option>
                    {availableVehicles.map(v => (
                      <option key={v.regNo} value={v.regNo}>{v.regNo} - {v.capacity} {v.capacityUnit}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Driver (Available Only)</label>
                  <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm appearance-none cursor-pointer" value={selectedDriverName} onChange={e => setSelectedDriverName(e.target.value)} required>
                    <option value="">Select Driver...</option>
                    {availableDrivers.map(d => (
                      <option key={d.name} value={d.name}>{d.name} ({d.category})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Cargo Weight</label>
                  <div className="flex gap-2">
                    <input type="number" className="flex-1 px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} required />
                    <select className="w-24 px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm appearance-none" value={cargoWeightUnit} onChange={e => setCargoWeightUnit(e.target.value)}>
                      <option value="kg">kg</option>
                      <option value="Ton">Ton</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Planned Distance (KM)</label>
                  <input type="number" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={plannedDistance} onChange={e => setPlannedDistance(e.target.value)} required />
                </div>

                {capacityError && (
                  <div className="p-4 mt-4 border border-red-500 rounded-xl bg-red-500/5">
                    <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><X size={14} /> {capacityError}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button type="submit" disabled={!!capacityError} className={"flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors " + (capacityError ? "bg-secondary/40 text-muted cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm")}>
                    Dispatch Trip
                  </button>
                  <button type="button" onClick={() => { setSource(''); setDestination(''); setCargoWeight(''); setPlannedDistance(''); setSelectedVehicleReg(''); setSelectedDriverName(''); }} className="flex-1 py-2.5 bg-transparent border border-border text-muted hover:text-primary hover:border-border rounded-md text-sm font-semibold transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Board */}
          <div className="flex flex-col h-full">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4 shrink-0">Live Board</h3>
            
            <div className="space-y-4">
              {trips.length === 0 && <p className="text-sm text-muted">No trips recorded yet.</p>}
              
              {filteredTrips.slice().reverse().map(trip => {
                let statusClass = "bg-border text-primary";
                if (trip.status === "Draft") statusClass = "bg-gray-400 text-white";
                else if (trip.status === "Dispatched") statusClass = "bg-blue-500 text-white";
                else if (trip.status === "Completed") statusClass = "bg-green-500 text-white";
                else if (trip.status === "Cancelled") statusClass = "bg-red-500 text-white";

                const isSelected = selectedTripId === trip.id;

                return (
                  <div 
                    key={trip.id} 
                    onClick={() => setSelectedTripId(trip.id)}
                    className={`p-5 border shadow-sm rounded-xl bg-card transition-all cursor-pointer space-y-3 ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    {/* Top Row: ID & Vehicle/Driver */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted uppercase tracking-widest">{trip.id}</span>
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">
                        {trip.vehicle || trip.driver ? (
                          `${trip.vehicle || 'Unassigned'} ${trip.driver ? '/ ' + trip.driver : ''}`
                        ) : 'Unassigned'}
                      </span>
                    </div>
                    
                    {/* Middle Row: Route & ETA */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-primary flex items-center gap-2">
                        {trip.source} <ArrowRight size={14} className="text-muted" /> {trip.destination}
                      </div>
                      <span className="text-xs font-semibold text-muted">
                        {trip.eta}
                      </span>
                    </div>

                    {/* Bottom Row: Status Badge & Control Buttons */}
                    <div className="flex justify-between items-center pt-2 border-t border-border/20">
                      <span className={"px-4 py-1.5 rounded-md text-xs font-medium " + statusClass}>
                        {trip.status}
                      </span>
                      
                      {trip.status === 'Dispatched' && isAuthorized && (
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteTrip(trip.id, trip.vehicle, trip.driver);
                            }} 
                            className="px-3 py-1 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors rounded text-xs font-semibold cursor-pointer"
                          >
                            Complete
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelTrip(trip.id, trip.vehicle, trip.driver);
                            }} 
                            className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 text-xs font-semibold text-muted text-center pt-8 border-t border-border/50">
              On Complete: odometer &rarr; fuel log &rarr; expenses &rarr; Vehicle & Driver Available
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
