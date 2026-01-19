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
import EnhancedCropCard from '../../components/EnhancedCropCard';
// import useLiveUpdates from '../../hooks/useLiveUpdates';
import { UserSession } from '../../utils/userSession';

const BuyCrops = () => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cropsData, setCropsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Get theme with safe fallback
  let colors = {
    background: '#ffffff',
    headerBg: '#ffffff',
    headerBorder: '#e5e7eb',
    surface: '#f9fafb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    primary: '#FF4757',
    primaryLight: '#FFE5E8',
    border: '#e5e7eb',
    backgroundCard: '#ffffff'
  };

  try {
    const theme = useBuyerTheme();
    if (theme && theme.colors) {
      colors = theme.colors;
      console.log('✅ Theme loaded successfully for BuyCrops');
    }
  } catch (err) {
    console.error('⚠️ Theme error (using fallback):', err);
  }

  const buyerUser = UserSession.getCurrentUser('buyer');
  const isPublicBuyer = buyerUser?.buyerType === 'public';

  // Build query parameters for API
  const queryParams = isPublicBuyer ? {
    state: buyerUser?.state,
    district: buyerUser?.district,
    pinCode: buyerUser?.pinCode,
    buyerType: 'public',
    buyerId: buyerUser?.buyerId
  } : {
    buyerType: 'commercial'
  };

  // Direct API call instead of useLiveUpdates hook
  const fetchCrops = async () => {
    try {
      console.log('🔄 Fetching crops directly...', { queryParams, isPublicBuyer });
      setLoading(true);
      setError(null);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const queryString = new URLSearchParams(queryParams).toString();
      const endpoint = `/api/crops/available${queryString ? `?${queryString}` : ''}`;
      
      console.log('📡 Fetching from:', `${API_URL}${endpoint}`);
      
      const response = await axios.get(`${API_URL}${endpoint}`);
      
      console.log('✅ Crops fetch successful:', response.data);
      setCropsData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('❌ Crops fetch failed:', err);
      setError(`Failed to load crops: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    console.log('🚀 BuyCrops component mounted');
    fetchCrops();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchCrops, 30000);
    
    return () => {
      console.log('🛑 BuyCrops component unmounted');
      clearInterval(interval);
    };
  }, []);

  const crops = cropsData?.crops || [];

  const handlePurchase = async (crop) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      console.log('🛒 Creating purchase order for crop:', crop);
      
      const response = await axios.post(`${API_URL}/api/orders/create`, {
        buyerId: buyerUser?.buyerId,
        cropId: crop._id,
        quantity: crop.quantity,
        message: `Purchase request for ${crop.name || crop.cropName}`
      });

      console.log('✅ Purchase order created:', response.data);
      
      alert('Purchase request sent successfully! The farmer will review and respond to your request.');
      fetchCrops(); // Refresh the data
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      
      if (error.response?.data?.requiresConnection) {
        alert(`You must be connected to ${error.response.data.farmerName} to purchase their crops. Please go to "My Farmers" and send a connection request first.`);
      } else {
        alert(`Purchase failed: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const confirmPurchase = async () => {
    // This function is no longer needed as purchase is handled directly
    setShowConfirmation(false);
    setSelectedCrop(null);
  };

  const handleViewCrop = (crop) => {
    // Remove details option - only purchase is available
    handlePurchase(crop);
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
        <p className="mt-4" style={{ color: colors.textSecondary }}>Loading crops...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Package className="w-16 h-16 mb-4" style={{ color: colors.textMuted }} />
        <p className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>Unable to Load Crops</p>
        <p className="mb-4" style={{ color: colors.textSecondary }}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchCrops}
          className="px-6 py-2 rounded-xl font-semibold"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          Try Again
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
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
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
                  {isPublicBuyer ? 'Local Crops' : 'Available Crops'}
                </h1>
                <div className="flex items-center gap-4 text-sm" style={{ color: colors.textSecondary }}>
                  <span>
                    {isPublicBuyer 
                      ? `Crops from connected farmers in ${buyerUser?.pinCode ? `PIN ${buyerUser.pinCode}` : `${buyerUser?.district}, ${buyerUser?.state}`}`
                      : 'Browse and purchase crops directly from farmers'
                    }
                  </span>
                  {lastUpdated && (
                    <span className="text-xs">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/buyer/orders'}
              className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <ShoppingCart className="w-5 h-5" />
              My Orders
            </motion.button>
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
                ? 'No crops available from your connected farmers at the moment. Connect with more farmers in "My Farmers" to see their crops.'
                : 'No crops available for purchase at the moment.'
              }
            </p>
          </BuyerGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop, index) => (
              <EnhancedCropCard
                key={crop._id || index}
                crop={{
                  ...crop,
                  cropName: crop.name || crop.cropName,
                  location: crop.location || { 
                    district: buyerUser?.district || 'Unknown', 
                    state: buyerUser?.state || 'Unknown' 
                  }
                }}
                onPurchase={handlePurchase}
                showActions={true}
                showStats={true}
                variant="buyer"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyCrops;