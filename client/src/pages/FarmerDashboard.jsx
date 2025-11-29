import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CloudRain, Wind, Bell, Trophy, Stethoscope, Timer, Calculator,
  Truck, LineChart, Gavel, LogOut, TrendingUp, Package, DollarSign,
  Calendar, MapPin, AlertCircle, Leaf, Users, ArrowUp, ArrowDown
} from "lucide-react";
import { fetchJSON, endpoints } from "../services/api";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-lg font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Morgen</h1>
                <p className="text-sm text-gray-600">Farmer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{summary?.name || user?.name || "Farmer"}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1 justify-end">
                  <MapPin className="w-3 h-3" />
                  {summary?.district || "Kerala"}
                </p>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {countdown?.daysToHarvest || 0}
            </h3>
            <p className="text-sm text-gray-600">Days to Harvest</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ₹{profit?.net?.toLocaleString() || 0}
            </h3>
            <p className="text-sm text-gray-600">Net Profit</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Rank #{leaderboard.findIndex(f => f.name === summary?.name) + 1 || 1}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {summary?.score || 0}
            </h3>
            <p className="text-sm text-gray-600">Reputation Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Gavel className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Live
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {bids?.length || 0}
            </h3>
            <p className="text-sm text-gray-600">Active Bids</p>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CloudRain className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Weather Alerts</h2>
              </div>
              <div className="space-y-3">
                {weather.map((w, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className={`p-2 rounded-lg ${w.icon === 'cloud-rain' ? 'bg-blue-200' : 'bg-purple-200'}`}>
                      {w.icon === 'cloud-rain' ? (
                        <CloudRain className="w-5 h-5 text-blue-700" />
                      ) : (
                        <Wind className="w-5 h-5 text-purple-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{w.type}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          w.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {w.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{w.message}</p>
                      <p className="text-xs text-gray-500">{w.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Price Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <LineChart className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Price Forecast</h2>
              </div>
              <div className="space-y-4">
                {forecast.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <h3 className="font-semibold text-gray-900">{f.crop}</h3>
                      <p className="text-sm text-gray-600">Next week: ₹{f.nextWeekPrice}</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 font-semibold ${
                        f.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {f.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {f.trend}
                      </div>
                      <p className="text-xs text-gray-500">{Math.round(f.confidence * 100)}% confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Doctor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-pink-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-200 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-pink-700" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">AI Plant Doctor</h2>
              </div>
              <p className="text-gray-700 mb-4">{doctor?.tip}</p>
              <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all">
                Scan Plant Now
              </button>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Updates</h2>
              </div>
              <div className="space-y-3">
                {updates.map((u, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{u.title}</h3>
                    <p className="text-xs text-gray-600">{u.summary}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
              </div>
              <div className="space-y-3">
                {leaderboard.map((f, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${
                    i === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
                    i === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200' :
                    i === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200' :
                    'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        i === 0 ? 'bg-yellow-400 text-yellow-900' :
                        i === 1 ? 'bg-gray-400 text-gray-900' :
                        i === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{f.name}</p>
                        <p className="text-xs text-gray-600">{f.district}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{f.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Transport */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Transport</h2>
              </div>
              <div className="space-y-3">
                {transport.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.routeName}</p>
                      <p className="text-xs text-gray-600">{t.etaHrs}h delivery</p>
                    </div>
                    <p className="font-bold text-green-600">₹{t.cost}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
