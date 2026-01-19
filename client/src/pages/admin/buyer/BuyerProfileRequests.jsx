import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  MapPin,
  Calendar,
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  Gavel,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';
import AdminBuyerLayout from './AdminBuyerLayout';

const BuyerProfileRequests = () => {
  const { colors } = useAdminTheme();
  const [profileRequests, setProfileRequests] = useState([]);
  const [bidLimitRequests, setBidLimitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'bidlimit'

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Fetch both profile requests and bid limit requests
      const [profileResponse, bidLimitResponse] = await Promise.all([
        axios.get(`${API_URL}/api/admin/profile-requests`),
        axios.get(`${API_URL}/api/admin/bid-limit-requests`)
      ]);
      
      // Filter only buyer profile requests
      const buyerProfileRequests = profileResponse.data.filter(request => 
        request.user?.role === 'buyer' || request.user?.buyerId
      );
      
      setProfileRequests(buyerProfileRequests);
      setBidLimitRequests(bidLimitResponse.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load buyer requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProfile = async (requestId) => {
    setProcessing(requestId);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/profile-requests/${requestId}/approve`);
      
      setSuccess('Buyer profile change request approved successfully!');
      fetchAllRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectProfile = async (requestId) => {
    setProcessing(requestId);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/profile-requests/${requestId}/reject`, {
        reason: rejectReason
      });
      
      setSuccess('Buyer profile change request rejected');
      setShowRejectModal(null);
      setRejectReason('');
      fetchAllRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveBidLimit = async (requestId) => {
    setProcessing(requestId);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/bid-limit-requests/${requestId}/approve`, {
        adminNotes: 'Approved by admin'
      });
      
      setSuccess('Bid limit increase request approved successfully!');
      fetchAllRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve bid limit request');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectBidLimit = async (requestId) => {
    setProcessing(requestId);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/bid-limit-requests/${requestId}/reject`, {
        reason: rejectReason
      });
      
      setSuccess('Bid limit increase request rejected');
      setShowRejectModal(null);
      setRejectReason('');
      fetchAllRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject bid limit request');
    } finally {
      setProcessing(null);
    }
  };

  const totalRequests = profileRequests.length + bidLimitRequests.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#FF4757]/20 border-t-[#FF4757] rounded-full"
        />
      </div>
    );
  }

  return (
    <AdminBuyerLayout currentPage="profile-requests">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#FF4757] mb-2">Buyer Requests Management</h1>
          <p className="text-[#FF6B7A]">Review and approve buyer profile changes and bid limit requests</p>
          
          {/* Request Summary */}
          <div className="flex gap-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <span className="text-sm font-medium text-blue-700">
                Total Pending: {totalRequests}
              </span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <span className="text-sm font-medium text-green-700">
                Profile Changes: {profileRequests.length}
              </span>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
              <span className="text-sm font-medium text-purple-700">
                Bid Limit Requests: {bidLimitRequests.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#FF4757] text-white shadow-lg'
                : 'bg-white text-[#FF4757] border border-[#FF4757]/20 hover:bg-[#FF4757]/5'
            }`}
          >
            <User className="w-5 h-5" />
            Profile Changes ({profileRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('bidlimit')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'bidlimit'
                ? 'bg-[#FF4757] text-white shadow-lg'
                : 'bg-white text-[#FF4757] border border-[#FF4757]/20 hover:bg-[#FF4757]/5'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Bid Limit Requests ({bidLimitRequests.length})
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Profile Change Requests Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {profileRequests.length === 0 ? (
              <AdminGlassCard className="text-center py-12">
                <User className="w-20 h-20 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>No Pending Profile Requests</h3>
                <p style={{ color: colors.textSecondary }}>All buyer profile change requests have been reviewed</p>
              </AdminGlassCard>
            ) : (
              profileRequests.map((request, index) => (
                <AdminGlassCard key={request._id} delay={index * 0.1}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-[#FF4757]">
                        <ShoppingCart className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                          {request.user?.name || request.farmer?.name || 'Unknown Buyer'}
                        </h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          Buyer ID: {request.user?.buyerId || request.farmer?.farmerId || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" style={{ color: colors.textSecondary }} />
                          <span className="text-xs" style={{ color: colors.textSecondary }}>
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2 p-2 rounded-lg bg-[#FF4757]/10">
                          <p className="text-xs font-medium text-[#FF4757]">
                            Requesting changes to: {Object.keys(request.changes || {}).map(field => {
                              if (field === 'pinCode') return 'PIN Code';
                              return field.charAt(0).toUpperCase() + field.slice(1);
                            }).join(', ') || 'No changes specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pending
                    </div>
                  </div>

                  {/* Changes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {Object.entries(request.changes || {}).map(([field, value]) => (
                      <div key={field} className="rounded-xl p-4" style={{ backgroundColor: colors.cardBackground }}>
                        <div className="flex items-center gap-2 mb-2">
                          {field === 'name' ? <User className="w-4 h-4" style={{ color: colors.textSecondary }} /> : 
                           <MapPin className="w-4 h-4" style={{ color: colors.textSecondary }} />}
                          <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                            {field === 'pinCode' ? 'PIN Code' : field.charAt(0).toUpperCase() + field.slice(1)}
                          </span>
                        </div>
                        <div className="font-semibold" style={{ color: colors.textPrimary }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApproveProfile(request._id)}
                      disabled={processing === request._id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processing === request._id ? 'Processing...' : 'Approve'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowRejectModal({ id: request._id, type: 'profile' })}
                      disabled={processing === request._id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </motion.button>
                  </div>
                </AdminGlassCard>
              ))
            )}
          </div>
        )}

        {/* Bid Limit Requests Tab */}
        {activeTab === 'bidlimit' && (
          <div className="space-y-6">
            {bidLimitRequests.length === 0 ? (
              <AdminGlassCard className="text-center py-12">
                <Gavel className="w-20 h-20 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>No Pending Bid Limit Requests</h3>
                <p style={{ color: colors.textSecondary }}>All bid limit increase requests have been reviewed</p>
              </AdminGlassCard>
            ) : (
              bidLimitRequests.map((request, index) => (
                <AdminGlassCard key={request._id} delay={index * 0.1}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-purple-600">
                        <Gavel className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                          {request.buyerName}
                        </h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          Buyer ID: {request.buyerId}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" style={{ color: colors.textSecondary }} />
                          <span className="text-xs" style={{ color: colors.textSecondary }}>
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pending
                    </div>
                  </div>

                  {/* Bid Limit Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl p-4" style={{ backgroundColor: colors.cardBackground }}>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Current Limit</span>
                      </div>
                      <div className="font-semibold text-lg" style={{ color: colors.textPrimary }}>
                        ₹{request.currentLimit?.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-xl p-4" style={{ backgroundColor: colors.cardBackground }}>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Requested Limit</span>
                      </div>
                      <div className="font-semibold text-lg text-green-600">
                        ₹{request.requestedLimit?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Increase Amount */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Increase Amount:</span>
                      <span className="text-lg font-bold text-blue-700">
                        +₹{(request.requestedLimit - request.currentLimit)?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Reason for Request:</h4>
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                      <p style={{ color: colors.textPrimary }}>{request.reason}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApproveBidLimit(request._id)}
                      disabled={processing === request._id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processing === request._id ? 'Processing...' : 'Approve Increase'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowRejectModal({ id: request._id, type: 'bidlimit' })}
                      disabled={processing === request._id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Request
                    </motion.button>
                  </div>
                </AdminGlassCard>
              ))
            )}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Reject {showRejectModal.type === 'profile' ? 'Profile Change' : 'Bid Limit'} Request
                  </h3>
                  <p className="text-sm text-gray-600">Provide a reason for rejection</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={`Please provide a reason for rejecting this ${showRejectModal.type === 'profile' ? 'profile change' : 'bid limit'} request...`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showRejectModal.type === 'profile') {
                      handleRejectProfile(showRejectModal.id);
                    } else {
                      handleRejectBidLimit(showRejectModal.id);
                    }
                  }}
                  disabled={!rejectReason.trim() || processing}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Rejecting...' : 'Reject Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminBuyerLayout>
  );
};

export default BuyerProfileRequests;