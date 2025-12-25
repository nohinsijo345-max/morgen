import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useBuyerTheme } from '../../context/BuyerThemeContext';
import BuyerNeumorphicThemeToggle from '../../components/BuyerNeumorphicThemeToggle';
import BuyerGlassCard from '../../components/BuyerGlassCard';
import { UserSession } from '../../utils/userSession';

const BuyerCustomerSupport = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, colors } = useBuyerTheme();

  useEffect(() => {
    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const buyerUser = UserSession.getCurrentUser('buyer');
      const buyerId = buyerUser?.buyerId || 'MGB002';
      
      const response = await axios.get(`${API_URL}/api/support/messages/${buyerId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      // Set empty array if no messages found
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const buyerUser = UserSession.getCurrentUser('buyer');
      const buyerId = buyerUser?.buyerId || 'MGB002';
      
      console.log('🚀 Sending message:', { buyerId, message: newMessage.trim(), userType: 'buyer' });
      
      const response = await axios.post(`${API_URL}/api/support/send`, {
        buyerId,
        message: newMessage.trim(),
        userType: 'buyer'
      });

      console.log('✅ Message sent successfully:', response.data);

      setNewMessage('');
      setSuccess('Message sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 backdrop-blur-xl border-b shadow-lg sticky top-0"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/buyer/dashboard')}
                className="p-2 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: colors.primary }}>
                  <MessageCircle className="w-5 h-5" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Customer Support</h1>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Get help from our team</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <BuyerNeumorphicThemeToggle size="sm" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/buyer/dashboard')}
                className="p-2.5 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
              >
                <Home className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto p-6">
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

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <BuyerGlassCard delay={0.1} className="text-center">
            <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: colors.primary }} />
            <h3 className="font-bold mb-1" style={{ color: colors.textPrimary }}>Phone Support</h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>+91 94472 12484</p>
          </BuyerGlassCard>

          <BuyerGlassCard delay={0.2} className="text-center">
            <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: colors.primary }} />
            <h3 className="font-bold mb-1" style={{ color: colors.textPrimary }}>Email Support</h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>support@morgen.com</p>
          </BuyerGlassCard>

          <BuyerGlassCard delay={0.3} className="text-center">
            <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: colors.primary }} />
            <h3 className="font-bold mb-1" style={{ color: colors.textPrimary }}>Support Hours</h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>24/7 Available</p>
          </BuyerGlassCard>
        </div>

        {/* Messages Section */}
        <BuyerGlassCard delay={0.4}>
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6" style={{ color: colors.primary }} />
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Messages</h2>
          </div>

          {/* Messages List */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: colors.textMuted }} />
                <p className="font-medium" style={{ color: colors.textSecondary }}>No messages yet</p>
                <p className="text-sm" style={{ color: colors.textMuted }}>Send your first message below</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl ${
                    message.sender === 'buyer' ? 'ml-8' : 'mr-8'
                  }`}
                  style={{
                    backgroundColor: message.sender === 'buyer' ? colors.primary : colors.surface,
                    color: message.sender === 'buyer' ? (isDarkMode ? '#0d1117' : '#ffffff') : colors.textPrimary
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {message.sender === 'buyer' ? 'You' : 'Support Team'}
                    </span>
                    <span className="text-xs opacity-70">
                      {message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                  {message.status && (
                    <div className="mt-2 text-xs opacity-70">
                      Status: {message.status}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              rows="3"
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none transition-colors"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textPrimary,
                focusRingColor: colors.primary
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send'}
            </motion.button>
          </div>
        </BuyerGlassCard>
      </div>
    </div>
  );
};

export default BuyerCustomerSupport;