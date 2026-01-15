import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { indiaStates, indiaDistricts } from '../data/indiaLocations';

const BuyerRegisterClean = () => {
  const [formData, setFormData] = useState({
    name: '', pin: '', confirmPin: '', phone: '', email: '',
    state: '', district: '', city: '', pinCode: '', maxBidLimit: '10000',
    buyerType: 'commercial' // 'commercial' or 'public'
  });
  
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nextBuyerId, setNextBuyerId] = useState('');
  const [districts, setDistricts] = useState([]);
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

  useEffect(() => {
    const fetchNextBuyerId = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        const prefix = formData.buyerType === 'public' ? 'mgpb' : 'mgb';
        const response = await axios.get(`${API_URL}/api/auth/next-buyer-id?type=${formData.buyerType}`);
        setNextBuyerId(response.data.buyerId);
      } catch (e) {
        const prefix = formData.buyerType === 'public' ? 'MGPB' : 'MGB';
        setNextBuyerId(`${prefix}001`);
      }
    };
    fetchNextBuyerId();
  }, [formData.buyerType]);

  useEffect(() => {
    if (formData.state) {
      const selectedStateKey = indiaStates.find(state => state.label === formData.state)?.value;
      setDistricts(indiaDistricts[selectedStateKey] || []);
      setFormData(prev => ({ ...prev, district: '', city: '' }));
    }
  }, [formData.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) { setError('Name is required'); return false; }
    if (!/^\d{4}$/.test(formData.pin)) { setError('PIN must be 4 digits'); return false; }
    if (formData.pin !== formData.confirmPin) { setError('PINs do not match'); return false; }
    if (!/^\d{10}$/.test(formData.phone)) { setError('Phone must be 10 digits'); return false; }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) { setError('Invalid email'); return false; }
    if (!formData.state) { setError('State is required'); return false; }
    if (!formData.district) { setError('District is required'); return false; }
    if (!formData.city) { setError('City is required'); return false; }
    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) { setError('PIN code must be 6 digits'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.post(`${API_URL}/api/auth/buyer/register`, {
        name: formData.name.trim(),
        pin: formData.pin,
        phone: formData.phone,
        email: formData.email || undefined,
        state: formData.state,
        district: formData.district,
        city: formData.city,
        pinCode: formData.pinCode || undefined,
        maxBidLimit: parseInt(formData.maxBidLimit),
        buyerType: formData.buyerType
      });

      setSuccess(`Success! Your Buyer ID: ${response.data.buyerId}`);
      setTimeout(() => window.location.href = '/buyer-login', 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.background }}>
      {/* Left Panel - Branding */}
      <div 
        className="hidden lg:flex lg:w-2/5 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50" stroke="white" strokeWidth="0.5" fill="none" />
            <path d="M0,60 Q25,40 50,60 T100,60" stroke="white" strokeWidth="0.3" fill="none" />
            <path d="M0,70 Q25,50 50,70 T100,70" stroke="white" strokeWidth="0.2" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-14">
          <div className="mb-10">
            <img 
              src="/src/assets/Morgen-logo-main.png" 
              alt="Morgen Logo" 
              className="h-14 w-auto rounded-xl shadow-2xl"
            />
          </div>

          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
              Join Our<br />Marketplace!
            </h1>
            <p className="text-white/80 text-base xl:text-lg max-w-sm leading-relaxed">
              Create your buyer account and start connecting with farmers!
            </p>
          </div>

          {nextBuyerId && (
            <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-white/70 text-sm mb-1">Your Buyer ID will be:</p>
              <p className="text-white text-2xl font-bold">{nextBuyerId}</p>
            </div>
          )}

          <div className="absolute bottom-8 left-10 xl:left-14">
            <p className="text-white/60 text-sm">© 2026 Morgen. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-3/5 flex flex-col overflow-y-auto">
        {/* Simple Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="lg:hidden pt-6 px-6">
          <img 
            src="/src/assets/Morgen-logo-main.png" 
            alt="Morgen Logo" 
            className="h-10 w-auto rounded-xl shadow-lg"
          />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Create Buyer Account
              </h2>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Already have an account?{' '}
                <button
                  onClick={() => window.location.href = '/buyer-login'}
                  className="font-semibold underline hover:no-underline"
                  style={{ color: colors.primary }}
                >
                  Login here
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Buyer Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
                  Buyer Type *
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, buyerType: 'commercial' }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                      formData.buyerType === 'commercial' ? 'border-red-500 bg-red-50' : ''
                    }`}
                    style={{
                      backgroundColor: formData.buyerType === 'commercial' 
                        ? (isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2')
                        : colors.surface,
                      borderColor: formData.buyerType === 'commercial' ? colors.primary : colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.buyerType === 'commercial' ? 'bg-red-500 border-red-500' : 'border-gray-300'
                      }`}>
                        {formData.buyerType === 'commercial' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Commercial Buyer</h3>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          Full access: Bidding, Order tracking, All features
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, buyerType: 'public' }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                      formData.buyerType === 'public' ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    style={{
                      backgroundColor: formData.buyerType === 'public' 
                        ? (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF')
                        : colors.surface,
                      borderColor: formData.buyerType === 'public' ? '#3B82F6' : colors.border,
                      color: colors.textPrimary
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.buyerType === 'public' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}>
                        {formData.buyerType === 'public' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Public Buyer</h3>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          Direct purchase only, Local district crops
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {success && (
                <div 
                  className="p-3 rounded-xl flex items-center gap-3" 
                  style={{ 
                    backgroundColor: '#F0FDF4', 
                    border: '1px solid #BBF7D0', 
                    color: '#166534' 
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{success}</span>
                </div>
              )}

              {error && (
                <div 
                  className="p-3 rounded-xl flex items-center gap-3" 
                  style={{ 
                    backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#FEF2F2',
                    border: `1px solid ${isDarkMode ? 'rgba(220, 38, 38, 0.3)' : '#FECACA'}`,
                    color: '#DC2626'
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name *"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone (10 digits) *"
                  maxLength="10"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />

                {formData.buyerType === 'commercial' && (
                  <input
                    type="number"
                    name="maxBidLimit"
                    value={formData.maxBidLimit}
                    onChange={handleChange}
                    placeholder="Max Bid Limit (₹) *"
                    min="1000"
                    max="10000000"
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                )}

                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium appearance-none cursor-pointer"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select State *</option>
                  {indiaStates.map(state => (
                    <option key={state.value} value={state.label}>{state.label}</option>
                  ))}
                </select>

                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.state}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium appearance-none cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                >
                  <option value="">Select District *</option>
                  {districts.map(d => (
                    <option key={d.value} value={d.label}>{d.label}</option>
                  ))}
                </select>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City *"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />

                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="PIN Code (6 digits)"
                  maxLength="6"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />

                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    placeholder="Create PIN (4 digits) *"
                    maxLength="4"
                    className="w-full px-4 pr-12 py-3 rounded-xl border-2 transition-all text-sm font-medium tracking-widest"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    style={{ color: colors.textMuted }}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    name="confirmPin"
                    value={formData.confirmPin}
                    onChange={handleChange}
                    placeholder="Confirm PIN *"
                    maxLength="4"
                    className="w-full px-4 pr-12 py-3 rounded-xl border-2 transition-all text-sm font-medium tracking-widest"
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
                    {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 mt-6"
                style={{ 
                  backgroundColor: isDarkMode ? '#2D2D2D' : '#1a1a1a',
                  color: '#ffffff',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
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

export default BuyerRegisterClean;