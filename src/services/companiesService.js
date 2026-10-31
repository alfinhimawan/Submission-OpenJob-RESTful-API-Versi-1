import pool from '../config/database.js';
import { generateId } from '../utils/id.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import AuthorizationError from '../exceptions/AuthorizationError.js';

const COLUMNS = 'id, name, location, description, created_at, updated_at';

export const addCompany = async (ownerId, { name, location, description }) => {
  const { rows } = await pool.query(
    `INSERT INTO companies (id, owner_id, name, location, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [generateId('company'), ownerId, name, location, description ?? null],
  );
  return rows[0].id;
};

export const getCompanies = async () => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM companies ORDER BY created_at DESC`,
  );
  return rows;
};

export const getCompanyById = async (id) => {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM companies WHERE id = $1`, [
    id,
  ]);
  if (!rows.length) {
    throw new NotFoundError('Company tidak ditemukan');
  }
  return rows[0];
};

export const verifyCompanyOwner = async (id, userId) => {
  const { rows } = await pool.query('SELECT owner_id FROM companies WHERE id = $1', [id]);
  if (!rows.length) {
    throw new NotFoundError('Company tidak ditemukan');
  }
  if (rows[0].owner_id !== userId) {
    throw new AuthorizationError('Anda tidak berhak mengakses company ini');
  }
};

export const updateCompany = async (id, { name, location, description }) => {
  await pool.query(
    `UPDATE companies
     SET name = $1, location = $2, description = $3, updated_at = NOW()
     WHERE id = $4`,
    [name, location, description ?? null, id],
  );
};

export const deleteCompany = async (id) => {
  await pool.query('DELETE FROM companies WHERE id = $1', [id]);
};
