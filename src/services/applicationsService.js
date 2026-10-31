import pool, { withTransaction } from '../config/database.js';
import { generateId } from '../utils/id.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import AuthorizationError from '../exceptions/AuthorizationError.js';
import InvariantError from '../exceptions/InvariantError.js';

const APPLICATION_SELECT = `
  SELECT a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
         j.title AS job_title, c.name AS company_name
  FROM applications a
  JOIN jobs j ON j.id = a.job_id
  JOIN companies c ON c.id = j.company_id`;

/*
 * Lamaran hanya terlihat oleh pelamar dan pemilik lowongan ($1 = id user yang login).
 * Parameter tambahan dipakai oleh filter masing-masing query.
 */
const VISIBLE_TO_USER = '(a.user_id = $1 OR j.owner_id = $1)';

export const addApplication = async (userId, { job_id: jobId, status }) =>
  withTransaction(async (client) => {
    // FOR SHARE mencegah job dihapus sebelum lamaran tersimpan.
    const { rows } = await client.query(
      'SELECT status FROM jobs WHERE id = $1 FOR SHARE',
      [jobId],
    );
    if (!rows.length) {
      throw new NotFoundError('Job tidak ditemukan');
    }
    if (rows[0].status !== 'open') {
      throw new InvariantError('Lowongan pekerjaan ini sudah ditutup');
    }

    const result = await client.query(
      `INSERT INTO applications (id, user_id, job_id, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [generateId('application'), userId, jobId, status],
    );
    return result.rows[0].id;
  });

export const getApplications = async (userId) => {
  const { rows } = await pool.query(
    `${APPLICATION_SELECT} WHERE ${VISIBLE_TO_USER} ORDER BY a.created_at DESC`,
    [userId],
  );
  return rows;
};

export const getApplicationsByUserId = async (viewerId, targetUserId) => {
  const { rows } = await pool.query(
    `${APPLICATION_SELECT}
     WHERE ${VISIBLE_TO_USER} AND a.user_id = $2
     ORDER BY a.created_at DESC`,
    [viewerId, targetUserId],
  );
  return rows;
};

export const getApplicationsByJobId = async (viewerId, jobId) => {
  const { rows } = await pool.query(
    `${APPLICATION_SELECT}
     WHERE ${VISIBLE_TO_USER} AND a.job_id = $2
     ORDER BY a.created_at DESC`,
    [viewerId, jobId],
  );
  return rows;
};

export const getApplicationById = async (id, userId) => {
  await verifyApplicationAccess(id, userId);
  const { rows } = await pool.query(`${APPLICATION_SELECT} WHERE a.id = $1`, [id]);
  return rows[0];
};

const findApplicationAccess = async (id) => {
  const { rows } = await pool.query(
    `SELECT a.user_id AS applicant_id, j.owner_id AS job_owner_id
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.id = $1`,
    [id],
  );
  if (!rows.length) {
    throw new NotFoundError('Application tidak ditemukan');
  }
  return rows[0];
};

// Pelamar atau pemilik lowongan boleh melihat dan menghapus lamaran.
export const verifyApplicationAccess = async (id, userId) => {
  const { applicant_id: applicantId, job_owner_id: jobOwnerId } =
    await findApplicationAccess(id);
  if (userId !== applicantId && userId !== jobOwnerId) {
    throw new AuthorizationError('Anda tidak berhak mengakses application ini');
  }
};

// Hanya pemilik lowongan yang boleh mengubah status lamaran.
export const verifyJobOwnerOfApplication = async (id, userId) => {
  const { job_owner_id: jobOwnerId } = await findApplicationAccess(id);
  if (userId !== jobOwnerId) {
    throw new AuthorizationError('Hanya pemilik lowongan yang dapat mengubah status');
  }
};

export const updateApplicationStatus = async (id, status) => {
  await pool.query(
    'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2',
    [status, id],
  );
};

export const deleteApplication = async (id) => {
  await pool.query('DELETE FROM applications WHERE id = $1', [id]);
};
