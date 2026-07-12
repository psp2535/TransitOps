import React, { useState, useEffect } from 'react';
import { Trash2, ShieldAlert } from 'lucide-react';

export default function Settings({ currentUser, users = [], setUsers, lockedEmails = [], setLockedEmails, settings = {}, setSettings }) {
  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK';
  const userName = currentUser?.name || 'Raven K.';
  const userRole = currentUser?.role || 'Dispatcher';

  const [depotName, setDepotName] = useState(settings.depotName || 'Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState(settings.currency || 'INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit || 'Kilometers');

  useEffect(() => {
    if (settings) {
      setDepotName(settings.depotName || 'Gandhinagar Depot GJ4');
      setCurrency(settings.currency || 'INR (Rs)');
      setDistanceUnit(settings.distanceUnit || 'Kilometers');
    }
  }, [settings]);

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Dispatcher');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleUnlockUser = (emailToUnlock) => {
    if (window.confirm(`Are you sure you want to unlock account: ${emailToUnlock}?`)) {
      setLockedEmails(lockedEmails.filter(e => e.toLowerCase() !== emailToUnlock.toLowerCase()));
      try {
        const map = JSON.parse(localStorage.getItem('failedAttemptsMap') || '{}');
        delete map[emailToUnlock.toLowerCase()];
        localStorage.setItem('failedAttemptsMap', JSON.stringify(map));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const rbacData = [
    { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '-', fuel: '-', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'View', drivers: '-', trips: '✓', fuel: '-', analytics: '-' },
    { role: 'Safety Officer', fleet: '-', drivers: '✓', trips: 'View', fuel: '-', analytics: '-' },
    { role: 'Financial Analyst', fleet: 'View', drivers: '-', trips: '-', fuel: '✓', analytics: '✓' }
  ];

  const handleAddUser = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim() || !newRole) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setErrorMsg('A user with this email already exists.');
      return;
    }

    const newUser = {
      email: newEmail.trim().toLowerCase(),
      password: newPassword,
      role: newRole,
      name: newName.trim()
    };

    setUsers([...users, newUser]);

    // Reset form fields
    setNewEmail('');
    setNewPassword('');
    setNewName('');
    setNewRole('Dispatcher');
  };

  const handleDeleteUser = (emailToDelete) => {
    if (emailToDelete === currentUser.email) {
      alert('You cannot delete your own account while logged in.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user: ${emailToDelete}?`)) {
      setUsers(users.filter(u => u.email !== emailToDelete));
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-primary text-primary overflow-hidden font-sans">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-border/50 bg-card">
        <div className="relative w-80">
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
            <span className="text-xs font-semibold text-accent">{userRole}</span>
            <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 max-w-[1600px] mx-auto">
          
          {/* Left Column: General */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest">General Settings</h3>
            
            <div className="p-6 bg-card border border-border shadow-sm rounded-xl">
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                setSettings({
                  depotName,
                  currency,
                  distanceUnit
                });
                alert('General settings saved successfully!');
              }}>
                <div className="space-y-6">
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
                </div>

                <div className="pt-6 border-t border-border/40 mt-6">
                  <button type="submit" className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-semibold transition-colors shadow-sm">
                    Save General Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Role-Based Access (RBAC) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest">Role Permissions (RBAC)</h3>
            
            <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Role</th>
                      <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Fleet</th>
                      <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Drivers</th>
                      <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Trips</th>
                      <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Fuel/Exp.</th>
                      <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Analytics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {rbacData.map((row, index) => (
                      <tr key={index} className="hover:bg-secondary/5 transition-colors">
                        <td className="py-4 px-6 text-sm font-semibold text-primary">{row.role}</td>
                        <td className="py-4 px-6 text-sm">
                          {row.fleet === '✓' ? <span className="text-green-500 font-semibold">✓ Full</span> : row.fleet === 'View' ? <span className="text-blue-500 text-xs font-semibold">View</span> : <span className="text-muted/40 font-semibold">-</span>}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {row.drivers === '✓' ? <span className="text-green-500 font-semibold">✓ Full</span> : row.drivers === 'View' ? <span className="text-blue-500 text-xs font-semibold">View</span> : <span className="text-muted/40 font-semibold">-</span>}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {row.trips === '✓' ? <span className="text-green-500 font-semibold">✓ Full</span> : row.trips === 'View' ? <span className="text-blue-500 text-xs font-semibold">View</span> : <span className="text-muted/40 font-semibold">-</span>}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {row.fuel === '✓' ? <span className="text-green-500 font-semibold">✓ Full</span> : row.fuel === 'View' ? <span className="text-blue-500 text-xs font-semibold">View</span> : <span className="text-muted/40 font-semibold">-</span>}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {row.analytics === '✓' ? <span className="text-green-500 font-semibold">✓ Full</span> : row.analytics === 'View' ? <span className="text-blue-500 text-xs font-semibold">View</span> : <span className="text-muted/40 font-semibold">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* User Registry & Accounts Section */}
        <div className="border-t border-border/50 pt-12 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
            
            {/* User List */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest">User Registry</h3>
              
              <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Name</th>
                        <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Email</th>
                        <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Role</th>
                        <th className="py-3.5 px-6 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {users.filter(u => {
                        return searchQuery === '' ||
                          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchQuery.toLowerCase());
                      }).map((u) => {
                        const isSelf = u.email === currentUser?.email;
                        const isLocked = lockedEmails.includes(u.email.toLowerCase());
                        return (
                          <tr key={u.email} className="hover:bg-secondary/5 transition-colors">
                            <td className="py-4 px-6 text-sm font-semibold">
                              {u.name} 
                              {isSelf && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded ml-1 font-semibold">You</span>}
                              {isLocked && <span className="text-[9px] bg-red-500/15 text-red-500 px-1.5 py-0.5 rounded ml-1 font-extrabold uppercase tracking-wide">Locked</span>}
                            </td>
                            <td className="py-4 px-6 text-sm text-secondary">{u.email}</td>
                            <td className="py-4 px-6 text-sm">
                              <span className="text-xs font-medium bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-md">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {isLocked && (
                                  <button
                                    onClick={() => handleUnlockUser(u.email)}
                                    className="text-[11px] text-green-500 hover:text-green-600 bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded font-semibold transition-colors"
                                    title="Unlock account"
                                  >
                                    Unlock
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(u.email)}
                                  disabled={isSelf}
                                  className="text-red-500 hover:text-red-600 disabled:opacity-30 p-1.5 hover:bg-red-500/10 rounded transition-colors"
                                  title={isSelf ? "Cannot delete yourself" : "Delete user"}
                                >
                                  <Trash2 size={16} className="inline" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Create New User */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest">Create New Account</h3>
              
              <div className="p-6 bg-card border border-border shadow-sm rounded-xl">
                <form onSubmit={handleAddUser} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-xs font-semibold flex gap-2 items-center">
                      <ShieldAlert size={14} />
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. user@transitops.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Role Assignment</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-4 py-2 bg-card border border-border/80 rounded-md text-sm outline-none focus:border-border text-primary shadow-sm cursor-pointer"
                      required
                    >
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Safety Officer">Safety Officer</option>
                      <option value="Financial Analyst">Financial Analyst</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-semibold transition-colors shadow-sm mt-2"
                  >
                    Create User Account
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
