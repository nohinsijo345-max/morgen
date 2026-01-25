import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  MapPin, 
  Mail, 
  Star,
  Filter,
  X,
  ShoppingBag,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  MessageSquare,
  Plus,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import FarmerHeader from '../../components/FarmerHeader';
import GlassCard from '../../components/GlassCard';
import { UserSession } from '../../utils/userSession';
import { useTranslation } from '../../hooks/useTranslation';

const MyCustomers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('connected');
  const [buyers, setBuyers] = useState([]);
  const [connectedBuyers, setConnectedBuyers] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [farmerId, setFarmerId] = useState(null);
  
  // Get theme with fallback
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDarkMode ?? false;
  const colors = themeContext?.colors ?? {
    background: isDarkMode ? '#0d1117' : '#f8fafc',
    surface: isDarkMode ? '#161b22' : '#ffffff',
    primary: '#4CAF50',
    textPrimary: isDarkMode ? '#f0f6fc' : '#1e293b',
    textSecondary: isDarkMode ? '#8b949e' : '#64748b',
    textMuted: isDarkMode ? '#6e7681' : '#94a3b8',
    border: isDarkMode ? '#30363d' : '#e2e8f0'
  };

  // Get farmer ID on mount
  useEffect(() => {
    const getUserData = () => {
      try {
        // Try the SessionManager format first (farmerUser with nested user object)
        let sessionData = localStorage.getItem('farmerUser') || sessionStorage.getItem('farmerUser');
        
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          console.log('Farmer session data found:', parsed);
          
          // Check if it's the SessionManager format with nested user
          const userData = parsed.user || parsed;
          
          if (userData.farmerId) {
            setFarmerId(userData.farmerId);
            return userData.farmerId;
          }
        }
        
        // Fallback: try the simple 'user' key
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('User data found:', user);
          if (user.farmerId) {
            setFarmerId(user.farmerId);
            return user.farmerId;
          }
        }
        
        console.log('No farmer ID found in session');
        setError('Please login as a farmer to access this page');
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
    filterBuyers();
  }, [buyers, searchTerm, filterState, filterDistrict]);

  const fetchAllData = async (id) => {
    setLoading(true);
    setError(null);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
    
    try {
      // Fetch all data in parallel with individual error handling
      const [connectedRes, availableRes, requestsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/connections/connected/farmer/${id}`),
        axios.get(`${API_URL}/api/connections/available/farmer/${id}?targetType=buyer&limit=50`),
        axios.get(`${API_URL}/api/connections/requests/farmer/${id}`)
      ]);

      // Handle connected buyers
      if (connectedRes.status === 'fulfilled') {
        setConnectedBuyers(connectedRes.value.data || []);
      } else {
        console.warn('Failed to fetch connected buyers:', connectedRes.reason);
        setConnectedBuyers([]);
      }

      // Handle available buyers
      if (availableRes.status === 'fulfilled') {
        setBuyers(availableRes.value.data || []);
      } else {
        console.warn('Failed to fetch available buyers:', availableRes.reason);
        setBuyers([]);
      }

      // Handle connection requests
      if (requestsRes.status === 'fulfilled') {
        setConnectionRequests(requestsRes.value.data || []);
      } else {
        console.warn('Failed to fetch connection requests:', requestsRes.reason);
        setConnectionRequests([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      // Don't set error - just use empty arrays
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (buyerId, buyerName) => {
    if (!farmerId) return;

    setSendingRequest(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      await axios.post(`${API_URL}/api/connections/request`, {
        requesterType: 'farmer',
        requesterId: farmerId,
        targetType: 'buyer',
        targetId: buyerId,
        message: connectionMessage || `Hi ${buyerName}, I would like to connect with you for business opportunities.`,
        connectionType: 'business'
      });
      
      await fetchAllData(farmerId);
      setConnectionMessage('');
      setSelectedBuyer(null);
      alert(`Connection request sent to ${buyerName}!`);
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
      
      if (farmerId) {
        await fetchAllData(farmerId);
      }
      alert(`Connection request ${action}ed successfully!`);
    } catch (err) {
      console.error('Failed to respond to request:', err);
      alert('Failed to respond to connection request');
    }
  };

  const filterBuyers = () => {
    let filtered = buyers;

    if (searchTerm) {
      filtered = filtered.filter(buyer => 
        buyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.buyerId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterState) {
      filtered = filtered.filter(buyer => 
        buyer.state?.toLowerCase().includes(filterState.toLowerCase())
      );
    }

    if (filterDistrict) {
      filtered = filtered.filter(buyer => 
        buyer.district?.toLowerCase().includes(filterDistrict.toLowerCase())
      );
    }

    setFilteredBuyers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterState('');
    setFilterDistrict('');
    setShowFilters(false);
  };

  const tabs = [
    { id: 'connected', label: t('myCustomers'), icon: UserCheck, count: connectedBuyers.length, color: colors.primary },
    { id: 'available', label: t('findBuyers'), icon: UserPlus, count: filteredBuyers.length, color: '#10B981' },
    { id: 'requests', label: t('requests'), icon: Clock, count: connectionRequests.length, color: '#F59E0B' }
  ];

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8 rounded-2xl max-w-md" style={{ backgroundColor: colors.surface }}>
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>{error}</h2>
          <button
            onClick={() => navigate('/dashboard')}
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
          <p style={{ color: colors.textSecondary }}>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <FarmerHeader 
        title={t('myCustomers')}
        subtitle={t('connectWithBuyersAndGrow')}
        icon={Users}
        onBack={() => navigate('/dashboard')}
      />

      <div className="px-6 py-8 max-w-7xl mx-auto">
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
              Connected Customers ({connectedBuyers.length})
            </h2>

            {connectedBuyers.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: colors.surface }}>
                <UserCheck className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  No Connected Customers Yet
                </h3>
                <p className="mb-6" style={{ color: colors.textSecondary }}>
                  Start connecting with buyers to build your customer base.
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 rounded-xl text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Find Buyers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedBuyers.map((connection) => (
                  <GlassCard key={connection.connectionId} className="h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: colors.primary }}>
                        <ShoppingBag className="w-6 h-6 text-white" />
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
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Tab */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            {/* Search */}
            <GlassCard>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    placeholder="Search buyers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none"
                    style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                  />
                </div>
                {searchTerm && (
                  <button onClick={clearFilters} className="px-4 py-3 rounded-xl" style={{ backgroundColor: colors.surface }}>
                    <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  </button>
                )}
              </div>
            </GlassCard>

            <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              Available Buyers ({filteredBuyers.length})
            </h2>

            {filteredBuyers.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: colors.surface }}>
                <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  No Buyers Available
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  {buyers.length === 0 ? 'No buyers registered yet.' : 'Try adjusting your search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBuyers.map((buyer) => (
                  <GlassCard key={buyer._id} className="h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: colors.primary }}>
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold" style={{ color: colors.textPrimary }}>{buyer.name}</h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>ID: {buyer.buyerId}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm" style={{ color: colors.textSecondary }}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="truncate">{buyer.email}</span>
                      </div>
                      {(buyer.state || buyer.district) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                          <span>{[buyer.district, buyer.state].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedBuyer(buyer)}
                      className="w-full py-2 rounded-xl text-white flex items-center justify-center gap-2"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Plus className="w-4 h-4" /> Connect
                    </button>
                  </GlassCard>
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
                  <GlassCard key={request.requestId}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                             style={{ backgroundColor: colors.primary }}>
                          <ShoppingBag className="w-6 h-6 text-white" />
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
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Connection Modal */}
        {selectedBuyer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  Connect with {selectedBuyer.name}
                </h3>
                <button onClick={() => setSelectedBuyer(null)} className="p-2 rounded-lg" style={{ backgroundColor: colors.background }}>
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
                  onClick={() => setSelectedBuyer(null)}
                  className="flex-1 py-3 rounded-xl"
                  style={{ backgroundColor: colors.background, color: colors.textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendConnectionRequest(selectedBuyer.buyerId, selectedBuyer.name)}
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

export default MyCustomers;