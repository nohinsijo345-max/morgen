import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';

const LeaderboardCard = ({ onClick }) => {
  const [topFarmers, setTopFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, colors } = useTheme();

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
    return isDarkMode ? 'from-[#21262d] to-[#21262d]' : 'from-[#082829] to-[#082829]';
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
        style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
      >
        {rank}
      </div>
    );
  };

  return (
    <GlassCard delay={0.4} hoverScale={1.01} onClick={onClick}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <Trophy className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Leaderboard</h2>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Top performers</p>
          </div>
        </div>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.surface }}
        >
          <TrendingUp className="w-5 h-5" style={{ color: colors.primary }} />
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
              style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
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
              style={{ backgroundColor: colors.surface }}
            >
              {getMedalIcon(index + 1)}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate" style={{ color: colors.textPrimary }}>{farmer.name}</div>
                <div className="text-sm" style={{ color: colors.textSecondary }}>
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
          <div className="text-center py-8" style={{ color: colors.textSecondary }}>
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
        style={{ borderColor: colors.border }}
      >
        <div 
          className="text-center text-sm font-medium transition-colors"
          style={{ color: colors.textSecondary }}
        >
          Tap to view full leaderboard →
        </div>
      </motion.div>
    </GlassCard>
  );
};

export default LeaderboardCard;
