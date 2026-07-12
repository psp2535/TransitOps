# TransitOps — Fleet & Transport Command Center

🌍 **Live Demo:** [https://transitops.onrender.com](https://transitops.onrender.com) 

TransitOps is a transport management platform built with React, Vite, Framer Motion, and Express + SQLite. It features an interactive, glassmorphic dark interface optimized for fleet operations, safety compliance, financial management, and real-time dispatch monitoring.

## 🚀 Key Features

* **Executive Operations Dashboard**: High-fidelity overview of active/available/in-maintenance vehicles, pending/active trips, driver statuses, and fleet utilization with dynamic color-coded hover glow animations.
* **Interactive Trip Management & Live Board**:
  * Dispatch sidebar forms (capacity check validation & automatic ETA calculation).
  * Expandable live card components showcasing complete timelines, cargo metrics, and linked resource assignments.
  * Action controls to complete or cancel trips with instant vehicle/driver state restoration.
* **Granular Role-Based Access Control (RBAC)**:
  * Security gates for roles: **Fleet Manager**, **Dispatcher**, **Safety Officer**, and **Financial Analyst**.
  * Restricts page locks and displays a customized Access Restricted screen with interactive switchers.
  * Read-Only limits for viewing panels without edit privileges (e.g. Dispatcher on Fleet, Safety Officer on Trips).
* **Vehicle Registry & Driver Management**: Integrated grids with registration filters, license expiry badges, and maintenance check status tracking.
* **Maintenance Operations Logs**: Wide-screen tabular layout linked to vehicle lookups, complete with status actions and dynamic query filters.
* **Fuel & Expense Tracking**: Orange-themed expense logs containing trip metrics, linked vehicle registrations, and status pill badges.
* **Reports & Analytics**: KPIs, costliest vehicle logs, and monthly revenue tracking with interactive hover tooltips in INR.
* **General Platform Settings**: General preferences (Depot Name, Currencies, Units) synced directly to local storage and dynamically updated across the layout (e.g. sidebar logos).

## 🛠 Tech Stack

* **Frontend**: React, Vite, TailwindCSS, Framer Motion, Lucide Icons.
* **Backend**: Node.js, Express, SQLite.

## ⚙️ Installation & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the development server** (runs both the express backend on port 5001 and Vite frontend concurrently):
   ```bash
   npm run dev
   ```
3. **Run the linter**:
   ```bash
   npm run lint
   ```
4. **Build for production**:
   ```bash
   npm run build
   ```
