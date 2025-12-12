import { motion } from 'framer-motion';
import { CheckCircle, Package, Calendar, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingSuccessAnimation = ({ 
  bookingData, 
  onClose, 
  onGoToTracking, 
  onGoToDashboard 
}) => {
  const navigate = useNavigate();

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
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
      >
        {/* Background Animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20"
        />
        
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20"
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
            className="text-xl font-bold text-green-800 mb-1"
          >
            Booking Confirmed!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-green-600"
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
          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-800 text-sm">Booking Details</span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-700">Booking ID:</span>
                <span className="font-semibold text-green-800">{bookingData.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Tracking ID:</span>
                <span className="font-semibold text-green-800">{bookingData.trackingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Total Amount:</span>
                <span className="font-semibold text-green-800">₹{bookingData.finalAmount}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800 text-sm">Expected Delivery</span>
            </div>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="text-lg font-bold text-blue-800"
              >
                {new Date(bookingData.expectedDeliveryDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </motion.div>
              <div className="text-xs text-blue-600">
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
              className="absolute w-2 h-2 bg-green-400 rounded-full"
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
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm"
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
              className={`absolute w-3 h-3 ${
                i % 4 === 0 ? 'bg-green-400' :
                i % 4 === 1 ? 'bg-blue-400' :
                i % 4 === 2 ? 'bg-purple-400' : 'bg-pink-400'
              } rounded-full`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingSuccessAnimation;