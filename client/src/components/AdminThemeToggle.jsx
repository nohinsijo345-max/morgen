import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';

/**
 * Animated Theme Toggle Button for Admin Portal
 */
const AdminThemeToggle = ({ size = 'md' }) => {
  const { isDarkMode, toggleTheme, colors } = useAdminTheme();
  
  const sizes = {
    sm: { button: 'w-9 h-9', icon: 'w-4 h-4' },
    md: { button: 'w-11 h-11', icon: 'w-5 h-5' },
    lg: { button: 'w-14 h-14', icon: 'w-6 h-6' }
  };
  
  const { button: buttonSize, icon: iconSize } = sizes[size] || sizes.md;
  
  return (
    <motion.button
      onClick={toggleTheme}
      className={`${buttonSize} rounded-xl relative overflow-hidden flex items-center justify-center shadow-lg`}
      style={{
        background: isDarkMode 
          ? `linear-gradient(135deg, ${colors.primary} 0%, #0f3424 100%)`
          : `linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)`,
        boxShadow: isDarkMode
          ? `0 4px 20px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 4px 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.5)`,
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: isDarkMode
          ? `0 6px 20px ${colors.primary}30, inset 0 1px 0 rgba(255,255,255,0.15)`
          : `0 6px 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.6)`,
      }}
      whileTap={{ scale: 0.95 }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Subtle background glow */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-50"
        animate={{
          background: isDarkMode
            ? [
                `radial-gradient(circle at 50% 50%, ${colors.accent}20 0%, transparent 70%)`,
                `radial-gradient(circle at 50% 50%, ${colors.accent}10 0%, transparent 70%)`,
                `radial-gradient(circle at 50% 50%, ${colors.accent}20 0%, transparent 70%)`
              ]
            : [
                'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%)'
              ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Subtle stars for dark mode */}
      <AnimatePresence>
        {isDarkMode && (
          <>
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-60"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.2, 0.6, 0.2],
                  scale: [0.8, 1, 0.8],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  top: `${25 + i * 30}%`,
                  left: `${20 + i * 40}%`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      
      {/* Icon container with subtle transition */}
      <motion.div
        className="relative z-10"
        initial={false}
        animate={{
          rotate: isDarkMode ? 0 : 180,
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <AnimatePresence mode="wait">
          {isDarkMode ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Moon 
                className={iconSize} 
                style={{ color: '#ffffff' }}
                strokeWidth={2.5}
              />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Sun 
                className={iconSize} 
                style={{ color: '#1e40af' }}
                strokeWidth={2.5}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Subtle ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ 
          scale: 1.5, 
          opacity: [0, 0.2, 0],
          transition: { duration: 0.3 }
        }}
        style={{
          background: isDarkMode ? colors.accent : '#3b82f6',
        }}
      />
    </motion.button>
  );
};

export default AdminThemeToggle;
