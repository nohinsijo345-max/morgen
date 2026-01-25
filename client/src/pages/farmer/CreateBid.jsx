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
import { useTranslation } from '../../hooks/useTranslation';

const CreateBid = () => {
  const { t } = useTranslation();
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
  const farmerId = farmerUser?.farmerId || farmerUser?.userId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.cropName.trim()) {
      setError(t('fieldRequired'));
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError(t('quantityMustBePositive'));
      return false;
    }
    if (!formData.startingPrice || formData.startingPrice <= 0) {
      setError(t('priceMustBePositive'));
      return false;
    }
    if (!formData.harvestDate) {
      setError(t('fieldRequired'));
      return false;
    }
    if (!formData.expiryDate) {
      setError(t('fieldRequired'));
      return false;
    }
    if (!formData.bidEndDate) {
      setError(t('fieldRequired'));
      return false;
    }

    // Validate dates
    const now = new Date();
    const harvest = new Date(formData.harvestDate);
    const expiry = new Date(formData.expiryDate);
    const bidEnd = new Date(formData.bidEndDate);

    if (harvest <= now) {
      setError(t('dateMustBeFuture'));
      return false;
    }
    if (expiry <= harvest) {
      setError(t('invalidDate'));
      return false;
    }
    if (bidEnd <= now) {
      setError(t('dateMustBeFuture'));
      return false;
    }
    if (bidEnd >= harvest) {
      setError(t('invalidDate'));
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
      
      if (!farmerId) {
        setError(t('farmerSessionNotFound'));
        setLoading(false);
        return;
      }
      
      const response = await axios.post(`${API_URL}/api/bidding/create`, {
        farmerId: farmerId,
        ...formData,
        quantity: parseFloat(formData.quantity),
        startingPrice: parseFloat(formData.startingPrice)
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/farmer/my-bids';
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || t('failedToCreate'));
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
            {t('bidCreatedSuccessfully')}
          </h2>
          <p style={{ color: colors.textSecondary }}>
            {t('buyersWillBeNotified')}
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
                {t('createNewBid')}
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {t('listCropForBidding')}
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
                {t('cropDetails')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    {t('cropName')} *
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
                    {t('quality')} *
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
                    <option value="Premium">{t('premium')}</option>
                    <option value="Grade A">{t('gradeA')}</option>
                    <option value="Grade B">{t('gradeB')}</option>
                    <option value="Standard">{t('standard')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    {t('quantity')} *
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
                    {t('unit')} *
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
                    <option value="kg">{t('kilograms')}</option>
                    <option value="quintal">{t('quintal')}</option>
                    <option value="ton">{t('ton')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                {t('price')}
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  {t('startingPrice')} (₹) *
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
                {t('harvestDate')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    {t('harvestDate')} *
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
                    {t('expiryDate')} *
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
                    {t('bidEndDate')} *
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
                {t('bidMustEndBeforeHarvest')}
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
                {t('cancel')}
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
                    {t('createBid')}
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