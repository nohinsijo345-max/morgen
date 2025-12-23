import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, ArrowRight, AlertCircle, CircleDollarSign, Wheat } from 'lucide-react';
import axios from 'axios';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import BuyerNeumorphicThemeToggle from '../components/BuyerNeumorphicThemeToggle';
import BuyerDecorativeElements from '../components/BuyerDecorativeElements';

const BuyerLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    buyerId: '',
    pin: ''
  });
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors, isDarkMode } = useBuyerTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.buyerId || !formData.pin) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      console.log('🔄 Attempting buyer login with:', {
        buyerId: formData.buyerId.toUpperCase(),
        pin: formData.pin,
        apiUrl: API_URL
      });
      
      const response = await axios.post(`${API_URL}/api/auth/buyer/login`, {
        buyerId: formData.buyerId.toUpperCase(),
        pin: formData.pin
      });

      console.log('✅ Buyer login successful:', response.data);
      
      // Call parent login handler (this will set the session via SessionManager)
      onLogin(response.data);
      
      // Redirect to buyer dashboard
      window.location.href = '/buyer/dashboard';
      
    } catch (err) {
      console.error('❌ Buyer login error:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error data:', err.response?.data);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300" 
         style={{ backgroundColor: colors.background }}>
      
      {/* Decorative Elements */}
      <BuyerDecorativeElements colors={colors} isDarkMode={isDarkMode} />

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Logo in Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <img 
          src="/src/assets/Morgen-logo-main.png" 
          alt="Morgen Logo" 
          className="h-12 w-auto rounded-xl shadow-lg"
        />
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <BuyerNeumorphicThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Welcome Back
          </h1>
          <p className="text-lg mb-2" style={{ color: colors.textSecondary }}>
            Buyer Portal Login
          </p>
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: colors.textMuted }}>
            <CircleDollarSign className="w-4 h-4" />
            <span>Connect with farmers • Make profitable deals</span>
            <Wheat className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl border"
          style={{ 
            backgroundColor: colors.backgroundCard,
            borderColor: colors.cardBorder
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border flex items-center gap-3"
                style={{ 
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FECACA',
                  color: '#DC2626'
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {/* Buyer ID Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                Buyer ID
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                      style={{ color: colors.textMuted }} />
                <input
                  type="text"
                  name="buyerId"
                  value={formData.buyerId}
                  onChange={handleChange}
                  placeholder="Enter your Buyer ID (e.g., MGB001)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 text-lg font-medium"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
              </div>
            </div>

            {/* PIN Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                      style={{ color: colors.textMuted }} />
                <input
                  type={showPin ? "text" : "password"}
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="Enter 4-digit PIN"
                  maxLength="4"
                  className="w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-200 text-lg font-medium tracking-widest"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
                  style={{ color: colors.textMuted }}
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: colors.primary,
                color: isDarkMode ? '#0d1117' : '#ffffff'
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/buyer/forgot-password'}
              className="text-sm font-medium transition-colors"
              style={{ color: colors.primary }}
            >
              Forgot PIN?
            </motion.button>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <span style={{ color: colors.textSecondary }}>Don't have an account?</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/buyer-register'}
                className="font-semibold transition-colors"
                style={{ color: colors.primary }}
              >
                Register here
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="text-sm font-medium transition-colors"
            style={{ color: colors.textSecondary }}
          >
            ← Back to Module Selector
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BuyerLogin;