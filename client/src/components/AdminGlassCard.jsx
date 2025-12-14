import { motion } from 'framer-motion';
import { useAdminTheme } from '../context/AdminThemeContext';

/**
 * Apple-style Liquid Glass Card for Admin Portal
 */
const AdminGlassCard = ({ 
  children, 
  onClick, 
  className = '', 
  delay = 0,
  hoverScale = 1.02,
  glowColor = null,
  noPadding = false
}) => {
  const { isDarkMode, colors } = useAdminTheme();
  
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
        background: colors.glassBackground,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${colors.glassBorder}`,
        boxShadow: isDarkMode
          ? `0 8px 32px rgba(0, 0, 0, 0.4),
             inset 0 1px 0 rgba(255, 255, 255, 0.05),
             inset 0 -1px 0 rgba(0, 0, 0, 0.1)`
          : `0 8px 32px rgba(0, 0, 0, 0.08),
             inset 0 1px 0 rgba(255, 255, 255, 0.9),
             inset 0 -1px 0 rgba(0, 0, 0, 0.05)`,
      }}
    >
      {/* Top edge light reflection - Apple liquid glass effect */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: isDarkMode
            ? `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.15) 20%,
                rgba(255, 255, 255, 0.25) 50%,
                rgba(255, 255, 255, 0.15) 80%,
                transparent 100%)`
            : `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.8) 20%,
                rgba(255, 255, 255, 1) 50%,
                rgba(255, 255, 255, 0.8) 80%,
                transparent 100%)`
        }}
      />
      
      {/* Left edge light reflection */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-[1px] pointer-events-none"
        style={{
          background: isDarkMode
            ? `linear-gradient(180deg, 
                rgba(255, 255, 255, 0.2) 0%, 
                rgba(255, 255, 255, 0.08) 50%,
                transparent 100%)`
            : `linear-gradient(180deg, 
                rgba(255, 255, 255, 0.9) 0%, 
                rgba(255, 255, 255, 0.5) 50%,
                transparent 100%)`
        }}
      />
      
      {/* Subtle inner glow on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glow}15 0%, transparent 70%)`,
        }}
      />
      
      {/* Animated shine effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ 
          x: '200%', 
          opacity: 1,
          transition: { duration: 0.8, ease: 'easeInOut' }
        }}
        style={{
          background: `linear-gradient(
            90deg, 
            transparent 0%, 
            ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.4)'} 50%, 
            transparent 100%
          )`,
          transform: 'skewX(-20deg)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default AdminGlassCard;