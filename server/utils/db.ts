import { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'

let _db: DatabaseSync | null = null

export function useDb() {
  if (_db) return _db

  _db = new DatabaseSync(join(process.cwd(), 'poe.db'))
  
  // Native node:sqlite enables WAL mode via pragma execution
  _db.exec('PRAGMA journal_mode = WAL;')
  _db.exec('PRAGMA foreign_keys = ON;')
  
  initSchema(_db)
  return _db
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wish_items (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      poe_item_id        TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name               TEXT NOT NULL,
      icon               TEXT,
      category           TEXT,
      base_type          TEXT,
      observation        TEXT,
      added_by_id        INTEGER NOT NULL,
      added_by_username TEXT NOT NULL,
      found_by_id        INTEGER,
      found_by_username TEXT,
      found_at           TEXT,
      created_at         TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (added_by_id) REFERENCES users(id)
    );
  `)
}
