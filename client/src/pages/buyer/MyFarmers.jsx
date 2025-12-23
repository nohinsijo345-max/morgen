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
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useBuyerTheme } from '../../context/BuyerThemeContext';
import BuyerGlassCard from '../../components/BuyerGlassCard';

const MyFarmers = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { isDarkMode, colors } = useBuyerTheme();

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    filterFarmers();
  }, [farmers, searchTerm, filterState, filterDistrict]);

  const fetchFarmers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      console.log('🔍 Fetching farmers list...');
      
      // Fetch all farmers from the database
      const response = await axios.get(`${API_URL}/api/admin/users?userType=farmer`);
      console.log('📋 Farmers response:', response.data);
      
      // Filter only farmers and add some mock data for better display
      const farmersData = response.data.filter(user => user.farmerId).map(farmer => ({
        ...farmer,
        rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
        totalSales: Math.floor(Math.random() * 100) + 10, // Random sales count
        specialties: ['Organic Farming', 'Sustainable Agriculture', 'Crop Rotation'].slice(0, Math.floor(Math.random() * 3) + 1)
      }));
      
      setFarmers(farmersData);
    } catch (error) {
      console.error('Failed to fetch farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFarmers = () => {
    let filtered = farmers;

    // Search by name, email, or farmer ID
    if (searchTerm) {
      filtered = filtered.filter(farmer => 
        farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by state
    if (filterState) {
      filtered = filtered.filter(farmer => 
        farmer.state && farmer.state.toLowerCase().includes(filterState.toLowerCase())
      );
    }

    // Filter by district
    if (filterDistrict) {
      filtered = filtered.filter(farmer => 
        farmer.district && farmer.district.toLowerCase().includes(filterDistrict.toLowerCase())
      );
    }

    setFilteredFarmers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterState('');
    setFilterDistrict('');
    setShowFilters(false);
  };

  const getUniqueStates = () => {
    const states = farmers.map(farmer => farmer.state).filter(Boolean);
    return [...new Set(states)].sort();
  };

  const getUniqueDistricts = () => {
    const districts = farmers.map(farmer => farmer.district).filter(Boolean);
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
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 backdrop-blur-xl border-b shadow-lg"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/buyer/dashboard')}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: colors.surface }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: colors.primary }} />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                     style={{ backgroundColor: colors.primary }}>
                  <Users className="w-5 h-5" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>My Farmers</h1>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Discover and connect with farmers</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
              <input
                type="text"
                placeholder="Search farmers by name, email, or ID..."
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

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
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
        </div>
      </motion.header>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {selectedFarmer ? (
          /* Farmer Details View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <BuyerGlassCard>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border-2"
                       style={{ borderColor: `${colors.primary}40` }}>
                    {selectedFarmer.profileImage ? (
                      <img
                        src={selectedFarmer.profileImage.startsWith('http') 
                          ? selectedFarmer.profileImage 
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}${selectedFarmer.profileImage}`}
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
                        display: selectedFarmer.profileImage ? 'none' : 'flex',
                        backgroundColor: colors.primary 
                      }}
                    >
                      <Users className="w-8 h-8" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                      {selectedFarmer.name}
                    </h2>
                    <p style={{ color: colors.textSecondary }}>Farmer ID: {selectedFarmer.farmerId}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {selectedFarmer.rating}
                      </span>
                      <span className="text-sm" style={{ color: colors.textSecondary }}>
                        ({selectedFarmer.totalSales} sales)
                      </span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFarmer(null)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: colors.surface }}
                >
                  <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" style={{ color: colors.primary }} />
                      <span style={{ color: colors.textSecondary }}>{selectedFarmer.email}</span>
                    </div>
                    {selectedFarmer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5" style={{ color: colors.primary }} />
                        <span style={{ color: colors.textSecondary }}>{selectedFarmer.phone}</span>
                      </div>
                    )}
                    {(selectedFarmer.state || selectedFarmer.district) && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                        <span style={{ color: colors.textSecondary }}>
                          {[selectedFarmer.district, selectedFarmer.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFarmer.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
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
                    Connect with Farmer
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl transition-colors"
                    style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                  >
                    View Products
                  </motion.button>
                </div>
              </div>
            </BuyerGlassCard>
          </motion.div>
        ) : (
          /* Farmers List */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Available Farmers</h2>
              <div className="text-sm" style={{ color: colors.textSecondary }}>
                {filteredFarmers.length} of {farmers.length} farmers
              </div>
            </div>

            {filteredFarmers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  {farmers.length === 0 ? 'No Farmers Found' : 'No Matching Farmers'}
                </h3>
                <p className="mb-6" style={{ color: colors.textSecondary }}>
                  {farmers.length === 0 
                    ? 'No farmers are currently registered in the system.'
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
                {filteredFarmers.map((farmer, index) => (
                  <motion.div
                    key={farmer._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedFarmer(farmer)}
                  >
                    <BuyerGlassCard className="h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2"
                             style={{ borderColor: `${colors.primary}40` }}>
                          {farmer.profileImage ? (
                            <img
                              src={farmer.profileImage.startsWith('http') 
                                ? farmer.profileImage 
                                : `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}${farmer.profileImage}`}
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
                              display: farmer.profileImage ? 'none' : 'flex',
                              backgroundColor: colors.primary 
                            }}
                          >
                            <Users className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold" style={{ color: colors.textPrimary }}>{farmer.name}</h3>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>ID: {farmer.farmerId}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                              {farmer.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4" style={{ color: colors.primary }} />
                          <span style={{ color: colors.textSecondary }} className="truncate">{farmer.email}</span>
                        </div>
                        
                        {(farmer.state || farmer.district) && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                            <span style={{ color: colors.textSecondary }}>
                              {[farmer.district, farmer.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          {farmer.totalSales} sales
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
                    </BuyerGlassCard>
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

export default MyFarmers;