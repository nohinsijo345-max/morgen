import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, CloudRain, Wind, Bell, Trophy, Stethoscope,
  Timer, Calculator, Truck, LineChart, Gavel, LogOut
} from "lucide-react";
import { fetchJSON, endpoints } from "../services/api";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" }
};

const Badge = ({ color, children }) => (
  <div className="badge" style={{ backgroundColor: color }}>{children}</div>
);

const WeatherIcon = ({ icon }) => {
  if (icon === "cloud-rain") return <CloudRain className="w-5 h-5 text-black/80" />;
  if (icon === "wind") return <Wind className="w-5 h-5 text-black/80" />;
  return <Bell className="w-5 h-5 text-black/80" />;
};

export default function FarmerDashboard({ user, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [weather, setWeather] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [profit, setProfit] = useState(null);
  const [transport, setTransport] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setSummary(await fetchJSON(endpoints.summary));
        setUpdates(await fetchJSON(endpoints.updates));
        setWeather(await fetchJSON(endpoints.weather));
        setLeaderboard(await fetchJSON(endpoints.leaderboard));
        setDoctor(await fetchJSON(endpoints.doctor));
        setCountdown(await fetchJSON(endpoints.countdown));
        setProfit(await fetchJSON(endpoints.profit));
        setTransport(await fetchJSON(endpoints.transport));
        setForecast(await fetchJSON(endpoints.forecast));
        setBids(await fetchJSON(endpoints.bids));
      } catch (e) {
        console.error(e);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-green-700 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Morgen Dashboard</h1>
        <button 
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-12 gap-6 auto-rows-[260px]">

        {/* Row 1 */}
        <motion.div className="card col-span-6 row-start-1 col-start-1 h-full" {...fade}>
          <div className="flex justify-between">
            <div className="flex gap-3">
              <Badge color="#79D7A7"><User className="w-5 h-5 text-black/80" /></Badge>
              <div>
                <div className="card-title">Hello, {summary?.name ?? "Farmer"}</div>
                <div className="subtext">District: {summary?.district ?? "—"}</div>
              </div>
            </div>
            <button className="glass px-4 py-2 rounded-lg text-sm">My customers are liquid glass</button>
          </div>
          <div className="line" />
          <div className="flex justify-between">
            <button className="glass px-4 py-2 rounded-lg text-sm">Acc centre</button>
            <div className="subtext">Score: {summary?.score ?? "—"}</div>
          </div>
        </motion.div>

        <motion.div className="card col-span-6 row-start-1 col-start-7 h-full" {...fade}>
          <div className="flex gap-3">
            <Badge color="#7CC7FF"><Bell className="w-5 h-5 text-black/80" /></Badge>
            <div className="card-title">Weather alerts</div>
          </div>
          <div className="mt-3 space-y-2">
            {weather.map((w, i) => (
              <div key={i} className="glass p-3 rounded-lg flex gap-3">
                <Badge color={w.icon === "cloud-rain" ? "#7CC7FF" : "#B79CFF"}>
                  <WeatherIcon icon={w.icon} />
                </Badge>
                <div>
                  <div className="font-medium">{w.type} — {w.message}</div>
                  <div className="subtext">Severity: {w.severity} • {w.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 2 */}
        <motion.div className="card col-span-6 row-start-2 col-start-1 h-full" {...fade}>
          <div className="flex gap-3">
            <Badge color="#B79CFF"><Timer className="w-5 h-5 text-black/80" /></Badge>
            <div className="card-title">Countdown</div>
          </div>
          <div className="mt-6 text-7xl font-bold">{countdown?.daysToHarvest ?? "—"}</div>
          <div className="subtext">days to harvest</div>
        </motion.div>

        <motion.div className="card col-span-6 row-start-2 col-start-7 h-full" {...fade}>
          <div className="flex gap-3">
            <Badge color="#FF9BCB"><Bell className="w-5 h-5 text-black/80" /></Badge>
            <div className="card-title">New updates</div>
          </div>
          <div className="mt-3 space-y-2">
            {updates.map((u, i) => (
              <div key={i} className="glass p-3 rounded-lg">
                <div className="font-medium">{u.title}</div>
                <div className="subtext">{u.summary}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 3 */}
        <motion.div className="card col-span-6 row-start-3 col-start-1 h-full" {...fade}>
          <div className="flex gap-3">
            <Badge color="#FFB774"><Calculator className="w-5 h-5 text-black/80" /></Badge>
            <div className="card-title">Profit</div>
          </div>
          <div className="mt-3 text-xl">Net: ₹{profit?.net?.toLocaleString() ?? "—"}</div>
        </motion.div>

        <motion.div className="card col-span-6 row-start-3 col-start-7 h-full" {...fade}>
          <div className="flex gap-3">
            <Badge color="#FDD56B"><Truck className="w-5 h-5 text-black/80" /></Badge>
            <div className="card-title">Transport</div>
          </div>
          <div className="mt-3 space-y-2">
            {transport.map((t, i) => (
              <div key={i} className="glass p-2 rounded-md flex justify-between">
                <div>{t.routeName}</div>
                <div className="subtext">₹{t.cost} • {t.etaHrs}h</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 4 */}
        <motion.div className="card col-span-6 row-start-4 col-start-1 h-full" {...fade}>
          <div className="flex gap-3">
            <Badge color="#FFB774"><Trophy className="w-5 h-5 text-black/80" /></Badge>
            <div className="card-title">Leaderboard</div>
          </div>
          <div className="mt-3 space-y-2">
            {leaderboard.map((f, i) => (
              <div key={i} className="glass p-2 rounded-md flex justify-between">
                <div>{f.name}</div>
                <div className="subtext">{f.district} • {f.score}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="card col-span-6 row-start-4 col-start-7 h-full" {...fade}>
          <div className="flex gap-3">
            <Badge color="#FF9BCB"><Stethoscope className="w-5 h-5 text-black/80" /></Badge>
            <div className="card-title">AI doctor</div>
          </div>
          <div className="mt-3 subtext">{doctor?.tip}</div>
        </motion.div>

        {/* Row 5 */}
        <motion.div className="card col-span-6 row-start-5 col-start-1 h-full" {...fade}>
             <div className="flex gap-3">
            <Badge color="#FF8F8F">
              <LineChart className="w-5 h-5 text-black/80" />
            </Badge>
            <div className="card-title">Price forecast</div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {forecast.map((f, i) => (
              <div key={i} className="glass p-3 rounded-lg">
                <div className="font-medium">{f.crop}</div>
                <div className="subtext">
                  Next week: ₹{f.nextWeekPrice} • {f.trend} • conf {Math.round(f.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 5 right: Bidding */}
        <motion.div className="card col-span-6 row-start-5 col-start-7 h-full" {...fade}>
          <div className="flex gap-3">
            <Badge color="#FFB774">
              <Gavel className="w-5 h-5 text-black/80" />
            </Badge>
            <div className="card-title">Bidding</div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {bids.map((b, i) => (
              <div key={i} className="glass p-3 rounded-lg">
                <div className="font-medium">{b.crop}</div>
                <div className="subtext">
                  ₹{b.minPrice}–₹{b.maxPrice} • ends in {b.endsInMinutes}m
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
