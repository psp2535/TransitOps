import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Clock, 
  Users, 
  Percent, 
  Search 
} from 'lucide-react';

export default function Dashboard({ vehicles, drivers, trips, maintenanceLogs }) {
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchType = filterType === 'All' || v.type === filterType;
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchRegion = filterRegion === 'All' || v.region === filterRegion;
    return matchType && matchStatus && matchRegion;
  });

  // KPI Calculations (based on filtered or overall, let's do overall as dashboard KPIs but allow filtered view, or calculate based on current active list. The mockup has specific fixed stats like Active: 53, Available: 42, In Maintenance: 5, Active Trips: 18, Pending Trips: 9, Drivers on Duty: 26, Fleet Util: 81%. We will compute them dynamically from our state so they reflect real operations!)
  const totalVehiclesCount = vehicles.length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'On Trip').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenanceCount = vehicles.filter(v => v.status === 'In Shop').length;
  const retiredVehiclesCount = vehicles.filter(v => v.status === 'Retired').length;
  
  const activeTripsCount = trips.filter(t => t.status === 'On Trip' || t.status === 'Dispatched').length;
  const pendingTripsCount = trips.filter(t => t.status === 'Draft').length;
  
  const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
  
  // Utilization = (On Trip Vehicles / (Total Vehicles - Retired Vehicles)) * 100
  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const totalOperable = vehicles.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = totalOperable > 0 
    ? Math.round((activeVehicles / totalOperable) * 100) 
    : 0;

  // Recent trips table data
  // Limit to 6 items
  const recentTrips = trips.slice(0, 6);

  // Status Bar Chart data calculations
  const totalStatusCount = availableVehiclesCount + activeVehiclesCount + inMaintenanceCount + retiredVehiclesCount;
  const getPercentage = (count) => {
    if (totalStatusCount === 0) return 0;
    return Math.round((count / totalStatusCount) * 100);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time fleet performance overview</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-panel card">
        <span className="filters-label">FILTERS</span>
        <div className="filters-row">
          <div className="filter-item">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="form-control select-control"
            >
              <option value="All">Vehicle Type: All</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Mini">Mini</option>
            </select>
          </div>
          <div className="filter-item">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-control select-control"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div className="filter-item">
            <select 
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
              className="form-control select-control"
            >
              <option value="All">Region: All</option>
              <option value="North">North</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="South">South</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="dashboard-grid">
        <div className="kpi-card border-blue">
          <div className="kpi-icon-wrapper text-blue">
            <Activity size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">ACTIVE VEHICLES</span>
            <h2 className="kpi-value">{activeVehiclesCount}</h2>
          </div>
        </div>

        <div className="kpi-card border-green">
          <div className="kpi-icon-wrapper text-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">AVAILABLE VEHICLES</span>
            <h2 className="kpi-value">{availableVehiclesCount}</h2>
          </div>
        </div>

        <div className="kpi-card border-orange">
          <div className="kpi-icon-wrapper text-orange">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">VEHICLES IN MAINTENANCE</span>
            <h2 className="kpi-value orange-highlight">{inMaintenanceCount}</h2>
          </div>
        </div>

        <div className="kpi-card border-blue">
          <div className="kpi-icon-wrapper text-blue">
            <Navigation size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">ACTIVE TRIPS</span>
            <h2 className="kpi-value">{activeTripsCount}</h2>
          </div>
        </div>

        <div className="kpi-card border-purple">
          <div className="kpi-icon-wrapper text-purple">
            <Clock size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">PENDING TRIPS</span>
            <h2 className="kpi-value">{pendingTripsCount}</h2>
          </div>
        </div>

        <div className="kpi-card border-teal">
          <div className="kpi-icon-wrapper text-teal">
            <Users size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">DRIVERS ON DUTY</span>
            <h2 className="kpi-value">{driversOnDuty}</h2>
          </div>
        </div>

        <div className="kpi-card border-util">
          <div className="kpi-icon-wrapper text-util">
            <Percent size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">FLEET UTILIZATION</span>
            <h2 className="kpi-value util-highlight">{fleetUtilization}%</h2>
          </div>
        </div>
      </div>

      {/* Main Sections: Recent Trips and Status Chart */}
      <div className="split-layout">
        {/* Recent Trips */}
        <div className="card">
          <h3 className="card-section-title">RECENT TRIPS</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>TRIP</th>
                  <th>VEHICLE</th>
                  <th>DRIVER</th>
                  <th>STATUS</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 600 }}>{trip.id}</td>
                    <td>{trip.vehicle || '—'}</td>
                    <td>{trip.driver || '—'}</td>
                    <td>
                      <span className={`badge badge-${trip.status.replace(/\s+/g, '').toLowerCase()}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td>{trip.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress Chart */}
        <div className="card">
          <h3 className="card-section-title">VEHICLE STATUS</h3>
          
          <div className="status-bars-container">
            <div className="status-bar-item">
              <div className="status-bar-header">
                <span className="status-bar-name">Available</span>
                <span className="status-bar-value">{availableVehiclesCount} vehicles ({getPercentage(availableVehiclesCount)}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill fill-green" 
                  style={{ width: `${getPercentage(availableVehiclesCount)}%` }}
                ></div>
              </div>
            </div>

            <div className="status-bar-item">
              <div className="status-bar-header">
                <span className="status-bar-name">On Trip</span>
                <span className="status-bar-value">{activeVehiclesCount} vehicles ({getPercentage(activeVehiclesCount)}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill fill-blue" 
                  style={{ width: `${getPercentage(activeVehiclesCount)}%` }}
                ></div>
              </div>
            </div>

            <div className="status-bar-item">
              <div className="status-bar-header">
                <span className="status-bar-name">In Shop</span>
                <span className="status-bar-value">{inMaintenanceCount} vehicles ({getPercentage(inMaintenanceCount)}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill fill-orange" 
                  style={{ width: `${getPercentage(inMaintenanceCount)}%` }}
                ></div>
              </div>
            </div>

            <div className="status-bar-item">
              <div className="status-bar-header">
                <span className="status-bar-name">Retired</span>
                <span className="status-bar-value">{retiredVehiclesCount} vehicles ({getPercentage(retiredVehiclesCount)}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill fill-red" 
                  style={{ width: `${getPercentage(retiredVehiclesCount)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
