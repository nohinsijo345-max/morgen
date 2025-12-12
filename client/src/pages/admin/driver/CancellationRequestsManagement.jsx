import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  AlertCircle,
  Calendar,
  IndianRupee,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import axios from 'axios';

const CancellationRequestsManagement = () => {
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchCancellationRequests();
  }, []);

  const fetchCancellationRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/transport/bookings`);
      
      // Filter for cancellation requests
      const requests = response.data.filter(booking => 
        booking.status === 'cancellation_requested' && 
        booking.cancellationRequest?.status === 'pending'
      );
      
      setCancellationRequests(requests);
    } catch (error) {
      console.error('Failed to fetch cancellation requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (bookingId, action) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.patch(`${API_URL}/api/transport/bookings/${bookingId}/cancel-review`, {
        action,
        reviewNotes,
        reviewedBy: 'Admin'
      });
      
      alert(`Cancellation request ${action} successfully!`);
      setShowDetailsModal(false);
      setReviewNotes('');
      fetchCancellationRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to review cancellation request:', error);
      alert('Failed to review cancellation request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'cancellation_requested': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
            <h1 className="text-3xl font-bold text-[#2C5F7C]">Cancellation Requests</h1>
            <p className="text-[#4A7C99] mt-1">Review and manage transport cancellation requests</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-[#2C5F7C]">{cancellationRequests.length}</div>
          <div className="text-sm text-[#4A7C99]">Pending Requests</div>
        </div>
      </div>

      {/* Cancellation Requests List */}
      <div className="space-y-4">
        {cancellationRequests.length > 0 ? (
          cancellationRequests.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-[#5B9FBF]/20 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2C5F7C]">{booking.bookingId}</h3>
                    <p className="text-sm text-[#4A7C99]">
                      Requested: {new Date(booking.cancellationRequest.requestedAt).toLocaleDateString('en-IN', {
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
                    Cancellation Requested
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedRequest(booking);
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
                    <div className="font-medium text-[#2C5F7C]">{booking.farmerName}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#4A7C99]" />
                  <div>
                    <div className="text-xs text-[#4A7C99]">Amount</div>
                    <div className="font-bold text-[#2C5F7C]">₹{booking.finalAmount}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4A7C99]" />
                  <div>
                    <div className="text-xs text-[#4A7C99]">Route</div>
                    <div className="font-medium text-[#2C5F7C] text-sm">
                      {booking.fromLocation?.city} → {booking.toLocation?.city}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4A7C99]" />
                  <div>
                    <div className="text-xs text-[#4A7C99]">Reason</div>
                    <div className="font-medium text-[#2C5F7C] text-sm">
                      {booking.cancellationRequest.reason}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-[#4A7C99]">
                  Driver: {booking.driverId || 'Not assigned'}
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedRequest(booking);
                      setShowDetailsModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Review Request
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
            <AlertCircle className="w-16 h-16 text-[#5B9FBF]/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2C5F7C] mb-2">No Cancellation Requests</h3>
            <p className="text-[#4A7C99]">All transport bookings are proceeding as planned.</p>
          </motion.div>
        )}
      </div>

      {/* Review Modal */}
      {showDetailsModal && selectedRequest && (
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
              <h3 className="text-2xl font-bold text-[#2C5F7C]">Review Cancellation Request</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setReviewNotes('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-[#D4E7F0]/30 rounded-xl p-4">
                <h4 className="font-semibold text-[#2C5F7C] mb-3">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#4A7C99]">Booking ID:</span>
                    <div className="font-medium text-[#2C5F7C]">{selectedRequest.bookingId}</div>
                  </div>
                  <div>
                    <span className="text-[#4A7C99]">Customer:</span>
                    <div className="font-medium text-[#2C5F7C]">{selectedRequest.farmerName}</div>
                  </div>
                  <div>
                    <span className="text-[#4A7C99]">Amount:</span>
                    <div className="font-bold text-[#2C5F7C]">₹{selectedRequest.finalAmount}</div>
                  </div>
                  <div>
                    <span className="text-[#4A7C99]">Driver:</span>
                    <div className="font-medium text-[#2C5F7C]">{selectedRequest.driverId || 'Not assigned'}</div>
                  </div>
                </div>
              </div>

              {/* Cancellation Details */}
              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-3">Cancellation Request</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-red-700">Requested By:</span>
                    <div className="font-medium text-red-900">{selectedRequest.cancellationRequest.requestedBy}</div>
                  </div>
                  <div>
                    <span className="text-red-700">Requested At:</span>
                    <div className="font-medium text-red-900">
                      {new Date(selectedRequest.cancellationRequest.requestedAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-red-700">Reason:</span>
                    <div className="font-medium text-red-900">{selectedRequest.cancellationRequest.reason}</div>
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium text-[#2C5F7C] mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5F7C] focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowDetailsModal(false);
                  setReviewNotes('');
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReviewRequest(selectedRequest._id, 'denied')}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Deny Request
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReviewRequest(selectedRequest._id, 'approved')}
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Request
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CancellationRequestsManagement;