import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../context/AdminThemeContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    subsidyRequests: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { colors } = useAdminTheme();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, gradient: `linear-gradient(135deg, ${colors.accent} 0%, #1d4ed8 100%)` },
    { label: 'Total Farmers', value: stats.totalFarmers, icon: TrendingUp, gradient: `linear-gradient(135deg, ${colors.primary} 0%, #0f3424 100%)` },
    { label: 'Subsidy Requests', value: stats.subsidyRequests, icon: Activity, gradient: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)` },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, gradient: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ 
            borderColor: `${colors.accent}20`,
            borderTopColor: colors.accent
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
        Dashboard Overview
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-colors duration-300"
              style={{ 
                backgroundColor: colors.glassBackground,
                border: `1px solid ${colors.glassBorder}`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: card.gradient }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: colors.textPrimary }}>
                {card.value}
              </div>
              <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                {card.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 backdrop-blur-xl rounded-3xl p-6 shadow-2xl transition-colors duration-300"
        style={{ 
          backgroundColor: colors.glassBackground,
          border: `1px solid ${colors.glassBorder}`
        }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>Recent Activity</h2>
        <div className="text-center py-8" style={{ color: colors.textSecondary }}>
          Activity tracking coming soon...
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
