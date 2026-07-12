import React from 'react';

export default function ReportsAnalytics({ vehicles, trips, fuelLogs, maintenanceLogs, expenses, currentUser }) {
  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RK';
  const userName = currentUser?.name || 'Raven K.';
  const userRole = currentUser?.role || 'Dispatcher';

  // --- Dynamic Calculations ---
  
  // 1. Operational Cost
  const totalFuelCost = (fuelLogs || []).reduce((acc, curr) => acc + curr.cost, 0);
  const totalMaintCost = (maintenanceLogs || []).reduce((acc, curr) => acc + curr.cost, 0);
  const totalOtherExpenses = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost + totalOtherExpenses;

  // 2. Fleet Utilization
  const totalVehicles = vehicles?.length || 1;
  const activeVehicles = vehicles?.filter(v => v.status === 'On Trip').length || 0;
  const fleetUtilization = Math.round((activeVehicles / totalVehicles) * 100);

  // 3. Fuel Efficiency (Total Dist / Total Liters)
  const completedTrips = trips?.filter(t => t.status === 'Completed') || [];
  const totalTripDist = completedTrips.reduce((acc, curr) => acc + curr.plannedDistance, 0);
  const totalLiters = (fuelLogs || []).reduce((acc, curr) => acc + curr.liters, 0);
  const fuelEfficiency = totalLiters > 0 ? (totalTripDist / totalLiters).toFixed(1) : 'N/A';

  // 4. Vehicle ROI
  // Mock Revenue calculation: 150 INR per KM for completed trips
  const totalRevenue = totalTripDist * 150;
  const totalAcqCost = (vehicles || []).reduce((acc, curr) => acc + curr.acqCost, 0);
  const totalROI = totalAcqCost > 0 ? (((totalRevenue - (totalMaintCost + totalFuelCost)) / totalAcqCost) * 100).toFixed(1) : 0;

  // 5. Top Costliest Vehicles
  const vehicleCosts = {};
  vehicles.forEach(v => { vehicleCosts[v.regNo] = 0; });
  (fuelLogs || []).forEach(f => { if(vehicleCosts[f.vehicle] !== undefined) vehicleCosts[f.vehicle] += f.cost; });
  (maintenanceLogs || []).forEach(m => { if(vehicleCosts[m.vehicle] !== undefined) vehicleCosts[m.vehicle] += m.cost; });
  (expenses || []).forEach(e => { if(vehicleCosts[e.vehicle] !== undefined) vehicleCosts[e.vehicle] += e.amount; });
  
  const costliestVehicles = Object.entries(vehicleCosts)
    .map(([regNo, cost]) => ({ regNo, cost }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3);
  
  const maxCost = costliestVehicles.length > 0 ? costliestVehicles[0].cost : 1;

  // 6. Monthly Revenue (Mocked 6 months + Current Month based on trips)
  const revenueData = [40, 60, 50, 80, 75, 95];
  // Calculate a mock percentage for the current month based on totalRevenue to make the graph dynamic
  const currentMonthHeight = Math.min(100, Math.max(10, (totalRevenue / 100000) * 100));
  const fullRevenueData = [...revenueData, currentMonthHeight];

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
        
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-card border border-border/80 rounded-sm shadow-sm p-5 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 pl-2">Fuel Efficiency</h3>
              <p className="text-3xl font-bold text-primary pl-2">{fuelEfficiency} <span className="text-sm text-muted font-semibold">km/l</span></p>
            </div>

            <div className="bg-card border border-border/80 rounded-sm shadow-sm p-5 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 pl-2">Fleet Utilization</h3>
              <p className="text-3xl font-bold text-primary pl-2">{fleetUtilization}%</p>
            </div>

            <div className="bg-card border border-border/80 rounded-sm shadow-sm p-5 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 pl-2">Operational Cost</h3>
              <p className="text-3xl font-bold text-primary pl-2">₹{new Intl.NumberFormat('en-IN').format(totalOperationalCost)}</p>
            </div>

            <div className="bg-card border border-border/80 rounded-sm shadow-sm p-5 relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
              <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 pl-2">Vehicle ROI</h3>
              <p className="text-3xl font-bold text-primary pl-2">{totalROI}%</p>
            </div>

          </div>

          <div className="text-[10px] font-semibold text-muted tracking-wide pb-8">
            ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost | Mock Revenue = ₹150 / km for completed trips
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 pt-4">
            
            {/* Monthly Revenue Bar Chart */}
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-8">Monthly Revenue (6mo + Current)</h3>
              <div className="h-64 flex items-end gap-2 border-b border-border/50 pb-2">
                {fullRevenueData.map((height, idx) => (
                  <div key={idx} className="flex-1 bg-accent/80 hover:bg-accent transition-colors rounded-t-sm" style={{ height: height + '%' }}></div>
                ))}
              </div>
            </div>

            {/* Top Costliest Vehicles Horizontal Bars */}
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-8">Top Costliest Vehicles</h3>
              
              <div className="space-y-6">
                
                {costliestVehicles.map((cv, idx) => {
                  const percentage = cv.cost > 0 ? (cv.cost / maxCost) * 90 : 0; // scale up to 90%
                  const colors = ['bg-red-600', 'bg-orange-500', 'bg-blue-500'];
                  
                  return (
                    <div key={cv.regNo} className="flex items-center gap-4">
                      <div className="w-28 shrink-0 flex flex-col">
                        <span className="text-xs font-bold text-secondary uppercase tracking-widest">{cv.regNo}</span>
                        <span className="text-[10px] text-muted">₹{new Intl.NumberFormat('en-IN').format(cv.cost)}</span>
                      </div>
                      <div className="flex-1 h-4 bg-secondary/30 rounded-sm overflow-hidden">
                        <div className={"h-full rounded-sm transition-all duration-1000 " + colors[idx]} style={{ width: percentage + '%' }}></div>
                      </div>
                    </div>
                  )
                })}

                {costliestVehicles.length === 0 && (
                  <p className="text-sm text-muted">No cost data available.</p>
                )}

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
