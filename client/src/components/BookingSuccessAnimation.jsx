import { motion } from 'framer-motion';
import { CheckCircle, Package, Calendar, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const BookingSuccessAnimation = ({ 
  bookingData, 
  onClose, 
  onGoToTracking, 
  onGoToDashboard 
}) => {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-900/90 backdrop-blur-xl border border-gray-700/50' 
            : 'bg-white'
        }`}
        style={isDarkMode ? {
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `
        } : {}}
      >
        {/* Glass Edge Reflections for Dark Mode */}
        {isDarkMode && (
          <>
            {/* Top edge light reflection */}
            <div 
              className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
              style={{
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(255, 255, 255, 0.15) 20%,
                  rgba(255, 255, 255, 0.25) 50%,
                  rgba(255, 255, 255, 0.15) 80%,
                  transparent 100%)`
              }}
            />
            
            {/* Left edge light reflection */}
            <div 
              className="absolute top-0 left-0 bottom-0 w-[1px] pointer-events-none"
              style={{
                background: `linear-gradient(180deg, 
                  rgba(255, 255, 255, 0.2) 0%, 
                  rgba(255, 255, 255, 0.08) 50%,
                  transparent 100%)`
              }}
            />
          </>
        )}

        {/* Background Animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-green-400/30 to-blue-400/30' 
              : 'bg-gradient-to-br from-green-200 to-blue-200'
          }`}
        />
        
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-20 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-400/30 to-pink-400/30' 
              : 'bg-gradient-to-br from-purple-200 to-pink-200'
          }`}
        />

        {/* Success Icon Animation */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-xl font-bold mb-1 ${
              isDarkMode ? 'text-green-400' : 'text-green-800'
            }`}
          >
            Booking Confirmed!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-sm ${
              isDarkMode ? 'text-green-300' : 'text-green-600'
            }`}
          >
            Your transport has been booked successfully
          </motion.p>
        </div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mb-4"
        >
          <div className={`rounded-xl p-3 border ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-700/30 backdrop-blur-sm' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className={`w-4 h-4 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <span className={`font-semibold text-sm ${
                isDarkMode ? 'text-green-300' : 'text-green-800'
              }`}>Booking Details</span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-green-200' : 'text-green-700'}>Booking ID:</span>
                <span className={`font-semibold ${
                  isDarkMode ? 'text-green-100' : 'text-green-800'
                }`}>{bookingData.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-green-200' : 'text-green-700'}>Tracking ID:</span>
                <span className={`font-semibold ${
                  isDarkMode ? 'text-green-100' : 'text-green-800'
                }`}>{bookingData.trackingId}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-green-200' : 'text-green-700'}>Total Amount:</span>
                <span className={`font-semibold ${
                  isDarkMode ? 'text-green-100' : 'text-green-800'
                }`}>₹{bookingData.finalAmount}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-3 border ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700/30 backdrop-blur-sm' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className={`font-semibold text-sm ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>Expected Delivery</span>
            </div>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className={`text-lg font-bold ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-800'
                }`}
              >
                {new Date(bookingData.expectedDeliveryDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </motion.div>
              <div className={`text-xs ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              }`}>
                Estimated delivery date
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Elements Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0,
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200
              }}
              animate={{ 
                opacity: [0, 1, 0],
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                rotate: 360
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3
              }}
              className={`absolute w-2 h-2 rounded-full ${
                isDarkMode ? 'bg-green-400/60' : 'bg-green-400'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoToTracking}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm"
          >
            <Package className="w-4 h-4" />
            Track Order
            <ArrowRight className="w-3 h-3" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoToDashboard}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm ${
              isDarkMode 
                ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-200 border border-gray-600/30' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        {/* Confetti Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0,
                y: -50,
                x: Math.random() * 400,
                rotate: 0
              }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: 500,
                rotate: 720
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className={`absolute w-3 h-3 rounded-full ${
                i % 4 === 0 ? (isDarkMode ? 'bg-green-400/80' : 'bg-green-400') :
                i % 4 === 1 ? (isDarkMode ? 'bg-blue-400/80' : 'bg-blue-400') :
                i % 4 === 2 ? (isDarkMode ? 'bg-purple-400/80' : 'bg-purple-400') : 
                (isDarkMode ? 'bg-pink-400/80' : 'bg-pink-400')
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingSuccessAnimation;