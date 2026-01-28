import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowLeft, Calendar, IndianRupee, Filter, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import NeumorphicThemeToggle from '../../components/NeumorphicThemeToggle';
import { UserSession } from '../../utils/userSession';
import { useTranslation } from '../../hooks/useTranslation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceForecast = () => {
  const { t } = useTranslation();
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeRange, setTimeRange] = useState('30days');
  const [showFilters, setShowFilters] = useState(false);
  const { isDarkMode, colors } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      // Get user session data using UserSession utility
      const userData = UserSession.getCurrentUser('farmer');
      const farmerId = userData?.farmerId;
      
      if (!farmerId) {
        console.log('⚠️ No farmerId found in session for price forecasts');
        return;
      }
      
      console.log('✅ Fetching price forecasts for farmerId:', farmerId);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/price-forecast/forecast/${farmerId}`);
      setForecasts(response.data.forecasts || []);
      if (response.data.forecasts && response.data.forecasts.length > 0) {
        setSelectedCrop(response.data.forecasts[0]);
      }
    } catch (error) {
      console.error('Failed to fetch price forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Create gradient for chart
  const createGradient = (ctx, chartArea) => {
    if (!chartArea) return null;
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    // Green gradient shades from dark to light
    gradient.addColorStop(0, 'rgba(20, 69, 47, 0.0)');
    gradient.addColorStop(0.3, 'rgba(20, 69, 47, 0.2)');
    gradient.addColorStop(0.6, 'rgba(34, 139, 84, 0.4)');
    gradient.addColorStop(1, 'rgba(52, 211, 153, 0.6)');
    return gradient;
  };

  const getChartData = (forecast) => {
    if (!forecast) return null;

    // Combine history and forecast for full chart - create smooth continuous line
    let allData = [
      ...(forecast.history || []).map(h => ({ date: h.date, price: h.price, type: 'history' })),
      ...forecast.forecast.map(f => ({ date: f.date, price: f.price, type: 'forecast' }))
    ];

    // Apply time range filter
    const today = new Date();
    const daysMap = {
      '7days': 7,
      '15days': 15,
      '30days': 30,
      '60days': 60,
      '90days': 90
    };
    
    const daysToShow = daysMap[timeRange] || 30;
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysToShow);

    allData = allData.filter(d => {
      const itemDate = new Date(d.date);
      return itemDate >= cutoffDate && itemDate <= futureDate;
    });

    if (selectedYear !== new Date().getFullYear()) {
      allData = allData.map(d => {
        const itemDate = new Date(d.date);
        itemDate.setFullYear(selectedYear);
        return { ...d, date: itemDate.toISOString().split('T')[0] };
      });
    }

    return {
      labels: allData.map(d => formatDate(d.date)),
      datasets: [
        {
          label: 'Price (₹/kg)',
          data: allData.map(d => d.price),
          borderColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#14452f';
            // Create gradient for line stroke - green shades
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            gradient.addColorStop(0, '#0a241a');
            gradient.addColorStop(0.3, '#14452f');
            gradient.addColorStop(0.6, '#228B52');
            gradient.addColorStop(1, '#34d399');
            return gradient;
          },
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(20, 69, 47, 0.1)';
            return createGradient(ctx, chartArea);
          },
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#14452f',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
          borderWidth: 3,
          spanGaps: true,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(20, 69, 47, 0.95)' : 'rgba(20, 69, 47, 0.9)',
        padding: 16,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 14 },
        borderColor: 'rgba(52, 211, 153, 0.3)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `₹${context.parsed.y}/kg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.textSecondary,
          font: { size: 11 },
          padding: 10,
          callback: function(value) {
            return '₹' + value;
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.textSecondary,
          font: { size: 11 },
          maxRotation: 0,
          padding: 10,
        }
      }
    },
    elements: {
      line: {
        capBezierPoints: true,
      }
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 backdrop-blur-xl border-b shadow-lg sticky top-0"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: colors.primary }}>
                  <TrendingUp className="w-5 h-5" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{t('priceForecast')}</h1>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>{t('aiPoweredPredictions')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl px-4 py-2 shadow-lg hidden sm:block"
                style={{ backgroundColor: colors.primary }}
              >
                <div className="text-xs" style={{ color: isDarkMode ? '#0d1117' : '#ffffff', opacity: 0.8 }}>{t('totalCrops')}</div>
                <div className="text-lg font-bold" style={{ color: isDarkMode ? '#0d1117' : '#ffffff' }}>{forecasts.length}</div>
              </motion.div>

              <NeumorphicThemeToggle size="sm" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="p-2.5 rounded-xl transition-all"
                style={{ backgroundColor: colors.surface, color: colors.textPrimary }}
              >
                <Home className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6 relative z-10">

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 rounded-full"
              style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }}
            />
          </div>
        ) : forecasts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <TrendingUp className="w-20 h-20 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>{t('noCropsToForecast')}</h2>
            <p style={{ color: colors.textSecondary }}>{t('addCropsInAccountCentre')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crop List */}
            <div className="space-y-3">
              {forecasts.map((forecast, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCrop(forecast)}
                  className="p-4 rounded-xl cursor-pointer transition-all shadow-lg"
                  style={{
                    backgroundColor: selectedCrop?.crop === forecast.crop ? colors.primary : colors.backgroundCard,
                    color: selectedCrop?.crop === forecast.crop ? (isDarkMode ? '#0d1117' : '#ffffff') : colors.textPrimary,
                    borderColor: colors.cardBorder,
                    borderWidth: '1px'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold capitalize text-lg">{forecast.crop}</span>
                    {getTrendIcon(forecast.trend)}
                  </div>
                  <div className="text-sm opacity-90">
                    ₹{forecast.currentPrice}/kg
                  </div>
                  <div className={`text-xs mt-1 font-semibold ${
                    selectedCrop?.crop === forecast.crop ? '' : getTrendColor(forecast.trend)
                  }`}>
                    {forecast.trend === 'up' ? '+' : forecast.trend === 'down' ? '-' : ''}
                    {Math.abs(
                      ((forecast.forecast[forecast.forecast.length - 1]?.price - forecast.currentPrice) / 
                      forecast.currentPrice * 100).toFixed(1)
                    )}% in 30 days
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Detailed View */}
            {selectedCrop && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Chart Card */}
                <GlassCard delay={0.2} hoverScale={1.01}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold capitalize" style={{ color: colors.textPrimary }}>
                      {selectedCrop.crop} {t('priceTrend')}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors"
                      style={{ backgroundColor: colors.primary, color: isDarkMode ? '#0d1117' : '#ffffff' }}
                    >
                      <Filter className="w-4 h-4" />
                      {t('filters')}
                    </motion.button>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 rounded-xl space-y-3"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Time Range Filter */}
                        <div>
                          <label className="text-xs uppercase font-semibold mb-2 block" style={{ color: colors.textSecondary }}>
                            {t('timeRange')}
                          </label>
                          <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg font-medium border-none outline-none cursor-pointer transition-colors"
                            style={{ backgroundColor: colors.backgroundCard, color: colors.textPrimary }}
                          >
                            <option value="7days">{t('sevenDays')}</option>
                            <option value="15days">{t('fifteenDays')}</option>
                            <option value="30days">{t('thirtyDays')}</option>
                            <option value="60days">{t('sixtyDays')}</option>
                            <option value="90days">{t('ninetyDays')}</option>
                          </select>
                        </div>

                        {/* Year Filter */}
                        <div>
                          <label className="text-xs uppercase font-semibold mb-2 block" style={{ color: colors.textSecondary }}>
                            {t('year')}
                          </label>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg font-medium border-none outline-none cursor-pointer transition-colors"
                            style={{ backgroundColor: colors.backgroundCard, color: colors.textPrimary }}
                          >
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                            <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                            <option value={new Date().getFullYear() - 3}>{new Date().getFullYear() - 3}</option>
                            <option value={new Date().getFullYear() - 4}>{new Date().getFullYear() - 4}</option>
                          </select>
                        </div>
                      </div>

                      {/* Quick Filters */}
                      <div>
                        <label className="text-xs uppercase font-semibold mb-2 block" style={{ color: colors.textSecondary }}>
                          {t('quickFilters')}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setTimeRange('7days')}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                              backgroundColor: timeRange === '7days' ? colors.primary : colors.backgroundCard,
                              color: timeRange === '7days' ? (isDarkMode ? '#0d1117' : '#ffffff') : colors.textPrimary
                            }}
                          >
                            {t('thisWeek')}
                          </button>
                          <button
                            onClick={() => setTimeRange('30days')}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                              backgroundColor: timeRange === '30days' ? colors.primary : colors.backgroundCard,
                              color: timeRange === '30days' ? (isDarkMode ? '#0d1117' : '#ffffff') : colors.textPrimary
                            }}
                          >
                            {t('thisMonth')}
                          </button>
                          <button
                            onClick={() => setTimeRange('90days')}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                              backgroundColor: timeRange === '90days' ? colors.primary : colors.backgroundCard,
                              color: timeRange === '90days' ? (isDarkMode ? '#0d1117' : '#ffffff') : colors.textPrimary
                            }}
                          >
                            {t('thisQuarter')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="h-64">
                    <Line data={getChartData(selectedCrop)} options={chartOptions} />
                  </div>
                </GlassCard>

                {/* Summary Card */}
                <GlassCard delay={0.3} hoverScale={1.01}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>{t('marketAnalysis')}</h3>
                  <p className="mb-4" style={{ color: colors.textSecondary }}>{selectedCrop.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-xs uppercase" style={{ color: colors.textMuted }}>{t('currentPrice')}</span>
                      </div>
                      <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                        ₹{selectedCrop.currentPrice}
                      </div>
                      <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{t('perKg')}</div>
                    </div>
                    
                    <div className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" style={{ color: colors.textMuted }} />
                        <span className="text-xs uppercase" style={{ color: colors.textMuted }}>{t('thirtyDayForecast')}</span>
                      </div>
                      <div className={`text-2xl font-bold ${getTrendColor(selectedCrop.trend)}`}>
                        ₹{selectedCrop.forecast[selectedCrop.forecast.length - 1]?.price}
                      </div>
                      <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{t('perKg')}</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>{t('confidenceLevel')}</span>
                      <span className="text-sm font-bold uppercase" style={{ color: colors.textPrimary }}>
                        {selectedCrop.confidence}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceForecast;
