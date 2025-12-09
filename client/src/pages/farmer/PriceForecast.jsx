import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowLeft, Calendar, IndianRupee, Filter } from 'lucide-react';
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
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeRange, setTimeRange] = useState('30days');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      const farmerUser = localStorage.getItem('farmerUser');
      if (farmerUser) {
        const userData = JSON.parse(farmerUser);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        const response = await axios.get(`${API_URL}/api/price-forecast/forecast/${userData.farmerId}`);
        setForecasts(response.data.forecasts || []);
        if (response.data.forecasts && response.data.forecasts.length > 0) {
          setSelectedCrop(response.data.forecasts[0]);
        }
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

  const getChartData = (forecast) => {
    if (!forecast) return null;

    // Combine history and forecast for full chart
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
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Show 30 days of history
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysToShow);

    // Filter data based on time range
    allData = allData.filter(d => {
      const itemDate = new Date(d.date);
      return itemDate >= cutoffDate && itemDate <= futureDate;
    });

    // Apply year filter (only show data from selected year)
    if (selectedYear !== new Date().getFullYear()) {
      // For historical years, show placeholder message
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
          label: 'Historical Price (₹/kg)',
          data: allData.map(d => d.type === 'history' ? d.price : null),
          borderColor: 'rgb(107, 114, 128)',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          spanGaps: false,
        },
        {
          label: 'Forecast Price (₹/kg)',
          data: allData.map(d => d.type === 'forecast' ? d.price : null),
          borderColor: forecast.trend === 'up' ? 'rgb(34, 197, 94)' : forecast.trend === 'down' ? 'rgb(239, 68, 68)' : 'rgb(107, 114, 128)',
          backgroundColor: forecast.trend === 'up' ? 'rgba(34, 197, 94, 0.1)' : forecast.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          spanGaps: false,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y}/kg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return '₹' + value;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#e1e2d0] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#082829] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#082829] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="w-12 h-12 bg-white/40 backdrop-blur-xl rounded-2xl border border-[#082829]/20 flex items-center justify-center shadow-lg hover:bg-white/60 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#082829]" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold text-[#082829] flex items-center gap-3">
                <TrendingUp className="w-10 h-10 text-[#082829]" />
                Price Forecast
              </h1>
              <p className="text-[#082829]/60 mt-1">AI-powered market predictions</p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#082829] to-[#0a3a3c] rounded-2xl px-6 py-3 shadow-xl"
          >
            <div className="text-[#fbfbef]/70 text-sm">Total Crops</div>
            <div className="text-[#fbfbef] text-2xl font-bold">{forecasts.length}</div>
          </motion.div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-[#082829]/20 border-t-[#082829] rounded-full"
            />
          </div>
        ) : forecasts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <TrendingUp className="w-20 h-20 mx-auto mb-4 text-[#082829]/20" />
            <h2 className="text-2xl font-bold text-[#082829] mb-2">No Crops to Forecast</h2>
            <p className="text-[#082829]/60">Add crops in Account Centre to see price predictions</p>
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
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedCrop?.crop === forecast.crop
                      ? 'bg-[#082829] text-white shadow-lg'
                      : 'bg-[#cce0cc] text-[#082829] hover:bg-[#b3d1b3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold capitalize text-lg">{forecast.crop}</span>
                    {getTrendIcon(forecast.trend)}
                  </div>
                  <div className="text-sm opacity-90">
                    ₹{forecast.currentPrice}/kg
                  </div>
                  <div className={`text-xs mt-1 font-semibold ${
                    selectedCrop?.crop === forecast.crop ? 'text-white' : getTrendColor(forecast.trend)
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
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#082829] capitalize">
                      {selectedCrop.crop} Price Trend
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#082829] text-white font-semibold"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                    </motion.button>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-[#e1e2d0] rounded-xl space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Time Range Filter */}
                        <div>
                          <label className="text-xs text-[#082829]/70 uppercase font-semibold mb-2 block">
                            Time Range
                          </label>
                          <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white text-[#082829] font-medium border-none outline-none cursor-pointer"
                          >
                            <option value="7days">7 Days</option>
                            <option value="15days">15 Days</option>
                            <option value="30days">30 Days</option>
                            <option value="60days">60 Days</option>
                            <option value="90days">90 Days</option>
                          </select>
                        </div>

                        {/* Year Filter */}
                        <div>
                          <label className="text-xs text-[#082829]/70 uppercase font-semibold mb-2 block">
                            Year
                          </label>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-white text-[#082829] font-medium border-none outline-none cursor-pointer"
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
                        <label className="text-xs text-[#082829]/70 uppercase font-semibold mb-2 block">
                          Quick Filters
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setTimeRange('7days')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              timeRange === '7days'
                                ? 'bg-[#082829] text-white'
                                : 'bg-white text-[#082829] hover:bg-[#cce0cc]'
                            }`}
                          >
                            This Week
                          </button>
                          <button
                            onClick={() => setTimeRange('30days')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              timeRange === '30days'
                                ? 'bg-[#082829] text-white'
                                : 'bg-white text-[#082829] hover:bg-[#cce0cc]'
                            }`}
                          >
                            This Month
                          </button>
                          <button
                            onClick={() => setTimeRange('90days')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              timeRange === '90days'
                                ? 'bg-[#082829] text-white'
                                : 'bg-white text-[#082829] hover:bg-[#cce0cc]'
                            }`}
                          >
                            This Quarter
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="h-64">
                    <Line data={getChartData(selectedCrop)} options={chartOptions} />
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-[#082829] mb-4">Market Analysis</h3>
                  <p className="text-[#082829]/80 mb-4">{selectedCrop.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-[#082829]/60" />
                        <span className="text-xs text-[#082829]/60 uppercase">Current Price</span>
                      </div>
                      <div className="text-2xl font-bold text-[#082829]">
                        ₹{selectedCrop.currentPrice}
                      </div>
                      <div className="text-xs text-[#082829]/60 mt-1">per kg</div>
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-[#082829]/60" />
                        <span className="text-xs text-[#082829]/60 uppercase">30-Day Forecast</span>
                      </div>
                      <div className={`text-2xl font-bold ${getTrendColor(selectedCrop.trend)}`}>
                        ₹{selectedCrop.forecast[selectedCrop.forecast.length - 1]?.price}
                      </div>
                      <div className="text-xs text-[#082829]/60 mt-1">per kg</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#082829]/70">Confidence Level</span>
                      <span className="text-sm font-bold text-[#082829] uppercase">
                        {selectedCrop.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceForecast;
