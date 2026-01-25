import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Timer, Plus, Edit2, Trash2, Calendar,
  Sprout, Package, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { UserSession } from '../../utils/userSession';
import { useTheme } from '../../context/ThemeContext';
import NeumorphicThemeToggle from '../../components/NeumorphicThemeToggle';
import { useTranslation } from '../../hooks/useTranslation';

const HarvestCountdown = () => {
  const { t } = useTranslation();
  const [countdowns, setCountdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState(null);
  const [presetCrops, setPresetCrops] = useState([]);
  const [formData, setFormData] = useState({
    cropName: '',
    category: 'vegetables',
    quantity: '',
    unit: 'kg',
    plantedDate: '',
    harvestDate: ''
  });
  
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    fetchCountdowns();
    fetchPresetCrops();
    // Update every 30 seconds for real-time countdown
    const interval = setInterval(fetchCountdowns, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPresetCrops = async () => {
    try {
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId;
      
      console.log('🔧 Session user:', userData);
      console.log('🔧 Extracted farmerId:', farmerId);
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found in session for preset crops');
        setPresetCrops([]);
        return;
      }
      
      console.log('✅ Fetching preset crops for farmerId:', farmerId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // First try to get crops from user profile
      const profileResponse = await axios.get(`${API_URL}/api/auth/profile/${farmerId}`);
      const userCropTypes = profileResponse.data?.cropTypes || [];
      
      console.log('✅ User crop types from profile:', userCropTypes);
      setPresetCrops(userCropTypes);
      
    } catch (error) {
      console.error('Failed to fetch preset crops:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      setPresetCrops([]);
    }
  };

  const fetchCountdowns = async () => {
    try {
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId;
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found in session for harvest countdowns');
        return;
      }
      
      console.log('✅ Fetching harvest countdowns for farmerId:', farmerId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/harvest/countdowns/${farmerId}`);
      setCountdowns(response.data);
    } catch (error) {
      console.error('Failed to fetch countdowns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId;
      const farmerName = userData?.name;
      
      if (!farmerId) {
        alert('No user session found. Please login again.');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

      if (editingCountdown) {
        // Update existing
        await axios.put(`${API_URL}/api/harvest/countdowns/${editingCountdown._id}`, formData);
      } else {
        // Create new
        await axios.post(`${API_URL}/api/harvest/countdowns`, {
          ...formData,
          farmerId,
          farmerName
        });
      }

      setShowModal(false);
      setEditingCountdown(null);
      resetForm();
      fetchCountdowns();
    } catch (error) {
      console.error('Failed to save countdown:', error);
      alert(error.response?.data?.error || 'Failed to save countdown');
    }
  };

  const handleDelete = async (countdownId) => {
    if (!confirm('Are you sure you want to delete this countdown?')) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/harvest/countdowns/${countdownId}`);
      fetchCountdowns();
    } catch (error) {
      console.error('Failed to delete countdown:', error);
      alert('Failed to delete countdown');
    }
  };

  const handleEdit = (countdown) => {
    setEditingCountdown(countdown);
    setFormData({
      cropName: countdown.cropName,
      category: countdown.category,
      quantity: countdown.quantity,
      unit: countdown.unit,
      plantedDate: countdown.plantedDate ? new Date(countdown.plantedDate).toISOString().split('T')[0] : '',
      harvestDate: new Date(countdown.harvestDate).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      cropName: '',
      category: 'vegetables',
      quantity: '',
      unit: 'kg',
      plantedDate: '',
      harvestDate: ''
    });
  };

  const getStatusColor = (daysLeft) => {
    if (daysLeft <= 3) return 'from-red-500 to-orange-500';
    if (daysLeft <= 7) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStatusIcon = (daysLeft) => {
    if (daysLeft <= 3) return <AlertCircle className="w-5 h-5" />;
    if (daysLeft <= 7) return <Clock className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
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

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: colors.primary }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: colors.primary }}
        />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="w-12 h-12 backdrop-blur-xl rounded-2xl border flex items-center justify-center shadow-lg transition-all"
              style={{ 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.textPrimary
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3" style={{ color: colors.textPrimary }}>
                <Timer className="w-10 h-10" style={{ color: colors.primary }} />
                {t('harvestCountdown')}
              </h1>
              <p className="mt-1" style={{ color: colors.textSecondary }}>{t('manageHarvestSchedules')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <NeumorphicThemeToggle size="sm" />
            
            {countdowns.length < 3 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setEditingCountdown(null); resetForm(); setShowModal(true); }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-xl transition-all font-semibold"
                style={{ 
                  backgroundColor: colors.primary, 
                  color: isDarkMode ? '#0d1117' : '#ffffff' 
                }}
              >
                <Plus className="w-5 h-5" />
                <span>New Countdown</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Countdowns Grid */}
        {countdowns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countdowns.map((countdown, index) => (
              <motion.div
                key={countdown._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-xl rounded-3xl p-6 border shadow-2xl relative overflow-hidden group"
                style={{ 
                  backgroundColor: colors.backgroundCard, 
                  borderColor: colors.cardBorder 
                }}
              >
                {/* Edge Glass Reflection */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatDelay: 5 + index,
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${colors.primary}20 50%, transparent 100%)`,
                    transform: 'skewX(-20deg)',
                    zIndex: 1
                  }}
                />

                {/* Status indicator */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getStatusColor(countdown.daysLeft)} opacity-10 rounded-full blur-2xl`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getStatusColor(countdown.daysLeft)} flex items-center justify-center shadow-lg text-white`}>
                        {getStatusIcon(countdown.daysLeft)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{countdown.cropName}</h3>
                        <p className="text-sm capitalize" style={{ color: colors.textSecondary }}>{countdown.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Display with Circular Progress */}
                  <div className="text-center my-6">
                    <div className="relative inline-block">
                      {/* Circular Progress Ring */}
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background Circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke={isDarkMode ? colors.surface : colors.border}
                          strokeWidth="8"
                        />
                        {/* Progress Circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke={`url(#gradient-${countdown._id})`}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${Math.max(0, Math.min(100, (countdown.daysLeft / countdown.totalDays) * 314))} 314`}
                          className="transition-all duration-1000 ease-out"
                        />
                        {/* Gradient Definition */}
                        <defs>
                          <linearGradient id={`gradient-${countdown._id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={countdown.daysLeft <= 3 ? '#ef4444' : countdown.daysLeft <= 7 ? '#f59e0b' : '#10b981'} />
                            <stop offset="100%" stopColor={countdown.daysLeft <= 3 ? '#f97316' : countdown.daysLeft <= 7 ? '#f97316' : '#059669'} />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          key={countdown.daysLeft}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          className="text-4xl font-bold" 
                          style={{ color: colors.textPrimary }}
                        >
                          {countdown.daysLeft}
                        </motion.div>
                        <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                          Days Left
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between rounded-xl p-3"
                         style={{ backgroundColor: colors.surface }}>
                      <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Quantity</span>
                      </div>
                      <span className="font-semibold" style={{ color: colors.textPrimary }}>
                        {countdown.quantity} {countdown.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl p-3"
                         style={{ backgroundColor: colors.surface }}>
                      <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Harvest Date</span>
                      </div>
                      <span className="font-semibold" style={{ color: colors.textPrimary }}>
                        {new Date(countdown.harvestDate).toLocaleDateString()}
                      </span>
                    </div>
                    {countdown.plantedDate && (
                      <div className="flex items-center justify-between rounded-xl p-3"
                           style={{ backgroundColor: colors.surface }}>
                        <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
                          <Sprout className="w-4 h-4" />
                          <span className="text-sm">Planted</span>
                        </div>
                        <span className="font-semibold" style={{ color: colors.textPrimary }}>
                          {new Date(countdown.plantedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(countdown)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-colors"
                      style={{ 
                        backgroundColor: colors.primary, 
                        color: isDarkMode ? '#0d1117' : '#ffffff' 
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(countdown._id)}
                      className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: colors.surface }}>
              <Timer className="w-16 h-16" style={{ color: colors.textMuted }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>No Active Countdowns</h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>Start tracking your harvest schedules</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setEditingCountdown(null); resetForm(); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl shadow-xl transition-all font-semibold"
              style={{ 
                backgroundColor: colors.primary, 
                color: isDarkMode ? '#0d1117' : '#ffffff' 
              }}
            >
              <Plus className="w-5 h-5" />
              Create Your First Countdown
            </motion.button>
          </motion.div>
        )}
      </div>


      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowModal(false); setEditingCountdown(null); }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: colors.backgroundCard }}
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                {editingCountdown ? t('editCountdown') : t('newHarvestCountdown')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Crop Selection - Only from preset crops */}
                <div>
                  <label className="block font-semibold mb-2 flex items-center justify-between"
                         style={{ color: colors.textPrimary }}>
                    <span>{t('selectCrop')} *</span>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Manually refreshing crops...');
                        fetchPresetCrops();
                      }}
                      className="text-xs underline"
                      style={{ color: colors.textSecondary }}
                    >
                      Refresh Crops
                    </button>
                  </label>
                  <select
                    required
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors"
                    style={{ 
                      backgroundColor: colors.surface, 
                      borderColor: colors.border, 
                      color: colors.textPrimary 
                    }}
                  >
                    <option value="">Choose from your registered crops</option>
                    {presetCrops.length > 0 ? (
                      presetCrops.map((crop, index) => (
                        <option key={index} value={crop}>{crop}</option>
                      ))
                    ) : (
                      <option value="" disabled>No crops registered. Please update your profile.</option>
                    )}
                  </select>
                  {presetCrops.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">
                      {t('pleaseAddCropsFirst')} 
                      <button
                        type="button"
                        onClick={() => window.location.href = '/account'}
                        className="ml-1 underline hover:text-red-700"
                      >
                        {t('goToAccountCentre')}
                      </button>
                    </p>
                  )}
                </div>

                {/* Quantity & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#082829] font-semibold mb-2">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#082829]/20 focus:border-[#082829] outline-none transition-colors"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-[#082829] font-semibold mb-2">Unit *</label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#082829]/20 focus:border-[#082829] outline-none transition-colors"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="quintal">Quintal</option>
                      <option value="ton">Ton</option>
                      <option value="piece">Pieces</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#082829] font-semibold mb-2">Planted Date</label>
                    <input
                      type="date"
                      value={formData.plantedDate}
                      onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#082829]/20 focus:border-[#082829] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#082829] font-semibold mb-2">Harvest Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.harvestDate}
                      onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#082829]/20 focus:border-[#082829] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingCountdown(null); }}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-[#082829]/20 text-[#082829] font-semibold hover:bg-[#082829]/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#082829] to-[#0a3a3c] text-white font-semibold hover:shadow-xl transition-all"
                  >
                    {editingCountdown ? t('updateCountdown') : t('createCountdown')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HarvestCountdown;
