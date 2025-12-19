import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Clock,
  IndianRupee,
  MapPin,
  Truck,
  Search,
  Eye,
  Filter
} from 'lucide-react';
import axios from 'axios';
import { UserSession } from '../../utils/userSession';

const OrderHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Debug: Log the current state
  useEffect(() => {
    console.log('OrderHistory - Current bookings state:', bookings);
    console.log('OrderHistory - Filtered bookings:', filteredBookings);
  }, [bookings, filteredBookings]);

  const fetchBookings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const userData = UserSession.getCurrentUser('farmer');
      console.log('OrderHistory - User from UserSession:', userData);
      
      if (!userData || !userData.farmerId) {
        console.log('❌ OrderHistory - No valid farmer session found');
        setBookings([]);
        return;
      }
      
      console.log('OrderHistory - Fetching bookings for farmer:', userData.farmerId);
      
      const response = await axios.get(`${API_URL}/api/transport/bookings/farmer/${userData.farmerId}`);
      console.log('OrderHistory - Bookings response:', response.data);
      console.log('OrderHistory - Number of bookings:', response.data.length);
      setBookings(response.data);
    } catch (error) {
      console.error('OrderHistory - Failed to fetch bookings:', error);
      console.error('OrderHistory - Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'order_placed': 'bg-blue-100 text-blue-800 border-blue-200',
      'order_accepted': 'bg-green-100 text-green-800 border-green-200',
      'pickup_started': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'order_picked_up': 'bg-orange-100 text-orange-800 border-orange-200',
      'in_transit': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'order_placed': 'Order Placed',
      'order_accepted': 'Order Accepted',
      'pickup_started': 'Pickup Started',
      'order_picked_up': 'Order Picked Up',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const filteredBookings = bookings.filter(booking => {
    const fromLocation = booking.fromLocation ? `${booking.fromLocation.city}, ${booking.fromLocation.district}` : '';
    const toLocation = booking.toLocation ? `${booking.toLocation.city}, ${booking.toLocation.district}` : '';
    
    const matchesSearch = booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         toLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-3 border-amber-200 border-t-amber-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 z-50"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="w-10 h-10 flex items-center justify-center bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-amber-700" />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold text-amber-900">Order History</h1>
                <p className="text-sm text-amber-700">View all your transport bookings</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-amber-900">{filteredBookings.length}</div>
              <div className="text-sm text-amber-700">Total Orders</div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-amber-200/50"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking ID or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none"
              >
                <option value="all">All Orders</option>
                <option value="order_placed">Order Placed</option>
                <option value="order_accepted">Order Accepted</option>
                <option value="pickup_started">Pickup Started</option>
                <option value="order_picked_up">Order Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900">{booking.bookingId}</h3>
                      <p className="text-sm text-amber-700">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(booking)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-2 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs text-amber-700">From</div>
                      <div className="font-medium text-amber-900">
                        {booking.fromLocation ? (
                          <div>
                            <div>{booking.fromLocation.city}, {booking.fromLocation.district}</div>
                            {booking.fromLocation.pinCode && (
                              <div className="text-xs text-amber-600">PIN: {booking.fromLocation.pinCode}</div>
                            )}
                          </div>
                        ) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs text-amber-700">To</div>
                      <div className="font-medium text-amber-900">
                        {booking.toLocation ? (
                          <div>
                            <div>{booking.toLocation.city}, {booking.toLocation.district}</div>
                            {booking.toLocation.pinCode && (
                              <div className="text-xs text-amber-600">PIN: {booking.toLocation.pinCode}</div>
                            )}
                          </div>
                        ) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs text-amber-700">Amount</div>
                      <div className="font-bold text-amber-900">₹{booking.finalAmount}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-amber-700">
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      <span>{booking.vehicleId?.name || 'Vehicle'}</span>
                    </div>
                    {booking.expectedDeliveryDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Est: {new Date(booking.expectedDeliveryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {booking.status !== 'delivered' && booking.status !== 'cancelled' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = `/order-tracking?id=${booking.bookingId}`}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Track Order
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No orders found' : 'No orders yet'}
              </h3>
              <p className="text-amber-700 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Start by booking your first transport service.'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/local-transport'}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg"
                >
                  Book Transport
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">Order Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Info */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-amber-700">Booking ID:</span>
                    <div className="font-medium text-amber-900">{selectedBooking.bookingId}</div>
                  </div>
                  <div>
                    <span className="text-amber-700">Status:</span>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusText(selectedBooking.status)}
                    </div>
                  </div>
                  <div>
                    <span className="text-amber-700">Booking Date:</span>
                    <div className="font-medium text-amber-900">
                      {new Date(selectedBooking.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-amber-700">Total Amount:</span>
                    <div className="font-bold text-amber-900">₹{selectedBooking.finalAmount}</div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Location Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-blue-700">Pickup Location:</span>
                    <div className="font-medium text-blue-900">
                      {selectedBooking.fromLocation ? (
                        <div>
                          <div>{selectedBooking.fromLocation.city}, {selectedBooking.fromLocation.district}, {selectedBooking.fromLocation.state}</div>
                          {selectedBooking.fromLocation.pinCode && (
                            <div className="text-sm text-blue-600">PIN: {selectedBooking.fromLocation.pinCode}</div>
                          )}
                        </div>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Dropoff Location:</span>
                    <div className="font-medium text-blue-900">
                      {selectedBooking.toLocation ? (
                        <div>
                          <div>{selectedBooking.toLocation.city}, {selectedBooking.toLocation.district}, {selectedBooking.toLocation.state}</div>
                          {selectedBooking.toLocation.pinCode && (
                            <div className="text-sm text-blue-600">PIN: {selectedBooking.toLocation.pinCode}</div>
                          )}
                        </div>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Distance:</span>
                    <div className="font-medium text-blue-900">{selectedBooking.distance} km</div>
                  </div>
                </div>
              </div>

              {/* Vehicle & Driver Info */}
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-3">Vehicle & Driver</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Vehicle:</span>
                    <div className="font-medium text-green-900">{selectedBooking.vehicleId?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Vehicle Type:</span>
                    <div className="font-medium text-green-900 capitalize">
                      {selectedBooking.vehicleId?.type?.replace('-', ' ') || 'N/A'}
                    </div>
                  </div>
                  {selectedBooking.driverId && (
                    <>
                      <div>
                        <span className="text-green-700">Driver ID:</span>
                        <div className="font-medium text-green-900">{selectedBooking.driverId}</div>
                      </div>
                      <div>
                        <span className="text-green-700">Driver Contact:</span>
                        <div className="font-medium text-green-900">{selectedBooking.driverPhone || 'N/A'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tracking Information */}
              {selectedBooking.trackingSteps && selectedBooking.trackingSteps.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">Tracking History</h4>
                  <div className="space-y-2">
                    {selectedBooking.trackingSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className={`w-3 h-3 rounded-full ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <div className="font-medium text-purple-900">{getStatusText(step.step)}</div>
                          {step.timestamp && (
                            <div className="text-purple-700">
                              {new Date(step.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors"
              >
                Close
              </motion.button>
              {selectedBooking.status !== 'delivered' && selectedBooking.status !== 'cancelled' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowDetailsModal(false);
                    window.location.href = `/order-tracking?id=${selectedBooking.bookingId}`;
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Track Order
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderHistory;