import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Package, 
  Star,
  Phone,
  User,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useBuyerTheme } from '../../context/BuyerThemeContext';
import BuyerGlassCard from '../../components/BuyerGlassCard';
import { UserSession } from '../../utils/userSession';

const BuyCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { colors } = useBuyerTheme();

  const buyerUser = UserSession.getCurrentUser('buyer');
  const isPublicBuyer = buyerUser?.buyerType === 'public';

  useEffect(() => {
    fetchAvailableCrops();
  }, []);

  const fetchAvailableCrops = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // For public buyers, only show crops from same district
      const params = isPublicBuyer ? {
        state: buyerUser?.state,
        district: buyerUser?.district
      } : {};

      const response = await axios.get(`${API_URL}/api/crops/available`, { params });
      setCrops(response.data.crops || []);
    } catch (error) {
      console.error('Failed to fetch crops:', error);
      // Set fallback data
      setCrops([
        {
          id: '1',
          name: 'Organic Rice',
          farmer: { name: 'Ravi Kumar', phone: '9876543210', farmerId: 'MGN001' },
          quantity: 50,
          unit: 'kg',
          pricePerUnit: 45,
          quality: 'Premium',
          harvestDate: '2026-02-15',
          location: { district: buyerUser?.district || 'Ernakulam', state: buyerUser?.state || 'Kerala' },
          description: 'Fresh organic rice, pesticide-free'
        },
        {
          id: '2',
          name: 'Fresh Tomatoes',
          farmer: { name: 'Priya Nair', phone: '9876543211', farmerId: 'MGN002' },
          quantity: 25,
          unit: 'kg',
          pricePerUnit: 35,
          quality: 'Grade A',
          harvestDate: '2026-02-10',
          location: { district: buyerUser?.district || 'Ernakulam', state: buyerUser?.state || 'Kerala' },
          description: 'Vine-ripened tomatoes, perfect for cooking'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (crop) => {
    setSelectedCrop(crop);
    setShowConfirmation(true);
  };

  const confirmPurchase = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      await axios.post(`${API_URL}/api/crops/purchase`, {
        cropId: selectedCrop._id,
        buyerId: buyerUser?.buyerId,
        quantity: selectedCrop.quantity,
        totalAmount: selectedCrop.quantity * selectedCrop.pricePerUnit
      });

      alert('Purchase confirmed! Please collect the crop from the farmer.');
      setShowConfirmation(false);
      setSelectedCrop(null);
      fetchAvailableCrops(); // Refresh the list
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
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
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
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
                {isPublicBuyer ? 'Local Crops' : 'Available Crops'}
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {isPublicBuyer 
                  ? `Crops from ${buyerUser?.district}, ${buyerUser?.state}`
                  : 'Browse and purchase crops directly from farmers'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {crops.length === 0 ? (
          <BuyerGlassCard className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No crops available
            </h3>
            <p style={{ color: colors.textSecondary }}>
              {isPublicBuyer 
                ? 'No crops available in your district at the moment.'
                : 'No crops available for purchase at the moment.'
              }
            </p>
          </BuyerGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop, index) => (
              <motion.div
                key={crop._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BuyerGlassCard className="h-full">
                  <div className="space-y-4">
                    {/* Crop Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                          {crop.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                            {crop.quality}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                          ₹{crop.pricePerUnit}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          per {crop.unit}
                        </div>
                      </div>
                    </div>

                    {/* Crop Details */}
                    <div className="space-y-3">
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

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          {crop.location.district}, {crop.location.state}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          {crop.farmer.name}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {crop.description}
                    </p>

                    {/* Total Price */}
                    <div className="rounded-xl p-3 border"
                         style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold" style={{ color: colors.textPrimary }}>
                          Total Amount:
                        </span>
                        <span className="text-xl font-bold" style={{ color: colors.primary }}>
                          ₹{(crop.quantity * crop.pricePerUnit).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Purchase Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePurchase(crop)}
                      className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                      style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Purchase Now
                    </motion.button>
                  </div>
                </BuyerGlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedCrop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full rounded-2xl p-6"
            style={{ backgroundColor: colors.backgroundCard }}
          >
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.primary }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Confirm Purchase
              </h3>
              <p style={{ color: colors.textSecondary }}>
                You are about to purchase {selectedCrop.name} from {selectedCrop.farmer.name}
              </p>
            </div>

            {/* Purchase Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Quantity:</span>
                <span style={{ color: colors.textPrimary }}>{selectedCrop.quantity} {selectedCrop.unit}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Price per {selectedCrop.unit}:</span>
                <span style={{ color: colors.textPrimary }}>₹{selectedCrop.pricePerUnit}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span style={{ color: colors.textPrimary }}>Total Amount:</span>
                <span style={{ color: colors.primary }}>
                  ₹{(selectedCrop.quantity * selectedCrop.pricePerUnit).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Farmer Contact */}
            <div className="rounded-xl p-4 mb-6 border"
                 style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <h4 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
                Farmer Contact Details:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: colors.primary }} />
                  <span style={{ color: colors.textSecondary }}>{selectedCrop.farmer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: colors.primary }} />
                  <span style={{ color: colors.textSecondary }}>{selectedCrop.farmer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                  <span style={{ color: colors.textSecondary }}>
                    {selectedCrop.location.district}, {selectedCrop.location.state}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> After confirmation, please contact the farmer to arrange collection 
                of the crop from their location.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirmation(false)}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmPurchase}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              >
                Confirm Purchase
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BuyCrops;