import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Calendar, Plus } from 'lucide-react';
import axios from 'axios';
import { UserSession } from '../utils/userSession';
import { useTheme } from '../context/ThemeContext';

const HarvestCountdownCard = ({ onClick }) => {
  const [countdowns, setCountdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchCountdowns();
    // Update every 30 seconds for real-time countdown
    const interval = setInterval(fetchCountdowns, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCountdowns = async () => {
    try {
      const farmerId = UserSession.getFarmerId();
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found in session for harvest countdowns');
        return;
      }
      
      console.log('✅ Fetching harvest countdowns for farmerId:', farmerId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/api/harvest/countdowns/${farmerId}?t=${timestamp}`);
      setCountdowns(response.data);
      console.log('Harvest countdowns refreshed:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch countdowns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (daysLeft) => {
    if (daysLeft <= 3) return 'from-red-500 to-orange-500';
    if (daysLeft <= 7) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const formatDays = (days) => {
    if (days === 0) return 'Today!';
    if (days === 1) return '1 Day';
    return `${days} Days`;
  };

  const mostRecentCountdown = countdowns.length > 0 ? countdowns[0] : null;
  
  // Fixed empty state colors based on theme
  const bgGradient = mostRecentCountdown 
    ? getStatusColor(mostRecentCountdown.daysLeft)
    : isDarkMode 
      ? 'from-transparent to-transparent' // Transparent on dark theme
      : 'from-white to-white'; // White on light theme

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${bgGradient} rounded-3xl p-3 shadow-2xl cursor-pointer relative overflow-hidden group h-full flex flex-col ${
        !mostRecentCountdown ? (isDarkMode ? 'border border-gray-700' : 'border border-gray-200') : ''
      }`}
    >
      {/* Edge Glass Reflection */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatDelay: 4,
          ease: "easeInOut" 
        }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: mostRecentCountdown 
            ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
            : isDarkMode 
              ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(8,40,41,0.2) 50%, transparent 100%)',
          transform: 'skewX(-20deg)',
          zIndex: 1
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className={`w-8 h-8 ${mostRecentCountdown ? 'bg-white/20' : (isDarkMode ? 'bg-[#14452f]' : 'bg-[#082829]')} rounded-lg flex items-center justify-center shadow-lg`}>
            <Timer className={`w-4 h-4 ${mostRecentCountdown ? 'text-white' : (isDarkMode ? 'text-[#e1e2d0]' : 'text-[#e1e2d0]')}`} />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${mostRecentCountdown ? 'text-white' : (isDarkMode ? 'text-gray-300' : 'text-[#082829]')}`}>Harvest Countdown</h2>
            <p className={`${mostRecentCountdown ? 'text-white/80' : (isDarkMode ? 'text-gray-400' : 'text-[#082829]/60')} text-[10px]`}>Track your crops</p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full ${mostRecentCountdown ? 'bg-white/20' : (isDarkMode ? 'bg-gray-700' : 'bg-[#082829]/10')} flex items-center justify-center`}>
          <Calendar className={`w-3 h-3 ${mostRecentCountdown ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-[#082829]')}`} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1 relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`w-8 h-8 border-2 ${mostRecentCountdown ? 'border-white/20 border-t-white' : (isDarkMode ? 'border-gray-600 border-t-gray-400' : 'border-[#082829]/20 border-t-[#082829]')} rounded-full`}
          />
        </div>
      ) : mostRecentCountdown ? (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-1">{mostRecentCountdown.daysLeft}</div>
            <div className="text-white/90 text-base font-semibold mb-1">Days to Harvest</div>
            <div className="text-white/80 text-sm font-medium">{mostRecentCountdown.cropName}</div>
          </div>
        </div>
      ) : (
        <div className="text-center flex-1 flex flex-col items-center justify-center relative z-10">
          <div className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-[#082829]/10'} rounded-full flex items-center justify-center`}>
            <Plus className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-[#082829]/40'}`} />
          </div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#082829]/60'} mb-1 font-medium text-sm`}>No active countdowns</p>
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-[#082829]/40'} text-xs`}>Tap to set your first harvest</p>
        </div>
      )}
    </motion.div>
  );
};

export default HarvestCountdownCard;
