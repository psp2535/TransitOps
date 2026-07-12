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
import { Lock, RefreshCw, ShieldAlert, LogOut } from 'lucide-react';

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

  // Database states
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

    // Dispatcher: Dashboard, Registry (Read-only), Trips, Settings
    if (role === 'Dispatcher') {
      return ![1, 2, 4, 8].includes(pageId);
    }

    // Safety Officer: Dashboard, Drivers, Settings
    if (role === 'Safety Officer') {
      return ![1, 3, 8].includes(pageId);
    }

    // Financial Analyst: Dashboard, Expenses, Reports, Settings
    if (role === 'Financial Analyst') {
      return ![1, 6, 7, 8].includes(pageId);
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
        2: 'Fleet Manager / Dispatcher',
        3: 'Safety Officer / Fleet Manager',
        4: 'Dispatcher / Fleet Manager',
        5: 'Fleet Manager',
        6: 'Financial Analyst / Fleet Manager',
        7: 'Financial Analyst / Fleet Manager'
      };

      return (
        <div className="access-denied-container">
          <div className="access-denied-card">
            <div className="lock-icon-container">
              <Lock size={36} className="lock-icon" />
            </div>
            <h2>Access Restricted</h2>
            <p className="denied-desc">
              The <strong>{pageNames[activePage] || 'Requested Page'}</strong> is scoped by RBAC security rules.
            </p>
            
            <div className="denied-info-box">
              <div className="info-row">
                <span className="info-label">Your Current Role:</span>
                <span className="info-value current-role">{currentUser.role}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Required Roles:</span>
                <span className="info-value required-role">{requiredRoles[activePage] || 'Authorized Personnel'}</span>
              </div>
            </div>

            <div className="quick-switch-section">
              <p>Quick switch to an authorized role to unlock this tab:</p>
              <div className="quick-switch-buttons">
                {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']
                  .filter(r => r !== currentUser.role)
                  .map(r => (
                    <button
                      key={r}
                      onClick={() => handleQuickRoleSwitch(r)}
                      className="btn btn-secondary btn-sm switch-btn"
                    >
                      {r}
                    </button>
                  ))}
              </div>
            </div>

            <button onClick={() => setActivePage(1)} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              Return to Dashboard
            </button>
          </div>
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
          />
        );
      default:
        return <Dashboard vehicles={vehicles} drivers={drivers} trips={trips} maintenanceLogs={maintenanceLogs} currentUser={currentUser} />;
    }
  };

  // Landing page â€” shown before login
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
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="flex h-screen w-full bg-primary overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        currentUser={currentUser} 
        theme={theme} 
        setTheme={setTheme} 
        onLogout={handleLogout} 
        isPageRestricted={isPageRestricted}
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        {renderPageContent()}
      </main>
    </div>
  );
}


