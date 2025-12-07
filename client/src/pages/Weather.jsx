import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Wind, 
  Droplets, 
  Thermometer,
  Sun,
  Moon,
  CloudRain,
  Cloud,
  Snowflake,
  Eye,
  Gauge,
  Sunrise,
  Sunset
} from 'lucide-react';
import axios from 'axios';

// Check if it's night time
const isNightTime = () => {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 19;
};

// Animated Stars for Night
const Stars = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(40)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 50}%`,
        }}
        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

// Rain Animation
const RainEffect = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 bg-gradient-to-b from-white/40 to-transparent rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          height: `${15 + Math.random() * 20}px`,
        }}
        initial={{ top: -20, opacity: 0 }}
        animate={{ top: '110%', opacity: [0, 0.6, 0.6, 0] }}
        transition={{
          duration: 0.7 + Math.random() * 0.3,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: 'linear',
        }}
      />
    ))}
  </div>
);

// Ultra Realistic Person for Weather Page
const WeatherPerson = ({ condition, isNight }) => {
  const getScene = () => {
    if (isNight) return 'night';
    const cond = condition?.toLowerCase() || '';
    if (cond.includes('rain')) return 'rainy';
    if (cond.includes('cloud')) return 'cloudy';
    if (cond.includes('snow')) return 'snowy';
    return 'sunny';
  };

  const scene = getScene();

  return (
    <motion.div 
      className="w-full h-80 flex items-end justify-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <svg viewBox="0 0 200 280" className="h-full drop-shadow-2xl">
        {/* Ground */}
        <ellipse cx="100" cy="275" rx="60" ry="8" fill="rgba(0,0,0,0.1)" />
        
        {scene === 'rainy' && (
          <g>
            {/* Large umbrella */}
            <motion.g animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 5, repeat: Infinity }} style={{ transformOrigin: '100px 80px' }}>
              <path d="M100 30 L100 160" stroke="#1a365d" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="100" cy="30" rx="70" ry="35" fill="#2c5282" />
              <ellipse cx="100" cy="30" rx="65" ry="30" fill="#3182ce" />
              <path d="M35 30 Q100 -15 165 30" fill="#4299e1" />
            </motion.g>
            {/* Person */}
            <circle cx="100" cy="145" r="20" fill="#deb887" />
            <path d="M80 138 Q100 125 120 138" fill="#4a3728" />
            <circle cx="92" cy="143" r="3" fill="#2c3e50" />
            <circle cx="108" cy="143" r="3" fill="#2c3e50" />
            <path d="M95 152 Q100 156 105 152" stroke="#8b7355" strokeWidth="2" fill="none" />
            {/* Raincoat */}
            <path d="M100 165 L100 230" stroke="#0d9488" strokeWidth="40" strokeLinecap="round" />
            <path d="M70 175 L50 210" stroke="#0d9488" strokeWidth="14" strokeLinecap="round" />
            <path d="M130 175 L145 155" stroke="#0d9488" strokeWidth="14" strokeLinecap="round" />
            {/* Legs */}
            <path d="M85 230 L80 268" stroke="#5d4e37" strokeWidth="16" strokeLinecap="round" />
            <path d="M115 230 L120 268" stroke="#5d4e37" strokeWidth="16" strokeLinecap="round" />
            {/* Boots */}
            <ellipse cx="80" cy="270" rx="14" ry="6" fill="#2c3e50" />
            <ellipse cx="120" cy="270" rx="14" ry="6" fill="#2c3e50" />
          </g>
        )}

        {scene === 'sunny' && (
          <g>
            {/* Farmer working */}
            <circle cx="100" cy="120" r="22" fill="#deb887" />
            {/* Straw hat */}
            <ellipse cx="100" cy="105" rx="35" ry="10" fill="#d4a574" />
            <path d="M75 105 Q100 80 125 105" fill="#c4956a" />
            <ellipse cx="100" cy="105" rx="28" ry="7" fill="#e4b584" />
            {/* Face */}
            <circle cx="92" cy="118" r="3" fill="#2c3e50" />
            <circle cx="108" cy="118" r="3" fill="#2c3e50" />
            <path d="M95 128 Q100 133 105 128" stroke="#8b7355" strokeWidth="2" fill="none" />
            {/* Shirt */}
            <path d="M100 142 L100 210" stroke="#3498db" strokeWidth="38" strokeLinecap="round" />
            <path d="M85 145 L100 158 L115 145" stroke="#2980b9" strokeWidth="4" fill="none" />
            {/* Arms - one holding tool */}
            <motion.g animate={{ rotate: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: '70px 160px' }}>
              <path d="M70 160 L40 130" stroke="#deb887" strokeWidth="12" strokeLinecap="round" />
              {/* Hoe/tool */}
              <path d="M35 125 L25 115" stroke="#8b4513" strokeWidth="4" strokeLinecap="round" />
              <path d="M20 110 L35 120" stroke="#6b7280" strokeWidth="6" strokeLinecap="round" />
            </motion.g>
            <path d="M130 160 L155 190" stroke="#deb887" strokeWidth="12" strokeLinecap="round" />
            {/* Pants */}
            <path d="M85 210 L80 265" stroke="#7f8c8d" strokeWidth="16" strokeLinecap="round" />
            <path d="M115 210 L120 265" stroke="#7f8c8d" strokeWidth="16" strokeLinecap="round" />
            {/* Work boots */}
            <ellipse cx="80" cy="268" rx="14" ry="6" fill="#8b4513" />
            <ellipse cx="120" cy="268" rx="14" ry="6" fill="#8b4513" />
          </g>
        )}

        {scene === 'cloudy' && (
          <g>
            {/* Person walking with coffee */}
            <circle cx="100" cy="125" r="20" fill="#deb887" />
            <path d="M80 118 Q100 105 120 118" fill="#3d2314" />
            <circle cx="92" cy="123" r="3" fill="#2c3e50" />
            <circle cx="108" cy="123" r="3" fill="#2c3e50" />
            {/* Jacket */}
            <path d="M100 145 L100 215" stroke="#34495e" strokeWidth="38" strokeLinecap="round" />
            <line x1="100" y1="148" x2="100" y2="215" stroke="#2c3e50" strokeWidth="3" />
            {/* Arms */}
            <path d="M68 160 L55 195" stroke="#34495e" strokeWidth="14" strokeLinecap="round" />
            <path d="M132 160 L150 180" stroke="#34495e" strokeWidth="14" strokeLinecap="round" />
            {/* Coffee cup */}
            <rect x="145" y="175" width="15" height="20" rx="3" fill="#ecf0f1" />
            <rect x="145" y="175" width="15" height="5" rx="2" fill="#bdc3c7" />
            {/* Pants */}
            <path d="M85 215 L80 265" stroke="#bdc3c7" strokeWidth="16" strokeLinecap="round" />
            <path d="M115 215 L120 265" stroke="#bdc3c7" strokeWidth="16" strokeLinecap="round" />
            {/* Sneakers */}
            <ellipse cx="80" cy="268" rx="14" ry="6" fill="#ecf0f1" />
            <ellipse cx="120" cy="268" rx="14" ry="6" fill="#ecf0f1" />
          </g>
        )}

        {scene === 'night' && (
          <g>
            {/* Ultra Realistic Person Stargazing with Phone */}
            
            {/* Body - Modern hoodie with realistic folds */}
            <defs>
              <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3a4a5c', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#2c3e50', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#1a252f', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f5d5b8', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#d4a574', stopOpacity: 1 }} />
              </linearGradient>
              <radialGradient id="phoneGlow">
                <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
              </radialGradient>
            </defs>
            
            {/* Torso - hoodie with depth */}
            <ellipse cx="100" cy="180" rx="32" ry="45" fill="url(#hoodieGrad)" />
            <path d="M68 165 Q100 155 132 165" stroke="#4a5a6c" strokeWidth="2" fill="none" />
            
            {/* Hood */}
            <path d="M70 135 Q100 115 130 135 L130 155 Q100 145 70 155 Z" fill="#34495e" />
            <path d="M75 140 Q100 125 125 140" stroke="#4a5a6c" strokeWidth="1.5" fill="none" />
            
            {/* Neck */}
            <rect x="92" y="145" width="16" height="12" rx="3" fill="url(#skinGrad)" />
            
            {/* Head - realistic proportions */}
            <ellipse cx="100" cy="130" rx="18" ry="22" fill="url(#skinGrad)" />
            
            {/* Ear detail */}
            <ellipse cx="82" cy="132" rx="3" ry="5" fill="#d4a574" opacity="0.8" />
            <ellipse cx="118" cy="132" rx="3" ry="5" fill="#d4a574" opacity="0.8" />
            
            {/* Hair - modern style */}
            <path d="M82 115 Q100 105 118 115 Q120 120 118 128 Q100 118 82 128 Q80 120 82 115" fill="#2c1810" />
            <path d="M85 112 Q100 108 115 112" stroke="#1a0f08" strokeWidth="1.5" fill="none" />
            
            {/* Eyebrows */}
            <path d="M88 122 Q92 120 96 121" stroke="#3d2314" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M104 121 Q108 120 112 122" stroke="#3d2314" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Eyes looking up at stars - detailed */}
            <ellipse cx="92" cy="127" rx="4" ry="5" fill="white" />
            <ellipse cx="108" cy="127" rx="4" ry="5" fill="white" />
            <circle cx="92" cy="125" r="3" fill="#2c3e50" />
            <circle cx="108" cy="125" r="3" fill="#2c3e50" />
            <circle cx="93" cy="124" r="1.5" fill="white" opacity="0.9" />
            <circle cx="109" cy="124" r="1.5" fill="white" opacity="0.9" />
            
            {/* Nose - subtle */}
            <path d="M100 132 L98 136 L100 137" stroke="#c4956a" strokeWidth="1" fill="none" />
            
            {/* Mouth - slight smile */}
            <path d="M95 140 Q100 142 105 140" stroke="#b8876a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            
            {/* Right arm holding phone up */}
            <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity }} style={{ transformOrigin: '130px 170px' }}>
              <path d="M130 170 L145 140" stroke="url(#hoodieGrad)" strokeWidth="13" strokeLinecap="round" />
              <path d="M132 168 L147 138" stroke="#4a5a6c" strokeWidth="2" />
              {/* Hand */}
              <ellipse cx="148" cy="135" rx="7" ry="9" fill="url(#skinGrad)" />
              {/* Fingers holding phone */}
              <path d="M145 130 L143 125" stroke="#d4a574" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M148 129 L148 124" stroke="#d4a574" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M151 130 L153 125" stroke="#d4a574" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* Phone with glowing screen */}
              <rect x="140" y="115" width="16" height="28" rx="2" fill="#1a1a1a" />
              <rect x="141" y="117" width="14" height="24" rx="1" fill="url(#phoneGlow)" />
              <motion.rect 
                x="141" y="117" width="14" height="24" rx="1" 
                fill="url(#phoneGlow)"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Phone camera */}
              <circle cx="148" cy="119" r="1" fill="#4a5a6c" />
            </motion.g>
            
            {/* Left arm relaxed */}
            <path d="M70 170 L55 200" stroke="url(#hoodieGrad)" strokeWidth="13" strokeLinecap="round" />
            <path d="M72 168 L57 198" stroke="#4a5a6c" strokeWidth="2" />
            {/* Left hand in pocket */}
            <ellipse cx="52" cy="203" rx="6" ry="8" fill="url(#skinGrad)" />
            
            {/* Hoodie pocket */}
            <rect x="85" y="190" width="30" height="15" rx="3" fill="#1a252f" opacity="0.6" />
            
            {/* Pants - modern jeans with shading */}
            <path d="M85 225 L82 268" stroke="#34495e" strokeWidth="17" strokeLinecap="round" />
            <path d="M115 225 L118 268" stroke="#34495e" strokeWidth="17" strokeLinecap="round" />
            {/* Jean seams */}
            <path d="M85 225 L82 268" stroke="#4a5a6c" strokeWidth="1.5" />
            <path d="M115 225 L118 268" stroke="#4a5a6c" strokeWidth="1.5" />
            
            {/* Sneakers - detailed */}
            <ellipse cx="82" cy="270" rx="15" ry="7" fill="#2c3e50" />
            <ellipse cx="118" cy="270" rx="15" ry="7" fill="#2c3e50" />
            <ellipse cx="82" cy="269" rx="13" ry="5" fill="#34495e" />
            <ellipse cx="118" cy="269" rx="13" ry="5" fill="#34495e" />
            {/* Shoe laces */}
            <path d="M78 268 L86 268" stroke="#7f8c8d" strokeWidth="0.5" />
            <path d="M114 268 L122 268" stroke="#7f8c8d" strokeWidth="0.5" />
            
            {/* Phone light glow on face */}
            <ellipse cx="100" cy="135" rx="12" ry="15" fill="#60a5fa" opacity="0.15" />
          </g>
        )}

        {scene === 'snowy' && (
          <g>
            {/* Person bundled up */}
            <circle cx="100" cy="120" r="20" fill="#deb887" />
            {/* Winter hat */}
            <path d="M75 115 Q100 85 125 115" fill="#e74c3c" />
            <ellipse cx="100" cy="115" rx="28" ry="8" fill="#f5f5dc" />
            <circle cx="100" cy="82" r="10" fill="#f5f5dc" />
            {/* Scarf */}
            <rect x="78" cy="135" width="44" height="18" rx="4" fill="#f39c12" />
            {/* Eyes */}
            <circle cx="92" cy="118" r="3" fill="#2c3e50" />
            <circle cx="108" cy="118" r="3" fill="#2c3e50" />
            {/* Puffy jacket */}
            <path d="M100 153 L100 220" stroke="#3498db" strokeWidth="45" strokeLinecap="round" />
            {/* Arms */}
            <path d="M60 165 L30 200" stroke="#3498db" strokeWidth="18" strokeLinecap="round" />
            <path d="M140 165 L170 200" stroke="#3498db" strokeWidth="18" strokeLinecap="round" />
            {/* Gloves */}
            <circle cx="25" cy="205" r="12" fill="#2c3e50" />
            <circle cx="175" cy="205" r="12" fill="#2c3e50" />
            {/* Pants */}
            <path d="M85 220 L80 262" stroke="#5d4e37" strokeWidth="16" strokeLinecap="round" />
            <path d="M115 220 L120 262" stroke="#5d4e37" strokeWidth="16" strokeLinecap="round" />
            {/* Snow boots */}
            <ellipse cx="80" cy="265" rx="16" ry="8" fill="#2c3e50" />
            <ellipse cx="120" cy="265" rx="16" ry="8" fill="#2c3e50" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};

// Get weather icon
const getWeatherIcon = (condition, size = 'w-6 h-6') => {
  const cond = condition?.toLowerCase() || '';
  if (cond.includes('rain')) return <CloudRain className={size} />;
  if (cond.includes('cloud')) return <Cloud className={size} />;
  if (cond.includes('snow')) return <Snowflake className={size} />;
  return <Sun className={size} />;
};

// Get background gradient
const getGradient = (condition, isNight) => {
  if (isNight) return 'from-[#0f0c29] via-[#302b63] to-[#24243e]';
  const cond = condition?.toLowerCase() || '';
  if (cond.includes('rain')) return 'from-[#3a6186] via-[#5d8aa8] to-[#89b4c8]';
  if (cond.includes('cloud')) return 'from-[#757f9a] via-[#9ba4b4] to-[#d7dde8]';
  if (cond.includes('snow')) return 'from-[#83a4d4] via-[#b6d0e2] to-[#e8f4f8]';
  return 'from-[#56ccf2] via-[#7dd3fc] to-[#bae6fd]';
};

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const isNight = isNightTime();

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const farmerUser = localStorage.getItem('farmerUser');
      if (farmerUser) {
        const userData = JSON.parse(farmerUser);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        const response = await axios.get(`${API_URL}/api/dashboard/farmer/${userData.farmerId}`);
        setWeather(response.data.weather);
        setLocation(response.data.farmer?.district || 'Your Location');
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate hourly forecast
  const generateHourlyForecast = () => {
    if (!weather) return [];
    const currentHour = new Date().getHours();
    const forecast = [];
    for (let i = 0; i < 12; i++) {
      const hour = (currentHour + i) % 24;
      const isNightHour = hour < 6 || hour >= 19;
      const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 5;
      forecast.push({
        time: hour === currentHour ? 'Now' : `${hour > 12 ? hour - 12 : hour || 12}${hour >= 12 ? 'PM' : 'AM'}`,
        temp: Math.round(weather.temperature + tempVariation),
        isNight: isNightHour,
        condition: weather.condition
      });
    }
    return forecast;
  };

  // Generate 7-day forecast
  const generateWeeklyForecast = () => {
    if (!weather) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const conditions = ['sunny', 'cloudy', 'rainy', 'sunny', 'partly cloudy', 'sunny', 'cloudy'];
    
    return Array.from({ length: 7 }, (_, i) => ({
      day: i === 0 ? 'Today' : days[(today + i) % 7],
      high: weather.temperature + Math.floor(Math.random() * 5) - 2,
      low: weather.temperature - 5 + Math.floor(Math.random() * 3),
      condition: conditions[i]
    }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getGradient('sunny', isNight)} flex items-center justify-center`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  const condition = weather?.condition || 'sunny';
  const isRainy = condition.toLowerCase().includes('rain');
  const hourlyForecast = generateHourlyForecast();
  const weeklyForecast = generateWeeklyForecast();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getGradient(condition, isNight)} relative overflow-hidden`}>
      {/* Background Effects */}
      {isNight && <Stars />}
      {isRainy && <RainEffect />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 p-6"
      >
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="p-3 bg-white/10 backdrop-blur-xl rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{location}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-6">
        {/* Temperature Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <div className="text-8xl font-extralight text-white mb-2">
            {weather?.temperature || 28}°
          </div>
          <div className="text-2xl text-white/90 capitalize flex items-center justify-center gap-2">
            {isNight ? <Moon className="w-6 h-6" /> : getWeatherIcon(condition, 'w-6 h-6')}
            {isNight ? 'Clear Night' : condition}
          </div>
          <div className="text-white/60 mt-2">
            H: {weather?.tempMax || weather?.temperature + 4}° L: {weather?.tempMin || weather?.temperature - 5}°
          </div>
        </motion.div>

        {/* Person Illustration */}
        <WeatherPerson condition={condition} isNight={isNight} />

        {/* Hourly Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 mb-4"
        >
          <h3 className="text-white/80 text-sm font-medium mb-4">HOURLY FORECAST</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {hourlyForecast.map((hour, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.03 }}
                className="flex flex-col items-center min-w-[50px]"
              >
                <span className="text-white/70 text-xs mb-2">{hour.time}</span>
                {hour.isNight ? (
                  <Moon className="w-6 h-6 text-yellow-200 mb-2" />
                ) : (
                  getWeatherIcon(hour.condition, 'w-6 h-6 text-white')
                )}
                <span className="text-white font-medium">{hour.temp}°</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 7-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 mb-4"
        >
          <h3 className="text-white/80 text-sm font-medium mb-4">7-DAY FORECAST</h3>
          <div className="space-y-3">
            {weeklyForecast.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="flex items-center justify-between"
              >
                <span className="text-white/80 w-16">{day.day}</span>
                {getWeatherIcon(day.condition, 'w-5 h-5 text-white')}
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{day.high}°</span>
                  <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                      style={{ width: `${((day.high - day.low) / 15) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/60">{day.low}°</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weather Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Wind className="w-4 h-4" />
              WIND
            </div>
            <div className="text-white text-2xl font-light">{weather?.windSpeed || 12} km/h</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Droplets className="w-4 h-4" />
              HUMIDITY
            </div>
            <div className="text-white text-2xl font-light">{weather?.humidity || 65}%</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Thermometer className="w-4 h-4" />
              FEELS LIKE
            </div>
            <div className="text-white text-2xl font-light">{weather?.feelsLike || weather?.temperature - 1}°</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <CloudRain className="w-4 h-4" />
              RAIN CHANCE
            </div>
            <div className="text-white text-2xl font-light">{weather?.rainChance || 20}%</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Sunrise className="w-4 h-4" />
              SUNRISE
            </div>
            <div className="text-white text-2xl font-light">6:15 AM</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Sunset className="w-4 h-4" />
              SUNSET
            </div>
            <div className="text-white text-2xl font-light">6:45 PM</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Weather;
