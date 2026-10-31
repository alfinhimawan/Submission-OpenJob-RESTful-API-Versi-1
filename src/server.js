import config from './config/env.js';
import app from './app.js';

const { host, port } = config.server;

app.listen(port, host, () => {
  console.log(`Server berjalan pada http://${host}:${port}`); // eslint-disable-line no-console
});
