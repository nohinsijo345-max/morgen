import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Modern Toggle Switch for Light/Dark Mode
 * Based on the provided design with text labels and sliding animation
 */
const ModernThemeToggle = ({ size = 'md' }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  
  const sizes = {
    sm: { 
      container: 'w-32 h-8', 
      circle: 'w-7 h-7', 
      text: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: { 
      container: 'w-40 h-10', 
      circle: 'w-9 h-9', 
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: { 
      container: 'w-48 h-12', 
      circle: 'w-11 h-11', 
      text: 'text-base',
      icon: 'w-5 h-5'
    }
  };
  
  const { container, circle, text, icon } = sizes[size] || sizes.md;
  
  return (
    <motion.button
      onClick={toggleTheme}
      className={`${container} relative rounded-full p-1 transition-all duration-300 shadow-lg`}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
          : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
        boxShadow: isDarkMode
          ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
          : 'inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.1)',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Background Track */}
      <div className="absolute inset-1 rounded-full overflow-hidden">
        {/* Light Mode Side */}
        <div 
          className="absolute left-0 top-0 bottom-0 right-1/2 flex items-center justify-center"
          style={{
            background: !isDarkMode 
              ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              : 'transparent'
          }}
        >
          <div className="flex items-center gap-1">
            <Sun 
              className={icon} 
              style={{ 
                color: !isDarkMode ? colors.primary : colors.textMuted,
                opacity: !isDarkMode ? 1 : 0.4
              }} 
            />
            <span 
              className={`${text} font-medium`}
              style={{ 
                color: !isDarkMode ? colors.textPrimary : colors.textMuted,
                opacity: !isDarkMode ? 1 : 0.4
              }}
            >
              LIGHT
            </span>
          </div>
        </div>
        
        {/* Dark Mode Side */}
        <div 
          className="absolute right-0 top-0 bottom-0 left-1/2 flex items-center justify-center"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
              : 'transparent'
          }}
        >
          <div className="flex items-center gap-1">
            <Moon 
              className={icon} 
              style={{ 
                color: isDarkMode ? '#ffffff' : colors.textMuted,
                opacity: isDarkMode ? 1 : 0.4
              }} 
            />
            <span 
              className={`${text} font-medium`}
              style={{ 
                color: isDarkMode ? '#ffffff' : colors.textMuted,
                opacity: isDarkMode ? 1 : 0.4
              }}
            >
              DARK
            </span>
          </div>
        </div>
      </div>
      
      {/* Sliding Circle */}
      <motion.div
        className={`${circle} rounded-full relative z-10 flex items-center justify-center shadow-lg`}
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #718096 0%, #4a5568 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
          boxShadow: isDarkMode
            ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
        animate={{
          x: isDarkMode ? '100%' : '0%',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
          duration: 0.3
        }}
      >
        {/* Active Icon */}
        <motion.div
          key={isDarkMode ? 'moon' : 'sun'}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {isDarkMode ? (
            <Moon 
              className={icon} 
              style={{ color: '#ffffff' }}
              strokeWidth={2.5}
            />
          ) : (
            <Sun 
              className={icon} 
              style={{ color: colors.primary }}
              strokeWidth={2.5}
            />
          )}
        </motion.div>
      </motion.div>
      
      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          background: isDarkMode
            ? 'radial-gradient(ellipse at 75% 50%, rgba(113, 128, 150, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 25% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 70%)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

export default ModernThemeToggle;