import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign,
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  CircleDollarSign,
  Wheat
} from 'lucide-react';
import axios from 'axios';
import { useBuyerTheme } from '../context/BuyerThemeContext';
import BuyerNeumorphicThemeToggle from '../components/BuyerNeumorphicThemeToggle';
import BuyerDecorativeElements from '../components/BuyerDecorativeElements';
import { indiaStates, getDistrictsByState, getCitiesByDistrict } from '../data/indiaLocations';

const BuyerRegister = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    pin: '',
    confirmPin: '',
    phone: '',
    email: '',
    state: '',
    district: '',
    city: '',
    pinCode: '',
    maxBidLimit: '10000'
  });
  
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nextBuyerId, setNextBuyerId] = useState('');
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  
  const { colors, isDarkMode } = useBuyerTheme();

  useEffect(() => {
    fetchNextBuyerId();
  }, []);

  useEffect(() => {
    if (formData.state) {
      const stateDistricts = getDistrictsByState(formData.state);
      setDistricts(stateDistricts);
      setFormData(prev => ({ ...prev, district: '', city: '' }));
      setCities([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.district) {
      const districtCities = getCitiesByDistrict(formData.state, formData.district);
      setCities(districtCities);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.district, formData.state]);

  const fetchNextBuyerId = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/auth/next-buyer-id`);
      setNextBuyerId(response.data.buyerId);
    } catch (error) {
      console.error('Failed to fetch next buyer ID:', error);
      setNextBuyerId('MGB001');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      setError('PIN must be exactly 4 digits');
      return false;
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    if (!formData.state) {
      setError('State is required');
      return false;
    }

    if (!formData.district) {
      setError('District is required');
      return false;
    }

    if (!formData.city) {
      setError('City is required');
      return false;
    }

    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
      setError('PIN code must be exactly 6 digits');
      return false;
    }

    const bidLimit = parseInt(formData.maxBidLimit);
    if (isNaN(bidLimit) || bidLimit < 1000 || bidLimit > 10000000) {
      setError('Max bid limit must be between ₹1,000 and ₹1,00,00,000');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      const registrationData = {
        name: formData.name.trim(),
        pin: formData.pin,
        phone: formData.phone,
        email: formData.email || undefined,
        state: formData.state,
        district: formData.district,
        city: formData.city,
        pinCode: formData.pinCode || undefined,
        maxBidLimit: parseInt(formData.maxBidLimit)
      };

      const response = await axios.post(`${API_URL}/api/auth/buyer/register`, registrationData);

      console.log('✅ Buyer registration successful:', response.data);
      
      setSuccess(`Registration successful! Your Buyer ID is: ${response.data.buyerId}`);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/buyer-login';
      }, 3000);
      
    } catch (err) {
      console.error('❌ Buyer registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Join as Buyer
          </h1>
          <p className="text-lg mb-2" style={{ color: colors.textSecondary }}>
            Create your buyer account to access the marketplace
          </p>
          <div className="flex items-center justify-center gap-4 text-sm mb-4" style={{ color: colors.textMuted }}>
            <div className="flex items-center gap-1">
              <CircleDollarSign className="w-4 h-4" />
              <span>Smart Bidding</span>
            </div>
            <div className="flex items-center gap-1">
              <Wheat className="w-4 h-4" />
              <span>Fresh Produce</span>
            </div>
          </div>
          {nextBuyerId && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                 style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Your Buyer ID will be:</span>
              <span className="font-bold text-lg" style={{ color: colors.primary }}>{nextBuyerId}</span>
            </div>
          )}
        </motion.div>

        {/* Registration Form */}
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
            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border flex items-center gap-3"
                style={{ 
                  backgroundColor: '#F0FDF4',
                  borderColor: '#BBF7D0',
                  color: '#166534'
                }}
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </motion.div>
            )}

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

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                        style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                        style={{ color: colors.textMuted }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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

              {/* Max Bid Limit */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Max Bid Limit *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                             style={{ color: colors.textMuted }} />
                  <input
                    type="number"
                    name="maxBidLimit"
                    value={formData.maxBidLimit}
                    onChange={handleChange}
                    placeholder="10000"
                    min="1000"
                    max="10000000"
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

              {/* State Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  State *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                          style={{ color: colors.textMuted }} />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 text-lg font-medium appearance-none cursor-pointer"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.border}
                  >
                    <option value="">Select State</option>
                    {indiaStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  District *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                          style={{ color: colors.textMuted }} />
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.state}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 text-lg font-medium appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.border}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  City *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                          style={{ color: colors.textMuted }} />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!formData.district}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 text-lg font-medium appearance-none cursor-pointer disabled:opacity-50"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.border}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PIN Code Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  PIN Code
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                          style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    maxLength="6"
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
            </div>

            {/* PIN Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PIN Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Create PIN *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                        style={{ color: colors.textMuted }} />
                  <input
                    type={showPin ? "text" : "password"}
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
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
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
                    style={{ color: colors.textMuted }}
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm PIN Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Confirm PIN *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                        style={{ color: colors.textMuted }} />
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    name="confirmPin"
                    value={formData.confirmPin}
                    onChange={handleChange}
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
            </div>

            {/* Register Button */}
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
                  <span>Create Buyer Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span style={{ color: colors.textSecondary }}>Already have an account?</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/buyer-login'}
                className="font-semibold transition-colors"
                style={{ color: colors.primary }}
              >
                Login here
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

export default BuyerRegister;