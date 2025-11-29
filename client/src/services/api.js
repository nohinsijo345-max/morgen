const API = import.meta.env.VITE_API_URL || "http://localhost:5050";

export const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return res.json();
};

// The server exposes a dashboard router at /api/dashboard/:type
export const endpoints = {
  summary: `${API}/api/dashboard/summary`,
  updates: `${API}/api/dashboard/updates`,
  weather: `${API}/api/dashboard/weather`,
  leaderboard: `${API}/api/dashboard/leaderboard`,
  doctor: `${API}/api/dashboard/doctor`,
  countdown: `${API}/api/dashboard/countdown`,
  profit: `${API}/api/dashboard/profit`,
  transport: `${API}/api/dashboard/transport`,
  forecast: `${API}/api/dashboard/forecast`,
  bids: `${API}/api/dashboard/bids`,
};
