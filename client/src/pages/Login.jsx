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

          {/* Register Link */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
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