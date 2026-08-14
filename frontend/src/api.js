// Central place for all backend calls — keeps components clean

const BASE = `${import.meta.env.VITE_API_URL || ""}/api/graph`;

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Full graph for the canvas
  getAll: () => get(`${BASE}/all`),

  // Multi-hop rival query
  getRivals: (playerName) =>
    get(`${BASE}/rivals?playerName=${encodeURIComponent(playerName)}`),

  // 2-hop scrim synergy
  getScrims: (teamName) =>
    get(`${BASE}/scrims?teamName=${encodeURIComponent(teamName)}`),

  // Search across players/teams/tournaments
  search: (q) => get(`${BASE}/search?q=${encodeURIComponent(q)}`),

  // Full player profile
  getPlayer: (name) =>
    get(`${BASE}/player/${encodeURIComponent(name)}`),
};
