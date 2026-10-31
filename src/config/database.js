import 'dotenv/config';
import pg from 'pg';

// Pool membaca PGUSER, PGPASSWORD, PGDATABASE, PGHOST, dan PGPORT dari environment.
const pool = new pg.Pool();

/**
 * Menjalankan beberapa query dalam satu transaksi.
 * `callback` menerima client; COMMIT bila sukses, ROLLBACK bila melempar error.
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
