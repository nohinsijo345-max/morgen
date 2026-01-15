import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BuyerLoginClean = ({ onLogin }) => {
  const [formData, setFormData] = useState({ buyerId: '', pin: '' });
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const response = await axios.post(`${API_URL}/api/auth/buyer/login`, {
        buyerId: formData.buyerId.toUpperCase(),
        pin: formData.pin
      });
      if (onLogin) onLogin(response.data);
      window.location.href = '/buyer/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.background }}>
      {/* Left Panel - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)` }}
      >
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
              Hello<br />Buyer!
            </h1>
            <p className="text-white/80 text-lg xl:text-xl max-w-md leading-relaxed">
              Connect with farmers, bid on fresh produce, and grow your business!
            </p>
          </div>

          <div className="absolute bottom-8 left-12 xl:left-16">
            <p className="text-white/60 text-sm">© 2026 Morgen. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div 
        className="w-full lg:w-1/2 flex flex-col"
        style={{ backgroundColor: colors.background }}
      >
        <div className="absolute top-6 right-6 z-50">
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
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>Welcome Back!</h2>
              <p className="text-base" style={{ color: colors.textSecondary }}>
                Don't have an account?{' '}
                <button
                  onClick={() => window.location.href = '/buyer-register'}
                  className="font-semibold underline hover:no-underline"
                  style={{ color: colors.primary }}
                >
                  Create one now
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                name="buyerId"
                value={formData.buyerId}
                onChange={handleChange}
                placeholder="Buyer ID (e.g., MGB001)"
                className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-base font-medium"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
              />

              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="Password (4-digit PIN)"
                  maxLength="4"
                  className="w-full px-4 pr-12 py-4 rounded-xl border-2 transition-all duration-200 text-base font-medium tracking-widest"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: isDarkMode ? '#2D2D2D' : '#1a1a1a', color: '#ffffff' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : 'Login Now'}
              </button>

              <div className="text-center pt-2">
                <span style={{ color: colors.textSecondary }}>Forget password? </span>
                <button
                  type="button"
                  onClick={() => window.location.href = '/buyer/forgot-password'}
                  className="font-semibold underline hover:no-underline"
                  style={{ color: colors.textPrimary }}
                >
                  Click here
                </button>
              </div>
            </form>

            <div className="text-center mt-8">
              <button
                onClick={() => window.location.href = '/'}
                className="text-sm font-medium hover:underline"
                style={{ color: colors.textSecondary }}
              >
                ← Back to Module Selector
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerLoginClean;