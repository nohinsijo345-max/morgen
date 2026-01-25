import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Car, 
  Bike, 
  Bus,
  MapPin,
  Clock,
  Users,
  Package,
  ArrowLeft,
  History,
  ShoppingBag
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import FarmerHeader from '../../components/FarmerHeader';
import GlassCard from '../../components/GlassCard';
import { useTranslation } from '../../hooks/useTranslation';

const LocalTransport = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/transport/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error(t('failedToFetch'), error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type) => {
    const iconMap = {
      'truck': Truck,
      'mini-truck': Truck,
      'car': Car,
      'bike': Bike,
      'bus': Bus,
      'jeep': Car,
      'autorickshaw': Car,
      'tractor': Truck,
      'cycle': Bike
    };
    return iconMap[type] || Truck;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300"
           style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-4 rounded-full"
          style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <FarmerHeader 
        title={t('localTransport')}
        subtitle={t('bookTransport')}
        showBack={true}
        backPath="/dashboard"
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <GlassCard delay={0.1} className="mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: colors.primary }}>{vehicles.length}</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>{t('availability')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: colors.primary }}>₹50+</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>{t('price')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: colors.primary }}>24/7</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>{t('duration')}</div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/order-tracking')}
            className="w-full p-4 rounded-2xl border shadow-lg transition-all flex items-center gap-3 hover:shadow-xl"
            style={{ 
              backgroundColor: colors.backgroundCard, 
              borderColor: colors.border,
              boxShadow: `0 4px 12px ${colors.primary}15`
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                 style={{ backgroundColor: colors.primary }}>
              <MapPin className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-base" style={{ color: colors.textPrimary }}>{t('trackOrder')}</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>{t('orderTracking')}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium" style={{ color: colors.primary }}>{t('viewAllOrders')} →</div>
            </div>
          </motion.button>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle, index) => {
            const IconComponent = getVehicleIcon(vehicle.type);
            
            return (
              <GlassCard
                key={vehicle._id}
                delay={0.2 + index * 0.1}
                onClick={() => navigate(`/local-transport/vehicle/${vehicle._id}`)}
                className="group"
              >
                {/* Vehicle Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                       style={{ backgroundColor: colors.primary }}>
                    <IconComponent className="w-7 h-7" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold capitalize" style={{ color: colors.textPrimary }}>
                      {vehicle.name}
                    </h3>
                    <p className="text-sm capitalize" style={{ color: colors.textSecondary }}>
                      {vehicle.type.replace('-', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: colors.primary }}>
                      ₹{vehicle.lowestPrice}
                    </div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>{t('startingFrom')}</div>
                  </div>
                </div>

                {/* Price Options Preview */}
                <div className="space-y-2 mb-4">
                  {vehicle.priceOptions.slice(0, 2).map((option, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span style={{ color: colors.textSecondary }}>{option.capacity}</span>
                      <span className="font-semibold" style={{ color: colors.textPrimary }}>
                        ₹{option.basePrice} + ₹{option.pricePerKm}/km
                      </span>
                    </div>
                  ))}
                  {vehicle.priceOptions.length > 2 && (
                    <div className="text-xs text-center" style={{ color: colors.textMuted }}>
                      +{vehicle.priceOptions.length - 2} more options
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="flex items-center gap-4 text-xs" style={{ color: colors.textSecondary }}>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{t('booking')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{t('trackBooking')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{t('driver')}</span>
                  </div>
                </div>

                {/* Availability Indicator */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }} />
                    <span className="text-xs" style={{ color: colors.textSecondary }}>{t('availability')}</span>
                  </div>
                  <motion.div
                    style={{ color: colors.primary }}
                    whileHover={{ x: 5 }}
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </motion.div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Empty State */}
        {vehicles.length === 0 && (
          <GlassCard className="text-center py-16">
            <Truck className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              {t('noData')}
            </h3>
            <p style={{ color: colors.textSecondary }}>
              {t('tryAgain')}
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default LocalTransport;