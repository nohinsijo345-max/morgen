import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus,
  Package,
  Calendar,
  Trash2,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import { UserSession } from '../../utils/userSession';

const SellCrops = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    quality: 'Premium',
    harvestDate: '',
    description: ''
  });
  const { colors } = useTheme();

  const farmerUser = UserSession.getCurrentUser('farmer');

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/crops/farmer/${farmerUser?.farmerId}`);
      setListings(response.data.crops || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      await axios.post(`${API_URL}/api/crops/create`, {
        farmerId: farmerUser?.farmerId,
        farmerName: farmerUser?.name,
        ...formData,
        quantity: parseFloat(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        location: {
          state: farmerUser?.state,
          district: farmerUser?.district,
          city: farmerUser?.city
        }
      });

      setShowAddForm(false);
      setFormData({
        cropName: '',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        quality: 'Premium',
        harvestDate: '',
        description: ''
      });
      fetchMyListings();
      alert('Crop listed successfully!');
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    }
  };

  const handleDelete = async (cropId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/crops/${cropId}`);
      fetchMyListings();
      alert('Listing deleted successfully!');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
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
                  Sell Crops
                </h1>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  List your crops for direct sale to public buyers
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <Plus className="w-5 h-5" />
              Add Listing
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {listings.length === 0 && !showAddForm ? (
          <GlassCard className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No listings yet
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Create your first listing to sell crops directly to public buyers
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <Plus className="w-5 h-5" />
              Create Your First Listing
            </motion.button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((crop, index) => (
              <motion.div
                key={crop._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                          {crop.cropName || crop.name}
                        </h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {crop.quality}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: colors.primary }}>
                          ₹{crop.pricePerUnit}
                        </div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                          per {crop.unit}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          {crop.quantity} {crop.unit} available
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          Harvested: {new Date(crop.harvestDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {crop.description && (
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        {crop.description}
                      </p>
                    )}

                    <div className="rounded-xl p-3 border"
                         style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                          Total Value:
                        </span>
                        <span className="text-lg font-bold" style={{ color: colors.primary }}>
                          ₹{(crop.quantity * crop.pricePerUnit).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDelete(crop._id)}
                        className="flex-1 py-2 rounded-xl font-semibold border flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: colors.border,
                          color: colors.textSecondary
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
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
              Add New Listing
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Quality *
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
                    <option value="kg">Kilograms (kg)</option>
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Price per {formData.unit} (₹) *
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
                    Harvest Date *
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
                  Description
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
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Create Listing
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