import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gavel, 
  TrendingUp, 
  DollarSign, 
  Users,
  BarChart3,
  PieChart,
  Activity,
  Award
} from 'lucide-react';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';
import AdminBuyerLayout from './AdminBuyerLayout';

const BuyerBiddingAnalytics = () => {
  const { colors } = useAdminTheme();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalBids: 0,
    activeBidders: 0,
    averageBidAmount: 0,
    successRate: 0,
    topBidders: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/analytics/admin/bidding`);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch bidding analytics:', err);
      // Set fallback data
      setAnalytics({
        totalBids: 0,
        activeBidders: 0,
        averageBidAmount: 0,
        successRate: 0,
        topBidders: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminBuyerLayout currentPage="bidding">
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
    <AdminBuyerLayout currentPage="bidding">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#FF4757] mb-2">Bidding Analytics</h1>
          <p className="text-[#FF6B7A]">Monitor buyer bidding patterns and performance</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminGlassCard delay={0.1}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FF4757] rounded-xl flex items-center justify-center">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Total Bids</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{analytics.totalBids}</p>
              </div>
            </div>
          </AdminGlassCard>

          <AdminGlassCard delay={0.2}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Active Bidders</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{analytics.activeBidders}</p>
              </div>
            </div>
          </AdminGlassCard>

          <AdminGlassCard delay={0.3}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Avg Bid Amount</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>₹{analytics.averageBidAmount.toLocaleString()}</p>
              </div>
            </div>
          </AdminGlassCard>

          <AdminGlassCard delay={0.4}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Success Rate</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{analytics.successRate}%</p>
              </div>
            </div>
          </AdminGlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Bidders */}
          <AdminGlassCard delay={0.5}>
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-[#FF4757]" />
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Top Bidders</h3>
            </div>
            
            <div className="space-y-4">
              {analytics.topBidders.map((bidder, index) => (
                <div key={bidder.buyerId} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF4757] rounded-xl flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>{bidder.name}</p>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>{bidder.buyerId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>{bidder.totalBids} bids</p>
                    <p className="text-sm text-green-600">{bidder.winRate}% win rate</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminGlassCard>

          {/* Recent Activity */}
          <AdminGlassCard delay={0.6}>
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-[#FF4757]" />
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Recent Activity</h3>
            </div>
            
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'bid_won' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Gavel className={`w-4 h-4 ${
                      activity.type === 'bid_won' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {activity.type === 'bid_won' ? 'Won bid' : 'Placed bid'} for {activity.product}
                    </p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      {activity.buyerId} • ₹{activity.amount.toLocaleString()} • {activity.time.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AdminGlassCard>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminGlassCard delay={0.7}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-[#FF4757]" />
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Bidding Trends</h3>
            </div>
            <div className="h-64 flex items-center justify-center" style={{ backgroundColor: colors.surface, borderRadius: '12px' }}>
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <p style={{ color: colors.textSecondary }}>Chart visualization coming soon</p>
              </div>
            </div>
          </AdminGlassCard>

          <AdminGlassCard delay={0.8}>
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-6 h-6 text-[#FF4757]" />
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Product Distribution</h3>
            </div>
            <div className="h-64 flex items-center justify-center" style={{ backgroundColor: colors.surface, borderRadius: '12px' }}>
              <div className="text-center">
                <PieChart className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
                <p style={{ color: colors.textSecondary }}>Chart visualization coming soon</p>
              </div>
            </div>
          </AdminGlassCard>
        </div>
      </div>
    </AdminBuyerLayout>
  );
};

export default BuyerBiddingAnalytics;