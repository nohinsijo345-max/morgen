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
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerSupport = () => {
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

  useEffect(() => {
    fetchTickets();
    
    // Set up aggressive polling for real-time messaging
    let interval;
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      // Very frequent polling for real-time experience
      interval = setInterval(fetchTickets, 800); // Poll every 800ms for real-time feel
    };
    
    const handleFocus = () => {
      fetchTickets(); // Immediate refresh on focus
      startPolling();
    };
    
    const handleBlur = () => {
      // Continue frequent polling even when not focused for real-time notifications
      if (interval) clearInterval(interval);
      interval = setInterval(fetchTickets, 2000); // Slower but still frequent when not focused
    };
    
    // Start initial polling
    startPolling();
    
    // Add event listeners for focus/blur
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setIsRefreshing(true);
      
      const user = JSON.parse(localStorage.getItem('farmerUser'));
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/support/tickets/farmer/${user.farmerId}`);
      
      // Check if there are new messages
      const hasNewMessages = selectedTicket && response.data.find(t => 
        t.ticketId === selectedTicket.ticketId && 
        t.messages.length > selectedTicket.messages.length
      );
      
      setTickets(response.data);
      
      // Update selected ticket if it exists
      if (selectedTicket) {
        const updatedTicket = response.data.find(t => t.ticketId === selectedTicket.ticketId);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
          // Mark messages as read
          await markMessagesAsRead(updatedTicket.ticketId);
          
          // Auto-scroll to bottom if new messages arrived
          if (hasNewMessages) {
            setTimeout(scrollToBottom, 100);
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
      const user = JSON.parse(localStorage.getItem('farmerUser'));
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      const response = await axios.post(`${API_URL}/api/support/tickets`, {
        farmerId: user.farmerId,
        farmerName: user.name,
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
      await axios.post(`${API_URL}/api/support/tickets/${selectedTicket.ticketId}/messages`, {
        sender: 'farmer',
        message: newMessage
      });
      
      setNewMessage('');
      
      // Multiple immediate refreshes to ensure message appears
      await fetchTickets();
      setTimeout(fetchTickets, 200);
      setTimeout(fetchTickets, 500);
      setTimeout(fetchTickets, 1000);
      setTimeout(fetchTickets, 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
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
    { value: 'transport', label: 'Transport & Logistics' },
    { value: 'weather', label: 'Weather Services' },
    { value: 'crops', label: 'Crop Management' },
    { value: 'auction', label: 'Auction & Marketplace' },
    { value: 'technical', label: 'Technical Issues' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'general', label: 'General Inquiry' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl border-b border-green-200/50 shadow-lg sticky top-0 z-50"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/account')}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-green-700" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-green-800">Customer Support</h1>
                    {isRefreshing && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full"
                      />
                    )}
                  </div>
                  <p className="text-green-600 text-sm">Get help from our support team</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchTickets(true)}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-green-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewTicketModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Ticket
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Tickets Sidebar */}
        <div className="w-1/3 bg-white/40 backdrop-blur-xl border-r border-green-200/50 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-green-800 mb-4">Support Tickets</h2>
            
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-600 mb-4">No support tickets yet</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewTicketModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Create First Ticket
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
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTicket?.ticketId === ticket.ticketId
                        ? 'bg-green-100 border-green-300 shadow-lg'
                        : 'bg-white/60 border-green-200/50 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-800 text-sm">
                        #{ticket.ticketId}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-green-800 mb-2 line-clamp-2">
                      {ticket.subject}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-green-600">
                      <span className="capitalize">{ticket.category}</span>
                      <span className={getPriorityColor(ticket.priority)}>
                        {ticket.priority} priority
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
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
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="bg-white/60 backdrop-blur-xl border-b border-green-200/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-sm text-green-600">
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
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === 'farmer'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/80 text-green-800 border border-green-200'
                    }`}>
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
                <div className="bg-white/60 backdrop-blur-xl border-t border-green-200/50 p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-white/70 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No Ticket Selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Select a ticket to start chatting
                </h3>
                <p className="text-green-600">
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
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-800">New Support Ticket</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewTicketModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                    placeholder="Describe your issue in detail..."
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createTicket}
                  disabled={!newTicket.subject.trim() || !newTicket.message.trim()}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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