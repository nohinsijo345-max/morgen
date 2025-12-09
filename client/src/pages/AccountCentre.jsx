import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home, 
  Wheat,
  Save,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import { indiaStates, indiaDistricts, cropTypes } from '../data/indiaLocations';

const AccountCentre = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingRequest, setPendingRequest] = useState(null);
  
  // Editable fields (no approval needed)
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Fields requiring approval
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [landSize, setLandSize] = useState('');
  const [selectedCropTypes, setSelectedCropTypes] = useState([]);
  
  // Password reset
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  
  const [availableDistricts, setAvailableDistricts] = useState([]);

  useEffect(() => {
    fetchUserData();
    checkPendingRequest();
  }, []);

  useEffect(() => {
    if (state) {
      setAvailableDistricts(indiaDistricts[state] || []);
    }
  }, [state]);

  const fetchUserData = async () => {
    try {
      const farmerUser = localStorage.getItem('farmerUser');
      if (farmerUser) {
        const userData = JSON.parse(farmerUser);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        const response = await axios.get(`${API_URL}/api/auth/profile/${userData.farmerId}`);
        
        setUser(response.data);
        setEmail(response.data.email || '');
        setPhone(response.data.phone || '');
        setName(response.data.name || '');
        setState(response.data.state || '');
        setDistrict(response.data.district || '');
        setCity(response.data.city || '');
        setLandSize(response.data.landSize || '');
        setSelectedCropTypes(response.data.cropTypes || []);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const checkPendingRequest = async () => {
    try {
      const farmerUser = localStorage.getItem('farmerUser');
      if (farmerUser) {
        const userData = JSON.parse(farmerUser);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        const response = await axios.get(`${API_URL}/api/profile/pending-request/${userData.farmerId}`);
        setPendingRequest(response.data);
      }
    } catch (error) {
      // No pending request
      setPendingRequest(null);
    }
  };

  const handleSaveInstant = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.put(`${API_URL}/api/auth/profile/${user.farmerId}`, {
        email,
        phone
      });
      
      setSuccess('Email and phone updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestApproval = async () => {
    setError('');
    setSuccess('');

    // Validate city - must contain at least one letter
    if (city && !/[a-zA-Z]/.test(city)) {
      setError('City name must contain at least one letter');
      return;
    }

    setSaving(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      
      // Handle cropTypes separately - update immediately without approval
      const userCropTypes = user.cropTypes || [];
      const hasChangedCropTypes = selectedCropTypes.length !== userCropTypes.length || 
        selectedCropTypes.some(crop => !userCropTypes.includes(crop));
      
      if (hasChangedCropTypes) {
        await axios.put(`${API_URL}/api/auth/profile/${user.farmerId}`, {
          cropTypes: selectedCropTypes
        });
      }

      // Build changes object with only modified fields that require approval
      const changes = {};
      if (name && name.trim() !== (user.name || '').trim()) changes.name = name.trim();
      if (state && state !== (user.state || '')) changes.state = state;
      if (district && district !== (user.district || '')) changes.district = district;
      if (city && city.trim() !== (user.city || '').trim()) changes.city = city.trim();
      if (landSize && parseFloat(landSize) !== (user.landSize || 0)) changes.landSize = parseFloat(landSize);

      // Check if there are any changes requiring approval
      if (Object.keys(changes).length === 0 && !hasChangedCropTypes) {
        setError('No changes detected. Please modify at least one field.');
        setSaving(false);
        return;
      }

      // Submit approval request only if there are changes requiring approval
      if (Object.keys(changes).length > 0) {
        await axios.post(`${API_URL}/api/profile/request-change`, {
          farmerId: user.farmerId,
          changes
        });
        setSuccess('Change request submitted! Crop types updated immediately.');
      } else {
        setSuccess('Crop types updated successfully!');
      }
      
      // Refresh user data
      await fetchUserData();
      checkPendingRequest();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setSuccess('');

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setSaving(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/auth/change-password`, {
        farmerId: user.farmerId,
        currentPin,
        newPin
      });
      
      setSuccess('Password changed successfully!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setShowPasswordSection(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const addCrop = (crop) => {
    if (crop && !selectedCropTypes.includes(crop)) {
      setSelectedCropTypes([...selectedCropTypes, crop]);
    }
  };

  const removeCrop = (crop) => {
    setSelectedCropTypes(selectedCropTypes.filter(c => c !== crop));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbef] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#082829]/20 border-t-[#082829] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbef]">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #082829 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <motion.button 
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-3 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-xl border border-[#082829]/10 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 text-[#082829]" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-[#082829]">Account Centre</h1>
              <p className="text-[#082829]/60 text-sm mt-1">Manage your profile and settings</p>
            </div>
          </motion.div>

          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {/* Pending Request Alert */}
          {pendingRequest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">Pending Approval</h3>
                  <p className="text-sm text-yellow-800">
                    Your profile change request is waiting for admin approval. You'll be notified once it's reviewed.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section 1: Instant Update Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-3xl p-8 border border-[#082829]/10 shadow-2xl mb-6"
          >
            <h2 className="text-2xl font-bold text-[#082829] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#082829] rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-[#fbfbef]" />
              </div>
              Contact Information
              <span className="text-sm font-normal text-green-600 ml-auto">(Updates Instantly)</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#082829] mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#082829] mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength="10"
                  className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveInstant}
                disabled={saving}
                className="w-full bg-[#082829] hover:bg-[#082829]/90 text-[#fbfbef] font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>

          {/* Section 2: Approval Required Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-3xl p-8 border border-[#082829]/10 shadow-2xl mb-6"
          >
            <h2 className="text-2xl font-bold text-[#082829] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#082829] rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#fbfbef]" />
              </div>
              Profile Information
              <span className="text-sm font-normal text-yellow-600 ml-auto">(Requires Approval)</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#082829] mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!pendingRequest}
                  className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#082829] mb-2">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={!!pendingRequest}
                    className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 disabled:opacity-50"
                  >
                    <option value="">Select State</option>
                    {indiaStates.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#082829] mb-2">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={!state || !!pendingRequest}
                    className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 disabled:opacity-50"
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#082829] mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!!pendingRequest}
                  className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#082829] mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Land Size (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  disabled={!!pendingRequest}
                  className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#082829] mb-2 flex items-center gap-2">
                  <Wheat className="w-4 h-4" />
                  Crop Types
                  <span className="text-xs text-green-600 font-normal ml-auto">(Updates Immediately)</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <select
                    onChange={(e) => {
                      addCrop(e.target.value);
                      e.target.value = '';
                    }}
                    disabled={!!pendingRequest}
                    className="flex-1 px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 disabled:opacity-50"
                  >
                    <option value="">Select Crop</option>
                    {cropTypes.map(crop => (
                      <option key={crop.value} value={crop.value}>{crop.label}</option>
                    ))}
                  </select>
                </div>
                
                {selectedCropTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCropTypes.map((crop, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm"
                      >
                        <span>{cropTypes.find(c => c.value === crop)?.label || crop}</span>
                        {!pendingRequest && (
                          <button
                            type="button"
                            onClick={() => removeCrop(crop)}
                            className="hover:text-emerald-900"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRequestApproval}
                disabled={saving || !!pendingRequest}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-[#fbfbef] font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Clock className="w-5 h-5" />
                {pendingRequest ? 'Request Pending' : saving ? 'Submitting...' : 'Request Approval for Changes'}
              </motion.button>
            </div>
          </motion.div>

          {/* Section 3: Password Reset */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-3xl p-8 border border-[#082829]/10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-[#082829] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#082829] rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#fbfbef]" />
              </div>
              Security
            </h2>

            {!showPasswordSection ? (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="w-full bg-[#082829]/10 hover:bg-[#082829]/20 text-[#082829] font-semibold py-3 rounded-xl transition-colors"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#082829] mb-2">Current PIN</label>
                  <div className="relative">
                    <input
                      type={showCurrentPin ? 'text' : 'password'}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength="4"
                      className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#082829]/60"
                    >
                      {showCurrentPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#082829] mb-2">New PIN</label>
                  <div className="relative">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength="4"
                      className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#082829]/60"
                    >
                      {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#082829] mb-2">Confirm New PIN</label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength="4"
                      className="w-full px-4 py-3 bg-white/40 border border-[#082829]/10 rounded-xl text-[#082829] focus:outline-none focus:ring-2 focus:ring-[#082829]/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#082829]/60"
                    >
                      {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPasswordSection(false);
                      setCurrentPin('');
                      setNewPin('');
                      setConfirmPin('');
                      setError('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#082829] font-semibold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordReset}
                    disabled={saving}
                    className="flex-1 bg-[#082829] hover:bg-[#082829]/90 text-[#fbfbef] font-semibold py-3 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Changing...' : 'Change PIN'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountCentre;
