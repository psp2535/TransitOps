import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Dashboard({ vehicles = [], drivers = [], trips = [], currentUser }) {
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleTripsCount, setVisibleTripsCount] = useState(5);

  // Filtered vehicles based on type, status, region, and text search
  const filteredVehicles = vehicles.filter(v => {
    const matchesType = filterType === 'All' || v.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === 'All' || v.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesRegion = filterRegion === 'All' || v.region.toLowerCase() === filterRegion.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      v.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.type.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesType && matchesStatus && matchesRegion && matchesSearch;
  });

  // Filtered trips based on selected filters and text search
  const filteredTrips = trips.filter(t => {
    const associatedVehicle = vehicles.find(v => v.name.toLowerCase() === t.vehicle?.toLowerCase() || v.regNo.toLowerCase() === t.vehicle?.toLowerCase());
    const matchesType = filterType === 'All' || (associatedVehicle && associatedVehicle.type.toLowerCase() === filterType.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (associatedVehicle && associatedVehicle.status.toLowerCase() === filterStatus.toLowerCase());
    const matchesRegion = filterRegion === 'All' || (associatedVehicle && associatedVehicle.region.toLowerCase() === filterRegion.toLowerCase());
    const matchesSearch = searchQuery === '' ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.vehicle && t.vehicle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.driver && t.driver.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesRegion && matchesSearch;
  });

  // Computed Counts
  const activeVehiclesCount = filteredVehicles.filter(v => v.status === 'On Trip' || v.status === 'On Mission').length;
  const availableVehiclesCount = filteredVehicles.filter(v => v.status === 'Available').length;
  const inMaintenanceCount = filteredVehicles.filter(v => v.status === 'In Shop' || v.status === 'In Maintenance').length;
  const retiredVehiclesCount = filteredVehicles.filter(v => v.status === 'Retired').length;
  
  const activeTripsCount = filteredTrips.filter(t => t.status === 'On Trip' || t.status === 'In Progress').length;
  const pendingTripsCount = filteredTrips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length;
  
  const driversOnDuty = drivers.filter(d => {
    const matchesSearch = searchQuery === '' || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNo.toLowerCase().includes(searchQuery.toLowerCase());
    return (d.status === 'Available' || d.status === 'Active' || d.status === 'On Trip') && matchesSearch;
  }).length;
  
  const totalOperable = filteredVehicles.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = totalOperable > 0 ? Math.round((activeVehiclesCount / totalOperable) * 100) : 0;

  // Recent Trips (take first N after filtering)
  const recentTrips = filteredTrips.slice(0, visibleTripsCount);

  const getPercentage = (count) => {
    const total = filteredVehicles.length;
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // User avatar logic
  const initials = currentUser?.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'RK';
  
  const userName = currentUser?.name || 'Raven K.';
  const userRole = currentUser?.role || 'Dispatcher';

  return (
    <div className="w-full h-full flex flex-col bg-primary text-primary overflow-hidden font-sans">
      
      {/* Top Bar matching wireframe */}
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
            <span className="text-xs font-semibold text-electric">{userRole}</span>
            <div className="w-6 h-6 rounded-full bg-electric text-void flex items-center justify-center text-[10px] font-bold">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        initial="hidden" animate="show" variants={containerVariants}
        className="flex-1 overflow-y-auto p-8 space-y-10"
      >
        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Filters</span>
          <div className="flex flex-wrap gap-4 items-center">
            
            {/* Vehicle Type Filter */}
            <div className="relative shadow-sm rounded-md">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm bg-card border border-border/80 rounded-md px-4 py-1.5 text-primary outline-none focus:border-border appearance-none pr-8 min-w-[160px] cursor-pointer"
              >
                <option value="All">Vehicle Type: All</option>
                {Array.from(new Set(vehicles.map(v => v.type))).filter(Boolean).map(type => (
                  <option key={type} value={type}>Vehicle Type: {type}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">▼</div>
            </div>

            {/* Status Filter */}
            <div className="relative shadow-sm rounded-md">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm bg-card border border-border/80 rounded-md px-4 py-1.5 text-primary outline-none focus:border-border appearance-none pr-8 min-w-[160px] cursor-pointer"
              >
                <option value="All">Status: All</option>
                {Array.from(new Set(vehicles.map(v => v.status))).filter(Boolean).map(status => (
                  <option key={status} value={status}>Status: {status}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">▼</div>
            </div>

            {/* Region Filter */}
            <div className="relative shadow-sm rounded-md">
              <select 
                value={filterRegion} 
                onChange={(e) => setFilterRegion(e.target.value)}
                className="text-sm bg-card border border-border/80 rounded-md px-4 py-1.5 text-primary outline-none focus:border-border appearance-none pr-8 min-w-[160px] cursor-pointer"
              >
                <option value="All">Region: All</option>
                {Array.from(new Set(vehicles.map(v => v.region))).filter(Boolean).map(region => (
                  <option key={region} value={region}>Region: {region}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">▼</div>
            </div>

            {/* Clear Filters Button */}
            {(filterType !== 'All' || filterStatus !== 'All' || filterRegion !== 'All' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setFilterType('All');
                  setFilterStatus('All');
                  setFilterRegion('All');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors ml-2"
              >
                Clear Filters
              </button>
            )}

          </div>
        </motion.div>

        {/* KPI Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
          {/* 1. Active Vehicles */}
          <motion.div variants={itemVariants} className="bg-card border border-border/80 border-l-[4px] border-l-neon p-4 rounded-md flex flex-col justify-between h-24 shadow-sm">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest leading-tight">Active Vehicles</span>
            <span className="text-2xl font-bold">{activeVehiclesCount}</span>
          </motion.div>
          
          {/* 2. Available Vehicles */}
          <motion.div variants={itemVariants} className="bg-card border border-border/80 border-l-[4px] border-l-green-500 p-4 rounded-md flex flex-col justify-between h-24 shadow-sm">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest leading-tight">Available Vehicles</span>
            <span className="text-2xl font-bold">{availableVehiclesCount}</span>
          </motion.div>
          
          {/* 3. Vehicles in Maintenance */}
          <motion.div variants={itemVariants} className="bg-card border border-border/80 border-l-[4px] border-l-orange-500 p-4 rounded-md flex flex-col justify-between h-24 shadow-sm">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest leading-tight">Vehicles in Maintenance</span>
            <span className="text-2xl font-bold">{inMaintenanceCount < 10 ? '0'+inMaintenanceCount : inMaintenanceCount}</span>
          </motion.div>
          
          {/* 4. Active Trips */}
          <motion.div variants={itemVariants} className="bg-card border border-border/80 border-l-[4px] border-l-neon p-4 rounded-md flex flex-col justify-between h-24 shadow-sm">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest leading-tight">Active Trips</span>
            <span className="text-2xl font-bold">{activeTripsCount}</span>
          </motion.div>
          
          {/* 5. Pending Trips */}
          <motion.div variants={itemVariants} className="bg-card border border-border/80 border-l-[4px] border-l-neon p-4 rounded-md flex flex-col justify-between h-24 shadow-sm">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest leading-tight">Pending Trips</span>
            <span className="text-2xl font-bold">{pendingTripsCount < 10 ? '0'+pendingTripsCount : pendingTripsCount}</span>
          </motion.div>
          
          {/* 6. Drivers on Duty */}
          <motion.div variants={itemVariants} className="bg-card border border-border/80 border-l-[4px] border-l-neon p-4 rounded-md flex flex-col justify-between h-24 shadow-sm">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest leading-tight">Drivers on Duty</span>
            <span className="text-2xl font-bold">{driversOnDuty}</span>
          </motion.div>
          
          {/* 7. Fleet Utilization */}
          <motion.div variants={itemVariants} className="bg-card border border-border/80 border-l-[4px] border-l-green-500 p-4 rounded-md flex flex-col justify-between h-24 shadow-sm">
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest leading-tight">Fleet Utilization</span>
            <span className="text-2xl font-bold">{fleetUtilization}%</span>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Recent Trips Table */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-card p-6 border border-border/80 rounded-md shadow-sm">
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-6">Recent Trips</h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 pr-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Trip</th>
                    <th className="py-2 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Vehicle</th>
                    <th className="py-2 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Driver</th>
                    <th className="py-2 px-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">Status</th>
                    <th className="py-2 pl-4 text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border/50">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {recentTrips.map((trip) => {
                    let statusClass = "bg-border text-primary";
                    if (trip.status === "On Trip" || trip.status === "In Progress") {
                      statusClass = "bg-neon text-white";
                    } else if (trip.status === "Completed") {
                      statusClass = "bg-green-500 text-white";
                    } else if (trip.status === "Dispatched") {
                      statusClass = "bg-neon text-white";
                    } else if (trip.status === "Draft") {
                      statusClass = "bg-gray-500 text-white";
                    }

                    return (
                      <tr key={trip.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="py-4 pr-4 text-sm font-medium">{trip.id}</td>
                        <td className="py-4 px-4 text-sm">{trip.vehicle || '-'}</td>
                        <td className="py-4 px-4 text-sm">{trip.driver || '-'}</td>
                        <td className="py-4 px-4">
                          <span className={`px-4 py-1.5 rounded-md text-xs font-medium ${statusClass}`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-sm">{trip.eta || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredTrips.length > visibleTripsCount && (
              <div className="flex justify-center mt-6 pt-4 border-t border-border/20">
                <button
                  onClick={() => setVisibleTripsCount(prev => prev + 10)}
                  className="text-xs font-semibold text-electric hover:text-electric/80 transition-colors flex items-center gap-1.5 px-4 py-2 border border-border/80 rounded-md hover:bg-secondary/5 cursor-pointer shadow-sm"
                >
                  Load More (+10)
                </button>
              </div>
            )}
          </motion.div>

          {/* Right: Vehicle Status */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-card p-6 border border-border/80 rounded-md shadow-sm">
            <h3 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-6">Vehicle Status</h3>
            <div className="space-y-6">
              {[
                { label: 'Available', value: availableVehiclesCount, color: 'bg-green-500' },
                { label: 'On Trip', value: activeVehiclesCount, color: 'bg-neon' },
                { label: 'In Shop', value: inMaintenanceCount, color: 'bg-orange-500' },
                { label: 'Retired', value: retiredVehiclesCount, color: 'bg-red-500' }
              ].map((stat, i) => {
                const pct = getPercentage(stat.value);
                return (
                  <div key={i} className="flex items-center gap-6">
                    <div className="w-20 shrink-0 text-sm font-medium text-secondary">{stat.label}</div>
                    <div className="flex-1 h-3.5 bg-secondary/30 rounded-sm overflow-hidden flex">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${pct}%` }} 
                        transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                        className={`h-full ${stat.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}


