import { motion } from 'framer-motion';
import { MapPin, Wind, Droplets, ArrowUp, ArrowDown, Moon, Sun, Thermometer } from 'lucide-react';

// Check if it's night time
const isNightTime = () => {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 19;
};

// Animated Rain Drops
const RainDrops = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 bg-gradient-to-b from-white/50 to-transparent rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          height: `${12 + Math.random() * 15}px`,
        }}
        initial={{ top: -20, opacity: 0 }}
        animate={{ top: '110%', opacity: [0, 0.7, 0.7, 0] }}
        transition={{
          duration: 0.6 + Math.random() * 0.3,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: 'linear',
        }}
      />
    ))}
  </div>
);

// Animated Stars for Night
const Stars = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 60}%`,
        }}
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

// Moon Component
const MoonIcon = () => (
  <motion.div 
    className="absolute top-6 right-6 w-16 h-16"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3, type: 'spring' }}
  >
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full shadow-lg" />
      <div className="absolute top-2 left-3 w-4 h-4 bg-yellow-300/30 rounded-full" />
      <div className="absolute bottom-4 right-2 w-2 h-2 bg-yellow-300/20 rounded-full" />
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: '0 0 30px 10px rgba(255, 255, 200, 0.3)' }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  </motion.div>
);

// Sun Component
const SunIcon = () => (
  <motion.div 
    className="absolute top-4 right-4 w-20 h-20"
    animate={{ rotate: 360 }}
    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
  >
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute top-1/2 left-1/2 w-1 h-6 bg-gradient-to-t from-yellow-400/80 to-transparent rounded-full origin-bottom"
        style={{ transform: `rotate(${i * 45}deg) translateY(-100%)` }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </motion.div>
);

// Floating Clouds
const FloatingClouds = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute top-10 -left-8 w-16 h-8 bg-white/20 rounded-full blur-sm"
      animate={{ x: [0, 100, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="absolute top-20 right-0 w-12 h-6 bg-white/15 rounded-full blur-sm"
      animate={{ x: [0, -80, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

// Ultra Realistic 3D Character with Cinematic Lighting
const RealisticCharacter = ({ condition, isNight }) => {
  const getCharacterScene = () => {
    if (isNight) {
      // Night scene - person looking at stars with phone, purple/blue gradient
      return {
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=90',
        position: 'bottom-0 right-0',
        size: 'w-full h-full',
        opacity: 'opacity-70'
      };
    }
    
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('rain')) {
      // Rainy - person with umbrella in rain
      return {
        image: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=1200&q=90',
        position: 'bottom-0 right-0',
        size: 'w-full h-full',
        opacity: 'opacity-75'
      };
    }
    if (cond.includes('cloud')) {
      // Cloudy - person walking outdoors
      return {
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=90',
        position: 'bottom-0 right-0',
        size: 'w-full h-full',
        opacity: 'opacity-70'
      };
    }
    if (cond.includes('snow')) {
      // Snowy - person in winter scene
      return {
        image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=90',
        position: 'bottom-0 right-0',
        size: 'w-full h-full',
        opacity: 'opacity-70'
      };
    }
    // Sunny - farmer working in field
    return {
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=90',
      position: 'bottom-0 right-0',
      size: 'w-full h-full',
      opacity: 'opacity-65'
    };
  };

  const scene = getCharacterScene();

  return (
    <motion.div 
      className={`absolute ${scene.position} ${scene.size} pointer-events-none`}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
    >
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${scene.opacity}`}
        style={{
          backgroundImage: `url(${scene.image})`,
          filter: 'contrast(1.1) saturate(1.1)',
        }}
      />
      {/* Cinematic gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 50%)',
        }}
      />
    </motion.div>
  );
};

// Get background gradient based on weather and time
const getWeatherGradient = (condition, isNight) => {
  if (isNight) {
    return 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]';
  }
  
  const cond = condition?.toLowerCase() || '';
  if (cond.includes('rain')) return 'from-[#4a6fa5] via-[#5d8aa8] to-[#7fb3d3]';
  if (cond.includes('cloud')) return 'from-[#8faabe] via-[#a3b8c9] to-[#c4d4e0]';
  if (cond.includes('snow')) return 'from-[#a8c8dc] via-[#bdd4e4] to-[#d4e5ef]';
  return 'from-[#87ceeb] via-[#98d8ef] to-[#b8e6f7]';
};

const WeatherCard = ({ weather, onClick }) => {
  const isNight = isNightTime();
  
  if (!weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-3xl p-6 shadow-2xl relative overflow-hidden h-full min-h-[380px] flex items-center justify-center cursor-pointer"
        onClick={onClick}
      >
        <p className="text-white/80 text-lg">Loading weather...</p>
      </motion.div>
    );
  }

  const condition = weather.condition?.toLowerCase() || 'clear';
  const isRainy = condition.includes('rain');
  const isSunny = condition.includes('sunny') || condition.includes('clear');
  const isCloudy = condition.includes('cloud');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${getWeatherGradient(condition, isNight)} rounded-3xl shadow-2xl relative overflow-hidden h-full min-h-[380px] cursor-pointer`}
    >
      {/* Weather Effects */}
      {isRainy && <RainDrops />}
      {isNight && <Stars />}
      {(isCloudy || isRainy) && !isNight && <FloatingClouds />}
      
      {/* Sun or Moon */}
      {isNight ? <MoonIcon /> : (isSunny && <SunIcon />)}

      {/* Ultra Realistic Character - Full Background Integration */}
      <RealisticCharacter condition={weather.condition} isNight={isNight} />

      {/* Content - Positioned over character without blocking */}
      <div className="relative z-20 p-6 h-full flex flex-col">
        {/* Location */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-3"
        >
          <div className="bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-white font-medium text-sm">{weather.location || 'Your Location'}</span>
          </div>
        </motion.div>

        {/* Main Temperature - Top Left */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-1"
        >
          <div className="inline-block bg-black/20 backdrop-blur-md rounded-2xl px-4 py-2">
            <span className="text-6xl font-light text-white drop-shadow-lg">{weather.temperature}°</span>
          </div>
        </motion.div>

        {/* Condition */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-2"
        >
          <div className="inline-block bg-black/20 backdrop-blur-md rounded-xl px-3 py-1.5">
            <h3 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
              {isNight ? 'Clear Night' : weather.condition}
              {isNight ? <Moon className="w-4 h-4" /> : isSunny && <Sun className="w-4 h-4" />}
            </h3>
          </div>
        </motion.div>

        {/* High/Low - Compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-auto"
        >
          <div className="inline-block bg-black/20 backdrop-blur-md rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                {weather.tempMax || weather.temperature + 3}°
              </span>
              <span className="flex items-center gap-1">
                <ArrowDown className="w-3 h-3" />
                {weather.tempMin || weather.temperature - 5}°
              </span>
            </div>
          </div>
        </motion.div>

        {/* Weather Info Card - Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/25 backdrop-blur-md rounded-2xl p-4 border border-white/10"
        >
          <div className="flex justify-between text-white text-sm mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              <span className="font-medium">{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span className="font-medium">{weather.windSpeed} km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              <span className="font-medium">{weather.feelsLike || weather.temperature - 1}°</span>
            </div>
          </div>
          <p className="text-white/70 text-xs text-center">Tap for detailed forecast</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
