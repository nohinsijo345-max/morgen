import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Users, 
  Truck, 
  Gavel, 
  Bell,
  LogOut,
  ShoppingBag,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Package
} from 'lucide-react';
import axios from 'axios';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import WeatherCard from '../components/WeatherCard';
import LeaderboardCard from '../components/LeaderboardCard';
import BuyerGlassCard from '../components/BuyerGlassCard';
import BuyerNeumorphicThemeToggle from '../components/BuyerNeumorphicThemeToggle';
import { UserSession } from '../utils/userSession';

const BuyerDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cropData, setCropData] = useState({ availableCount: 0, avgPrice: 0 });
  const { isDarkMode, toggleTheme, colors } = useBuyerTheme();

  // Get buyer type from user data
  const buyerType = user?.buyerType || 'commercial';
  const isPublicBuyer = buyerType === 'public';

  useEffect(() => {
    fetchDashboardData();
    if (isPublicBuyer) {
      fetchCropData();
    }
    
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
      if (isPublicBuyer) {
        fetchCropData();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [isPublicBuyer]);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const timestamp = new Date().getTime();
      
      // Get buyer ID from session or use fallback
      const buyerUser = UserSession.getCurrentUser('buyer');
      const buyerId = buyerUser?.buyerId || 'MGB002';
      
      console.log('✅ Fetching buyer dashboard data for buyerId:', buyerId);
      
      const response = await axios.get(`${API_URL}/api/dashboard/buyer/${buyerId}?t=${timestamp}`);
      setDashboardData(response.data);
      console.log('✅ Buyer dashboard data loaded:', response.data);
    } catch (error) {
      console.error('Failed to fetch buyer dashboard data:', error);
      // Set fallback data to prevent crashes
      setDashboardData({
        buyer: {
          name: 'NOHIN SIJO',
          email: 'esijojose@gmail.com',
          phone: '9447212484',
          totalPurchases: 0,
          totalBids: 0,
          activeBids: 0,
          maxBidLimit: 100000
        },
        totalFarmers: 0,
        totalOrders: 0,
        totalBids: 0,
        activeBids: 0,
        recentActivity: [],
        updates: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCropData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const buyerUser = UserSession.getCurrentUser('buyer');
      
      const params = new URLSearchParams();
      if (buyerUser?.state) params.append('state', buyerUser.state);
      if (buyerUser?.district) params.append('district', buyerUser.district);
      
      const response = await axios.get(`${API_URL}/api/analytics/public-buyer/crops?${params.toString()}`);
      setCropData(response.data);
      console.log('✅ Crop data loaded:', response.data);
    } catch (error) {
      console.error('Failed to fetch crop data:', error);
      setCropData({ availableCount: 0, avgPrice: 0 });
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
        <p className="mt-4" style={{ color: colors.textSecondary }}>Loading Buyer Dashboard...</p>
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
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {isPublicBuyer ? 'Public Buyer Dashboard' : 'Commercial Buyer Dashboard'}
                </p>
              </div>
            </motion.div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <BuyerNeumorphicThemeToggle size="sm" />

              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  {dashboardData?.buyer?.name || user?.name || 'Buyer'}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {dashboardData?.buyer?.email || user?.email || 'Loading...'}
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
          
          {/* Left Column */}
          <div className="space-y-4">
            {/* Welcome Card */}
            <BuyerGlassCard delay={0.1} hoverScale={1.01} className="h-fit">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2"
                       style={{ borderColor: `${colors.primary}40` }}>
                    {(dashboardData?.buyer?.profileImage || user?.profileImage) ? (
                      <img
                        src={(() => {
                          const profileImage = dashboardData?.buyer?.profileImage || user?.profileImage;
                          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
                          return profileImage?.startsWith('http') 
                            ? profileImage 
                            : `${API_URL}${profileImage}`;
                        })()}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback Avatar */}
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ 
                        display: (dashboardData?.buyer?.profileImage || user?.profileImage) ? 'none' : 'flex',
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
                    Hello, {dashboardData?.buyer?.name || user?.name || 'Buyer'}
                  </motion.h2>
                  <p style={{ color: colors.textSecondary }} className="text-sm">Welcome back</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/buyer/account'}
                  className="flex-1 rounded-full px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md"
                  style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm">Account</span>
                </motion.button>
                
                {/* My Farmers - Only for Commercial Buyers */}
                {!isPublicBuyer && (
                  <motion.button 
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/buyer/my-farmers'}
                    className="flex-1 rounded-full px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md"
                    style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-sm">My Farmers</span>
                  </motion.button>
                )}
              </div>
            </BuyerGlassCard>

            {/* Updates Card - Moved directly below Hello card */}
            <BuyerGlassCard delay={0.3} onClick={() => window.location.href = '/buyer/updates'} className="h-fit">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg relative"
                     style={{ backgroundColor: colors.primary }}>
                  <Bell className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Updates</h2>
              </div>
              
              {dashboardData?.updates && dashboardData.updates.length > 0 ? (
                <div className="space-y-2 overflow-y-auto max-h-[10rem]">
                  {dashboardData.updates.slice(0, 4).map((update, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                      className="border-l-4 pl-3 py-2 rounded-lg transition-all shadow-sm"
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
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <Bell className="w-10 h-10 mb-3 opacity-30" style={{ color: colors.textMuted }} />
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>No updates available</p>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Check back later for updates</p>
                  
                  {/* Sample updates preview */}
                  <div className="mt-4 space-y-2 w-full">
                    <div className="border-l-4 pl-3 py-2 rounded-lg opacity-50" 
                         style={{ backgroundColor: colors.surface, borderLeftColor: colors.primary }}>
                      <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                        Sample: Order notifications
                      </div>
                    </div>
                    <div className="border-l-4 pl-3 py-2 rounded-lg opacity-50" 
                         style={{ backgroundColor: colors.surface, borderLeftColor: colors.primary }}>
                      <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                        Sample: Bidding updates
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </BuyerGlassCard>

            {/* Live Bidding Card - Only for Commercial Buyers */}
            {!isPublicBuyer && (
              <BuyerGlassCard delay={0.5} onClick={() => window.location.href = '/buyer/live-bidding'} className="h-fit">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                       style={{ backgroundColor: colors.primary }}>
                    <Gavel className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Live Bidding</h2>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium" style={{ color: colors.primary }}>
                        {dashboardData?.activeBids || 0} active bids
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-xl p-4 border"
                       style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Bidding Stats</span>
                      <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: String(dashboardData?.totalBids || 0), label: 'Total Bids' },
                        { value: String(dashboardData?.activeBids || 0), label: 'Active' }
                      ].map((stat, i) => (
                        <div key={i} className="text-center rounded-lg p-3 border"
                             style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
                          <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>{stat.value}</div>
                          <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/buyer/live-bidding';
                    }}
                    className="w-full py-3 rounded-xl font-semibold shadow-lg transition-all"
                    style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                  >
                    Join Live Auctions
                  </motion.button>
                </div>
              </BuyerGlassCard>
            )}

            {/* Direct Purchase Card - For Public Buyers */}
            {isPublicBuyer && (
              <BuyerGlassCard delay={0.5} onClick={() => window.location.href = '/buyer/buy-crops'} className="h-fit">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                       style={{ backgroundColor: colors.primary }}>
                    <ShoppingBag className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Buy Crops</h2>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" style={{ color: colors.primary }} />
                      <span className="text-xs font-medium" style={{ color: colors.primary }}>
                        Local district crops only
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-xl p-4 border"
                       style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Available Crops</span>
                      <Clock className="w-4 h-4" style={{ color: colors.primary }} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: String(cropData.availableCount || 0), label: 'Available' },
                        { value: cropData.avgPrice > 0 ? `₹${cropData.avgPrice}/kg` : '₹0/kg', label: 'Avg Price' }
                      ].map((stat, i) => (
                        <div key={i} className="text-center rounded-lg p-3 border"
                             style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
                          <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>{stat.value}</div>
                          <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/buyer/buy-crops';
                    }}
                    className="w-full py-3 rounded-xl font-semibold shadow-lg transition-all"
                    style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                  >
                    🛒 Browse Local Crops
                  </motion.button>
                </div>
              </BuyerGlassCard>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Leaderboard Card */}
            <LeaderboardCard 
              onClick={() => window.location.href = '/buyer/leaderboard'} 
              useBuyerTheme={true}
            />

            {/* Order Tracking Card - Only for Commercial Buyers */}
            {!isPublicBuyer && (
              <BuyerGlassCard delay={0.7} onClick={() => window.location.href = '/buyer/order-tracking'} className="h-fit">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                       style={{ backgroundColor: colors.primary }}>
                    <Package className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Order Tracking</h2>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium" style={{ color: colors.primary }}>
                        {dashboardData?.totalOrders || 0} active orders
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-xl p-4 border"
                       style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Recent Orders</span>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Last 7 days</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: dashboardData?.totalOrders || '0', label: 'Total' },
                        { value: dashboardData?.activeBids || '0', label: 'Active' },
                        { value: '4.8', label: 'Rating', showStar: true }
                      ].map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className="flex items-center justify-center gap-1">
                          <span className="text-lg font-bold" style={{ color: colors.textPrimary }}>{stat.value}</span>
                          {stat.showStar && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </BuyerGlassCard>
            )}

            {/* Transport Booking Card - For Public Buyers */}
            {isPublicBuyer && (
              <BuyerGlassCard delay={0.7} onClick={() => window.location.href = '/buyer/transport'} className="h-fit">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                       style={{ backgroundColor: colors.primary }}>
                    <Truck className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Transport</h2>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium" style={{ color: colors.primary }}>
                        Book cargo transport
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-xl p-4 border"
                       style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Transport Options</span>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Available now</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5', label: 'Vehicles' },
                        { value: '₹12/km', label: 'Rate' }
                      ].map((stat, i) => (
                        <div key={i} className="text-center rounded-lg p-3 border"
                             style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
                          <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>{stat.value}</div>
                          <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/buyer/transport';
                    }}
                    className="w-full py-3 rounded-xl font-semibold shadow-lg transition-all"
                    style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                  >
                    🚛 Book Transport
                  </motion.button>
                </div>
              </BuyerGlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;