import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Plus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { indiaStates, indiaDistricts, cropTypes } from '../data/indiaLocations';

const Login = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const defaultLoginImage = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
  const defaultRegisterImage = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
  
  // Initialize with cached images from localStorage or defaults
  const [loginImage, setLoginImage] = useState(() => {
    return localStorage.getItem('cachedLoginImage') || defaultLoginImage;
  });
  const [registerImage, setRegisterImage] = useState(() => {
    return localStorage.getItem('cachedRegisterImage') || defaultRegisterImage;
  });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [signUpData, setSignUpData] = useState({
    name: '',
    farmerId: '',
    phone: '',
    email: '',
    pin: '',
    confirmPin: '',
    state: '',
    district: '',
    city: '',
    panchayat: '',
    landSize: '',
    cropTypes: [],
    subsidyRequested: false
  });
  
  const [selectedCrop, setSelectedCrop] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const registerFormRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        const response = await axios.get(`${API_URL}/api/admin/images`);
        
        const newLoginImage = response.data.loginPage || defaultLoginImage;
        const newRegisterImage = response.data.registerPage || defaultRegisterImage;
        
        // Cache images in localStorage for instant load on next visit
        localStorage.setItem('cachedLoginImage', newLoginImage);
        localStorage.setItem('cachedRegisterImage', newRegisterImage);
        
        // Only update state if images changed
        if (newLoginImage !== loginImage) {
          setLoginImage(newLoginImage);
        }
        if (newRegisterImage !== registerImage) {
          setRegisterImage(newRegisterImage);
        }
        
        setImagesLoaded(true);
      } catch (err) {
        console.log('Using cached/default images');
        setImagesLoaded(true);
      }
    };
    fetchImages();
  }, []); // Empty deps - only run once on mount

  // Fetch next Farmer ID when signup opens and scroll to top
  useEffect(() => {
    if (isSignUp) {
      fetchNextFarmerId();
      // Scroll to top of register form
      if (registerFormRef.current) {
        registerFormRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isSignUp]);

  const fetchNextFarmerId = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      const response = await axios.get(`${API_URL}/api/auth/next-farmer-id`);
      setSignUpData(prev => ({ ...prev, farmerId: response.data.farmerId }));
    } catch (err) {
      console.error('Failed to fetch farmer ID:', err);
    }
  };

  // Handle state change
  const handleStateChange = (state) => {
    setSignUpData(prev => ({ ...prev, state, district: '', city: '' }));
    setAvailableDistricts(indiaDistricts[state] || []);
  };

  // Add crop
  const handleAddCrop = () => {
    if (selectedCrop && !signUpData.cropTypes.includes(selectedCrop)) {
      setSignUpData(prev => ({
        ...prev,
        cropTypes: [...prev.cropTypes, selectedCrop]
      }));
      setSelectedCrop('');
    }
  };

  // Remove crop
  const handleRemoveCrop = (cropToRemove) => {
    setSignUpData(prev => ({
      ...prev,
      cropTypes: prev.cropTypes.filter(crop => crop !== cropToRemove)
    }));
  };

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
      setLoading(false); // Reset loading before calling onLogin
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Scroll to top function
    const scrollToTop = () => {
      if (registerFormRef.current) {
        registerFormRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (signUpData.pin !== signUpData.confirmPin) {
      setError('Passwords do not match');
      scrollToTop();
      return;
    }

    if (signUpData.pin.length !== 4) {
      setError('PIN must be 4 digits');
      scrollToTop();
      return;
    }

    if (!signUpData.email || !/\S+@\S+\.\S+/.test(signUpData.email)) {
      setError('Valid email is required');
      scrollToTop();
      return;
    }

    if (!/^\d{10}$/.test(signUpData.phone)) {
      setError('Phone number must be exactly 10 digits');
      scrollToTop();
      return;
    }

    if (signUpData.cropTypes.length === 0) {
      setError('Please add at least one crop type');
      scrollToTop();
      return;
    }

    // Validate city - must contain at least one letter
    if (signUpData.city && !/[a-zA-Z]/.test(signUpData.city)) {
      setError('City name must contain at least one letter (alphabetic or alphanumeric only)');
      scrollToTop();
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/auth/register`, {
        name: signUpData.name,
        phone: signUpData.phone,
        email: signUpData.email,
        pin: signUpData.pin,
        state: signUpData.state,
        district: signUpData.district,
        city: signUpData.city,
        panchayat: signUpData.panchayat,
        landSize: parseFloat(signUpData.landSize) || 0,
        cropTypes: signUpData.cropTypes,
        subsidyRequested: signUpData.subsidyRequested,
        role: 'farmer'
      });

      // Show success animation
      setShowSuccess(true);
      
      // After 2 seconds, switch to login
      setTimeout(() => {
        setShowSuccess(false);
        setIsSignUp(false);
        setFarmerId(signUpData.farmerId);
        setLoading(false); // Reset loading state
        setError(''); // Clear any errors
        setSignUpData({
          name: '',
          farmerId: '',
          phone: '',
          email: '',
          pin: '',
          confirmPin: '',
          state: '',
          district: '',
          city: '',
          panchayat: '',
          landSize: '',
          cropTypes: [],
          subsidyRequested: false
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  // Success Animation Component
  const SuccessAnimation = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-3xl p-12 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Check className="w-20 h-20 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-gray-900 text-center mt-6"
        >
          Registration Successful!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-600 text-center mt-2"
        >
          Your Farmer ID: <span className="font-bold text-emerald-600">{signUpData.farmerId}</span>
        </motion.p>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white">
      <AnimatePresence>
        {showSuccess && <SuccessAnimation />}
      </AnimatePresence>

      {/* Container for both panels */}
      <div className="w-full h-screen flex relative">
        
        {/* Left Panel - Login Form (Always here) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-16 relative z-10">
          <AnimatePresence mode="wait">
            {!isSignUp && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
              >
                {/* Logo */}
                <div className="mb-8">
                  <img src="/logo.png" alt="Morgen Logo" className="h-16 w-auto rounded-xl" />
                </div>

                <div className="mb-10">
                  <h1 className="text-4xl font-bold text-[#082829] mb-2">Welcome Back</h1>
                  <p className="text-[#082829]/70">Please enter your credentials to continue</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farmer ID</label>
                    <input
                      type="text"
                      value={farmerId}
                      onChange={(e) => setFarmerId(e.target.value)}
                      placeholder="e.g. MGN001"
                      required
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#082829] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter your PIN"
                        maxLength="4"
                        required
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#082829] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <a 
                      href="/forgot-password"
                      className="text-sm font-medium text-emerald-600 hover:text-[#082829]"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#082829] hover:bg-[#082829]/90 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button onClick={() => setIsSignUp(true)} className="font-semibold text-emerald-600 hover:text-[#082829]">
                      Sign Up
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Image (Initial) / Sign Up Form (After click) */}
        <div className="hidden lg:block w-1/2 relative">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="w-full h-full flex items-start justify-center px-16 py-8 overflow-y-auto"
                ref={registerFormRef}
              >
                <div className="w-full max-w-md">
                  {/* Logo */}
                  <div className="mb-8">
                    <img src="/logo.png" alt="Morgen Logo" className="h-16 w-auto rounded-xl" />
                  </div>

                  <div className="mb-10">
                    <h1 className="text-4xl font-bold text-[#082829] mb-2">Create Account</h1>
                    <p className="text-[#082829]/70">Register here to get started</p>
                  </div>

                  {/* Back Button - moved below title */}
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back to Login</span>
                  </button>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-[#082829] mb-2">Full Name</label>
                      <input
                        type="text"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                        placeholder="Enter your full name"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#082829] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Farmer ID (Auto-generated, Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Farmer ID (Auto-generated)</label>
                      <input
                        type="text"
                        value={signUpData.farmerId}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 font-semibold cursor-not-allowed"
                      />
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData({...signUpData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                          placeholder="10-digit phone"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                          placeholder="Email"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* State Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        value={signUpData.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#082829]"
                      >
                        <option value="">Select State</option>
                        {indiaStates.map(state => (
                          <option key={state.value} value={state.value}>{state.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* District & City */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <select
                          value={signUpData.district}
                          onChange={(e) => setSignUpData({...signUpData, district: e.target.value})}
                          disabled={!signUpData.state}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#082829] disabled:opacity-50"
                        >
                          <option value="">Select District</option>
                          {availableDistricts.map(district => (
                            <option key={district.value} value={district.value}>{district.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={signUpData.city}
                          onChange={(e) => setSignUpData({...signUpData, city: e.target.value})}
                          placeholder="Enter city"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#082829]"
                        />
                      </div>
                    </div>

                    {/* Land Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Land Size (Acres)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={signUpData.landSize}
                        onChange={(e) => setSignUpData({...signUpData, landSize: e.target.value})}
                        placeholder="Land size in acres"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Crop Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Crop Types</label>
                      <div className="flex gap-2">
                        <select
                          value={selectedCrop}
                          onChange={(e) => setSelectedCrop(e.target.value)}
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Select Crop</option>
                          {cropTypes.map(crop => (
                            <option key={crop.value} value={crop.value}>{crop.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleAddCrop}
                          className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Selected Crops */}
                      {signUpData.cropTypes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {signUpData.cropTypes.map((crop, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm"
                            >
                              <span>{cropTypes.find(c => c.value === crop)?.label || crop}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCrop(crop)}
                                className="hover:text-emerald-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subsidy Request Checkbox */}
                    <div className="flex items-center gap-3 p-4 bg-[#fbfbef] border border-[#082829]/10 rounded-xl">
                      <input
                        type="checkbox"
                        id="subsidyRequest"
                        checked={signUpData.subsidyRequested}
                        onChange={(e) => setSignUpData({...signUpData, subsidyRequested: e.target.checked})}
                        className="w-5 h-5 text-[#082829] border-gray-300 rounded focus:ring-[#082829]"
                      />
                      <label htmlFor="subsidyRequest" className="text-sm font-medium text-[#082829] cursor-pointer">
                        Request for Government Subsidy
                      </label>
                    </div>

                    {/* PIN Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">4-Digit PIN</label>
                      <div className="relative">
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          value={signUpData.pin}
                          onChange={(e) => setSignUpData({...signUpData, pin: e.target.value})}
                          placeholder="Create a 4-digit PIN"
                          maxLength="4"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm PIN</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={signUpData.confirmPin}
                          onChange={(e) => setSignUpData({...signUpData, confirmPin: e.target.value})}
                          placeholder="Re-enter your PIN"
                          maxLength="4"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#082829] hover:bg-[#082829]/90 text-[#fbfbef] font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 mt-4 transition-all"
                    >
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                  </form>

                  <div className="mt-4 text-center pb-8">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <button onClick={() => setIsSignUp(false)} className="font-semibold text-emerald-600 hover:text-emerald-700">
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sliding Image Panel */}
        <motion.div
          initial={false}
          animate={{
            x: isSignUp ? '-100%' : '0%'
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="hidden lg:block absolute top-0 right-0 w-1/2 h-full z-20 pointer-events-none"
        >
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
            <AnimatePresence mode="wait">
              <motion.img
                key={isSignUp ? 'signup-image' : 'login-image'}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={isSignUp ? registerImage : loginImage}
                alt="Agriculture"
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'signup-text' : 'login-text'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl font-bold mb-2">
                    {isSignUp ? 'Join Our Community' : 'Empowering Farmers'}
                  </h2>
                  <p className="text-white/90">
                    {isSignUp 
                      ? 'Start your journey with modern agriculture technology' 
                      : 'Join thousands of farmers transforming agriculture with technology'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
