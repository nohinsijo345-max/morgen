import { useState } from 'react';
import { ArrowRight, User as UserIcon, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios'; 

const Login = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        farmerId: farmerId.toUpperCase(),
        pin: pin
      });
      
      onLogin(response.data); 

    } catch (err) {
      const errorMessage = err.response?.data?.error || "Server connection failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image - Tractor in farm field */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2070&auto=format&fit=crop)', // Tractor spraying crops - Replace with /login-bg.jpg for your own image
          backgroundColor: '#87CEEB' // Sky blue fallback
        }}
      >
        {/* Lighter overlay to show the beautiful farm scene */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a4d5c]/50 via-[#0d5d6d]/45 to-[#0a4d5c]/50"></div>
      </div>

      {/* Decorative 3D floating shapes */}
      <motion.div 
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 180, 360],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm border border-white/10"
        style={{ filter: 'blur(2px)' }}
      />
      <motion.div 
        animate={{ 
          y: [0, 40, 0],
          rotate: [0, -180, -360],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 left-[15%] w-48 h-48 rounded-[30%] bg-gradient-to-br from-teal-400/15 to-cyan-500/15 backdrop-blur-sm border border-white/10"
        style={{ filter: 'blur(3px)' }}
      />
      <motion.div 
        animate={{ 
          y: [0, -25, 0],
          x: [0, 20, 0],
          rotate: [0, 90, 180],
          opacity: [0.25, 0.45, 0.25]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-40 right-[12%] w-40 h-40 rounded-[40%] bg-gradient-to-br from-blue-400/20 to-cyan-500/20 backdrop-blur-sm border border-white/10"
        style={{ filter: 'blur(2px)' }}
      />
      <motion.div 
        animate={{ 
          y: [0, 35, 0],
          x: [0, -15, 0],
          rotate: [0, -90, -180],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-20 right-[20%] w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400/15 to-teal-500/15 backdrop-blur-sm border border-white/10"
        style={{ filter: 'blur(2px)' }}
      />
      
      {/* Main login card container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Login Card */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-[#1a5f7a]/40 to-[#0d4a5f]/40 p-8 rounded-3xl shadow-2xl border border-white/20">
          
          {/* Logo Section */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-block mb-4">
              {/* Logo placeholder - Replace with your logo */}
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400/30 to-teal-400/30 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">M</span>
              </div>
            </div>
            <p className="text-white/60 text-sm">Your logo</p>
          </motion.div>

          {/* Login Title */}
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white text-center mb-8"
          >
            Login
          </motion.h2>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-400/40 text-white p-3 rounded-xl text-sm text-center mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Farmer ID Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-white/80 text-sm mb-2 font-medium">
                Farmer ID
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-white/90 border-0 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-base"
                placeholder="e.g. FAR-1001"
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                required
              />
            </motion.div>

            {/* PIN Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-white/80 text-sm mb-2 font-medium">
                Password
              </label>
              <input 
                type="password" 
                maxLength="4"
                className="w-full px-4 py-3 bg-white/90 border-0 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-base tracking-wider"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-right"
            >
              <a href="#" className="text-cyan-300 text-sm hover:text-cyan-200 transition-colors">
                Forgot Password?
              </a>
            </motion.div>

            {/* Login Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1a5f7a] to-[#0d4a5f] hover:from-[#1f6d8a] hover:to-[#0f5570] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-5 h-5" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">or continue with</span>
              </div>
            </div>
          </motion.div>

          {/* Social Login Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex gap-3 justify-center"
          >
            <button className="flex-1 bg-white hover:bg-gray-100 p-3 rounded-xl transition-all shadow-md flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button className="flex-1 bg-white hover:bg-gray-100 p-3 rounded-xl transition-all shadow-md flex items-center justify-center">
              <svg className="w-5 h-5" fill="#333" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button className="flex-1 bg-white hover:bg-gray-100 p-3 rounded-xl transition-all shadow-md flex items-center justify-center">
              <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
          </motion.div>

          {/* Register Link */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center text-sm text-white/60"
          >
            Don't have an account yet?{' '}
            <a href="#" className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors">
              Register for free
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;