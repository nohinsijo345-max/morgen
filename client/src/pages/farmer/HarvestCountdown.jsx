import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Timer, Plus, Edit2, Trash2, Calendar,
  Sprout, Package, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const HarvestCountdown = () => {
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

  useEffect(() => {
    fetchCountdowns();
    fetchPresetCrops();
    const interval = setInterval(fetchCountdowns, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPresetCrops = async () => {
    try {
      const farmerUser = localStorage.getItem('farmerUser');
      console.log('farmerUser from localStorage:', farmerUser);
      if (farmerUser) {
        const userData = JSON.parse(farmerUser);
        console.log('Parsed userData:', userData);
        console.log('farmerId:', userData.farmerId);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        const url = `${API_URL}/api/harvest/crop-preferences/${userData.farmerId}`;
        console.log('Fetching crops from:', url);
        const response = await axios.get(url);
        console.log('Fetched preset crops response:', response.data);
        console.log('Crops array length:', response.data?.length);
        setPresetCrops(response.data || []);
      } else {
        console.log('No farmerUser in localStorage');
      }
    } catch (error) {
      console.error('Failed to fetch preset crops:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      setPresetCrops([]);
    }
  };

  const fetchCountdowns = async () => {
    try {
      const farmerUser = localStorage.getItem('farmerUser');
      if (farmerUser) {
        const userData = JSON.parse(farmerUser);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        const response = await axios.get(`${API_URL}/api/harvest/countdowns/${userData.farmerId}`);
        setCountdowns(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch countdowns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const farmerUser = localStorage.getItem('farmerUser');
      if (!farmerUser) return;

      const userData = JSON.parse(farmerUser);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

      if (editingCountdown) {
        // Update existing
        await axios.put(`${API_URL}/api/harvest/countdowns/${editingCountdown._id}`, formData);
      } else {
        // Create new
        await axios.post(`${API_URL}/api/harvest/countdowns`, {
          ...formData,
          farmerId: userData.farmerId,
          farmerName: userData.name
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
      <div className="min-h-screen bg-[#e1e2d0] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#082829]/20 border-t-[#082829] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e1e2d0] relative overflow-hidden">

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#082829] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#082829] rounded-full blur-3xl"
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
              className="w-12 h-12 bg-white/40 backdrop-blur-xl rounded-2xl border border-[#082829]/20 flex items-center justify-center shadow-lg hover:bg-white/60 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#082829]" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold text-[#082829] flex items-center gap-3">
                <Timer className="w-10 h-10 text-[#082829]" />
                Harvest Countdown
              </h1>
              <p className="text-[#082829]/60 mt-1">Manage your crop harvest schedules</p>
            </div>
          </div>
          
          {countdowns.length < 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setEditingCountdown(null); resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#082829] to-[#0a3a3c] text-white px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">New Countdown</span>
            </motion.button>
          )}
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
                className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-[#082829]/20 shadow-2xl relative overflow-hidden group"
              >
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
                        <h3 className="text-xl font-bold text-[#082829]">{countdown.cropName}</h3>
                        <p className="text-[#082829]/60 text-sm capitalize">{countdown.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Display */}
                  <div className="text-center my-6">
                    <motion.div
                      key={countdown.daysLeft}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className={`inline-block bg-gradient-to-r ${getStatusColor(countdown.daysLeft)} rounded-2xl px-8 py-6 shadow-xl`}
                    >
                      <div className="text-6xl font-bold text-white mb-1">{countdown.daysLeft}</div>
                      <div className="text-white/90 text-sm font-medium">Days to Harvest</div>
                    </motion.div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between bg-white/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-[#082829]/70">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Quantity</span>
                      </div>
                      <span className="text-[#082829] font-semibold">{countdown.quantity} {countdown.unit}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-[#082829]/70">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Harvest Date</span>
                      </div>
                      <span className="text-[#082829] font-semibold">
                        {new Date(countdown.harvestDate).toLocaleDateString()}
                      </span>
                    </div>
                    {countdown.plantedDate && (
                      <div className="flex items-center justify-between bg-white/30 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-[#082829]/70">
                          <Sprout className="w-4 h-4" />
                          <span className="text-sm">Planted</span>
                        </div>
                        <span className="text-[#082829] font-semibold">
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
                      className="flex-1 flex items-center justify-center gap-2 bg-[#082829] text-white py-2 rounded-xl font-medium hover:bg-[#0a3a3c] transition-colors"
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
            <div className="w-32 h-32 mx-auto mb-6 bg-[#082829]/10 rounded-full flex items-center justify-center">
              <Timer className="w-16 h-16 text-[#082829]/40" />
            </div>
            <h3 className="text-2xl font-bold text-[#082829] mb-2">No Active Countdowns</h3>
            <p className="text-[#082829]/60 mb-6">Start tracking your harvest schedules</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setEditingCountdown(null); resetForm(); setShowModal(true); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#082829] to-[#0a3a3c] text-white px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all font-semibold"
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
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-3xl font-bold text-[#082829] mb-6">
                {editingCountdown ? 'Edit Countdown' : 'New Harvest Countdown'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Crop Selection - Only from preset crops */}
                <div>
                  <label className="block text-[#082829] font-semibold mb-2 flex items-center justify-between">
                    <span>Select Crop *</span>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Manually refreshing crops...');
                        fetchPresetCrops();
                      }}
                      className="text-xs text-[#082829]/60 hover:text-[#082829] underline"
                    >
                      Refresh Crops
                    </button>
                  </label>
                  <select
                    required
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#082829]/20 focus:border-[#082829] outline-none transition-colors bg-white"
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
                      Please add crops in your Account Centre first. 
                      <button
                        type="button"
                        onClick={() => window.location.href = '/account'}
                        className="ml-1 underline hover:text-red-700"
                      >
                        Go to Account Centre
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
                    {editingCountdown ? 'Update Countdown' : 'Create Countdown'}
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
