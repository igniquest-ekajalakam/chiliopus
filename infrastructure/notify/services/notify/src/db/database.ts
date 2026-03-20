import { Pool, QueryResultRow } from 'pg';
import { config } from '../config/env.config';
import { logger } from '../config/logger.config';

const pool = new Pool({
  connectionString: config.databaseUrl,
  // Set default search path to notify schema
  options: '-c search_path=notify,public'
});

// Simple query helper, fully typed via generics
export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    // Ensure search path is set for this connection
    await client.query('SET search_path TO notify, public');
    const res = await client.query<T>(text, params);
    return res.rows;
  } catch (err) {
    logger.error('Database query error', { error: (err as Error).message, text, params });
    throw err;
  } finally {
    client.release();
  }
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
