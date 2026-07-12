import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VehicleRegistry({ vehicles, setVehicles, currentUser }) {
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [editingRegNo, setEditingRegNo] = useState('');
  
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

  const isManager = currentUser?.role === 'Fleet Manager';

  let filteredVehicles = vehicles.filter((v) => {
    const matchType = filterType === 'All' || v.type.toLowerCase() === filterType.toLowerCase();
    const matchStatus = filterStatus === 'All' || v.status.toLowerCase() === filterStatus.toLowerCase();
    const matchSearch = v.regNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  // Backend handles seed data, no local override needed

  const openAddModal = () => {
    setModalMode('add');
    setValidationError('');
    setRegNo(''); setName(''); setType('Van'); setCapacity(''); setCapacityUnit('kg');
    setOdometer(''); setAcqCost(''); setStatus('Available'); setRegion('North');
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setModalMode('edit');
    setValidationError('');
    setEditingRegNo(vehicle.regNo);
    setRegNo(vehicle.regNo); setName(vehicle.name); setType(vehicle.type);
    setCapacity(vehicle.capacity); setCapacityUnit(vehicle.capacityUnit);
    setOdometer(vehicle.odometer); setAcqCost(vehicle.acqCost); setStatus(vehicle.status);
    setRegion(vehicle.region || 'North');
    setIsModalOpen(true);
  };

  const handleDelete = (regToDelete) => {
    if (window.confirm("Are you sure you want to delete vehicle?")) {
      setVehicles(vehicles.filter((v) => v.regNo !== regToDelete));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (modalMode === 'add') {
      if (vehicles.some((v) => v.regNo.toLowerCase() === regNo.trim().toLowerCase())) {
        setValidationError(`Registration Number "${regNo.trim()}" must be unique.`);
        return;
      }
    } else {
      if (vehicles.some((v) => v.regNo.toLowerCase() === regNo.trim().toLowerCase() && v.regNo !== editingRegNo)) {
        setValidationError(`Registration Number "${regNo.trim()}" must be unique.`);
        return;
      }
    }

    const vehicleData = {
      regNo: regNo.trim().toUpperCase(), name: name.trim(), type,
      capacity: Number(capacity), capacityUnit, odometer: Number(odometer),
      acqCost: Number(acqCost), status, region
    };

    if (modalMode === 'add') setVehicles([...vehicles, vehicleData]);
    else setVehicles(vehicles.map((v) => (v.regNo === editingRegNo ? vehicleData : v)));

    setIsModalOpen(false);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN').format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-IN').format(val);

  const initials = currentUser?.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'RK';
  const userName = currentUser?.name || 'Raven K.';
  const userRole = currentUser?.role || 'Dispatcher';

  return (
    <div className="w-full h-full flex flex-col bg-primary text-primary overflow-hidden font-sans">
      
      {/* Top Bar matching wireframe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-3 border-b border-border/50 bg-card">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-1.5 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border transition-colors placeholder-muted text-primary shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-secondary">{userName}</span>
          <div className="flex items-center gap-2 pl-3 pr-1 py-1 border border-border/80 rounded-full shadow-sm bg-card">
            <span className="text-xs font-semibold text-electric">{userRole}</span>
            <div className="w-6 h-6 rounded-full bg-electric text-void flex items-center justify-center text-[10px] font-bold">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Filters and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative shadow-sm rounded-md">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-sm bg-card border border-border/80 rounded-md px-4 py-1.5 text-primary outline-none focus:border-border appearance-none pr-8 min-w-[140px] cursor-pointer">
                <option value="All">Type: All</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Mini">Mini</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">▼</div>
            </div>
            
            <div className="relative shadow-sm rounded-md">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm bg-card border border-border/80 rounded-md px-4 py-1.5 text-primary outline-none focus:border-border appearance-none pr-8 min-w-[140px] cursor-pointer">
                <option value="All">Status: All</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">▼</div>
            </div>

            <div className="relative shadow-sm rounded-md w-64">
              <input 
                type="text" 
                placeholder="Search reg. no..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-1.5 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border transition-colors placeholder-muted text-primary"
              />
            </div>
          </div>
          
          {isManager && (
            <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-semibold transition-colors shadow-sm">
              <span>+</span> Add Vehicle
            </button>
          )}
        </div>

        {/* Main Table Container */}
        <div className="bg-card border border-border/80 rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Reg. No. (Unique)</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Name/Model</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Type</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Capacity</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Odometer</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Acq. Cost</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredVehicles.map((vehicle) => {
                  let statusClass = "bg-border text-primary";
                  if (vehicle.status === "Available") statusClass = "bg-green-500 text-white";
                  else if (vehicle.status === "On Trip" || vehicle.status === "On Mission") statusClass = "bg-blue-500 text-white";
                  else if (vehicle.status === "In Shop" || vehicle.status === "In Maintenance") statusClass = "bg-orange-500 text-white";
                  else if (vehicle.status === "Retired") statusClass = "bg-red-500 text-white";

                  return (
                    <tr key={vehicle.regNo} className="hover:bg-secondary/5 transition-all duration-200 cursor-pointer hover:translate-x-0.5 active:scale-[0.99]" onClick={() => openEditModal(vehicle)}>
                      <td className="py-4 px-6 text-sm font-medium">{vehicle.regNo}</td>
                      <td className="py-4 px-6 text-sm">{vehicle.name}</td>
                      <td className="py-4 px-6 text-sm">{vehicle.type}</td>
                      <td className="py-4 px-6 text-sm">{formatNumber(vehicle.capacity)} {vehicle.capacityUnit}</td>
                      <td className="py-4 px-6 text-sm">{formatNumber(vehicle.odometer)}</td>
                      <td className="py-4 px-6 text-sm">{formatCurrency(vehicle.acqCost)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-4 py-1.5 rounded-md text-xs font-medium ${statusClass}`}>
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Rule Footer */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-orange-500">
            Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-void/80 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card">
                <h3 className="text-lg font-bold text-primary">{modalMode === 'add' ? 'Add New Vehicle' : isManager ? 'Edit Vehicle' : 'Vehicle Details (Read Only)'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted hover:text-primary transition-colors bg-secondary/30 rounded-md border border-border">
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-6">
                  {validationError && (
                    <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 flex gap-3 text-sm items-start">
                      <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                      <p>{validationError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Registration Number</label>
                      <input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border disabled:opacity-50" value={regNo} onChange={(e) => setRegNo(e.target.value)} required disabled={modalMode === 'edit' || !isManager} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Name/Model</label>
                      <input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border disabled:opacity-50" value={name} onChange={(e) => setName(e.target.value)} required disabled={!isManager} />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Vehicle Type</label>
                      <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border appearance-none cursor-pointer disabled:opacity-50" value={type} onChange={(e) => setType(e.target.value)} disabled={!isManager}>
                        <option value="Van">Van</option>
                        <option value="Truck">Truck</option>
                        <option value="Mini">Mini</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Load Capacity</label>
                      <div className="flex gap-2">
                        <input type="number" className="flex-1 px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border disabled:opacity-50" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" required disabled={!isManager} />
                        <select className="w-24 px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border appearance-none cursor-pointer disabled:opacity-50" value={capacityUnit} onChange={(e) => setCapacityUnit(e.target.value)} disabled={!isManager}>
                          <option value="kg">kg</option>
                          <option value="Ton">Ton</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Odometer (KM)</label>
                      <input type="number" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border disabled:opacity-50" value={odometer} onChange={(e) => setOdometer(e.target.value)} min="0" required disabled={!isManager} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Acquisition Cost (INR)</label>
                      <input type="number" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border disabled:opacity-50" value={acqCost} onChange={(e) => setAcqCost(e.target.value)} min="0" required disabled={!isManager} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Status</label>
                      <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border disabled:opacity-50 appearance-none cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)} disabled={!isManager}>
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="In Shop">In Shop</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Operational Region</label>
                      <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border appearance-none cursor-pointer disabled:opacity-50" value={region} onChange={(e) => setRegion(e.target.value)} disabled={!isManager}>
                        <option value="North">North</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="South">South</option>
                      </select>
                    </div>
                  </div>
                  
                  {modalMode === 'edit' && isManager && (
                    <div className="pt-4 flex justify-between border-t border-border/50">
                      <button type="button" onClick={() => { handleDelete(regNo); setIsModalOpen(false); }} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
                        <Trash2 size={16} /> Delete Vehicle
                      </button>
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-border/50 bg-card flex justify-end gap-3">
                {isManager ? (
                  <>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-secondary/10 hover:bg-secondary/20 text-primary rounded-md text-sm font-semibold transition-colors">
                      Cancel
                    </button>
                    <button type="submit" form="vehicle-form" className="px-8 py-2 bg-primary text-secondary rounded-md text-sm font-semibold transition-colors">
                      {modalMode === 'add' ? 'Add Vehicle' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-semibold transition-colors">
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
