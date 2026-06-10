const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

// Path to the database file
const dbPath = path.resolve(__dirname, '../../database/network.sqlite');

let dbInstance = null;

async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }
  
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  return dbInstance;
}

async function initDb() {
  const db = await getDb();

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      icon_type TEXT NOT NULL,
      status TEXT,
      last_seen DATETIME,
      pos_x REAL,
      pos_y REAL
    );

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_device_id INTEGER NOT NULL,
      target_device_id INTEGER NOT NULL,
      interface_port TEXT,
      FOREIGN KEY (source_device_id) REFERENCES devices (id) ON DELETE CASCADE,
      FOREIGN KEY (target_device_id) REFERENCES devices (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Enable foreign keys for SQLite
  await db.exec('PRAGMA foreign_keys = ON;');

  // Safe schema migrations for existing DBs
  try {
    await db.exec('ALTER TABLE devices ADD COLUMN pos_x REAL;');
  } catch (err) { /* column exists */ }
  try {
    await db.exec('ALTER TABLE devices ADD COLUMN pos_y REAL;');
  } catch (err) { /* column exists */ }

  // Seed Admin User if users table is empty
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Users table is empty. Seeding Master Administrator account...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('1234CHR@', salt);
    await db.run(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      ['admin@chr.com', hash, 'admin']
    );
    console.log('Master Administrator seeded.');
  }

  // Seed Settings if settings table is empty
  const settingsCount = await db.get('SELECT COUNT(*) as count FROM settings');
  if (settingsCount.count === 0) {
    console.log('Settings table is empty. Seeding default system control variables...');
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['ping_interval', '10']);
    await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['engine_enabled', 'true']);
    console.log('Settings seeded.');
  }

  return db;
}

module.exports = {
  getDb,
  initDb
};
