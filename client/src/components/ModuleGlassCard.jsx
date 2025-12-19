import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ModuleGlassCard = ({ 
  module, 
  isHovered, 
  onHover, 
  onLeave, 
  onClick, 
  colors,
  index 
}) => {
  const Icon = module.icon;

  return (
    <motion.div
      whileHover={{ 
        y: -10,
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={onClick}
      className="group cursor-pointer relative overflow-hidden rounded-3xl backdrop-blur-xl border transition-all duration-500"
      style={{
        backgroundColor: isHovered ? colors.cardHover : colors.cardBackground,
        borderColor: colors.cardBorder,
        boxShadow: isHovered 
          ? `0 25px 50px -12px ${colors.accent}40` 
          : `0 10px 25px -5px ${colors.accent}20`
      }}
    >
      {/* Animated Background Gradient */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 0.05 : 0,
          scale: isHovered ? 1.2 : 0.8
        }}
        transition={{ duration: 0.5 }}
        className={`absolute inset-0 bg-gradient-to-br ${module.gradient} pointer-events-none`}
      />

      {/* Floating Particles Effect */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute w-1 h-1 rounded-full"
              style={{ 
                backgroundColor: colors.accent,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10 p-8">
        {/* Icon with Enhanced Animation */}
        <motion.div
          animate={{ 
            rotate: isHovered ? [0, -5, 5, 0] : 0,
            scale: isHovered ? 1.1 : 1,
            y: isHovered ? -5 : 0
          }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 300
          }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-6 shadow-lg relative overflow-hidden`}
        >
          {/* Icon Glow Effect */}
          <motion.div
            animate={{ 
              opacity: isHovered ? 0.3 : 0,
              scale: isHovered ? 1.5 : 1
            }}
            className={`absolute inset-0 bg-gradient-to-br ${module.gradient} blur-xl`}
          />
          
          <Icon className="w-8 h-8 text-white relative z-10" />
        </motion.div>

        {/* Title with Gradient Text */}
        <motion.h3 
          animate={{ 
            y: isHovered ? -2 : 0 
          }}
          className="text-2xl font-bold mb-3"
          style={{ 
            color: isHovered ? colors.accent : colors.text,
            transition: 'color 0.3s ease'
          }}
        >
          {module.title}
        </motion.h3>

        {/* Description */}
        <motion.p 
          animate={{ 
            y: isHovered ? -2 : 0 
          }}
          className="text-base mb-6 leading-relaxed"
          style={{ color: colors.textSecondary }}
        >
          {module.description}
        </motion.p>

        {/* Features with Staggered Animation */}
        <div className="space-y-2 mb-6">
          {module.features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.8 + (index * 0.1) + (idx * 0.05),
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 group/feature"
            >
              <motion.div 
                animate={{ 
                  scale: isHovered ? 1.2 : 1,
                  rotate: isHovered ? 180 : 0
                }}
                transition={{ delay: idx * 0.1 }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.accent }}
              />
              <span 
                className="text-sm transition-colors duration-300 group-hover/feature:font-medium"
                style={{ color: colors.textSecondary }}
              >
                {feature}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Action Button with Enhanced Interaction */}
        <motion.div
          animate={{ 
            x: isHovered ? 8 : 0,
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex items-center gap-3 font-semibold relative"
          style={{ color: colors.accent }}
        >
          <span className="relative">
            Enter Portal
            {/* Underline Animation */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
              style={{ backgroundColor: colors.accent }}
            />
          </span>
          
          <motion.div
            animate={{ 
              x: isHovered ? 5 : 0,
              rotate: isHovered ? 45 : 0
            }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute top-4 right-4 flex items-center gap-2"
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#10b981' }}
          />
          <span 
            className="text-xs font-medium"
            style={{ color: colors.textSecondary }}
          >
            Online
          </span>
        </motion.div>
      </div>

      {/* Edge Light Reflection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          x: isHovered ? ['-100%', '100%'] : '-100%'
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          x: { duration: 1.5, ease: "easeInOut" }
        }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.accent}20 50%, transparent 100%)`,
          transform: 'skewX(-20deg)'
        }}
      />
    </motion.div>
  );
};

export default ModuleGlassCard;