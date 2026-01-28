import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ArrowLeft, Award, TrendingUp, Star, 
  Crown, Medal, Sparkles, Home, Zap, Activity,
  RefreshCw, Filter, Calendar, MapPin
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import NeumorphicThemeToggle from '../components/NeumorphicThemeToggle';
import BuyerNeumorphicThemeToggle from '../components/BuyerNeumorphicThemeToggle';

const Leaderboard = () => {
  const location = useLocation();
  const isBuyerRoute = location.pathname.startsWith('/buyer');
  
  // Get the appropriate theme based on route
  const farmerTheme = useTheme();
  const buyerTheme = useBuyerTheme();
  const { isDarkMode, toggleTheme, colors } = isBuyerRoute ? buyerTheme : farmerTheme;
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, top10
  const navigate = useNavigate();

  // Determine correct dashboard URL based on user type
  const getDashboardUrl = () => {
    if (isBuyerRoute) {
      return '/buyer/dashboard';
    }
    return '/dashboard';
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const fetchLeaderboard = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/leaderboard/top?limit=50${forceRefresh ? '&refresh=true' : ''}`);
      
      if (response.data.success) {
        let farmers = response.data.data || [];
        
        // Apply filters
        if (filter === 'active') {
          farmers = farmers.filter(f => f.isActive);
        } else if (filter === 'top10') {
          farmers = farmers.slice(0, 10);
        }
        
        setLeaderboard(farmers);
        setLastUpdated(new Date(response.data.meta?.lastUpdated));
      } else {
        // Fallback for old API format
        setLeaderboard(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/leaderboard/stats`);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard(true);
    fetchStats();
  };

  const getMedalGradient = (rank) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-300 via-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-400 via-orange-500 to-orange-600';
    return '';
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-white" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-white" />;
    if (rank === 3) return <Award className="w-6 h-6 text-white" />;
    return <span className="text-white font-bold text-lg">{rank}</span>;
  };

  const getPerformanceIcon = (score) => {
    if (score >= 500) return <Zap className="w-5 h-5 text-yellow-500" />;
    if (score >= 200) return <Star className="w-5 h-5 text-blue-500" />;
    return <Activity className="w-5 h-5 text-green-500" />;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300"
           style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300"
         style={{ backgroundColor: colors.background }}>
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
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(getDashboardUrl())}
                className="p-2 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: colors.primary }}>
                  <Trophy className="w-5 h-5" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Leaderboard</h1>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {stats ? `${stats.activeFarmers} active farmers` : 'Top performing farmers'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                {['all', 'active', 'top10'].map((filterType) => (
                  <motion.button
                    key={filterType}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter === filterType ? 'shadow-lg' : ''
                    }`}
                    style={{
                      backgroundColor: filter === filterType ? colors.primary : colors.surface,
                      color: filter === filterType 
                        ? (isDarkMode ? '#0d1117' : '#ffffff')
                        : colors.textSecondary
                    }}
                  >
                    {filterType === 'all' ? 'All' : filterType === 'active' ? 'Active' : 'Top 10'}
                  </motion.button>
                ))}
              </div>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              {isBuyerRoute ? (
                <BuyerNeumorphicThemeToggle size="sm" />
              ) : (
                <NeumorphicThemeToggle size="sm" />
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(getDashboardUrl())}
                className="p-2.5 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
              >
                <Home className="w-5 h-5" />
              </motion.button>

              {/* Stats Summary */}
              {stats && (
                <div className="rounded-xl px-4 py-2 shadow-lg"
                     style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}>
                  <div className="text-xs opacity-80">Total Revenue</div>
                  <div className="text-lg font-bold">₹{formatNumber(stats.totalRevenue)}</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Last Updated Info */}
          {lastUpdated && (
            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
              <Calendar className="w-3 h-3" />
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
            </div>
          )}
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center pt-12"
              >
                <div className="relative">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-2xl mb-4">
                    <Medal className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-gray-600">2</span>
                  </div>
                </div>
                <div className="text-center mt-4 rounded-2xl p-4 w-full border"
                     style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
                  <h3 className="font-bold text-lg truncate" style={{ color: colors.textPrimary }}>{leaderboard[1].name}</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{leaderboard[1]._id}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {getPerformanceIcon(leaderboard[1].performanceScore)}
                    <span className="text-xs" style={{ color: colors.textMuted }}>Performance</span>
                  </div>
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                    <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                      {leaderboard[1].performanceScore || leaderboard[1].totalSales}
                    </div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>
                      {leaderboard[1].performanceScore ? 'Score' : 'Sales'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-2xl mb-4">
                    <Crown className="w-18 h-18 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-2xl font-bold text-yellow-600">1</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2"
                  >
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                  </motion.div>
                </motion.div>
                <div className="text-center mt-4 rounded-2xl p-5 w-full border-2 border-yellow-400/30 shadow-xl"
                     style={{ backgroundColor: isDarkMode ? colors.backgroundCard : '#fffbeb' }}>
                  <div className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full mb-2">
                    CHAMPION
                  </div>
                  <h3 className="font-bold text-xl truncate" style={{ color: colors.textPrimary }}>{leaderboard[0].name}</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{leaderboard[0]._id}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {getPerformanceIcon(leaderboard[0].performanceScore)}
                    <span className="text-xs" style={{ color: colors.textMuted }}>Elite Performer</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-yellow-400/20">
                    <div className="text-3xl font-bold text-yellow-600">
                      {leaderboard[0].performanceScore || leaderboard[0].totalSales}
                    </div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>
                      {leaderboard[0].performanceScore ? 'Score' : 'Sales'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center pt-12"
              >
                <div className="relative">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-2xl mb-4">
                    <Award className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-orange-600">3</span>
                  </div>
                </div>
                <div className="text-center mt-4 rounded-2xl p-4 w-full border"
                     style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
                  <h3 className="font-bold text-lg truncate" style={{ color: colors.textPrimary }}>{leaderboard[2].name}</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{leaderboard[2]._id}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {getPerformanceIcon(leaderboard[2].performanceScore)}
                    <span className="text-xs" style={{ color: colors.textMuted }}>Performance</span>
                  </div>
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                    <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                      {leaderboard[2].performanceScore || leaderboard[2].totalSales}
                    </div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>
                      {leaderboard[2].performanceScore ? 'Score' : 'Sales'}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Rest of Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl border shadow-xl overflow-hidden"
          style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}
        >
          <div className="p-4 border-b" style={{ borderColor: colors.border }}>
            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>All Rankings</h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Showing {leaderboard.length} farmers • Updated in real-time
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {leaderboard.slice(3).map((farmer, index) => (
              <motion.div
                key={farmer._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                whileHover={{ backgroundColor: colors.surfaceHover }}
                className="p-4 flex items-center gap-4 transition-colors cursor-pointer"
                onClick={() => setSelectedFarmer(farmer)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: colors.primary }}>
                  <span className="font-bold" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }}>
                    {farmer.rank || index + 4}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold" style={{ color: colors.textPrimary }}>{farmer.name}</h3>
                    {farmer.performanceScore && getPerformanceIcon(farmer.performanceScore)}
                    {farmer.isActive && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                    <span>{farmer._id}</span>
                    {farmer.state && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{farmer.state}</span>
                        </div>
                      </>
                    )}
                    {farmer.avgRating > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{farmer.avgRating.toFixed(1)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: colors.primary }}>
                    {farmer.performanceScore || farmer.totalSales || 0}
                  </div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>
                    {farmer.performanceScore ? 'Score' : 'Sales'}
                  </div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>
                    ₹{formatNumber(farmer.totalRevenue || 0)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;