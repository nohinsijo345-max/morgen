import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Users, 
  Truck, 
  Gavel, 
  Stethoscope,
  Bell,
  LogOut,
  ShoppingBag,
  Car,
  Bike
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
    
    // Set up auto-refresh for dashboard data every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log('Fetching dashboard data for:', user.farmerId);
      
      // Add cache-busting parameter to ensure fresh weather data
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/api/dashboard/farmer/${user.farmerId}?t=${timestamp}`);
      
      console.log('Dashboard data received:', {
        farmer: response.data.farmer?.name,
        weather: {
          location: response.data.weather?.location,
          temperature: response.data.weather?.temperature,
          condition: response.data.weather?.condition,
          lastUpdated: response.data.weather?.lastUpdated
        },
        timestamp: new Date().toISOString()
      });
      
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
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
            className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl pt-4 px-4 pb-2 border border-green-200/20 shadow-2xl cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#082829] rounded-xl flex items-center justify-center shadow-lg">
                  <Truck className="w-6 h-6 text-[#fbfbef]" />
                </div>
                <h2 className="text-xl font-bold text-[#082829]">Local Transport</h2>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            </div>
            
            <div className="relative z-10 space-y-1.5">
              {/* Active Order Tracking with Related Data */}
              {dashboardData?.upcomingDelivery ? (
                <div className="p-2.5 bg-gradient-to-r from-green-50/50 to-emerald-50/40 rounded-xl border border-green-200/40 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-emerald-800 font-semibold">ACTIVE DELIVERY</span>
                    <span className="text-xs bg-emerald-800/90 text-emerald-100 px-1.5 py-0.5 rounded-full font-medium">
                      {dashboardData.upcomingDelivery.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-900 mb-1">
                    {dashboardData.upcomingDelivery.destination}
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-700 mb-1.5">
                    <span>Expected: {new Date(dashboardData.upcomingDelivery.expectedDate).toLocaleDateString()}</span>
                    <span className="font-bold text-emerald-800">₹{dashboardData.upcomingDelivery.amount}</span>
                  </div>
                  
                  {/* Progress bar for active delivery */}
                  <div className="bg-emerald-200/60 rounded-full h-1.5 mb-1.5">
                    <div className="bg-emerald-600 h-1.5 rounded-full w-3/4"></div>
                  </div>
                  <div className="text-xs text-emerald-700 mb-1.5">75% Complete - Driver en route</div>
                  
                  {/* Driver & Vehicle Info - Active Order */}
                  <div className="bg-[#cce0cc] rounded-lg p-2 border border-green-200/40 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-[#082829]">Driver Details</span>
                      <span className="text-xs text-[#082829]/70">Live tracking</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <div className="text-xs text-[#082829]">Driver: Rajesh Kumar</div>
                        <div className="text-xs text-[#082829]/80">⭐ 4.8 (234 trips)</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#082829]">Vehicle: {dashboardData.upcomingDelivery.vehicleType || 'Truck'}</div>
                        <div className="text-xs text-[#082829]/80">📱 +91 98765-43210</div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Stats & Live Updates */}
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    <div className="bg-[#cce0cc] rounded-lg p-1.5 border border-green-200/40 shadow-sm">
                      <div className="text-xs text-[#082829] font-medium mb-1">Trip Stats</div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-xs text-[#082829]/70">Distance:</span>
                          <span className="text-xs font-semibold text-[#082829]">45 km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[#082829]/70">ETA:</span>
                          <span className="text-xs font-semibold text-[#082829]">2.5h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-[#082829]/70">Speed:</span>
                          <span className="text-xs font-semibold text-[#082829]">65 km/h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#cce0cc] rounded-lg p-1.5 border border-green-200/40 shadow-sm">
                      <div className="text-xs text-[#082829] font-medium mb-1">Live Updates</div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                          <span className="text-xs text-[#082829]/70">Picked up</span>
                          <span className="text-xs text-[#082829] ml-auto">2:30 PM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-700 rounded-full"></div>
                          <span className="text-xs text-[#082829]/70">En route</span>
                          <span className="text-xs text-[#082829] ml-auto">3:15 PM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-[#082829]/70">Delivery</span>
                          <span className="text-xs text-[#082829] ml-auto">5:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route & Cost Info */}
                  <div className="bg-[#cce0cc] rounded-lg p-1.5 border border-green-200/40 shadow-sm mt-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#082829]">Route & Cost</span>
                      <span className="text-xs text-[#082829]/70">Optimized</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-xs font-bold text-[#082829]">Kochi</div>
                        <div className="text-xs text-[#082829]/70">Pickup</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-[#082829]">→ 45km →</div>
                        <div className="text-xs text-[#082829]/70">Route</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-[#082829]">Thrissur</div>
                        <div className="text-xs text-[#082829]/70">Drop</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button for Active Order */}
                  <div className="mt-1.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/order-tracking';
                      }}
                      className="w-full text-xs bg-[#082829] text-[#fbfbef] px-2 py-1.5 rounded-lg hover:bg-[#082829]/90 transition-all font-semibold shadow-md flex items-center justify-center gap-1"
                    >
                      <span>📍</span>
                      <span>Track Live Order</span>
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="p-2 bg-gradient-to-r from-green-50/40 to-emerald-50/30 rounded-xl border border-green-200/30 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-green-600 font-semibold">NO ACTIVE ORDERS</div>
                        <div className="text-sm text-[#082829]/70">Book your next transport</div>
                      </div>
                      <Truck className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                  
                  {/* Price and availability */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-50/50 to-emerald-50/40 rounded-lg px-2.5 py-1.5 border border-green-200/40 shadow-sm mt-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-700/80">From</span>
                      <span className="text-base font-bold text-green-700">₹50</span>
                      <span className="text-xs text-green-700/80">/km</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 bg-green-100/80 rounded-full flex items-center justify-center border border-green-50 shadow-sm">
                          <Truck className="w-2.5 h-2.5 text-green-700" />
                        </div>
                        <div className="w-5 h-5 bg-emerald-100/80 rounded-full flex items-center justify-center border border-green-50 shadow-sm">
                          <Car className="w-2.5 h-2.5 text-emerald-700" />
                        </div>
                        <div className="w-5 h-5 bg-teal-100/80 rounded-full flex items-center justify-center border border-green-50 shadow-sm">
                          <Bike className="w-2.5 h-2.5 text-teal-700" />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-green-700">8 online</span>
                    </div>
                  </div>

                  {/* Quick Stats - Only show when no active orders */}
                  <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                    <div className="bg-gradient-to-br from-green-50/60 to-emerald-100/50 rounded-lg p-1.5 text-center border border-green-200/50 shadow-sm">
                      <div className="text-sm font-bold text-green-700">47</div>
                      <div className="text-xs text-green-600/90">Trips</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50/60 to-teal-100/50 rounded-lg p-1.5 text-center border border-emerald-200/50 shadow-sm">
                      <div className="text-sm font-bold text-emerald-700">₹3.2K</div>
                      <div className="text-xs text-emerald-600/90">Saved</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50/60 to-green-100/50 rounded-lg p-1.5 text-center border border-teal-200/50 shadow-sm">
                      <div className="text-sm font-bold text-teal-700">4.9★</div>
                      <div className="text-xs text-teal-600/90">Rating</div>
                    </div>
                  </div>

                  {/* Commonly Used Routes - Only show when no active orders */}
                  <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/40 rounded-lg p-2 border border-amber-200/40 shadow-sm mt-1.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-amber-700">Popular Routes</span>
                      <span className="text-xs text-amber-600">This week</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1 border border-amber-200/30">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                          <span className="text-xs text-amber-800 font-medium">Kochi → Thrissur</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-amber-700">₹850</span>
                          <span className="text-xs text-amber-600/80">75km</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1 border border-amber-200/30">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                          <span className="text-xs text-orange-800 font-medium">Kochi → Alappuzha</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-orange-700">₹650</span>
                          <span className="text-xs text-orange-600/80">53km</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1 border border-amber-200/30">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                          <span className="text-xs text-yellow-800 font-medium">Kochi → Kottayam</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-yellow-700">₹720</span>
                          <span className="text-xs text-yellow-600/80">62km</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-amber-200/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-700/80">Avg. delivery time</span>
                        <span className="text-xs font-semibold text-amber-800">4-6 hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Only show when no active orders */}
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/order-tracking';
                      }}
                      className="text-xs bg-[#082829] text-[#fbfbef] px-2 py-1.5 rounded-lg hover:bg-[#082829]/90 transition-all font-semibold shadow-md flex items-center justify-center gap-1"
                    >
                      <span>📋</span>
                      <span>View Orders</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/local-transport';
                      }}
                      className="text-xs bg-emerald-600 text-white px-2 py-1.5 rounded-lg hover:bg-emerald-700 transition-all font-semibold shadow-md flex items-center justify-center gap-1"
                    >
                      <span>🚚</span>
                      <span>Book Now</span>
                    </motion.button>
                  </div>

                  {/* Quick Tip - Only show when no active orders */}
                  <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/40 rounded-lg p-1.5 border border-green-200/40 shadow-sm flex items-center gap-1.5 mt-1.5">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white text-xs">🚚</span>
                    </div>
                    <span className="text-xs text-green-700">Free delivery for orders above ₹500!</span>
                  </div>
                </div>
              )}
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
                <ShoppingBag className="w-6 h-6 text-[#fbfbef]" />
              </div>
              <h2 className="text-xl font-bold text-[#082829]">Sell</h2>
            </div>
            <div className="text-center py-6 relative z-10">
              <ShoppingBag className="w-16 h-16 text-[#082829]/20 mx-auto mb-3" />
              <p className="text-[#082829]/70 font-medium">List your crops for sale</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;