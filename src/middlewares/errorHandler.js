import ClientError from '../exceptions/ClientError.js';
import { sendFailure } from '../utils/response.js';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';

const uniqueMessages = {
  users_email_key: 'Email sudah digunakan',
  applications_user_job_unique: 'Anda sudah melamar pekerjaan ini',
  bookmarks_user_job_unique: 'Pekerjaan ini sudah ada di bookmark Anda',
};

const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ClientError) {
    return sendFailure(res, error.statusCode, error.message);
  }

  if (error.type === 'entity.parse.failed') {
    return sendFailure(res, 400, 'Format JSON pada request body tidak valid');
  }

  if (error.code === PG_UNIQUE_VIOLATION) {
    return sendFailure(res, 400, uniqueMessages[error.constraint] ?? 'Data sudah ada');
  }

  if (error.code === PG_FOREIGN_KEY_VIOLATION) {
    return sendFailure(res, 400, 'Data masih berelasi dengan data lain atau tidak valid');
  }

  // Detail error server hanya dicatat di log, tidak dikirim ke client.
  console.error(error); // eslint-disable-line no-console
  return sendFailure(res, 500, 'Terjadi kegagalan pada server kami');
};

export default errorHandler;
