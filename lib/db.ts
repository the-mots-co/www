import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'fuel.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeSchema(db);
    seedIfEmpty(db);
  }
  return db;
}

function initializeSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS fuel_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      liters REAL NOT NULL,
      price_per_liter REAL NOT NULL,
      total_cost REAL NOT NULL,
      odometer INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL
    )
  `);
}

function seedIfEmpty(database: Database.Database) {
  const count = (database.prepare('SELECT COUNT(*) as cnt FROM fuel_expenses').get() as { cnt: number }).cnt;
  if (count > 0) return;

  const insert = database.prepare(`
    INSERT INTO fuel_expenses (date, liters, price_per_liter, total_cost, odometer, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  const samples = [
    ['2026-01-15', 40.5, 5.89, 238.55, 12450, 'Posto Shell - Rodovia', now],
    ['2026-02-03', 35.2, 5.95, 209.44, 12890, 'Posto Ipiranga', now],
    ['2026-03-20', 50.0, 5.79, 289.50, 13560, null, now],
    ['2026-04-10', 42.8, 5.99, 256.37, 14020, 'Viagem interestadual', now],
    ['2026-05-05', 38.1, 6.05, 230.51, 14480, null, now],
    ['2026-06-01', 45.0, 6.19, 278.55, 14950, 'Posto BR', now],
    ['2026-06-15', 33.7, 6.09, 205.23, 15230, null, now],
  ];

  const insertMany = database.transaction((rows: (string | number | null)[][]) => {
    for (const row of rows) {
      insert.run(...row);
    }
  });

  insertMany(samples);
}

export interface FuelExpense {
  id: number;
  date: string;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  odometer: number | null;
  notes: string | null;
  created_at: string;
}
