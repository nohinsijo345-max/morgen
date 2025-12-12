import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowLeft, Calendar, X, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [user, setUser] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const farmerUser = localStorage.getItem('farmerUser');
    if (farmerUser) {
      const userData = JSON.parse(farmerUser);
      setUser(userData);
      fetchUpdates(userData.farmerId);
    }
  }, []);

  const fetchUpdates = async (farmerId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      // Fetch all updates for this specific farmer
      const farmerUser = localStorage.getItem('farmerUser');
      if (farmerUser) {
        const userData = JSON.parse(farmerUser);
        const response = await axios.get(`${API_URL}/api/dashboard/farmer/${userData.farmerId}`);
        setUpdates(response.data.updates || []);
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUpdate = async (updateId, event) => {
    event.stopPropagation(); // Prevent opening the modal
    setDeleting(updateId);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/updates/${updateId}`);
      
      // Remove the update from the local state
      setUpdates(updates.filter(update => update._id !== updateId));
      setSuccess('Update deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to delete update:', error);
      setError('Failed to delete update');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbef] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#082829]/20 border-t-[#082829] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbef]">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #082829 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <motion.button 
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-3 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-xl border border-[#082829]/10 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 text-[#082829]" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-[#082829]">Updates & Notifications</h1>
              <p className="text-[#082829]/60 text-sm mt-1">
                {updates.length} {updates.length === 1 ? 'message' : 'messages'}
              </p>
            </div>
          </motion.div>

          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2"
            >
              <Bell className="w-5 h-5" />
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

          {/* Updates List */}
          {updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update, index) => (
                <motion.div
                  key={update._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setSelectedUpdate(update)}
                  className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 border border-[#082829]/10 shadow-xl cursor-pointer relative overflow-hidden group"
                >
                  {/* Animated background */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                  
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#082829] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Bell className="w-6 h-6 text-[#fbfbef]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-[#082829] line-clamp-2 flex-1">
                          {update.title || 'Admin Update'}
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDeleteUpdate(update._id, e)}
                          disabled={deleting === update._id}
                          className="ml-2 p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete this update"
                        >
                          {deleting === update._id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-red-600/20 border-t-red-600 rounded-full"
                            />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                      <p className="text-[#082829]/70 mb-3 line-clamp-2">
                        {update.message}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-[#082829]/50">
                        <Calendar className="w-4 h-4" />
                        {new Date(update.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {update.category && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="px-2 py-1 bg-[#082829]/10 rounded-lg text-xs font-medium capitalize">
                              {update.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-3xl p-12 border border-[#082829]/10 shadow-xl text-center"
            >
              <Bell className="w-20 h-20 text-[#082829]/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#082829] mb-2">No Updates Yet</h3>
              <p className="text-[#082829]/60">You'll see notifications and updates from admin here</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Update Detail Modal */}
      <AnimatePresence>
        {selectedUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUpdate(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#fbfbef] to-white max-w-2xl w-full rounded-3xl p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedUpdate(null)}
                className="absolute top-4 right-4 p-2 bg-[#082829]/10 hover:bg-[#082829]/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-[#082829]" />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-[#082829] rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-8 h-8 text-[#fbfbef]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#082829] mb-2">
                    {selectedUpdate.title || 'Admin Update'}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-[#082829]/60">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedUpdate.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-[#082829]/10">
                <p className="text-[#082829] leading-relaxed whitespace-pre-wrap">
                  {selectedUpdate.message}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Updates;