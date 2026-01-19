import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Package, 
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';

const PublicTransportTracking = () => {
  console.log('🚀 PublicTransportTracking component mounted');
  
  // Wrap everything in try-catch to prevent crashes
  try {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Track Your Transport
            </h1>
            <p className="text-lg text-gray-600">
              Enter your phone number to track your crop transport orders
            </p>
          </div>
        </div>
      </motion.header>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter your 10-digit phone number"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 text-gray-900"
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
                className="px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 bg-red-500 text-white"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
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
              className="mt-4 p-4 rounded-xl flex items-center gap-3 bg-red-50 text-red-600"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        {searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  No bookings found
                </h3>
                <p className="text-gray-600">
                  No transport bookings were found for this phone number.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Transport Bookings ({bookings.length})
                </h2>
                
                <div className="grid gap-6">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      {/* Booking Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Truck className="w-6 h-6 text-red-500" />
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {booking.bookingId}
                            </h3>
                            <p className="text-sm text-gray-600">
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
                          <p className="text-sm font-medium text-gray-600">From</p>
                          <p className="font-semibold text-gray-900">
                            {booking.fromLocation.city}, {booking.fromLocation.district}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">To</p>
                          <p className="font-semibold text-gray-900">
                            {booking.toLocation.city}, {booking.toLocation.district}
                          </p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Vehicle</p>
                          <p className="font-medium text-gray-900">
                            {booking.vehicleType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="font-medium text-gray-900">
                            {booking.distance} km
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-medium text-red-500">
                            ₹{booking.finalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pickup Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(booking.pickupDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Quick Status */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Current Status:</span>
                        <span className="font-medium" style={{ color: getStatusColor(booking.status) }}>
                          {getStatusText(booking.status)}
                        </span>
                        <span className="text-gray-400">• Click to view full tracking</span>
                      </div>
                    </motion.div>
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full rounded-2xl p-6 max-h-[90vh] overflow-y-auto bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
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
                <label className="text-sm font-medium text-gray-600">Booking ID</label>
                <p className="font-bold text-gray-900">{selectedBooking.bookingId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tracking ID</label>
                <p className="font-bold text-gray-900">{selectedBooking.trackingId}</p>
              </div>
            </div>

            {/* Route Details */}
            <div className="rounded-xl p-4 mb-6 border border-gray-200 bg-gray-50">
              <h4 className="font-bold mb-3 text-gray-900">Route Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      From: {selectedBooking.fromLocation.city}, {selectedBooking.fromLocation.district}, {selectedBooking.fromLocation.state}
                    </p>
                    {selectedBooking.fromLocation.pinCode && (
                      <p className="text-sm text-gray-600">
                        PIN: {selectedBooking.fromLocation.pinCode}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      To: {selectedBooking.toLocation.city}, {selectedBooking.toLocation.district}, {selectedBooking.toLocation.state}
                    </p>
                    <p className="text-sm text-gray-600">
                      PIN: {selectedBooking.toLocation.pinCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="rounded-xl p-4 mb-6 border border-gray-200 bg-gray-50">
              <h4 className="font-bold mb-3 text-gray-900">Delivery Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Expected Delivery</label>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedBooking.expectedDeliveryDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vehicle Type</label>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.vehicleType}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Distance</label>
                  <p className="font-medium text-gray-900">
                    {selectedBooking.distance} km
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Total Amount</label>
                  <p className="font-bold text-lg text-red-500">
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
                className="px-6 py-3 rounded-xl font-semibold bg-red-500 text-white"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
  } catch (err) {
    console.error('❌ Error in PublicTransportTracking:', err);
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fee',
        padding: '40px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>Component Error</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>{err.message}</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '15px 30px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
};

export default PublicTransportTracking;
