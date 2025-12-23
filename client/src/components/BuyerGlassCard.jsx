import { motion } from 'framer-motion';
import { useBuyerTheme } from '../context/BuyerThemeContext';

/**
 * Buyer-specific Glass Card with enhanced dark mode transparency and reflective effects
 */
const BuyerGlassCard = ({ 
  children, 
  onClick, 
  className = '', 
  delay = 0,
  hoverScale = 1.02,
  glowColor = null,
  noPadding = false
}) => {
  const { isDarkMode, colors } = useBuyerTheme();
  
  // Use provided glow color or default to primary
  const glow = glowColor || colors.primary;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ 
        scale: hoverScale, 
        y: -5,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-3xl group
        ${onClick ? 'cursor-pointer' : ''}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
      style={{
        background: isDarkMode 
          ? `linear-gradient(135deg, 
              rgba(255, 107, 122, 0.08) 0%, 
              rgba(255, 138, 149, 0.05) 25%,
              rgba(255, 107, 122, 0.03) 50%,
              rgba(255, 138, 149, 0.05) 75%,
              rgba(255, 107, 122, 0.08) 100%)`
          : `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(248, 250, 252, 0.8) 50%,
              rgba(255, 255, 255, 0.95) 100%)`,
        backdropFilter: isDarkMode ? 'blur(25px) saturate(200%)' : 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: isDarkMode ? 'blur(25px) saturate(200%)' : 'blur(20px) saturate(180%)',
        border: isDarkMode 
          ? `1px solid rgba(255, 107, 122, 0.15)` 
          : `1px solid rgba(255, 71, 87, 0.1)`,
        boxShadow: isDarkMode
          ? `0 12px 40px rgba(0, 0, 0, 0.6),
             0 4px 16px rgba(255, 107, 122, 0.1),
             inset 0 1px 0 rgba(255, 107, 122, 0.2),
             inset 0 -1px 0 rgba(0, 0, 0, 0.2)`
          : `0 8px 32px rgba(255, 71, 87, 0.12),
             0 4px 16px rgba(0, 0, 0, 0.08),
             inset 0 1px 0 rgba(255, 255, 255, 0.9),
             inset 0 -1px 0 rgba(255, 71, 87, 0.05)`,
      }}
    >
      {/* Enhanced top edge light reflection */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background: isDarkMode
            ? `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 107, 122, 0.3) 10%,
                rgba(255, 138, 149, 0.5) 30%,
                rgba(255, 107, 122, 0.6) 50%,
                rgba(255, 138, 149, 0.5) 70%,
                rgba(255, 107, 122, 0.3) 90%,
                transparent 100%)`
            : `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.6) 20%,
                rgba(255, 255, 255, 0.9) 50%,
                rgba(255, 255, 255, 0.6) 80%,
                transparent 100%)`
        }}
      />
      
      {/* Enhanced left edge light reflection */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-[2px] pointer-events-none"
        style={{
          background: isDarkMode
            ? `linear-gradient(180deg, 
                rgba(255, 107, 122, 0.4) 0%, 
                rgba(255, 138, 149, 0.2) 30%,
                rgba(255, 107, 122, 0.1) 60%,
                transparent 100%)`
            : `linear-gradient(180deg, 
                rgba(255, 255, 255, 0.9) 0%, 
                rgba(255, 255, 255, 0.5) 50%,
                transparent 100%)`
        }}
      />
      
      {/* Right edge subtle reflection */}
      <div 
        className="absolute top-0 right-0 bottom-0 w-[1px] pointer-events-none"
        style={{
          background: isDarkMode
            ? `linear-gradient(180deg, 
                rgba(255, 107, 122, 0.2) 0%, 
                rgba(255, 107, 122, 0.05) 50%,
                transparent 100%)`
            : `linear-gradient(180deg, 
                rgba(255, 71, 87, 0.1) 0%, 
                transparent 100%)`
        }}
      />
      
      {/* Enhanced inner glow on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-3xl opacity-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: isDarkMode
            ? `radial-gradient(ellipse at 50% 0%, ${glow}25 0%, ${glow}10 40%, transparent 70%)`
            : `radial-gradient(ellipse at 50% 0%, ${glow}15 0%, transparent 70%)`,
        }}
      />
      
      {/* Animated shine effect on hover - enhanced for dark mode */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ 
          x: '200%', 
          opacity: 1,
          transition: { duration: 0.8, ease: 'easeInOut' }
        }}
        style={{
          background: isDarkMode
            ? `linear-gradient(
                90deg, 
                transparent 0%, 
                rgba(255, 107, 122, 0.15) 30%,
                rgba(255, 138, 149, 0.25) 50%, 
                rgba(255, 107, 122, 0.15) 70%,
                transparent 100%
              )`
            : `linear-gradient(
                90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.4) 50%, 
                transparent 100%
              )`,
          transform: 'skewX(-20deg)',
        }}
      />
      
      {/* Subtle corner highlights for premium feel */}
      <div 
        className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
        style={{
          background: isDarkMode
            ? `radial-gradient(circle at 0% 0%, rgba(255, 107, 122, 0.3) 0%, transparent 70%)`
            : `radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.8) 0%, transparent 70%)`
        }}
      />
      
      <div 
        className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
        style={{
          background: isDarkMode
            ? `radial-gradient(circle at 100% 0%, rgba(255, 107, 122, 0.2) 0%, transparent 70%)`
            : `radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.6) 0%, transparent 70%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default BuyerGlassCard;