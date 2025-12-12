import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import axios from 'axios';

const PriceForecastCard = ({ onClick }) => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecasts();
    // Auto-refresh every 5 minutes for updated price forecasts
    const interval = setInterval(fetchForecasts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchForecasts = async () => {
    try {
      const farmerUser = localStorage.getItem('farmerUser');
      if (farmerUser) {
        const userData = JSON.parse(farmerUser);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        // Add cache-busting parameter to ensure fresh data
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/api/price-forecast/forecast/${userData.farmerId}?t=${timestamp}`);
        setForecasts(response.data.forecasts || []);
        console.log('Price forecasts refreshed:', new Date().toLocaleTimeString());
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-gradient-to-br from-green-50/30 to-emerald-50/20 backdrop-blur-xl rounded-3xl p-6 border border-green-200/20 shadow-2xl cursor-pointer relative overflow-hidden group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#082829] to-[#0a3a3c] rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-[#fbfbef]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#082829]">Price Forecast</h2>
            <p className="text-[#082829]/60 text-xs">AI-powered predictions</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#082829]/10 flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-[#082829]" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-[#082829]/20 border-t-[#082829] rounded-full"
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
              className="bg-[#cce0cc] p-4 rounded-xl shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#082829] font-bold capitalize">{forecast.crop}</span>
                    {getTrendIcon(forecast.trend)}
                  </div>
                  <div className="text-sm text-[#082829]/70">
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
                  <div className="text-[10px] text-[#082829]/60 uppercase">
                    {forecast.confidence} confidence
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-[#082829]/60">
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
        className="mt-4 pt-4 border-t border-[#082829]/10 relative z-10"
      >
        <div className="text-center text-[#082829]/70 text-sm font-medium group-hover:text-[#082829] transition-colors">
          Tap to view detailed forecast →
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PriceForecastCard;
