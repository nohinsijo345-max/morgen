import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  Clock,
  Plus,
  X,
  User,
  Headphones,
  RefreshCw,
  Sun,
  Moon,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSocket from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext';
import FarmerHeader from '../../components/FarmerHeader';
import GlassCard from '../../components/GlassCard';
import { UserSession } from '../../utils/userSession';
import { useTranslation } from '../../hooks/useTranslation';

const CustomerSupport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    message: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  
  const {
    socket,
    joinTicket,
    leaveTicket,
    joinFarmer,
    onNewMessage,
    onTicketUpdated,
    offNewMessage,
    offTicketUpdated
  } = useSocket();

  useEffect(() => {
    fetchTickets();
    
    // Join farmer room for real-time updates
    const userData = UserSession.getCurrentUser('farmer');
    if (userData && socket) {
      joinFarmer(userData.farmerId);
    }
    
    // Set up socket connection status
    if (socket) {
      socket.on('connect', () => {
        console.log('🔌 Customer Support connected to Socket.IO');
        setIsConnected(true);
        if (user) {
          joinFarmer(userData.farmerId);
        }
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Customer Support disconnected from Socket.IO');
        setIsConnected(false);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  // Set up real-time message listeners for selected ticket
  useEffect(() => {
    if (!selectedTicket || !socket) return;

    // Join the specific ticket room
    joinTicket(selectedTicket.ticketId);
    
    // Handle new messages in real-time
    const handleNewMessage = (data) => {
      console.log('📨 Received new message:', data);
      if (data.ticketId === selectedTicket.ticketId) {
        setSelectedTicket(data.ticket);
        // Mark messages as read
        markMessagesAsRead(data.ticketId);
        // Auto-scroll to bottom
        setTimeout(scrollToBottom, 100);
      }
    };

    // Handle ticket updates
    const handleTicketUpdated = (data) => {
      console.log('🎫 Ticket updated:', data);
      if (data.ticketId === selectedTicket.ticketId) {
        setSelectedTicket(data.ticket);
        // Auto-scroll to bottom for new messages
        if (data.type === 'admin-reply') {
          setTimeout(scrollToBottom, 100);
        }
      }
      // Refresh tickets list to update unread indicators
      fetchTickets();
    };

    onNewMessage(handleNewMessage);
    onTicketUpdated(handleTicketUpdated);

    return () => {
      leaveTicket(selectedTicket.ticketId);
      offNewMessage(handleNewMessage);
      offTicketUpdated(handleTicketUpdated);
    };
  }, [selectedTicket, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);
      
      const userData = UserSession.getCurrentUser('farmer');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/support/tickets/farmer/${userData.farmerId}`);
      
      // Check if there are new messages
      const hasNewMessages = selectedTicket && response.data.find(t => 
        t.ticketId === selectedTicket.ticketId && 
        t.messages.length > selectedTicket.messages.length
      );
      
      // Always update tickets
      setTickets(response.data);
      
      // Update selected ticket if it exists
      if (selectedTicket) {
        const updatedTicket = response.data.find(t => t.ticketId === selectedTicket.ticketId);
        if (updatedTicket) {
          // Force update even if message count is same (in case of message content changes)
          const shouldUpdate = !selectedTicket || 
            updatedTicket.messages.length !== selectedTicket.messages.length ||
            JSON.stringify(updatedTicket.messages) !== JSON.stringify(selectedTicket.messages);
          
          if (shouldUpdate) {
            setSelectedTicket(updatedTicket);
            // Mark messages as read
            await markMessagesAsRead(updatedTicket.ticketId);
            
            // Auto-scroll to bottom if new messages arrived
            if (hasNewMessages) {
              setTimeout(scrollToBottom, 100);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  const markMessagesAsRead = async (ticketId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.patch(`${API_URL}/api/support/tickets/${ticketId}/read`, {
        sender: 'farmer'
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;
    
    try {
      const userData = UserSession.getCurrentUser('farmer');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      const response = await axios.post(`${API_URL}/api/support/tickets`, {
        farmerId: userData.farmerId,
        farmerName: userData.name,
        ...newTicket
      });
      
      setShowNewTicketModal(false);
      setNewTicket({ subject: '', category: 'general', message: '' });
      fetchTickets();
      
      // Select the new ticket
      setSelectedTicket(response.data.ticket);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create support ticket');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Optimistically add message to UI immediately
      const optimisticMessage = {
        sender: 'farmer',
        message: newMessage,
        timestamp: new Date(),
        isRead: false
      };
      
      const updatedTicket = {
        ...selectedTicket,
        messages: [...selectedTicket.messages, optimisticMessage]
      };
      setSelectedTicket(updatedTicket);
      setNewMessage('');
      
      // Send to server - real-time update will be handled by Socket.IO
      await axios.post(`${API_URL}/api/support/tickets/${selectedTicket.ticketId}/messages`, {
        sender: 'farmer',
        message: optimisticMessage.message
      });
      
      // No need for aggressive polling - Socket.IO handles real-time updates
      console.log('✅ Message sent, waiting for Socket.IO confirmation');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
      // Revert optimistic update on error
      fetchTickets();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200',
      'closed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const categories = [
    { value: 'transport', label: t('transportLogistics') },
    { value: 'weather', label: t('weatherServices') },
    { value: 'crops', label: t('cropManagement') },
    { value: 'auction', label: t('auctionMarketplace') },
    { value: 'technical', label: t('technicalIssues') },
    { value: 'billing', label: t('billingPayments') },
    { value: 'general', label: t('generalInquiry') }
  ];

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: colors.background }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 rounded-full"
          style={{ 
            borderColor: `${colors.primary}30`,
            borderTopColor: colors.primary
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <FarmerHeader 
        title={t('customerSupport')}
        subtitle={t('chatWithSupport')}
        icon={Headphones}
        onBack={() => navigate('/account')}
        rightContent={
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchTickets(true)}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: colors.cardBackground,
                color: colors.textSecondary
              }}
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewTicketModal(true)}
              className="px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-colors text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus className="w-4 h-4" />
              {t('createTicket')}
            </motion.button>
            
            {/* Real-time connection indicator */}
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                 title={isConnected ? 'Connected - Real-time updates active' : 'Disconnected - Check your connection'} />
          </div>
        }
      />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Tickets Sidebar */}
        <div className="w-1/3 overflow-y-auto">
          <GlassCard className="h-full rounded-none border-r">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>{t('supportTickets')}</h2>
              
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: colors.primary }} />
                  <p className="mb-4" style={{ color: colors.textSecondary }}>{t('noData')}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewTicketModal(true)}
                    className="text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {t('createFirstBid')}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 rounded-xl cursor-pointer transition-all relative"
                      style={{
                        backgroundColor: selectedTicket?.ticketId === ticket.ticketId 
                          ? colors.cardHover 
                          : colors.cardBackground,
                        border: `1px solid ${selectedTicket?.ticketId === ticket.ticketId 
                          ? colors.primary 
                          : colors.cardBorder}`,
                        boxShadow: selectedTicket?.ticketId === ticket.ticketId 
                          ? `0 4px 15px ${colors.primary}30` 
                          : 'none'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                          #{ticket.ticketId}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      
                      <h3 className="font-medium mb-2 line-clamp-2" style={{ color: colors.textPrimary }}>
                        {ticket.subject}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs" style={{ color: colors.textSecondary }}>
                        <span className="capitalize">{ticket.category}</span>
                        <span className={getPriorityColor(ticket.priority)}>
                          {ticket.priority} priority
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: colors.textSecondary }}>
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </div>
                      
                      {/* Unread indicator */}
                      {ticket.messages.some(msg => msg.sender === 'admin' && !msg.isRead) && (
                        <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedTicket ? (
            <GlassCard className="h-full rounded-none flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b" style={{ borderColor: colors.cardBorder }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Ticket #{selectedTicket.ticketId} • {selectedTicket.category}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTicket.messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl"
                      style={{
                        backgroundColor: message.sender === 'farmer' ? colors.primary : colors.cardBackground,
                        color: message.sender === 'farmer' ? '#ffffff' : colors.textPrimary,
                        border: message.sender === 'farmer' ? 'none' : `1px solid ${colors.cardBorder}`
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.sender === 'farmer' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Headphones className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.sender === 'farmer' ? 'You' : 'Support'}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {selectedTicket.status !== 'closed' && (
                <div className="p-4 border-t" style={{ borderColor: colors.cardBorder }}>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${colors.cardBorder}`,
                        color: colors.textPrimary,
                        '--tw-ring-color': colors.primary
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </GlassCard>
          ) : (
            /* No Ticket Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  Select a ticket to start chatting
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  Choose a support ticket from the sidebar to view the conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicketModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 max-w-md w-full shadow-2xl"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('newSupportTicket')}</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewTicketModal(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.textSecondary }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textPrimary,
                      '--tw-ring-color': colors.primary
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textPrimary,
                      '--tw-ring-color': colors.primary
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    Message *
                  </label>
                  <textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                    placeholder="Describe your issue in detail..."
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 resize-none transition-colors"
                    style={{ 
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textPrimary,
                      '--tw-ring-color': colors.primary
                    }}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl transition-colors"
                  style={{ 
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textSecondary,
                    backgroundColor: colors.background
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createTicket}
                  disabled={!newTicket.subject.trim() || !newTicket.message.trim()}
                  className="flex-1 px-4 py-2 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.primary }}
                >
                  Create Ticket
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerSupport;