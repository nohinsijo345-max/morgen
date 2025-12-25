import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Shield,
  DollarSign,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Send,
  Megaphone
} from 'lucide-react';
import axios from 'axios';
import { useAdminTheme } from '../../../context/AdminThemeContext';
import AdminGlassCard from '../../../components/AdminGlassCard';
import AdminBuyerLayout from './AdminBuyerLayout';

const BuyerSettings = () => {
  const { colors } = useAdminTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [settings, setSettings] = useState({
    // Bidding Settings
    maxBidLimit: 100000,
    bidTimeLimit: 24,
    autoBidEnabled: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // General Settings
    defaultCurrency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en'
  });

  // Bid messaging states
  const [bidMessage, setBidMessage] = useState('');
  const [sendingBidMessage, setSendingBidMessage] = useState(false);
  const [bidMessageType, setBidMessageType] = useState('all');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/buyer/settings`, settings);
      
      setSuccess('Buyer settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sendBidMessage = async () => {
    if (!bidMessage.trim()) return;
    
    setSendingBidMessage(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
      await axios.post(`${API_URL}/api/admin/buyer/bid-message`, {
        message: bidMessage,
        type: bidMessageType
      });
      
      setBidMessage('');
      setSuccess('Bid message sent successfully to buyers!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to send bid message:', err);
      setError('Failed to send bid message. Please try again.');
    } finally {
      setSendingBidMessage(false);
    }
  };

  const handleReset = () => {
    setSettings({
      maxBidLimit: 100000,
      bidTimeLimit: 24,
      autoBidEnabled: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      defaultCurrency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en'
    });
  };

  return (
    <AdminBuyerLayout currentPage="settings">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#FF4757] mb-2">Buyer Settings</h1>
          <p className="text-[#FF6B7A]">Configure buyer platform settings and preferences</p>
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
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bidding Settings */}
          <AdminGlassCard delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6 text-[#FF4757]" />
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Bidding Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Maximum Bid Limit (₹)
                </label>
                <input
                  type="number"
                  value={settings.maxBidLimit}
                  onChange={(e) => handleSettingChange('maxBidLimit', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Bid Time Limit (hours)
                </label>
                <input
                  type="number"
                  value={settings.bidTimeLimit}
                  onChange={(e) => handleSettingChange('bidTimeLimit', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Enable Auto-Bidding
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoBidEnabled}
                    onChange={(e) => handleSettingChange('autoBidEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF4757]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4757]"></div>
                </label>
              </div>
            </div>
          </AdminGlassCard>

          {/* Bid Messaging */}
          <AdminGlassCard delay={0.2}>
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-[#FF4757]" />
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Bid Messaging</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Target Buyers
                </label>
                <select
                  value={bidMessageType}
                  onChange={(e) => setBidMessageType(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                >
                  <option value="all">All Buyers</option>
                  <option value="active">Active Bidders</option>
                  <option value="winners">Recent Winners</option>
                  <option value="high-value">High-Value Buyers</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Bid Message
                </label>
                <textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Enter message to send to buyers about bidding opportunities..."
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757] resize-none"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                  rows={4}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendBidMessage}
                disabled={!bidMessage.trim() || sendingBidMessage}
                className="w-full bg-[#FF4757] hover:bg-[#FF4757]/90 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingBidMessage ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Bid Message
                  </>
                )}
              </motion.button>
            </div>
          </AdminGlassCard>

          {/* Security Settings */}
          <AdminGlassCard delay={0.3}>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-[#FF4757]" />
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Security Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Two-Factor Authentication
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF4757]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4757]"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                />
              </div>
            </div>
          </AdminGlassCard>

          {/* General Settings */}
          <AdminGlassCard delay={0.4}>
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#FF4757]" />
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>General Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Default Currency
                </label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4757]"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </div>
          </AdminGlassCard>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#FF4757] hover:bg-[#FF4757]/90 text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl shadow-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </motion.button>
        </div>
      </div>
    </AdminBuyerLayout>
  );
};

export default BuyerSettings;