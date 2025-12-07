import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter details, 2: Success
  const [farmerId, setFarmerId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        farmerId: farmerId.toUpperCase(),
        email: email,
        phone: phone,
        newPin: newPin
      });

      setLoading(false);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please verify your details.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center px-8 lg:px-16 py-8 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="reset-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              {/* Logo */}
              <div className="mb-8">
                <img src="/logo.png" alt="Morgen Logo" className="h-16 w-auto rounded-xl" />
              </div>

              <div className="mb-10">
                <h1 className="text-4xl font-bold text-[#082829] mb-2">Reset Password</h1>
                <p className="text-[#082829]/60">Enter your details to reset your PIN</p>
              </div>

              {/* Back to Login */}
              <a
                href="/login"
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors inline-flex"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Login</span>
              </a>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Farmer ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farmer ID</label>
                  <input
                    type="text"
                    value={farmerId}
                    onChange={(e) => setFarmerId(e.target.value)}
                    placeholder="e.g. MGN001"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter your registered phone"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
                </div>

                {/* New PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New 4-Digit PIN</label>
                  <div className="relative">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Enter new PIN"
                      maxLength="4"
                      pattern="[0-9]{4}"
                      required
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New PIN</label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Re-enter new PIN"
                      maxLength="4"
                      pattern="[0-9]{4}"
                      required
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#082829] hover:bg-[#082829]/90 text-[#fbfbef] font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your Farmer ID, email, and phone number must match our records to reset your password.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
              </motion.div>

              <h2 className="text-3xl font-bold text-[#082829] mb-3">Password Reset Successful!</h2>
              <p className="text-[#082829]/60 mb-8">
                Your PIN has been successfully reset. You can now login with your new PIN.
              </p>

              <a
                href="/login"
                className="inline-block w-full bg-[#082829] hover:bg-[#082829]/90 text-[#fbfbef] font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Go to Login
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
          <img
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Agriculture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Secure Password Reset</h2>
            <p className="text-white/90">
              Reset your password securely and get back to managing your farm
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
