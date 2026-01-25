import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus,
  Package,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import EnhancedCropCard from '../../components/EnhancedCropCard';
import { UserSession } from '../../utils/userSession';
import { useTranslation } from '../../hooks/useTranslation';

const SellCrops = () => {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    category: 'vegetables',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    quality: 'A',
    harvestDate: '',
    description: ''
  });
  const [cropsData, setCropsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get theme with safe fallback
  let colors = {
    background: '#ffffff',
    glassBackground: '#ffffff',
    glassBorder: '#e5e7eb',
    surface: '#f9fafb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    primary: '#10B981',
    border: '#e5e7eb',
    backgroundCard: '#ffffff'
  };

  try {
    const theme = useTheme();
    if (theme && theme.colors) {
      colors = theme.colors;
      console.log('✅ Theme loaded successfully for SellCrops');
    }
  } catch (err) {
    console.error('⚠️ Theme error (using fallback):', err);
  }

  const farmerUser = UserSession.getCurrentUser('farmer');

  // Direct API call instead of useLiveUpdates hook
  const fetchCrops = async () => {
    try {
      console.log('🔄 Fetching farmer crops directly...', { farmerId: farmerUser?.farmerId });
      setLoading(true);
      setError(null);
      
      if (!farmerUser?.farmerId) {
        setError(t('farmerSessionNotFound'));
        setLoading(false);
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const endpoint = `/api/crops/farmer/${farmerUser.farmerId}`;
      
      console.log('📡 Fetching from:', `${API_URL}${endpoint}`);
      
      const response = await axios.get(`${API_URL}${endpoint}`);
      
      console.log('✅ Crops fetch successful:', response.data);
      
      // Fetch order information for each crop
      const cropsWithOrders = await Promise.all(
        (response.data.crops || []).map(async (crop) => {
          try {
            // Get orders for this crop
            const ordersResponse = await axios.get(`${API_URL}/api/orders/farmer/${farmerUser.farmerId}`);
            const cropOrders = ordersResponse.data.orders?.filter(order => {
              // Handle different cropId formats
              if (!order.cropId) return false;
              
              // If cropId is an object with _id property
              if (typeof order.cropId === 'object' && order.cropId._id) {
                return order.cropId._id === crop._id;
              }
              
              // If cropId is a string
              if (typeof order.cropId === 'string') {
                return order.cropId === crop._id;
              }
              
              return false;
            }) || [];
            
            console.log(`📊 Crop ${crop.name} (${crop._id}):`, {
              totalOrders: ordersResponse.data.orders?.length || 0,
              matchingOrders: cropOrders.length,
              cropOrders: cropOrders.map(o => ({ orderId: o.orderId, status: o.status, cropId: o.cropId }))
            });
            
            // Calculate order statistics
            const totalOrders = cropOrders.length;
            const completedOrders = cropOrders.filter(order => order.status === 'completed').length;
            const pendingOrders = cropOrders.filter(order => order.status === 'pending').length;
            const approvedOrders = cropOrders.filter(order => order.status === 'approved').length;
            
            return {
              ...crop,
              cropName: crop.cropName || crop.name, // Ensure cropName is available
              orderStats: {
                total: totalOrders,
                completed: completedOrders,
                pending: pendingOrders,
                approved: approvedOrders,
                hasCompletedOrders: completedOrders > 0
              }
            };
          } catch (orderError) {
            console.error('Failed to fetch orders for crop:', crop._id, orderError);
            return {
              ...crop,
              orderStats: {
                total: 0,
                completed: 0,
                pending: 0,
                approved: 0,
                hasCompletedOrders: false
              }
            };
          }
        })
      );
      
      setCropsData({ crops: cropsWithOrders });
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('❌ Crops fetch failed:', err);
      setError(`${t('failedToLoadCrops')}: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    console.log('🚀 SellCrops component mounted');
    fetchCrops();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchCrops, 30000);
    
    return () => {
      console.log('🛑 SellCrops component unmounted');
      clearInterval(interval);
    };
  }, []);

  const listings = cropsData?.crops || [];

  // Refresh function for manual updates
  const refresh = fetchCrops;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      console.log('📝 Creating crop listing with data:', {
        farmerId: farmerUser?.farmerId,
        farmerName: farmerUser?.name,
        cropName: formData.cropName,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        basePrice: parseFloat(formData.pricePerUnit),
        quality: formData.quality,
        harvestDate: formData.harvestDate,
        description: formData.description
      });
      
      const response = await axios.post(`${API_URL}/api/crops/create`, {
        farmerId: farmerUser?.farmerId,
        farmerName: farmerUser?.name,
        cropName: formData.cropName,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        basePrice: parseFloat(formData.pricePerUnit),
        quality: formData.quality,
        harvestDate: formData.harvestDate,
        description: formData.description,
        location: {
          state: farmerUser?.state,
          district: farmerUser?.district,
          city: farmerUser?.city
        }
      });

      console.log('✅ Crop listing created successfully:', response.data);

      setShowAddForm(false);
      setFormData({
        cropName: '',
        category: 'vegetables',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        quality: 'A',
        harvestDate: '',
        description: ''
      });
      refresh(); // Refresh the live data
      alert(t('cropListedSuccessfully'));
    } catch (error) {
      console.error('❌ Failed to create listing:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.error || t('failedToCreate') + '. ' + t('tryAgainLater');
      alert(errorMessage);
    }
  };

  const handleDelete = async (cropId) => {
    if (!confirm(t('areYouSureDelete'))) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/crops/${cropId}`);
      refresh(); // Refresh the live data
      alert(t('listingDeletedSuccessfully'));
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert(t('failedToCreate') + '. ' + t('tryAgainLater'));
    }
  };

  const handleEdit = (crop) => {
    // Set form data for editing
    setFormData({
      cropName: crop.cropName || crop.name,
      category: crop.category,
      quantity: crop.quantity.toString(),
      unit: crop.unit,
      pricePerUnit: crop.pricePerUnit.toString(),
      quality: crop.quality,
      harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : '',
      description: crop.description || ''
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
        <p className="mt-4" style={{ color: colors.textSecondary }}>{t('loadingYourCrops')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Package className="w-16 h-16 mb-4" style={{ color: colors.textMuted }} />
        <p className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>{t('unableToLoadCrops')}</p>
        <p className="mb-4" style={{ color: colors.textSecondary }}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchCrops}
          className="px-6 py-2 rounded-xl font-semibold"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          {t('tryAgain')}
        </motion.button>
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
                  {t('sellCrops')}
                </h1>
                <div className="flex items-center gap-4 text-sm" style={{ color: colors.textSecondary }}>
                  <span>{t('listCropsForSale')}</span>
                  {lastUpdated && (
                    <span className="text-xs">
                      {t('lastUpdated')}: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              >
                <Plus className="w-5 h-5" />
                {t('addListing')}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/farmer/orders'}
                className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 border"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
              >
                <Package className="w-5 h-5" />
                {t('orders')}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {listings.length === 0 && !showAddForm ? (
          <GlassCard className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              {t('noListingsYet')}
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              {t('createFirstListing')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <Plus className="w-5 h-5" />
              {t('createFirstListing')}
            </motion.button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((crop, index) => (
              <EnhancedCropCard
                key={crop._id || index}
                crop={crop}
                onDelete={() => handleDelete(crop._id)}
                onEdit={handleEdit}
                showActions={true}
                variant="farmer"
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Listing Modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full rounded-2xl p-6 my-8"
            style={{ backgroundColor: colors.backgroundCard }}
          >
            <h3 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              {t('addNewListing')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
                    className="w-full px-4 py-3 rounded-xl border-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    {t('category')} *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <option value="vegetables">{t('vegetables')}</option>
                    <option value="fruits">{t('fruits')}</option>
                    <option value="grains">{t('grains')}</option>
                    <option value="spices">{t('spices')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    {t('quality')} *
                  </label>
                  <select
                    name="quality"
                    value={formData.quality}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <option value="A">{t('gradeA')} ({t('premium')})</option>
                    <option value="B">{t('gradeB')} ({t('goodGrade')})</option>
                    <option value="C">{t('gradeC')} ({t('standard')})</option>
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
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border-2"
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
                    className="w-full px-4 py-3 rounded-xl border-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <option value="kg">{t('kilograms')} (kg)</option>
                    <option value="quintal">{t('quintal')}</option>
                    <option value="ton">{t('ton')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    {t('pricePerUnit')} {formData.unit} (₹) *
                  </label>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    {t('harvestDate')} *
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  {t('description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border-2"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(false)}
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                >
                  <CheckCircle className="w-5 h-5" />
                  {t('createListing')}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SellCrops;