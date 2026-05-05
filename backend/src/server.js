require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const apiRoutes = require("./routes");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  const corsOriginEnv = process.env.CORS_ORIGIN;
  const corsOrigin = corsOriginEnv
    ? corsOriginEnv
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : true;

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({ message: "Education Management System API" });
  });

  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

async function start() {
  const port = Number(process.env.PORT) || 8000;
  const app = createApp();

  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await connectDB(mongoUri);
      console.log("MongoDB connected");
    } catch (err) {
      console.warn(
        "MongoDB connection failed:",
        err && err.message ? err.message : err,
      );
    }
  }

  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}

start();
