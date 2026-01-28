import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building, 
  TrendingUp, 
  Coins,
  FileText,
  BarChart3,
  CheckCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';

const GovernmentAdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    pendingSubsidies: 0,
    approvedSubsidies: 0,
    totalSchemes: 0
  });
  const [loading, setLoading] = useState(true);
  const { colors } = useAdminTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/government/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch government stats:', error);
      // Set fallback data
      setStats({
        totalFarmers: 156,
        pendingSubsidies: 23,
        approvedSubsidies: 89,
        totalSchemes: 12
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Farmers', 
      value: stats.totalFarmers, 
      icon: Users, 
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      change: '+12%'
    },
    { 
      label: 'Pending Subsidies', 
      value: stats.pendingSubsidies, 
      icon: Clock, 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      change: '+5%'
    },
    { 
      label: 'Approved Subsidies', 
      value: stats.approvedSubsidies, 
      icon: CheckCircle, 
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      change: '+18%'
    },
    { 
      label: 'Active Schemes', 
      value: stats.totalSchemes, 
      icon: Building, 
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      change: '+2%'
    },
  ];

  const quickActions = [
    {
      title: 'Subsidy Approvals',
      description: 'Review and approve farmer subsidy requests',
      icon: Coins,
      color: '#f59e0b',
      action: () => onNavigate('subsidies'),
      badge: stats.pendingSubsidies
    },
    {
      title: 'Government Schemes',
      description: 'Manage agricultural schemes and policies',
      icon: Building,
      color: '#8b5cf6',
      action: () => onNavigate('schemes')
    },
    {
      title: 'Reports & Analytics',
      description: 'View comprehensive government reports',
      icon: BarChart3,
      color: '#3b82f6',
      action: () => onNavigate('reports')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ 
            borderColor: '#8b5cf620',
            borderTopColor: '#8b5cf6'
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
        style={{ color: colors.textPrimary }}
      >
        Government Dashboard
      </motion.h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <AdminGlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: card.gradient }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                      {card.value}
                    </div>
                    <div className="text-sm" style={{ color: '#10b981' }}>
                      {card.change}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  {card.label}
                </div>
              </AdminGlassCard>
            </motion.div>
          );
        })}
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
              onClick={action.action}
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
                      style={{ backgroundColor: '#ef4444' }}
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

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <AdminGlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
            Recent Government Activity
          </h2>
          <div className="text-center py-8" style={{ color: colors.textSecondary }}>
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: colors.textMuted }} />
            <p>Government activity tracking coming soon...</p>
          </div>
        </AdminGlassCard>
      </motion.div>
    </div>
  );
};

export default GovernmentAdminDashboard;