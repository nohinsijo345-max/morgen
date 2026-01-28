import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Coins, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  LogOut,
  Bell
} from 'lucide-react';
import axios from 'axios';

const GovernmentDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    pendingSubsidies: 0,
    approvedSubsidies: 0,
    totalSchemes: 0,
    monthlyBudget: 0,
    utilizationRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/government/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch government stats:', error);
      // Set demo data
      setStats({
        totalFarmers: 1247,
        pendingSubsidies: 89,
        approvedSubsidies: 234,
        totalSchemes: 15,
        monthlyBudget: 2500000,
        utilizationRate: 78
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Registered Farmers', 
      value: stats.totalFarmers.toLocaleString(), 
      icon: Users, 
      color: '#10b981',
      change: '+12%'
    },
    { 
      label: 'Pending Subsidies', 
      value: stats.pendingSubsidies, 
      icon: Clock, 
      color: '#f59e0b',
      change: '+5%'
    },
    { 
      label: 'Approved This Month', 
      value: stats.approvedSubsidies, 
      icon: CheckCircle, 
      color: '#8b5cf6',
      change: '+18%'
    },
    { 
      label: 'Active Schemes', 
      value: stats.totalSchemes, 
      icon: FileText, 
      color: '#3b82f6',
      change: '+2%'
    },
    { 
      label: 'Monthly Budget', 
      value: `₹${(stats.monthlyBudget / 100000).toFixed(1)}L`, 
      icon: Coins, 
      color: '#ef4444',
      change: '0%'
    },
    { 
      label: 'Utilization Rate', 
      value: `${stats.utilizationRate}%`, 
      icon: TrendingUp, 
      color: '#06b6d4',
      change: '+8%'
    }
  ];

  const quickActions = [
    {
      title: 'Subsidy Approvals',
      description: 'Review pending farmer subsidy requests',
      icon: Coins,
      color: '#f59e0b',
      badge: stats.pendingSubsidies
    },
    {
      title: 'Scheme Management',
      description: 'Create and manage agricultural schemes',
      icon: FileText,
      color: '#8b5cf6'
    },
    {
      title: 'Analytics & Reports',
      description: 'View comprehensive agricultural data',
      icon: BarChart3,
      color: '#3b82f6'
    },
    {
      title: 'Farmer Directory',
      description: 'Browse registered farmer database',
      icon: Users,
      color: '#10b981'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading Government Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #8b5cf6 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Government Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name || 'Government Official'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor agricultural programs and farmer welfare initiatives</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <card.icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{card.value}</div>
                  <div className="text-sm" style={{ color: card.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                    {card.change}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-600">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <action.icon className="w-6 h-6" style={{ color: action.color }} />
                  </div>
                  {action.badge && action.badge > 0 && (
                    <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {action.badge}
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Government Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Activity tracking will be available soon...</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GovernmentDashboard;