import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { SessionManager } from '../utils/sessionManager';

const SessionExpiryWarning = ({ userType, onLogout, onExtend }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const checkSessionExpiry = () => {
      const remaining = SessionManager.getTimeRemaining(userType);
      const isExpiringSoon = SessionManager.isSessionExpiringSoon(userType);
      
      setTimeRemaining(remaining);
      setShowWarning(isExpiringSoon && remaining > 0);
      
      // Auto-logout if session expired
      if (remaining <= 0 && (localStorage.getItem(`${userType}User`) || sessionStorage.getItem(`${userType}User`))) {
        SessionManager.clearUserSession(userType);
        onLogout();
      }
    };

    // Check immediately
    checkSessionExpiry();
    
    // Check every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000);
    
    return () => clearInterval(interval);
  }, [userType, onLogout]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const handleExtendSession = () => {
    if (SessionManager.extendSession(userType)) {
      setShowWarning(false);
      if (onExtend) onExtend();
    }
  };

  const handleLogoutNow = () => {
    SessionManager.clearUserSession(userType);
    onLogout();
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-orange-200 dark:border-orange-800"
          >
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Session Expiring Soon
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your session will expire in:
              </p>
              
              {/* Countdown */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              {/* Info */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                For security, all sessions automatically expire after 24 hours. 
                You can extend your session or logout now.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogoutNow}
                  className="flex-1 px-4 py-2 rounded-xl transition-colors border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Now
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExtendSession}
                  className="flex-1 px-4 py-2 text-white rounded-xl transition-colors bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Extend Session
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiryWarning;