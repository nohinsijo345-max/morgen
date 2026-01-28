import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gavel, 
  TrendingUp, 
  Clock, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  MapPin,
  Trophy,
  Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

const EnhancedBidCard = ({ bid, onEndBid, showActions = true }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const endDate = new Date(bid.bidEndDate);
      const diff = endDate - now;

      if (diff <= 0) {
        setTimeLeft(t('expired'));
        setIsExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [bid.bidEndDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'ended': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'completed': return '#3B82F6';
      default: return colors.textMuted;
    }
  };

  const getPriceIncrease = () => {
    if (bid.currentPrice > bid.startingPrice) {
      const increase = ((bid.currentPrice - bid.startingPrice) / bid.startingPrice * 100).toFixed(1);
      return `+${increase}%`;
    }
    return '0%';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border backdrop-blur-xl"
      style={{
        backgroundColor: colors.glassBackground,
        borderColor: colors.glassBorder,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div 
          className="px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold"
          style={{ 
            backgroundColor: `${getStatusColor(bid.status)}20`,
            color: getStatusColor(bid.status),
            border: `1px solid ${getStatusColor(bid.status)}40`
          }}
        >
          <Activity className="w-3 h-3" />
          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
        </div>
      </div>

      {/* Live Indicator for Active Bids */}
      {bid.status === 'active' && !isExpired && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/40">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-red-500">LIVE</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="pt-8">
          <h3 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {bid.cropName}
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Bid ID: {bid.bidId}
          </p>
        </div>

        {/* Price Section */}
        <div className="relative">
          <div 
            className="rounded-2xl p-6 border-2"
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.primary}10 100%)`
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                {t('currentBid')}
              </span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {getPriceIncrease()}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold" style={{ color: colors.primary }}>
                ₹{bid.currentPrice.toLocaleString()}
              </span>
              <span className="text-lg" style={{ color: colors.textSecondary }}>
                / {bid.unit}
              </span>
            </div>
            {bid.startingPrice !== bid.currentPrice && (
              <div className="mt-2 text-sm" style={{ color: colors.textMuted }}>
                {t('startedAt')} ₹{bid.startingPrice.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                {t('quantity')}
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              {bid.quantity} {bid.unit}
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
              {t('grade')} {bid.quality}
            </div>
          </div>

          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" style={{ color: isExpired ? '#EF4444' : colors.primary }} />
              <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                {t('timeLeft')}
              </span>
            </div>
            <div 
              className="text-xl font-bold"
              style={{ color: isExpired ? '#EF4444' : colors.textPrimary }}
            >
              {timeLeft}
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
              {t('ends')} {new Date(bid.bidEndDate).toLocaleDateString()}
            </div>
          </div>

          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                {t('bidders')}
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              {bid.uniqueBidders || 0}
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
              {bid.totalBids || 0} {t('totalBids')}
            </div>
          </div>

          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                {t('harvest')}
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              {new Date(bid.harvestDate).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
              {Math.ceil((new Date(bid.harvestDate) - new Date()) / (1000 * 60 * 60 * 24))} {t('days')}
            </div>
          </div>
        </div>

        {/* Winner Section */}
        {bid.winnerId && (
          <div 
            className="rounded-xl p-4 border-2"
            style={{ 
              backgroundColor: `${colors.primary}10`,
              borderColor: `${colors.primary}40`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" style={{ color: colors.primary }} />
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                {t('winnerDeclared')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: colors.textSecondary }}>
                {bid.winnerName}
              </span>
              <span className="font-bold" style={{ color: colors.primary }}>
                ₹{bid.winningAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
          <MapPin className="w-4 h-4" />
          <span>{bid.district}, {bid.state}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 pt-2">
            {bid.status === 'active' && !isExpired && onEndBid && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEndBid(bid)}
                className="w-full py-3 rounded-xl font-semibold border"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: colors.border,
                  color: colors.textSecondary
                }}
              >
                {t('endBidEarly')}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedBidCard;