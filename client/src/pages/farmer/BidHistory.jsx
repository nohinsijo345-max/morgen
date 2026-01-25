import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Trophy,
  Clock,
  Gavel,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import { UserSession } from '../../utils/userSession';
import { useTranslation } from '../../hooks/useTranslation';

const FarmerBidHistory = () => {
  const { t } = useTranslation();
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const { colors } = useTheme();
  const farmerUser = UserSession.getCurrentUser('farmer');

  const fetchBidHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!farmerUser?.farmerId) {
        setError('Farmer ID not found. Please login again.');
        setLoading(false);
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/bidding/farmer/${farmerUser.farmerId}/history`);
      
      setBidHistory(response.data.bidHistory || []);
      setError(null);
    } catch (err) {
      console.error('Bid history fetch failed:', err);
      setError(`${t('failedToLoadBidHistory')}: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmerUser?.farmerId) {
      fetchBidHistory();
    } else {
      setLoading(false);
      setError('Please login to view bid history');
    }
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'active': '#10B981',
      'ended': '#F59E0B',
      'cancelled': '#EF4444',
      'completed': '#3B82F6'
    };
    return colors[status] || '#6B7280';
  };

  const filteredHistory = filter === 'all' 
    ? bidHistory 
    : filter === 'won'
    ? bidHistory.filter(bid => bid.winnerName)
    : bidHistory.filter(bid => bid.bidStatus === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
        <p className="mt-4" style={{ color: colors.textSecondary }}>Loading your bid history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Gavel className="w-16 h-16 mb-4" style={{ color: colors.textMuted }} />
        <p className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>Unable to Load Bid History</p>
        <p className="mb-4" style={{ color: colors.textSecondary }}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchBidHistory}
          className="px-6 py-2 rounded-xl font-semibold"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          Try Again
        </motion.button>
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
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
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
                {t('myBidHistory')}
              </h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {t('trackYourCreatedBids')}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: t('allBids'), count: bidHistory.length },
            { key: 'won', label: t('withWinners'), count: bidHistory.filter(b => b.winnerName).length },
            { key: 'active', label: t('active'), count: bidHistory.filter(b => b.bidStatus === 'active').length },
            { key: 'ended', label: t('ended'), count: bidHistory.filter(b => b.bidStatus === 'ended').length }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap ${
                filter === tab.key ? 'shadow-lg' : ''
              }`}
              style={{
                backgroundColor: filter === tab.key ? colors.primary : colors.surface,
                color: filter === tab.key ? '#ffffff' : colors.textSecondary,
                border: `1px solid ${filter === tab.key ? colors.primary : colors.border}`
              }}
            >
              {tab.label} ({tab.count})
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        {filteredHistory.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Gavel className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No bid history found
            </h3>
            <p style={{ color: colors.textSecondary }}>
              {filter === 'all' 
                ? 'You haven\'t created any bids yet.'
                : `No ${filter} bids found.`
              }
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((bid) => (
              <motion.div
                key={bid._id || bid.bidId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl p-6 border shadow-lg"
                style={{ backgroundColor: colors.backgroundCard, borderColor: colors.border }}
              >
                {/* Status and Winner Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ 
                      backgroundColor: `${getStatusColor(bid.bidStatus)}20`,
                      color: getStatusColor(bid.bidStatus)
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    {String(bid.bidStatus || 'unknown')}
                  </div>
                  {bid.winnerName && (
                    <div 
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                      style={{ 
                        backgroundColor: `${colors.primary}20`,
                        color: colors.primary
                      }}
                    >
                      <Trophy className="w-3 h-3" />
                      Sold
                    </div>
                  )}
                </div>

                {/* Crop Details */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-1" style={{ color: colors.textPrimary }}>
                    {String(bid.cropName || t('unknownCrop'))}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                    {String(bid.quantity || 0)} {String(bid.unit || '')} • Grade {String(bid.quality || 'N/A')}
                  </p>
                  <div className="text-sm" style={{ color: colors.textMuted }}>
                    Bid ID: {String(bid.bidId || 'N/A')}
                  </div>
                </div>

                {/* Winner Details */}
                {bid.winnerName ? (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>Winner:</span>
                      <span className="font-medium" style={{ color: colors.textPrimary }}>
                        {String(bid.winnerName || 'Unknown')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>Winning Amount:</span>
                      <span className="font-bold" style={{ color: colors.primary }}>
                        ₹{Number(bid.winningAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>Status:</span>
                      <span className="font-medium" style={{ color: colors.textMuted }}>
                        No winner yet
                      </span>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
                  <Calendar className="w-3 h-3" />
                  {bid.bidEndedAt 
                    ? `Ended ${new Date(bid.bidEndedAt).toLocaleDateString()}`
                    : (bid.participatedAt ? `Created ${new Date(bid.participatedAt).toLocaleDateString()}` : 'Date N/A')
                  }
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerBidHistory;
