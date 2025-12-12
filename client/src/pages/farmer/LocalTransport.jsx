import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Truck, 
  Car, 
  Bike, 
  Bus,
  MapPin,
  Clock,
  IndianRupee,
  Users,
  Package
} from 'lucide-react';
import axios from 'axios';

const LocalTransport = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/transport/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-3 border-amber-200 border-t-amber-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 sticky top-0 z-50"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="w-10 h-10 flex items-center justify-center bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-amber-700" />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold text-amber-900">Local Transport</h1>
                <p className="text-sm text-amber-700">Choose your transport solution</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/order-tracking'}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
              >
                <Package className="w-4 h-4" />
                Track Orders
              </motion.button>
              

            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 mb-8 border border-amber-200/50"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-900">{vehicles.length}</div>
              <div className="text-sm text-amber-700">Available Vehicles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-900">₹50+</div>
              <div className="text-sm text-amber-700">Starting Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-900">24/7</div>
              <div className="text-sm text-amber-700">Service</div>
            </div>
          </div>
        </motion.div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle, index) => {
            const IconComponent = getVehicleIcon(vehicle.type);
            const colorClass = getVehicleColor(vehicle.type);
            
            return (
              <motion.div
                key={vehicle._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = `/local-transport/vehicle/${vehicle._id}`}
                className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-amber-200/50 shadow-lg cursor-pointer group hover:shadow-xl transition-all"
              >
                {/* Vehicle Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900 capitalize">
                      {vehicle.name}
                    </h3>
                    <p className="text-sm text-amber-700 capitalize">
                      {vehicle.type.replace('-', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-900">
                      ₹{vehicle.lowestPrice}
                    </div>
                    <div className="text-xs text-amber-700">Starting from</div>
                  </div>
                </div>

                {/* Price Options Preview */}
                <div className="space-y-2 mb-4">
                  {vehicle.priceOptions.slice(0, 2).map((option, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-amber-700">{option.capacity}</span>
                      <span className="font-semibold text-amber-900">
                        ₹{option.basePrice} + ₹{option.pricePerKm}/km
                      </span>
                    </div>
                  ))}
                  {vehicle.priceOptions.length > 2 && (
                    <div className="text-xs text-amber-600 text-center">
                      +{vehicle.priceOptions.length - 2} more options
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="flex items-center gap-4 text-xs text-amber-700">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Quick Booking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>GPS Tracking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Verified Driver</span>
                  </div>
                </div>

                {/* Availability Indicator */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-amber-700">Available Now</span>
                  </div>
                  <motion.div
                    className="text-amber-600 group-hover:text-amber-800 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {vehicles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Truck className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">
              No Vehicles Available
            </h3>
            <p className="text-amber-700">
              Please check back later or contact support.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LocalTransport;