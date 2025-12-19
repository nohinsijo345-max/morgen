import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './GlassCard';
import { UserSession } from '../utils/userSession';

const PriceForecastCard = ({ onClick }) => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    fetchForecasts();
    // Auto-refresh every 2 minutes for more frequent AI-powered updates
    const interval = setInterval(fetchForecasts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchForecasts = async () => {
    try {
      const farmerId = UserSession.getFarmerId();
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found in session for price forecasts');
        return;
      }
      
      console.log('✅ Fetching price forecasts for farmerId:', farmerId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/api/price-forecast/forecast/${farmerId}?t=${timestamp}`);
      setForecasts(response.data.forecasts || []);
      setLastUpdated(response.data.lastUpdated);
      setIsAiGenerated(response.data.aiGenerated || false);
      
      const updateSource = response.data.fromCache ? 'cache' : 'fresh AI';
      console.log(`📊 Price forecasts refreshed from ${updateSource}:`, new Date().toLocaleTimeString());
      
      if (response.data.aiGenerated && !response.data.fromCache) {
        console.log('🤖 Fresh AI-powered forecasts generated');
      }
    } catch (error) {
      console.error('Failed to fetch price forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <GlassCard delay={0.6} onClick={onClick}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <TrendingUp className="w-6 h-6" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Price Forecast</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs" style={{ color: colors.textSecondary }}>AI-powered predictions</p>
              {isAiGenerated && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-green-600 font-medium">AI Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.surface }}
        >
          <ArrowRight className="w-5 h-5" style={{ color: colors.primary }} />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 rounded-full"
              style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
            />
          </div>
        ) : forecasts.length > 0 ? (
          forecasts.slice(0, 3).map((forecast, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ x: 5, scale: 1.02 }}
              className="p-4 rounded-xl shadow-md transition-all"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold capitalize" style={{ color: colors.textPrimary }}>{forecast.crop}</span>
                    {getTrendIcon(forecast.trend)}
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>
                    Current: ₹{forecast.currentPrice}/kg
                  </div>
                  <div className={`text-xs font-semibold mt-1 ${getTrendColor(forecast.trend)}`}>
                    30-day: ₹{forecast.forecast[forecast.forecast.length - 1]?.price || 0}/kg
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getTrendColor(forecast.trend)}`}>
                    {forecast.trend === 'up' ? '+' : forecast.trend === 'down' ? '-' : ''}
                    {Math.abs(
                      ((forecast.forecast[forecast.forecast.length - 1]?.price - forecast.currentPrice) / 
                      forecast.currentPrice * 100).toFixed(1)
                    )}%
                  </div>
                  <div className="text-[10px] uppercase" style={{ color: colors.textMuted }}>
                    {forecast.confidence} confidence
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8" style={{ color: colors.textSecondary }}>
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No crops to forecast</p>
            <p className="text-xs mt-1">Add crops in Account Centre</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 pt-4 border-t"
        style={{ borderColor: colors.border }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="text-center text-sm font-medium transition-colors"
            style={{ color: colors.textSecondary }}
          >
            Tap to view detailed forecast →
          </div>
          {lastUpdated && (
            <div className="text-[10px]" style={{ color: colors.textMuted }}>
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </motion.div>
    </GlassCard>
  );
};

export default PriceForecastCard;
