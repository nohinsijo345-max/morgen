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
