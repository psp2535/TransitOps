import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function Maintenance({ maintenanceLogs, setMaintenanceLogs, vehicles, setVehicles, currentUser }) {
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('In Shop');
  const [formError, setFormError] = useState('');

  const isAuthorized = currentUser?.role === 'Fleet Manager';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthorized) return;
    setFormError('');

    if (!selectedVehicleReg || !serviceType || !cost || !date || !status) {
      setFormError('All required fields must be filled.');
      return;
    }

    const newLog = {
      id: 'M' + String(Math.floor(Math.random() * 9000) + 1000),
      vehicle: selectedVehicleReg,
      type: serviceType,
      cost: Number(cost),
      description,
      status,
      date
    };

    setMaintenanceLogs([...maintenanceLogs, newLog]);

    // Update vehicle status
    if (status === 'In Shop') {
      setVehicles(vehicles.map(v => v.regNo === selectedVehicleReg ? { ...v, status: 'In Shop' } : v));
    }

    // Reset
    setSelectedVehicleReg('');
    setServiceType('');
    setCost('');
    setDescription('');
    setStatus('In Shop');
  };

  const handleComplete = (logId, vehicleReg) => {
    if (!isAuthorized) return;
    setMaintenanceLogs(maintenanceLogs.map(log => log.id === logId ? { ...log, status: 'Completed' } : log));
    setVehicles(vehicles.map(v => v.regNo === vehicleReg ? { ...v, status: 'Available' } : v));
  };

  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK';
  const userName = currentUser?.name || 'Raven K.';
  const userRole = currentUser?.role || 'Dispatcher';

  const availableVehicles = vehicles.filter(v => v.status === 'Available' || v.status === 'In Shop');

  return (
    <div className="w-full h-full flex flex-col bg-primary text-primary overflow-hidden font-sans">
      
      {/* Top Bar matching wireframe */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-border/50 bg-card">
        <div className="relative w-80">
          <input 
            type="text" 
            placeholder="Search..." 
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
          
          {/* Left Column: Log Service Record */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Log Service Record</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Vehicle</label>
                  <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm appearance-none cursor-pointer" value={selectedVehicleReg} onChange={e => setSelectedVehicleReg(e.target.value)} required>
                    <option value="">Select Vehicle...</option>
                    {availableVehicles.map(v => (
                      <option key={v.regNo} value={v.regNo}>{v.regNo} - {v.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Service Type</label>
                  <input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" placeholder="e.g. Oil Change, Tyre Replacement" value={serviceType} onChange={e => setServiceType(e.target.value)} required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Cost (INR)</label>
                  <input type="number" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" placeholder="2500" value={cost} onChange={e => setCost(e.target.value)} required min="0" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Description</label>
                  <textarea className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm resize-none" placeholder="Details about the service..." value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Date</label>
                  <input type="date" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Status</label>
                  <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm appearance-none cursor-pointer" value={status} onChange={e => setStatus(e.target.value)} required>
                    <option value="In Shop">In Shop (Vehicle unavailable)</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-4">
                  <button type="submit" disabled={!isAuthorized} className={"flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors " + (isAuthorized ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm" : "bg-secondary/40 text-muted cursor-not-allowed")}>
                    Log Maintenance
                  </button>
                  <button type="button" onClick={() => { setSelectedVehicleReg(''); setServiceType(''); setCost(''); setDescription(''); setStatus('In Shop'); }} className="flex-1 py-2.5 bg-transparent border border-border text-muted hover:text-primary hover:border-border rounded-md text-sm font-semibold transition-colors">
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Diagram and Note */}
            <div className="pt-4 flex flex-col gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-green-500 w-16">Available</span>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-px bg-border relative">
                    <ArrowRight size={14} className="absolute -right-1 -top-1.5 text-muted" />
                  </div>
                  <span className="text-[10px] text-muted -mt-1.5 bg-primary px-2 z-10">creating active record</span>
                </div>
                <span className="text-orange-500 w-16">In Shop</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-orange-500 w-16">In Shop</span>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-px bg-border relative">
                    <ArrowRight size={14} className="absolute -right-1 -top-1.5 text-muted" />
                  </div>
                  <span className="text-[10px] text-muted -mt-1.5 bg-primary px-2 z-10">closing record (not retired)</span>
                </div>
                <span className="text-green-500 w-16">Available</span>
              </div>

              <p className="text-xs font-semibold text-orange-500 mt-2">
                Note: In Shop vehicles are removed from the dispatch pool.
              </p>
            </div>
          </div>

          {/* Right Column: Service Log */}
          <div className="flex flex-col h-full">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4 shrink-0">Service Log</h3>
            
            <div className="bg-card border border-border shadow-sm rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Vehicle</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Service</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Cost (₹)</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Date</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {maintenanceLogs.length === 0 && (
                      <tr><td colSpan="5" className="py-4 px-6 text-sm text-center text-muted">No maintenance logs found.</td></tr>
                    )}
                    {maintenanceLogs.slice().reverse().map((log) => {
                      let statusClass = "bg-border text-primary";
                      if (log.status === "In Shop") statusClass = "bg-orange-500 text-white";
                      else if (log.status === "Completed") statusClass = "bg-green-500 text-white";

                      return (
                        <tr key={log.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium">{log.vehicle}</td>
                          <td className="py-4 px-6 text-sm">{log.type}</td>
                          <td className="py-4 px-6 text-sm font-medium">{new Intl.NumberFormat('en-IN').format(log.cost)}</td>
                          <td className="py-4 px-6 text-sm">{log.date}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className={"px-4 py-1.5 rounded-md text-xs font-medium " + statusClass}>
                                {log.status}
                              </span>
                              {log.status === 'In Shop' && isAuthorized && (
                                <button onClick={() => handleComplete(log.id, log.vehicle)} className="p-1 rounded-md text-green-500 hover:bg-green-500/10 transition-colors" title="Mark as Completed">
                                  <Check size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
