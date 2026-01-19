import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import { UserSession } from '../../utils/userSession';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [filter, setFilter] = useState('all');

  // Get theme with safe fallback
  let colors = {
    background: '#ffffff',
    headerBg: '#ffffff',
    headerBorder: '#e5e7eb',
    surface: '#f9fafb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    primary: '#10B981',
    primaryLight: '#E6FFFA',
    border: '#e5e7eb',
    backgroundCard: '#ffffff'
  };

  try {
    const theme = useTheme();
    if (theme && theme.colors) {
      colors = theme.colors;
      console.log('✅ Theme loaded successfully for FarmerOrders');
    }
  } catch (err) {
    console.error('⚠️ Theme error (using fallback):', err);
  }

  const farmerUser = UserSession.getCurrentUser('farmer');

  const fetchOrders = async () => {
    try {
      console.log('🔄 Fetching orders for farmer:', farmerUser?.farmerId);
      setLoading(true);
      setError(null);
      
      if (!farmerUser?.farmerId) {
        setError('Farmer ID not found. Please login again.');
        setLoading(false);
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const endpoint = `/api/orders/farmer/${farmerUser.farmerId}`;
      
      console.log('📡 Fetching from:', `${API_URL}${endpoint}`);
      
      const response = await axios.get(`${API_URL}${endpoint}`);
      
      console.log('✅ Orders fetch successful:', response.data);
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      console.error('❌ Orders fetch failed:', err);
      setError(`Failed to load orders: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 FarmerOrders component mounted');
    fetchOrders();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => {
      console.log('🛑 FarmerOrders component unmounted');
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#6B7280';
      default: return colors.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Awaiting Response';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleRespond = (order, action) => {
    setSelectedOrder(order);
    setResponseMessage(action === 'approve' ? 'Order approved. Please contact me to arrange pickup.' : '');
    setShowResponseModal(true);
  };

  const submitResponse = async (action) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      await axios.post(`${API_URL}/api/orders/respond/${selectedOrder.orderId}`, {
        action,
        message: responseMessage,
        farmerId: farmerUser?.farmerId
      });

      alert(`Order ${action}d successfully!`);
      fetchOrders(); // Refresh orders
      setShowResponseModal(false);
      setShowDetails(false);
      setResponseMessage('');
    } catch (error) {
      console.error(`Failed to ${action} order:`, error);
      alert(`Failed to ${action} order. Please try again.`);
    }
  };

  const markAsCompleted = async (orderId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      await axios.post(`${API_URL}/api/orders/complete/${orderId}`, {
        userId: farmerUser?.farmerId,
        userType: 'farmer'
      });

      alert('Order marked as completed successfully!');
      fetchOrders(); // Refresh orders
      setShowDetails(false);
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('Failed to mark order as completed. Please try again.');
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
        <p className="mt-4" style={{ color: colors.textSecondary }}>Loading purchase requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Package className="w-16 h-16 mb-4" style={{ color: colors.textMuted }} />
        <p className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>Unable to Load Orders</p>
        <p className="mb-4" style={{ color: colors.textSecondary }}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchOrders}
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
                Purchase Requests
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Manage crop purchase requests from buyers
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Requests', count: orders.length },
            { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: orders.filter(o => o.status === 'approved').length },
            { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
            { key: 'rejected', label: 'Rejected', count: orders.filter(o => o.status === 'rejected').length }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap ${
                filter === tab.key ? 'shadow-lg' : ''
              }`}
              style={{
                backgroundColor: filter === tab.key ? colors.primary : colors.surface,
                color: filter === tab.key ? '#ffffff' : colors.textSecondary,
                border: `1px solid ${filter === tab.key ? colors.primary : colors.border}`
              }}
            >
              {tab.label} ({tab.count})
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        {filteredOrders.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No purchase requests found
            </h3>
            <p style={{ color: colors.textSecondary }}>
              {filter === 'all' 
                ? 'No buyers have requested to purchase your crops yet.'
                : `No ${filter} requests found.`
              }
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl p-6 border shadow-lg cursor-pointer"
                style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}
                onClick={() => handleViewDetails(order)}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" style={{ color: colors.primary }} />
                    <span className="font-bold text-sm" style={{ color: colors.textPrimary }}>
                      {order.orderId}
                    </span>
                  </div>
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ 
                      backgroundColor: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}
                  >
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </div>
                </div>

                {/* Crop Details */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-1" style={{ color: colors.textPrimary }}>
                    {order.cropDetails.name}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                    {order.quantity} {order.cropDetails.unit} • Grade {order.cropDetails.quality}
                  </p>
                  <div className="text-lg font-bold" style={{ color: colors.primary }}>
                    ₹{order.totalAmount.toLocaleString()}
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" style={{ color: colors.textMuted }} />
                    <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {order.buyerName}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full" 
                          style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                      {order.buyerType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: colors.textMuted }} />
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      {order.buyerContact.address.district}, {order.buyerContact.address.state}
                    </span>
                  </div>
                </div>

                {/* Order Date */}
                <div className="flex items-center gap-2 text-xs mb-4" style={{ color: colors.textMuted }}>
                  <Calendar className="w-3 h-3" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>

                {/* Action Buttons for Pending Orders */}
                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRespond(order, 'reject');
                      }}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium border"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#EF4444',
                        color: '#EF4444'
                      }}
                    >
                      Reject
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRespond(order, 'approve');
                      }}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                    >
                      Approve
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: colors.backgroundCard }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                Purchase Request Details
              </h3>
              <div 
                className="flex items-center gap-2 px-3 py-1 rounded-lg font-medium"
                style={{ 
                  backgroundColor: `${getStatusColor(selectedOrder.status)}20`,
                  color: getStatusColor(selectedOrder.status)
                }}
              >
                {getStatusIcon(selectedOrder.status)}
                {getStatusText(selectedOrder.status)}
              </div>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>Order ID</label>
                <p className="font-bold" style={{ color: colors.textPrimary }}>{selectedOrder.orderId}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>Request Date</label>
                <p className="font-bold" style={{ color: colors.textPrimary }}>
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Crop Details */}
            <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <h4 className="font-bold mb-3" style={{ color: colors.textPrimary }}>Crop Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Crop Name</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>{selectedOrder.cropDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Category</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>{selectedOrder.cropDetails.category}</p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Quantity Requested</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                    {selectedOrder.quantity} {selectedOrder.cropDetails.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Quality Grade</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>Grade {selectedOrder.cropDetails.quality}</p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Price per {selectedOrder.cropDetails.unit}</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>₹{selectedOrder.pricePerUnit}</p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: colors.textSecondary }}>Total Amount</label>
                  <p className="font-bold text-lg" style={{ color: colors.primary }}>₹{selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Buyer Contact */}
            <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <h4 className="font-bold mb-3" style={{ color: colors.textPrimary }}>Buyer Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      {selectedOrder.buyerName}
                      <span className="ml-2 text-xs px-2 py-1 rounded-full" 
                            style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                        {selectedOrder.buyerType} buyer
                      </span>
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{selectedOrder.buyerContact.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: colors.primary }} />
                  <p className="font-medium" style={{ color: colors.textPrimary }}>{selectedOrder.buyerContact.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                  <div>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      {selectedOrder.buyerContact.address.city}, {selectedOrder.buyerContact.address.district}
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {selectedOrder.buyerContact.address.state} - {selectedOrder.buyerContact.address.pinCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Message */}
            {selectedOrder.message && (
              <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <h4 className="font-bold mb-2" style={{ color: colors.textPrimary }}>Purchase Message</h4>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{selectedOrder.message}</p>
              </div>
            )}

            {/* Your Response */}
            {selectedOrder.farmerResponse && (
              <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <h4 className="font-bold mb-2" style={{ color: colors.textPrimary }}>Your Response</h4>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{selectedOrder.farmerResponse.message}</p>
                <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                  Responded on {new Date(selectedOrder.farmerResponse.respondedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDetails(false)}
                className="flex-1 py-3 rounded-xl font-semibold border"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: colors.border,
                  color: colors.textSecondary
                }}
              >
                Close
              </motion.button>

              {selectedOrder.status === 'pending' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRespond(selectedOrder, 'reject')}
                    className="flex-1 py-3 rounded-xl font-semibold"
                    style={{ backgroundColor: '#EF4444', color: '#ffffff' }}
                  >
                    Reject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRespond(selectedOrder, 'approve')}
                    className="flex-1 py-3 rounded-xl font-semibold"
                    style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                  >
                    Approve
                  </motion.button>
                </>
              )}

              {selectedOrder.status === 'approved' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => markAsCompleted(selectedOrder.orderId)}
                  className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Completed
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedOrder && (
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
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              Respond to Purchase Request
            </h3>
            
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                Order: {selectedOrder.cropDetails.name} - {selectedOrder.quantity} {selectedOrder.cropDetails.unit}
              </p>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                Buyer: {selectedOrder.buyerName}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Response Message
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border-2"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary
                }}
                placeholder="Enter your response message..."
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResponseModal(false)}
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
                onClick={() => submitResponse('reject')}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: '#EF4444', color: '#ffffff' }}
              >
                Reject
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => submitResponse('approve')}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              >
                Approve
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FarmerOrders;