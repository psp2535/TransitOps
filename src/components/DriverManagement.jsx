import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DriverManagement({ drivers, setDrivers, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverName, setSelectedDriverName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingDriverName, setEditingDriverName] = useState('');
  
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [category, setCategory] = useState('LMV');
  const [expiry, setExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [tripCompl, setTripCompl] = useState('100%');
  const [safetyScore, setSafetyScore] = useState(100);
  const [status, setStatus] = useState('Available');
  const [validationError, setValidationError] = useState('');

  const isAuthorized = currentUser?.role === 'Safety Officer' || currentUser?.role === 'Fleet Manager' || currentUser?.role === 'Dispatcher';

  let filteredDrivers = drivers.filter((d) => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.licenseNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Backend handles seed data, no local override needed

  const checkLicenseExpired = (expiryDateStr) => {
    if (!expiryDateStr) return true;
    if (expiryDateStr.toUpperCase().includes('EXPIRED')) return true;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDateStr.includes('-')) {
        return new Date(expiryDateStr) < today;
      }
      if (expiryDateStr.includes('/')) {
        const [month, year] = expiryDateStr.split('/').map(Number);
        const expiryDate = new Date(year, month, 0);
        return expiryDate < today;
      }
      const fallback = new Date(expiryDateStr);
      return isNaN(fallback.getTime()) ? false : fallback < today;
    } catch (e) {
      return false;
    }
  };

  const openAddModal = () => {
    setModalMode('add'); setValidationError('');
    setName(''); setLicenseNo(''); setCategory('LMV'); setExpiry('');
    setContact(''); setTripCompl('100%'); setSafetyScore(100); setStatus('Available');
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    setModalMode('edit'); setValidationError('');
    setEditingDriverName(driver.name); setName(driver.name);
    setLicenseNo(driver.licenseNo); setCategory(driver.category); setExpiry(driver.expiry);
    setContact(driver.contact); setTripCompl(driver.tripCompl); setSafetyScore(driver.safetyScore);
    setStatus(driver.status);
    setIsModalOpen(true);
  };

  const handleDelete = (nameToDelete) => {
    if (window.confirm("Are you sure you want to delete driver?")) {
      setDrivers(drivers.filter((d) => d.name !== nameToDelete));
      if (selectedDriverName === nameToDelete) setSelectedDriverName('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (modalMode === 'add') {
      if (drivers.some((d) => d.name.toLowerCase() === name.trim().toLowerCase())) return setValidationError("Driver already exists.");
      if (drivers.some((d) => d.licenseNo.toLowerCase() === licenseNo.trim().toLowerCase())) return setValidationError("License already registered.");
    } else {
      if (drivers.some((d) => d.licenseNo.toLowerCase() === licenseNo.trim().toLowerCase() && d.name !== editingDriverName)) {
        return setValidationError("License already registered to another driver.");
      }
    }

    const driverData = { name: name.trim(), licenseNo: licenseNo.trim().toUpperCase(), category, expiry, contact: contact.trim(), tripCompl, safetyScore: isNaN(Number(safetyScore)) ? safetyScore : Number(safetyScore), status };

    if (modalMode === 'add') {
      setDrivers([...drivers, driverData]);
    } else {
      setDrivers(drivers.map((d) => (d.name === editingDriverName ? driverData : d)));
    }
    setIsModalOpen(false);
  };

  const handleQuickStatusToggle = (newStatus) => {
    if (!isAuthorized || !selectedDriverName) return;
    setDrivers(drivers.map((d) => d.name === selectedDriverName ? { ...d, status: newStatus } : d));
  };

  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK';
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
        {/* Toolbar */}
        <div className="flex justify-end">
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-semibold transition-colors shadow-sm">
            <span>+</span> Add Driver
          </button>
        </div>

        {/* Main Table Container */}
        <div className="bg-card border border-border/80 rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Driver</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">License No.</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Category</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Expiry</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Contact</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Trip Compl.</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Safety</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Status</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredDrivers.map((driver) => {
                  const expired = checkLicenseExpired(driver.expiry);
                  
                  let safetyClass = "bg-border text-primary";
                  const score = Number(driver.safetyScore);
                  if (isNaN(score)) {
                    if (driver.safetyScore === "On Trip") safetyClass = "bg-blue-500 text-white";
                    else if (driver.safetyScore === "Suspended") safetyClass = "bg-orange-500 text-white";
                    else safetyClass = "bg-green-500 text-white";
                  } else {
                    if (score >= 90) safetyClass = "bg-green-500 text-white";
                    else if (score >= 75) safetyClass = "bg-blue-500 text-white";
                    else safetyClass = "bg-orange-500 text-white";
                  }

                  let statusClass = "bg-border text-primary";
                  if (driver.status === "Available") statusClass = "bg-green-500 text-white";
                  else if (driver.status === "On Trip") statusClass = "bg-blue-500 text-white";
                  else if (driver.status === "Suspended") statusClass = "bg-orange-500 text-white";
                  else if (driver.status === "Off Duty") statusClass = "bg-gray-500 text-white";

                  const isSelected = selectedDriverName === driver.name;

                  return (
                    <tr key={driver.name} className={"transition-all duration-200 cursor-pointer hover:translate-x-0.5 active:scale-[0.99] " + (isSelected ? "bg-primary/20" : "hover:bg-secondary/5")} onClick={() => setSelectedDriverName(driver.name)}>
                      <td className="py-4 px-6 text-sm">{driver.name}</td>
                      <td className="py-4 px-6 text-sm">{driver.licenseNo}</td>
                      <td className="py-4 px-6 text-sm">{driver.category}</td>
                      <td className="py-4 px-6 text-sm">
                        {driver.expiry} {expired && <span className="text-[10px] font-bold uppercase tracking-wider text-primary ml-1">EXPIRED</span>}
                      </td>
                      <td className="py-4 px-6 text-sm">{driver.contact}</td>
                      <td className="py-4 px-6 text-sm">{driver.tripCompl}</td>
                      <td className="py-4 px-6">
                        <span className={"px-4 py-1.5 rounded-md text-xs font-medium " + safetyClass}>
                          {driver.safetyScore}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={"px-4 py-1.5 rounded-md text-xs font-medium " + statusClass}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(driver);
                            }}
                            className="p-1.5 hover:bg-secondary/20 rounded-md text-secondary hover:text-primary transition-colors border border-border/50 cursor-pointer"
                            title="Edit Driver"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(driver.name);
                            }}
                            className="p-1.5 hover:bg-red-500/20 rounded-md text-red-500 transition-colors border border-red-500/20 cursor-pointer"
                            title="Delete Driver"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Toggle Status */}
        <div className="pt-2 flex flex-col gap-3">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Toggle Status</div>
          <div className="flex gap-4">
            <button onClick={() => handleQuickStatusToggle('Available')} className="px-6 py-2 bg-green-500 text-white rounded-md text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">Available</button>
            <button onClick={() => handleQuickStatusToggle('On Trip')} className="px-6 py-2 bg-blue-500 text-white rounded-md text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">On Trip</button>
            <button onClick={() => handleQuickStatusToggle('Off Duty')} className="px-6 py-2 bg-gray-500 text-white rounded-md text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">Off Duty</button>
            <button onClick={() => handleQuickStatusToggle('Suspended')} className="px-6 py-2 bg-orange-500 text-white rounded-md text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">Suspended</button>
          </div>
          <p className="text-xs font-semibold text-orange-500 mt-2">
            Rule: Expired license or Suspended status {"->"} blocked from trip assignment
          </p>
        </div>

      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card">
                <h3 className="text-lg font-bold text-primary">{modalMode === 'add' ? 'Add Driver Profile' : 'Edit Driver Profile'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted hover:text-primary transition-colors bg-secondary/30 rounded-md border border-border"><X size={16} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="driver-form" onSubmit={handleSubmit} className="space-y-6">
                  {validationError && (
                    <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 flex gap-3 text-sm items-start">
                      <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                      <p>{validationError}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-muted uppercase tracking-wider">Full Name</label><input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border disabled:opacity-50" value={name} onChange={(e) => setName(e.target.value)} required disabled={modalMode === 'edit'} /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-muted uppercase tracking-wider">License Number</label><input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-muted uppercase tracking-wider">License Category</label><select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border appearance-none cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}><option value="LMV">LMV</option><option value="HMV">HMV</option><option value="MCWG">MCWG</option></select></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-muted uppercase tracking-wider">Expiry Date</label><input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border" value={expiry} onChange={(e) => setExpiry(e.target.value)} required placeholder="MM/YYYY" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-muted uppercase tracking-wider">Contact Number</label><input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border" value={contact} onChange={(e) => setContact(e.target.value)} required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-muted uppercase tracking-wider">Safety Score (0-100)</label><input type="number" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border" value={safetyScore} onChange={(e) => setSafetyScore(e.target.value)} min="0" max="100" required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-muted uppercase tracking-wider">Completion Rate</label><input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border" value={tripCompl} onChange={(e) => setTripCompl(e.target.value)} required /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-muted uppercase tracking-wider">Status</label><select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border disabled:opacity-50 appearance-none cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)} disabled={modalMode === 'add'}><option value="Available">Available</option><option value="On Trip">On Trip</option><option value="Off Duty">Off Duty</option><option value="Suspended">Suspended</option></select></div>
                  </div>
                  {modalMode === 'edit' && (
                    <div className="pt-4 flex justify-between border-t border-border/50">
                      <button type="button" onClick={() => { handleDelete(name); setIsModalOpen(false); }} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
                        <Trash2 size={16} /> Delete Driver
                      </button>
                    </div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-border/50 bg-card flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-secondary/10 hover:bg-secondary/20 text-primary rounded-md text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" form="driver-form" className="px-8 py-2 bg-primary text-secondary rounded-md text-sm font-semibold transition-colors">{modalMode === 'add' ? 'Add Driver' : 'Save Changes'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
