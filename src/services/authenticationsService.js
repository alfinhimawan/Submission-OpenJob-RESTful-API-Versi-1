import pool from '../config/database.js';
import InvariantError from '../exceptions/InvariantError.js';

export const addRefreshToken = async (token, userId) => {
  await pool.query('INSERT INTO authentications (token, user_id) VALUES ($1, $2)', [
    token,
    userId,
  ]);
};

export const verifyRefreshTokenRegistered = async (token) => {
  const { rowCount } = await pool.query(
    'SELECT 1 FROM authentications WHERE token = $1',
    [token],
  );
  if (!rowCount) {
    throw new InvariantError('Refresh token tidak ditemukan di database');
  }
};

export const deleteRefreshToken = async (token) => {
  await pool.query('DELETE FROM authentications WHERE token = $1', [token]);
};
