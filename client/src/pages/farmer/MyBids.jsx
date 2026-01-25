import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus,
  Gavel,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import EnhancedBidCard from '../../components/EnhancedBidCard';
// import useLiveUpdates from '../../hooks/useLiveUpdates';
import { UserSession } from '../../utils/userSession';
import { useTranslation } from '../../hooks/useTranslation';

const MyBids = () => {
  const { t } = useTranslation();
  const [selectedBid, setSelectedBid] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [bidsData, setBidsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Get theme with safe fallback
  let colors = {
    background: '#ffffff',
    glassBackground: '#ffffff',
    glassBorder: '#e5e7eb',
    surface: '#f9fafb',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    primary: '#10B981',
    border: '#e5e7eb',
    backgroundCard: '#ffffff'
  };

  try {
    const theme = useTheme();
    if (theme && theme.colors) {
      colors = theme.colors;
      console.log('✅ Theme loaded successfully for MyBids');
    }
  } catch (err) {
    console.error('⚠️ Theme error (using fallback):', err);
  }

  const farmerUser = UserSession.getCurrentUser('farmer');

  // Direct API call instead of useLiveUpdates hook
  const fetchBids = async () => {
    try {
      console.log('🔄 Fetching farmer bids directly...', { farmerId: farmerUser?.farmerId });
      setLoading(true);
      setError(null);
      
      if (!farmerUser?.farmerId) {
        setError(t('farmerSessionNotFound'));
        setLoading(false);
        return;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const endpoint = `/api/bidding/farmer/${farmerUser.farmerId}`;
      
      console.log('📡 Fetching from:', `${API_URL}${endpoint}`);
      
      const response = await axios.get(`${API_URL}${endpoint}`);
      
      console.log('✅ Bids fetch successful:', response.data);
      setBidsData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('❌ Bids fetch failed:', err);
      setError(`${t('failedToLoadBids')}: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    console.log('🚀 MyBids component mounted');
    fetchBids();
    
    // Set up polling every 15 seconds
    const interval = setInterval(fetchBids, 15000);
    
    return () => {
      console.log('🛑 MyBids component unmounted');
      clearInterval(interval);
    };
  }, []);

  const bids = bidsData?.bids || [];

  const handleEndBid = async (bidId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/bidding/end/${bidId}`, {
        farmerId: farmerUser?.farmerId
      });
      
      setShowEndConfirm(false);
      setSelectedBid(null);
      fetchBids(); // Refresh the data
      alert(t('bidEndedSuccessfully'));
    } catch (error) {
      console.error(t('failedToCreate'), error);
      alert(t('errorOccurred') + ' ' + t('tryAgainLater'));
    }
  };

  const handleViewDetails = (bid) => {
    // Removed - View details functionality no longer needed
    console.log('View details removed for bid:', bid.bidId);
  };

  const handleEndBidClick = (bid) => {
    setSelectedBid(bid);
    setShowEndConfirm(true);
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
        <p className="mt-4" style={{ color: colors.textSecondary }}>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Gavel className="w-16 h-16 mb-4" style={{ color: colors.textMuted }} />
        <p className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>{t('error')}</p>
        <p className="mb-4" style={{ color: colors.textSecondary }}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchBids}
          className="px-6 py-2 rounded-xl font-semibold"
          style={{ backgroundColor: colors.primary, color: '#ffffff' }}
        >
          {t('tryAgain')}
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
                  {t('myBids')}
                </h1>
                <div className="flex items-center gap-4 text-sm" style={{ color: colors.textSecondary }}>
                  <span>{t('manageBidListings')}</span>
                  {lastUpdated && (
                    <span className="text-xs">
                      {t('lastUpdated')}: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/farmer/bid-history'}
                className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 border"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: colors.border,
                  color: colors.textSecondary
                }}
              >
                <Clock className="w-5 h-5" />
                {t('bidHistory')}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/farmer/create-bid'}
                className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              >
                <Plus className="w-5 h-5" />
                {t('createNewBid')}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {bids.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Gavel className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              {t('noBidsYet')}
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              {t('createFirstBid')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/farmer/create-bid'}
              className="px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <Plus className="w-5 h-5" />
              {t('createFirstBid')}
            </motion.button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bids.map((bid) => (
              <EnhancedBidCard
                key={bid.bidId}
                bid={bid}
                onEndBid={handleEndBidClick}
                showActions={true}
              />
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
              {t('endBidEarly')}
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              {t('areYouSureEndBid')} <strong>{selectedBid.cropName}</strong>? 
              {selectedBid.totalBids > 0 
                ? ` ${t('highestBidderWins')}`
                : ` ${t('noBidsNoWinner')}`}
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
                {t('cancel')}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEndBid(selectedBid.bidId)}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              >
                {t('endBid')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MyBids;