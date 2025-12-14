import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Package,
  IndianRupee,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Bell
} from 'lucide-react';
import axios from 'axios';

const DriverOrderDetails = ({ user, onBack }) => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);


  useEffect(() => {
    fetchOrders();
    fetchNotifications();
  }, []);

  const fetchOrders = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/driver/bookings/${user.driverId}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // This would need to be implemented to fetch driver notifications
      // For now, we'll simulate notifications
      setNotifications([]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleAcceptOrder = async (bookingId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log(`🔄 Attempting to accept order ${bookingId} for driver ${user.driverId}`);
      
      const response = await axios.patch(`${API_URL}/api/driver/orders/${bookingId}/accept`, {
        driverId: user.driverId
      });
      
      console.log('✅ Order accepted successfully:', response.data);
      alert('Order accepted successfully!');
      fetchOrders(); // Refresh the list
      setShowDetailsModal(false);
    } catch (error) {
      console.error('❌ Failed to accept order:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Failed to accept order. Please try again.';
      alert(errorMessage);
    }
  };

  const handleRejectOrder = async (bookingId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log(`🔄 Attempting to reject order ${bookingId} for driver ${user.driverId}`);
      
      const response = await axios.patch(`${API_URL}/api/driver/orders/${bookingId}/reject`, {
        driverId: user.driverId,
        reason
      });
      
      console.log('✅ Order rejected successfully:', response.data);
      alert('Order rejected successfully!');
      fetchOrders(); // Refresh the list
      setShowDetailsModal(false);
    } catch (error) {
      console.error('❌ Failed to reject order:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Failed to reject order. Please try again.';
      alert(errorMessage);
    }
  };

  const handleStatusUpdate = async (bookingId, step, location, notes) => {
    // Validate inputs
    if (!location || !location.trim()) {
      alert('Please enter a valid location');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log(`🔄 Updating status for booking ${bookingId}:`, { step, location: location.trim(), notes });
      
      const response = await axios.patch(`${API_URL}/api/driver/bookings/${bookingId}/update-status`, {
        step,
        location: location.trim(),
        notes: notes || `${step.replace('_', ' ')} completed`
      });
      
      console.log('✅ Status updated successfully:', response.data);
      
      // Show success message with step details
      const stepNames = {
        'pickup_started': 'Pickup Started',
        'order_picked_up': 'Order Picked Up',
        'in_transit': 'In Transit',
        'delivered': 'Delivered'
      };
      alert(`✅ ${stepNames[step]} - Status updated successfully!`);
      
      // Refresh the orders list
      await fetchOrders();
      
      // Update the selected order if it's the same one
      if (selectedOrder && selectedOrder.bookingId === bookingId) {
        const updatedOrders = await axios.get(`${API_URL}/api/driver/bookings/${user.driverId}`);
        const updatedOrder = updatedOrders.data.find(o => o.bookingId === bookingId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to update status. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || 'Invalid request. Please check the order status.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Order not found. Please refresh and try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'order_accepted': 'bg-green-100 text-green-800 border-green-200',
      'order_processing': 'bg-purple-100 text-purple-800 border-purple-200',
      'pickup_started': 'bg-orange-100 text-orange-800 border-orange-200',
      'order_picked_up': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'in_transit': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'order_accepted': 'Order Accepted',
      'order_processing': 'Processing',
      'pickup_started': 'Pickup Started',
      'order_picked_up': 'Picked Up',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
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
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-amber-700" />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold text-amber-900">My Orders</h1>
                <p className="text-sm text-amber-700">Manage your assigned orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {/* Future notification functionality */}}
                className="p-3 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors relative"
              >
                <Bell className="w-5 h-5 text-amber-700" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{notifications.length}</span>
                  </div>
                )}
              </motion.button>

              <div className="text-right">
                <div className="text-lg font-bold text-amber-900">{orders.length}</div>
                <div className="text-sm text-amber-700">Total Orders</div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Orders List */}
      <div className="px-6 py-8 space-y-4">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-900">{order.bookingId}</h3>
                    <p className="text-sm text-amber-700">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-2 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs text-amber-700">Customer</div>
                    <div className="font-medium text-amber-900">{order.farmerName}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs text-amber-700">Amount</div>
                    <div className="font-bold text-amber-900">₹{order.finalAmount}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs text-amber-700">Route</div>
                    <div className="font-medium text-amber-900 text-sm">
                      {order.fromLocation?.city} → {order.toLocation?.city}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-amber-700">
                  Status: {getStatusText(order.status)}
                </div>
                
                <div className="flex gap-3">
                  {order.status === 'confirmed' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptOrder(order.bookingId)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRejectOrder(order.bookingId)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </motion.button>
                    </>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    View Details
                  </motion.button>
                </div>
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
            <h3 className="text-xl font-semibold text-amber-900 mb-2">No Orders Found</h3>
            <p className="text-amber-700">You don't have any assigned orders yet.</p>
          </motion.div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-900">Order Details & Tracking</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Information */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Order Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-amber-700">Order ID:</span>
                    <div className="font-medium text-amber-900">{selectedOrder.bookingId}</div>
                  </div>
                  <div>
                    <span className="text-amber-700">Status:</span>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </div>
                  </div>
                  <div>
                    <span className="text-amber-700">Customer:</span>
                    <div className="font-medium text-amber-900">{selectedOrder.farmerName}</div>
                  </div>
                  <div>
                    <span className="text-amber-700">Amount:</span>
                    <div className="font-bold text-amber-900">₹{selectedOrder.finalAmount}</div>
                  </div>
                  {selectedOrder.driverInfo && (
                    <div>
                      <span className="text-amber-700">Assigned Driver:</span>
                      <div className="font-medium text-amber-900">{selectedOrder.driverInfo.name}</div>
                      <div className="text-xs text-amber-600">{selectedOrder.driverInfo.phone}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cargo Information */}
              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="font-semibold text-orange-900 mb-3">Cargo Information</h4>
                <div className="text-sm">
                  <span className="text-orange-700">What's being transported:</span>
                  <div className="font-medium text-orange-900 mt-2 p-3 bg-white rounded-lg border border-orange-200">
                    {selectedOrder.cargoDescription || 'No description provided'}
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div className="text-sm mt-3">
                    <span className="text-orange-700">Additional Notes:</span>
                    <div className="font-medium text-orange-900 mt-1 p-3 bg-white rounded-lg border border-orange-200">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Tracking */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Order Tracking</h4>
                <div className="space-y-3">
                  {selectedOrder.trackingSteps && selectedOrder.trackingSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        step.status === 'completed' ? 'bg-green-500' : 
                        step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-blue-900">{getStatusText(step.step)}</div>
                        {step.timestamp && (
                          <div className="text-xs text-blue-700">
                            {new Date(step.timestamp).toLocaleString()}
                          </div>
                        )}
                        {step.notes && (
                          <div className="text-xs text-blue-600">
                            {step.notes.includes('driver DRV') && selectedOrder.driverInfo ? 
                              step.notes.replace(/driver DRV\d+/g, `driver ${selectedOrder.driverInfo.name}`) : 
                              step.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Actions */}
              {(selectedOrder.status === 'order_processing' || selectedOrder.status === 'order_accepted' || selectedOrder.status === 'pickup_started' || selectedOrder.status === 'order_picked_up' || selectedOrder.status === 'in_transit') && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-3">Update Order Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const location = prompt('Enter pickup location:');
                        if (location && location.trim()) {
                          handleStatusUpdate(selectedOrder.bookingId, 'pickup_started', location.trim(), 'Pickup started');
                        }
                      }}
                      disabled={selectedOrder.status !== 'order_processing' && selectedOrder.status !== 'order_accepted'}
                      className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 disabled:from-amber-500 disabled:to-orange-600 disabled:cursor-not-allowed disabled:opacity-70 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      🚚 Start Pickup
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const location = prompt('Enter pickup location:');
                        if (location && location.trim()) {
                          handleStatusUpdate(selectedOrder.bookingId, 'order_picked_up', location.trim(), 'Order picked up');
                        }
                      }}
                      disabled={selectedOrder.status !== 'pickup_started'}
                      className="bg-gradient-to-r from-yellow-700 to-amber-800 hover:from-yellow-800 hover:to-amber-900 disabled:from-yellow-500 disabled:to-amber-600 disabled:cursor-not-allowed disabled:opacity-70 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      📦 Mark Picked Up
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const location = prompt('Enter current location:');
                        if (location && location.trim()) {
                          handleStatusUpdate(selectedOrder.bookingId, 'in_transit', location.trim(), 'In transit');
                        }
                      }}
                      disabled={selectedOrder.status !== 'order_picked_up'}
                      className="bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 disabled:from-orange-500 disabled:to-red-600 disabled:cursor-not-allowed disabled:opacity-70 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      🚛 In Transit
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const location = prompt('Enter delivery location:');
                        if (location && location.trim()) {
                          handleStatusUpdate(selectedOrder.bookingId, 'delivered', location.trim(), 'Delivered successfully');
                        }
                      }}
                      disabled={selectedOrder.status !== 'in_transit'}
                      className="bg-gradient-to-r from-amber-700 to-yellow-800 hover:from-amber-800 hover:to-yellow-900 disabled:from-amber-500 disabled:to-yellow-600 disabled:cursor-not-allowed disabled:opacity-70 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      ✅ Mark Delivered
                    </motion.button>
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
              
              {selectedOrder.status === 'confirmed' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRejectOrder(selectedOrder.bookingId)}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Order
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAcceptOrder(selectedOrder.bookingId)}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Order
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DriverOrderDetails;