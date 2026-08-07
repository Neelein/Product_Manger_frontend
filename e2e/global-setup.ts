import { Client, Pool } from 'pg'

const DEFAULT_URL =
  'postgres://root:root123@localhost:5432/productdb_e2e?sslmode=disable'

const APP_TABLES = [
  'read_receipts',
  'chat_messages',
  'chat_room_members',
  'chat_rooms',
  'announcements',
  'inventory_items',
  'inventories',
  'members',
  'product_prices',
  'product_details',
  'products',
  'event_viewers',
  'events',
]

function quoteIdent(name: string): string {
  return '"' + name.replace(/"/g, '""') + '"'
}

async function ensureDatabase(): Promise<string> {
  const dbUrl = process.env.E2E_DATABASE_URL ?? DEFAULT_URL
  const maintenanceUrl = dbUrl.replace(/productdb_e2e(\?.*)?$/, 'postgres$1')
  const url = new URL(dbUrl)
  const dbName = url.pathname.replace('/', '')

  const client = new Client({ connectionString: maintenanceUrl })
  await client.connect()
  try {
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName],
    )
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE ' + quoteIdent(dbName))
    }
  } finally {
    await client.end()
  }

  return dbUrl
}

async function truncateAll(dbUrl: string): Promise<void> {
  const pool = new Pool({ connectionString: dbUrl })
  try {
    const res = await pool.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
      ['public'],
    )
    const existing = new Set(res.rows.map((r) => r.table_name))
    const toTruncate = APP_TABLES.filter((t) => existing.has(t))
    if (toTruncate.length === 0) return
    const tables = toTruncate.map(quoteIdent).join(', ')
    await pool.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`)
  } finally {
    await pool.end()
  }
}

export default async function globalSetup(): Promise<void> {
  const dbUrl = await ensureDatabase()
  await truncateAll(dbUrl)
}