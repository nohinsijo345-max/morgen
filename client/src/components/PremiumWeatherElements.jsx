import { motion } from 'framer-motion';

// ============================================
// PREMIUM SUN - Detailed 3D with corona effects
// ============================================
export const PremiumSun = ({ size = 'normal' }) => {
  const dimensions = size === 'small' ? 'w-28 h-28' : size === 'large' ? 'w-48 h-48' : 'w-36 h-36';
  const sunRadius = size === 'small' ? 28 : size === 'large' ? 45 : 35;
  
  return (
    <motion.div 
      className={`relative ${dimensions}`}
      initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
    >
      {/* Outer corona glow */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(255,180,50,0.4) 0%, rgba(255,140,0,0.2) 40%, transparent 70%)',
          filter: 'blur(20px)'
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Inner warm glow */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(255,220,100,0.5) 0%, transparent 50%)',
          filter: 'blur(15px)'
        }}
        animate={{ scale: [1.1, 1.3, 1.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
        <defs>
          {/* Premium sun body gradient */}
          <radialGradient id="premiumSunBody" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#FFFEF0" />
            <stop offset="15%" stopColor="#FFF3B0" />
            <stop offset="35%" stopColor="#FFE066" />
            <stop offset="55%" stopColor="#FFD700" />
            <stop offset="75%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF8C00" />
          </radialGradient>
          
          {/* Ray gradient */}
          <linearGradient id="premiumRayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
            <stop offset="30%" stopColor="#FFAA00" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FF8800" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
          </linearGradient>
          
          {/* Corona gradient */}
          <radialGradient id="coronaGrad" cx="50%" cy="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="80%" stopColor="rgba(255,200,100,0.15)" />
            <stop offset="100%" stopColor="rgba(255,150,50,0.05)" />
          </radialGradient>
          
          {/* Glow filter */}
          <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated corona ring */}
        <motion.circle
          cx="100" cy="100" r="70"
          fill="url(#coronaGrad)"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        {/* Long rays */}
        {[...Array(12)].map((_, i) => (
          <motion.line
            key={`long-${i}`}
            x1="100" y1="100" x2="100" y2={size === 'small' ? 25 : 15}
            stroke="url(#premiumRayGrad)"
            strokeWidth={size === 'small' ? 4 : 6}
            strokeLinecap="round"
            filter="url(#sunGlow)"
            transform={`rotate(${i * 30} 100 100)`}
            animate={{ 
              opacity: [0.5, 1, 0.5], 
              strokeWidth: size === 'small' ? [3, 5, 3] : [5, 8, 5] 
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
        
        {/* Short rays between long rays */}
        {[...Array(12)].map((_, i) => (
          <motion.line
            key={`short-${i}`}
            x1="100" y1="100" x2="100" y2={size === 'small' ? 40 : 30}
            stroke="url(#premiumRayGrad)"
            strokeWidth={size === 'small' ? 2 : 3}
            strokeLinecap="round"
            transform={`rotate(${i * 30 + 15} 100 100)`}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
        
        {/* Main sun body */}
        <motion.circle
          cx="100" cy="100" r={sunRadius}
          fill="url(#premiumSunBody)"
          filter="url(#sunGlow)"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Inner highlight */}
        <ellipse cx="88" cy="88" rx={sunRadius * 0.35} ry={sunRadius * 0.25} 
          fill="rgba(255,255,240,0.6)" transform="rotate(-30 88 88)" />
        
        {/* Surface details */}
        <circle cx="115" cy="105" r={sunRadius * 0.08} fill="rgba(255,180,0,0.4)" />
        <circle cx="90" cy="115" r={sunRadius * 0.06} fill="rgba(255,180,0,0.3)" />
      </svg>
    </motion.div>
  );
};

// ============================================
// PREMIUM MOON - Detailed crescent with craters
// ============================================
export const PremiumMoon = ({ size = 'normal' }) => {
  const dimensions = size === 'small' ? 'w-28 h-28' : size === 'large' ? 'w-48 h-48' : 'w-36 h-36';
  
  return (
    <motion.div 
      className={`relative ${dimensions}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      {/* Moon glow */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(200,220,255,0.5) 0%, rgba(150,180,220,0.2) 50%, transparent 70%)',
          filter: 'blur(20px)'
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <defs>
          {/* Moon surface gradient */}
          <radialGradient id="premiumMoonGrad" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#F5F5FA" />
            <stop offset="60%" stopColor="#E8E8F0" />
            <stop offset="85%" stopColor="#D0D0E0" />
            <stop offset="100%" stopColor="#B8B8D0" />
          </radialGradient>
          
          {/* Crater gradient */}
          <radialGradient id="craterGrad" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#C8C8D8" />
            <stop offset="100%" stopColor="#A8A8C0" />
          </radialGradient>
          
          {/* Moon glow filter */}
          <filter id="moonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Main moon body */}
        <circle cx="100" cy="100" r="55" fill="url(#premiumMoonGrad)" filter="url(#moonGlow)" />
        
        {/* Large craters */}
        <ellipse cx="75" cy="80" rx="12" ry="10" fill="url(#craterGrad)" opacity="0.5" />
        <ellipse cx="120" cy="110" rx="10" ry="8" fill="url(#craterGrad)" opacity="0.45" />
        <ellipse cx="90" cy="125" rx="8" ry="7" fill="url(#craterGrad)" opacity="0.4" />
        
        {/* Medium craters */}
        <circle cx="105" cy="75" r="5" fill="url(#craterGrad)" opacity="0.35" />
        <circle cx="135" cy="95" r="4" fill="url(#craterGrad)" opacity="0.3" />
        <circle cx="70" cy="105" r="4" fill="url(#craterGrad)" opacity="0.35" />
        
        {/* Small craters */}
        <circle cx="85" cy="95" r="2.5" fill="#C0C0D0" opacity="0.3" />
        <circle cx="115" cy="130" r="2" fill="#C0C0D0" opacity="0.25" />
        <circle cx="130" cy="80" r="2" fill="#C0C0D0" opacity="0.25" />
        
        {/* Highlight */}
        <ellipse cx="80" cy="75" rx="20" ry="15" fill="rgba(255,255,255,0.3)" transform="rotate(-20 80 75)" />
      </svg>
    </motion.div>
  );
};

// ============================================
// PREMIUM CLOUD - Fluffy 3D with depth
// ============================================
export const PremiumCloud = ({ isRaining = false, size = 'normal', isNight = false, isThunder = false, isFoggy = false }) => {
  const dimensions = size === 'small' ? 'w-32 h-24' : size === 'large' ? 'w-56 h-40' : 'w-40 h-28';
  
  const cloudColors = isFoggy
    ? { main: '#E5E7EB', light: '#F3F4F6', shadow: '#D1D5DB', highlight: 'rgba(255,255,255,0.8)' }
    : isNight 
    ? { main: '#A0A8B8', light: '#C0C8D8', shadow: '#606878', highlight: 'rgba(255,255,255,0.2)' }
    : isThunder
    ? { main: '#6B7280', light: '#9CA3AF', shadow: '#374151', highlight: 'rgba(255,255,255,0.15)' }
    : { main: '#FFFFFF', light: '#FFFFFF', shadow: '#D1D5DB', highlight: 'rgba(255,255,255,0.95)' };
  
  return (
    <motion.div 
      className={`relative ${dimensions}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      <svg className="w-full h-full" viewBox="0 0 220 140">
        <defs>
          {/* Main cloud gradient */}
          <linearGradient id={`cloudMain${isNight ? 'N' : isThunder ? 'T' : 'D'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cloudColors.light} />
            <stop offset="50%" stopColor={cloudColors.main} />
            <stop offset="100%" stopColor={cloudColors.shadow} />
          </linearGradient>
          
          {/* Top highlight gradient */}
          <radialGradient id={`cloudHighlight${isNight ? 'N' : 'D'}`} cx="30%" cy="20%">
            <stop offset="0%" stopColor={cloudColors.highlight} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          {/* Depth shadow */}
          <linearGradient id="cloudDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
          </linearGradient>
        </defs>
        
        {/* Shadow layer */}
        <g opacity="0.3">
          <ellipse cx="110" cy="95" rx="65" ry="35" fill={cloudColors.shadow} />
          <ellipse cx="55" cy="98" rx="45" ry="28" fill={cloudColors.shadow} />
          <ellipse cx="165" cy="98" rx="40" ry="25" fill={cloudColors.shadow} />
        </g>
        
        {/* Main cloud body */}
        <g>
          {/* Base layer */}
          <ellipse cx="110" cy="85" rx="68" ry="38" fill={`url(#cloudMain${isNight ? 'N' : isThunder ? 'T' : 'D'})`} />
          <ellipse cx="52" cy="90" rx="48" ry="32" fill={`url(#cloudMain${isNight ? 'N' : isThunder ? 'T' : 'D'})`} />
          <ellipse cx="168" cy="90" rx="42" ry="28" fill={`url(#cloudMain${isNight ? 'N' : isThunder ? 'T' : 'D'})`} />
          
          {/* Top puffs */}
          <ellipse cx="80" cy="55" rx="42" ry="32" fill={cloudColors.main} />
          <ellipse cx="140" cy="58" rx="38" ry="28" fill={cloudColors.main} />
          <ellipse cx="110" cy="48" rx="32" ry="25" fill={cloudColors.light} />
          
          {/* Extra puffs for volume */}
          <ellipse cx="60" cy="70" rx="25" ry="18" fill={cloudColors.main} />
          <ellipse cx="160" cy="72" rx="22" ry="16" fill={cloudColors.main} />
        </g>
        
        {/* Highlights */}
        <ellipse cx="75" cy="48" rx="28" ry="18" fill={`url(#cloudHighlight${isNight ? 'N' : 'D'})`} />
        <ellipse cx="125" cy="52" rx="22" ry="14" fill={`url(#cloudHighlight${isNight ? 'N' : 'D'})`} />
        <ellipse cx="100" cy="42" rx="18" ry="10" fill={cloudColors.highlight} />
        
        {/* Edge highlights */}
        <ellipse cx="45" cy="82" rx="8" ry="5" fill={cloudColors.highlight} opacity="0.6" />
        <ellipse cx="175" cy="84" rx="7" ry="4" fill={cloudColors.highlight} opacity="0.6" />
      </svg>
      
      {/* Premium rain drops */}
      {isRaining && (
        <div className="absolute bottom-0 left-1/4 w-1/2 h-20 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ 
                left: `${i * 10 + 2}%`,
                width: '3px',
                height: '20px',
                background: 'linear-gradient(to bottom, rgba(100,180,255,0.9), rgba(100,180,255,0.1))',
                borderRadius: '50%'
              }}
              animate={{ y: [0, 60], opacity: [1, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.06, ease: 'easeIn' }}
            />
          ))}
        </div>
      )}
      
      {/* Lightning for thunderstorm */}
      {isThunder && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 + Math.random() * 2 }}
        >
          <svg width="30" height="50" viewBox="0 0 30 50">
            <path d="M15 0 L8 20 L14 20 L6 50 L20 25 L13 25 L22 0 Z" 
              fill="#FFE066" stroke="#FFA500" strokeWidth="1" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};


// ============================================
// SMALL WEATHER ICONS - For hourly/daily forecasts
// ============================================
export const SmallWeatherIcon = ({ condition, isNight = false, size = 'normal' }) => {
  const cond = condition?.toLowerCase() || '';
  const iconSize = size === 'tiny' ? 'w-8 h-8' : 'w-12 h-12';
  
  // Rain icon - cloud with rain drops
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    return (
      <div className={`${iconSize} flex items-center justify-center`}>
        <svg className="w-full h-full" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="smallCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isNight ? '#A0A8B8' : '#E5E7EB'} />
              <stop offset="100%" stopColor={isNight ? '#707888' : '#9CA3AF'} />
            </linearGradient>
            <linearGradient id="rainDropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Cloud */}
          <ellipse cx="24" cy="16" rx="14" ry="9" fill="url(#smallCloudGrad)" />
          <ellipse cx="13" cy="18" rx="10" ry="7" fill="url(#smallCloudGrad)" />
          <ellipse cx="35" cy="18" rx="8" ry="6" fill="url(#smallCloudGrad)" />
          <ellipse cx="22" cy="11" rx="7" ry="5" fill={isNight ? '#B8C0D0' : '#F3F4F6'} />
          {/* Rain drops */}
          {[0, 1, 2, 3].map(i => (
            <motion.ellipse
              key={i}
              cx={13 + i * 8} cy="32"
              rx="1.8" ry="5"
              fill="url(#rainDropGrad)"
              animate={{ cy: [28, 40], opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </svg>
      </div>
    );
  }
  
  // Foggy/Mist/Haze icon - proper cloud with mist effect
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
    return (
      <div className={`${iconSize} flex items-center justify-center`}>
        <svg className="w-full h-full" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="mistCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isNight ? '#9CA3AF' : '#E5E7EB'} />
              <stop offset="100%" stopColor={isNight ? '#6B7280' : '#D1D5DB'} />
            </linearGradient>
          </defs>
          {/* Small cloud at top */}
          <ellipse cx="24" cy="14" rx="12" ry="8" fill="url(#mistCloudGrad)" />
          <ellipse cx="15" cy="16" rx="8" ry="6" fill="url(#mistCloudGrad)" />
          <ellipse cx="33" cy="16" rx="7" ry="5" fill="url(#mistCloudGrad)" />
          <ellipse cx="22" cy="10" rx="6" ry="4" fill={isNight ? '#B8C0D0' : '#F9FAFB'} />
          {/* Mist/fog lines below */}
          <motion.rect x="8" y="26" width="32" height="2.5" rx="1.25" fill={isNight ? '#9CA3AF' : '#D1D5DB'} 
            animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.rect x="10" y="32" width="28" height="2" rx="1" fill={isNight ? '#9CA3AF' : '#D1D5DB'} opacity="0.7"
            animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} />
          <motion.rect x="12" y="37" width="24" height="2" rx="1" fill={isNight ? '#9CA3AF' : '#D1D5DB'} opacity="0.5"
            animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 0.6 }} />
        </svg>
      </div>
    );
  }
  
  // Cloudy icon - fluffy cloud
  if (cond.includes('cloud') || cond.includes('overcast')) {
    return (
      <div className={`${iconSize} flex items-center justify-center`}>
        <svg className="w-full h-full" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="smallCloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isNight ? '#A0A8B8' : '#F3F4F6'} />
              <stop offset="100%" stopColor={isNight ? '#707888' : '#D1D5DB'} />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="24" rx="15" ry="11" fill="url(#smallCloudGrad2)" />
          <ellipse cx="12" cy="26" rx="11" ry="8" fill="url(#smallCloudGrad2)" />
          <ellipse cx="36" cy="26" rx="10" ry="7" fill="url(#smallCloudGrad2)" />
          <ellipse cx="20" cy="18" rx="8" ry="6" fill={isNight ? '#B8C0D0' : '#FFFFFF'} />
          <ellipse cx="30" cy="19" rx="6" ry="5" fill={isNight ? '#C0C8D8' : '#FFFFFF'} opacity="0.8" />
        </svg>
      </div>
    );
  }
  
  // Moon icon (night clear)
  if (isNight) {
    return (
      <div className={`${iconSize} flex items-center justify-center`}>
        <svg className="w-full h-full" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="smallMoonGrad" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E8E8F0" />
              <stop offset="100%" stopColor="#C8C8D8" />
            </radialGradient>
          </defs>
          <circle cx="24" cy="24" r="14" fill="url(#smallMoonGrad)" />
          <circle cx="18" cy="19" r="3.5" fill="#D0D0D8" opacity="0.4" />
          <circle cx="29" cy="26" r="2.5" fill="#D0D0D8" opacity="0.35" />
          <circle cx="21" cy="30" r="2" fill="#D0D0D8" opacity="0.3" />
          <ellipse cx="17" cy="17" rx="5" ry="4" fill="rgba(255,255,255,0.4)" transform="rotate(-20 17 17)" />
        </svg>
      </div>
    );
  }
  
  // Sun icon (day clear) - default
  return (
    <div className={`${iconSize} flex items-center justify-center`}>
      <svg className="w-full h-full" viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="smallSunGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <linearGradient id="smallRayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Rays */}
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={i}
            x1="24" y1="24" x2="24" y2="6"
            stroke="url(#smallRayGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 24 24)`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
        {/* Sun body */}
        <circle cx="24" cy="24" r="11" fill="url(#smallSunGrad)" />
        <ellipse cx="20" cy="20" rx="4" ry="2.5" fill="rgba(255,255,240,0.6)" transform="rotate(-30 20 20)" />
      </svg>
    </div>
  );
};

// ============================================
// WEATHER ICON SELECTOR
// ============================================
export const WeatherIcon = ({ condition, size = 'normal', isNight = false }) => {
  const cond = condition?.toLowerCase() || '';
  
  if (cond.includes('thunder') || cond.includes('storm')) {
    return <PremiumCloud isRaining={true} size={size} isNight={true} isThunder={true} />;
  }
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    return <PremiumCloud isRaining={true} size={size} isNight={isNight} />;
  }
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
    return <PremiumCloud isRaining={false} size={size} isNight={isNight} isFoggy={true} />;
  }
  if (cond.includes('cloud') || cond.includes('overcast')) {
    return <PremiumCloud isRaining={false} size={size} isNight={isNight} />;
  }
  if (isNight) {
    return <PremiumMoon size={size} />;
  }
  return <PremiumSun size={size} />;
};

export default { PremiumSun, PremiumMoon, PremiumCloud, SmallWeatherIcon, WeatherIcon };
