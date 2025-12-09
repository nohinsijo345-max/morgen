import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import axios from 'axios';

const LeaderboardCard = ({ onClick }) => {
  const [topFarmers, setTopFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return 'from-[#082829] to-[#082829]';
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
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-[#082829]/10 text-[#082829]">
        {rank}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.01, y: -5 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl p-6 border border-green-200/20 shadow-2xl cursor-pointer relative overflow-hidden group"
    >
      {/* Animated shine effect */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#082829] to-[#0a3a3c] rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-[#fbfbef]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#082829]">Leaderboard</h2>
            <p className="text-[#082829]/60 text-xs">Top performers</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#082829]/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#082829]" />
        </div>
      </div>
      
      {/* Top Farmers List */}
      <div className="space-y-3 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-[#082829]/20 border-t-[#082829] rounded-full"
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
              className="flex items-center gap-4 p-3 rounded-xl transition-all bg-[#cce0cc] shadow-md"
            >
              {getMedalIcon(index + 1)}
              <div className="flex-1 min-w-0">
                <div className="text-[#082829] font-semibold truncate">{farmer.name}</div>
                <div className="text-[#082829]/70 text-sm">
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
          <div className="text-center py-8 text-[#082829]/60">
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
        className="mt-4 pt-4 border-t border-[#082829]/10 relative z-10"
      >
        <div className="text-center text-[#082829]/70 text-sm font-medium group-hover:text-[#082829] transition-colors">
          Tap to view full leaderboard →
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeaderboardCard;
