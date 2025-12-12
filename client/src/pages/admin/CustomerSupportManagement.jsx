import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  User,
  Headphones,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import axios from 'axios';

const CustomerSupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
    // Set up polling for real-time updates
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/support/tickets`);
      setTickets(response.data);
      
      // Update selected ticket if it exists
      if (selectedTicket) {
        const updatedTicket = response.data.find(t => t.ticketId === selectedTicket.ticketId);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/support/tickets/${selectedTicket.ticketId}/reply`, {
        message: replyMessage
      });
      
      setReplyMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
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
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#5B9FBF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2C5F7C]">Customer Support</h1>
          <p className="text-[#4A7C99] mt-1">Manage farmer support tickets and inquiries</p>
        </div>
        <div className="text-sm text-[#4A7C99]">
          {tickets.length} total tickets
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-[#5B9FBF]/20 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A7C99] w-5 h-5" />
            <input
              type="text"
              placeholder="Search tickets by subject, farmer name, or ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#5B9FBF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9FBF] focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A7C99] w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/50 border border-[#5B9FBF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9FBF] focus:border-transparent appearance-none"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-[#2C5F7C]">Support Tickets</h2>
          
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-[#4A7C99]/50 mx-auto mb-3" />
              <p className="text-[#4A7C99]">No tickets found</p>
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
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTicket?.ticketId === ticket.ticketId
                      ? 'bg-[#5B9FBF]/10 border-[#5B9FBF]/30 shadow-lg'
                      : 'bg-white/60 border-[#5B9FBF]/20 hover:bg-[#5B9FBF]/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#2C5F7C] text-sm">
                      #{ticket.ticketId}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-[#2C5F7C] mb-2 line-clamp-2">
                    {ticket.subject}
                  </h3>
                  
                  <div className="text-sm text-[#4A7C99] mb-2">
                    <strong>Farmer:</strong> {ticket.farmerName}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-[#4A7C99]">
                    <span className="capitalize">{ticket.category}</span>
                    <span className={getPriorityColor(ticket.priority)}>
                      {ticket.priority} priority
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#4A7C99]">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </div>
                  
                  {/* Unread indicator */}
                  {ticket.messages.some(msg => msg.sender === 'farmer' && !msg.isRead) && (
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
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-[#5B9FBF]/20 shadow-lg">
              {/* Ticket Header */}
              <div className="p-6 border-b border-[#5B9FBF]/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#2C5F7C]">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-[#4A7C99]">
                      Ticket #{selectedTicket.ticketId} • {selectedTicket.farmerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.ticketId, e.target.value)}
                      className="px-3 py-1 bg-white border border-[#5B9FBF]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B9FBF]"
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
                    <span className="text-[#4A7C99]">Category:</span>
                    <div className="font-medium text-[#2C5F7C] capitalize">{selectedTicket.category}</div>
                  </div>
                  <div>
                    <span className="text-[#4A7C99]">Priority:</span>
                    <div className={`font-medium capitalize ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#4A7C99]">Created:</span>
                    <div className="font-medium text-[#2C5F7C]">
                      {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {selectedTicket.messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === 'admin'
                          ? 'bg-[#5B9FBF] text-white'
                          : 'bg-white/80 text-[#2C5F7C] border border-[#5B9FBF]/20'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'admin' ? (
                            <Headphones className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === 'admin' ? 'Support Team' : selectedTicket.farmerName}
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
                <div className="p-6 border-t border-[#5B9FBF]/20">
                  <div className="flex gap-3">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 bg-white/70 border border-[#5B9FBF]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9FBF] resize-none"
                      rows={3}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendReply}
                      disabled={!replyMessage.trim()}
                      className="bg-[#5B9FBF] hover:bg-[#4A8CAF] text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No Ticket Selected */
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-[#5B9FBF]/20 shadow-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-[#4A7C99]/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2C5F7C] mb-2">
                  Select a ticket to view details
                </h3>
                <p className="text-[#4A7C99]">
                  Choose a support ticket from the list to view the conversation and respond
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportManagement;