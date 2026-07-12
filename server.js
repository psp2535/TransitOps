import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import {
  INITIAL_USERS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  INITIAL_MAINTENANCE,
  INITIAL_FUEL_LOGS,
  INITIAL_EXPENSES
} from './src/initialData.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[Backend] ${req.method} ${req.url}`);
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

let db;

// Relational Tables Initialization
async function initDatabase() {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      regNo TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      capacity REAL NOT NULL,
      capacityUnit TEXT NOT NULL,
      odometer REAL NOT NULL,
      acqCost REAL NOT NULL,
      status TEXT NOT NULL,
      region TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS drivers (
      licenseNo TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      expiry TEXT NOT NULL,
      contact TEXT NOT NULL,
      tripCompl TEXT NOT NULL,
      safetyScore REAL NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      vehicle TEXT,
      driver TEXT,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      cargoWeight REAL NOT NULL,
      cargoWeightUnit TEXT NOT NULL,
      plannedDistance REAL NOT NULL,
      status TEXT NOT NULL,
      eta TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      vehicle TEXT NOT NULL,
      type TEXT NOT NULL,
      cost REAL NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      vehicle TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fuel (
      id TEXT PRIMARY KEY,
      vehicle TEXT NOT NULL,
      cost REAL NOT NULL,
      liters REAL NOT NULL,
      date TEXT NOT NULL
    );
  `);

  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  const vehicleCount = await db.get('SELECT COUNT(*) as count FROM vehicles');
  const driverCount = await db.get('SELECT COUNT(*) as count FROM drivers');
  const tripCount = await db.get('SELECT COUNT(*) as count FROM trips');
  const maintenanceCount = await db.get('SELECT COUNT(*) as count FROM maintenance');
  const expenseCount = await db.get('SELECT COUNT(*) as count FROM expenses');
  const fuelCount = await db.get('SELECT COUNT(*) as count FROM fuel');

  if (userCount.count === 0 || 
      vehicleCount.count === 0 || 
      driverCount.count === 0 || 
      tripCount.count === 0 || 
      maintenanceCount.count === 0 || 
      expenseCount.count === 0 || 
      fuelCount.count === 0) {
    console.log('One or more tables empty. Seeding starting datasets...');
    await seedDatabase();
  } else {
    console.log('Database connected successfully. Schema validated.');
  }
}

// Seeder Utility
async function seedDatabase() {
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    for (const u of INITIAL_USERS) {
      await db.run(
        'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
        [u.email, u.password, u.role, u.name]
      );
    }
  }

  const vehicleCount = await db.get('SELECT COUNT(*) as count FROM vehicles');
  if (vehicleCount.count === 0) {
    for (const v of INITIAL_VEHICLES) {
      await db.run(
        'INSERT INTO vehicles (regNo, name, type, capacity, capacityUnit, odometer, acqCost, status, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [v.regNo, v.name, v.type, v.capacity, v.capacityUnit, v.odometer, v.acqCost, v.status, v.region]
      );
    }
  }

  const driverCount = await db.get('SELECT COUNT(*) as count FROM drivers');
  if (driverCount.count === 0) {
    for (const d of INITIAL_DRIVERS) {
      await db.run(
        'INSERT INTO drivers (licenseNo, name, category, expiry, contact, tripCompl, safetyScore, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [d.licenseNo, d.name, d.category, d.expiry, d.contact, d.tripCompl, d.safetyScore, d.status]
      );
    }
  }

  const tripCount = await db.get('SELECT COUNT(*) as count FROM trips');
  if (tripCount.count === 0) {
    for (const t of INITIAL_TRIPS) {
      await db.run(
        'INSERT INTO trips (id, vehicle, driver, source, destination, cargoWeight, cargoWeightUnit, plannedDistance, status, eta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.vehicle, t.driver, t.source, t.destination, t.cargoWeight, t.cargoWeightUnit, t.plannedDistance, t.status, t.eta]
      );
    }
  }

  const maintenanceCount = await db.get('SELECT COUNT(*) as count FROM maintenance');
  if (maintenanceCount.count === 0) {
    for (const m of INITIAL_MAINTENANCE) {
      await db.run(
        'INSERT INTO maintenance (id, vehicle, type, cost, description, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [m.id, m.vehicle, m.type, m.cost, m.description, m.status, m.date]
      );
    }
  }

  const expenseCount = await db.get('SELECT COUNT(*) as count FROM expenses');
  if (expenseCount.count === 0) {
    for (const e of INITIAL_EXPENSES) {
      await db.run(
        'INSERT INTO expenses (id, vehicle, type, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)',
        [e.id, e.vehicle, e.type, e.amount, e.date, e.description]
      );
    }
  }

  const fuelCount = await db.get('SELECT COUNT(*) as count FROM fuel');
  if (fuelCount.count === 0) {
    for (const f of INITIAL_FUEL_LOGS) {
      await db.run(
        'INSERT INTO fuel (id, vehicle, cost, liters, date) VALUES (?, ?, ?, ?, ?)',
        [f.id, f.vehicle, f.cost, f.liters, f.date]
      );
    }
  }

  console.log('Database successfully seeded!');
}

// 0. Save full state from front-end transaction
app.post('/api/save', async (req, res) => {
  const { users, vehicles, drivers, trips, maintenance, expenses, fuel } = req.body;
  try {
    await db.run('BEGIN TRANSACTION');

    await db.run('DELETE FROM users');
    await db.run('DELETE FROM vehicles');
    await db.run('DELETE FROM drivers');
    await db.run('DELETE FROM trips');
    await db.run('DELETE FROM maintenance');
    await db.run('DELETE FROM expenses');
    await db.run('DELETE FROM fuel');

    for (const u of users || []) {
      await db.run('INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)', [u.email, u.password, u.role, u.name]);
    }
    for (const v of vehicles || []) {
      await db.run('INSERT INTO vehicles (regNo, name, type, capacity, capacityUnit, odometer, acqCost, status, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [v.regNo, v.name, v.type, v.capacity, v.capacityUnit, v.odometer, v.acqCost, v.status, v.region]);
    }
    for (const d of drivers || []) {
      await db.run('INSERT INTO drivers (licenseNo, name, category, expiry, contact, tripCompl, safetyScore, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [d.licenseNo, d.name, d.category, d.expiry, d.contact, d.tripCompl, d.safetyScore, d.status]);
    }
    for (const t of trips || []) {
      await db.run('INSERT INTO trips (id, vehicle, driver, source, destination, cargoWeight, cargoWeightUnit, plannedDistance, status, eta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [t.id, t.vehicle, t.driver, t.source, t.destination, t.cargoWeight, t.cargoWeightUnit, t.plannedDistance, t.status, t.eta]);
    }
    for (const m of maintenance || []) {
      await db.run('INSERT INTO maintenance (id, vehicle, type, cost, description, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)', [m.id, m.vehicle, m.type, m.cost, m.description, m.status, m.date]);
    }
    for (const e of expenses || []) {
      await db.run('INSERT INTO expenses (id, vehicle, type, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)', [e.id, e.vehicle, e.type, e.amount, e.date, e.description]);
    }
    for (const f of fuel || []) {
      await db.run('INSERT INTO fuel (id, vehicle, cost, liters, date) VALUES (?, ?, ?, ?, ?)', [f.id, f.vehicle, f.cost, f.liters, f.date]);
    }

    await db.run('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.run('ROLLBACK').catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// 1. Get entire database
app.get('/api/db', async (req, res) => {
  try {
    const users = await db.all('SELECT * FROM users');
    const vehicles = await db.all('SELECT * FROM vehicles');
    const drivers = await db.all('SELECT * FROM drivers');
    const trips = await db.all('SELECT * FROM trips');
    const maintenance = await db.all('SELECT * FROM maintenance');
    const expenses = await db.all('SELECT * FROM expenses');
    const fuel = await db.all('SELECT * FROM fuel');
    res.json({ users, vehicles, drivers, trips, maintenance, expenses, fuel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Reset database
app.post('/api/reset', async (req, res) => {
  try {
    await seedDatabase();
    const users = await db.all('SELECT * FROM users');
    const vehicles = await db.all('SELECT * FROM vehicles');
    const drivers = await db.all('SELECT * FROM drivers');
    const trips = await db.all('SELECT * FROM trips');
    const maintenance = await db.all('SELECT * FROM maintenance');
    const expenses = await db.all('SELECT * FROM expenses');
    const fuel = await db.all('SELECT * FROM fuel');
    res.json({ success: true, db: { users, vehicles, drivers, trips, maintenance, expenses, fuel } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server after database initialization
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`TransitOps backend SQLite server listening at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
