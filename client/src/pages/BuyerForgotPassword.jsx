import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, User, Mail, Phone, Lock, CircleDollarSign, Wheat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import BuyerNeumorphicThemeToggle from '../components/BuyerNeumorphicThemeToggle';
import BuyerDecorativeElements from '../components/BuyerDecorativeElements';

const BuyerForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter details, 2: Success
  const [buyerId, setBuyerId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  
  const { colors, isDarkMode } = useBuyerTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!buyerId || !email || !phone || !newPin || !confirmPin) {
      setError('All fields are required');
      return;
    }

    if (!/^MGB\d{3}$/.test(buyerId.toUpperCase())) {
      setError('Buyer ID must be in format MGB001, MGB002, etc.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      const response = await axios.post(`${API_URL}/api/auth/buyer/reset-password`, {
        buyerId: buyerId.toUpperCase(),
        email,
        phone,
        newPin
      });

      console.log('✅ Buyer PIN reset successful:', response.data);
      setStep(2);
    } catch (err) {
      console.error('❌ Buyer PIN reset error:', err);
      setError(err.response?.data?.error || 'Failed to reset PIN. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/buyer-login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300" 
         style={{ backgroundColor: colors.background }}>
      
      {/* Decorative Elements */}
      <BuyerDecorativeElements colors={colors} isDarkMode={isDarkMode} />
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
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
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="reset-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                  Reset Your PIN
                </h1>
                <p className="text-lg mb-2" style={{ color: colors.textSecondary }}>
                  Enter your details to reset your buyer PIN
                </p>
                <div className="flex items-center justify-center gap-4 text-sm" style={{ color: colors.textMuted }}>
                  <div className="flex items-center gap-1">
                    <CircleDollarSign className="w-4 h-4" />
                    <span>Secure Access</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wheat className="w-4 h-4" />
                    <span>Buyer Portal</span>
                  </div>
                </div>
              </div>

              {/* Reset Form */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
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
                      Buyer ID *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                            style={{ color: colors.textMuted }} />
                      <input
                        type="text"
                        value={buyerId}
                        onChange={(e) => setBuyerId(e.target.value.toUpperCase())}
                        placeholder="MGB001"
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

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                            style={{ color: colors.textMuted }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
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

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                             style={{ color: colors.textMuted }} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit phone number"
                        maxLength="10"
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

                  {/* New PIN Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      New PIN *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                            style={{ color: colors.textMuted }} />
                      <input
                        type={showNewPin ? "text" : "password"}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="4-digit PIN"
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
                        onClick={() => setShowNewPin(!showNewPin)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
                        style={{ color: colors.textMuted }}
                      >
                        {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm PIN Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      Confirm New PIN *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                            style={{ color: colors.textMuted }} />
                      <input
                        type={showConfirmPin ? "text" : "password"}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="Confirm 4-digit PIN"
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
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
                        style={{ color: colors.textMuted }}
                      >
                        {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Reset Button */}
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
                      'Reset PIN'
                    )}
                  </motion.button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackToLogin}
                    className="flex items-center justify-center gap-2 text-sm font-medium transition-colors mx-auto"
                    style={{ color: colors.textSecondary }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl border text-center"
                style={{ 
                  backgroundColor: colors.backgroundCard,
                  borderColor: colors.cardBorder
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F0FDF4' }}
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>

                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                  PIN Reset Successful!
                </h2>
                
                <p className="text-lg mb-8" style={{ color: colors.textSecondary }}>
                  Your PIN has been successfully reset. You can now login with your new PIN.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToLogin}
                  className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: isDarkMode ? '#0d1117' : '#ffffff'
                  }}
                >
                  Back to Login
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BuyerForgotPassword;