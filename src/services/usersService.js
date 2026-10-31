import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateId } from '../utils/id.js';
import NotFoundError from '../exceptions/NotFoundError.js';
import AuthenticationError from '../exceptions/AuthenticationError.js';

const SALT_ROUNDS = 10;

export const addUser = async ({ name, email, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (id, name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [generateId('user'), name, email.toLowerCase(), hashedPassword, role],
  );
  return rows[0].id;
};

export const getUserById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id],
  );
  if (!rows.length) {
    throw new NotFoundError('User tidak ditemukan');
  }
  return rows[0];
};

export const verifyUserCredential = async (email, password) => {
  const { rows } = await pool.query('SELECT id, password FROM users WHERE email = $1', [
    email.toLowerCase(),
  ]);
  const user = rows[0];
  const isMatch = user ? await bcrypt.compare(password, user.password) : false;

  if (!isMatch) {
    throw new AuthenticationError('Kredensial yang Anda berikan salah');
  }
  return user.id;
};
