import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

// Icy Blue Color Palette
// #E8F4F8 - Lightest icy blue (background)
// #C5DCE8 - Soft blue
// #8BB8D0 - Medium blue
// #5B9BBF - Steel blue
// #4682B4 - Deep blue (primary)
// #3A6B8C - Dark blue (accent)

const AdminLogin = ({ onLogin }) => {
  const [adminId, setAdminId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F8] via-[#C5DCE8] to-[#8BB8D0] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-80 h-80 bg-[#4682B4]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#5B9BBF]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#8BB8D0]/30 rounded-full blur-3xl"
        />
        
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #3A6B8C 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
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
            <h1 className="text-xl font-bold text-[#3A6B8C]">Morgen</h1>
            <p className="text-xs text-[#5B9BBF]">Administration</p>
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-[#C5DCE8] shadow-xl shadow-[#4682B4]/10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-br from-[#5B9BBF] to-[#3A6B8C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4682B4]/30"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-[#3A6B8C] mb-2">Admin Login</h2>
            <p className="text-[#5B9BBF] text-sm">Enter your credentials to access the dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Admin ID Field */}
            <div>
              <label className="block text-sm font-medium text-[#3A6B8C] mb-2">Admin ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8BB8D0]" />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter admin ID"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-[#E8F4F8]/50 border border-[#C5DCE8] rounded-xl text-[#3A6B8C] placeholder-[#8BB8D0] focus:outline-none focus:ring-2 focus:ring-[#5B9BBF]/50 focus:border-[#5B9BBF] transition-all"
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label className="block text-sm font-medium text-[#3A6B8C] mb-2">PIN</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8BB8D0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  maxLength="4"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-[#E8F4F8]/50 border border-[#C5DCE8] rounded-xl text-[#3A6B8C] placeholder-[#8BB8D0] focus:outline-none focus:ring-2 focus:ring-[#5B9BBF]/50 focus:border-[#5B9BBF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8BB8D0] hover:text-[#5B9BBF] transition-colors"
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
              className="w-full bg-gradient-to-r from-[#5B9BBF] to-[#4682B4] hover:from-[#4682B4] hover:to-[#3A6B8C] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-[#4682B4]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
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
          <div className="mt-8 pt-6 border-t border-[#C5DCE8] text-center">
            <a 
              href="/login" 
              className="text-sm text-[#5B9BBF] hover:text-[#3A6B8C] transition-colors"
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
          className="text-center text-[#5B9BBF] text-xs mt-6"
        >
          Secure admin access • Morgen Agriculture Platform
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
