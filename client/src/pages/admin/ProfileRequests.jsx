import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  MapPin,
  Home,
  Wheat,
  Calendar,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const ProfileRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/profile-requests`);
      setRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load profile change requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessing(requestId);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/profile-requests/${requestId}/approve`);
      
      setSuccess('Profile change request approved successfully!');
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessing(requestId);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/profile-requests/${requestId}/reject`, {
        reason: rejectReason
      });
      
      setSuccess('Profile change request rejected');
      setShowRejectModal(null);
      setRejectReason('');
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#5B9FBF]/20 border-t-[#5B9FBF] rounded-full"
        />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[#2C5F7C] mb-2">Profile Change Requests</h1>
        <p className="text-[#4A7C99]">Review and approve farmer profile update requests</p>
      </motion.div>

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

      {/* Requests List */}
      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/40 backdrop-blur-xl rounded-3xl p-12 border border-[#5B9FBF]/20 shadow-xl text-center"
        >
          <Clock className="w-20 h-20 text-[#4A7C99]/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#2C5F7C] mb-2">No Pending Requests</h3>
          <p className="text-[#4A7C99]">All profile change requests have been reviewed</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {requests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-[#5B9FBF]/20 shadow-xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#5B9FBF] rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2C5F7C]">
                      {request.farmer?.name || 'Unknown Farmer'}
                    </h3>
                    <p className="text-sm text-[#4A7C99]">
                      Farmer ID: {request.farmer?.farmerId || 'N/A'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-[#4A7C99]" />
                      <span className="text-xs text-[#4A7C99]">
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Request Summary */}
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-700">
                        Requesting changes to: {Object.keys(request.changes || {}).filter(field => {
                          // Filter out empty cropTypes arrays
                          if (field === 'cropTypes' && Array.isArray(request.changes[field]) && request.changes[field].length === 0) {
                            return false;
                          }
                          return true;
                        }).map(field => {
                          if (field === 'pinCode') return 'PIN Code';
                          if (field === 'landSize') return 'Land Size';
                          if (field === 'cropTypes') return 'Crop Types';
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
                {request.changes.name && (
                  <div className="bg-white/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-[#4A7C99]" />
                      <span className="text-sm font-medium text-[#4A7C99]">Name</span>
                    </div>
                    <div className="text-[#2C5F7C] font-semibold">{request.changes.name}</div>
                  </div>
                )}

                {request.changes.state && (
                  <div className="bg-white/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#4A7C99]" />
                      <span className="text-sm font-medium text-[#4A7C99]">State</span>
                    </div>
                    <div className="text-[#2C5F7C] font-semibold">{request.changes.state}</div>
                  </div>
                )}

                {request.changes.district && (
                  <div className="bg-white/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#4A7C99]" />
                      <span className="text-sm font-medium text-[#4A7C99]">District</span>
                    </div>
                    <div className="text-[#2C5F7C] font-semibold">{request.changes.district}</div>
                  </div>
                )}

                {request.changes.city && (
                  <div className="bg-white/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#4A7C99]" />
                      <span className="text-sm font-medium text-[#4A7C99]">City</span>
                    </div>
                    <div className="text-[#2C5F7C] font-semibold">{request.changes.city}</div>
                  </div>
                )}

                {request.changes.pinCode && (
                  <div className="bg-white/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#4A7C99]" />
                      <span className="text-sm font-medium text-[#4A7C99]">PIN Code</span>
                    </div>
                    <div className="text-[#2C5F7C] font-semibold">{request.changes.pinCode}</div>
                  </div>
                )}

                {request.changes.landSize && (
                  <div className="bg-white/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-[#4A7C99]" />
                      <span className="text-sm font-medium text-[#4A7C99]">Land Size</span>
                    </div>
                    <div className="text-[#2C5F7C] font-semibold">{request.changes.landSize} acres</div>
                  </div>
                )}

                {request.changes.cropTypes && request.changes.cropTypes.length > 0 && (
                  <div className="bg-white/30 rounded-xl p-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Wheat className="w-4 h-4 text-[#4A7C99]" />
                      <span className="text-sm font-medium text-[#4A7C99]">Crop Types</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.changes.cropTypes.map((crop, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApprove(request._id)}
                  disabled={processing === request._id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {processing === request._id ? 'Processing...' : 'Approve'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRejectModal(request._id)}
                  disabled={processing === request._id}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  {processing === request._id ? 'Processing...' : 'Reject'}
                </motion.button>
              </div>
            </motion.div>
          ))}
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
                <h3 className="text-xl font-bold text-gray-900">Reject Request</h3>
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
                placeholder="Please provide a reason for rejecting this request..."
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
                onClick={() => handleReject(showRejectModal)}
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
  );
};

export default ProfileRequests;
