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
  MapPin,
  Clock,
  Star,
  Navigation,
  Route
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import WeatherCard from '../components/WeatherCard';
import LeaderboardCard from '../components/LeaderboardCard';
import HarvestCountdownCard from '../components/HarvestCountdownCard';
import PriceForecastCard from '../components/PriceForecastCard';
import GlassCard from '../components/GlassCard';
import NeumorphicThemeToggle from '../components/NeumorphicThemeToggle';
import { UserSession } from '../utils/userSession';

const FarmerDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiDoctorStats, setAiDoctorStats] = useState(null);
  const { isDarkMode, toggleTheme, colors } = useTheme();

  useEffect(() => {
    fetchDashboardData();
    fetchAiDoctorStats();
    
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
      fetchAiDoctorStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const timestamp = new Date().getTime();
      
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId || user?.farmerId;
      
      if (!farmerId) {
        console.error('No farmerId found in session or props');
        setDashboardData({
          totalCrops: 0,
          totalCustomers: 0,
          totalTransport: 0,
          totalAuctions: 0,
          recentActivity: []
        });
        setLoading(false);
        return;
      }
      
      console.log('✅ Fetching dashboard data for farmerId:', farmerId);
      
      const response = await axios.get(`${API_URL}/api/dashboard/farmer/${farmerId}?t=${timestamp}`);
      setDashboardData(response.data);
      console.log('✅ Dashboard data loaded:', response.data);
      console.log('🖼️ Profile image in dashboard data:', response.data?.farmer?.profileImage);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set fallback data to prevent crashes
      setDashboardData({
        totalCrops: 0,
        totalCustomers: 0,
        totalTransport: 0,
        totalAuctions: 0,
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAiDoctorStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId || user?.farmerId;
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found for AI Doctor stats');
        setAiDoctorStats({
          totalConsultations: 0,
          questionsAsked: 0,
          imagesAnalyzed: 0,
          lastConsultation: null,
          isActive: false,
          recentTopics: []
        });
        return;
      }
      
      console.log('✅ Fetching AI Doctor stats for farmerId:', farmerId);
      
      const response = await axios.get(`${API_URL}/api/ai-doctor/stats/${farmerId}`);
      setAiDoctorStats(response.data);
      console.log('✅ AI Doctor stats loaded:', response.data);
    } catch (error) {
      console.log('⚠️ AI Doctor stats not available, using fallback');
      setAiDoctorStats({
        totalConsultations: 0,
        questionsAsked: 0,
        imagesAnalyzed: 0,
        lastConsultation: null,
        isActive: false,
        recentTopics: []
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
        <p className="mt-4" style={{ color: colors.textSecondary }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <p className="text-xl" style={{ color: colors.textPrimary }}>Failed to load dashboard data</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-6 py-2 rounded-lg"
          style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Card style helper
  const cardStyle = {
    backgroundColor: colors.backgroundCard,
    borderColor: colors.cardBorder,
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 backdrop-blur-xl border-b shadow-lg sticky top-0"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
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
                <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Morgen</h1>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Farmer Dashboard</p>
              </div>
            </motion.div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <NeumorphicThemeToggle size="sm" />

              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  {dashboardData?.farmer?.name || user?.name || 'Farmer'}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {dashboardData?.farmer?.email || user?.email || 'Loading...'}
                </p>
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="rounded-xl px-4 py-2 flex items-center gap-2 transition-all shadow-lg"
                style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
              >
                <LogOut className="w-4 h-4" />
                <span className="font-semibold text-sm">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Welcome Card */}
          <GlassCard delay={0.1} hoverScale={1.01} className="h-fit self-start p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2"
                     style={{ borderColor: `${colors.primary}40` }}>
                  {(dashboardData?.farmer?.profileImage || user?.profileImage) ? (
                    <img
                      src={(() => {
                        const profileImage = dashboardData?.farmer?.profileImage || user?.profileImage;
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
                        const imageUrl = profileImage?.startsWith('http') 
                          ? profileImage 
                          : `${API_URL}${profileImage}`;
                        console.log('🖼️ Profile image URL in hello card:', imageUrl);
                        console.log('🖼️ Dashboard farmer profileImage:', dashboardData?.farmer?.profileImage);
                        console.log('🖼️ User prop profileImage:', user?.profileImage);
                        return imageUrl;
                      })()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Profile image load error in hello card:', e);
                        console.log('❌ Failed URL:', e.target.src);
                        console.log('❌ Dashboard farmer data:', dashboardData?.farmer);
                        console.log('❌ User prop data:', user);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('✅ Profile image loaded successfully in hello card');
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Avatar */}
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ 
                      display: (dashboardData?.farmer?.profileImage || user?.profileImage) ? 'none' : 'flex',
                      backgroundColor: colors.primary 
                    }}
                  >
                    <User className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  </div>
                </div>
              </div>
              
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Hello, {dashboardData?.farmer?.name || user?.name || 'Farmer'}
                </motion.h2>
                <p style={{ color: colors.textSecondary }} className="text-sm">Welcome back to your dashboard</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/account'}
                className="flex-1 rounded-full px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md"
                style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
              >
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">Account</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/my-customers'}
                className="flex-1 rounded-full px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
              >
                <Users className="w-4 h-4" />
                <span className="font-medium text-sm">Customers</span>
              </motion.button>
            </div>
          </GlassCard>

          {/* Weather Card */}
          <div className="row-span-2 h-[350px]">
            <WeatherCard weather={dashboardData?.weather} onClick={() => window.location.href = '/weather'} />
          </div>

          {/* Countdown Card */}
          <div className="h-[180px]">
            <HarvestCountdownCard onClick={() => window.location.href = '/harvest-countdown'} />
          </div>

          {/* Updates Card */}
          <GlassCard delay={0.3} onClick={() => window.location.href = '/updates'}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg relative"
                   style={{ backgroundColor: colors.primary }}>
                <Bell className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Updates</h2>
            </div>
            
            {dashboardData?.updates && dashboardData.updates.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[10rem]">
                {dashboardData.updates.slice(0, 3).map((update, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="border-l-4 pl-4 py-3 rounded-xl transition-all shadow-md"
                    style={{ 
                      backgroundColor: colors.surface, 
                      borderLeftColor: colors.primary 
                    }}
                  >
                    <div className="text-sm font-semibold line-clamp-1" style={{ color: colors.textPrimary }}>
                      {update.title}
                    </div>
                    <div className="text-xs mt-1 flex items-center gap-2" style={{ color: colors.textSecondary }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.textMuted }} />
                      {new Date(update.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center pt-28 pb-12">
                <Bell className="w-16 h-16 mb-3" style={{ color: colors.textMuted }} />
                <p className="font-medium" style={{ color: colors.textSecondary }}>No updates available</p>
              </div>
            )}
          </GlassCard>

          {/* Leaderboard Card */}
          <LeaderboardCard onClick={() => window.location.href = '/leaderboard'} />

          {/* Local Transport Card */}
          <GlassCard 
            delay={0.5} 
            onClick={() => window.location.href = '/local-transport'}
            className="min-h-[400px] flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   style={{ backgroundColor: colors.primary }}>
                <Truck className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Local Transport</h2>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium" style={{ color: colors.primary }}>8 drivers online</span>
                </div>
              </div>
            </div>
            
            {/* Route Card */}
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="rounded-xl p-6 border shadow-sm min-h-[220px] flex-1"
                   style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                       style={{ backgroundColor: colors.primary }}>
                    <Route className="w-5 h-5" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  </div>
                  <span className="text-base font-semibold" style={{ color: colors.textPrimary }}>Popular Route</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                    <span className="text-xl font-bold" style={{ color: colors.textPrimary }}>Kochi → Thrissur</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: colors.primary }}>₹850</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-base" style={{ color: colors.textSecondary }}>
                    <Navigation className="w-4 h-4" />
                    <span className="font-medium">75 km</span>
                  </div>
                  <div className="flex items-center gap-2 text-base" style={{ color: colors.textSecondary }}>
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">2.5 hours</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>4.8 Rating</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                    <Truck className="w-3 h-3" />
                    <span>12 Vehicles</span>
                  </div>
                </div>
                
                <div className="rounded-lg p-3 border" style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium" style={{ color: colors.textSecondary }}>Starting from</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold" style={{ color: colors.primary }}>₹50</span>
                      <span className="text-base" style={{ color: colors.textMuted }}>/km</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '47', label: 'Trips' },
                  { value: '₹3.2K', label: 'Saved' },
                  { value: '4.9', label: 'Rating', showStar: true }
                ].map((stat, i) => (
                  <div key={i} className="text-center rounded-lg p-3 border"
                       style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xl font-bold" style={{ color: colors.textPrimary }}>{stat.value}</span>
                      {stat.showStar && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/local-transport';
              }}
              className="w-full mt-4 py-3 rounded-xl font-semibold shadow-lg transition-all"
              style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
            >
              🚚 Book Transport
            </motion.button>
          </GlassCard>

          {/* Price Forecast Card */}
          <PriceForecastCard onClick={() => window.location.href = '/price-forecast'} />

          {/* Live Bidding Card */}
          <GlassCard delay={0.7} onClick={() => window.location.href = '/farmer/my-bids'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   style={{ backgroundColor: colors.primary }}>
                <Gavel className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Live Bidding</h2>
            </div>
            <div className="text-center py-6">
              <Gavel className="w-16 h-16 mx-auto mb-3" style={{ color: colors.textMuted }} />
              <p className="font-medium" style={{ color: colors.textSecondary }}>Join live auctions</p>
            </div>
          </GlassCard>

          {/* AI Doctor Card */}
          <GlassCard delay={0.8} onClick={() => window.location.href = '/ai-doctor'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   style={{ backgroundColor: colors.primary }}>
                <Stethoscope className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>AI Plant Doctor</h2>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium" style={{ color: colors.primary }}>24/7 Available</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl p-4 border shadow-sm mb-4"
                 style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                     style={{ backgroundColor: colors.primaryLight }}>
                  <Stethoscope className="w-6 h-6" style={{ color: colors.primary }} />
                </div>
                <div className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>Ready to Help!</div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>Ask about plant diseases, pests & care</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { value: aiDoctorStats?.totalConsultations || 0, label: 'Consults' },
                { value: aiDoctorStats?.imagesAnalyzed || 0, label: 'Images' },
                { value: 'AI', label: 'Powered' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: colors.textSecondary }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = '/ai-doctor'; }}
                className="py-2 px-3 rounded-xl font-semibold text-sm shadow-lg transition-all"
                style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
              >
                💬 Chat
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = '/ai-doctor'; }}
                className="py-2 px-3 rounded-xl font-semibold text-sm shadow-lg transition-all border"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }}
              >
                📸 Scan
              </motion.button>
            </div>
          </GlassCard>

          {/* Sell Card */}
          <GlassCard delay={0.9} onClick={() => window.location.href = '/farmer/sell-crops'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   style={{ backgroundColor: colors.primary }}>
                <ShoppingBag className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Sell</h2>
            </div>
            <div className="text-center py-6">
              <ShoppingBag className="w-16 h-16 mx-auto mb-3" style={{ color: colors.textMuted }} />
              <p className="font-medium" style={{ color: colors.textSecondary }}>List your crops for sale</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;