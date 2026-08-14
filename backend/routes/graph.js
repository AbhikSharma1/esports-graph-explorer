const express = require("express");
const router = express.Router();
const { driver } = require("../db");

async function runQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

// neo4j-driver returns Integer objects for numbers — flatten them to plain JS
function toNum(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === "object" && "low" in val) return val.low;
  return val;
}

// Recursively convert all neo4j Integer objects inside a properties map
function flattenProps(props) {
  if (!props || typeof props !== "object") return props;
  const out = {};
  for (const [k, v] of Object.entries(props)) {
    out[k] = typeof v === "object" && v !== null && "low" in v ? v.low : v;
  }
  return out;
}

// ─── GET /api/graph/all ───────────────────────────────────────────────────────
router.get("/all", async (_req, res) => {
  try {
    const nodeRecords = await runQuery(`
      MATCH (n)
      RETURN
        toString(elementId(n)) AS id,
        labels(n)              AS labels,
        properties(n)          AS props
    `);

    const relRecords = await runQuery(`
      MATCH (a)-[r]->(b)
      RETURN
        type(r)                  AS type,
        toString(elementId(a))   AS source,
        toString(elementId(b))   AS target,
        properties(r)            AS props
    `);

    const nodes = nodeRecords.map((rec) => ({
      id:     rec.get("id"),
      labels: rec.get("labels"),
      props:  flattenProps(rec.get("props")),
    }));

    const links = relRecords.map((rec, i) => ({
      id:     `link-${i}`,
      type:   rec.get("type"),
      source: rec.get("source"),
      target: rec.get("target"),
      props:  flattenProps(rec.get("props")),
    }));

    res.json({ nodes, links });
  } catch (err) {
    console.error("GET /all error:", err.message);
    res.status(500).json({ error: "Failed to fetch graph data" });
  }
});

// ─── GET /api/graph/rivals?playerName=xxx ────────────────────────────────────
router.get("/rivals", async (req, res) => {
  const { playerName } = req.query;
  if (!playerName) return res.status(400).json({ error: "playerName is required" });

  try {
    const records = await runQuery(
      `
      MATCH (p:Player {name: $playerName})-[:PLAYS_FOR]->(t1:Team)
            -[:COMPETED_IN]->(tr:Tournament)<-[:COMPETED_IN]-(rival:Team)
      WHERE t1 <> rival
      RETURN
        p.name        AS player,
        t1.name       AS playerTeam,
        tr.name       AS tournament,
        rival.name    AS rivalTeam,
        rival.region  AS rivalRegion
      ORDER BY tr.name
      `,
      { playerName }
    );

    res.json(records.map((r) => ({
      player:      r.get("player"),
      playerTeam:  r.get("playerTeam"),
      tournament:  r.get("tournament"),
      rivalTeam:   r.get("rivalTeam"),
      rivalRegion: r.get("rivalRegion"),
    })));
  } catch (err) {
    console.error("GET /rivals error:", err.message);
    res.status(500).json({ error: "Failed to fetch rival data" });
  }
});

// ─── GET /api/graph/scrims?teamName=xxx ──────────────────────────────────────
router.get("/scrims", async (req, res) => {
  const { teamName } = req.query;
  if (!teamName) return res.status(400).json({ error: "teamName is required" });

  try {
    const records = await runQuery(
      `
      MATCH (origin:Team {name: $teamName})
      OPTIONAL MATCH (origin)-[r1:SCRIMMED_WITH]-(partner:Team)
      OPTIONAL MATCH (partner)-[r2:SCRIMMED_WITH]-(partner2:Team)
      WHERE partner2 <> origin AND partner2 <> partner
      RETURN
        origin.name                  AS origin,
        partner.name                 AS directPartner,
        toInteger(r1.matchesPlayed)  AS directMatches,
        r1.intensity                 AS directIntensity,
        partner2.name                AS secondDegreePartner,
        toInteger(r2.matchesPlayed)  AS secondDegreeMatches
      ORDER BY directPartner, secondDegreePartner
      `,
      { teamName }
    );

    const partnerMap = {};
    records.forEach((r) => {
      const dp = r.get("directPartner");
      if (!dp) return;
      if (!partnerMap[dp]) {
        partnerMap[dp] = {
          name: dp,
          matchesPlayed: toNum(r.get("directMatches")),
          intensity: r.get("directIntensity"),
          secondDegree: [],
        };
      }
      const sdp = r.get("secondDegreePartner");
      if (sdp && !partnerMap[dp].secondDegree.find((x) => x.name === sdp)) {
        partnerMap[dp].secondDegree.push({
          name: sdp,
          matchesPlayed: toNum(r.get("secondDegreeMatches")),
        });
      }
    });

    res.json({ team: teamName, directPartners: Object.values(partnerMap) });
  } catch (err) {
    console.error("GET /scrims error:", err.message);
    res.status(500).json({ error: "Failed to fetch scrim data" });
  }
});

// ─── GET /api/graph/search?q=xxx ─────────────────────────────────────────────
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "q is required" });

  try {
    const records = await runQuery(
      `
      MATCH (n)
      WHERE
        (n:Player     AND toLower(n.name)  CONTAINS toLower($q)) OR
        (n:Team       AND toLower(n.name)  CONTAINS toLower($q)) OR
        (n:Tournament AND toLower(n.name)  CONTAINS toLower($q))
      RETURN
        toString(elementId(n)) AS id,
        labels(n)              AS labels,
        properties(n)          AS props
      LIMIT 20
      `,
      { q }
    );

    res.json(records.map((r) => ({
      id:     r.get("id"),
      labels: r.get("labels"),
      props:  flattenProps(r.get("props")),
    })));
  } catch (err) {
    console.error("GET /search error:", err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

// ─── GET /api/graph/player/:name ─────────────────────────────────────────────
router.get("/player/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const records = await runQuery(
      `
      MATCH (p:Player {name: $name})
      OPTIONAL MATCH (p)-[pf:PLAYS_FOR]->(t:Team)
      OPTIONAL MATCH (p)-[:SPECIALIZES_IN]->(gr:GameRole)
      OPTIONAL MATCH (t)-[ci:COMPETED_IN]->(tr:Tournament)
      RETURN
        p                  AS player,
        t                  AS team,
        pf.joinedDate      AS joinedDate,
        pf.jerseyNumber    AS jerseyNumber,
        gr.title           AS role,
        collect(DISTINCT {
          name:       tr.name,
          tier:       tr.tier,
          year:       tr.year,
          prizePool:  tr.prizePool,
          placement:  ci.placement,
          matchesWon: ci.matchesWon
        }) AS tournaments
      LIMIT 1
      `,
      { name }
    );

    if (!records.length) return res.status(404).json({ error: "Player not found" });

    const r = records[0];
    const playerProps = flattenProps(r.get("player").properties);
    const teamProps   = r.get("team") ? flattenProps(r.get("team").properties) : null;

    // Flatten any neo4j Integers inside the tournament collection
    const tournaments = r.get("tournaments")
      .filter((t) => t.name !== null)
      .map((t) => ({
        name:       t.name,
        tier:       t.tier,
        year:       toNum(t.year),
        prizePool:  toNum(t.prizePool),
        placement:  toNum(t.placement),
        matchesWon: toNum(t.matchesWon),
      }));

    res.json({
      ...playerProps,
      joinedDate:   r.get("joinedDate"),
      jerseyNumber: toNum(r.get("jerseyNumber")),
      role:         r.get("role"),
      team:         teamProps,
      tournaments,
    });
  } catch (err) {
    console.error("GET /player error:", err.message);
    res.status(500).json({ error: "Failed to fetch player profile" });
  }
});

module.exports = router;
