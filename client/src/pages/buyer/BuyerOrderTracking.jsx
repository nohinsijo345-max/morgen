import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Package, 
  Truck,
  MapPin,
  Phone,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { useBuyerTheme } from '../../context/BuyerThemeContext';
import BuyerGlassCard from '../../components/BuyerGlassCard';
import { SessionManager } from '../../utils/sessionManager';

const BuyerOrderTracking = () => {
  const { colors, isDarkMode } = useBuyerTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Auto-fill phone number from session
  useEffect(() => {
    const buyer = SessionManager.getUserSession('buyer');
    if (buyer?.phone) {
      setPhoneNumber(buyer.phone);
    }
  }, []);

  const searchBookings = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      const response = await axios.get(`${API_URL}/api/transport/bookings/buyer/phone/${cleanPhone}`);
      
      setBookings(response.data || []);
      
      if (response.data && response.data.length === 0) {
        setError('No transport bookings found for this phone number');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBookings();
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': '#F59E0B',
      'confirmed': '#3B82F6',
      'order_accepted': '#10B981',
      'pickup_started': '#8B5CF6',
      'order_picked_up': '#06B6D4',
      'in_transit': '#F97316',
      'delivered': '#22C55E',
      'completed': '#059669',
      'cancelled': '#EF4444',
      'cancellation_requested': '#F59E0B'
    };
    return statusColors[status] || '#6B7280';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'order_accepted': 'Accepted',
      'pickup_started': 'Pickup Started',
      'order_picked_up': 'Picked Up',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'cancellation_requested': 'Cancellation Requested'
    };
    return statusTexts[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="backdrop-blur-xl border-b shadow-sm sticky top-0 z-10"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/buyer/dashboard'}
              className="p-2 rounded-xl transition-all"
              style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                Order Tracking
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Track your crop orders
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <BuyerGlassCard delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter your 10-digit phone number"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    '--tw-ring-color': colors.primary
                  }}
                  maxLength="10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={searchBookings}
                disabled={loading}
                className="px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 shadow-lg"
                style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: isDarkMode ? '#0d1117' : '#ffffff' }}
                  />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? 'Searching...' : 'Search'}
              </motion.button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </BuyerGlassCard>

        {/* Results Section */}
        {searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            {bookings.length === 0 ? (
              <BuyerGlassCard delay={0.2}>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                    No bookings found
                  </h3>
                  <p style={{ color: colors.textSecondary }}>
                    No orders were found for this phone number.
                  </p>
                </div>
              </BuyerGlassCard>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  Your Orders ({bookings.length})
                </h2>
                
                <div className="grid gap-6">
                  {bookings.map((booking, index) => (
                    <BuyerGlassCard 
                      key={booking._id}
                      delay={0.2 + index * 0.1}
                      onClick={() => setSelectedBooking(booking)}
                      className="cursor-pointer"
                    >
                      {/* Booking Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Truck className="w-6 h-6" style={{ color: colors.primary }} />
                          <div>
                            <h3 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                              {booking.bookingId}
                            </h3>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                              Tracking ID: {booking.trackingId}
                            </p>
                          </div>
                        </div>
                        <div 
                          className="px-3 py-1 rounded-lg text-sm font-medium"
                          style={{ 
                            backgroundColor: `${getStatusColor(booking.status)}20`,
                            color: getStatusColor(booking.status)
                          }}
                        >
                          {getStatusText(booking.status)}
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>From</p>
                          <p className="font-semibold" style={{ color: colors.textPrimary }}>
                            {booking.fromLocation.city}, {booking.fromLocation.district}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5" style={{ color: colors.textMuted }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>To</p>
                          <p className="font-semibold" style={{ color: colors.textPrimary }}>
                            {booking.toLocation.city}, {booking.toLocation.district}
                          </p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Vehicle</p>
                          <p className="font-medium" style={{ color: colors.textPrimary }}>
                            {booking.vehicleType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Distance</p>
                          <p className="font-medium" style={{ color: colors.textPrimary }}>
                            {booking.distance} km
                          </p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Amount</p>
                          <p className="font-medium" style={{ color: colors.primary }}>
                            ₹{booking.finalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Pickup Date</p>
                          <p className="font-medium" style={{ color: colors.textPrimary }}>
                            {new Date(booking.pickupDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </BuyerGlassCard>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Detailed Tracking Modal */}
      {selectedBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedBooking(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                Tracking Details
              </h3>
              <div 
                className="px-3 py-1 rounded-lg font-medium"
                style={{ 
                  backgroundColor: `${getStatusColor(selectedBooking.status)}20`,
                  color: getStatusColor(selectedBooking.status)
                }}
              >
                {getStatusText(selectedBooking.status)}
              </div>
            </div>

            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>Booking ID</label>
                <p className="font-bold" style={{ color: colors.textPrimary }}>{selectedBooking.bookingId}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>Tracking ID</label>
                <p className="font-bold" style={{ color: colors.textPrimary }}>{selectedBooking.trackingId}</p>
              </div>
            </div>

            {/* Route Details */}
            <div className="rounded-xl p-4 mb-6 border"
                 style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
              <h4 className="font-bold mb-3" style={{ color: colors.textPrimary }}>Route Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      From: {selectedBooking.fromLocation.city}, {selectedBooking.fromLocation.district}, {selectedBooking.fromLocation.state}
                    </p>
                    {selectedBooking.fromLocation.pinCode && (
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        PIN: {selectedBooking.fromLocation.pinCode}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      To: {selectedBooking.toLocation.city}, {selectedBooking.toLocation.district}, {selectedBooking.toLocation.state}
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      PIN: {selectedBooking.toLocation.pinCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="rounded-xl p-4 mb-6 border"
                 style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}>
              <h4 className="font-bold mb-3" style={{ color: colors.textPrimary }}>Delivery Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Expected Delivery</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                    {formatDate(selectedBooking.expectedDeliveryDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Vehicle Type</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                    {selectedBooking.vehicleType}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Distance</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                    {selectedBooking.distance} km
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Total Amount</label>
                  <p className="font-bold text-lg" style={{ color: colors.primary }}>
                    ₹{selectedBooking.finalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BuyerOrderTracking;
