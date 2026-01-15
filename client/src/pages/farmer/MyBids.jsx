import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus,
  Gavel,
  Calendar,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import { UserSession } from '../../utils/userSession';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const { colors } = useTheme();

  const farmerUser = UserSession.getCurrentUser('farmer');

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/bidding/farmer/${farmerUser?.farmerId}`);
      setBids(response.data.bids || []);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndBid = async (bidId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/bidding/end/${bidId}`, {
        farmerId: farmerUser?.farmerId
      });
      
      setShowEndConfirm(false);
      setSelectedBid(null);
      fetchMyBids(); // Refresh the list
      alert('Bid ended successfully!');
    } catch (error) {
      console.error('Failed to end bid:', error);
      alert('Failed to end bid. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'ended': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'completed': return '#3B82F6';
      default: return colors.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'ended': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="p-2 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: colors.textPrimary }} />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  My Bids
                </h1>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Manage your crop bidding listings
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/farmer/create-bid'}
              className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <Plus className="w-5 h-5" />
              Create New Bid
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {bids.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Gavel className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No bids yet
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Create your first bid to start selling your crops through auctions
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/farmer/create-bid'}
              className="px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <Plus className="w-5 h-5" />
              Create Your First Bid
            </motion.button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bids.map((bid, index) => (
              <motion.div
                key={bid.bidId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                          {bid.cropName}
                        </h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          Bid ID: {bid.bidId}
                        </p>
                      </div>
                      <div 
                        className="px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold"
                        style={{ 
                          backgroundColor: `${getStatusColor(bid.status)}20`,
                          color: getStatusColor(bid.status)
                        }}
                      >
                        {getStatusIcon(bid.status)}
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl p-3 border"
                           style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="text-xs" style={{ color: colors.textSecondary }}>Quantity</span>
                        </div>
                        <p className="font-bold" style={{ color: colors.textPrimary }}>
                          {bid.quantity} {bid.unit}
                        </p>
                      </div>

                      <div className="rounded-xl p-3 border"
                           style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="text-xs" style={{ color: colors.textSecondary }}>Current Price</span>
                        </div>
                        <p className="font-bold" style={{ color: colors.primary }}>
                          ₹{bid.currentPrice.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl p-3 border"
                           style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="text-xs" style={{ color: colors.textSecondary }}>Total Bids</span>
                        </div>
                        <p className="font-bold" style={{ color: colors.textPrimary }}>
                          {bid.totalBids} ({bid.uniqueBidders} bidders)
                        </p>
                      </div>

                      <div className="rounded-xl p-3 border"
                           style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
                          <span className="text-xs" style={{ color: colors.textSecondary }}>Starting Price</span>
                        </div>
                        <p className="font-bold" style={{ color: colors.textPrimary }}>
                          ₹{bid.startingPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          Harvest: {new Date(bid.harvestDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-sm" style={{ color: colors.textSecondary }}>
                          Bid Ends: {new Date(bid.bidEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Winner Info */}
                    {bid.winnerId && (
                      <div className="rounded-xl p-4 border"
                           style={{ 
                             backgroundColor: `${colors.primary}10`,
                             borderColor: `${colors.primary}40`
                           }}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                          <span className="font-semibold" style={{ color: colors.textPrimary }}>
                            Winner
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {bid.winnerName} - ₹{bid.winningAmount?.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      {bid.status === 'active' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedBid(bid);
                            setShowEndConfirm(true);
                          }}
                          className="flex-1 py-2 rounded-xl font-semibold border"
                          style={{
                            backgroundColor: 'transparent',
                            borderColor: colors.border,
                            color: colors.textSecondary
                          }}
                        >
                          End Bid Early
                        </motion.button>
                      )}

                      {bid.winnerId && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.location.href = '/local-transport'}
                          className="flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-2"
                          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                        >
                          <Truck className="w-4 h-4" />
                          Book Transport
                        </motion.button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* End Bid Confirmation Modal */}
      {showEndConfirm && selectedBid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full rounded-2xl p-6"
            style={{ backgroundColor: colors.backgroundCard }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              End Bid Early?
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Are you sure you want to end this bid for <strong>{selectedBid.cropName}</strong>? 
              {selectedBid.totalBids > 0 
                ? ' The highest bidder will be declared the winner.'
                : ' There are no bids yet, so there will be no winner.'}
            </p>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowEndConfirm(false);
                  setSelectedBid(null);
                }}
                className="flex-1 py-3 rounded-xl font-semibold border"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: colors.border,
                  color: colors.textSecondary
                }}
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEndBid(selectedBid.bidId)}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              >
                End Bid
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MyBids;