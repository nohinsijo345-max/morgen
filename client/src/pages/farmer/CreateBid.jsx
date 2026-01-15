import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Package, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import { UserSession } from '../../utils/userSession';

const CreateBid = () => {
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    unit: 'kg',
    quality: 'Premium',
    harvestDate: '',
    expiryDate: '',
    bidEndDate: '',
    startingPrice: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { colors } = useTheme();

  const farmerUser = UserSession.getCurrentUser('farmer');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.cropName.trim()) {
      setError('Crop name is required');
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Valid quantity is required');
      return false;
    }
    if (!formData.startingPrice || formData.startingPrice <= 0) {
      setError('Valid starting price is required');
      return false;
    }
    if (!formData.harvestDate) {
      setError('Harvest date is required');
      return false;
    }
    if (!formData.expiryDate) {
      setError('Expiry date is required');
      return false;
    }
    if (!formData.bidEndDate) {
      setError('Bid end date is required');
      return false;
    }

    // Validate dates
    const now = new Date();
    const harvest = new Date(formData.harvestDate);
    const expiry = new Date(formData.expiryDate);
    const bidEnd = new Date(formData.bidEndDate);

    if (harvest <= now) {
      setError('Harvest date must be in the future');
      return false;
    }
    if (expiry <= harvest) {
      setError('Expiry date must be after harvest date');
      return false;
    }
    if (bidEnd <= now) {
      setError('Bid end date must be in the future');
      return false;
    }
    if (bidEnd >= harvest) {
      setError('Bid must end before harvest date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      const response = await axios.post(`${API_URL}/api/bidding/create`, {
        farmerId: farmerUser?.farmerId,
        ...formData,
        quantity: parseFloat(formData.quantity),
        startingPrice: parseFloat(formData.startingPrice)
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/farmer/my-bids';
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create bid');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: colors.primary }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Bid Created Successfully!
          </h2>
          <p style={{ color: colors.textSecondary }}>
            Connected buyers will be notified about your bid.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-2 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: colors.textPrimary }} />
            </motion.button>
            
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                Create New Bid
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                List your crop for bidding
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div 
                className="p-4 rounded-xl flex items-center gap-3" 
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-500">{error}</span>
              </div>
            )}

            {/* Crop Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Crop Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Crop Name *
                  </label>
                  <input
                    type="text"
                    name="cropName"
                    value={formData.cropName}
                    onChange={handleChange}
                    placeholder="e.g., Organic Rice"
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Quality *
                  </label>
                  <select
                    name="quality"
                    value={formData.quality}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <option value="Premium">Premium</option>
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="100"
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Pricing
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Starting Bid Price (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                              style={{ color: colors.textMuted }} />
                  <input
                    type="number"
                    name="startingPrice"
                    value={formData.startingPrice}
                    onChange={handleChange}
                    placeholder="5000"
                    min="1"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Important Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Harvest Date *
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    min={formData.harvestDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Bid End Date *
                  </label>
                  <input
                    type="date"
                    name="bidEndDate"
                    value={formData.bidEndDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={formData.harvestDate || undefined}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                Note: Bid must end before the harvest date
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.history.back()}
                className="flex-1 py-3 rounded-xl font-semibold border"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: colors.border,
                  color: colors.textSecondary
                }}
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                style={{
                  backgroundColor: colors.primary,
                  color: '#ffffff',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Create Bid
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default CreateBid;