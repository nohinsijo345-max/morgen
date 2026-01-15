import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Gavel, TrendingUp, Clock, User, Package } from 'lucide-react';
import axios from 'axios';
import { useBuyerTheme } from '../../context/BuyerThemeContext';
import BuyerGlassCard from '../../components/BuyerGlassCard';
import { UserSession } from '../../utils/userSession';

const LiveBidding = () => {
  const [activeBids, setActiveBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState(null);
  
  // Safely get theme with fallback
  let isDarkMode = false;
  let colors = {
    background: '#ffffff',
    headerBg: '#ffffff',
    headerBorder: '#e5e7eb',
    surface: '#f9fafb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    primary: '#FF4757',
    primaryLight: '#FFE5E8',
    border: '#e5e7eb',
    backgroundCard: '#ffffff'
  };

  try {
    const theme = useBuyerTheme();
    isDarkMode = theme.isDarkMode;
    colors = theme.colors;
  } catch (err) {
    console.error('Theme error:', err);
    setError('Theme loading error');
  }

  useEffect(() => {
    fetchActiveBids();
    const interval = setInterval(fetchActiveBids, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveBids = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/bidding/active`);
      
      // API returns { bids: [...] }
      const bidsData = response.data;
      if (bidsData && Array.isArray(bidsData.bids)) {
        setActiveBids(bidsData.bids);
      } else {
        console.warn('API returned unexpected data structure:', bidsData);
        setActiveBids([]);
      }
      
      console.log('✅ Active bids loaded:', response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch active bids:', error);
      setError('Failed to load bids');
      setActiveBids([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (bidId, amount) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const buyerData = UserSession.getCurrentUser('buyer');
      const buyerId = buyerData?.buyerId;

      if (!buyerId) {
        alert('Please login to place a bid');
        return;
      }

      await axios.post(`${API_URL}/api/bidding/place`, {
        bidId,
        buyerId,
        amount: parseFloat(amount)
      });

      alert('Bid placed successfully!');
      fetchActiveBids();
      setSelectedBid(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Failed to place bid:', error);
      alert(error.response?.data?.message || 'Failed to place bid');
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
        <p className="mt-4" style={{ color: colors.textSecondary }}>Loading live auctions...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Gavel className="w-16 h-16 mb-4" style={{ color: colors.textMuted }} />
        <p className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>Unable to Load</p>
        <p style={{ color: colors.textSecondary }}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className="mt-4 px-6 py-2 rounded-xl font-semibold"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          Go Back
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="backdrop-blur-xl border-b shadow-lg sticky top-0 z-50"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="p-2 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: colors.textPrimary }} />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Live Bidding</h1>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {activeBids.length} active auctions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium" style={{ color: colors.primary }}>Live</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 rounded-full"
              style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
            />
          </div>
        ) : activeBids.length === 0 ? (
          <BuyerGlassCard className="text-center py-20">
            <Gavel className="w-20 h-20 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              No Active Bids
            </h2>
            <p style={{ color: colors.textSecondary }}>
              Check back later for new auction opportunities
            </p>
          </BuyerGlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(activeBids) && activeBids.map((bid, index) => (
              <BuyerGlassCard key={bid._id} delay={index * 0.1}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1" style={{ color: colors.textPrimary }}>
                        {bid.cropName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                        <User className="w-4 h-4" />
                        <span>{bid.farmerId?.name || 'Unknown Farmer'}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold"
                         style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                      {bid.quality}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg p-3 border"
                         style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Quantity</span>
                      </div>
                      <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                        {bid.quantity} {bid.unit}
                      </div>
                    </div>
                    <div className="rounded-lg p-3 border"
                         style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Time Left</span>
                      </div>
                      <div className="text-lg font-bold" style={{ color: colors.primary }}>
                        {getTimeRemaining(bid.bidEndDate)}
                      </div>
                    </div>
                  </div>

                  {/* Current Bid */}
                  <div className="rounded-xl p-4 border-2"
                       style={{ backgroundColor: colors.backgroundCard, borderColor: colors.primary }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        Current Bid
                      </span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
                        <span className="text-xs" style={{ color: colors.primary }}>
                          {bid.bids?.length || 0} bids
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                      ₹{bid.currentPrice?.toLocaleString() || bid.startingPrice?.toLocaleString()}
                    </div>
                  </div>

                  {/* Quick Bid Buttons */}
                  {selectedBid === bid._id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {[500, 1000, 3000].map((amount) => (
                          <motion.button
                            key={amount}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePlaceBid(bid._id, (bid.currentPrice || bid.startingPrice) + amount)}
                            className="py-2 rounded-lg font-semibold text-sm"
                            style={{ backgroundColor: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                          >
                            +₹{amount}
                          </motion.button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Custom amount"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border"
                          style={{ 
                            backgroundColor: colors.surface, 
                            borderColor: colors.border,
                            color: colors.textPrimary 
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => customAmount && handlePlaceBid(bid._id, customAmount)}
                          className="px-4 py-2 rounded-lg font-semibold"
                          style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                        >
                          Bid
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedBid(null)}
                        className="w-full py-2 rounded-lg font-semibold text-sm"
                        style={{ backgroundColor: colors.surface, color: colors.textSecondary, border: `1px solid ${colors.border}` }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBid(bid._id)}
                      className="w-full py-3 rounded-xl font-semibold shadow-lg"
                      style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                    >
                      Place Bid
                    </motion.button>
                  )}
                </div>
              </BuyerGlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveBidding;
