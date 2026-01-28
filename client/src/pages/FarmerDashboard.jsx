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
import LanguageSelector from '../components/LanguageSelector';
import GoogleTranslateButton from '../components/GoogleTranslateButton';
import { useTranslation } from '../hooks/useTranslation';

const FarmerDashboard = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiDoctorStats, setAiDoctorStats] = useState(null);
  const [biddingStats, setBiddingStats] = useState(null);
  const [cropStats, setCropStats] = useState(null);
  const { isDarkMode, toggleTheme, colors } = useTheme();

  useEffect(() => {
    fetchDashboardData();
    fetchAiDoctorStats();
    fetchBiddingStats();
    fetchCropStats();
    
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
      fetchAiDoctorStats();
      fetchBiddingStats();
      fetchCropStats();
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

  const fetchBiddingStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId || user?.farmerId;
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found for bidding stats');
        setBiddingStats({
          totalBids: 0,
          activeBids: 0,
          completedBids: 0,
          totalEarnings: 0,
          averageBidValue: 0,
          recentBids: []
        });
        return;
      }
      
      console.log('🔄 Fetching bidding stats for farmerId:', farmerId);
      
      const response = await axios.get(`${API_URL}/api/bidding/farmer/${farmerId}`);
      const bids = response.data.bids || [];
      
      // Calculate stats from bids
      const activeBids = bids.filter(bid => bid.status === 'active').length;
      const completedBids = bids.filter(bid => bid.status === 'ended' || bid.status === 'completed').length;
      const totalEarnings = bids
        .filter(bid => bid.winningAmount)
        .reduce((sum, bid) => sum + (bid.winningAmount || 0), 0);
      const averageBidValue = bids.length > 0 ? 
        bids.reduce((sum, bid) => sum + (bid.currentPrice || bid.startingPrice || 0), 0) / bids.length : 0;
      
      setBiddingStats({
        totalBids: bids.length,
        activeBids,
        completedBids,
        totalEarnings,
        averageBidValue: Math.round(averageBidValue),
        recentBids: bids.slice(0, 3)
      });
      
      console.log('✅ Bidding stats loaded:', {
        totalBids: bids.length,
        activeBids,
        completedBids,
        totalEarnings
      });
    } catch (error) {
      console.log('⚠️ Bidding stats not available, using fallback:', error.message);
      setBiddingStats({
        totalBids: 0,
        activeBids: 0,
        completedBids: 0,
        totalEarnings: 0,
        averageBidValue: 0,
        recentBids: []
      });
    }
  };

  const fetchCropStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId || user?.farmerId;
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found for crop stats');
        setCropStats({
          totalCrops: 0,
          availableCrops: 0,
          soldCrops: 0,
          totalValue: 0,
          averagePrice: 0,
          recentCrops: []
        });
        return;
      }
      
      console.log('🔄 Fetching crop stats for farmerId:', farmerId);
      
      const response = await axios.get(`${API_URL}/api/crops/farmer/${farmerId}`);
      const crops = response.data.crops || [];
      
      // Calculate stats from crops
      const availableCrops = crops.filter(crop => crop.available).length;
      const soldCrops = crops.filter(crop => !crop.available).length;
      const totalValue = crops.reduce((sum, crop) => sum + (crop.pricePerUnit * crop.quantity), 0);
      const averagePrice = crops.length > 0 ? 
        crops.reduce((sum, crop) => sum + (crop.pricePerUnit || 0), 0) / crops.length : 0;
      
      setCropStats({
        totalCrops: crops.length,
        availableCrops,
        soldCrops,
        totalValue: Math.round(totalValue),
        averagePrice: Math.round(averagePrice),
        recentCrops: crops.slice(0, 3)
      });
      
      console.log('✅ Crop stats loaded:', {
        totalCrops: crops.length,
        availableCrops,
        soldCrops,
        totalValue: Math.round(totalValue)
      });
    } catch (error) {
      console.log('⚠️ Crop stats not available, using fallback:', error.message);
      setCropStats({
        totalCrops: 0,
        availableCrops: 0,
        soldCrops: 0,
        totalValue: 0,
        averagePrice: 0,
        recentCrops: []
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
        <p className="mt-4" style={{ color: colors.textSecondary }}>{t('loading')}...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <p className="text-xl" style={{ color: colors.textPrimary }}>{t('failedToLoadDashboard')}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-6 py-2 rounded-lg"
          style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
        >
          {t('retry')}
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
                <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('dashboard')}</h1>
                <p className="text-xs" style={{ color: colors.textSecondary }}>{t('welcome')}</p>
              </div>
            </motion.div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <LanguageSelector />
              
              {/* Google Translate Button */}
              <GoogleTranslateButton size="sm" />
              
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
                <span className="font-semibold text-sm">{t('logout')}</span>
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
                  {t('hello')}, {dashboardData?.farmer?.name || user?.name || 'Farmer'}
                </motion.h2>
                <p style={{ color: colors.textSecondary }} className="text-sm">{t('welcomeBack')}</p>
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
                <span className="font-medium text-sm">{t('account')}</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/my-customers'}
                className="flex-1 rounded-full px-4 py-2.5 flex items-center justify-center gap-2 transition-all shadow-md"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
              >
                <Users className="w-4 h-4" />
                <span className="font-medium text-sm">{t('customers')}</span>
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
          <GlassCard delay={0.3} onClick={() => window.location.href = '/updates'} className="h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg relative"
                   style={{ backgroundColor: colors.primary }}>
                <Bell className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('info')}</h2>
            </div>
            
            {dashboardData?.updates && dashboardData.updates.length > 0 ? (
              <div className="space-y-2 overflow-y-auto max-h-[12rem]">
                {dashboardData.updates.slice(0, 5).map((update, index) => (
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
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>{t('noData')}</p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Check back later for updates</p>
                
                {/* Sample updates preview */}
                <div className="mt-4 space-y-2 w-full">
                  <div className="border-l-4 pl-3 py-2 rounded-lg opacity-50" 
                       style={{ backgroundColor: colors.surface, borderLeftColor: colors.primary }}>
                    <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Sample: Weather alerts
                    </div>
                  </div>
                  <div className="border-l-4 pl-3 py-2 rounded-lg opacity-50" 
                       style={{ backgroundColor: colors.surface, borderLeftColor: colors.primary }}>
                    <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                      Sample: Market updates
                    </div>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Leaderboard Card */}
          <div className="h-fit">
            <LeaderboardCard onClick={() => window.location.href = '/leaderboard'} />
          </div>

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
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('localTransport')}</h2>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium" style={{ color: colors.primary }}>{t('availability')}</span>
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
                  <span className="text-base font-semibold" style={{ color: colors.textPrimary }}>{t('popularRoute')}</span>
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
                    <span className="font-medium">75 {t('km')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base" style={{ color: colors.textSecondary }}>
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">2.5 {t('hours')}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>4.8 {t('rating')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                    <Truck className="w-3 h-3" />
                    <span>12 {t('vehicles')}</span>
                  </div>
                </div>
                
                <div className="rounded-lg p-3 border" style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium" style={{ color: colors.textSecondary }}>{t('startingFrom')}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold" style={{ color: colors.primary }}>₹50</span>
                      <span className="text-base" style={{ color: colors.textMuted }}>/{t('km')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '47', label: t('booking') },
                  { value: '₹3.2K', label: t('totalAmount') },
                  { value: '4.9', label: t('active'), showStar: true }
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
              🚚 {t('bookTransport')}
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
              <div className="flex-1">
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('myBids')}</h2>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${biddingStats?.activeBids > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-xs font-medium" style={{ color: biddingStats?.activeBids > 0 ? colors.primary : colors.textMuted }}>
                    {biddingStats?.activeBids || 0} {t('activeBidsCount')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl p-4 border shadow-sm mb-4"
                 style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {biddingStats?.totalBids || 0}
                  </div>
                  <div className="text-xs" style={{ color: colors.textSecondary }}>{t('totalBids')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: colors.primary }}>
                    ₹{biddingStats?.averageBidValue || 0}
                  </div>
                  <div className="text-xs" style={{ color: colors.textSecondary }}>{t('price')}</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  {t('totalAmount')}: ₹{biddingStats?.totalEarnings || 0}
                </div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>
                  {biddingStats?.completedBids || 0} {t('completed')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = '/farmer/create-bid'; }}
                className="py-2 px-3 rounded-xl font-semibold text-sm shadow-lg transition-all"
                style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
              >
                🔨 {t('createBid')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = '/farmer/my-bids'; }}
                className="py-2 px-3 rounded-xl font-semibold text-sm shadow-lg transition-all border"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }}
              >
                📊 {t('view')}
              </motion.button>
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
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('aiPlantDoctor')}</h2>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium" style={{ color: colors.primary }}>{t('available247')}</span>
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
                <div className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>{t('readyToHelp')}</div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>{t('askAboutPlantDiseasesAndCare')}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { value: aiDoctorStats?.totalConsultations || 0, label: t('consults') },
                { value: aiDoctorStats?.imagesAnalyzed || 0, label: t('images') },
                { value: 'AI', label: t('powered') }
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
                💬 {t('chat')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = '/ai-doctor'; }}
                className="py-2 px-3 rounded-xl font-semibold text-sm shadow-lg transition-all border"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }}
              >
                📸 {t('scan')}
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
              <div className="flex-1">
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('sellCrops')}</h2>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${cropStats?.availableCrops > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-xs font-medium" style={{ color: cropStats?.availableCrops > 0 ? colors.primary : colors.textMuted }}>
                    {cropStats?.availableCrops || 0} {t('available')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl p-4 border shadow-sm mb-4"
                 style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {cropStats?.totalCrops || 0}
                  </div>
                  <div className="text-xs" style={{ color: colors.textSecondary }}>{t('totalListings')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: colors.primary }}>
                    ₹{cropStats?.averagePrice || 0}
                  </div>
                  <div className="text-xs" style={{ color: colors.textSecondary }}>{t('avgPriceKg')}</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  {t('totalValue')}: ₹{cropStats?.totalValue || 0}
                </div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>
                  {cropStats?.soldCrops || 0} {t('cropsSold')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = '/farmer/sell-crops'; }}
                className="py-2 px-3 rounded-xl font-semibold text-sm shadow-lg transition-all"
                style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
              >
                🌾 {t('addCrop')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); window.location.href = '/farmer/sell-crops'; }}
                className="py-2 px-3 rounded-xl font-semibold text-sm shadow-lg transition-all border"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }}
              >
                📋 {t('manage')}
              </motion.button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;