import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import GlassCard from './GlassCard';
import BuyerGlassCard from './BuyerGlassCard';

const LeaderboardCard = ({ onClick, useBuyerTheme: shouldUseBuyerTheme = false }) => {
  const [topFarmers, setTopFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, colors } = useTheme();
  const buyerTheme = useBuyerTheme();

  // Use buyer theme if specified, otherwise use regular theme
  const currentTheme = shouldUseBuyerTheme ? buyerTheme : { isDarkMode, colors };
  const GlassComponent = shouldUseBuyerTheme ? BuyerGlassCard : GlassCard;

  useEffect(() => {
    fetchTopFarmers();
  }, []);

  const fetchTopFarmers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/leaderboard/top`);
      setTopFarmers(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
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

  return (
    <GlassComponent delay={0.4} hoverScale={1.01} onClick={onClick}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            <Trophy className="w-6 h-6" style={{ color: currentTheme.isDarkMode ? '#0d1117' : '#ffffff' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: currentTheme.colors.textPrimary }}>Leaderboard</h2>
            <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>Top performers</p>
          </div>
        </div>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          <TrendingUp className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
        </div>
      </div>
      
      {/* Top Farmers List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 rounded-full"
              style={{ borderColor: `${currentTheme.colors.primary}30`, borderTopColor: currentTheme.colors.primary }}
            />
          </div>
        ) : topFarmers.length > 0 ? (
          topFarmers.map((farmer, index) => (
            <motion.div 
              key={farmer._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ x: 10, scale: 1.02 }}
              className="flex items-center gap-4 p-3 rounded-xl transition-all shadow-md"
              style={{ backgroundColor: currentTheme.colors.surface }}
            >
              {getMedalIcon(index + 1)}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate" style={{ color: currentTheme.colors.textPrimary }}>{farmer.name}</div>
                <div className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  {farmer.totalSales} sales • ₹{farmer.totalRevenue?.toLocaleString() || '0'}
                </div>
              </div>
              {index === 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-yellow-500"
                >
                  <Trophy className="w-5 h-5" />
                </motion.div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8" style={{ color: currentTheme.colors.textSecondary }}>
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No sales data yet</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 pt-4 border-t"
        style={{ borderColor: currentTheme.colors.border }}
      >
        <div 
          className="text-center text-sm font-medium transition-colors"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Tap to view full leaderboard →
        </div>
      </motion.div>
    </GlassComponent>
  );
};

export default LeaderboardCard;
