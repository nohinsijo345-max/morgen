import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  MessageSquare,
  Bell,
  Settings,
  UserCheck,
  DollarSign,
  Gavel,
  Package
} from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';
import AdminBuyerLayout from './AdminBuyerLayout';

const AdminBuyerDashboard = ({ onLogout, onBack }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useAdminTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/buyer/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch admin buyer dashboard:', error);
      // Set fallback data
      setDashboardData({
        totalBuyers: 0,
        activeBuyers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        recentBuyers: [],
        topBuyers: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminBuyerLayout currentPage="dashboard" onLogout={onLogout} onBack={onBack}>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 rounded-full"
            style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
          />
        </div>
      </AdminBuyerLayout>
    );
  }

  const quickActions = [
    {
      title: 'Buyer Management',
      description: 'Manage buyer accounts and profiles',
      icon: Users,
      path: '/admin/buyer/management',
      color: colors.primary
    },
    {
      title: 'Profile Approvals',
      description: 'Review pending buyer profile changes',
      icon: UserCheck,
      path: '/admin/buyer/profile-requests',
      color: '#10B981',
      badge: dashboardData?.pendingApprovals || 0
    },
    {
      title: 'Order Management',
      description: 'Monitor buyer orders and transactions',
      icon: Package,
      path: '/admin/buyer/orders',
      color: '#F59E0B'
    },
    {
      title: 'Bidding Analytics',
      description: 'View bidding statistics and trends',
      icon: Gavel,
      path: '/admin/buyer/bidding',
      color: '#8B5CF6'
    },
    {
      title: 'Messages & Updates',
      description: 'Send updates and messages to buyers',
      icon: MessageSquare,
      path: '/admin/buyer/messages',
      color: '#EF4444'
    },
    {
      title: 'Settings',
      description: 'Configure buyer module settings',
      icon: Settings,
      path: '/admin/buyer/settings',
      color: '#6B7280'
    }
  ];

  const stats = [
    {
      title: 'Total Buyers',
      value: dashboardData?.totalBuyers || 0,
      icon: Users,
      color: colors.primary,
      change: '+12%'
    },
    {
      title: 'Active Buyers',
      value: dashboardData?.activeBuyers || 0,
      icon: UserCheck,
      color: '#10B981',
      change: '+8%'
    },
    {
      title: 'Total Orders',
      value: dashboardData?.totalOrders || 0,
      icon: ShoppingBag,
      color: '#F59E0B',
      change: '+15%'
    },
    {
      title: 'Revenue',
      value: `₹${(dashboardData?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: '#8B5CF6',
      change: '+22%'
    }
  ];

  return (
    <AdminBuyerLayout currentPage="dashboard" onLogout={onLogout} onBack={onBack}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Buyer Administration
          </h1>
          <p className="text-lg" style={{ color: colors.textSecondary }}>
            Manage buyer accounts, orders, and system settings
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AdminGlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: colors.textPrimary }}>
                      {stat.value}
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#10B981' }}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </AdminGlassCard>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="cursor-pointer"
              >
                <AdminGlassCard className="p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <action.icon className="w-6 h-6" style={{ color: action.color }} />
                    </div>
                    {action.badge && action.badge > 0 && (
                      <div 
                        className="px-2 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#EF4444' }}
                      >
                        {action.badge}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: colors.textPrimary }}>
                    {action.title}
                  </h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {action.description}
                  </p>
                </AdminGlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Buyers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AdminGlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  Recent Buyers
                </h3>
                <button 
                  onClick={() => navigate('/admin/buyer/management')}
                  className="text-sm font-medium" 
                  style={{ color: colors.primary }}
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData?.recentBuyers?.length > 0 ? (
                  dashboardData.recentBuyers.slice(0, 5).map((buyer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg"
                         style={{ backgroundColor: colors.surface }}>
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
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          {new Date(buyer.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          {buyer.city}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-3" style={{ color: colors.textMuted }} />
                    <p style={{ color: colors.textSecondary }}>No recent buyers</p>
                  </div>
                )}
              </div>
            </AdminGlassCard>
          </motion.div>

          {/* Top Buyers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <AdminGlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  Top Buyers
                </h3>
                <button 
                  onClick={() => navigate('/admin/buyer/bidding')}
                  className="text-sm font-medium" 
                  style={{ color: colors.primary }}
                >
                  View Analytics
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData?.topBuyers?.length > 0 ? (
                  dashboardData.topBuyers.slice(0, 5).map((buyer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg"
                         style={{ backgroundColor: colors.surface }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: colors.primary, color: 'white' }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: colors.textPrimary }}>
                            {buyer.name}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {buyer.totalOrders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: colors.primary }}>
                          ₹{buyer.totalSpent?.toLocaleString()}
                        </p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          Total spent
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: colors.textMuted }} />
                    <p style={{ color: colors.textSecondary }}>No buyer data available</p>
                  </div>
                )}
              </div>
            </AdminGlassCard>
          </motion.div>
        </div>
      </div>
    </AdminBuyerLayout>
  );
};

export default AdminBuyerDashboard;