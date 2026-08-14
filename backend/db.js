const neo4j = require("neo4j-driver");
require("dotenv").config();

// Create a single driver instance that the whole app shares
const driver = neo4j.driver(
  process.env.COGNO_URI,
  neo4j.auth.basic(process.env.COGNO_USER, process.env.COGNO_PASSWORD),
  {
    // Keep connections alive and limit pool size
    maxConnectionPoolSize: 10,
    connectionAcquisitionTimeout: 5000,
  }
);

// Quick ping to check if the DB is reachable at startup
async function verifyConnection() {
  const session = driver.session();
  try {
    await session.run("RETURN 1");
    console.log("✅ Connected to CognoDB");
  } catch (err) {
    console.error("❌ CognoDB connection failed:", err.message);
  } finally {
    await session.close();
  }
}

module.exports = { driver, verifyConnection };
