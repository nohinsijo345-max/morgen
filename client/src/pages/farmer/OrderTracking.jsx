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
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserSession } from '../../utils/userSession';
import { useTranslation } from '../../hooks/useTranslation';

const OrderTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const userData = UserSession.getCurrentUser('farmer');
      console.log('🔍 OrderTracking - Current user data:', userData);
      
      if (!userData || !userData.farmerId) {
        console.log('❌ No valid farmer session found');
        setBookings([]);
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log('🔍 OrderTracking - Fetching bookings for farmer:', userData.farmerId);
      
      const response = await axios.get(`${API_URL}/api/transport/bookings/farmer/${userData.farmerId}`);
      console.log('🔍 OrderTracking - Bookings response:', response.data);
      setBookings(response.data);
    } catch (error) {
      console.error(t('failedToFetch'), error);
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

  const requestCancellation = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log('Submitting cancellation request for booking:', selectedBooking._id);
      
      const response = await axios.post(`${API_URL}/api/transport/bookings/${selectedBooking._id}/cancel-request`, {
        reason: cancelReason.trim(),
        requestedBy: 'farmer'
      });
      
      console.log('Cancellation request response:', response.data);
      alert('Cancellation request submitted successfully');
      setShowCancelModal(false);
      setCancelReason('');
      
      // Refresh bookings list
      await fetchBookings();
      
      // Refresh selected booking
      if (selectedBooking && selectedBooking.trackingId) {
        try {
          const trackingResponse = await axios.get(`${API_URL}/api/transport/track/${selectedBooking.trackingId}`);
          setSelectedBooking(trackingResponse.data);
        } catch (trackingError) {
          console.error('Failed to refresh tracking data:', trackingError);
          // If tracking fails, just refresh the booking from the list
          const updatedBooking = await axios.get(`${API_URL}/api/transport/bookings/farmer/${UserSession.getFarmerId()}`);
          const booking = updatedBooking.data.find(b => b._id === selectedBooking._id);
          if (booking) {
            setSelectedBooking(booking);
          }
        }
      }
    } catch (error) {
      console.error('Cancellation request error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit cancellation request';
      alert(errorMessage);
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
      'order_placed': t('orderPlaced'),
      'order_accepted': t('orderAccepted'),
      'pickup_started': t('pickupStarted'),
      'order_picked_up': t('orderPickedUp'),
      'in_transit': t('inTransit'),
      'delivered': t('delivered')
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

  const canCancelOrder = (booking) => {
    if (!booking) return false;
    
    // Cannot cancel if already cancelled, completed, or if pickup has started
    if (['cancelled', 'completed'].includes(booking.status)) return false;
    if (booking.cancellationRequest?.status === 'pending') return false;
    
    const pickedUpStep = booking.trackingSteps?.find(s => s.step === 'order_picked_up');
    return !pickedUpStep || pickedUpStep.status !== 'completed';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-32 h-32 bg-green-200/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200/30 rounded-full blur-xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/60 backdrop-blur-xl border-b border-green-200/50 shadow-lg"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-green-700" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800">{t('orderTracking')}</h1>
                  <p className="text-green-600 text-sm">{t('trackYourTransportOrders')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchMode(!searchMode)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                {t('trackById')}
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
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
                  placeholder={t('enterTrackingId')}
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/70 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={trackByTrackingId}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors"
                >
                  Track
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
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-green-200/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-green-800">
                    Booking #{selectedBooking.bookingId}
                  </h2>
                  <p className="text-green-600">Tracking ID: {selectedBooking.trackingId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">From</div>
                    <div className="text-sm text-green-600">
                      <div>{selectedBooking.fromLocation.city}, {selectedBooking.fromLocation.district}</div>
                      {selectedBooking.fromLocation.pinCode && (
                        <div className="text-xs text-green-500">PIN: {selectedBooking.fromLocation.pinCode}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-green-800">To</div>
                    <div className="text-sm text-green-600">
                      <div>{selectedBooking.toLocation.city}, {selectedBooking.toLocation.district}</div>
                      {selectedBooking.toLocation.pinCode && (
                        <div className="text-xs text-green-500">PIN: {selectedBooking.toLocation.pinCode}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-green-800">Expected Delivery</div>
                    <div className="text-sm text-green-600">
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
                  className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Delivery Delayed</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    We apologize for the delay. New expected delivery date has been set.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Tracking Steps */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-green-200/50 shadow-lg">
              <h3 className="text-xl font-bold text-green-800 mb-6">Tracking Progress</h3>
              
              <div className="space-y-6">
                {selectedBooking.trackingSteps?.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      step.status === 'current' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step.step, step.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-green-800">
                        {getStepTitle(step.step)}
                      </div>
                      
                      {step.timestamp && (
                        <div className="text-sm text-green-600 flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {new Date(step.timestamp).toLocaleString()}
                        </div>
                      )}
                      
                      {step.location && (
                        <div className="text-sm text-green-600 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {step.location}
                        </div>
                      )}
                      
                      {step.notes && (
                        <div className="text-sm text-gray-600 mt-2">
                          {step.notes}
                        </div>
                      )}
                    </div>
                    
                    {step.status === 'current' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-3 h-3 bg-blue-500 rounded-full"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedBooking(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl transition-colors"
              >
                Back to Orders
              </motion.button>
              
              {canCancelOrder(selectedBooking) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCancelModal(true)}
                  className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Request Cancellation
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-green-800">Your Orders</h2>
              <div className="text-sm text-green-600">
                {bookings.length} total orders
              </div>
            </div>

            {bookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">No Orders Yet</h3>
                <p className="text-green-600 mb-6">You haven't placed any transport orders yet.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/local-transport')}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Book Transport
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
                    className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-green-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-green-800">#{booking.bookingId}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">
                          {booking.fromLocation.city} → {booking.toLocation.city}
                          {(booking.fromLocation.pinCode || booking.toLocation.pinCode) && (
                            <div className="text-xs text-green-600">
                              {booking.fromLocation.pinCode && `From: ${booking.fromLocation.pinCode}`}
                              {booking.fromLocation.pinCode && booking.toLocation.pinCode && ' | '}
                              {booking.toLocation.pinCode && `To: ${booking.toLocation.pinCode}`}
                            </div>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-green-700 capitalize">
                          {booking.vehicleType.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-green-700">
                          {new Date(booking.expectedDeliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-green-800">
                        ₹{booking.finalAmount}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {booking.trackingId && (
                      <div className="mt-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Tracking: {booking.trackingId}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-gray-800">Request Cancellation</h3>
              </div>

              <p className="text-gray-600 mb-4">
                Please provide a reason for cancelling this order. Your request will be reviewed by our team.
              </p>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                rows={4}
              />

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={requestCancellation}
                  disabled={!cancelReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderTracking;