const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { verifyConnection } = require("./db");
const graphRoutes = require("./routes/graph");

const app = express();
const PORT = process.env.PORT || 4000;

// Allow requests from localhost, configured env, and production Vercel domain
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://esports-graph-explorer.vercel.app",
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, "") : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, Render health checks)
      if (!origin) return cb(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");

      // Allow if exact match OR if it's any Vercel preview/production deployment
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith(".vercel.app")
      ) {
        return cb(null, true);
      }

      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// All graph-related endpoints live under /api/graph
app.use("/api/graph", graphRoutes);

// Simple health check so the frontend can ping before loading
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Catch-all for unknown routes
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await verifyConnection();
});