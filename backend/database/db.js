import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'smartsend.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for performance and data integrity
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('SQLite PRAGMA warning:', e.message);
}

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS groups_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#4F46E5',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    group_id INTEGER,
    custom_fields TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(group_id) REFERENCES groups_table(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    prompt TEXT,
    subject TEXT,
    body TEXT NOT NULL,
    short_version TEXT,
    cta TEXT,
    channel TEXT NOT NULL,
    recipient_count INTEGER DEFAULT 0,
    recipients_json TEXT DEFAULT '[]',
    status TEXT DEFAULT 'sent',
    is_demo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS scheduled_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER,
    channel TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    recipients_json TEXT DEFAULT '[]',
    scheduled_time TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    status TEXT DEFAULT 'scheduled',
    is_demo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS message_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER,
    contact_id INTEGER,
    contact_name TEXT,
    contact_target TEXT,
    channel TEXT NOT NULL,
    rendered_subject TEXT,
    rendered_body TEXT NOT NULL,
    status TEXT NOT NULL,
    is_demo INTEGER DEFAULT 1,
    error_message TEXT,
    delivery_timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

/**
 * Helper methods wrapping DatabaseSync for consistent syntax
 */
export const dbHelper = {
  get: (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      return stmt.get(...params);
    } catch (err) {
      console.error('DB get error:', sql, params, err);
      throw err;
    }
  },

  all: (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      return stmt.all(...params);
    } catch (err) {
      console.error('DB all error:', sql, params, err);
      throw err;
    }
  },

  run: (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      return stmt.run(...params);
    } catch (err) {
      console.error('DB run error:', sql, params, err);
      throw err;
    }
  },

  exec: (sql) => {
    try {
      return db.exec(sql);
    } catch (err) {
      console.error('DB exec error:', sql, err);
      throw err;
    }
  },

  raw: db
};

export default dbHelper;

