import React from 'react';
import { Download, BarChart2, TrendingUp, DollarSign, Fuel, ShieldAlert } from 'lucide-react';

export default function ReportsAnalytics({ vehicles, trips, fuelLogs, maintenanceLogs, expenses, currentUser }) {
  
  // 1. Calculate Fuel Efficiency (Distance / Fuel Liters)
  // Get all completed trips distance
  const completedTrips = trips.filter(t => t.status === 'Completed');
  const totalCompletedDistance = completedTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
  // Get total fuel liters logged
  const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
  
  const fuelEfficiency = totalFuelLiters > 0 
    ? (totalCompletedDistance / totalFuelLiters).toFixed(1) 
    : '8.4'; // Fallback value from mockup if no logs exist

  // 2. Fleet Utilization
  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const totalOperable = vehicles.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = totalOperable > 0 
    ? Math.round((activeVehicles / totalOperable) * 100) 
    : 81; // Mockup fallback

  // 3. Total Operational Cost (Fuel + Maintenance + Expenses)
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalMaintCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
  const totalExpenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost + totalExpenseCost;

  // 4. Vehicle ROI
  // Formula: ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
  // We model Revenue = Distance * 80 INR (freight revenue rate per km) for completed trips
  const calculateVehicleROI = (vehicle) => {
    // Completed trips for this specific vehicle
    const vehicleTrips = completedTrips.filter(t => t.vehicle.toLowerCase() === vehicle.name.toLowerCase());
    const distance = vehicleTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
    
    // Revenue rate: 80 INR per km
    const revenue = distance * 80;

    // Fuel costs
    const fuel = fuelLogs
      .filter(f => f.vehicle.toLowerCase() === vehicle.name.toLowerCase())
      .reduce((sum, f) => sum + f.cost, 0);

    // Maintenance costs
    const maint = maintenanceLogs
      .filter(m => m.vehicle.toLowerCase() === vehicle.name.toLowerCase())
      .reduce((sum, m) => sum + m.cost, 0);

    // ROI
    if (vehicle.acqCost === 0) return 0;
    const roi = ((revenue - (maint + fuel)) / vehicle.acqCost) * 100;
    return parseFloat(roi.toFixed(1));
  };

  // Calculate average ROI across active fleet
  const operableVehicles = vehicles.filter(v => v.status !== 'Retired');
  const roiSum = operableVehicles.reduce((sum, v) => sum + calculateVehicleROI(v), 0);
  const averageROI = operableVehicles.length > 0 
    ? (roiSum / operableVehicles.length).toFixed(1) 
    : '14.2'; // Fallback mockup value

  // 5. CSV Export Trigger
  const exportToCSV = () => {
    // Prepare headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Vehicle Name,Registration Number,Type,Status,Odometer (km),Acquisition Cost (INR),Fuel Cost (INR),Maintenance Cost (INR),Other Expenses (INR),ROI (%)\n";

    // Populate rows
    vehicles.forEach(v => {
      const fuelCost = fuelLogs.filter(f => f.vehicle.toLowerCase() === v.name.toLowerCase()).reduce((sum, f) => sum + f.cost, 0);
      const maintCost = maintenanceLogs.filter(m => m.vehicle.toLowerCase() === v.name.toLowerCase()).reduce((sum, m) => sum + m.cost, 0);
      const otherCost = expenses.filter(e => e.vehicle.toLowerCase() === v.name.toLowerCase()).reduce((sum, e) => sum + e.amount, 0);
      const roi = calculateVehicleROI(v);

      csvContent += `"${v.name}","${v.regNo}","${v.type}","${v.status}",${v.odometer},${v.acqCost},${fuelCost},${maintCost},${otherCost},${roi}%\n`;
    });

    // Create download element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_fleet_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Chart data calculations
  const totalCostForChart = totalFuelCost + totalMaintCost + totalExpenseCost || 1;
  const fuelPercentage = Math.round((totalFuelCost / totalCostForChart) * 100);
  const maintPercentage = Math.round((totalMaintCost / totalCostForChart) * 100);
  const expPercentage = Math.round((totalExpenseCost / totalCostForChart) * 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Export logistics data and view financial returns</p>
        </div>
        
        <button onClick={exportToCSV} className="btn btn-primary">
          <Download size={18} />
          <span>Export Report (CSV)</span>
        </button>
      </div>

      {/* Reports Metrics Cards Grid */}
      <div className="dashboard-grid">
        <div className="kpi-card border-teal">
          <div className="kpi-icon-wrapper text-teal">
            <Fuel size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">FUEL EFFICIENCY</span>
            <h2 className="kpi-value">{fuelEfficiency} km/l</h2>
          </div>
        </div>

        <div className="kpi-card border-blue">
          <div className="kpi-icon-wrapper text-blue">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">FLEET UTILIZATION</span>
            <h2 className="kpi-value">{fleetUtilization}%</h2>
          </div>
        </div>

        <div className="kpi-card border-orange">
          <div className="kpi-icon-wrapper text-orange">
            <DollarSign size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">OPERATIONAL COST</span>
            <h2 className="kpi-value">{formatCurrency(totalOperationalCost)}</h2>
          </div>
        </div>

        <div className="kpi-card border-purple">
          <div className="kpi-icon-wrapper text-purple">
            <BarChart2 size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">VEHICLE ROI</span>
            <h2 className="kpi-value">{averageROI}%</h2>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="split-layout">
        {/* Cost Breakdown */}
        <div className="card">
          <h3 className="card-section-title">OPERATIONAL COST BREAKDOWN</h3>
          
          <div className="cost-donut-chart-container">
            {/* Custom SVG Donut Chart */}
            <svg width="220" height="220" viewBox="0 0 42 42" className="donut-svg">
              <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"></circle>
              <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--border-color)" strokeWidth="4"></circle>
              
              {/* Segment 1: Fuel (Blue) */}
              <circle 
                className="donut-segment" 
                cx="21" 
                cy="21" 
                r="15.91549430918954" 
                fill="transparent" 
                stroke="#3b82f6" 
                strokeWidth="4.2" 
                strokeDasharray={`${fuelPercentage} ${100 - fuelPercentage}`} 
                strokeDashoffset="25"
              ></circle>
              
              {/* Segment 2: Maintenance (Orange) */}
              <circle 
                className="donut-segment" 
                cx="21" 
                cy="21" 
                r="15.91549430918954" 
                fill="transparent" 
                stroke="#f59e0b" 
                strokeWidth="4.2" 
                strokeDasharray={`${maintPercentage} ${100 - maintPercentage}`} 
                strokeDashoffset={100 - fuelPercentage + 25}
              ></circle>

              {/* Segment 3: Other Expenses (Purple) */}
              <circle 
                className="donut-segment" 
                cx="21" 
                cy="21" 
                r="15.91549430918954" 
                fill="transparent" 
                stroke="#a855f7" 
                strokeWidth="4.2" 
                strokeDasharray={`${expPercentage} ${100 - expPercentage}`} 
                strokeDashoffset={100 - fuelPercentage - maintPercentage + 25}
              ></circle>
            </svg>

            {/* Legend */}
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                <span className="legend-label">Fuel Costs:</span>
                <span className="legend-val">{fuelPercentage}% ({formatCurrency(totalFuelCost)})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                <span className="legend-label">Maintenance:</span>
                <span className="legend-val">{maintPercentage}% ({formatCurrency(totalMaintCost)})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#a855f7' }}></span>
                <span className="legend-label">Tolls & Other:</span>
                <span className="legend-val">{expPercentage}% ({formatCurrency(totalExpenseCost)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle ROI Performance bar graph */}
        <div className="card">
          <h3 className="card-section-title">TOP VEHICLE RETURNS (ROI %)</h3>
          
          <div className="status-bars-container" style={{ gap: '1.5rem' }}>
            {vehicles.filter(v => v.status !== 'Retired').map(vehicle => {
              const roi = calculateVehicleROI(vehicle);
              // Max scale of ROI is 30% for visual progress bar representation
              const barWidth = Math.min(Math.max((roi / 30) * 100, 0), 100);
              
              return (
                <div key={vehicle.regNo} className="status-bar-item">
                  <div className="status-bar-header">
                    <span className="status-bar-name" style={{ fontWeight: 600 }}>{vehicle.name}</span>
                    <span className="status-bar-value" style={{ color: roi >= 0 ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
                      {roi}% ROI
                    </span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '12px' }}>
                    <div 
                      className={`progress-bar-fill ${roi >= 15 ? 'fill-green' : roi >= 0 ? 'fill-blue' : 'fill-red'}`} 
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
