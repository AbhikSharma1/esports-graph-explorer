/**
 * Seed script — wipes the graph and loads fresh data.
 * Run with: npm run seed (from the backend folder)
 */

const neo4j = require("neo4j-driver");
require("dotenv").config();

const driver = neo4j.driver(
  process.env.COGNO_URI,
  neo4j.auth.basic(process.env.COGNO_USER, process.env.COGNO_PASSWORD)
);

async function seed() {
  const session = driver.session();

  try {
    console.log("🗑️  Clearing existing graph...");
    await session.run("MATCH (n) DETACH DELETE n");

    // ── Game Roles ────────────────────────────────────────────────────────────
    console.log("🎮 Creating GameRole nodes...");
    await session.run(`
      UNWIND $roles AS r
      CREATE (:GameRole {id: r.id, title: r.title})
    `, {
      roles: [
        { id: "role-1", title: "Entry Fragger" },
        { id: "role-2", title: "AWPer" },
        { id: "role-3", title: "Support" },
        { id: "role-4", title: "In-Game Leader" },
        { id: "role-5", title: "Lurker" },
      ],
    });

    // ── Teams ─────────────────────────────────────────────────────────────────
    console.log("🏆 Creating Team nodes...");
    await session.run(`
      UNWIND $teams AS t
      CREATE (:Team {id: t.id, name: t.name, tag: t.tag, region: t.region, establishedYear: t.establishedYear})
    `, {
      teams: [
        { id: "team-1", name: "Neon Wolves",    tag: "NW",  region: "NA",  establishedYear: 2019 },
        { id: "team-2", name: "Phantom Strike", tag: "PS",  region: "EU",  establishedYear: 2018 },
        { id: "team-3", name: "Iron Veil",       tag: "IV",  region: "APAC",establishedYear: 2020 },
        { id: "team-4", name: "Crimson Tide",    tag: "CT",  region: "NA",  establishedYear: 2017 },
        { id: "team-5", name: "Void Protocol",   tag: "VP",  region: "EU",  establishedYear: 2021 },
        { id: "team-6", name: "Solar Flare",     tag: "SF",  region: "APAC",establishedYear: 2020 },
      ],
    });

    // ── Tournaments ───────────────────────────────────────────────────────────
    console.log("🥇 Creating Tournament nodes...");
    await session.run(`
      UNWIND $tournaments AS t
      CREATE (:Tournament {id: t.id, name: t.name, tier: t.tier, prizePool: t.prizePool, year: t.year})
    `, {
      tournaments: [
        { id: "tour-1", name: "World Clash 2023",    tier: "S",  prizePool: 1000000, year: 2023 },
        { id: "tour-2", name: "Regional Rumble 2023", tier: "A",  prizePool: 250000,  year: 2023 },
        { id: "tour-3", name: "Invitational Cup 2024",tier: "S+", prizePool: 2000000, year: 2024 },
      ],
    });

    // ── Players ───────────────────────────────────────────────────────────────
    console.log("👤 Creating Player nodes...");
    await session.run(`
      UNWIND $players AS p
      CREATE (:Player {id: p.id, name: p.name, handle: p.handle, role: p.role, nationality: p.nationality, winRate: p.winRate})
    `, {
      players: [
        // Neon Wolves (team-1)
        { id: "p-1",  name: "Alex Rivera",   handle: "xRiv",     role: "Entry Fragger", nationality: "US",  winRate: 0.68 },
        { id: "p-2",  name: "Sam Chen",      handle: "sChen",    role: "AWPer",         nationality: "CA",  winRate: 0.72 },
        { id: "p-3",  name: "Jordan Blake",  handle: "jBlake",   role: "Support",       nationality: "US",  winRate: 0.61 },
        // Phantom Strike (team-2)
        { id: "p-4",  name: "Lukas Müller",  handle: "lMuller",  role: "In-Game Leader",nationality: "DE",  winRate: 0.75 },
        { id: "p-5",  name: "Nico Rossi",    handle: "nRossi",   role: "Lurker",        nationality: "IT",  winRate: 0.69 },
        { id: "p-6",  name: "Finn Larsen",   handle: "fLarsen",  role: "AWPer",         nationality: "DK",  winRate: 0.77 },
        // Iron Veil (team-3)
        { id: "p-7",  name: "Yuki Tanaka",   handle: "yTanaka",  role: "Entry Fragger", nationality: "JP",  winRate: 0.65 },
        { id: "p-8",  name: "Wei Zhang",     handle: "wZhang",   role: "Support",       nationality: "CN",  winRate: 0.63 },
        // Crimson Tide (team-4)
        { id: "p-9",  name: "Marcus Webb",   handle: "mWebb",    role: "In-Game Leader",nationality: "US",  winRate: 0.71 },
        { id: "p-10", name: "Tyler Brooks",  handle: "tBrooks",  role: "Entry Fragger", nationality: "CA",  winRate: 0.66 },
        { id: "p-11", name: "Ethan Cole",    handle: "eCole",    role: "Lurker",        nationality: "US",  winRate: 0.70 },
        // Void Protocol (team-5)
        { id: "p-12", name: "Arjun Mehta",   handle: "aMehta",   role: "AWPer",         nationality: "IN",  winRate: 0.74 },
        { id: "p-13", name: "Pavel Novak",   handle: "pNovak",   role: "Support",       nationality: "CZ",  winRate: 0.60 },
        // Solar Flare (team-6)
        { id: "p-14", name: "Kai Nakamura",  handle: "kNaka",    role: "Entry Fragger", nationality: "JP",  winRate: 0.67 },
        { id: "p-15", name: "Ravi Sharma",   handle: "rSharma",  role: "In-Game Leader",nationality: "IN",  winRate: 0.73 },
      ],
    });

    // ── PLAYS_FOR relationships ───────────────────────────────────────────────
    console.log("🔗 Creating PLAYS_FOR relationships...");
    await session.run(`
      UNWIND $rels AS r
      MATCH (p:Player {id: r.playerId}), (t:Team {id: r.teamId})
      CREATE (p)-[:PLAYS_FOR {joinedDate: r.joinedDate, jerseyNumber: r.jerseyNumber}]->(t)
    `, {
      rels: [
        { playerId: "p-1",  teamId: "team-1", joinedDate: "2021-03-10", jerseyNumber: 7  },
        { playerId: "p-2",  teamId: "team-1", joinedDate: "2021-03-10", jerseyNumber: 11 },
        { playerId: "p-3",  teamId: "team-1", joinedDate: "2022-01-15", jerseyNumber: 3  },
        { playerId: "p-4",  teamId: "team-2", joinedDate: "2020-06-01", jerseyNumber: 1  },
        { playerId: "p-5",  teamId: "team-2", joinedDate: "2020-06-01", jerseyNumber: 9  },
        { playerId: "p-6",  teamId: "team-2", joinedDate: "2021-09-20", jerseyNumber: 4  },
        { playerId: "p-7",  teamId: "team-3", joinedDate: "2020-11-05", jerseyNumber: 6  },
        { playerId: "p-8",  teamId: "team-3", joinedDate: "2021-02-28", jerseyNumber: 2  },
        { playerId: "p-9",  teamId: "team-4", joinedDate: "2019-07-14", jerseyNumber: 10 },
        { playerId: "p-10", teamId: "team-4", joinedDate: "2020-03-01", jerseyNumber: 5  },
        { playerId: "p-11", teamId: "team-4", joinedDate: "2021-08-19", jerseyNumber: 8  },
        { playerId: "p-12", teamId: "team-5", joinedDate: "2022-01-01", jerseyNumber: 12 },
        { playerId: "p-13", teamId: "team-5", joinedDate: "2022-01-01", jerseyNumber: 13 },
        { playerId: "p-14", teamId: "team-6", joinedDate: "2021-05-22", jerseyNumber: 14 },
        { playerId: "p-15", teamId: "team-6", joinedDate: "2021-05-22", jerseyNumber: 15 },
      ],
    });

    // ── SPECIALIZES_IN relationships ──────────────────────────────────────────
    console.log("🎯 Creating SPECIALIZES_IN relationships...");
    await session.run(`
      UNWIND $rels AS r
      MATCH (p:Player {id: r.playerId}), (gr:GameRole {title: r.roleTitle})
      CREATE (p)-[:SPECIALIZES_IN]->(gr)
    `, {
      rels: [
        { playerId: "p-1",  roleTitle: "Entry Fragger"   },
        { playerId: "p-2",  roleTitle: "AWPer"           },
        { playerId: "p-3",  roleTitle: "Support"         },
        { playerId: "p-4",  roleTitle: "In-Game Leader"  },
        { playerId: "p-5",  roleTitle: "Lurker"          },
        { playerId: "p-6",  roleTitle: "AWPer"           },
        { playerId: "p-7",  roleTitle: "Entry Fragger"   },
        { playerId: "p-8",  roleTitle: "Support"         },
        { playerId: "p-9",  roleTitle: "In-Game Leader"  },
        { playerId: "p-10", roleTitle: "Entry Fragger"   },
        { playerId: "p-11", roleTitle: "Lurker"          },
        { playerId: "p-12", roleTitle: "AWPer"           },
        { playerId: "p-13", roleTitle: "Support"         },
        { playerId: "p-14", roleTitle: "Entry Fragger"   },
        { playerId: "p-15", roleTitle: "In-Game Leader"  },
      ],
    });

    // ── COMPETED_IN relationships ─────────────────────────────────────────────
    console.log("🏅 Creating COMPETED_IN relationships...");
    await session.run(`
      UNWIND $rels AS r
      MATCH (t:Team {id: r.teamId}), (tr:Tournament {id: r.tourId})
      CREATE (t)-[:COMPETED_IN {placement: r.placement, matchesWon: r.matchesWon}]->(tr)
    `, {
      rels: [
        // World Clash 2023
        { teamId: "team-1", tourId: "tour-1", placement: 1, matchesWon: 8 },
        { teamId: "team-2", tourId: "tour-1", placement: 2, matchesWon: 7 },
        { teamId: "team-4", tourId: "tour-1", placement: 3, matchesWon: 5 },
        { teamId: "team-3", tourId: "tour-1", placement: 4, matchesWon: 4 },
        // Regional Rumble 2023
        { teamId: "team-3", tourId: "tour-2", placement: 1, matchesWon: 6 },
        { teamId: "team-5", tourId: "tour-2", placement: 2, matchesWon: 5 },
        { teamId: "team-6", tourId: "tour-2", placement: 3, matchesWon: 4 },
        { teamId: "team-1", tourId: "tour-2", placement: 4, matchesWon: 3 },
        // Invitational Cup 2024
        { teamId: "team-2", tourId: "tour-3", placement: 1, matchesWon: 9 },
        { teamId: "team-5", tourId: "tour-3", placement: 2, matchesWon: 7 },
        { teamId: "team-6", tourId: "tour-3", placement: 3, matchesWon: 6 },
        { teamId: "team-4", tourId: "tour-3", placement: 4, matchesWon: 5 },
      ],
    });

    // ── SCRIMMED_WITH relationships ───────────────────────────────────────────
    console.log("⚔️  Creating SCRIMMED_WITH relationships...");
    await session.run(`
      UNWIND $rels AS r
      MATCH (a:Team {id: r.teamA}), (b:Team {id: r.teamB})
      CREATE (a)-[:SCRIMMED_WITH {matchesPlayed: r.matchesPlayed, intensity: r.intensity}]->(b)
    `, {
      rels: [
        { teamA: "team-1", teamB: "team-2", matchesPlayed: 12, intensity: "High"   },
        { teamA: "team-1", teamB: "team-4", matchesPlayed: 8,  intensity: "Medium" },
        { teamA: "team-2", teamB: "team-5", matchesPlayed: 15, intensity: "High"   },
        { teamA: "team-3", teamB: "team-6", matchesPlayed: 10, intensity: "Medium" },
        { teamA: "team-4", teamB: "team-5", matchesPlayed: 6,  intensity: "Low"    },
        { teamA: "team-5", teamB: "team-6", matchesPlayed: 9,  intensity: "High"   },
        { teamA: "team-3", teamB: "team-1", matchesPlayed: 7,  intensity: "Medium" },
      ],
    });

    console.log("✅ Seed complete! Graph is ready.");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();