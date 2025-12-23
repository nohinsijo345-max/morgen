import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Eye,
  Filter,
  X,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import FarmerHeader from '../../components/FarmerHeader';

const MyCustomers = () => {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    fetchBuyers();
  }, []);

  useEffect(() => {
    filterBuyers();
  }, [buyers, searchTerm, filterState, filterDistrict]);

  const fetchBuyers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log('🔍 Fetching buyers list...');
      
      // Fetch all buyers from the database
      const response = await axios.get(`${API_URL}/api/admin/users?userType=buyer`);
      console.log('📋 Buyers response:', response.data);
      
      // Filter only buyers and add some mock data for better display
      const buyersData = response.data.filter(user => user.buyerId).map(buyer => ({
        ...buyer,
        rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
        totalOrders: Math.floor(Math.random() * 50) + 5, // Random order count
        totalSpent: Math.floor(Math.random() * 100000) + 10000, // Random spending
        preferences: ['Organic Products', 'Bulk Orders', 'Seasonal Produce'].slice(0, Math.floor(Math.random() * 3) + 1)
      }));
      
      setBuyers(buyersData);
    } catch (error) {
      console.error('Failed to fetch buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBuyers = () => {
    let filtered = buyers;

    // Search by name, email, or buyer ID
    if (searchTerm) {
      filtered = filtered.filter(buyer => 
        buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.buyerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by state
    if (filterState) {
      filtered = filtered.filter(buyer => 
        buyer.state && buyer.state.toLowerCase().includes(filterState.toLowerCase())
      );
    }

    // Filter by district
    if (filterDistrict) {
      filtered = filtered.filter(buyer => 
        buyer.district && buyer.district.toLowerCase().includes(filterDistrict.toLowerCase())
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

  const getUniqueStates = () => {
    const states = buyers.map(buyer => buyer.state).filter(Boolean);
    return [...new Set(states)].sort();
  };

  const getUniqueDistricts = () => {
    const districts = buyers.map(buyer => buyer.district).filter(Boolean);
    return [...new Set(districts)].sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <FarmerHeader 
        title="My Customers"
        subtitle="Discover and connect with buyers"
        icon={Users}
        onBack={() => navigate('/dashboard')}
      />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {selectedBuyer ? (
          /* Buyer Details View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border-2"
                       style={{ borderColor: `${colors.primary}40` }}>
                    {selectedBuyer.profileImage ? (
                      <img
                        src={selectedBuyer.profileImage.startsWith('http') 
                          ? selectedBuyer.profileImage 
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}${selectedBuyer.profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ 
                        display: selectedBuyer.profileImage ? 'none' : 'flex',
                        backgroundColor: colors.primary 
                      }}
                    >
                      <ShoppingBag className="w-8 h-8" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                      {selectedBuyer.name}
                    </h2>
                    <p style={{ color: colors.textSecondary }}>Buyer ID: {selectedBuyer.buyerId}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {selectedBuyer.rating}
                      </span>
                      <span className="text-sm" style={{ color: colors.textSecondary }}>
                        ({selectedBuyer.totalOrders} orders)
                      </span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBuyer(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" style={{ color: colors.primary }} />
                      <span style={{ color: colors.textSecondary }}>{selectedBuyer.email}</span>
                    </div>
                    {selectedBuyer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5" style={{ color: colors.primary }} />
                        <span style={{ color: colors.textSecondary }}>{selectedBuyer.phone}</span>
                      </div>
                    )}
                    {(selectedBuyer.state || selectedBuyer.district) && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                        <span style={{ color: colors.textSecondary }}>
                          {[selectedBuyer.district, selectedBuyer.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>Purchase Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Total Orders:</span>
                      <span className="font-semibold" style={{ color: colors.textPrimary }}>{selectedBuyer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Total Spent:</span>
                      <span className="font-semibold" style={{ color: colors.textPrimary }}>₹{selectedBuyer.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold" style={{ color: colors.textPrimary }}>{selectedBuyer.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBuyer.preferences.map((preference, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                    >
                      {preference}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.border }}>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold transition-colors"
                    style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                  >
                    Connect with Buyer
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl transition-colors"
                    style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                  >
                    View Order History
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          /* Buyers List */
          <div className="space-y-6">
            {/* Search and Filters */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Search Customers</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
                  style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </motion.button>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    placeholder="Search buyers by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      backgroundColor: colors.surface, 
                      border: `1px solid ${colors.border}`,
                      color: colors.textPrimary,
                      '--tw-ring-color': colors.primary
                    }}
                  />
                </div>
                {(searchTerm || filterState || filterDistrict) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="px-4 py-3 rounded-xl flex items-center gap-2 transition-colors"
                    style={{ backgroundColor: colors.surface, color: colors.textSecondary, border: `1px solid ${colors.border}` }}
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </motion.button>
                )}
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      className="px-4 py-2 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        backgroundColor: colors.surface, 
                        border: `1px solid ${colors.border}`,
                        color: colors.textPrimary,
                        '--tw-ring-color': colors.primary
                      }}
                    >
                      <option value="">All States</option>
                      {getUniqueStates().map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    
                    <select
                      value={filterDistrict}
                      onChange={(e) => setFilterDistrict(e.target.value)}
                      className="px-4 py-2 rounded-xl focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        backgroundColor: colors.surface, 
                        border: `1px solid ${colors.border}`,
                        color: colors.textPrimary,
                        '--tw-ring-color': colors.primary
                      }}
                    >
                      <option value="">All Districts</option>
                      {getUniqueDistricts().map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Available Customers</h2>
              <div className="text-sm" style={{ color: colors.textSecondary }}>
                {filteredBuyers.length} of {buyers.length} customers
              </div>
            </div>

            {filteredBuyers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  {buyers.length === 0 ? 'No Customers Found' : 'No Matching Customers'}
                </h3>
                <p className="mb-6" style={{ color: colors.textSecondary }}>
                  {buyers.length === 0 
                    ? 'No buyers are currently registered in the system.'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
                {(searchTerm || filterState || filterDistrict) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="px-6 py-3 rounded-xl transition-colors"
                    style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                  >
                    Clear Filters
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBuyers.map((buyer, index) => (
                  <motion.div
                    key={buyer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedBuyer(buyer)}
                  >
                    <GlassCard className="h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2"
                             style={{ borderColor: `${colors.primary}40` }}>
                          {buyer.profileImage ? (
                            <img
                              src={buyer.profileImage.startsWith('http') 
                                ? buyer.profileImage 
                                : `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}${buyer.profileImage}`}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ 
                              display: buyer.profileImage ? 'none' : 'flex',
                              backgroundColor: colors.primary 
                            }}
                          >
                            <ShoppingBag className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold" style={{ color: colors.textPrimary }}>{buyer.name}</h3>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>ID: {buyer.buyerId}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                              {buyer.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4" style={{ color: colors.primary }} />
                          <span style={{ color: colors.textSecondary }} className="truncate">{buyer.email}</span>
                        </div>
                        
                        {(buyer.state || buyer.district) && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                            <span style={{ color: colors.textSecondary }}>
                              {[buyer.district, buyer.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          {buyer.totalOrders} orders • ₹{buyer.totalSpent.toLocaleString()}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCustomers;