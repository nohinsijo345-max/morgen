import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Calendar, 
  DollarSign,
  MapPin,
  Star,
  Trash2,
  Edit3,
  TrendingUp,
  Users,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const EnhancedCropCard = ({ 
  crop, 
  onDelete, 
  onEdit,
  onPurchase, 
  showActions = true,
  showStats = false,
  variant = 'farmer' // 'farmer' | 'buyer'
}) => {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'A': return '#10B981';
      case 'B': return '#F59E0B';
      case 'C': return '#EF4444';
      case 'Premium': return '#8B5CF6';
      default: return colors.textMuted;
    }
  };

  const getQualityLabel = (quality) => {
    switch (quality) {
      case 'A': return 'Premium Grade';
      case 'B': return 'Good Grade';
      case 'C': return 'Standard Grade';
      default: return quality;
    }
  };

  const totalValue = crop.quantity * (crop.pricePerUnit || crop.basePrice);
  const daysToHarvest = crop.harvestDate ? 
    Math.ceil((new Date(crop.harvestDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border backdrop-blur-xl"
      style={{
        backgroundColor: colors.glassBackground,
        borderColor: colors.glassBorder,
        boxShadow: isHovered 
          ? '0 20px 40px rgba(0, 0, 0, 0.15)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Quality Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div 
          className="px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold"
          style={{ 
            backgroundColor: `${getQualityColor(crop.quality)}20`,
            color: getQualityColor(crop.quality),
            border: `1px solid ${getQualityColor(crop.quality)}40`
          }}
        >
          <Star className="w-3 h-3 fill-current" />
          {getQualityLabel(crop.quality)}
        </div>
      </div>

      {/* Status Indicator */}
      {crop.status && (
        <div className="absolute top-4 left-4 z-10">
          <div 
            className="px-2 py-1 rounded-full text-xs font-semibold"
            style={{ 
              backgroundColor: crop.status === 'available' ? '#10B98120' : '#F59E0B20',
              color: crop.status === 'available' ? '#10B981' : '#F59E0B',
              border: `1px solid ${crop.status === 'available' ? '#10B98140' : '#F59E0B40'}`
            }}
          >
            {crop.status === 'available' ? 'Available' : 'Listed'}
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="pt-8">
          <h3 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {crop.cropName || crop.name}
          </h3>
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
                Price per {crop.unit}
              </span>
              {showStats && crop.aiPricePrediction && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
                  <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                    {crop.aiPricePrediction.trend === 'up' ? '↗' : 
                     crop.aiPricePrediction.trend === 'down' ? '↘' : '→'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold" style={{ color: colors.primary }}>
                ₹{(crop.pricePerUnit || crop.basePrice).toLocaleString()}
              </span>
              <span className="text-lg" style={{ color: colors.textSecondary }}>
                / {crop.unit}
              </span>
            </div>
            {crop.msp && (
              <div className="mt-2 text-sm" style={{ color: colors.textMuted }}>
                MSP: ₹{crop.msp.toLocaleString()}
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
                Available
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              {crop.quantity} {crop.unit}
            </div>
            {crop.organic && (
              <div className="text-xs mt-1 text-green-600 font-semibold">
                Organic
              </div>
            )}
          </div>

          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                Total Value
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: colors.primary }}>
              ₹{totalValue.toLocaleString()}
            </div>
            <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
              {crop.quantity} × ₹{(crop.pricePerUnit || crop.basePrice)}
            </div>
          </div>

          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                Harvest Date
              </span>
            </div>
            <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              {new Date(crop.harvestDate).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </div>
            {daysToHarvest !== null && (
              <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                {daysToHarvest > 0 ? `${daysToHarvest} days` : 'Ready'}
              </div>
            )}
          </div>

          {showStats && (
            <div 
              className="rounded-xl p-4 border"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                  Interest
                </span>
              </div>
              <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                {crop.viewCount || 0}
              </div>
              <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                views
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {crop.description && (
          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {crop.description}
            </p>
          </div>
        )}

        {/* Location */}
        {crop.location && (
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
            <MapPin className="w-4 h-4" />
            <span>
              {crop.location.district}, {crop.location.state}
              {crop.location.city && ` - ${crop.location.city}`}
            </span>
          </div>
        )}

        {/* AI Health Score */}
        {crop.aiHealthScore && (
          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                AI Health Score
              </span>
              <span className="text-lg font-bold" style={{ color: colors.primary }}>
                {crop.aiHealthScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${crop.aiHealthScore}%`,
                  backgroundColor: crop.aiHealthScore > 80 ? '#10B981' : 
                                   crop.aiHealthScore > 60 ? '#F59E0B' : '#EF4444'
                }}
              />
            </div>
          </div>
        )}

        {/* Order Statistics - Enhanced */}
        {crop.orderStats && crop.orderStats.total > 0 && (
          <div 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                Sales Summary
              </span>
              {crop.orderStats.hasCompletedOrders && (
                <div 
                  className="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                  style={{ 
                    backgroundColor: '#22C55E',
                    color: '#ffffff'
                  }}
                >
                  <CheckCircle className="w-3 h-3" />
                  COMPLETED
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Total Orders:</span>
                <span className="font-semibold" style={{ color: colors.textPrimary }}>
                  {crop.orderStats.total}
                </span>
              </div>
              {crop.orderStats.completed > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Completed:</span>
                  <span className="font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {crop.orderStats.completed}
                  </span>
                </div>
              )}
              {crop.orderStats.pending > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Pending:</span>
                  <span className="font-semibold text-yellow-600">
                    {crop.orderStats.pending}
                  </span>
                </div>
              )}
              {crop.orderStats.approved > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Approved:</span>
                  <span className="font-semibold text-blue-600">
                    {crop.orderStats.approved}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 pt-2">
            {variant === 'farmer' ? (
              <>
                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEdit(crop)}
                    className="flex-1 py-3 rounded-xl font-semibold border flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: colors.border,
                      color: colors.textSecondary
                    }}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </motion.button>
                )}

                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onDelete(crop)}
                    className="flex-1 py-3 rounded-xl font-semibold border flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#EF4444',
                      color: '#EF4444'
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                )}
              </>
            ) : (
              // Buyer variant - only purchase button
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPurchase && onPurchase(crop)}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              >
                <ShoppingCart className="w-4 h-4" />
                Purchase
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedCropCard;