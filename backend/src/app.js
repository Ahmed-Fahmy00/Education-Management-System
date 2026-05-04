const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  const corsOriginEnv = process.env.CORS_ORIGIN;
  const corsOrigin = corsOriginEnv
    ? corsOriginEnv
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : true;

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({ message: 'Education Management System API' });
  });

  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
