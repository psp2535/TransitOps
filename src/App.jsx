import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VehicleRegistry from './components/VehicleRegistry';
import DriverManagement from './components/DriverManagement';
import TripManagement from './components/TripManagement';
import Maintenance from './components/Maintenance';
import FuelExpense from './components/FuelExpense';
import ReportsAnalytics from './components/ReportsAnalytics';
import Settings from './components/Settings';
import { Lock, RefreshCw, ShieldAlert, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy-load the landing page (code-split from the dashboard bundle)
const LandingPage = lazy(() => import('./landing/LandingPage'));

export default function App() {
  // Landing page state
  const [showLanding, setShowLanding] = useState(() => {
    // Show landing if user hasn't entered the app yet this session
    const entered = sessionStorage.getItem('enteredApp');
    return !entered;
  });
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Active page state
  const [activePage, setActivePage] = useState(1); // 1 = Dashboard
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Locked accounts tracking
  const [lockedEmails, setLockedEmails] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lockedEmails') || '[]');
    } catch {
      return [];
    }
  });

  // Database states
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('transitops_settings');
      return saved ? JSON.parse(saved) : {
        depotName: 'Gandhinagar Depot GJ4',
        currency: 'INR (Rs)',
        distanceUnit: 'Kilometers'
      };
    } catch {
      return {
        depotName: 'Gandhinagar Depot GJ4',
        currency: 'INR (Rs)',
        distanceUnit: 'Kilometers'
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('transitops_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync lockedEmails to localStorage
  useEffect(() => {
    localStorage.setItem('lockedEmails', JSON.stringify(lockedEmails));
  }, [lockedEmails]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync currentUser
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // On mount: Fetch full database from REST server
  useEffect(() => {
    fetch('/api/db')
      .then(res => {
        if (!res.ok) throw new Error('Server returned error status');
        return res.json();
      })
      .then(data => {
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.drivers) setDrivers(data.drivers);
        if (data.trips) setTrips(data.trips);
        if (data.maintenance) setMaintenanceLogs(data.maintenance);
        if (data.expenses) setExpenses(data.expenses);
        if (data.fuel) setFuelLogs(data.fuel);
        if (data.users) setUsers(data.users);
        setIsLoaded(true);
      })
      .catch(err => {
        console.warn('Backend server not detected or offline. Falling back to local storage cache.', err);
        // Offline local storage fallback (no seed data on frontend â€” use cached or empty)
        const savedVehicles = localStorage.getItem('vehicles');
        const savedDrivers = localStorage.getItem('drivers');
        const savedTrips = localStorage.getItem('trips');
        const savedMaint = localStorage.getItem('maintenance');
        const savedExpenses = localStorage.getItem('expenses');
        const savedFuel = localStorage.getItem('fuel');
        const savedUsers = localStorage.getItem('users');

        setVehicles(savedVehicles ? JSON.parse(savedVehicles) : []);
        setDrivers(savedDrivers ? JSON.parse(savedDrivers) : []);
        setTrips(savedTrips ? JSON.parse(savedTrips) : []);
        setMaintenanceLogs(savedMaint ? JSON.parse(savedMaint) : []);
        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
        setFuelLogs(savedFuel ? JSON.parse(savedFuel) : []);
        setUsers(savedUsers ? JSON.parse(savedUsers) : []);
        setIsLoaded(true);
      });
  }, []);

  // Update Database state to REST server (and LocalStorage backup)
  useEffect(() => {
    if (!isLoaded) return;

    const payload = {
      vehicles,
      drivers,
      trips,
      maintenance: maintenanceLogs,
      expenses,
      fuel: fuelLogs,
      users
    };

    // Backup to localStorage
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    localStorage.setItem('drivers', JSON.stringify(drivers));
    localStorage.setItem('trips', JSON.stringify(trips));
    localStorage.setItem('maintenance', JSON.stringify(maintenanceLogs));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('fuel', JSON.stringify(fuelLogs));
    localStorage.setItem('users', JSON.stringify(users));

    // Save to server
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.error('Failed to sync database payload to Express server:', err);
    });
  }, [vehicles, drivers, trips, maintenanceLogs, expenses, fuelLogs, users, isLoaded]);

  // Reset database back to default seed records
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all database logs back to defaults?')) {
      fetch('/api/reset', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setVehicles(data.db.vehicles);
            setDrivers(data.db.drivers);
            setTrips(data.db.trips);
            setMaintenanceLogs(data.db.maintenance);
            setExpenses(data.db.expenses);
            setFuelLogs(data.db.fuel);
            setUsers(data.db.users);
            alert('Database successfully restored to seed defaults on Express server!');
          }
        })
        .catch(err => {
          console.warn('Backend reset failed.', err);
          alert('Could not reset â€” backend server is offline.');
        });
    }
  };

  // Helper to determine if a page is restricted for the current user's role
  const isPageRestricted = (pageId) => {
    if (!currentUser) return true;
    const role = currentUser.role;

    // Permissions:
    // Fleet Manager: all access (1 to 8)
    if (role === 'Fleet Manager') return false;

    // Dispatcher: Dashboard, Registry (Read-only), Trips
    if (role === 'Dispatcher') {
      return ![1, 2, 4].includes(pageId);
    }

    // Safety Officer: Dashboard, Drivers, Trips (View)
    if (role === 'Safety Officer') {
      return ![1, 3, 4].includes(pageId);
    }

    // Financial Analyst: Dashboard, Fleet (View), Expenses, Reports
    if (role === 'Financial Analyst') {
      return ![1, 2, 6, 7].includes(pageId);
    }

    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage(1);
    setShowLanding(true);
    sessionStorage.removeItem('enteredApp');
  };

  const handleEnterApp = () => {
    setShowLanding(false);
    sessionStorage.setItem('enteredApp', 'true');
  };

  // Switch role directly from the access denied screen
  const handleQuickRoleSwitch = (newRole) => {
    const matchingUser = users.find(u => u.role === newRole) || currentUser;
    setCurrentUser({
      ...matchingUser,
      role: newRole
    });
  };

  // Render Page Content based on Active tab and permissions
  const renderPageContent = () => {
    if (isPageRestricted(activePage)) {
      // Access Denied Screen (Glassmorphic lock panel)
      const pageNames = {
        2: 'Vehicle Registry',
        3: 'Drivers & Safety Profiles',
        4: 'Trip Dispatcher',
        5: 'Maintenance Logs',
        6: 'Fuel & Expense Management',
        7: 'Reports & Analytics'
      };

      const requiredRoles = {
        2: 'Fleet Manager / Dispatcher / Financial Analyst',
        3: 'Safety Officer / Fleet Manager',
        4: 'Dispatcher / Fleet Manager / Safety Officer',
        5: 'Fleet Manager',
        6: 'Financial Analyst / Fleet Manager',
        7: 'Financial Analyst / Fleet Manager'
      };

      return (
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-void via-primary to-void min-h-[calc(100vh-80px)]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md p-8 bg-card border border-border shadow-2xl rounded-2xl flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md"
          >
            {/* Background glowing circle */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-electric/10 blur-3xl pointer-events-none" />

            {/* Glowing lock illustration */}
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-lg shadow-red-500/10 relative">
              <div className="absolute inset-0 rounded-2xl bg-red-500/5 animate-pulse" />
              <Lock size={28} className="text-red-500 relative z-10" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-primary mb-2">Access Restricted</h2>
            <p className="text-sm text-secondary max-w-sm mb-6">
              The <span className="text-electric font-semibold">{pageNames[activePage] || 'Requested Page'}</span> is protected by Role-Based Access Control (RBAC) security rules.
            </p>

            {/* Info Box */}
            <div className="w-full p-5 bg-primary/40 border border-border/60 rounded-xl space-y-3 mb-6 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Your Role</span>
                <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-xs font-bold uppercase tracking-wider">
                  {currentUser.role}
                </span>
              </div>
              <div className="h-px bg-border/40" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Required Access</span>
                <span className="text-xs font-bold text-emerald-500 leading-relaxed">
                  {requiredRoles[activePage] || 'Authorized Personnel'}
                </span>
              </div>
            </div>

            {/* Quick Switch Panel */}
            <div className="w-full space-y-3 mb-6">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block">
                Quick switch role to unlock this tab
              </span>
              <div className="grid grid-cols-2 gap-2">
                {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']
                  .filter(r => r !== currentUser.role)
                  .map(r => (
                    <motion.button
                      key={r}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickRoleSwitch(r)}
                      className="px-4 py-2 text-xs font-bold text-secondary bg-secondary/35 hover:bg-secondary/55 border border-border/80 rounded-lg transition-all duration-200 hover:text-primary hover:border-electric cursor-pointer shadow-sm"
                    >
                      {r}
                    </motion.button>
                  ))}
              </div>
            </div>

            {/* Return Button */}
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivePage(1)} 
              className="w-full py-3 bg-electric hover:bg-electric-hover text-void rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-electric/20 cursor-pointer"
            >
              Return to Dashboard
            </motion.button>
          </motion.div>
        </div>
      );
    }

    switch (activePage) {
      case 1:
        return (
          <Dashboard vehicles={vehicles} drivers={drivers} trips={trips} maintenanceLogs={maintenanceLogs} currentUser={currentUser} />
        );
      case 2:
        return (
          <VehicleRegistry 
            vehicles={vehicles} 
            setVehicles={setVehicles} 
            currentUser={currentUser} 
          />
        );
      case 3:
        return (
          <DriverManagement 
            drivers={drivers} 
            setDrivers={setDrivers} 
            currentUser={currentUser} 
          />
        );
      case 4:
        return (
          <TripManagement 
            trips={trips} 
            setTrips={setTrips} 
            vehicles={vehicles} 
            setVehicles={setVehicles} 
            drivers={drivers} 
            setDrivers={setDrivers}
            fuelLogs={fuelLogs}
            setFuelLogs={setFuelLogs}
            currentUser={currentUser} 
          />
        );
      case 5:
        return (
          <Maintenance 
            maintenanceLogs={maintenanceLogs} 
            setMaintenanceLogs={setMaintenanceLogs} 
            vehicles={vehicles} 
            setVehicles={setVehicles} 
            currentUser={currentUser} 
          />
        );
      case 6:
        return (
          <FuelExpense 
            vehicles={vehicles} 
            trips={trips}
            fuelLogs={fuelLogs} 
            setFuelLogs={setFuelLogs} 
            expenses={expenses} 
            setExpenses={setExpenses} 
            maintenanceLogs={maintenanceLogs}
            currentUser={currentUser} 
          />
        );
      case 7:
        return (
          <ReportsAnalytics 
            vehicles={vehicles} 
            trips={trips} 
            fuelLogs={fuelLogs} 
            maintenanceLogs={maintenanceLogs} 
            expenses={expenses}
            currentUser={currentUser} 
          />
        );
      case 8:
        return (
          <Settings 
            users={users} 
            setUsers={setUsers} 
            onResetData={handleResetData} 
            currentUser={currentUser} 
            lockedEmails={lockedEmails}
            setLockedEmails={setLockedEmails}
            settings={settings}
            setSettings={setSettings}
          />
        );
      default:
        return <Dashboard vehicles={vehicles} drivers={drivers} trips={trips} maintenanceLogs={maintenanceLogs} currentUser={currentUser} />;
    }
  };

  // Landing page — shown before login
  if (showLanding) {
    return (
      <Suspense fallback={
        <div style={{ background: '#030712', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#00d4ff', fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700 }}>TransitOps</div>
        </div>
      }>
        <LandingPage onEnterApp={handleEnterApp} />
      </Suspense>
    );
  }

  // If not logged in, force Page 0 Authentication screen
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} users={users} setUsers={setUsers} lockedEmails={lockedEmails} setLockedEmails={setLockedEmails} />;
  }

  return (
    <div className="flex h-screen w-full bg-primary overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-void/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out shrink-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          activePage={activePage} 
          setActivePage={(page) => {
            setActivePage(page);
            setIsMobileSidebarOpen(false);
          }} 
          currentUser={currentUser} 
          theme={theme} 
          setTheme={setTheme} 
          onLogout={handleLogout} 
          isPageRestricted={isPageRestricted}
          settings={settings}
        />
      </div>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-3 bg-secondary border-b border-border shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-muted hover:text-primary rounded-md hover:bg-primary/50 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-heading font-bold text-md text-primary">TransitOps</h1>
          </div>
          <span className="text-[10px] bg-electric/10 text-electric px-2.5 py-1 rounded-md border border-electric/20 font-bold uppercase tracking-wider max-w-[120px] truncate">
            {settings.depotName || 'GJ4'}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderPageContent()}
        </div>
      </main>
    </div>
  );
}


