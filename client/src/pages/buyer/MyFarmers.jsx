import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  MapPin, 
  Mail, 
  X,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Plus,
  UserCheck,
  Sprout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useBuyerTheme } from '../../context/BuyerThemeContext';
import BuyerGlassCard from '../../components/BuyerGlassCard';

const MyFarmers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('connected');
  const [farmers, setFarmers] = useState([]);
  const [connectedFarmers, setConnectedFarmers] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [buyerId, setBuyerId] = useState(null);
  
  // Get theme with fallback
  const themeContext = useBuyerTheme();
  const isDarkMode = themeContext?.isDarkMode ?? false;
  const colors = themeContext?.colors ?? {
    background: isDarkMode ? '#0d1117' : '#f8fafc',
    surface: isDarkMode ? '#161b22' : '#ffffff',
    primary: '#FF4757',
    textPrimary: isDarkMode ? '#f0f6fc' : '#1e293b',
    textSecondary: isDarkMode ? '#8b949e' : '#64748b',
    textMuted: isDarkMode ? '#6e7681' : '#94a3b8',
    border: isDarkMode ? '#30363d' : '#e2e8f0',
    headerBg: isDarkMode ? '#161b22' : '#ffffff',
    headerBorder: isDarkMode ? '#30363d' : '#e2e8f0'
  };

  // Get buyer ID on mount
  useEffect(() => {
    const getUserData = () => {
      try {
        // Try the SessionManager format first (buyerUser with nested user object)
        let sessionData = localStorage.getItem('buyerUser') || sessionStorage.getItem('buyerUser');
        
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          console.log('Buyer session data found:', parsed);
          
          // Check if it's the SessionManager format with nested user
          const userData = parsed.user || parsed;
          
          if (userData.buyerId) {
            setBuyerId(userData.buyerId);
            return userData.buyerId;
          }
        }
        
        // Fallback: try the simple 'user' key
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('User data found:', user);
          if (user.buyerId) {
            setBuyerId(user.buyerId);
            return user.buyerId;
          }
        }
        
        console.log('No buyer ID found in session');
        setError('Please login as a buyer to access this page');
        setLoading(false);
        return null;
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Session error. Please login again.');
        setLoading(false);
        return null;
      }
    };

    const id = getUserData();
    if (id) {
      fetchAllData(id);
    }
  }, []);

  useEffect(() => {
    filterFarmers();
  }, [farmers, searchTerm]);

  const fetchAllData = async (id) => {
    setLoading(true);
    setError(null);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
    
    try {
      const [connectedRes, availableRes, requestsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/connections/connected/buyer/${id}`),
        axios.get(`${API_URL}/api/connections/available/buyer/${id}?targetType=farmer&limit=50`),
        axios.get(`${API_URL}/api/connections/requests/buyer/${id}`)
      ]);

      if (connectedRes.status === 'fulfilled') {
        setConnectedFarmers(connectedRes.value.data || []);
      } else {
        console.warn('Failed to fetch connected farmers:', connectedRes.reason);
        setConnectedFarmers([]);
      }

      if (availableRes.status === 'fulfilled') {
        setFarmers(availableRes.value.data || []);
      } else {
        console.warn('Failed to fetch available farmers:', availableRes.reason);
        setFarmers([]);
      }

      if (requestsRes.status === 'fulfilled') {
        setConnectionRequests(requestsRes.value.data || []);
      } else {
        console.warn('Failed to fetch connection requests:', requestsRes.reason);
        setConnectionRequests([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (farmerId, farmerName) => {
    if (!buyerId) return;

    setSendingRequest(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      await axios.post(`${API_URL}/api/connections/request`, {
        requesterType: 'buyer',
        requesterId: buyerId,
        targetType: 'farmer',
        targetId: farmerId,
        message: connectionMessage || `Hi ${farmerName}, I would like to connect with you for business opportunities.`,
        connectionType: 'business'
      });
      
      await fetchAllData(buyerId);
      setConnectionMessage('');
      setSelectedFarmer(null);
      alert(`Connection request sent to ${farmerName}!`);
    } catch (err) {
      console.error('Failed to send connection request:', err);
      alert(err.response?.data?.error || 'Failed to send connection request');
    } finally {
      setSendingRequest(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/connections/respond/${requestId}`, { action });
      
      if (buyerId) {
        await fetchAllData(buyerId);
      }
      alert(`Connection request ${action}ed successfully!`);
    } catch (err) {
      console.error('Failed to respond to request:', err);
      alert('Failed to respond to connection request');
    }
  };

  const filterFarmers = () => {
    let filtered = farmers;

    if (searchTerm) {
      filtered = filtered.filter(farmer => 
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmerId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFarmers(filtered);
  };

  const tabs = [
    { id: 'connected', label: 'My Farmers', icon: UserCheck, count: connectedFarmers.length, color: colors.primary },
    { id: 'available', label: 'Find Farmers', icon: UserPlus, count: filteredFarmers.length, color: '#10B981' },
    { id: 'requests', label: 'Requests', icon: Clock, count: connectionRequests.length, color: '#F59E0B' }
  ];

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8 rounded-2xl max-w-md" style={{ backgroundColor: colors.surface }}>
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>{error}</h2>
          <button
            onClick={() => navigate('/buyer/dashboard')}
            className="mt-4 px-6 py-3 rounded-xl text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 rounded-full mx-auto mb-4"
            style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
          />
          <p style={{ color: colors.textSecondary }}>Loading farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="backdrop-blur-xl border-b shadow-lg" style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}>
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/buyer/dashboard')}
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: colors.primary }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>My Farmers</h1>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Connect with farmers and source quality products</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: activeTab === tab.id ? tab.color : colors.surface,
                  color: activeTab === tab.id ? '#ffffff' : colors.textPrimary,
                  border: `1px solid ${activeTab === tab.id ? tab.color : colors.border}`
                }}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                <span className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{ 
                        backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : `${tab.color}20`,
                        color: activeTab === tab.id ? '#ffffff' : tab.color
                      }}>
                  {tab.count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Connected Tab */}
        {activeTab === 'connected' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              Connected Farmers ({connectedFarmers.length})
            </h2>

            {connectedFarmers.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: colors.surface }}>
                <UserCheck className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  No Connected Farmers Yet
                </h3>
                <p className="mb-6" style={{ color: colors.textSecondary }}>
                  Start connecting with farmers to build your supplier network.
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 rounded-xl text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Find Farmers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedFarmers.map((connection) => (
                  <BuyerGlassCard key={connection.connectionId} className="h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: colors.primary }}>
                        <Sprout className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: colors.textPrimary }}>
                          {connection.connectedUser?.name || 'Unknown'}
                        </h3>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">Connected</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="truncate">{connection.connectedUser?.profile?.email || 'N/A'}</span>
                      </div>
                      {connection.connectedUser?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                          <span>{connection.connectedUser.location.district}, {connection.connectedUser.location.state}</span>
                        </div>
                      )}
                    </div>
                  </BuyerGlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Tab */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            {/* Search */}
            <BuyerGlassCard>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    placeholder="Search farmers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none"
                    style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                  />
                </div>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="px-4 py-3 rounded-xl" style={{ backgroundColor: colors.surface }}>
                    <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  </button>
                )}
              </div>
            </BuyerGlassCard>

            <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              Available Farmers ({filteredFarmers.length})
            </h2>

            {filteredFarmers.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: colors.surface }}>
                <Sprout className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  No Farmers Available
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  {farmers.length === 0 ? 'No farmers registered yet.' : 'Try adjusting your search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFarmers.map((farmer) => (
                  <BuyerGlassCard key={farmer._id} className="h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: colors.primary }}>
                        <Sprout className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold" style={{ color: colors.textPrimary }}>{farmer.name}</h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>ID: {farmer.farmerId}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm" style={{ color: colors.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="truncate">{farmer.email}</span>
                      </div>
                      {(farmer.state || farmer.district) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                          <span>{[farmer.district, farmer.state].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedFarmer(farmer)}
                      className="w-full py-2 rounded-xl text-white flex items-center justify-center gap-2"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Plus className="w-4 h-4" /> Connect
                    </button>
                  </BuyerGlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              Connection Requests ({connectionRequests.length})
            </h2>

            {connectionRequests.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: colors.surface }}>
                <Clock className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  No Pending Requests
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  You don't have any pending connection requests.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {connectionRequests.map((request) => (
                  <BuyerGlassCard key={request.requestId}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                             style={{ backgroundColor: colors.primary }}>
                          <Sprout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold" style={{ color: colors.textPrimary }}>
                            {request.requesterName}
                          </h3>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {request.message}
                          </p>
                          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToRequest(request.requestId, 'accept')}
                          className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                          style={{ backgroundColor: '#10B981' }}
                        >
                          <CheckCircle className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(request.requestId, 'reject')}
                          className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                          style={{ backgroundColor: '#EF4444' }}
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    </div>
                  </BuyerGlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Connection Modal */}
        {selectedFarmer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  Connect with {selectedFarmer.name}
                </h3>
                <button onClick={() => setSelectedFarmer(null)} className="p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
                  <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                </button>
              </div>
              
              <textarea
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Add a message (optional)..."
                className="w-full px-4 py-3 rounded-xl mb-4 resize-none"
                style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                rows={4}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFarmer(null)}
                  className="flex-1 py-3 rounded-xl"
                  style={{ backgroundColor: colors.background, color: colors.textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendConnectionRequest(selectedFarmer.farmerId, selectedFarmer.name)}
                  disabled={sendingRequest}
                  className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  {sendingRequest ? 'Sending...' : <><Send className="w-4 h-4" /> Send Request</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFarmers;