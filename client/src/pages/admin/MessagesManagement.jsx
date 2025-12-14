import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, Search, X, AlertTriangle, MessageSquare, Calendar, User } from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AdminGlassCard from '../../components/AdminGlassCard';

const MessagesManagement = () => {
  const { colors } = useAdminTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, message: null });
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.delete(`${API_URL}/api/admin/messages/${messageId}`);
      setMessages(messages.filter(m => m._id !== messageId));
      setDeleteModal({ show: false, message: null });
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(message =>
    message.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.userId?.farmerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
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
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Messages Management</h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>View and manage all sent messages</p>
        </div>
        <div className="text-sm" style={{ color: colors.textSecondary }}>
          Total Messages: <span className="font-bold" style={{ color: colors.textPrimary }}>{messages.length}</span>
        </div>
      </motion.div>

      {/* Search Bar */}
      <AdminGlassCard delay={0.1} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textSecondary }} />
          <input
            type="text"
            placeholder="Search messages by content or farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
            style={{ 
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
              '--tw-ring-color': colors.primary
            }}
          />
        </div>
      </AdminGlassCard>

      {/* Messages Grid */}
      {filteredMessages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMessages.map((message, index) => (
            <AdminGlassCard
              key={message._id}
              delay={index * 0.05}
              className="relative overflow-hidden group"
            >
              {/* Animated background */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                      <MessageSquare className="w-5 h-5" style={{ color: colors.background }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                        {message.userId?.name || 'Unknown'}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {message.userId?.farmerId || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteModal({ show: true, message })}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Message Content */}
                <div 
                  onClick={() => setSelectedMessage(message)}
                  className="cursor-pointer"
                >
                  <p className="text-sm mb-3 line-clamp-3" style={{ color: colors.textPrimary }}>
                    {message.message}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                    <Calendar className="w-3 h-3" />
                    {new Date(message.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </AdminGlassCard>
          ))}
        </div>
      ) : (
        <AdminGlassCard className="text-center py-12">
          <MessageSquare className="w-20 h-20 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>No Messages Found</h3>
          <p style={{ color: colors.textSecondary }}>
            {searchTerm ? 'Try a different search term' : 'No messages have been sent yet'}
          </p>
        </AdminGlassCard>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal({ show: false, message: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C5F7C]">Delete Message</h2>
              </div>
              
              <p className="text-[#4A7C99] mb-6">
                Are you sure you want to delete this message sent to{' '}
                <span className="font-bold">{deleteModal.message?.userId?.name}</span>? 
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, message: null })}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-[#2C5F7C] rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.message._id)}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMessage(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedMessage(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-[#2C5F7C]" />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-[#5B9FBF] rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#2C5F7C] mb-1">Message Details</h2>
                  <div className="flex items-center gap-3 text-sm text-[#4A7C99]">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedMessage.userId?.name} ({selectedMessage.userId?.farmerId})
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedMessage.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#5B9FBF]/10 rounded-2xl p-6 border border-[#5B9FBF]/20">
                <p className="text-[#2C5F7C] leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesManagement;
