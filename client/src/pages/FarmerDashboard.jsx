import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Users, 
  Timer, 
  Trophy, 
  Truck, 
  TrendingUp, 
  Gavel, 
  Stethoscope,
  Bell,
  LogOut
} from 'lucide-react';
import axios from 'axios';
import WeatherCard from '../components/WeatherCard';
import LeaderboardCard from '../components/LeaderboardCard';
import HarvestCountdownCard from '../components/HarvestCountdownCard';
import PriceForecastCard from '../components/PriceForecastCard';

const FarmerDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log('Fetching dashboard data for:', user.farmerId);
      const response = await axios.get(`${API_URL}/api/dashboard/farmer/${user.farmerId}`);
      console.log('Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (harvestDate) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e1e2d0] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#082829]/20 border-t-[#082829] rounded-full"
        />
        <p className="mt-4 text-[#082829]">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#e1e2d0] flex flex-col items-center justify-center">
        <p className="text-[#082829] text-xl">Failed to load dashboard data</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-6 py-2 bg-[#082829] text-[#fbfbef] rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e1e2d0]">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #082829 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl border-b border-green-200/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img 
                src="/src/assets/Morgen-logo-main.png" 
                alt="Morgen Logo" 
                className="h-10 w-auto object-contain rounded-xl"
              />
              <div>
                <h1 className="text-xl font-bold text-[#082829]">Morgen</h1>
                <p className="text-xs text-[#082829]/70">Farmer Dashboard</p>
              </div>
            </motion.div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#082829]">{dashboardData?.farmer?.name || user?.name || 'Farmer'}</p>
                <p className="text-xs text-[#082829]/70">{dashboardData?.farmer?.email || user?.email || 'Loading...'}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="bg-[#082829] hover:bg-[#082829] rounded-xl px-4 py-2 flex items-center gap-2 transition-all shadow-lg"
              >
                <LogOut className="w-4 h-4 text-[#fbfbef]" />
                <span className="text-[#fbfbef] font-semibold text-sm">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Top Left - Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
            className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl p-5 border border-green-200/20 shadow-2xl relative overflow-hidden group h-fit self-start"
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#082829]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              {/* Welcome Message at Top */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#082829] to-[#082829] rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-[#fbfbef]" />
                </div>
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-[#082829]"
                  >
                    Hello, {dashboardData?.farmer?.name || 'Farmer'}
                  </motion.h2>
                  <p className="text-[#082829]/70 text-sm">Welcome back to your dashboard</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/account'}
                  className="flex-1 bg-[#082829] hover:bg-[#082829] rounded-full px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <User className="w-4 h-4 text-[#fbfbef]" />
                  <span className="text-[#fbfbef] font-medium text-sm">Account</span>
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/my-customers'}
                  className="flex-1 bg-[#082829] hover:bg-[#082829] rounded-full px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Users className="w-4 h-4 text-[#fbfbef]" />
                  <span className="text-[#fbfbef] font-medium text-sm">Customers</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Top Right - Weather Card */}
          <div className="row-span-2 h-[350px]">
            <WeatherCard weather={dashboardData?.weather} onClick={() => window.location.href = '/weather'} />
          </div>

          {/* Countdown Card */}
          <div className="h-[180px]">
            <HarvestCountdownCard onClick={() => window.location.href = '/harvest-countdown'} />
          </div>

          {/* Updates Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/updates'}
            className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl p-6 border border-green-200/20 shadow-2xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 bg-[#082829] rounded-xl flex items-center justify-center shadow-lg relative">
                <Bell className="w-6 h-6 text-[#fbfbef]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-[#082829]">Updates</h2>
            </div>
            
            {dashboardData?.updates && dashboardData.updates.length > 0 ? (
              <div className="space-y-3 relative z-10 overflow-y-auto max-h-[10rem]">
                {dashboardData.updates.slice(0, 3).map((update, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="bg-[#cce0cc] border-l-4 border-[#a8c9a8] pl-4 py-3 rounded-xl transition-all shadow-md"
                  >
                    <div className="text-sm font-semibold text-[#082829] line-clamp-1">
                      {update.title}
                    </div>
                    <div className="text-xs text-[#082829]/70 mt-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#082829]/40 rounded-full" />
                      {new Date(update.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center pt-28 pb-12 text-[#082829]/70 relative z-10">
                <Bell className="w-16 h-16 text-[#082829]/20 mb-3" />
                <p className="font-medium">No updates available</p>
              </div>
            )}
          </motion.div>

          {/* Leaderboard Card */}
          <LeaderboardCard onClick={() => window.location.href = '/leaderboard'} />

          {/* Local Transport Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/local-transport'}
            className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl p-6 border border-green-200/20 shadow-2xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#082829] to-[#0a3a3c] rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-[#fbfbef]" />
              </div>
              <h2 className="text-xl font-bold text-[#082829]">Local Transport</h2>
            </div>
            <div className="text-center py-6 relative z-10">
              <Truck className="w-16 h-16 text-[#082829]/20 mx-auto mb-3" />
              <p className="text-[#082829]/70 font-medium">Find transport services</p>
            </div>
          </motion.div>

          {/* Price Forecast Card */}
          <PriceForecastCard onClick={() => window.location.href = '/price-forecast'} />

          {/* Live Bidding Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/live-bidding'}
            className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl p-6 border border-green-200/20 shadow-2xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#082829] to-[#0a3a3c] rounded-xl flex items-center justify-center shadow-lg">
                <Gavel className="w-6 h-6 text-[#fbfbef]" />
              </div>
              <h2 className="text-xl font-bold text-[#082829]">Live Bidding</h2>
            </div>
            <div className="text-center py-6 relative z-10">
              <Gavel className="w-16 h-16 text-[#082829]/20 mx-auto mb-3" />
              <p className="text-[#082829]/70 font-medium">Join live auctions</p>
            </div>
          </motion.div>

          {/* AI Doctor Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/ai-doctor'}
            className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl p-6 border border-green-200/20 shadow-2xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#082829] to-[#0a3a3c] rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-[#fbfbef]" />
              </div>
              <h2 className="text-xl font-bold text-[#082829]">AI Doctor</h2>
            </div>
            <div className="text-center py-6 relative z-10">
              <Stethoscope className="w-16 h-16 text-[#082829]/20 mx-auto mb-3" />
              <p className="text-[#082829]/70 font-medium">Crop health diagnosis</p>
            </div>
          </motion.div>

          {/* Sell Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/sell'}
            className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl p-6 border border-green-200/20 shadow-2xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#082829] to-[#0a3a3c] rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-[#fbfbef]" />
              </div>
              <h2 className="text-xl font-bold text-[#082829]">Sell</h2>
            </div>
            <div className="text-center py-6 relative z-10">
              <TrendingUp className="w-16 h-16 text-[#082829]/20 mx-auto mb-3" />
              <p className="text-[#082829]/70 font-medium">List your crops for sale</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;