import { motion } from 'framer-motion';
import { 
  Users, 
  Truck, 
  Globe, 
  Building, 
  ShoppingCart,
  ArrowRight
} from 'lucide-react';

const AdminModuleSelector = ({ onModuleSelect }) => {
  const modules = [
    {
      id: 'farmer',
      title: 'Farmer Module',
      description: 'Manage farmers, crops, weather, and agricultural services',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      available: true
    },
    {
      id: 'driver',
      title: 'Driver Module',
      description: 'Manage drivers, vehicles, transport, and logistics',
      icon: Truck,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      available: true
    },
    {
      id: 'government',
      title: 'Government Module',
      description: 'Government schemes, policies, and regulatory management',
      icon: Building,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      available: false
    },
    {
      id: 'buyer',
      title: 'Buyer Module',
      description: 'Manage buyers, auctions, marketplace, and transactions',
      icon: ShoppingCart,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4E7F0] via-[#B8D8E8] to-[#A0C4D9] p-6">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(96, 165, 250, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#2C5F7C] mb-4">
            Morgen Admin Portal
          </h1>
          <p className="text-lg text-[#4A7C99]">
            Select a module to manage different aspects of the platform
          </p>
        </motion.div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => {
            const IconComponent = module.icon;
            
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: module.available ? 1.05 : 1, y: module.available ? -10 : 0 }}
                whileTap={{ scale: module.available ? 0.95 : 1 }}
                onClick={() => module.available && onModuleSelect(module.id)}
                className={`relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl cursor-pointer group ${
                  module.available 
                    ? 'bg-white/60 backdrop-blur-xl hover:shadow-3xl' 
                    : 'bg-white/30 backdrop-blur-xl opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 ${module.bgColor} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <IconComponent className={`w-8 h-8 ${module.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-[#2C5F7C] mb-3">
                    {module.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#4A7C99] mb-6 leading-relaxed">
                    {module.description}
                  </p>

                  {/* Status & Action */}
                  <div className="flex items-center justify-between">
                    {module.available ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-green-600 font-medium">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-sm text-gray-500 font-medium">Coming Soon</span>
                      </div>
                    )}

                    {module.available && (
                      <motion.div
                        className="flex items-center gap-2 text-[#5B9FBF] group-hover:text-[#4A8CAF] transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-sm font-medium">Enter</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                {module.available && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    style={{ transform: 'skewX(-20deg)' }}
                  />
                )}

                {/* Not Available Overlay */}
                {!module.available && (
                  <div className="absolute inset-0 bg-gray-200/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-gray-300/50">
                      <span className="text-sm font-medium text-gray-600">Coming Soon</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/20 inline-block">
            <p className="text-[#4A7C99] text-sm">
              <span className="font-semibold text-[#2C5F7C]">3 modules</span> are currently available. 
              More modules will be added in future updates.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminModuleSelector;