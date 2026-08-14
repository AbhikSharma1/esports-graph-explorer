const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { verifyConnection } = require("./db");
const graphRoutes = require("./routes/graph");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
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
