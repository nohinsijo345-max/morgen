import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BuyerForgotPasswordClean = () => {
  const [step, setStep] = useState(1);
  const [buyerId, setBuyerId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Simple colors
  const colors = {
    primary: '#FF4757',
    primaryDark: '#E63946',
    background: isDarkMode ? '#1A1A1A' : '#FAFBFC',
    surface: isDarkMode ? '#3A3A3A' : '#FFFFFF',
    textPrimary: isDarkMode ? '#FFFFFF' : '#2C3E50',
    textSecondary: isDarkMode ? '#B0B0B0' : '#6C757D',
    textMuted: isDarkMode ? '#808080' : '#ADB5BD',
    border: isDarkMode ? '#404040' : '#E9ECEF'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!buyerId || !email || !phone || !newPin || !confirmPin) {
      setError('All fields are required');
      return;
    }
    if (!/^MGB\d{3}$/.test(buyerId.toUpperCase())) {
      setError('Invalid Buyer ID format');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone must be 10 digits');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setError('PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/auth/buyer/reset-password`, {
        buyerId: buyerId.toUpperCase(), email, phone, newPin
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => window.location.href = '/buyer-login';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.background }}>
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Simple Theme Toggle */}
        <div className="absolute top-6 left-6 z-50 lg:hidden">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="lg:hidden pt-8 px-8">
          <img 
            src="/src/assets/Morgen-logo-main.png" 
            alt="Morgen Logo" 
            className="h-12 w-auto rounded-xl shadow-lg"
          />
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {step === 1 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>Reset Your PIN</h2>
                  <p className="text-base" style={{ color: colors.textSecondary }}>
                    Enter your details to reset your PIN.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div
                      className="p-4 rounded-xl flex items-center gap-3"
                      style={{ 
                        backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#FEF2F2',
                        border: `1px solid ${isDarkMode ? 'rgba(220, 38, 38, 0.3)' : '#FECACA'}`,
                        color: '#DC2626'
                      }}
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  <input
                    type="text"
                    value={buyerId}
                    onChange={(e) => setBuyerId(e.target.value.toUpperCase())}
                    placeholder="Buyer ID (MGB001)"
                    className="w-full px-4 py-4 rounded-xl border-2 transition-all text-base font-medium"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-4 rounded-xl border-2 transition-all text-base font-medium"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number (10 digits)"
                    maxLength="10"
                    className="w-full px-4 py-4 rounded-xl border-2 transition-all text-base font-medium"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />

                  <div className="relative">
                    <input
                      type={showNewPin ? "text" : "password"}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="New PIN (4 digits)"
                      maxLength="4"
                      className="w-full px-4 pr-12 py-4 rounded-xl border-2 transition-all text-base font-medium tracking-widest"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.textMuted }}
                    >
                      {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPin ? "text" : "password"}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Confirm New PIN"
                      maxLength="4"
                      className="w-full px-4 pr-12 py-4 rounded-xl border-2 transition-all text-base font-medium tracking-widest"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.textMuted }}
                    >
                      {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all"
                    style={{ 
                      backgroundColor: isDarkMode ? '#2D2D2D' : '#1a1a1a', 
                      color: '#ffffff',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : 'Reset PIN'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="flex items-center justify-center gap-2 text-sm font-medium mx-auto hover:underline"
                      style={{ color: colors.textSecondary }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div 
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F0FDF4' }}
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                  PIN Reset Successful!
                </h2>
                
                <p className="text-base mb-8" style={{ color: colors.textSecondary }}>
                  You can now login with your new PIN.
                </p>

                <button
                  onClick={handleBackToLogin}
                  className="w-full py-4 rounded-xl font-bold text-base shadow-lg"
                  style={{ backgroundColor: isDarkMode ? '#2D2D2D' : '#1a1a1a', color: '#ffffff' }}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
        }}
      >
        {/* Simple Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50" stroke="white" strokeWidth="0.5" fill="none" />
            <path d="M0,60 Q25,40 50,60 T100,60" stroke="white" strokeWidth="0.3" fill="none" />
            <path d="M0,70 Q25,50 50,70 T100,70" stroke="white" strokeWidth="0.2" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="mb-12">
            <img 
              src="/src/assets/Morgen-logo-main.png" 
              alt="Morgen Logo" 
              className="h-16 w-auto rounded-xl shadow-2xl"
            />
          </div>

          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              Forgot<br />Your PIN?
            </h1>
            <p className="text-white/80 text-lg xl:text-xl max-w-md leading-relaxed">
              No worries! Verify your identity and set a new PIN in seconds.
            </p>
          </div>

          <div className="absolute bottom-8 left-12 xl:left-16">
            <p className="text-white/60 text-sm">© 2026 Morgen. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerForgotPasswordClean;