import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wind, Droplets } from 'lucide-react';

// Determine if it's currently night time
const useTimeOfDay = () => {
  const [isNight, setIsNight] = useState(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 19;
  });

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsNight(hour < 6 || hour >= 19);
    };
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return isNight;
};

// Get theme colors based on time and weather
const getThemeColors = (isNight, condition) => {
  const cond = condition?.toLowerCase() || '';
  
  // Thunderstorm - dark stormy sky
  if (cond.includes('thunder') || cond.includes('storm')) {
    return {
      gradient: 'from-[#2c3e50] via-[#34495e] to-[#2c3e50]',
      textPrimary: 'text-white',
      textSecondary: 'text-white/90',
      textMuted: 'text-white/70',
      cardBg: 'bg-white/10',
      border: 'border-white/20',
    };
  }
  
  // Rain - grey cloudy sky
  if (cond.includes('rain') || cond.includes('drizzle')) {
    return {
      gradient: 'from-[#4a5568] via-[#718096] to-[#4a5568]',
      textPrimary: 'text-white',
      textSecondary: 'text-white/90',
      textMuted: 'text-white/70',
      cardBg: 'bg-white/10',
      border: 'border-white/20',
    };
  }
  
  // Night time
  if (isNight) {
    return {
      gradient: 'from-[#0f0c29] via-[#302b63] to-[#24243e]',
      textPrimary: 'text-white',
      textSecondary: 'text-white/70',
      textMuted: 'text-white/50',
      cardBg: 'bg-white/5',
      border: 'border-white/10',
    };
  }
  
  // Day time - sunny
  return {
    gradient: 'from-[#56CCF2] via-[#2F80ED] to-[#1a5fb4]',
    textPrimary: 'text-white',
    textSecondary: 'text-white/90',
    textMuted: 'text-white/70',
    cardBg: 'bg-white/15',
    border: 'border-white/20',
  };
};

// Premium 3D Sun with enhanced graphics
const PremiumSun = ({ size = 'normal' }) => {
  const dimensions = size === 'small' ? 'w-24 h-24' : 'w-32 h-32';
  const sunSize = size === 'small' ? 'w-12 h-12' : 'w-16 h-16';
  
  return (
    <motion.div 
      className={`relative ${dimensions}`}
      initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
    >
      {/* Multiple glow layers */}
      <motion.div 
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: 'radial-gradient(circle, rgba(255,200,50,0.5) 0%, transparent 60%)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="absolute inset-0 rounded-full blur-md"
        style={{ background: 'radial-gradient(circle, rgba(255,165,0,0.4) 0%, transparent 50%)' }}
        animate={{ scale: [1.1, 1.4, 1.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Animated sun rays */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="sunRayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
            <stop offset="40%" stopColor="#FFA500" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
          <filter id="rayGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[...Array(12)].map((_, i) => (
          <motion.line
            key={i}
            x1="100" y1="100" x2="100" y2="20"
            stroke="url(#sunRayGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#rayGlow)"
            transform={`rotate(${i * 30} 100 100)`}
            animate={{ opacity: [0.4, 1, 0.4], strokeWidth: [4, 6, 4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </svg>
      
      {/* Main sun body with 3D effect */}
      <motion.div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${sunSize} rounded-full`}
        style={{
          background: 'radial-gradient(circle at 30% 30%, #FFF5CC 0%, #FFE066 20%, #FFD700 40%, #FFA500 70%, #FF8C00 100%)',
          boxShadow: `
            0 0 60px rgba(255, 165, 0, 0.8),
            0 0 120px rgba(255, 200, 50, 0.5),
            inset -10px -10px 30px rgba(255, 100, 0, 0.4),
            inset 10px 10px 30px rgba(255, 255, 200, 0.6)
          `
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Sun corona effect */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0) 50%, rgba(255,200,100,0.3) 100%)' }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
};

// Premium Moon for night time
const PremiumMoon = ({ size = 'normal' }) => {
  const dimensions = size === 'small' ? 'w-24 h-24' : 'w-32 h-32';
  
  return (
    <motion.div 
      className={`relative ${dimensions}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      {/* Moon glow */}
      <motion.div 
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: 'radial-gradient(circle, rgba(200,220,255,0.4) 0%, transparent 60%)' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="moonGrad" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E8E8F0" />
            <stop offset="100%" stopColor="#C8C8D8" />
          </radialGradient>
          <filter id="moonGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="50" cy="50" r="35" fill="url(#moonGrad)" filter="url(#moonGlow)" />
        {/* Moon craters */}
        <circle cx="40" cy="40" r="6" fill="#D0D0D8" opacity="0.5" />
        <circle cx="60" cy="55" r="4" fill="#D0D0D8" opacity="0.4" />
        <circle cx="45" cy="60" r="3" fill="#D0D0D8" opacity="0.3" />
      </svg>
    </motion.div>
  );
};

// Premium 3D Cloud - Enhanced luxury version without drop shadows
const PremiumCloud = ({ isRaining = false, size = 'normal', isNight = false }) => {
  const dimensions = size === 'small' ? 'w-28 h-20' : 'w-36 h-24';
  
  return (
    <motion.div 
      className={`relative ${dimensions}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 130">
        <defs>
          {/* Premium gradient for main cloud body */}
          <linearGradient id={`cloudMainGrad${isNight ? 'Night' : 'Day'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isNight ? '#B0B8C8' : '#FFFFFF'} />
            <stop offset="50%" stopColor={isNight ? '#8898A8' : '#F8F8FF'} />
            <stop offset="100%" stopColor={isNight ? '#707888' : '#E8E8F0'} />
          </linearGradient>
          
          {/* Highlight gradient for top portions */}
          <radialGradient id={`cloudHighlight${isNight ? 'Night' : 'Day'}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={isNight ? '#D0D8E8' : '#FFFFFF'} stopOpacity="1" />
            <stop offset="70%" stopColor={isNight ? '#A0A8B8' : '#F0F0F8'} stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          
          {/* Depth gradient for bottom portions */}
          <linearGradient id={`cloudDepth${isNight ? 'Night' : 'Day'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isNight ? '#707888' : '#D8D8E8'} stopOpacity="0.4" />
            <stop offset="100%" stopColor={isNight ? '#505868' : '#B8B8D0'} stopOpacity="0.7" />
          </linearGradient>
          
          {/* Inner glow for luxury effect */}
          <filter id="cloudGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="blur" in2="SourceGraphic" operator="atop" />
          </filter>
        </defs>
        
        {/* Main cloud body - multiple layers for 3D depth */}
        <g>
          {/* Bottom shadow layer (subtle, no drop shadow) */}
          <ellipse cx="100" cy="78" rx="56" ry="30" fill={`url(#cloudDepth${isNight ? 'Night' : 'Day'})`} opacity="0.5" />
          <ellipse cx="54" cy="82" rx="38" ry="24" fill={`url(#cloudDepth${isNight ? 'Night' : 'Day'})`} opacity="0.5" />
          <ellipse cx="146" cy="82" rx="33" ry="22" fill={`url(#cloudDepth${isNight ? 'Night' : 'Day'})`} opacity="0.5" />
          
          {/* Main cloud body */}
          <ellipse cx="100" cy="70" rx="58" ry="34" fill={`url(#cloudMainGrad${isNight ? 'Night' : 'Day'})`} />
          <ellipse cx="52" cy="76" rx="40" ry="28" fill={`url(#cloudMainGrad${isNight ? 'Night' : 'Day'})`} />
          <ellipse cx="148" cy="76" rx="35" ry="25" fill={`url(#cloudMainGrad${isNight ? 'Night' : 'Day'})`} />
          
          {/* Top puffs for volume */}
          <ellipse cx="75" cy="50" rx="36" ry="28" fill={`url(#cloudMainGrad${isNight ? 'Night' : 'Day'})`} />
          <ellipse cx="125" cy="52" rx="34" ry="26" fill={`url(#cloudMainGrad${isNight ? 'Night' : 'Day'})`} />
          <ellipse cx="100" cy="45" rx="28" ry="22" fill={`url(#cloudMainGrad${isNight ? 'Night' : 'Day'})`} />
          
          {/* Highlight layers for luxury shine */}
          <ellipse cx="70" cy="42" rx="24" ry="16" fill={`url(#cloudHighlight${isNight ? 'Night' : 'Day'})`} filter="url(#cloudGlow)" />
          <ellipse cx="115" cy="45" rx="20" ry="14" fill={`url(#cloudHighlight${isNight ? 'Night' : 'Day'})`} filter="url(#cloudGlow)" />
          <ellipse cx="90" cy="38" rx="16" ry="10" fill={isNight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.95)'} />
          
          {/* Edge highlights for definition */}
          <ellipse cx="50" cy="70" rx="8" ry="6" fill={isNight ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)'} />
          <ellipse cx="150" cy="72" rx="7" ry="5" fill={isNight ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)'} />
        </g>
      </svg>
      
      {/* Premium rain drops with enhanced glow */}
      {isRaining && (
        <div className="absolute bottom-0 left-1/4 w-1/2 h-16 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 rounded-full"
              style={{ 
                left: `${i * 14}%`,
                height: '18px',
                background: 'linear-gradient(to bottom, rgba(120,200,255,1), rgba(120,200,255,0.1))',
                filter: 'blur(0.5px)',
                boxShadow: '0 0 8px rgba(120,200,255,0.8), 0 0 4px rgba(255,255,255,0.6)'
              }}
              animate={{ y: [0, 50], opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08, ease: 'easeIn' }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Weather Icon Selector
const WeatherIcon = ({ condition, size = 'normal', isNight = false }) => {
  const cond = condition?.toLowerCase() || '';
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    return <PremiumCloud isRaining={true} size={size} isNight={isNight} />;
  }
  if (cond.includes('cloud') || cond.includes('overcast')) {
    return <PremiumCloud isRaining={false} size={size} isNight={isNight} />;
  }
  if (isNight) return <PremiumMoon size={size} />;
  return <PremiumSun size={size} />;
};

// Small Weather Icon for hourly forecast
const SmallWeatherIcon = ({ condition, isNight = false }) => {
  const cond = condition?.toLowerCase() || '';
  
  if (cond.includes('rain')) {
    return (
      <svg className="w-7 h-7" viewBox="0 0 40 40">
        <ellipse cx="20" cy="14" rx="11" ry="7" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="12" cy="16" rx="7" ry="5" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="28" cy="16" rx="6" ry="4" fill={isNight ? '#8090A0' : '#94A3B8'} />
        {[0, 1, 2].map(i => (
          <motion.line
            key={i}
            x1={12 + i * 8} y1="24" x2={10 + i * 8} y2="32"
            stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round"
            animate={{ y: [0, 5], opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </svg>
    );
  }
  
  if (cond.includes('cloud')) {
    return (
      <svg className="w-7 h-7" viewBox="0 0 40 40">
        <ellipse cx="20" cy="18" rx="11" ry="7" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="12" cy="20" rx="7" ry="5" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="28" cy="20" rx="6" ry="4" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="18" cy="14" rx="5" ry="3" fill={isNight ? '#A0A8B0' : '#CBD5E1'} />
      </svg>
    );
  }
  
  // Sun or Moon
  if (isNight) {
    return (
      <svg className="w-7 h-7" viewBox="0 0 40 40">
        <defs>
          <radialGradient id="tinyMoon" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D0D0E0" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="10" fill="url(#tinyMoon)" />
        <circle cx="16" cy="17" r="2" fill="#C0C0D0" opacity="0.5" />
      </svg>
    );
  }
  
  return (
    <svg className="w-7 h-7" viewBox="0 0 40 40">
      <defs>
        <radialGradient id="tinySunGrad">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      {[...Array(8)].map((_, i) => (
        <motion.line
          key={i}
          x1="20" y1="20" x2="20" y2="6"
          stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${i * 45} 20 20)`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
      <circle cx="20" cy="20" r="8" fill="url(#tinySunGrad)" />
    </svg>
  );
};

// Animated Stars Background (only for night)
const StarsBackground = () => {
  const stars = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: (i * 17 + 7) % 100,
      top: (i * 13 + 5) % 70,
      size: (i % 3) + 1,
      delay: (i % 5) * 0.4,
      duration: 2 + (i % 3),
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{ width: star.size, height: star.size, left: `${star.left}%`, top: `${star.top}%` }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
        />
      ))}
    </div>
  );
};

// Animated Clouds Background (for day)
const CloudsBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
    <motion.div
      className="absolute top-10 -left-20 w-40 h-20 bg-white/40 rounded-full blur-xl"
      animate={{ x: [0, 100, 0] }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="absolute top-20 -right-10 w-32 h-16 bg-white/30 rounded-full blur-xl"
      animate={{ x: [0, -80, 0] }}
      transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

const WeatherCard = ({ weather, onClick }) => {
  const isNight = useTimeOfDay();
  const actualIsNight = weather?.isNight ?? isNight;
  const theme = getThemeColors(actualIsNight, weather?.condition);

  if (!weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${theme.gradient} rounded-3xl p-6 shadow-2xl relative overflow-hidden h-full flex items-center justify-center cursor-pointer`}
        onClick={onClick}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
        />
      </motion.div>
    );
  }

  const currentHour = new Date().getHours();
  const hourlyData = [
    { time: `${String((currentHour - 1 + 24) % 24).padStart(2, '0')}:00`, offset: -1, condition: 'cloudy' },
    { time: 'Now', offset: 0, condition: weather.condition },
    { time: `${String((currentHour + 1) % 24).padStart(2, '0')}:00`, offset: 1, condition: weather.condition },
    { time: `${String((currentHour + 2) % 24).padStart(2, '0')}:00`, offset: 2, condition: 'sunny' },
    { time: `${String((currentHour + 3) % 24).padStart(2, '0')}:00`, offset: -1, condition: 'sunny' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5)' }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${theme.gradient} rounded-3xl shadow-2xl relative overflow-hidden h-full cursor-pointer border border-white/10`}
      style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Background effects */}
      {(() => {
        const cond = weather?.condition?.toLowerCase() || '';
        if (cond.includes('thunder') || cond.includes('storm')) {
          return (
            <>
              <StarsBackground />
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 3 + 2 }}
                className="absolute inset-0 bg-white/20"
              />
            </>
          );
        }
        if (cond.includes('rain') || cond.includes('drizzle')) {
          return <CloudsBackground />;
        }
        return actualIsNight ? <StarsBackground /> : <CloudsBackground />;
      })()}

      {/* Content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Location */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-8 h-8 rounded-full ${theme.cardBg} backdrop-blur-xl flex items-center justify-center border ${theme.border} shadow-lg`}
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
          >
            <MapPin className="w-4 h-4 text-white/90" />
          </motion.div>
          <span className={`${theme.textPrimary} font-semibold text-sm tracking-wide drop-shadow-md`}>
            {(weather.location || 'YOUR LOCATION').toUpperCase()}
          </span>
        </motion.div>

        {/* Temperature & Icon Row */}
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className={`text-6xl font-extralight ${theme.textPrimary}`}>{weather.temperature}°</span>
            <p className={`${theme.textMuted} text-xs mt-0.5 capitalize`}>{weather.description || weather.condition || 'Clear'}</p>
          </motion.div>

          <WeatherIcon condition={weather.condition} size="small" isNight={actualIsNight} />
        </div>

        {/* Hourly Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-2xl p-2 border ${theme.border} shadow-lg`}
          style={{ 
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
          }}
        >
          <div className="flex justify-between items-center">
            {hourlyData.map((hour, i) => {
              const temp = weather.temperature + hour.offset;
              const isNow = hour.time === 'Now';
              return (
                <div 
                  key={i} 
                  className={`flex flex-col items-center py-1 px-1 rounded-xl transition-all ${
                    isNow ? `${theme.cardBg} border ${theme.border}` : ''
                  }`}
                >
                  <span className={`text-[9px] mb-1 ${isNow ? `${theme.textPrimary} font-semibold` : theme.textMuted}`}>
                    {hour.time}
                  </span>
                  <SmallWeatherIcon condition={hour.condition} isNight={actualIsNight} />
                  <span className={`text-[11px] mt-1 font-medium ${isNow ? theme.textPrimary : theme.textSecondary}`}>
                    {temp}°
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weather Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-2xl p-2.5 border ${theme.border} shadow-lg`}
          style={{ 
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
          }}
        >
          <div className="flex justify-between text-sm mb-1.5">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className={`w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400/30 to-blue-600/30 flex items-center justify-center shadow-md backdrop-blur-sm`}
              >
                <Droplets className="w-3.5 h-3.5 text-blue-300 drop-shadow-md" />
              </motion.div>
              <div>
                <p className={`${theme.textMuted} text-[9px] uppercase tracking-wider mb-0.5 drop-shadow-sm`}>Humidity</p>
                <span className={`${theme.textPrimary} font-semibold text-sm drop-shadow-md`}>{weather.humidity}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -10 }}
                className={`w-8 h-8 rounded-xl bg-gradient-to-br from-gray-400/30 to-gray-600/30 flex items-center justify-center shadow-md backdrop-blur-sm`}
              >
                <Wind className="w-3.5 h-3.5 text-gray-200 drop-shadow-md" />
              </motion.div>
              <div>
                <p className={`${theme.textMuted} text-[9px] uppercase tracking-wider mb-0.5 drop-shadow-sm`}>Wind</p>
                <span className={`${theme.textPrimary} font-semibold text-sm drop-shadow-md`}>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
          <motion.p 
            whileHover={{ scale: 1.05 }}
            className={`${theme.textMuted} text-[9px] text-center tracking-widest uppercase drop-shadow-sm`}
          >
            Tap for detailed forecast
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
