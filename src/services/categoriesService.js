import pool from '../config/database.js';
import { generateId } from '../utils/id.js';
import NotFoundError from '../exceptions/NotFoundError.js';

const COLUMNS = 'id, name, created_at, updated_at';

export const addCategory = async ({ name }) => {
  const { rows } = await pool.query(
    'INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING id',
    [generateId('category'), name],
  );
  return rows[0].id;
};

export const getCategories = async () => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM categories ORDER BY created_at DESC`,
  );
  return rows;
};

export const getCategoryById = async (id) => {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM categories WHERE id = $1`, [
    id,
  ]);
  if (!rows.length) {
    throw new NotFoundError('Category tidak ditemukan');
  }
  return rows[0];
};

export const updateCategory = async (id, { name }) => {
  const { rowCount } = await pool.query(
    'UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2',
    [name, id],
  );
  if (!rowCount) {
    throw new NotFoundError('Category tidak ditemukan');
  }
};

export const deleteCategory = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  if (!rowCount) {
    throw new NotFoundError('Category tidak ditemukan');
  }
};
