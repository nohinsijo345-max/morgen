import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award, Star, Zap, Activity } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import GlassCard from './GlassCard';
import BuyerGlassCard from './BuyerGlassCard';

const LeaderboardCard = ({ onClick, useBuyerTheme: shouldUseBuyerTheme = false }) => {
  const [topFarmers, setTopFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState(null);
  const { isDarkMode, colors } = useTheme();
  const buyerTheme = useBuyerTheme();

  // Use buyer theme if specified, otherwise use regular theme
  const currentTheme = shouldUseBuyerTheme ? buyerTheme : { isDarkMode, colors };
  const GlassComponent = shouldUseBuyerTheme ? BuyerGlassCard : GlassCard;

  useEffect(() => {
    fetchTopFarmers();
    fetchStats();
    
    // Set up real-time updates via polling (since WebSocket setup is complex)
    const interval = setInterval(fetchTopFarmers, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const fetchTopFarmers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/leaderboard/top?limit=1`);
      
      if (response.data.success) {
        setTopFarmers(response.data.data || []);
        setLastUpdated(new Date(response.data.meta?.lastUpdated));
      } else {
        // Fallback for old API format
        setTopFarmers(response.data.slice(0, 1));
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
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

  const getMedalColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-300 via-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-400 via-orange-500 to-orange-600';
    return currentTheme.isDarkMode ? 'from-[#21262d] to-[#21262d]' : 'from-[#082829] to-[#082829]';
  };

  const getMedalIcon = (rank) => {
    if (rank <= 3) {
      return (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMedalColor(rank)} flex items-center justify-center shadow-lg`}>
          <Award className="w-5 h-5 text-white" />
        </div>
      );
    }
    return (
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
        style={{ backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.textPrimary }}
      >
        {rank}
      </div>
    );
  };

  const getPerformanceIcon = (score) => {
    if (score >= 500) return <Zap className="w-4 h-4 text-yellow-500" />;
    if (score >= 200) return <Star className="w-4 h-4 text-blue-500" />;
    return <Activity className="w-4 h-4 text-green-500" />;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <GlassComponent delay={0.4} hoverScale={1.01} onClick={onClick} className="h-fit">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: currentTheme.colors.primary }}
        >
          <Trophy className="w-6 h-6" style={{ color: currentTheme.isDarkMode ? '#0d1117' : '#ffffff' }} />
        </div>
        <h2 className="text-xl font-bold" style={{ color: currentTheme.colors.textPrimary }}>Leaderboard</h2>
      </div>
      
      {/* Top Farmer - Compact */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 rounded-full"
            style={{ borderColor: `${currentTheme.colors.primary}30`, borderTopColor: currentTheme.colors.primary }}
          />
        </div>
      ) : topFarmers.length > 0 ? (
        <div className="space-y-2 overflow-y-auto max-h-[12rem] mb-4">
          <motion.div 
            key={topFarmers[0]._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="border-l-4 pl-3 py-2 rounded-lg transition-all shadow-sm"
            style={{ 
              backgroundColor: currentTheme.colors.surface, 
              borderLeftColor: currentTheme.colors.primary 
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold line-clamp-1" style={{ color: currentTheme.colors.textPrimary }}>
                  {topFarmers[0].name}
                </div>
                <div className="text-xs mt-1 flex items-center gap-2" style={{ color: currentTheme.colors.textSecondary }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.colors.textMuted }} />
                  #{topFarmers[0].rank || 1} • {topFarmers[0].farmerId}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: currentTheme.colors.primary }}>
                  {(topFarmers[0].totalSales || 0) + (topFarmers[0].wonBids || 0)}
                </div>
                <div className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Deals</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: currentTheme.colors.primary }}>
                  ₹{formatNumber(topFarmers[0].totalRevenue || 0)}
                </div>
                <div className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: currentTheme.colors.primary }}>
                  {topFarmers[0].performanceScore || topFarmers[0].totalSales || 0}
                </div>
                <div className="text-xs" style={{ color: currentTheme.colors.textMuted }}>Score</div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-6">
          <Trophy className="w-10 h-10 mb-3 opacity-30" style={{ color: currentTheme.colors.textMuted }} />
          <p className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>No performance data yet</p>
          <p className="text-xs mt-1" style={{ color: currentTheme.colors.textMuted }}>Complete sales or bids to appear</p>
          
          {/* Sample preview */}
          <div className="mt-4 space-y-2 w-full">
            <div className="border-l-4 pl-3 py-2 rounded-lg opacity-50" 
                 style={{ backgroundColor: currentTheme.colors.surface, borderLeftColor: currentTheme.colors.primary }}>
              <div className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                Sample: Top farmer ranking
              </div>
            </div>
            <div className="border-l-4 pl-3 py-2 rounded-lg opacity-50" 
                 style={{ backgroundColor: currentTheme.colors.surface, borderLeftColor: currentTheme.colors.primary }}>
              <div className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                Sample: Performance metrics
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Footer */}
      <div className="pt-3 border-t" style={{ borderColor: currentTheme.colors.border }}>
        <div className="text-center">
          <p className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>
            {stats ? `${stats.activeFarmers - 1} more farmers competing` : 'View full rankings'}
          </p>
          <p className="text-xs mt-1" style={{ color: currentTheme.colors.textMuted }}>
            Tap to view all →
          </p>
        </div>
      </div>
    </GlassComponent>
  );
};

export default LeaderboardCard;