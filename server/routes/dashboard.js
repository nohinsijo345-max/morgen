const router = require('express').Router();

// Mock Data Store (In a real app, these query the DB)
const db = {
  summary: { name: "Ravi Kumar", district: "Ernakulam", score: 92 },
  weather: [
    { type: "Rain", message: "Heavy showers expected", severity: "high", time: "Today 5 PM", icon: "cloud-rain" },
    { type: "Wind", message: "Gusts up to 30 km/h", severity: "medium", time: "Tomorrow 11 AM", icon: "wind" }
  ],
  countdown: { daysToHarvest: 14 },
  updates: [
    { title: "Fertilizer subsidy update", summary: "New scheme announced for smallholders." },
    { title: "Water schedule", summary: "Irrigation downtime on Sunday 2–4 PM." }
  ],
  profit: { net: 19200 },
  transport: [
    { routeName: "Local Co-op", cost: 1200, etaHrs: 6 },
    { routeName: "Express", cost: 2200, etaHrs: 3 }
  ],
  leaderboard: [
    { name: "Ravi Kumar", district: "Ernakulam", score: 92 },
    { name: "Asha Raj", district: "Kollam", score: 88 },
    { name: "Jose P.", district: "Idukki", score: 85 }
  ],
  doctor: { tip: "Your Pepper plants show signs of Quick Wilt. Spray 1% Bordeaux mixture immediately." },
  forecast: [
    { crop: "Pepper", nextWeekPrice: 520, trend: "up", confidence: 0.85 },
    { crop: "Rubber", nextWeekPrice: 180, trend: "stable", confidence: 0.92 }
  ],
  bids: [
    { crop: "Pepper (50kg)", minPrice: 24000, maxPrice: 26500, endsInMinutes: 45 },
    { crop: "Nutmeg (10kg)", minPrice: 4000, maxPrice: 4200, endsInMinutes: 120 }
  ]
};

// Create a route for each endpoint
router.get('/:type', (req, res) => {
  const type = req.params.type;
  if (db[type]) {
    res.json(db[type]);
  } else {
    res.status(404).json({ error: "Data not found" });
  }
});

module.exports = router;