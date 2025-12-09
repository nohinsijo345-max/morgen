import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Wind, Droplets, Sunrise, Sunset,
  Eye, Gauge, Umbrella, Thermometer
} from 'lucide-react';
import axios from 'axios';

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

// Get theme colors based on time
const getThemeColors = (isNight) => {
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
const PremiumSun = () => (
  <motion.div 
    className="relative w-44 h-44"
    initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
  >
    {/* Multiple glow layers */}
    <motion.div 
      className="absolute inset-0 rounded-full blur-2xl"
      style={{ background: 'radial-gradient(circle, rgba(255,200,50,0.6) 0%, transparent 60%)' }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div 
      className="absolute inset-0 rounded-full blur-xl"
      style={{ background: 'radial-gradient(circle, rgba(255,165,0,0.5) 0%, transparent 50%)' }}
      animate={{ scale: [1.1, 1.4, 1.1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Animated sun rays */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="pageRayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
          <stop offset="40%" stopColor="#FFA500" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </linearGradient>
        <filter id="pageRayGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {[...Array(12)].map((_, i) => (
        <motion.line
          key={i}
          x1="100" y1="100" x2="100" y2="15"
          stroke="url(#pageRayGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#pageRayGlow)"
          transform={`rotate(${i * 30} 100 100)`}
          animate={{ opacity: [0.4, 1, 0.4], strokeWidth: [5, 8, 5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.08 }}
        />
      ))}
    </svg>
    
    {/* Main sun body */}
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #FFF5CC 0%, #FFE066 20%, #FFD700 40%, #FFA500 70%, #FF8C00 100%)'
      }}
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  </motion.div>
);

// Premium Moon for night time
const PremiumMoon = () => (
  <motion.div 
    className="relative w-44 h-44"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3, type: 'spring' }}
  >
    <motion.div 
      className="absolute inset-0 rounded-full blur-2xl"
      style={{ background: 'radial-gradient(circle, rgba(200,220,255,0.5) 0%, transparent 60%)' }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="pageMoonGrad" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E8E8F0" />
          <stop offset="100%" stopColor="#C8C8D8" />
        </radialGradient>
        <filter id="pageMoonGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="38" fill="url(#pageMoonGrad)" filter="url(#pageMoonGlow)" />
      <circle cx="38" cy="38" r="7" fill="#D0D0D8" opacity="0.5" />
      <circle cx="62" cy="55" r="5" fill="#D0D0D8" opacity="0.4" />
      <circle cx="45" cy="62" r="4" fill="#D0D0D8" opacity="0.3" />
    </svg>
  </motion.div>
);


// Premium 3D Cloud
const PremiumCloud = ({ isRaining = false, isNight = false }) => {
  const cloudColor = isNight ? '#8090A0' : '#FFFFFF';
  const shadowColor = isNight ? '#505060' : '#B0B0B0';
  
  return (
    <motion.div 
      className="relative w-52 h-36"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      <svg className="w-full h-full" viewBox="0 0 200 130">
        <defs>
          <linearGradient id={`pageCloudGrad${isNight ? 'N' : 'D'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cloudColor} />
            <stop offset="60%" stopColor={isNight ? '#707080' : '#F0F0F0'} />
            <stop offset="100%" stopColor={shadowColor} />
          </linearGradient>
        </defs>
        
        <g>
          <ellipse cx="100" cy="70" rx="62" ry="36" fill={`url(#pageCloudGrad${isNight ? 'N' : 'D'})`} />
          <ellipse cx="48" cy="76" rx="42" ry="30" fill={`url(#pageCloudGrad${isNight ? 'N' : 'D'})`} />
          <ellipse cx="152" cy="76" rx="38" ry="27" fill={`url(#pageCloudGrad${isNight ? 'N' : 'D'})`} />
          <ellipse cx="72" cy="48" rx="38" ry="28" fill={cloudColor} />
          <ellipse cx="128" cy="50" rx="35" ry="26" fill={cloudColor} />
        </g>
        
        <ellipse cx="68" cy="42" rx="22" ry="14" fill="rgba(255,255,255,0.9)" />
        <ellipse cx="118" cy="46" rx="18" ry="12" fill="rgba(255,255,255,0.7)" />
      </svg>
      
      {isRaining && (
        <div className="absolute bottom-0 left-1/4 w-1/2 h-20 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 rounded-full"
              style={{ 
                left: `${i * 11}%`,
                height: '18px',
                background: 'linear-gradient(to bottom, rgba(100,180,255,1), rgba(100,180,255,0.2))'
              }}
              animate={{ y: [0, 60], opacity: [1, 0] }}
              transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.07, ease: 'easeIn' }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Weather Icon Selector
const WeatherIcon = ({ condition, isNight = false }) => {
  const cond = condition?.toLowerCase() || '';
  if (cond.includes('rain') || cond.includes('drizzle')) return <PremiumCloud isRaining={true} isNight={isNight} />;
  if (cond.includes('cloud') || cond.includes('overcast')) return <PremiumCloud isRaining={false} isNight={isNight} />;
  if (isNight) return <PremiumMoon />;
  return <PremiumSun />;
};

// Small Weather Icon for forecasts
const SmallWeatherIcon = ({ condition, isNight = false }) => {
  const cond = condition?.toLowerCase() || '';
  
  if (cond.includes('rain')) {
    return (
      <svg className="w-8 h-8" viewBox="0 0 40 40">
        <ellipse cx="20" cy="14" rx="12" ry="8" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="11" cy="16" rx="8" ry="6" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="29" cy="16" rx="7" ry="5" fill={isNight ? '#8090A0' : '#94A3B8'} />
        {[0, 1, 2].map(i => (
          <motion.line key={i} x1={12 + i * 8} y1="25" x2={10 + i * 8} y2="33"
            stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round"
            animate={{ y: [0, 5], opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </svg>
    );
  }
  
  if (cond.includes('cloud')) {
    return (
      <svg className="w-8 h-8" viewBox="0 0 40 40">
        <ellipse cx="20" cy="18" rx="12" ry="8" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="11" cy="20" rx="8" ry="6" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="29" cy="20" rx="7" ry="5" fill={isNight ? '#8090A0' : '#94A3B8'} />
        <ellipse cx="18" cy="14" rx="6" ry="4" fill={isNight ? '#A0A8B0' : '#CBD5E1'} />
      </svg>
    );
  }
  
  if (isNight) {
    return (
      <svg className="w-8 h-8" viewBox="0 0 40 40">
        <defs>
          <radialGradient id="smallMoon" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D0D0E0" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="11" fill="url(#smallMoon)" />
        <circle cx="15" cy="16" r="2.5" fill="#C0C0D0" opacity="0.5" />
      </svg>
    );
  }
  
  return (
    <svg className="w-8 h-8" viewBox="0 0 40 40">
      <defs>
        <radialGradient id="smallSunGrad">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      {[...Array(8)].map((_, i) => (
        <motion.line key={i} x1="20" y1="20" x2="20" y2="5"
          stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${i * 45} 20 20)`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
      <circle cx="20" cy="20" r="9" fill="url(#smallSunGrad)" />
    </svg>
  );
};


// Animated Stars Background (night only)
const StarsBackground = () => {
  const stars = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: (i * 17 + 7) % 100,
      top: (i * 13 + 5) % 70,
      size: (i % 3) + 1,
      delay: (i % 6) * 0.3,
      duration: 2 + (i % 4),
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

// Animated Clouds Background (day only)
const CloudsBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <motion.div
      className="absolute top-20 -left-40 w-80 h-40 bg-white/50 rounded-full blur-3xl"
      animate={{ x: [0, 200, 0] }}
      transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="absolute top-40 -right-20 w-60 h-30 bg-white/40 rounded-full blur-2xl"
      animate={{ x: [0, -150, 0] }}
      transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="absolute bottom-40 left-1/4 w-40 h-20 bg-white/30 rounded-full blur-xl"
      animate={{ x: [0, 100, 0] }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState('hourly');
  const localIsNight = useTimeOfDay();

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
        setLocation((response.data.farmer?.district || 'Your Location').toUpperCase());
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const isNight = weather?.isNight ?? localIsNight;
  const theme = getThemeColors(isNight);

  const generateHourlyForecast = () => {
    if (!weather) return [];
    const currentHour = new Date().getHours();
    return Array.from({ length: 6 }, (_, i) => {
      const hour = (currentHour + i) % 24;
      const hourIsNight = hour < 6 || hour >= 19;
      return {
        time: i === 0 ? 'Now' : `${String(hour).padStart(2, '0')}:00`,
        temp: Math.round(weather.temperature + (i === 0 ? 0 : Math.sin(i) * 2)),
        condition: weather.condition,
        isNow: i === 0,
        isNight: hourIsNight
      };
    });
  };

  const generateWeeklyForecast = () => {
    if (!weather) return [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const conditions = ['sunny', 'cloudy', 'rainy', 'sunny', 'cloudy', 'sunny', 'rainy'];
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        day: days[date.getDay()],
        date: `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`,
        temp: weather.temperature + Math.round(Math.sin(i) * 3),
        condition: conditions[i]
      };
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} flex items-center justify-center`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-3 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  const hourlyForecast = generateHourlyForecast();
  const weeklyForecast = generateWeeklyForecast();
  const condition = weather?.condition || 'sunny';


  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient} relative`}>
      {isNight ? <StarsBackground /> : <CloudsBackground />}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 flex items-center justify-between px-6 pt-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.back()}
          className={`w-12 h-12 flex items-center justify-center ${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border}`}
        >
          <ArrowLeft className="w-5 h-5 text-white/90" />
        </motion.button>
        
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white/80" />
          <span className={`text-sm font-semibold ${theme.textSecondary} tracking-wide`}>{location}</span>
        </div>
      </motion.header>

      {/* Main Weather Display */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-center pt-6 pb-4"
      >
        <h1 className={`text-2xl font-semibold ${theme.textPrimary} mb-2 tracking-wider`}>{location}</h1>
        
        <motion.div 
          className={`text-[130px] font-extralight ${theme.textPrimary} leading-none mb-4`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          {weather?.temperature || 28}°
        </motion.div>

        <p className={`${theme.textSecondary} text-lg capitalize mb-6`}>{weather?.description || condition}</p>

        <div className="flex justify-center mb-6">
          <WeatherIcon condition={condition} isNight={isNight} />
        </div>
      </motion.section>

      {/* Tabs */}
      <div className="relative z-10 flex justify-center gap-3 mb-6">
        {['hourly', 'weekly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-7 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeTab === tab 
                ? `${theme.cardBg} ${theme.textPrimary} backdrop-blur-xl border ${theme.border}` 
                : `${theme.textMuted} hover:${theme.textSecondary}`
            }`}
          >
            {tab === 'hourly' ? 'Hourly Forecast' : 'Weekly Forecast'}
          </button>
        ))}
      </div>

      {/* Hourly Forecast */}
      {activeTab === 'hourly' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-6 mb-8"
        >
          <div className="flex justify-between items-center">
            {hourlyForecast.map((hour, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex flex-col items-center py-4 px-4 rounded-2xl transition-all ${
                  hour.isNow ? `${theme.cardBg} backdrop-blur-xl border ${theme.border}` : ''
                }`}
              >
                <span className={`text-xs mb-3 font-medium ${hour.isNow ? theme.textPrimary : theme.textMuted}`}>
                  {hour.time}
                </span>
                <SmallWeatherIcon condition={hour.condition} isNight={hour.isNight} />
                <span className={`text-sm mt-3 font-semibold ${hour.isNow ? theme.textPrimary : theme.textSecondary}`}>
                  {hour.temp}°
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weekly Forecast */}
      {activeTab === 'weekly' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 px-6 mb-8"
        >
          <div className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-6 border ${theme.border}`}>
            <h3 className={`${theme.textMuted} text-xs font-semibold tracking-widest mb-5`}>NEXT FORECAST</h3>
            <div className="space-y-5">
              {weeklyForecast.slice(0, 5).map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className="flex items-center justify-between"
                >
                  <div className="w-28">
                    <span className={`${theme.textPrimary} font-semibold text-sm`}>{day.day}</span>
                    <span className={`${theme.textMuted} text-xs block`}>{day.date}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className={`${theme.textPrimary} text-2xl font-light`}>{day.temp}°</span>
                    <SmallWeatherIcon condition={day.condition} isNight={false} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}


      {/* Weather Details Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 px-6 pb-10"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Thermometer, label: 'UV INDEX', value: weather?.uvIndex || '3', sub: weather?.uvIndex > 5 ? 'High' : 'Moderate' },
            { icon: Umbrella, label: 'RAIN CHANCE', value: `${weather?.rainChance || 20}%`, sub: weather?.rainChance > 50 ? 'Likely' : 'Low' },
            { icon: Eye, label: 'VISIBILITY', value: `${weather?.visibility || 10} km`, sub: weather?.visibility > 8 ? 'Clear' : 'Hazy' },
            { icon: Gauge, label: 'PRESSURE', value: `${weather?.pressure || 1013} hPa`, sub: 'Normal' },
            { icon: Droplets, label: 'HUMIDITY', value: `${weather?.humidity || 65}%`, sub: weather?.humidity > 70 ? 'Humid' : 'Comfortable' },
            { icon: Wind, label: 'WIND', value: `${weather?.windSpeed || 12} km/h`, sub: weather?.windSpeed > 20 ? 'Breezy' : 'Light' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className={`${theme.cardBg} backdrop-blur-xl rounded-2xl p-4 border ${theme.border}`}
            >
              <div className={`flex items-center gap-1.5 ${theme.textMuted} text-[10px] tracking-wider mb-2`}>
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
              <div className={`${theme.textPrimary} text-xl font-light`}>{item.value}</div>
              <div className={`${theme.textMuted} text-[10px]`}>{item.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Sunrise/Sunset */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className={`${theme.cardBg} backdrop-blur-xl rounded-2xl p-4 border ${theme.border}`}
          >
            <div className={`flex items-center gap-2 ${theme.textMuted} text-[10px] tracking-wider mb-2`}>
              <Sunrise className="w-4 h-4 text-orange-400" />
              SUNRISE
            </div>
            <div className={`${theme.textPrimary} text-xl font-light`}>{weather?.sunrise || '6:30 AM'}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.95 }}
            className={`${theme.cardBg} backdrop-blur-xl rounded-2xl p-4 border ${theme.border}`}
          >
            <div className={`flex items-center gap-2 ${theme.textMuted} text-[10px] tracking-wider mb-2`}>
              <Sunset className="w-4 h-4 text-purple-400" />
              SUNSET
            </div>
            <div className={`${theme.textPrimary} text-xl font-light`}>{weather?.sunset || '6:45 PM'}</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Weather;
