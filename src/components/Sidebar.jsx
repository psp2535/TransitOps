import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  Coins, 
  BarChart3, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, currentUser, onLogout, theme, setTheme }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 1, name: 'Dashboard', icon: LayoutDashboard, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { id: 2, name: 'Fleet', icon: Truck, roles: ['Fleet Manager', 'Dispatcher', 'Financial Analyst'] },
    { id: 3, name: 'Drivers', icon: Users, roles: ['Fleet Manager', 'Safety Officer'] },
    { id: 4, name: 'Trips', icon: Navigation, roles: ['Fleet Manager', 'Dispatcher'] },
    { id: 5, name: 'Maintenance', icon: Wrench, roles: ['Fleet Manager', 'Dispatcher'] },
    { id: 6, name: 'Fuel & Expenses', icon: Coins, roles: ['Fleet Manager', 'Financial Analyst'] },
    { id: 7, name: 'Analytics', icon: BarChart3, roles: ['Fleet Manager', 'Financial Analyst', 'Safety Officer', 'Dispatcher'] },
    { id: 8, name: 'Settings', icon: Settings, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] }
  ];

  // Helper to check if role has access to specific menu item
  const hasAccess = (itemRoles) => {
    return currentUser ? itemRoles.includes(currentUser.role) : false;
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="sidebar-collapse-toggle"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="sidebar-brand">
        <div className="brand-logo">
          <Truck size={28} className="logo-icon" />
        </div>
        <div className="brand-info">
          <h1>TransitOps</h1>
          <p>Smart Fleet Operations</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const allowed = hasAccess(item.roles);
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-item ${activePage === item.id ? 'active' : ''} ${!allowed ? 'restricted-item' : ''}`}
              title={!allowed ? `Restricted to: ${item.roles.join(', ')}` : ''}
            >
              <Icon size={20} />
              <span>{item.name}</span>
              {!allowed && <span className="restricted-badge">Locked</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="theme-toggle-container">
          <button onClick={handleThemeToggle} className="theme-toggle-btn-sidebar" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
        
        <div className="sidebar-user">
          <div className="avatar-sm">
            {currentUser?.name?.substring(0, 2) || 'US'}
          </div>
          <div className="user-details">
            <div className="user-name-sidebar">{currentUser?.name || 'User'}</div>
            <div className="user-role-sidebar">{currentUser?.role || 'Guest'}</div>
          </div>
          <button onClick={onLogout} className="logout-btn" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
