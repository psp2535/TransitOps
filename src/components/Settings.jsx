import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function Settings({ currentUser }) {
  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK';
  const userName = currentUser?.name || 'Raven K.';
  const userRole = currentUser?.role || 'Dispatcher';

  const [depotName, setDepotName] = useState('Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState('INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');

  const rbacData = [
    { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '-', fuel: '-', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'View', drivers: '-', trips: '✓', fuel: '-', analytics: '-' },
    { role: 'Safety Officer', fleet: '-', drivers: '✓', trips: 'View', fuel: '-', analytics: '-' },
    { role: 'Financial Analyst', fleet: 'View', drivers: '-', trips: '-', fuel: '✓', analytics: '✓' }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-primary text-primary overflow-hidden font-sans">
      
      {/* Top Bar */}
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 max-w-7xl">
          
          {/* Left Column: General */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">General</h3>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Depot Name</label>
                <input 
                  type="text" 
                  value={depotName}
                  onChange={(e) => setDepotName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Currency</label>
                <input 
                  type="text" 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Distance Unit</label>
                <input 
                  type="text" 
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="w-full px-4 py-2.5 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-semibold transition-colors shadow-sm">
                  Save changes
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Role-Based Access (RBAC) */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-8 shrink-0">Role-Based Access (RBAC)</h3>
            
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Role</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Fleet</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Drivers</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Trips</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Fuel/Exp.</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {rbacData.map((row, index) => (
                    <tr key={index} className="hover:bg-secondary/5 transition-colors">
                      <td className="py-4 px-4 text-sm font-semibold text-primary">{row.role}</td>
                      <td className="py-4 px-4 text-sm text-secondary">{row.fleet === '✓' ? <Check size={16} /> : row.fleet}</td>
                      <td className="py-4 px-4 text-sm text-secondary">{row.drivers === '✓' ? <Check size={16} /> : row.drivers}</td>
                      <td className="py-4 px-4 text-sm text-secondary">{row.trips === '✓' ? <Check size={16} /> : row.trips}</td>
                      <td className="py-4 px-4 text-sm text-secondary">{row.fuel === '✓' ? <Check size={16} /> : row.fuel}</td>
                      <td className="py-4 px-4 text-sm text-secondary">{row.analytics === '✓' ? <Check size={16} /> : row.analytics}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
