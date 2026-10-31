import 'dotenv/config';

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} wajib diisi`);
  }
  return value;
};

const config = {
  server: {
    host: process.env.HOST || 'localhost',
    port: Number(process.env.PORT) || 3000,
  },
  token: {
    accessKey: requireEnv('ACCESS_TOKEN_KEY'),
    refreshKey: requireEnv('REFRESH_TOKEN_KEY'),
    accessAge: process.env.ACCESS_TOKEN_AGE || '3h',
    refreshAge: process.env.REFRESH_TOKEN_AGE || '7d',
  },
};

export default config;
