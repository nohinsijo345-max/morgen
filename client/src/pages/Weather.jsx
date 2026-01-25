import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Wind, Droplets, Sunrise, Sunset,
  Eye, Gauge, RefreshCw, Thermometer, CloudRain, Leaf, Sun,
  AlertTriangle, Cloud, Moon, Waves, Activity, TrendingUp,
  TrendingDown, Clock, Calendar, Sprout, Bug, Tractor
} from 'lucide-react';
import axios from 'axios';
import { WeatherIcon, SmallWeatherIcon } from '../components/PremiumWeatherElements';
import { UserSession } from '../utils/userSession';
import { useTranslation } from '../hooks/useTranslation';

// Determine correct dashboard URL based on user type
const getDashboardUrl = () => {
  // Check if buyer is logged in
  const buyerUser = UserSession.getCurrentUser('buyer');
  if (buyerUser) {
    return '/buyer/dashboard';
  }
  
  // Check if farmer is logged in
  const farmerUser = UserSession.getCurrentUser('farmer');
  if (farmerUser) {
    return '/dashboard';
  }
  
  // Default to farmer dashboard
  return '/dashboard';
};

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

// Premium minimal theme colors - changes based on time of day
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
  
  // Cloudy theme - neutral elegance
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

const Weather = () => {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState('hourly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(300); // 5 minutes in seconds
  const localIsNight = useTimeOfDay();

  useEffect(() => {
    fetchWeatherData();
    
    // Auto-refresh every 3 minutes for more frequent updates
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing weather data...');
      fetchWeatherData();
      setNextRefresh(180);
    }, 3 * 60 * 1000); // 3 minutes
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setNextRefresh(prev => prev > 0 ? prev - 1 : 180);
    }, 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const fetchWeatherData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
      setNextRefresh(180);
    }
    
    try {
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId;
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found in session for weather data');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log('✅ Fetching weather data for farmerId:', farmerId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/api/dashboard/farmer/${farmerId}?t=${timestamp}`);
      
      setWeather(response.data.weather);
      setLastUpdated(new Date());
      
      // Enhanced location display with PIN code if available
      const farmer = response.data.farmer;
      let locationDisplay = farmer?.district || t('yourLocation');
      if (farmer?.city && farmer?.pinCode) {
        locationDisplay = `${farmer.city} (${farmer.pinCode})`;
      } else if (farmer?.city) {
        locationDisplay = `${farmer.city}, ${farmer.district}`;
      }
      setLocation(locationDisplay.toUpperCase());
      
      console.log('Weather data refreshed:', {
        location: locationDisplay,
        temperature: response.data.weather?.temperature,
        condition: response.data.weather?.condition,
        lastUpdated: response.data.weather?.lastUpdated,
        isLiveData: response.data.weather?.isLiveData,
        isManualRefresh
      });
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format countdown timer
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get farming advice based on weather
  const getFarmingAdvice = () => {
    if (!weather) return [];
    const advice = [];
    const cond = weather.condition?.toLowerCase() || '';
    const temp = weather.temperature || 25;
    const humidity = weather.humidity || 60;
    
    // Temperature-based advice
    if (temp > 35) {
      advice.push({ icon: Thermometer, text: t('highHeatIrrigateEarlyMorning'), type: 'warning' });
    } else if (temp < 15) {
      advice.push({ icon: Thermometer, text: t('coolWeatherProtectFromFrost'), type: 'info' });
    } else {
      advice.push({ icon: Thermometer, text: t('goodTemperatureForFarming'), type: 'success' });
    }
    
    // Rain-based advice
    if (cond.includes('rain') || cond.includes('drizzle')) {
      advice.push({ icon: CloudRain, text: t('rainExpectedAvoidSpraying'), type: 'warning' });
      advice.push({ icon: Leaf, text: t('goodTimeForTransplanting'), type: 'success' });
    } else if (humidity > 80) {
      advice.push({ icon: Droplets, text: t('highHumidityWatchFungal'), type: 'warning' });
    }
    
    // Sunny day advice
    if (cond.includes('sunny') || cond.includes('clear')) {
      advice.push({ icon: Sun, text: t('clearSkiesIdealForHarvesting'), type: 'success' });
    }
    
    return advice;
  };

  const isNight = weather?.isNight ?? localIsNight;
  const condition = weather?.condition || 'sunny';
  const theme = getThemeColors(isNight, condition);

  const generateHourlyForecast = () => {
    if (!weather) return [];
    const currentHour = new Date().getHours();
    return Array.from({ length: 5 }, (_, i) => {
      const hour = (currentHour + i) % 24;
      const hourIsNight = hour < 6 || hour >= 19;
      return {
        time: i === 0 ? t('now') : `${String(hour).padStart(2, '0')}:00`,
        temp: Math.round(weather.temperature + (i === 0 ? 0 : Math.sin(i) * 2)),
        condition: weather.condition,
        isNow: i === 0,
        isNight: hourIsNight
      };
    });
  };

  const generateWeeklyForecast = () => {
    if (!weather) return [];
    const days = [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];
    const today = new Date();
    const conditions = ['sunny', 'cloudy', 'rainy', 'sunny', 'cloudy', 'sunny', 'rainy'];
    
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        day: i === 0 ? t('today') : days[date.getDay()],
        temp: weather.temperature + Math.round(Math.sin(i) * 3),
        condition: conditions[i]
      };
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
        />
      </div>
    );
  }

  const hourlyForecast = generateHourlyForecast();
  const weeklyForecast = generateWeeklyForecast();


  const farmingAdvice = getFarmingAdvice();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = getDashboardUrl()}
          className={`w-11 h-11 flex items-center justify-center ${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.cardBorder} shadow-lg`}
        >
          <ArrowLeft className={`w-5 h-5 ${theme.textPrimary}`} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchWeatherData(true)}
          disabled={refreshing}
          className={`w-11 h-11 flex items-center justify-center ${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.cardBorder} shadow-lg ${refreshing ? 'opacity-50' : ''}`}
        >
          <RefreshCw className={`w-5 h-5 ${theme.textPrimary} ${refreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </motion.header>

      {/* Main Content */}
      <div className="px-6 pb-6">
        {/* Location & Temperature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className={`w-4 h-4 ${theme.textSecondary}`} />
            <span className={`text-sm font-medium ${theme.textSecondary} tracking-wide`}>
              {location}
            </span>
          </div>
          
          {/* Weather Icon */}
          <div className="flex justify-center mb-4">
            <WeatherIcon condition={condition} size="normal" isNight={isNight} />
          </div>
          
          <motion.div 
            className={`text-7xl font-thin ${theme.textPrimary} mb-2`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {weather?.temperature || 28}°
          </motion.div>

          <p className={`${theme.textSecondary} text-lg font-light capitalize mb-3`}>
            {weather?.description || condition}
          </p>
          
          {/* Live Data Indicator & Last Updated */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${weather?.isLiveData ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span className={`text-xs ${theme.textMuted} font-medium`}>
                {weather?.isLiveData ? t('liveWeatherData') : t('simulatedData')}
              </span>
            </div>
            {lastUpdated && (
              <span className={`text-xs ${theme.textMuted}`}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </motion.div>

        {/* Forecast Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-1 mb-6"
        >
          {['hourly', 'weekly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab 
                  ? `${theme.cardBg} ${theme.textPrimary} backdrop-blur-xl border ${theme.cardBorder} shadow-lg` 
                  : `${theme.textMuted} hover:${theme.textSecondary}`
              }`}
            >
              {tab === 'hourly' ? t('hourly') : t('fiveDay')}
            </button>
          ))}
        </motion.div>

        {/* Hourly Forecast */}
        {activeTab === 'hourly' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
          >
            <div className="flex justify-between items-center">
              {hourlyForecast.map((hour, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all flex-1 ${
                    hour.isNow ? `bg-white/10 border ${theme.cardBorder}` : ''
                  }`}
                >
                  <span className={`text-xs mb-2 font-medium ${hour.isNow ? theme.textPrimary : theme.textMuted}`}>
                    {hour.time}
                  </span>
                  <SmallWeatherIcon condition={hour.condition} isNight={hour.isNight} size="normal" />
                  <span className={`text-sm mt-2 font-semibold ${hour.isNow ? theme.textPrimary : theme.textSecondary}`}>
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
            className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
          >
            <div className="space-y-4">
              {weeklyForecast.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between py-2"
                >
                  <span className={`${theme.textPrimary} font-medium text-sm w-16`}>{day.day}</span>
                  <div className="flex items-center gap-3">
                    <SmallWeatherIcon condition={day.condition} isNight={false} size="normal" />
                    <span className={`${theme.textPrimary} text-lg font-light w-12 text-right`}>{day.temp}°</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}


        {/* Weather Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Wind, label: t('wind'), value: `${weather?.windSpeed || 12} km/h`, sub: weather?.windDirection || t('lightBreeze') },
              { icon: Droplets, label: t('humidity'), value: `${weather?.humidity || 65}%`, sub: weather?.humidity > 70 ? t('high') : t('comfortable') },
              { icon: Eye, label: t('visibility'), value: `${weather?.visibility || 10} km`, sub: weather?.visibility > 8 ? t('clear') : t('hazy') },
              { icon: Gauge, label: t('pressure'), value: `${weather?.pressure || 1013} hPa`, sub: t('normal') },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5"
              >
                <div className={`w-10 h-10 rounded-xl ${theme.cardBg} flex items-center justify-center border ${theme.cardBorder}`}>
                  <item.icon className={`w-5 h-5 ${theme.accent}`} />
                </div>
                <div className="flex-1">
                  <div className={`text-xs ${theme.textMuted} font-medium mb-0.5`}>{item.label}</div>
                  <div className={`${theme.textPrimary} font-semibold`}>{item.value}</div>
                  <div className={`text-xs ${theme.textMuted}`}>{item.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sun Times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
              <div className={`w-10 h-10 rounded-xl ${theme.cardBg} flex items-center justify-center border ${theme.cardBorder}`}>
                <Sunrise className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className={`text-xs ${theme.textMuted} font-medium mb-0.5`}>{t('sunrise')}</div>
                <div className={`${theme.textPrimary} font-semibold`}>{weather?.sunrise || '6:30 AM'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
              <div className={`w-10 h-10 rounded-xl ${theme.cardBg} flex items-center justify-center border ${theme.cardBorder}`}>
                <Sunset className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className={`text-xs ${theme.textMuted} font-medium mb-0.5`}>{t('sunset')}</div>
                <div className={`${theme.textPrimary} font-semibold`}>{weather?.sunset || '6:45 PM'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Farming Advice Section */}
        {farmingAdvice.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
          >
            <h3 className={`${theme.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
              <Leaf className="w-5 h-5 text-green-400" />
              {t('farmingAdvice')}
            </h3>
            <div className="space-y-3">
              {farmingAdvice.map((advice, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-2xl ${
                    advice.type === 'warning' ? 'bg-yellow-500/10' : 
                    advice.type === 'success' ? 'bg-green-500/10' : 'bg-blue-500/10'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    advice.type === 'warning' ? 'bg-yellow-500/20' : 
                    advice.type === 'success' ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`}>
                    <advice.icon className={`w-4 h-4 ${
                      advice.type === 'warning' ? 'text-yellow-400' : 
                      advice.type === 'success' ? 'text-green-400' : 'text-blue-400'
                    }`} />
                  </div>
                  <p className={`${theme.textSecondary} text-sm leading-relaxed`}>{advice.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Additional Farming Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
        >
          <h3 className={`${theme.textPrimary} font-semibold mb-4`}>Crop Conditions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-white/5">
              <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>Soil Moisture</div>
              <div className={`${theme.textPrimary} font-semibold`}>
                {weather?.humidity > 70 ? t('high') : weather?.humidity > 40 ? t('moderate') : 'Low'}
              </div>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full transition-all"
                  style={{ width: `${Math.min(weather?.humidity || 60, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="p-3 rounded-2xl bg-white/5">
              <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('uvIndex')}</div>
              <div className={`${theme.textPrimary} font-semibold`}>
                {weather?.uvIndex || (isNight ? 0 : Math.round(weather?.temperature / 5) || 5)}
              </div>
              <div className={`text-xs ${theme.textMuted} mt-1`}>
                {isNight ? t('none') : (weather?.temperature > 30 ? t('useProtection') : t('moderate'))}
              </div>
            </div>
            
            <div className="p-3 rounded-2xl bg-white/5">
              <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('feelsLike')}</div>
              <div className={`${theme.textPrimary} font-semibold`}>
                {weather?.feelsLike || weather?.temperature || 28}°C
              </div>
              <div className={`text-xs ${theme.textMuted} mt-1`}>
                {(weather?.feelsLike || weather?.temperature) > 35 ? t('veryHot') : 
                 (weather?.feelsLike || weather?.temperature) > 28 ? t('warm') : t('comfortable')}
              </div>
            </div>
            
            <div className="p-3 rounded-2xl bg-white/5">
              <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('rainChance')}</div>
              <div className={`${theme.textPrimary} font-semibold`}>
                {weather?.rainChance || (weather?.condition?.toLowerCase().includes('rain') ? '80%' : '10%')}
              </div>
              <div className={`text-xs ${theme.textMuted} mt-1`}>
                {weather?.condition?.toLowerCase().includes('rain') ? t('rainExpected') : t('lowProbability')}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Best Times for Farming Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
        >
          <h3 className={`${theme.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
            <Clock className="w-5 h-5 text-blue-400" />
            Best Times Today
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-green-400" />
                </div>
                <span className={`${theme.textSecondary} text-sm`}>Irrigation</span>
              </div>
              <span className={`${theme.textPrimary} font-medium text-sm`}>
                {weather?.temperature > 30 ? '6:00 AM - 8:00 AM' : '7:00 AM - 10:00 AM'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Sun className="w-4 h-4 text-yellow-400" />
                </div>
                <span className={`${theme.textSecondary} text-sm`}>Harvesting</span>
              </div>
              <span className={`${theme.textPrimary} font-medium text-sm`}>
                {weather?.condition?.toLowerCase().includes('rain') ? t('notRecommended') : '9:00 AM - 4:00 PM'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-purple-400" />
                </div>
                <span className={`${theme.textSecondary} text-sm`}>Spraying</span>
              </div>
              <span className={`${theme.textPrimary} font-medium text-sm`}>
                {weather?.windSpeed > 15 || weather?.condition?.toLowerCase().includes('rain') 
                  ? t('notRecommended') 
                  : '6:00 AM - 9:00 AM'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Tractor className="w-4 h-4 text-orange-400" />
                </div>
                <span className={`${theme.textSecondary} text-sm`}>Field Work</span>
              </div>
              <span className={`${theme.textPrimary} font-medium text-sm`}>
                {weather?.temperature > 35 ? '6:00 AM - 10:00 AM' : '8:00 AM - 5:00 PM'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-cyan-400" />
                </div>
                <span className={`${theme.textSecondary} text-sm`}>Transplanting</span>
              </div>
              <span className={`${theme.textPrimary} font-medium text-sm`}>
                {weather?.condition?.toLowerCase().includes('rain') ? t('idealConditions') : 
                 weather?.humidity > 70 ? '4:00 PM - 6:00 PM' : t('eveningPreferred')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Air Quality Index */}
        {weather?.aqi && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
          >
            <h3 className={`${theme.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
              <Activity className="w-5 h-5 text-green-400" />
              Air Quality Index
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`${theme.textSecondary} text-sm`}>Overall AQI</span>
                <span className={`font-bold text-lg ${
                  weather.aqi.usEpaIndex <= 2 ? 'text-green-400' :
                  weather.aqi.usEpaIndex <= 3 ? 'text-yellow-400' :
                  weather.aqi.usEpaIndex <= 4 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {weather.aqi.usEpaIndex <= 2 ? t('good') :
                   weather.aqi.usEpaIndex <= 3 ? t('moderate') :
                   weather.aqi.usEpaIndex <= 4 ? t('unhealthy') : t('veryUnhealthy')}
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    weather.aqi.usEpaIndex <= 2 ? 'bg-green-400' :
                    weather.aqi.usEpaIndex <= 3 ? 'bg-yellow-400' :
                    weather.aqi.usEpaIndex <= 4 ? 'bg-orange-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min((weather.aqi.usEpaIndex / 6) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-center">
                <div className={`text-xs ${theme.textMuted} mb-1`}>PM2.5</div>
                <div className={`${theme.textPrimary} font-semibold text-sm`}>
                  {weather.aqi.pm2_5?.toFixed(1) || '--'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 text-center">
                <div className={`text-xs ${theme.textMuted} mb-1`}>PM10</div>
                <div className={`${theme.textPrimary} font-semibold text-sm`}>
                  {weather.aqi.pm10?.toFixed(1) || '--'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 text-center">
                <div className={`text-xs ${theme.textMuted} mb-1`}>O₃</div>
                <div className={`${theme.textPrimary} font-semibold text-sm`}>
                  {weather.aqi.o3?.toFixed(1) || '--'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Agriculture Specific Data */}
        {weather?.agriculture && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
          >
            <h3 className={`${theme.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
              <Sprout className="w-5 h-5 text-green-400" />
              {t('todaysAgricultureSummary')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-white/5">
                <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('avgTemperature')}</div>
                <div className={`${theme.textPrimary} font-semibold text-lg`}>{weather.agriculture.avgTemp}°C</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5">
                <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('maxWind')}</div>
                <div className={`${theme.textPrimary} font-semibold text-lg`}>{weather.agriculture.maxWind} km/h</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5">
                <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('totalPrecipitation')}</div>
                <div className={`${theme.textPrimary} font-semibold text-lg`}>{weather.agriculture.totalPrecipitation} mm</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5">
                <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('avgHumidity')}</div>
                <div className={`${theme.textPrimary} font-semibold text-lg`}>{weather.agriculture.avgHumidity}%</div>
              </div>
            </div>
            
            {/* Rain/Snow Prediction */}
            <div className="mt-4 flex gap-3">
              <div className={`flex-1 p-3 rounded-2xl ${weather.agriculture.willItRain ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                <div className="flex items-center gap-2">
                  <CloudRain className={`w-5 h-5 ${weather.agriculture.willItRain ? 'text-blue-400' : theme.textMuted}`} />
                  <span className={`text-sm font-medium ${weather.agriculture.willItRain ? 'text-blue-400' : theme.textMuted}`}>
                    {weather.agriculture.willItRain ? t('rainExpected') : t('noRainExpected')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hourly Forecast Detail */}
        {weather?.hourlyForecast && weather.hourlyForecast.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
          >
            <h3 className={`${theme.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
              <Clock className="w-5 h-5 text-purple-400" />
              Next 6 Hours (Live)
            </h3>
            <div className="space-y-3">
              {weather.hourlyForecast.map((hour, index) => {
                const hourTime = new Date(hour.time);
                const timeStr = hourTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${theme.textPrimary} font-medium text-sm w-16`}>{timeStr}</span>
                      <SmallWeatherIcon condition={hour.condition} isNight={hourTime.getHours() < 6 || hourTime.getHours() >= 19} size="tiny" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span className={`${theme.textMuted} text-xs`}>{hour.chanceOfRain}%</span>
                      </div>
                      <span className={`${theme.textPrimary} font-semibold`}>{hour.temp}°</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Weather Alerts */}
        <AnimatePresence>
          {weather?.alerts && weather.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 1.4 }}
              className="bg-red-500/20 backdrop-blur-xl rounded-3xl p-5 border border-red-500/30 shadow-xl mb-6"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Weather Alerts
              </h3>
              <div className="space-y-3">
                {weather.alerts.map((alert, index) => (
                  <div key={index} className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium text-sm">{alert.headline || alert.event}</p>
                        {alert.description && (
                          <p className="text-red-200 text-xs mt-1 line-clamp-2">{alert.description}</p>
                        )}
                        {alert.instruction && (
                          <p className="text-yellow-300 text-xs mt-2 font-medium">{alert.instruction}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pest & Disease Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
        >
          <h3 className={`${theme.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
            <Bug className="w-5 h-5 text-orange-400" />
            Pest & Disease Risk
          </h3>
          <div className="space-y-3">
            {/* Fungal Disease Risk */}
            <div className="p-3 rounded-2xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className={`${theme.textSecondary} text-sm`}>{t('fungalDiseaseRisk')}</span>
                <span className={`font-semibold text-sm ${
                  weather?.humidity > 80 ? 'text-red-400' :
                  weather?.humidity > 65 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {weather?.humidity > 80 ? t('high') : weather?.humidity > 65 ? t('moderate') : t('low')}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    weather?.humidity > 80 ? 'bg-red-400' :
                    weather?.humidity > 65 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${Math.min(weather?.humidity || 50, 100)}%` }}
                />
              </div>
              <p className={`text-xs ${theme.textMuted} mt-2`}>
                {weather?.humidity > 80 ? t('applyFungicide') :
                 weather?.humidity > 65 ? t('monitorCrops') :
                 t('conditionsUnfavorable')}
              </p>
            </div>
            
            {/* Pest Activity */}
            <div className="p-3 rounded-2xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className={`${theme.textSecondary} text-sm`}>{t('pestActivityLevel')}</span>
                <span className={`font-semibold text-sm ${
                  weather?.temperature > 30 && weather?.humidity > 60 ? 'text-red-400' :
                  weather?.temperature > 25 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {weather?.temperature > 30 && weather?.humidity > 60 ? t('high') :
                   weather?.temperature > 25 ? t('moderate') : t('low')}
                </span>
              </div>
              <p className={`text-xs ${theme.textMuted}`}>
                {weather?.temperature > 30 && weather?.humidity > 60 
                  ? t('warmHumidConditions')
                  : weather?.temperature > 25 
                  ? t('normalPestActivity')
                  : t('coolConditions')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Moon Phase & Astronomical Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
        >
          <h3 className={`${theme.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
            <Moon className="w-5 h-5 text-indigo-400" />
            Moon & Astronomy
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-white/5">
              <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('moonPhase')}</div>
              <div className={`${theme.textPrimary} font-semibold`}>{weather?.moonPhase || t('newMoon')}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5">
              <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('moonrise')}</div>
              <div className={`${theme.textPrimary} font-semibold`}>{weather?.moonrise || '7:30 PM'}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5">
              <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('moonset')}</div>
              <div className={`${theme.textPrimary} font-semibold`}>{weather?.moonset || '6:00 AM'}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5">
              <div className={`text-xs ${theme.textMuted} font-medium mb-1`}>{t('dewPoint')}</div>
              <div className={`${theme.textPrimary} font-semibold`}>{weather?.dewPoint || 20}°C</div>
            </div>
          </div>
        </motion.div>

        {/* Temperature Range */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-5 border ${theme.cardBorder} shadow-xl mb-6`}
        >
          <h3 className={`${theme.textPrimary} font-semibold mb-4 flex items-center gap-2`}>
            <Thermometer className="w-5 h-5 text-red-400" />
            Temperature Range
          </h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-blue-400" />
              <span className={`${theme.textSecondary} text-sm`}>Min</span>
              <span className={`${theme.textPrimary} font-bold text-lg`}>{weather?.tempMin || 22}°</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className={`${theme.textSecondary} text-sm`}>Max</span>
              <span className={`${theme.textPrimary} font-bold text-lg`}>{weather?.tempMax || 32}°</span>
            </div>
          </div>
          <div className="relative h-4 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
              style={{ 
                left: `${Math.min(Math.max(((weather?.temperature || 28) - (weather?.tempMin || 22)) / ((weather?.tempMax || 32) - (weather?.tempMin || 22)) * 100, 0), 100)}%` 
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs ${theme.textMuted}`}>{weather?.tempMin || 22}°C</span>
            <span className={`text-xs ${theme.textPrimary} font-medium`}>Current: {weather?.temperature || 28}°C</span>
            <span className={`text-xs ${theme.textMuted}`}>{weather?.tempMax || 32}°C</span>
          </div>
        </motion.div>

        {/* Auto-Refresh Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className={`${theme.cardBg} backdrop-blur-xl rounded-3xl p-4 border ${theme.cardBorder} shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${theme.cardBg} flex items-center justify-center border ${theme.cardBorder}`}>
                <RefreshCw className={`w-5 h-5 ${theme.accent} ${refreshing ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className={`${theme.textPrimary} font-medium text-sm`}>Auto-Refresh</div>
                <div className={`text-xs ${theme.textMuted}`}>
                  {lastUpdated ? `Last: ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Updating...'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`${theme.textPrimary} font-bold text-lg`}>{formatCountdown(nextRefresh)}</div>
              <div className={`text-xs ${theme.textMuted}`}>Next refresh</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Weather;
