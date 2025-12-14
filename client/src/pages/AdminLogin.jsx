import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AdminThemeProvider, useAdminTheme } from '../context/AdminThemeContext';
import AdminNeumorphicThemeToggle from '../components/AdminNeumorphicThemeToggle';

const AdminLoginContent = ({ onLogin }) => {
  const [adminId, setAdminId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isDarkMode, colors } = useAdminTheme();

  // Add admin-portal class to body to prevent Orkney font
  useEffect(() => {
    document.body.classList.add('admin-portal');
    return () => {
      document.body.classList.remove('admin-portal');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        farmerId: adminId.toUpperCase(),
        pin: pin
      });

      // Check if user is admin
      if (response.data.role !== 'admin') {
        setError('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs with theme colors */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.accent}20` }}
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.primary}20` }}
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: `${colors.accent}15` }}
        />
        
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.accent} 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <AdminNeumorphicThemeToggle size="md" />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <img src="/admin-logo.png" alt="Morgen Admin" className="h-12 w-auto rounded-xl shadow-lg" />
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Morgen</h1>
            <p className="text-xs" style={{ color: colors.textSecondary }}>Administration</p>
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl rounded-3xl p-8 shadow-xl transition-colors duration-300"
          style={{ 
            backgroundColor: colors.glassBackground,
            border: `1px solid ${colors.glassBorder}`,
            boxShadow: `0 25px 50px -12px ${colors.accent}15`
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
                boxShadow: `0 10px 30px ${colors.accent}40`
              }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>Admin Login</h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Enter your credentials to access the dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl text-sm text-center"
              style={{ 
                backgroundColor: `${colors.error}15`,
                border: `1px solid ${colors.error}30`,
                color: colors.error
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Admin ID Field */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>Admin ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter admin ID"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                    '--tw-ring-color': colors.accent
                  }}
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>PIN</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  maxLength="4"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                    '--tw-ring-color': colors.accent
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: colors.textMuted }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3.5 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
              style={{ 
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
                boxShadow: `0 10px 30px ${colors.accent}30`
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 text-center" style={{ borderTop: `1px solid ${colors.border}` }}>
            <a 
              href="/login" 
              className="text-sm transition-colors"
              style={{ color: colors.accent }}
            >
              ← Back to Farmer Login
            </a>
          </div>
        </motion.div>

        {/* Bottom Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs mt-6"
          style={{ color: colors.textSecondary }}
        >
          Secure admin access • Morgen Agriculture Platform
        </motion.p>
      </motion.div>
    </div>
  );
};

// Wrapper component with AdminThemeProvider
const AdminLogin = ({ onLogin }) => {
  return (
    <AdminThemeProvider>
      <AdminLoginContent onLogin={onLogin} />
    </AdminThemeProvider>
  );
};

export default AdminLogin;
