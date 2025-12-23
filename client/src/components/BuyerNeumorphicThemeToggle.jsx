import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useBuyerTheme } from '../context/BuyerThemeContext';

const BuyerNeumorphicThemeToggle = ({ size = 'md' }) => {
  const { isDarkMode, toggleTheme, colors } = useBuyerTheme();

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} relative rounded-full p-1 transition-all duration-300 shadow-inner`}
      style={{
        backgroundColor: isDarkMode ? '#2D2D2D' : '#F0F0F0',
        boxShadow: isDarkMode 
          ? 'inset 2px 2px 5px #1a1a1a, inset -2px -2px 5px #404040'
          : 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} rounded-full flex items-center justify-center transition-all duration-300`}
        style={{
          backgroundColor: colors.primary,
          boxShadow: isDarkMode
            ? '2px 2px 5px #1a1a1a, -2px -2px 5px #404040'
            : '2px 2px 5px #d1d1d1, -2px -2px 5px #ffffff'
        }}
        animate={{
          x: isDarkMode ? (size === 'sm' ? 20 : size === 'md' ? 24 : 28) : 0
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDarkMode ? (
            <Moon className={`${iconSizes[size]} text-white`} />
          ) : (
            <Sun className={`${iconSizes[size]} text-white`} />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default BuyerNeumorphicThemeToggle;