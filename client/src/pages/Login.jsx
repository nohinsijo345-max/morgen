import { useState } from 'react';
import { Leaf, ArrowRight, Lock, User as UserIcon, Loader, Sparkles, Shield } from 'lucide-react';
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
      {/* Dynamic gradient background with animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(88,28,135,0.3),transparent_50%)]"></div>
        </div>
      </div>

      {/* Animated floating elements */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
      />
      
      {/* Main card container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-cyan-500/50 rounded-3xl blur-2xl opacity-60"></div>
        
        {/* Glassmorphic card */}
        <div className="relative backdrop-blur-2xl bg-white/10 p-10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            {/* Logo section */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                {/* Pulsing glow */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl"
                />
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/30 to-white/10 p-5 rounded-2xl border border-white/30 shadow-2xl">
                  <Leaf className="w-12 h-12 text-white drop-shadow-2xl" />
                </div>
              </div>
            </motion.div>
            
            {/* Title section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-10"
            >
              <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-2xl tracking-tight">
                Morgen
              </h1>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <p className="text-white/90 text-sm font-medium">Farming Evolved</p>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-white/70 text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Secure Authentication</span>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-red-500/20 border border-red-300/40 text-white p-4 rounded-2xl text-sm text-center mb-6 shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  {error}
                </div>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Farmer ID Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-white/95 mb-3 drop-shadow">
                  Farmer ID
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10 group-focus-within:text-white transition-colors" />
                    <input 
                      type="text" 
                      className="relative w-full pl-12 pr-4 py-4 backdrop-blur-xl bg-white/10 border border-white/30 rounded-2xl focus:border-white/50 focus:bg-white/20 outline-none text-white placeholder-white/40 transition-all shadow-xl text-base"
                      placeholder="e.g. FAR-1001"
                      value={farmerId}
                      onChange={(e) => setFarmerId(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* PIN Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-white/95 mb-3 drop-shadow">
                  4-Digit PIN
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10 group-focus-within:text-white transition-colors" />
                    <input 
                      type="password" 
                      maxLength="4"
                      className="relative w-full pl-12 pr-4 py-4 backdrop-blur-xl bg-white/10 border border-white/30 rounded-2xl focus:border-white/50 focus:bg-white/20 outline-none text-white placeholder-white/40 tracking-[0.5em] transition-all shadow-xl text-base"
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      required
                    />
                  </div>
                </div>
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
                className="relative w-full backdrop-blur-xl bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 border border-white/30 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl group overflow-hidden mt-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <span className="relative flex items-center gap-3 text-base">
                  {loading ? (
                    <>
                      <Loader className="animate-spin w-5 h-5" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Login Securely</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center space-y-2"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/30"></div>
                <Shield className="w-4 h-4 text-white/50" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/30"></div>
              </div>
              <p className="text-white/50 text-xs font-medium">
                End-to-end encrypted • Secure by design
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom reflection glow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-cyan-500/40 blur-3xl rounded-full"></div>
      </motion.div>
    </div>
  );
};

export default Login;