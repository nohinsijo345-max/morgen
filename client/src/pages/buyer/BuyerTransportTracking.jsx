import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  X,
  Search,
  Eye,
  XCircle,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserSession } from '../../utils/userSession';
import { useBuyerTheme } from '../../context/BuyerThemeContext';
import BuyerGlassCard from '../../components/BuyerGlassCard';

const BuyerTransportTracking = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [phoneSearchMode, setPhoneSearchMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { isDarkMode, colors } = useBuyerTheme();

  useEffect(() => {
    fetchBuyerBookings();
  }, []);

  const fetchBuyerBookings = async () => {
    try {
      const userData = UserSession.getCurrentUser('buyer');
      console.log('🔍 BuyerTransportTracking - Current user data:', userData);
      
      if (!userData || !userData.phone) {
        console.log('❌ No valid buyer session or phone number found');
        setBookings([]);
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log('🔍 BuyerTransportTracking - Fetching bookings for buyer phone:', userData.phone);
      
      const response = await axios.get(`${API_URL}/api/transport/bookings/buyer/phone/${userData.phone}`);
      console.log('🔍 BuyerTransportTracking - Bookings response:', response.data);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch buyer bookings:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const trackByTrackingId = async () => {
    if (!trackingId.trim()) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/transport/track/${trackingId}`);
      setSelectedBooking(response.data);
      setSearchMode(false);
    } catch (error) {
      alert('Tracking ID not found');
    }
  };

  const searchByPhoneNumber = async () => {
    if (!phoneNumber.trim()) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/transport/bookings/buyer/phone/${phoneNumber}`);
      setBookings(response.data);
      setPhoneSearchMode(false);
    } catch (error) {
      console.error('Failed to fetch bookings by phone:', error);
      alert('Failed to fetch orders for this phone number');
    }
  };

  const getStepIcon = (step, status) => {
    const icons = {
      'order_placed': Package,
      'order_accepted': CheckCircle,
      'pickup_started': Truck,
      'order_picked_up': Package,
      'in_transit': Truck,
      'delivered': CheckCircle
    };
    
    const IconComponent = icons[step] || Package;
    
    if (status === 'completed') {
      return <IconComponent className="w-6 h-6 text-green-600" />;
    } else if (status === 'current') {
      return <IconComponent className="w-6 h-6 text-blue-600 animate-pulse" />;
    } else {
      return <IconComponent className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepTitle = (step) => {
    const titles = {
      'order_placed': 'Order Placed',
      'order_accepted': 'Order Accepted',
      'pickup_started': 'Pickup Started',
      'order_picked_up': 'Order Picked Up',
      'in_transit': 'In Transit',
      'delivered': 'Delivered'
    };
    return titles[step] || step;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'cancellation_requested': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 rounded-full"
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 backdrop-blur-xl border-b shadow-lg"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/buyer/dashboard')}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: colors.surface }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: colors.primary }} />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                     style={{ backgroundColor: colors.primary }}>
                  <Package className="w-5 h-5" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Transport Tracking</h1>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Track your transport orders</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPhoneSearchMode(!phoneSearchMode)}
                className="px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
              >
                <Phone className="w-4 h-4" />
                Search by Phone
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchMode(!searchMode)}
                className="px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
                style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
              >
                <Search className="w-4 h-4" />
                Track by ID
              </motion.button>
            </div>
          </div>

          {/* Search Bars */}
          <AnimatePresence>
            {searchMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex gap-3"
              >
                <input
                  type="text"
                  placeholder="Enter tracking ID (e.g., TRK123456)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    backgroundColor: colors.surface, 
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                    '--tw-ring-color': colors.primary
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={trackByTrackingId}
                  className="px-6 py-2 rounded-xl transition-colors"
                  style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                >
                  Track
                </motion.button>
              </motion.div>
            )}
            
            {phoneSearchMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex gap-3"
              >
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    backgroundColor: colors.surface, 
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                    '--tw-ring-color': colors.primary
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={searchByPhoneNumber}
                  className="px-6 py-2 rounded-xl transition-colors"
                  style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                >
                  Search
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {selectedBooking ? (
          /* Detailed Tracking View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Booking Header */}
            <BuyerGlassCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                    Booking #{selectedBooking.bookingId}
                  </h2>
                  <p style={{ color: colors.textSecondary }}>Tracking ID: {selectedBooking.trackingId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <div className="font-semibold" style={{ color: colors.textPrimary }}>From</div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>
                      <div>{selectedBooking.fromLocation.city}, {selectedBooking.fromLocation.district}</div>
                      {selectedBooking.fromLocation.pinCode && (
                        <div className="text-xs" style={{ color: colors.textMuted }}>PIN: {selectedBooking.fromLocation.pinCode}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <div className="font-semibold" style={{ color: colors.textPrimary }}>To</div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>
                      <div>{selectedBooking.toLocation.city}, {selectedBooking.toLocation.district}</div>
                      {selectedBooking.toLocation.pinCode && (
                        <div className="text-xs" style={{ color: colors.textMuted }}>PIN: {selectedBooking.toLocation.pinCode}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <div className="font-semibold" style={{ color: colors.textPrimary }}>Expected Delivery</div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>
                      {new Date(selectedBooking.expectedDeliveryDate).toLocaleDateString()}
                    </div>
                    {selectedBooking.isOverdue && selectedBooking.newExpectedDate && (
                      <div className="text-xs text-red-600">
                        New date: {new Date(selectedBooking.newExpectedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedBooking.isOverdue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 rounded-xl border"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Delivery Delayed</span>
                  </div>
                  <p className="text-red-500 text-sm mt-1">
                    We apologize for the delay. New expected delivery date has been set.
                  </p>
                </motion.div>
              )}
            </BuyerGlassCard>

            {/* Tracking Steps */}
            <BuyerGlassCard>
              <h3 className="text-xl font-bold mb-6" style={{ color: colors.textPrimary }}>Tracking Progress</h3>
              
              <div className="space-y-6">
                {selectedBooking.trackingSteps?.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${
                      step.status === 'completed' ? 'border-green-200' :
                      step.status === 'current' ? 'border-blue-200' :
                      'border-gray-200'
                    }`}
                    style={{ 
                      backgroundColor: step.status === 'completed' ? colors.surface : 
                                     step.status === 'current' ? colors.surface : 
                                     colors.backgroundCard
                    }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step.step, step.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold" style={{ color: colors.textPrimary }}>
                        {getStepTitle(step.step)}
                      </div>
                      
                      {step.timestamp && (
                        <div className="text-sm flex items-center gap-2 mt-1" style={{ color: colors.textSecondary }}>
                          <Clock className="w-4 h-4" />
                          {new Date(step.timestamp).toLocaleString()}
                        </div>
                      )}
                      
                      {step.location && (
                        <div className="text-sm flex items-center gap-2 mt-1" style={{ color: colors.textSecondary }}>
                          <MapPin className="w-4 h-4" />
                          {step.location}
                        </div>
                      )}
                      
                      {step.notes && (
                        <div className="text-sm mt-2" style={{ color: colors.textMuted }}>
                          {step.notes}
                        </div>
                      )}
                    </div>
                    
                    {step.status === 'current' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </BuyerGlassCard>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBooking(null)}
              className="w-full py-3 px-6 rounded-xl transition-colors"
              style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            >
              Back to Orders
            </motion.button>
          </motion.div>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Your Orders</h2>
              <div className="text-sm" style={{ color: colors.textSecondary }}>
                {bookings.length} total orders
              </div>
            </div>

            {bookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Package className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>No Orders Found</h3>
                <p className="mb-6" style={{ color: colors.textSecondary }}>
                  No transport orders found for your phone number.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/buyer/dashboard')}
                  className="px-6 py-3 rounded-xl transition-colors"
                  style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                >
                  Back to Dashboard
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <BuyerGlassCard className="h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-bold" style={{ color: colors.textPrimary }}>#{booking.bookingId}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                          <span style={{ color: colors.textSecondary }}>
                            {booking.fromLocation.city} → {booking.toLocation.city}
                            {(booking.fromLocation.pinCode || booking.toLocation.pinCode) && (
                              <div className="text-xs" style={{ color: colors.textMuted }}>
                                {booking.fromLocation.pinCode && `From: ${booking.fromLocation.pinCode}`}
                                {booking.fromLocation.pinCode && booking.toLocation.pinCode && ' | '}
                                {booking.toLocation.pinCode && `To: ${booking.toLocation.pinCode}`}
                              </div>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4" style={{ color: colors.primary }} />
                          <span style={{ color: colors.textSecondary }} className="capitalize">
                            {booking.vehicleType.replace('-', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                          <span style={{ color: colors.textSecondary }}>
                            {new Date(booking.expectedDeliveryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                          ₹{booking.finalAmount}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {booking.trackingId && (
                        <div className="mt-3 text-xs px-2 py-1 rounded" style={{ color: colors.textMuted, backgroundColor: colors.surface }}>
                          Tracking: {booking.trackingId}
                        </div>
                      )}
                    </BuyerGlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerTransportTracking;