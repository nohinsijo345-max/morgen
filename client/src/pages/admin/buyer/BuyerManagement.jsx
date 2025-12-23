import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  MoreVertical
} from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';
import AdminBuyerLayout from './AdminBuyerLayout';

const BuyerManagement = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { colors } = useAdminTheme();

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/buyers`);
      setBuyers(response.data);
    } catch (error) {
      console.error('Failed to fetch buyers:', error);
      // Set mock data for development
      setBuyers([
        {
          _id: '1',
          name: 'Rajesh Kumar',
          buyerId: 'MGB001',
          email: 'rajesh@example.com',
          phone: '9876543210',
          city: 'Mumbai',
          state: 'Maharashtra',
          totalPurchases: 15,
          totalSpent: 125000,
          maxBidLimit: 50000,
          isActive: true,
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          name: 'Priya Sharma',
          buyerId: 'MGB002',
          email: 'priya@example.com',
          phone: '9876543211',
          city: 'Delhi',
          state: 'Delhi',
          totalPurchases: 8,
          totalSpent: 75000,
          maxBidLimit: 30000,
          isActive: true,
          createdAt: new Date('2024-02-10')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         buyer.buyerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         buyer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && buyer.isActive) ||
                         (filterStatus === 'inactive' && !buyer.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleViewBuyer = (buyer) => {
    setSelectedBuyer(buyer);
    setShowModal(true);
  };

  const handleDeleteBuyer = async (buyerId) => {
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        await axios.delete(`${API_URL}/api/admin/buyers/${buyerId}`);
        setBuyers(buyers.filter(buyer => buyer._id !== buyerId));
      } catch (error) {
        console.error('Failed to delete buyer:', error);
        alert('Failed to delete buyer');
      }
    }
  };

  const toggleBuyerStatus = async (buyerId, currentStatus) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.patch(`${API_URL}/api/admin/buyers/${buyerId}/status`, {
        isActive: !currentStatus
      });
      setBuyers(buyers.map(buyer => 
        buyer._id === buyerId ? { ...buyer, isActive: !currentStatus } : buyer
      ));
    } catch (error) {
      console.error('Failed to update buyer status:', error);
      alert('Failed to update buyer status');
    }
  };

  if (loading) {
    return (
      <AdminBuyerLayout currentPage="management">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 rounded-full"
            style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
          />
        </div>
      </AdminBuyerLayout>
    );
  }

  return (
    <AdminBuyerLayout currentPage="management">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                  Buyer Management
                </h1>
                <p className="text-lg" style={{ color: colors.textSecondary }}>
                  Manage buyer accounts and profiles
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/admin/buyer/add'}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                <Plus className="w-5 h-5" />
                Add Buyer
              </motion.button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <AdminGlassCard className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                          style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    placeholder="Search buyers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                          style={{ color: colors.textMuted }} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-3 rounded-xl border appearance-none cursor-pointer"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </AdminGlassCard>
          </motion.div>

          {/* Buyers Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdminGlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: colors.border }}>
                      <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                        Buyer
                      </th>
                      <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                        Contact
                      </th>
                      <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                        Location
                      </th>
                      <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                        Statistics
                      </th>
                      <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                        Status
                      </th>
                      <th className="text-left p-4 font-semibold" style={{ color: colors.textPrimary }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuyers.map((buyer, index) => (
                      <motion.tr
                        key={buyer._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="border-b hover:bg-opacity-50 transition-all"
                        style={{ borderColor: colors.border }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: colors.primary }}
                            >
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: colors.textPrimary }}>
                                {buyer.name}
                              </p>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>
                                {buyer.buyerId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" style={{ color: colors.textMuted }} />
                              <span className="text-sm" style={{ color: colors.textPrimary }}>
                                {buyer.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" style={{ color: colors.textMuted }} />
                              <span className="text-sm" style={{ color: colors.textPrimary }}>
                                {buyer.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" style={{ color: colors.textMuted }} />
                            <span className="text-sm" style={{ color: colors.textPrimary }}>
                              {buyer.city}, {buyer.state}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" style={{ color: colors.textMuted }} />
                              <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                ₹{buyer.totalSpent?.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: colors.textSecondary }}>
                              {buyer.totalPurchases} orders
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleBuyerStatus(buyer._id, buyer.isActive)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              buyer.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {buyer.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewBuyer(buyer)}
                              className="p-2 rounded-lg transition-all"
                              style={{ backgroundColor: colors.surface }}
                            >
                              <Eye className="w-4 h-4" style={{ color: colors.primary }} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => window.location.href = `/admin/buyer/edit/${buyer._id}`}
                              className="p-2 rounded-lg transition-all"
                              style={{ backgroundColor: colors.surface }}
                            >
                              <Edit className="w-4 h-4" style={{ color: '#F59E0B' }} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteBuyer(buyer._id)}
                              className="p-2 rounded-lg transition-all"
                              style={{ backgroundColor: colors.surface }}
                            >
                              <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredBuyers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                  <p className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                    No buyers found
                  </p>
                  <p style={{ color: colors.textSecondary }}>
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'No buyers have been registered yet'
                    }
                  </p>
                </div>
              )}
            </AdminGlassCard>
          </motion.div>
        </div>
      </div>

      {/* Buyer Details Modal */}
      {showModal && selectedBuyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full rounded-2xl shadow-2xl"
            style={{ backgroundColor: colors.backgroundCard }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  Buyer Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg transition-all"
                  style={{ backgroundColor: colors.surface }}
                >
                  <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
                    Basic Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Name
                      </label>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {selectedBuyer.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Buyer ID
                      </label>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {selectedBuyer.buyerId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Email
                      </label>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {selectedBuyer.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Phone
                      </label>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {selectedBuyer.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
                    Statistics & Settings
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Total Purchases
                      </label>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {selectedBuyer.totalPurchases}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Total Spent
                      </label>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        ₹{selectedBuyer.totalSpent?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Max Bid Limit
                      </label>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        ₹{selectedBuyer.maxBidLimit?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Status
                      </label>
                      <p className={`font-semibold ${
                        selectedBuyer.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedBuyer.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 rounded-xl font-semibold transition-all"
                  style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.href = `/admin/buyer/edit/${selectedBuyer._id}`}
                  className="px-6 py-2 rounded-xl font-semibold transition-all"
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                >
                  Edit Buyer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminBuyerLayout>
  );
};

export default BuyerManagement;