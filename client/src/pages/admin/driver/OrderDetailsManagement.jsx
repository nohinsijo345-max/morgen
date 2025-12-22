import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Package,
  IndianRupee,
  MapPin,
  User,
  CheckCircle,
  Eye,
  Truck,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import AdminGlassCard from '../../../components/AdminGlassCard';

const OrderDetailsManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assigningDriver, setAssigningDriver] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  const fetchOrders = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/transport/bookings`);
      console.log('Orders fetched:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/transport/drivers`);
      console.log('Drivers fetched:', response.data);
      setDrivers(response.data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const handleAcceptOrder = async (bookingId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      console.log(`🔍 Frontend: Attempting to accept order ${bookingId}`);
      console.log(`📋 Current selectedOrder state:`, {
        id: selectedOrder?._id,
        bookingId: selectedOrder?.bookingId,
        status: selectedOrder?.status,
        driverId: selectedOrder?.driverId
      });
      
      const response = await axios.patch(`${API_URL}/api/transport/bookings/${bookingId}/admin-accept`);
      
      alert('Order accepted successfully!');
      
      // Update the selected order status immediately
      if (selectedOrder && selectedOrder.bookingId === bookingId) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'order_accepted'
        });
      }
      
      // Refresh the orders list
      await fetchOrders();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Failed to accept order:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 'Failed to accept order. Please ensure the order has a driver assigned.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleAssignDriver = async (orderId) => {
    if (!selectedDriverId) {
      alert('Please select a driver first');
      return;
    }

    setAssigningDriver(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.patch(`${API_URL}/api/transport/bookings/${orderId}/assign-driver`, {
        driverId: selectedDriverId
      });
      
      alert('Driver assigned successfully!');
      
      // Refresh the orders list first
      await fetchOrders();
      
      // Update the selected order with the latest data from the response or refetch
      if (selectedOrder && selectedOrder._id === orderId) {
        // Fetch the updated order from the refreshed orders list
        const updatedOrders = await axios.get(`${API_URL}/api/admin/transport/bookings`);
        const updatedOrder = updatedOrders.data.find(order => order._id === orderId);
        
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
      
      setSelectedDriverId('');
    } catch (error) {
      console.error('Failed to assign driver:', error);
      alert('Failed to assign driver');
    } finally {
      setAssigningDriver(false);
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
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#2C5F7C] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="w-10 h-10 flex items-center justify-center bg-[#D4E7F0] hover:bg-[#B8D8E8] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#2C5F7C]" />
          </motion.button>
          
          <div>
            <h1 className="text-3xl font-bold text-[#2C5F7C]">Order Details Management</h1>
            <p className="text-[#4A7C99] mt-1">View and manage all transport orders</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-[#2C5F7C]">{orders.length}</div>
          <div className="text-sm text-[#4A7C99]">Total Orders</div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <AdminGlassCard
              key={order._id}
              delay={index * 0.1}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2C5F7C]">{order.bookingId}</h3>
                    <p className="text-sm text-[#4A7C99]">
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
                  {!order.driverId && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-medium">
                      No Driver
                    </span>
                  )}
                  {order.driverId && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-medium">
                      Driver Assigned
                    </span>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      // Refresh order data before showing modal
                      try {
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
                        const response = await axios.get(`${API_URL}/api/admin/transport/bookings`);
                        const freshOrder = response.data.find(o => o._id === order._id);
                        setSelectedOrder(freshOrder || order);
                      } catch (error) {
                        console.error('Failed to refresh order data:', error);
                        setSelectedOrder(order);
                      }
                      setShowDetailsModal(true);
                    }}
                    className="bg-[#D4E7F0] hover:bg-[#B8D8E8] text-[#2C5F7C] p-2 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#4A7C99]" />
                  <div>
                    <div className="text-xs text-[#4A7C99]">Customer</div>
                    <div className="font-medium text-[#2C5F7C]">{order.farmerName}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#4A7C99]" />
                  <div>
                    <div className="text-xs text-[#4A7C99]">Amount</div>
                    <div className="font-bold text-[#2C5F7C]">₹{order.finalAmount}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4A7C99]" />
                  <div>
                    <div className="text-xs text-[#4A7C99]">Route</div>
                    <div className="font-medium text-[#2C5F7C] text-sm">
                      {order.fromLocation?.city} → {order.toLocation?.city}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#4A7C99]" />
                  <div>
                    <div className="text-xs text-[#4A7C99]">Vehicle</div>
                    <div className="font-medium text-[#2C5F7C] text-sm">
                      {order.vehicleId?.name || 'Not assigned'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-[#4A7C99]">
                  Driver: {order.driverId || 'Not assigned'}
                </div>
                
                <div className="flex gap-3">
                  {!order.driverId && !['cancelled', 'completed', 'delivered'].includes(order.status) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        // Refresh order data before showing modal
                        try {
                          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
                          const response = await axios.get(`${API_URL}/api/admin/transport/bookings`);
                          const freshOrder = response.data.find(o => o._id === order._id);
                          setSelectedOrder(freshOrder || order);
                        } catch (error) {
                          console.error('Failed to refresh order data:', error);
                          setSelectedOrder(order);
                        }
                        setShowDetailsModal(true);
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Assign Driver
                    </motion.button>
                  )}
                  
                  {order.status === 'confirmed' && order.driverId && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptOrder(order.bookingId)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Order
                    </motion.button>
                  )}
                  
                  {order.status === 'confirmed' && !order.driverId && (
                    <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm border border-orange-200">
                      Assign driver first
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      // Refresh order data before showing modal
                      try {
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
                        const response = await axios.get(`${API_URL}/api/admin/transport/bookings`);
                        const freshOrder = response.data.find(o => o._id === order._id);
                        setSelectedOrder(freshOrder || order);
                      } catch (error) {
                        console.error('Failed to refresh order data:', error);
                        setSelectedOrder(order);
                      }
                      setShowDetailsModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </AdminGlassCard>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Package className="w-16 h-16 text-[#5B9FBF]/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2C5F7C] mb-2">No Orders Found</h3>
            <p className="text-[#4A7C99]">No transport orders have been placed yet.</p>
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
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#2C5F7C]">Order Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Information */}
              <div className="bg-[#D4E7F0]/30 rounded-xl p-4">
                <h4 className="font-semibold text-[#2C5F7C] mb-3">Order Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#4A7C99]">Order ID:</span>
                    <div className="font-medium text-[#2C5F7C]">{selectedOrder.bookingId}</div>
                  </div>
                  <div>
                    <span className="text-[#4A7C99]">Status:</span>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#4A7C99]">Order Date:</span>
                    <div className="font-medium text-[#2C5F7C]">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#4A7C99]">Total Amount:</span>
                    <div className="font-bold text-[#2C5F7C]">₹{selectedOrder.finalAmount}</div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Name:</span>
                    <div className="font-medium text-blue-900">{selectedOrder.farmerName}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Farmer ID:</span>
                    <div className="font-medium text-blue-900">{selectedOrder.farmerId}</div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-3">Location Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-green-700">Pickup Location:</span>
                    <div className="font-medium text-green-900">
                      {selectedOrder.fromLocation ? (
                        <div>
                          <div>{selectedOrder.fromLocation.city}, {selectedOrder.fromLocation.district}, {selectedOrder.fromLocation.state}</div>
                          {selectedOrder.fromLocation.pinCode && (
                            <div className="text-sm text-green-600">PIN: {selectedOrder.fromLocation.pinCode}</div>
                          )}
                        </div>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700">Delivery Location:</span>
                    <div className="font-medium text-green-900">
                      {selectedOrder.toLocation ? (
                        <div>
                          <div>{selectedOrder.toLocation.city}, {selectedOrder.toLocation.district}, {selectedOrder.toLocation.state}</div>
                          {selectedOrder.toLocation.pinCode && (
                            <div className="text-sm text-green-600">PIN: {selectedOrder.toLocation.pinCode}</div>
                          )}
                        </div>
                      ) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700">Distance:</span>
                    <div className="font-medium text-green-900">{selectedOrder.distance} km</div>
                  </div>
                </div>
              </div>

              {/* Cargo Information */}
              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="font-semibold text-orange-900 mb-3">Cargo Information</h4>
                <div className="text-sm">
                  <span className="text-orange-700">What's being transported:</span>
                  <div className="font-medium text-orange-900 mt-1 p-3 bg-white rounded-lg border border-orange-200">
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

              {/* Vehicle & Driver Info */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Vehicle & Driver</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-purple-700">Vehicle:</span>
                    <div className="font-medium text-purple-900">{selectedOrder.vehicleId?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-purple-700">Vehicle Type:</span>
                    <div className="font-medium text-purple-900 capitalize">
                      {selectedOrder.vehicleId?.type?.replace('-', ' ') || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-purple-700">Driver ID:</span>
                    <div className="font-medium text-purple-900">{selectedOrder.driverId || 'Not assigned'}</div>
                  </div>
                  <div>
                    <span className="text-purple-700">Expected Delivery:</span>
                    <div className="font-medium text-purple-900">
                      {selectedOrder.expectedDeliveryDate ? 
                        new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Driver Assignment Section */}
                {!selectedOrder.driverId && selectedOrder.status === 'confirmed' && (
                  <div className="border-t border-purple-200 pt-4">
                    <h5 className="font-medium text-purple-900 mb-3">Assign Driver</h5>
                    <div className="flex gap-3">
                      <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/30 text-sm transition-all"
                        disabled={assigningDriver}
                      >
                        <option value="">Select a driver...</option>
                        {drivers.map((driver) => (
                          <option key={driver._id} value={driver.driverId}>
                            {driver.name} ({driver.driverId}) - {driver.vehicleType}
                          </option>
                        ))}
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAssignDriver(selectedOrder._id)}
                        disabled={!selectedDriverId || assigningDriver}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        {assigningDriver ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4" />
                            Assign
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Admin Restrictions Notice */}
                {selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'pending' && (
                  <div className="border-t border-purple-200 pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">Driver Portal Control</span>
                      </div>
                      <p className="text-blue-700 text-xs mt-1">
                        This order is now managed by the driver portal. All tracking updates must be done by the assigned driver.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Tracking */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Order Tracking</h4>
                <div className="space-y-3">
                  {selectedOrder.trackingSteps && selectedOrder.trackingSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        step.status === 'completed' ? 'bg-green-500' : 
                        step.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-amber-900">{getStatusText(step.step)}</div>
                        {step.timestamp && (
                          <div className="text-xs text-amber-700">
                            {new Date(step.timestamp).toLocaleString()}
                          </div>
                        )}
                        {step.notes && (
                          <div className="text-xs text-amber-600">{step.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedDriverId('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </motion.button>
              
              {!selectedOrder.driverId && selectedDriverId && selectedOrder.status === 'confirmed' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAssignDriver(selectedOrder._id)}
                  disabled={assigningDriver}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {assigningDriver ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Assigning Driver...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      Assign Driver
                    </>
                  )}
                </motion.button>
              )}
              
              {selectedOrder.status === 'confirmed' && selectedOrder.driverId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAcceptOrder(selectedOrder.bookingId)}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Order
                </motion.button>
              )}
              
              {selectedOrder.status === 'confirmed' && !selectedOrder.driverId && (
                <div className="flex-1 px-6 py-3 bg-orange-100 text-orange-800 rounded-xl border border-orange-200 flex items-center justify-center">
                  Please assign a driver first
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderDetailsManagement;