import pool from '../config/database.js';
import { generateId } from '../utils/id.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import AuthorizationError from '../exceptions/AuthorizationError.js';
import { getCategoryById } from './categoriesService.js';
import { verifyCompanyOwner } from './companiesService.js';

const JOB_SELECT = `
  SELECT j.id, j.company_id, c.name AS company_name,
         j.category_id, cat.name AS category_name,
         j.title, j.description, j.job_type, j.experience_level,
         j.location_type, j.location_city, j.salary_min, j.salary_max,
         j.is_salary_visible, j.status, j.created_at, j.updated_at
  FROM jobs j
  JOIN companies c ON c.id = j.company_id
  JOIN categories cat ON cat.id = j.category_id`;

// Karakter wildcard LIKE di input pengguna di-escape agar dicari secara literal.
const toContainsPattern = (keyword) => `%${keyword.replace(/[\\%_]/g, '\\$&')}%`;

export const getJobs = async ({ title, 'company-name': companyName } = {}) => {
  const conditions = [];
  const values = [];

  if (title) {
    values.push(toContainsPattern(title));
    conditions.push(`j.title ILIKE $${values.length}`);
  }
  if (companyName) {
    values.push(toContainsPattern(companyName));
    conditions.push(`c.name ILIKE $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `${JOB_SELECT} ${where} ORDER BY j.created_at DESC`,
    values,
  );
  return rows;
};

export const getJobsByCompanyId = async (companyId) => {
  const { rows } = await pool.query(
    `${JOB_SELECT} WHERE j.company_id = $1 ORDER BY j.created_at DESC`,
    [companyId],
  );
  return rows;
};

export const getJobsByCategoryId = async (categoryId) => {
  const { rows } = await pool.query(
    `${JOB_SELECT} WHERE j.category_id = $1 ORDER BY j.created_at DESC`,
    [categoryId],
  );
  return rows;
};

export const getJobById = async (id) => {
  const { rows } = await pool.query(`${JOB_SELECT} WHERE j.id = $1`, [id]);
  if (!rows.length) {
    throw new NotFoundError('Job tidak ditemukan');
  }
  return rows[0];
};

export const verifyJobOwner = async (id, userId) => {
  const { rows } = await pool.query('SELECT owner_id FROM jobs WHERE id = $1', [id]);
  if (!rows.length) {
    throw new NotFoundError('Job tidak ditemukan');
  }
  if (rows[0].owner_id !== userId) {
    throw new AuthorizationError('Anda tidak berhak mengakses job ini');
  }
};

const verifyJobReferences = async (companyId, categoryId, userId) => {
  await verifyCompanyOwner(companyId, userId);
  await getCategoryById(categoryId);
};

const toJobValues = (payload) => [
  payload.company_id,
  payload.category_id,
  payload.title,
  payload.description,
  payload.job_type,
  payload.experience_level,
  payload.location_type,
  payload.location_city || null,
  payload.salary_min ?? null,
  payload.salary_max ?? null,
  payload.is_salary_visible,
  payload.status,
];

export const addJob = async (ownerId, payload) => {
  await verifyJobReferences(payload.company_id, payload.category_id, ownerId);

  const { rows } = await pool.query(
    `INSERT INTO jobs (
       id, owner_id, company_id, category_id, title, description, job_type,
       experience_level, location_type, location_city, salary_min, salary_max,
       is_salary_visible, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [generateId('job'), ownerId, ...toJobValues(payload)],
  );
  return rows[0].id;
};

export const updateJob = async (id, userId, payload) => {
  await verifyJobOwner(id, userId);
  await verifyJobReferences(payload.company_id, payload.category_id, userId);

  await pool.query(
    `UPDATE jobs
     SET company_id = $1, category_id = $2, title = $3, description = $4,
         job_type = $5, experience_level = $6, location_type = $7,
         location_city = $8, salary_min = $9, salary_max = $10,
         is_salary_visible = $11, status = $12, updated_at = NOW()
     WHERE id = $13`,
    [...toJobValues(payload), id],
  );
};

export const deleteJob = async (id, userId) => {
  await verifyJobOwner(id, userId);
  await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
};
