import pool, { withTransaction } from '../config/database.js';
import { generateId } from '../utils/id.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import AuthorizationError from '../exceptions/AuthorizationError.js';

export const addBookmark = async (userId, jobId) =>
  withTransaction(async (client) => {
    const job = await client.query('SELECT 1 FROM jobs WHERE id = $1 FOR SHARE', [jobId]);
    if (!job.rowCount) {
      throw new NotFoundError('Job tidak ditemukan');
    }

    const { rows } = await client.query(
      'INSERT INTO bookmarks (id, user_id, job_id) VALUES ($1, $2, $3) RETURNING id',
      [generateId('bookmark'), userId, jobId],
    );
    return rows[0].id;
  });

export const getBookmarkById = async (id, jobId, userId) => {
  const { rows } = await pool.query(
    'SELECT id, user_id, job_id, created_at FROM bookmarks WHERE id = $1 AND job_id = $2',
    [id, jobId],
  );
  if (!rows.length) {
    throw new NotFoundError('Bookmark tidak ditemukan');
  }
  if (rows[0].user_id !== userId) {
    throw new AuthorizationError('Anda tidak berhak mengakses bookmark ini');
  }
  return rows[0];
};

export const getBookmarksByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT b.id, b.user_id, b.job_id, b.created_at,
            j.title AS job_title, c.name AS company_name
     FROM bookmarks b
     JOIN jobs j ON j.id = b.job_id
     JOIN companies c ON c.id = j.company_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId],
  );
  return rows;
};

export const deleteBookmark = async (userId, jobId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2',
    [userId, jobId],
  );
  if (!rowCount) {
    throw new NotFoundError('Bookmark tidak ditemukan');
  }
};
