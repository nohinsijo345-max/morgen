import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Send,
  Headphones,
  MessageCircle,
  Users,
  Megaphone
} from 'lucide-react';
import axios from 'axios';
import useSocket from '../../../hooks/useSocket';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';
import AdminBuyerLayout from './AdminBuyerLayout';

const BuyerCustomerSupportManagement = () => {
  const { colors } = useAdminTheme();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkMessageType, setBulkMessageType] = useState('all');
  const [sendingBulk, setSendingBulk] = useState(false);
  
  const {
    socket,
    joinTicket,
    leaveTicket,
    joinAdmin,
    onNewMessage,
    onTicketUpdated,
    offNewMessage,
    offTicketUpdated
  } = useSocket();

  useEffect(() => {
    fetchTickets();
    
    // Join admin room for real-time updates
    if (socket) {
      joinAdmin();
    }
    
    // Set up socket connection status
    if (socket) {
      socket.on('connect', () => {
        console.log('🔌 Buyer Admin Customer Support connected to Socket.IO');
        setIsConnected(true);
        joinAdmin();
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Buyer Admin Customer Support disconnected from Socket.IO');
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

  // Set up real-time message listeners for selected ticket
  useEffect(() => {
    if (!selectedTicket || !socket) return;

    // Join the specific ticket room
    joinTicket(selectedTicket.ticketId);
    
    // Handle new messages in real-time
    const handleNewMessage = (data) => {
      console.log('📨 Buyer Admin received new message:', data);
      if (data.ticketId === selectedTicket.ticketId) {
        setSelectedTicket(data.ticket);
      }
    };

    // Handle ticket updates
    const handleTicketUpdated = (data) => {
      console.log('🎫 Buyer Admin ticket updated:', data);
      if (data.ticketId === selectedTicket.ticketId) {
        setSelectedTicket(data.ticket);
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

  const fetchTickets = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/support/buyer-tickets`);
      
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
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch buyer support tickets:', err);
      setError('Failed to load buyer support tickets');
      // Set empty array as fallback
      setTickets([]);
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Optimistically add message to UI immediately
      const optimisticMessage = {
        sender: 'admin',
        message: replyMessage,
        timestamp: new Date(),
        isRead: false
      };
      
      const updatedTicket = {
        ...selectedTicket,
        messages: [...selectedTicket.messages, optimisticMessage]
      };
      setSelectedTicket(updatedTicket);
      setReplyMessage('');
      
      // Send to server - real-time update will be handled by Socket.IO
      await axios.post(`${API_URL}/api/admin/support/tickets/${selectedTicket.ticketId}/reply`, {
        message: optimisticMessage.message
      });
      
      // No need for aggressive polling - Socket.IO handles real-time updates
      console.log('✅ Buyer Admin reply sent, waiting for Socket.IO confirmation');
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
      // Revert optimistic update on error
      fetchTickets();
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.patch(`${API_URL}/api/admin/support/tickets/${ticketId}/status`, {
        status
      });
      
      fetchTickets();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      alert('Failed to update ticket status');
    }
  };

  const sendBulkMessage = async () => {
    if (!bulkMessage.trim()) return;
    
    setSendingBulk(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/support/bulk-message-buyers`, {
        message: bulkMessage,
        type: bulkMessageType
      });
      
      setBulkMessage('');
      setShowBulkMessage(false);
      alert('Bulk message sent successfully to buyers!');
    } catch (error) {
      console.error('Failed to send bulk message:', error);
      alert('Failed to send bulk message');
    } finally {
      setSendingBulk(false);
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <AdminBuyerLayout currentPage="messages">
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FF4757]/20 border-t-[#FF4757] rounded-full"
          />
        </div>
      </AdminBuyerLayout>
    );
  }

  return (
    <AdminBuyerLayout currentPage="messages">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-[#FF4757]">Buyer Customer Support</h1>
              {isRefreshing && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-[#FF4757]/30 border-t-[#FF4757] rounded-full"
                />
              )}
              {/* Real-time connection indicator */}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isConnected ? 'Connected - Real-time updates active' : 'Disconnected - Check your connection'} />
            </div>
            <p className="text-[#FF6B7A]">
              Manage buyer support tickets and inquiries {isConnected ? '• Live' : '• Offline'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBulkMessage(true)}
              className="px-4 py-2 bg-[#FF4757] text-white rounded-xl shadow-lg flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              Bulk Message
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchTickets(true)}
              className="p-2 hover:bg-[#FF4757]/10 rounded-lg transition-colors"
              title="Refresh tickets"
            >
              <RefreshCw className={`w-5 h-5 text-[#FF4757] ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <div className="text-sm text-[#FF6B7A]">
              {tickets.length} total tickets
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <AdminGlassCard className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textSecondary }} />
              <input
                type="text"
                placeholder="Search tickets by subject, buyer name, or ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757] transition-colors"
                style={{ 
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary
                }}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textSecondary }} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757] appearance-none transition-colors"
                style={{ 
                  backgroundColor: colors.cardBackground,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary
                }}
              >
                <option value="all">All Tickets</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </AdminGlassCard>

        {/* Error Message */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-[#FF4757]">Buyer Support Tickets</h2>
            
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: colors.textMuted }} />
                <p style={{ color: colors.textSecondary }}>No buyer tickets found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-4 rounded-xl border cursor-pointer transition-all relative"
                    style={{
                      backgroundColor: selectedTicket?.ticketId === ticket.ticketId 
                        ? '#FF4757/10' 
                        : colors.backgroundCard,
                      borderColor: selectedTicket?.ticketId === ticket.ticketId 
                        ? '#FF4757' 
                        : colors.border
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-[#FF4757]">
                        #{ticket.ticketId}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <h3 className="font-medium mb-2 line-clamp-2" style={{ color: colors.textPrimary }}>
                      {ticket.subject}
                    </h3>
                    
                    <div className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                      <strong>Buyer:</strong> {ticket.buyerName || ticket.buyerId}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs" style={{ color: colors.textSecondary }}>
                      <span className="capitalize">{ticket.category || 'general'}</span>
                      <span className={getPriorityColor(ticket.priority || 'medium')}>
                        {ticket.priority || 'medium'} priority
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: colors.textSecondary }}>
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </div>
                    
                    {/* Unread indicator */}
                    {ticket.messages?.some(msg => msg.sender === 'buyer' && !msg.isRead) && (
                      <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <AdminGlassCard noPadding>
                {/* Ticket Header */}
                <div className="p-6 border-b border-[#FF4757]/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#FF4757]">
                        {selectedTicket.subject}
                      </h3>
                      <p className="text-[#FF6B7A]">
                        Ticket #{selectedTicket.ticketId} • {selectedTicket.buyerName || selectedTicket.buyerId}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.ticketId, e.target.value)}
                        className="px-3 py-1 bg-white border border-[#FF4757]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[#FF6B7A]">Category:</span>
                      <div className="font-medium text-[#FF4757] capitalize">{selectedTicket.category || 'general'}</div>
                    </div>
                    <div>
                      <span className="text-[#FF6B7A]">Priority:</span>
                      <div className={`font-medium capitalize ${getPriorityColor(selectedTicket.priority || 'medium')}`}>
                        {selectedTicket.priority || 'medium'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#FF6B7A]">Created:</span>
                      <div className="font-medium text-[#FF4757]">
                        {new Date(selectedTicket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedTicket.messages?.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.sender === 'admin'
                            ? 'bg-[#FF4757] text-white'
                            : 'bg-white/80 text-[#FF4757] border border-[#FF4757]/20'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {message.sender === 'admin' ? (
                              <Headphones className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <span className="text-xs font-medium">
                              {message.sender === 'admin' ? 'Support Team' : selectedTicket.buyerName || 'Buyer'}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Reply Section */}
                {selectedTicket.status !== 'closed' && (
                  <div className="p-6 border-t border-[#FF4757]/20">
                    <div className="flex gap-3">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply to the buyer..."
                        className="flex-1 px-4 py-3 bg-white/70 border border-[#FF4757]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757] resize-none"
                        rows={3}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendReply}
                        disabled={!replyMessage.trim()}
                        className="bg-[#FF4757] hover:bg-[#FF3742] text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </AdminGlassCard>
            ) : (
              /* No Ticket Selected */
              <AdminGlassCard className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                    Select a buyer ticket to view details
                  </h3>
                  <p style={{ color: colors.textSecondary }}>
                    Choose a buyer support ticket from the list to view the conversation and respond
                  </p>
                </div>
              </AdminGlassCard>
            )}
          </div>
        </div>

        {/* Bulk Message Modal */}
        {showBulkMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#FF4757]">Send Bulk Message to Buyers</h3>
                <button
                  onClick={() => setShowBulkMessage(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Buyers
                  </label>
                  <select
                    value={bulkMessageType}
                    onChange={(e) => setBulkMessageType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                  >
                    <option value="all">All Buyers</option>
                    <option value="active">Active Buyers (Recent Activity)</option>
                    <option value="new">New Buyers (Last 30 Days)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    placeholder="Enter your message to all buyers..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4757] resize-none"
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBulkMessage(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendBulkMessage}
                    disabled={!bulkMessage.trim() || sendingBulk}
                    className="flex-1 px-4 py-2 bg-[#FF4757] text-white rounded-lg hover:bg-[#FF3742] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingBulk ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminBuyerLayout>
  );
};

export default BuyerCustomerSupportManagement;