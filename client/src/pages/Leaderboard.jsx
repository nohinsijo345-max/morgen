import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ArrowLeft, Award, TrendingUp, Star, 
  Crown, Medal, Sparkles, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import NeumorphicThemeToggle from '../components/NeumorphicThemeToggle';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/leaderboard/top?limit=20`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
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
                onClick={() => navigate('/dashboard')}
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
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Top performing farmers</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NeumorphicThemeToggle size="sm" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="p-2.5 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
              >
                <Home className="w-5 h-5" />
              </motion.button>

              <div className="rounded-xl px-4 py-2 shadow-lg"
                   style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}>
                <div className="text-xs opacity-80">Total Farmers</div>
                <div className="text-lg font-bold">{leaderboard.length}</div>
              </div>
            </div>
          </div>
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
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                    <div className="text-2xl font-bold" style={{ color: colors.primary }}>{leaderboard[1].totalSales}</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>Sales</div>
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
                  <div className="mt-3 pt-3 border-t border-yellow-400/20">
                    <div className="text-3xl font-bold text-yellow-600">{leaderboard[0].totalSales}</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>Sales</div>
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
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                    <div className="text-2xl font-bold" style={{ color: colors.primary }}>{leaderboard[2].totalSales}</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>Sales</div>
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
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: colors.primary }}>
                  <span className="font-bold" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }}>{index + 4}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: colors.textPrimary }}>{farmer.name}</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{farmer._id}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: colors.primary }}>{farmer.totalSales}</div>
                  <div className="text-xs" style={{ color: colors.textMuted }}>Sales</div>
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