import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function FuelExpense({ vehicles, fuelLogs, setFuelLogs, expenses, setExpenses, maintenanceLogs, currentUser }) {
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Fuel Form State
  const [fVehicle, setFVehicle] = useState('');
  const [fLiters, setFLiters] = useState('');
  const [fCost, setFCost] = useState('');
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0]);

  // Expense Form State
  const [eVehicle, setEVehicle] = useState('');
  const [eType, setEType] = useState('Tolls');
  const [eAmount, setEAmount] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eDate, setEDate] = useState(new Date().toISOString().split('T')[0]);

  const isAuthorized = currentUser?.role === 'Fleet Manager' || currentUser?.role === 'Financial Analyst';

  const handleLogFuel = (e) => {
    e.preventDefault();
    if (!isAuthorized) return;
    const newFuel = {
      id: 'F' + String(Math.floor(Math.random() * 9000) + 1000),
      vehicle: fVehicle,
      liters: Number(fLiters),
      cost: Number(fCost),
      date: fDate
    };
    setFuelLogs([...fuelLogs, newFuel]);
    setIsFuelModalOpen(false);
    setFVehicle(''); setFLiters(''); setFCost('');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!isAuthorized) return;
    const newExp = {
      id: 'E' + String(Math.floor(Math.random() * 9000) + 1000),
      vehicle: eVehicle,
      type: eType,
      amount: Number(eAmount),
      description: eDesc,
      date: eDate
    };
    setExpenses([...expenses, newExp]);
    setIsExpenseModalOpen(false);
    setEVehicle(''); setEAmount(''); setEDesc('');
  };

  // Calculations
  const totalFuelCost = fuelLogs.reduce((acc, curr) => acc + curr.cost, 0);
  const totalMaintCost = (maintenanceLogs || []).reduce((acc, curr) => acc + curr.cost, 0);
  const totalOtherExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost + totalOtherExpenses;

  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK';
  const userName = currentUser?.name || 'Raven K.';
  const userRole = currentUser?.role || 'Dispatcher';

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
        
        <div className="w-full space-y-12 max-w-[1600px] mx-auto">
          
          {/* FUEL LOGS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest">Fuel Logs</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsFuelModalOpen(true)} disabled={!isAuthorized} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-md text-sm font-semibold transition-colors shadow-sm">
                  + Log Fuel
                </button>
                <button onClick={() => setIsExpenseModalOpen(true)} disabled={!isAuthorized} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-md text-sm font-semibold transition-colors shadow-sm">
                  + Add Expense
                </button>
              </div>
            </div>

            <div className="w-full bg-card border border-border/80 rounded-md shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Vehicle</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Date</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Liters</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Fuel Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {fuelLogs.length === 0 && (
                    <tr><td colSpan="4" className="py-4 px-4 text-sm text-center text-muted">No fuel logs found.</td></tr>
                  )}
                  {fuelLogs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium">{log.vehicle}</td>
                      <td className="py-4 px-4 text-sm">{log.date}</td>
                      <td className="py-4 px-4 text-sm">{log.liters} L</td>
                      <td className="py-4 px-4 text-sm">{new Intl.NumberFormat('en-IN').format(log.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* OTHER EXPENSES SECTION */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest">Other Expenses (Toll / Misc)</h3>
            
            <div className="w-full bg-card border border-border/80 rounded-md shadow-sm overflow-hidden border-b-4 border-b-primary">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Vehicle</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Expense Type</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Date</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Description</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {expenses.length === 0 && (
                    <tr><td colSpan="5" className="py-4 px-4 text-sm text-center text-muted">No expenses recorded.</td></tr>
                  )}
                  {expenses.slice().reverse().map((expense) => (
                    <tr key={expense.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium">{expense.vehicle}</td>
                      <td className="py-4 px-4 text-sm">{expense.type}</td>
                      <td className="py-4 px-4 text-sm">{expense.date}</td>
                      <td className="py-4 px-4 text-sm">{expense.description}</td>
                      <td className="py-4 px-4 text-sm font-medium">{new Intl.NumberFormat('en-IN').format(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="w-full pt-4 flex items-center justify-between border-t-4 border-t-primary dark:border-t-white/80">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                Total Operational Cost (Auto) = Fuel + Maint + Expenses
              </span>
              <span className="text-lg font-bold text-orange-500">
                ₹ {new Intl.NumberFormat('en-IN').format(totalOperationalCost)}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Fuel Modal */}
      <AnimatePresence>
        {isFuelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setIsFuelModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-md overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card">
                <h3 className="text-lg font-bold text-primary">Log Fuel</h3>
                <button onClick={() => setIsFuelModalOpen(false)} className="p-2 text-muted hover:text-primary transition-colors bg-secondary/30 rounded-md border border-border"><X size={16} /></button>
              </div>
              <div className="p-6">
                <form id="fuel-form" onSubmit={handleLogFuel} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Vehicle</label>
                    <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm appearance-none cursor-pointer" value={fVehicle} onChange={e => setFVehicle(e.target.value)} required>
                      <option value="">Select Vehicle...</option>
                      {vehicles.map(v => <option key={v.regNo} value={v.regNo}>{v.regNo} ({v.name})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Liters</label>
                    <input type="number" step="0.1" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={fLiters} onChange={e => setFLiters(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Total Cost (₹)</label>
                    <input type="number" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={fCost} onChange={e => setFCost(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Date</label>
                    <input type="date" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={fDate} onChange={e => setFDate(e.target.value)} required />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-border/50 bg-card flex justify-end gap-3">
                <button type="button" onClick={() => setIsFuelModalOpen(false)} className="px-6 py-2 bg-secondary/10 hover:bg-secondary/20 text-primary rounded-md text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" form="fuel-form" className="px-8 py-2 bg-primary text-secondary rounded-md text-sm font-semibold transition-colors">Save Fuel Log</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setIsExpenseModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-md overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card">
                <h3 className="text-lg font-bold text-primary">Add Expense</h3>
                <button onClick={() => setIsExpenseModalOpen(false)} className="p-2 text-muted hover:text-primary transition-colors bg-secondary/30 rounded-md border border-border"><X size={16} /></button>
              </div>
              <div className="p-6">
                <form id="expense-form" onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Vehicle</label>
                    <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm appearance-none cursor-pointer" value={eVehicle} onChange={e => setEVehicle(e.target.value)} required>
                      <option value="">Select Vehicle...</option>
                      {vehicles.map(v => <option key={v.regNo} value={v.regNo}>{v.regNo} ({v.name})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Expense Type</label>
                    <select className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm appearance-none cursor-pointer" value={eType} onChange={e => setEType(e.target.value)} required>
                      <option value="Tolls">Tolls</option>
                      <option value="Fines">Fines / Challans</option>
                      <option value="Parking">Parking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Amount (₹)</label>
                    <input type="number" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={eAmount} onChange={e => setEAmount(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Description</label>
                    <input type="text" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={eDesc} onChange={e => setEDesc(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Date</label>
                    <input type="date" className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm" value={eDate} onChange={e => setEDate(e.target.value)} required />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-border/50 bg-card flex justify-end gap-3">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-6 py-2 bg-secondary/10 hover:bg-secondary/20 text-primary rounded-md text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" form="expense-form" className="px-8 py-2 bg-primary text-secondary rounded-md text-sm font-semibold transition-colors">Save Expense</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
