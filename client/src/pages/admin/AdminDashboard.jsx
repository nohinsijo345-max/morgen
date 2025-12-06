import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Image, Activity, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    subsidyRequests: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

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
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Farmers', value: stats.totalFarmers, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Subsidy Requests', value: stats.subsidyRequests, icon: Activity, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'from-purple-500 to-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#5B9FBF]/20 border-t-[#5B9FBF] rounded-full"
        />
      </div>
    );
  }

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-[#2C5F7C] mb-8"
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
              className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-[#5B9FBF]/20 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#2C5F7C] mb-1">
                {card.value}
              </div>
              <div className="text-sm text-[#4A7C99] font-medium">
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
        className="mt-8 bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-[#5B9FBF]/20 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-[#2C5F7C] mb-4">Recent Activity</h2>
        <div className="text-[#4A7C99] text-center py-8">
          Activity tracking coming soon...
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
