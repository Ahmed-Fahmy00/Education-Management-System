require('dotenv').config();

const { createApp } = require('./app');
const { connectDB } = require('./config/db');

async function start() {
  const port = Number(process.env.PORT) || 5000;
  const app = createApp();

  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await connectDB(mongoUri);
      console.log('MongoDB connected');
    } catch (err) {
      console.warn('MongoDB connection failed:', err && err.message ? err.message : err);
    }
  }

  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}

start();
