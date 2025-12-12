import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { WeatherIcon, SmallWeatherIcon } from './PremiumWeatherElements';

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

// Premium minimal theme colors - matching Weather.jsx, changes based on time
const getThemeColors = (isNight, condition) => {
  const cond = condition?.toLowerCase() || '';
  
  // Night theme - deep elegant dark
  if (isNight) {
    return {
      gradient: 'from-indigo-950 via-slate-900 to-slate-950',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      cardBg: 'bg-white/5',
      cardBorder: 'border-white/10',
      accent: 'text-blue-400',
    };
  }
  
  // Rainy theme - soft grays
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('storm')) {
    return {
      gradient: 'from-slate-700 via-slate-600 to-slate-700',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-200',
      textMuted: 'text-slate-300',
      cardBg: 'bg-white/10',
      cardBorder: 'border-white/20',
      accent: 'text-blue-300',
    };
  }
  
  // Cloudy/Foggy theme - neutral elegance
  if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('mist') || cond.includes('fog')) {
    return {
      gradient: 'from-slate-500 via-slate-400 to-slate-500',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-100',
      textMuted: 'text-slate-200',
      cardBg: 'bg-white/15',
      cardBorder: 'border-white/25',
      accent: 'text-slate-100',
    };
  }
  
  // Default sunny theme - warm sky gradient
  return {
    gradient: 'from-sky-500 via-blue-400 to-sky-500',
    textPrimary: 'text-white',
    textSecondary: 'text-sky-100',
    textMuted: 'text-sky-200',
    cardBg: 'bg-white/15',
    cardBorder: 'border-white/25',
    accent: 'text-yellow-300',
  };
};




const WeatherCard = ({ weather, onClick }) => {
  const localIsNight = useTimeOfDay();
  const isNight = weather?.isNight ?? localIsNight;
  const condition = weather?.condition || 'sunny';
  const theme = getThemeColors(isNight, condition);

  if (!weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${theme.gradient} rounded-3xl p-6 shadow-xl relative overflow-hidden h-full flex items-center justify-center cursor-pointer border ${theme.cardBorder}`}
        onClick={onClick}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
        />
      </motion.div>
    );
  }

  const generateHourlyPreview = () => {
    const currentHour = new Date().getHours();
    return Array.from({ length: 4 }, (_, i) => {
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

  const hourlyData = generateHourlyPreview();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${theme.gradient} rounded-3xl shadow-xl relative overflow-hidden h-full cursor-pointer border ${theme.cardBorder}`}
    >

      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        {/* Header - Location */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className={`w-8 h-8 rounded-xl ${theme.cardBg} backdrop-blur-xl flex items-center justify-center border ${theme.cardBorder}`}>
            <MapPin className={`w-4 h-4 ${theme.textSecondary}`} />
          </div>
          <span className={`${theme.textPrimary} font-medium text-sm tracking-wide`}>
            {(weather.location || 'YOUR LOCATION').toUpperCase()}
          </span>
        </motion.div>

        {/* Main Temperature & Icon */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <div className={`text-5xl font-thin ${theme.textPrimary} mb-1`}>
              {weather.temperature}°
            </div>
            <p className={`${theme.textSecondary} text-sm capitalize font-light`}>
              {weather.description || condition}
            </p>
          </div>
          <div className="flex-shrink-0">
            <WeatherIcon condition={condition} size="small" isNight={isNight} />
          </div>
        </motion.div>

        {/* Hourly Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-2xl p-3 border ${theme.cardBorder}`}
        >
          <div className="flex justify-between items-center">
            {hourlyData.map((hour, index) => (
              <div 
                key={index}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                  hour.isNow ? `${theme.cardBg} border ${theme.cardBorder}` : ''
                }`}
              >
                <span className={`text-xs mb-1 font-medium ${hour.isNow ? theme.textPrimary : theme.textMuted}`}>
                  {hour.time}
                </span>
                <SmallWeatherIcon condition={hour.condition} isNight={hour.isNight} size="tiny" />
                <span className={`text-xs mt-1 font-semibold ${hour.isNow ? theme.textPrimary : theme.textSecondary}`}>
                  {hour.temp}°
                </span>
              </div>
            ))}
          </div>
        </motion.div>


      </div>
    </motion.div>
  );
};

export default WeatherCard;
