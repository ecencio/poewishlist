import { neon } from '@neondatabase/serverless'
import { env } from '~~/env'

let _db: ReturnType<typeof neon> | null = null

export function useDb() {
  if (_db) return _db

  const connectionString = env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  _db = neon(connectionString)
  return _db
}

// Helper to initialize tables if they don't exist
export async function initSchema() {
  const sql = useDb()
  
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS wish_items (
      id SERIAL PRIMARY KEY,
      poe_item_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      icon TEXT,
      category TEXT,
      base_type TEXT,
      observation TEXT,
      added_by_id INTEGER NOT NULL,
      added_by_username TEXT NOT NULL,
      found_by_id INTEGER,
      found_by_username TEXT,
      found_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (added_by_id) REFERENCES users(id)
    );
  `
}
