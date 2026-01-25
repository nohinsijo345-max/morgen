import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Truck, 
  Car, 
  Bike, 
  Bus,
  IndianRupee,
  Users,
  Package,
  Clock,
  Shield
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import FarmerHeader from '../../components/FarmerHeader';
import GlassCard from '../../components/GlassCard';
import { useTranslation } from '../../hooks/useTranslation';

const VehicleDetails = () => {
  const { t } = useTranslation();
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const { colors } = useTheme();

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  const fetchVehicleDetails = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/transport/vehicles/${vehicleId}`);
      setVehicle(response.data);
      if (response.data.priceOptions.length > 0) {
        setSelectedOption(response.data.priceOptions[0]);
      }
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

  const getVehicleColor = (type) => {
    const colorMap = {
      'truck': 'from-amber-500 to-orange-600',
      'mini-truck': 'from-amber-400 to-orange-500',
      'car': 'from-blue-500 to-indigo-600',
      'bike': 'from-green-500 to-emerald-600',
      'bus': 'from-purple-500 to-violet-600',
      'jeep': 'from-gray-500 to-slate-600',
      'autorickshaw': 'from-yellow-500 to-amber-600',
      'tractor': 'from-red-500 to-rose-600',
      'cycle': 'from-teal-500 to-cyan-600'
    };
    return colorMap[type] || 'from-gray-500 to-slate-600';
  };

  const handleBookNow = () => {
    if (selectedOption) {
      window.location.href = `/local-transport/booking/${vehicleId}?option=${encodeURIComponent(JSON.stringify(selectedOption))}`;
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: colors.background }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-3 rounded-full"
          style={{ 
            borderColor: `${colors.primary}30`,
            borderTopColor: colors.primary
          }}
        />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <Truck className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>{t('vehicleNotFound')}</h3>
          <p style={{ color: colors.textSecondary }}>{t('vehicleNotFoundMessage')}</p>
        </div>
      </div>
    );
  }

  const IconComponent = getVehicleIcon(vehicle.type);
  const colorClass = getVehicleColor(vehicle.type);

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <FarmerHeader 
        title={vehicle.name}
        subtitle={vehicle.type.replace('-', ' ')}
        icon={IconComponent}
        onBack={() => window.history.back()}
      />

      {/* Content */}
      <div className="px-6 py-8">
        {/* Vehicle Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className={`w-20 h-20 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold capitalize mb-2" style={{ color: colors.textPrimary }}>
                  {vehicle.name}
                </h2>
                <div className="flex items-center gap-4 text-sm" style={{ color: colors.textSecondary }}>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>{t('verifiedVehicle')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{t('available24x7')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: colors.cardHover }}>
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: colors.primary }} />
                <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('professionalDriver')}</div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>{t('experiencedLicensed')}</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: colors.cardHover }}>
                <Package className="w-6 h-6 mx-auto mb-2" style={{ color: colors.primary }} />
                <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{t('secureLoading')}</div>
                <div className="text-xs" style={{ color: colors.textSecondary }}>{t('safeCropTransport')}</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Price Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>{t('chooseYourOption')}</h3>
          <div className="space-y-3">
            {vehicle.priceOptions.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOption(option)}
              >
                <GlassCard 
                  className={`p-4 cursor-pointer transition-all ${
                    selectedOption === option ? 'ring-2' : ''
                  }`}
                  style={{
                    '--tw-ring-color': selectedOption === option ? colors.primary : 'transparent',
                    backgroundColor: selectedOption === option ? colors.cardHover : undefined
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold mb-1" style={{ color: colors.textPrimary }}>
                        {option.capacity}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {option.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                        ₹{option.basePrice}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        + ₹{option.pricePerKm}/km
                      </div>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full border-2 ml-4"
                      style={{
                        borderColor: selectedOption === option ? colors.primary : colors.textMuted,
                        backgroundColor: selectedOption === option ? colors.primary : 'transparent'
                      }}
                    >
                      {selectedOption === option && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Book Now Button */}
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky bottom-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBookNow}
              className="w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="flex items-center justify-center gap-2">
                <IndianRupee className="w-5 h-5" />
                <span>{t('bookNow')} - {selectedOption.capacity}</span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetails;