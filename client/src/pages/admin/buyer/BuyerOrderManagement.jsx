import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  User, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Eye
} from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';
import AdminBuyerLayout from './AdminBuyerLayout';

const BuyerOrderManagement = () => {
  const { colors } = useAdminTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalValue: 0,
    activeOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // For now, we'll create mock data since buyer orders might not be implemented yet
      const mockOrders = [
        {
          id: 'ORD001',
          buyerId: 'MGB002',
          buyerName: 'NOHIN SIJO',
          product: 'Rice',
          quantity: '100 kg',
          price: 5000,
          status: 'pending',
          orderDate: new Date().toISOString(),
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ORD002',
          buyerId: 'MGB003',
          buyerName: 'Test Buyer 2',
          product: 'Wheat',
          quantity: '50 kg',
          price: 2500,
          status: 'completed',
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setOrders(mockOrders);
      
      // Calculate stats
      const totalOrders = mockOrders.length;
      const totalValue = mockOrders.reduce((sum, order) => sum + order.price, 0);
      const activeOrders = mockOrders.filter(order => order.status === 'pending' || order.status === 'processing').length;
      const completedOrders = mockOrders.filter(order => order.status === 'completed').length;
      
      setStats({
        totalOrders,
        totalValue,
        activeOrders,
        completedOrders
      });
      
    } catch (err) {
      console.error('Failed to fetch buyer orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <AdminBuyerLayout currentPage="orders">
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
    <AdminBuyerLayout currentPage="orders">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#FF4757] mb-2">Buyer Order Management</h1>
          <p className="text-[#FF6B7A]">Monitor and manage buyer orders and transactions</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminGlassCard delay={0.1}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FF4757] rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Total Orders</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{stats.totalOrders}</p>
              </div>
            </div>
          </AdminGlassCard>

          <AdminGlassCard delay={0.2}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Total Value</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>₹{stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </AdminGlassCard>

          <AdminGlassCard delay={0.3}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Active Orders</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{stats.activeOrders}</p>
              </div>
            </div>
          </AdminGlassCard>

          <AdminGlassCard delay={0.4}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Completed</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{stats.completedOrders}</p>
              </div>
            </div>
          </AdminGlassCard>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search orders, buyers, or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchOrders}
              className="px-4 py-3 bg-[#FF4757] text-white rounded-xl shadow-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <AdminGlassCard className="text-center py-12">
            <Package className="w-20 h-20 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>No Orders Found</h3>
            <p style={{ color: colors.textSecondary }}>No buyer orders match your search criteria</p>
          </AdminGlassCard>
        ) : (
          <AdminGlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.border }}>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: colors.textPrimary }}>Order ID</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: colors.textPrimary }}>Buyer</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: colors.textPrimary }}>Product</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: colors.textPrimary }}>Quantity</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: colors.textPrimary }}>Price</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: colors.textPrimary }}>Status</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: colors.textPrimary }}>Date</th>
                    <th className="text-left py-4 px-4 font-semibold" style={{ color: colors.textPrimary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b hover:bg-opacity-50"
                      style={{ borderColor: colors.border }}
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium" style={{ color: colors.textPrimary }}>{order.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium" style={{ color: colors.textPrimary }}>{order.buyerName}</p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>{order.buyerId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span style={{ color: colors.textPrimary }}>{order.product}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span style={{ color: colors.textPrimary }}>{order.quantity}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold" style={{ color: colors.textPrimary }}>₹{order.price.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p style={{ color: colors.textPrimary }}>{new Date(order.orderDate).toLocaleDateString()}</p>
                          <p style={{ color: colors.textSecondary }}>Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-lg hover:bg-[#FF4757]/10"
                          style={{ color: colors.textSecondary }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminGlassCard>
        )}
      </div>
    </AdminBuyerLayout>
  );
};

export default BuyerOrderManagement;