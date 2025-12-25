import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowLeft, Calendar, X, Trash2, AlertCircle, Home, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import NeumorphicThemeToggle from '../components/NeumorphicThemeToggle';
import BuyerNeumorphicThemeToggle from '../components/BuyerNeumorphicThemeToggle';
import { UserSession } from '../utils/userSession';

const Updates = () => {
  const location = useLocation();
  const isBuyerRoute = location.pathname.startsWith('/buyer');
  
  // Get the appropriate theme based on route
  const farmerTheme = useTheme();
  const buyerTheme = useBuyerTheme();
  const { isDarkMode, toggleTheme, colors } = isBuyerRoute ? buyerTheme : farmerTheme;
  
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [user, setUser] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Determine correct dashboard URL based on user type
  const getDashboardUrl = () => {
    if (isBuyerRoute) {
      return '/buyer/dashboard';
    }
    return '/dashboard';
  };

  useEffect(() => {
    // Get user based on route
    const currentUser = isBuyerRoute 
      ? UserSession.getCurrentUser('buyer')
      : UserSession.getCurrentUser('farmer');
      
    if (currentUser) {
      setUser(currentUser);
      fetchUpdates();
    } else {
      console.log('⚠️ No user session found for updates');
      setLoading(false);
    }
  }, [isBuyerRoute]);

  const fetchUpdates = async () => {
    try {
      const farmerId = UserSession.getFarmerId();
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found in session for updates');
        return;
      }
      
      console.log('✅ Fetching updates for farmerId:', farmerId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/dashboard/farmer/${farmerId}`);
      setUpdates(response.data.updates || []);
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUpdate = async (updateId, event) => {
    event.stopPropagation();
    setDeleting(updateId);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/updates/${updateId}`);
      setUpdates(updates.filter(update => update._id !== updateId));
      setSuccess('Update deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to delete update:', error);
      setError('Failed to delete update');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300"
           style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
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
              
              <motion.div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(getDashboardUrl())}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src="/src/assets/Morgen-logo-main.png" 
                  alt="Morgen Logo" 
                  className="h-10 w-auto object-contain rounded-xl"
                />
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Updates</h1>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Your notifications</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: `${colors.error}20`, border: `1px solid ${colors.error}` }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: colors.error }} />
              <span style={{ color: colors.error }}>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: `${colors.success}20`, border: `1px solid ${colors.success}` }}
            >
              <Bell className="w-5 h-5" style={{ color: colors.success }} />
              <span style={{ color: colors.success }}>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Updates List */}
        {updates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-3xl border"
            style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}
          >
            <Bell className="w-20 h-20 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>No Updates Yet</h3>
            <p style={{ color: colors.textSecondary }}>You'll see notifications here when there are updates</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, index) => (
              <motion.div
                key={update._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setSelectedUpdate(update)}
                className="rounded-2xl p-5 border cursor-pointer transition-all shadow-lg group"
                style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                         style={{ backgroundColor: colors.primary }}>
                      <Bell className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1" style={{ color: colors.textPrimary }}>
                        {update.title}
                      </h3>
                      <p className="text-sm line-clamp-2 mb-2" style={{ color: colors.textSecondary }}>
                        {update.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
                        <Calendar className="w-3 h-3" />
                        {new Date(update.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDeleteUpdate(update._id, e)}
                    disabled={deleting === update._id}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
                  >
                    {deleting === update._id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 rounded-full"
                        style={{ borderColor: `${colors.error}30`, borderTopColor: colors.error }}
                      />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Update Detail Modal */}
      <AnimatePresence>
        {selectedUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSelectedUpdate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl p-6 max-w-lg w-full shadow-2xl border"
              style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ backgroundColor: colors.primary }}>
                    <Bell className="w-5 h-5" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                    {selectedUpdate.title}
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedUpdate(null)}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <p className="mb-4 leading-relaxed" style={{ color: colors.textSecondary }}>
                {selectedUpdate.message}
              </p>
              
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                <Calendar className="w-4 h-4" />
                {new Date(selectedUpdate.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Updates;