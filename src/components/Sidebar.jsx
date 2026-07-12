import React, { useState } from 'react';
import { 
  LayoutDashboard, Truck, Users, Navigation, Wrench, 
  Coins, BarChart3, Settings, LogOut, Moon, Sun, 
  ChevronLeft, ChevronRight, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ activePage, setActivePage, currentUser, onLogout, theme, setTheme, isPageRestricted, settings = {} }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 1, name: 'Dashboard', icon: LayoutDashboard },
    { id: 2, name: 'Fleet', icon: Truck },
    { id: 3, name: 'Drivers', icon: Users },
    { id: 4, name: 'Trips', icon: Navigation },
    { id: 5, name: 'Maintenance', icon: Wrench },
    { id: 6, name: 'Fuel & Expenses', icon: Coins },
    { id: 7, name: 'Analytics', icon: BarChart3 },
    { id: 8, name: 'Settings', icon: Settings }
  ];

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const sidebarVariants = {
    expanded: { width: 280, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    collapsed: { width: 80, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <motion.aside 
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      className="h-full bg-secondary border-r border-border flex flex-col relative z-20 overflow-hidden shrink-0"
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute ${isCollapsed ? '-right-4' : 'right-3'} top-7 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center text-secondary-foreground hover:text-primary hover:border-electric hover:scale-105 active:scale-95 shadow-md transition-all z-50 cursor-pointer`}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} className="shrink-0" /> : <ChevronLeft size={16} className="shrink-0" />}
      </button>

      {/* Brand */}
      <div className="p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric to-neon flex items-center justify-center shrink-0 shadow-lg shadow-electric/20">
          <Truck size={20} className="text-void" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }} 
              className="whitespace-nowrap"
            >
              <h1 className="font-heading font-bold text-lg leading-tight tracking-tight">TransitOps</h1>
              <p className="text-[9px] text-muted font-bold uppercase tracking-wider truncate max-w-[150px]" title={settings.depotName || 'Command Center'}>
                {settings.depotName || 'Command Center'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const restricted = isPageRestricted(item.id);
          const active = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform hover:translate-x-1 active:scale-[0.98] group relative overflow-hidden ${active ? 'text-primary' : 'text-secondary hover:bg-primary/40 hover:text-primary'}`}
            >
              {active && (
                <motion.div layoutId="activeNavIndicator" className="absolute inset-0 bg-electric/10 rounded-lg" />
              )}
              {active && (
                <motion.div layoutId="activeNavBorder" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-electric rounded-r-full" />
              )}
              
              <div className="relative z-10 shrink-0 w-6 flex justify-center">
                <Icon size={18} className={active ? 'text-electric' : 'text-muted group-hover:text-current'} />
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }} 
                    animate={{ opacity: 1, width: 'auto' }} 
                    exit={{ opacity: 0, width: 0 }}
                    className="relative z-10 flex-1 text-left flex justify-between items-center whitespace-nowrap"
                  >
                    <span>{item.name}</span>
                    {restricted && <Lock size={12} className="text-red-500/70 shrink-0" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Footer (Theme & User) */}
      <div className="p-4 border-t border-border/50 bg-secondary/50 space-y-2">
        <button 
          onClick={handleThemeToggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:text-primary hover:bg-primary/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="flex items-center gap-3 px-2 py-2 mt-2 rounded-lg bg-primary/30 border border-border/30">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-accent-hover text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 overflow-hidden whitespace-nowrap">
                <div className="text-xs font-semibold text-primary truncate">{currentUser?.name || 'User'}</div>
                <div className="text-[10px] font-medium text-muted truncate">{currentUser?.role || 'Guest'}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button onClick={onLogout} className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all duration-200 transform hover:scale-110 active:scale-90 shrink-0">
              <LogOut size={16} />
            </button>
          )}
        </div>
        {isCollapsed && (
           <button onClick={onLogout} className="w-full flex justify-center p-2 mt-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95">
              <LogOut size={16} />
           </button>
        )}
      </div>
    </motion.aside>
  );
}
